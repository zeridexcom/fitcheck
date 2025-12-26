// OpenAI API Service for ChatGPT and Vision
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

// Analyze food image using GPT-4 Vision
export async function analyzeFoodImage(apiKey, imageBase64) {
    const response = await fetch(OPENAI_API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
            model: 'gpt-4o',
            messages: [
                {
                    role: 'system',
                    content: `You are a professional nutritionist AI that analyzes food images. 
When given a food image, you MUST respond with a JSON object containing:
{
  "name": "Name of the dish/food item",
  "estimatedWeight": "Estimated weight in grams",
  "calories": number (kcal),
  "protein": number (grams),
  "carbs": number (grams),
  "fat": number (grams),
  "fiber": number (grams),
  "sugar": number (grams),
  "sodium": number (mg),
  "details": "Brief description of what you see and how you estimated the values"
}

Be as accurate as possible. Consider portion sizes visible in the image.
If it's a nutrition label, extract the exact values.
If it's a cooked dish, estimate based on visible ingredients and portion size.
ONLY respond with valid JSON, no other text.`
                },
                {
                    role: 'user',
                    content: [
                        {
                            type: 'text',
                            text: 'Analyze this food image and provide detailed nutritional information. Estimate portion size and all macros/micros.'
                        },
                        {
                            type: 'image_url',
                            image_url: {
                                url: imageBase64.startsWith('data:') ? imageBase64 : `data:image/jpeg;base64,${imageBase64}`,
                                detail: 'high'
                            }
                        }
                    ]
                }
            ],
            max_tokens: 1000,
        }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Failed to analyze image');
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

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
    const systemPrompt = `You are FitCheck AI Coach, a friendly and knowledgeable fitness and nutrition expert.

User Profile:
- Name: ${userProfile.name || 'User'}
- Age: ${userProfile.age}
- Gender: ${userProfile.gender}
- Weight: ${userProfile.weight} kg
- Height: ${userProfile.height} cm
- Activity Level: ${userProfile.activityLevel}
- Goal: ${userProfile.goal?.replace('_', ' ')}
- Daily Calorie Target: ${userProfile.targets?.calories || 2000} kcal
- Protein Target: ${userProfile.targets?.protein || 150}g
- Carbs Target: ${userProfile.targets?.carbs || 200}g
- Fat Target: ${userProfile.targets?.fat || 67}g

You help users with:
1. Creating personalized diet plans
2. Designing workout routines (especially for beginners)
3. Answering nutrition questions
4. Providing motivation and tips
5. Explaining how to achieve their fitness goals

Be encouraging, practical, and explain things simply. Use emojis occasionally to keep it engaging.
Keep responses concise but helpful. Use bullet points for lists.`;

    const response = await fetch(OPENAI_API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
                { role: 'system', content: systemPrompt },
                ...messages.map(m => ({ role: m.role, content: m.content }))
            ],
            max_tokens: 1000,
        }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Failed to get response');
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || 'Sorry, I could not generate a response.';
}

// Generate diet plan
export async function generateDietPlan(apiKey, userProfile) {
    const prompt = `Create a simple 1-day meal plan for someone with these specs:
- Goal: ${userProfile.goal?.replace('_', ' ')}
- Daily Calories: ${userProfile.targets?.calories || 2000} kcal
- Protein: ${userProfile.targets?.protein || 150}g
- Activity: ${userProfile.activityLevel}

Include breakfast, lunch, dinner, and 2 snacks. For each meal provide:
- Meal name
- Brief description
- Approximate calories and protein

Keep it practical with easily available foods.`;

    return chatWithCoach(apiKey, [{ role: 'user', content: prompt }], userProfile);
}

// Generate workout plan
export async function generateWorkoutPlan(apiKey, userProfile) {
    const prompt = `Create a beginner-friendly workout plan for someone with:
- Goal: ${userProfile.goal?.replace('_', ' ')}
- Activity Level: ${userProfile.activityLevel}

Provide a 3-day split that can be done at home or gym.
For each day include:
- Focus area
- 4-5 exercises with sets and reps
- Rest periods

Keep exercises simple and explain form tips briefly.`;

    return chatWithCoach(apiKey, [{ role: 'user', content: prompt }], userProfile);
}
