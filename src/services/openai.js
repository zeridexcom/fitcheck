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
export async function askCoach(question) {
    // Get API key from store or env
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

    if (!apiKey) {
        throw new Error('No API key configured. Please add VITE_OPENAI_API_KEY to your .env file.');
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
                    content: 'You are FitBuddy, a helpful fitness and nutrition assistant. Be brief, friendly, and helpful. Keep responses under 100 words.'
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
