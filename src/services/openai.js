// OpenAI API Service for AI features
// Supports both OpenAI (sk-...) and OpenRouter (sk-or-v1-...) keys

function getApiConfig(apiKey) {
    if (apiKey?.startsWith('sk-or-v1-')) {
        // OpenRouter key
        return {
            url: 'https://openrouter.ai/api/v1/chat/completions',
            model: 'google/gemma-3-27b-it:free',
            headers: {
                'HTTP-Referer': window.location.origin,
                'X-Title': 'FitCheck AI'
            }
        };
    } else {
        // OpenAI key
        return {
            url: 'https://api.openai.com/v1/chat/completions',
            model: 'gpt-4o-mini',
            headers: {}
        };
    }
}

// Analyze food image using Vision model
export async function analyzeFoodImage(apiKey, imageBase64) {
    const config = getApiConfig(apiKey);

    const response = await fetch(config.url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
            ...config.headers
        },
        body: JSON.stringify({
            model: config.model,
            messages: [
                {
                    role: 'user',
                    content: [
                        {
                            type: 'text',
                            text: `You are a professional nutritionist AI. Analyze this food image and respond ONLY with a JSON object (no markdown, no code blocks, no extra text):
{
  "name": "Name of the dish/food item",
  "estimatedWeight": "Estimated weight in grams",
  "calories": number,
  "protein": number,
  "carbs": number,
  "fat": number,
  "fiber": number,
  "sugar": number,
  "sodium": number,
  "details": "Brief description"
}

Be accurate. Consider portion sizes. If it's a nutrition label, extract exact values.`
                        },
                        {
                            type: 'image_url',
                            image_url: {
                                url: imageBase64.startsWith('data:') ? imageBase64 : `data:image/jpeg;base64,${imageBase64}`
                            }
                        }
                    ]
                }
            ],
            max_tokens: 800,
        }),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('API Error:', errorData);
        throw new Error(errorData.error?.message || `API Error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
        throw new Error('No response from AI');
    }

    try {
        // Parse the JSON response - remove any markdown code blocks
        let cleanContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        const jsonMatch = cleanContent.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }
        throw new Error('Invalid response format');
    } catch (e) {
        console.error('Parse error:', e, 'Content:', content);
        throw new Error('Failed to parse nutritional data');
    }
}

// Chat with AI coach
export async function chatWithCoach(apiKey, messages, userProfile) {
    const config = getApiConfig(apiKey);

    const systemPrompt = `You are FitCheck AI Coach, a friendly and expert fitness & nutrition assistant.

User Profile:
- Name: ${userProfile.name || 'User'}
- Age: ${userProfile.age} | Gender: ${userProfile.gender}
- Weight: ${userProfile.weight} kg | Height: ${userProfile.height} cm
- Activity: ${userProfile.activityLevel} | Goal: ${userProfile.goal?.replace('_', ' ')}
- Daily Targets: ${userProfile.targets?.calories || 2000} kcal, ${userProfile.targets?.protein || 150}g protein

Help with diet plans, workout routines, nutrition questions, and motivation.
Be encouraging, practical, and use bullet points. Add relevant emojis occasionally.
Keep responses concise but helpful.`;

    const response = await fetch(config.url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
            ...config.headers
        },
        body: JSON.stringify({
            model: config.model,
            messages: [
                { role: 'system', content: systemPrompt },
                ...messages.map(m => ({ role: m.role, content: m.content }))
            ],
            max_tokens: 1000,
        }),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('API Error:', errorData);
        throw new Error(errorData.error?.message || `API Error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || 'Sorry, I could not generate a response.';
}

// Simple ask function for FitBuddy
export async function askCoach(apiKey, question) {
    if (!apiKey) {
        apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    }

    if (!apiKey) {
        throw new Error('No API key configured. Please add VITE_OPENAI_API_KEY to your .env file or enter it in settings.');
    }

    const config = getApiConfig(apiKey);

    const response = await fetch(config.url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
            ...config.headers
        },
        body: JSON.stringify({
            model: config.model,
            messages: [
                {
                    role: 'system',
                    content: `You are FitBuddy, a Christian faith-integrated fitness and nutrition assistant. 
                    
Your approach:
- Be brief, friendly, and encouraging (under 100 words)
- Include relevant Bible verses when appropriate
- Remind users their body is a temple of the Holy Spirit (1 Cor 6:19)
- Use phrases like "Through Christ who strengthens me" for motivation
- Encourage gratitude and prayer alongside fitness
- Reference that physical training has value for godliness (1 Tim 4:8)
- Be supportive, never judgmental

Always end with a faith-based encouragement or scripture. 🙏`
                },
                { role: 'user', content: question }
            ],
            max_tokens: 300,
        }),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `API Error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || 'Sorry, I could not answer that.';
}

// Generate a meal plan for specified days
export async function generateMealPlan(apiKey, userProfile, daysCount = 3) {
    if (!apiKey) {
        apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    }

    if (!apiKey) {
        throw new Error('No API key configured.');
    }

    const config = getApiConfig(apiKey);
    const { targets, profile } = userProfile;

    const prompt = `You are a professional nutritionist. Create a ${daysCount}-day meal plan for:
- Daily Calories: ${targets.calories} kcal
- Protein: ${targets.protein}g
- Carbs: ${targets.carbs}g
- Fat: ${targets.fat}g
- Goal: ${profile.goal?.replace('_', ' ')}
- Diet preference: balanced, healthy, practical meals

Respond ONLY with a valid JSON object (no markdown, no code blocks):
{
  "days": [
    {
      "day": 1,
      "meals": [
        {
          "id": "unique_id",
          "type": "breakfast|lunch|dinner|snack",
          "name": "Meal Name",
          "description": "Brief description",
          "calories": number,
          "protein": number,
          "carbs": number,
          "fat": number,
          "ingredients": ["ingredient1", "ingredient2"]
        }
      ],
      "totals": { "calories": number, "protein": number, "carbs": number, "fat": number }
    }
  ]
}

Include 3-4 meals per day. Make meals practical and easily preparable.`;

    const response = await fetch(config.url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
            ...config.headers
        },
        body: JSON.stringify({
            model: config.model,
            messages: [
                { role: 'system', content: 'You are a professional nutritionist AI. Always respond with valid JSON only.' },
                { role: 'user', content: prompt }
            ],
            max_tokens: 2000,
        }),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `API Error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    try {
        let cleanContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        const jsonMatch = cleanContent.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }
        throw new Error('Invalid response format');
    } catch (e) {
        console.error('Parse error:', e, 'Content:', content);
        throw new Error('Failed to parse meal plan');
    }
}

// Swap a meal with similar macros
export async function swapMeal(apiKey, mealToSwap, reason = '') {
    if (!apiKey) {
        apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    }

    if (!apiKey) {
        throw new Error('No API key configured.');
    }

    const config = getApiConfig(apiKey);

    const prompt = `Replace this meal with something different but with IDENTICAL macros:
Current meal: ${mealToSwap.name}
- Calories: ${mealToSwap.calories} kcal
- Protein: ${mealToSwap.protein}g
- Carbs: ${mealToSwap.carbs}g
- Fat: ${mealToSwap.fat}g
${reason ? `Reason for swap: ${reason}` : ''}

Respond ONLY with valid JSON (no markdown):
{
  "id": "${Date.now()}",
  "type": "${mealToSwap.type}",
  "name": "New Meal Name",
  "description": "Brief description",
  "calories": ${mealToSwap.calories},
  "protein": ${mealToSwap.protein},
  "carbs": ${mealToSwap.carbs},
  "fat": ${mealToSwap.fat},
  "ingredients": ["ingredient1", "ingredient2"]
}

Keep macros within 5% of original. Make it practical and different from the original.`;

    const response = await fetch(config.url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
            ...config.headers
        },
        body: JSON.stringify({
            model: config.model,
            messages: [
                { role: 'system', content: 'You are a nutritionist. Respond with valid JSON only.' },
                { role: 'user', content: prompt }
            ],
            max_tokens: 500,
        }),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `API Error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    try {
        let cleanContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        const jsonMatch = cleanContent.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }
        throw new Error('Invalid response format');
    } catch (e) {
        console.error('Parse error:', e);
        throw new Error('Failed to parse swapped meal');
    }
}
