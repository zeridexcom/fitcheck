import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useStore = create(
    persist(
        (set, get) => ({
            // === ONBOARDING STATE ===
            hasOnboarded: false,
            apiKey: null,

            // === USER PROFILE ===
            profile: {
                name: '',
                age: 25,
                gender: 'male',
                weight: 70, // kg
                height: 170, // cm
                activityLevel: 'moderate', // sedentary, light, moderate, active, very_active
                goal: null, // weight_loss, muscle_gain, maintenance, general_health
            },

            // === CALCULATED TARGETS ===
            targets: {
                calories: 2000,
                protein: 150, // grams
                carbs: 200, // grams
                fat: 67, // grams
            },

            // === MEALS LOG ===
            meals: [], // { id, date, time, name, image, calories, protein, carbs, fat, fiber, etc }

            // === WORKOUTS LOG ===
            workouts: [], // { id, date, exercises: [], duration, caloriesBurned }

            // === WEIGHT HISTORY ===
            weightHistory: [], // { date, weight }

            // === CHAT HISTORY ===
            chatHistory: [], // { role: 'user' | 'assistant', content }

            // === ACTIONS ===

            // Complete onboarding
            completeOnboarding: () => set({ hasOnboarded: true }),

            // Set API key
            setApiKey: (key) => set({ apiKey: key }),

            // Update profile
            updateProfile: (updates) => set((state) => ({
                profile: { ...state.profile, ...updates }
            })),

            // Calculate and set targets based on profile
            calculateTargets: () => {
                const { profile } = get();
                const { weight, height, age, gender, activityLevel, goal } = profile;

                // Mifflin-St Jeor BMR formula
                let bmr;
                if (gender === 'male') {
                    bmr = 10 * weight + 6.25 * height - 5 * age + 5;
                } else {
                    bmr = 10 * weight + 6.25 * height - 5 * age - 161;
                }

                // Activity multipliers
                const activityMultipliers = {
                    sedentary: 1.2,
                    light: 1.375,
                    moderate: 1.55,
                    active: 1.725,
                    very_active: 1.9,
                };

                let tdee = bmr * (activityMultipliers[activityLevel] || 1.55);

                // Goal adjustments
                let calories;
                let proteinRatio, carbsRatio, fatRatio;

                switch (goal) {
                    case 'weight_loss':
                        calories = tdee - 500;
                        proteinRatio = 0.35;
                        carbsRatio = 0.35;
                        fatRatio = 0.30;
                        break;
                    case 'muscle_gain':
                        calories = tdee + 300;
                        proteinRatio = 0.30;
                        carbsRatio = 0.45;
                        fatRatio = 0.25;
                        break;
                    case 'maintenance':
                        calories = tdee;
                        proteinRatio = 0.25;
                        carbsRatio = 0.50;
                        fatRatio = 0.25;
                        break;
                    case 'general_health':
                    default:
                        calories = tdee;
                        proteinRatio = 0.25;
                        carbsRatio = 0.45;
                        fatRatio = 0.30;
                        break;
                }

                calories = Math.round(calories);
                const protein = Math.round((calories * proteinRatio) / 4);
                const carbs = Math.round((calories * carbsRatio) / 4);
                const fat = Math.round((calories * fatRatio) / 9);

                set({ targets: { calories, protein, carbs, fat } });
            },

            // Add meal
            addMeal: (meal) => set((state) => ({
                meals: [...state.meals, {
                    id: Date.now().toString(),
                    date: new Date().toISOString().split('T')[0],
                    time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
                    ...meal
                }]
            })),

            // Delete meal
            deleteMeal: (id) => set((state) => ({
                meals: state.meals.filter(m => m.id !== id)
            })),

            // Get today's meals
            getTodaysMeals: () => {
                const today = new Date().toISOString().split('T')[0];
                return get().meals.filter(m => m.date === today);
            },

            // Get today's totals
            getTodaysTotals: () => {
                const todaysMeals = get().getTodaysMeals();
                return {
                    calories: todaysMeals.reduce((sum, m) => sum + (m.calories || 0), 0),
                    protein: todaysMeals.reduce((sum, m) => sum + (m.protein || 0), 0),
                    carbs: todaysMeals.reduce((sum, m) => sum + (m.carbs || 0), 0),
                    fat: todaysMeals.reduce((sum, m) => sum + (m.fat || 0), 0),
                };
            },

            // Add workout
            addWorkout: (workout) => set((state) => ({
                workouts: [...state.workouts, {
                    id: Date.now().toString(),
                    date: new Date().toISOString().split('T')[0],
                    ...workout
                }]
            })),

            // Log weight
            logWeight: (weight) => set((state) => ({
                weightHistory: [...state.weightHistory, {
                    date: new Date().toISOString().split('T')[0],
                    weight
                }]
            })),

            // Add chat message
            addChatMessage: (role, content) => set((state) => ({
                chatHistory: [...state.chatHistory, { role, content, timestamp: Date.now() }]
            })),

            // Clear chat
            clearChat: () => set({ chatHistory: [] }),

            // Reset all data
            resetAll: () => set({
                hasOnboarded: false,
                apiKey: null,
                profile: {
                    name: '',
                    age: 25,
                    gender: 'male',
                    weight: 70,
                    height: 170,
                    activityLevel: 'moderate',
                    goal: null,
                },
                targets: { calories: 2000, protein: 150, carbs: 200, fat: 67 },
                meals: [],
                workouts: [],
                weightHistory: [],
                chatHistory: [],
            }),
        }),
        {
            name: 'fitcheck-storage',
        }
    )
);

export default useStore;
