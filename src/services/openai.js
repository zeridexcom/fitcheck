// OpenRouter API Service for AI features
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

// Analyze food image using Vision model
export async function analyzeFoodImage(apiKey, imageBase64) {
    const response = await fetch(OPENROUTER_API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
            'HTTP-Referer': window.location.origin,
            'X-Title': 'FitCheck AI'
        },
        body: JSON.stringify({
            model: 'meta-llama/llama-3.2-11b-vision-instruct:free',
            messages: [
                {
                    role: 'user',
                    content: [
                        {
                            type: 'text',
                            text: `You are a professional nutritionist AI. Analyze this food image and respond ONLY with a JSON object (no markdown, no extra text):
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
            max_tokens: 1000,
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
        // Parse the JSON response
        const jsonMatch = content.match(/\{[\s\S]*\}/);
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
    const systemPrompt = `You are FitCheck AI Coach, a friendly and expert fitness & nutrition assistant.

User Profile:
- Name: ${userProfile.name || 'User'}
- Age: ${userProfile.age} | Gender: ${userProfile.gender}
- Weight: ${userProfile.weight} kg | Height: ${userProfile.height} cm
- Activity: ${userProfile.activityLevel} | Goal: ${userProfile.goal?.replace('_', ' ')}
- Daily Targets: ${userProfile.targets?.calories || 2000} kcal, ${userProfile.targets?.protein || 150}g protein

Help with diet plans, workout routines, nutrition questions, and motivation.
Be encouraging, practical, and use bullet points. Add relevant emojis occasionally.`;

    const response = await fetch(OPENROUTER_API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
            'HTTP-Referer': window.location.origin,
            'X-Title': 'FitCheck AI'
        },
        body: JSON.stringify({
            model: 'meta-llama/llama-3.2-11b-vision-instruct:free',
            messages: [
                { role: 'system', content: systemPrompt },
                ...messages.map(m => ({ role: m.role, content: m.content }))
            ],
            max_tokens: 1500,
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
