import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useStore = create(
    persist(
        (set, get) => ({
            // === ONBOARDING STATE ===
            hasOnboarded: false,
            apiKey: import.meta.env.VITE_OPENAI_API_KEY || null,

            // === USER PROFILE ===
            profile: {
                name: '',
                age: 25,
                gender: 'male',
                weight: 70,
                height: 170,
                activityLevel: 'moderate',
                goal: null,
            },

            // === CALCULATED TARGETS ===
            targets: {
                calories: 2000,
                protein: 150,
                carbs: 200,
                fat: 67,
            },

            // === MEALS LOG ===
            meals: [],

            // === WORKOUTS LOG ===
            workouts: [],

            // === WEIGHT HISTORY ===
            weightHistory: [],

            // === CHAT HISTORY ===
            chatHistory: [],

            // === WATER TRACKING ===
            waterIntake: {}, // { 'YYYY-MM-DD': amount_in_ml }
            waterGoal: 2000, // ml per day

            // === STREAKS ===
            streaks: {
                currentStreak: 0,
                longestStreak: 0,
                lastLogDate: null,
                streakFreezeAvailable: true,
                streakFreezeUsedDate: null,
            },

            // === ACHIEVEMENTS ===
            achievements: [], // { id, name, description, icon, unlockedAt, category }

            // === REMINDERS ===
            reminders: {
                meals: { enabled: true, times: ['08:00', '13:00', '19:00'] },
                water: { enabled: true, interval: 2 }, // hours
                workout: { enabled: true, time: '18:00' },
            },

            // === ACTIONS ===

            completeOnboarding: () => set({ hasOnboarded: true }),
            setApiKey: (key) => set({ apiKey: key }),

            updateProfile: (updates) => set((state) => ({
                profile: { ...state.profile, ...updates }
            })),

            calculateTargets: () => {
                const { profile } = get();
                const { weight, height, age, gender, activityLevel, goal } = profile;

                let bmr;
                if (gender === 'male') {
                    bmr = 10 * weight + 6.25 * height - 5 * age + 5;
                } else {
                    bmr = 10 * weight + 6.25 * height - 5 * age - 161;
                }

                const activityMultipliers = {
                    sedentary: 1.2,
                    light: 1.375,
                    moderate: 1.55,
                    active: 1.725,
                    very_active: 1.9,
                };

                let tdee = bmr * (activityMultipliers[activityLevel] || 1.55);

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

            // Meal actions
            addMeal: (meal) => {
                set((state) => ({
                    meals: [...state.meals, {
                        id: Date.now().toString(),
                        date: new Date().toISOString().split('T')[0],
                        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
                        ...meal
                    }]
                }));
                get().updateStreak();
                get().checkAchievements();
            },

            deleteMeal: (id) => set((state) => ({
                meals: state.meals.filter(m => m.id !== id)
            })),

            getTodaysMeals: () => {
                const today = new Date().toISOString().split('T')[0];
                return get().meals.filter(m => m.date === today);
            },

            getTodaysTotals: () => {
                const todaysMeals = get().getTodaysMeals();
                return {
                    calories: todaysMeals.reduce((sum, m) => sum + (m.calories || 0), 0),
                    protein: todaysMeals.reduce((sum, m) => sum + (m.protein || 0), 0),
                    carbs: todaysMeals.reduce((sum, m) => sum + (m.carbs || 0), 0),
                    fat: todaysMeals.reduce((sum, m) => sum + (m.fat || 0), 0),
                };
            },

            // Workout actions
            addWorkout: (workout) => {
                set((state) => ({
                    workouts: [...state.workouts, {
                        id: Date.now().toString(),
                        date: new Date().toISOString().split('T')[0],
                        ...workout
                    }]
                }));
                get().updateStreak();
                get().checkAchievements();
            },

            logWeight: (weight) => set((state) => ({
                weightHistory: [...state.weightHistory, {
                    date: new Date().toISOString().split('T')[0],
                    weight
                }]
            })),

            // Chat actions
            addChatMessage: (role, content) => set((state) => ({
                chatHistory: [...state.chatHistory, { role, content, timestamp: Date.now() }]
            })),

            clearChat: () => set({ chatHistory: [] }),

            // === WATER TRACKING ACTIONS ===
            addWater: (amount) => {
                const today = new Date().toISOString().split('T')[0];
                set((state) => ({
                    waterIntake: {
                        ...state.waterIntake,
                        [today]: (state.waterIntake[today] || 0) + amount
                    }
                }));
                get().checkAchievements();
            },

            setWaterGoal: (goal) => set({ waterGoal: goal }),

            getWaterHistory: (days = 7) => {
                const { waterIntake } = get();
                const history = [];
                for (let i = 0; i < days; i++) {
                    const date = new Date();
                    date.setDate(date.getDate() - i);
                    const dateStr = date.toISOString().split('T')[0];
                    history.push({ date: dateStr, amount: waterIntake[dateStr] || 0 });
                }
                return history.reverse();
            },

            // === STREAK ACTIONS ===
            updateStreak: () => {
                const today = new Date().toISOString().split('T')[0];
                const { streaks } = get();

                if (streaks.lastLogDate === today) return; // Already logged today

                const yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);
                const yesterdayStr = yesterday.toISOString().split('T')[0];

                let newStreak = streaks.currentStreak;

                if (streaks.lastLogDate === yesterdayStr) {
                    // Consecutive day - increase streak
                    newStreak = streaks.currentStreak + 1;
                } else if (streaks.lastLogDate !== null) {
                    // Streak broken - check if freeze available
                    if (streaks.streakFreezeAvailable && streaks.streakFreezeUsedDate !== yesterdayStr) {
                        // Use streak freeze
                        newStreak = streaks.currentStreak + 1;
                        set((state) => ({
                            streaks: {
                                ...state.streaks,
                                streakFreezeAvailable: false,
                                streakFreezeUsedDate: yesterdayStr
                            }
                        }));
                    } else {
                        // Streak broken
                        newStreak = 1;
                    }
                } else {
                    // First time logging
                    newStreak = 1;
                }

                set((state) => ({
                    streaks: {
                        ...state.streaks,
                        currentStreak: newStreak,
                        longestStreak: Math.max(state.streaks.longestStreak, newStreak),
                        lastLogDate: today,
                    }
                }));

                get().checkAchievements();
            },

            // === ACHIEVEMENT ACTIONS ===
            unlockAchievement: (achievement) => {
                const { achievements } = get();
                if (achievements.find(a => a.id === achievement.id)) return; // Already unlocked

                set((state) => ({
                    achievements: [...state.achievements, {
                        ...achievement,
                        unlockedAt: Date.now()
                    }]
                }));
            },

            checkAchievements: () => {
                const state = get();
                const { meals, workouts, streaks, waterIntake, achievements } = state;
                const today = new Date().toISOString().split('T')[0];

                const achievementsList = [
                    { id: 'first_scan', name: 'First Scan', description: 'Scan your first food', icon: '📸', check: () => meals.length >= 1 },
                    { id: 'week_warrior', name: 'Week Warrior', description: '7-day logging streak', icon: '🔥', check: () => streaks.currentStreak >= 7 },
                    { id: 'month_master', name: 'Month Master', description: '30-day logging streak', icon: '👑', check: () => streaks.currentStreak >= 30 },
                    {
                        id: 'hydration_hero', name: 'Hydration Hero', description: 'Hit water goal 7 days', icon: '💧', check: () => {
                            let count = 0;
                            for (const [date, amount] of Object.entries(waterIntake)) {
                                if (amount >= state.waterGoal) count++;
                            }
                            return count >= 7;
                        }
                    },
                    { id: 'gym_rat', name: 'Gym Rat', description: 'Log 10 workouts', icon: '💪', check: () => workouts.length >= 10 },
                    { id: 'calorie_counter', name: 'Calorie Counter', description: 'Log 50 meals', icon: '🍽️', check: () => meals.length >= 50 },
                    { id: 'century_club', name: 'Century Club', description: 'Log 100 meals', icon: '🏆', check: () => meals.length >= 100 },
                    {
                        id: 'early_bird', name: 'Early Bird', description: 'Log before 7 AM', icon: '🌅', check: () => {
                            const hour = new Date().getHours();
                            return hour < 7 && meals.some(m => m.date === today);
                        }
                    },
                    {
                        id: 'perfect_day', name: 'Perfect Day', description: 'Hit all macro goals in a day', icon: '⭐', check: () => {
                            const totals = state.getTodaysTotals();
                            return totals.calories >= state.targets.calories * 0.95 &&
                                totals.protein >= state.targets.protein * 0.95;
                        }
                    },
                ];

                achievementsList.forEach(achievement => {
                    if (!achievements.find(a => a.id === achievement.id) && achievement.check()) {
                        state.unlockAchievement(achievement);
                    }
                });
            },

            getNewAchievements: () => {
                const { achievements } = get();
                const oneHourAgo = Date.now() - 3600000;
                return achievements.filter(a => a.unlockedAt > oneHourAgo);
            },

            // Reset all
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
                waterIntake: {},
                waterGoal: 2000,
                streaks: {
                    currentStreak: 0,
                    longestStreak: 0,
                    lastLogDate: null,
                    streakFreezeAvailable: true,
                    streakFreezeUsedDate: null,
                },
                achievements: [],
            }),
        }),
        {
            name: 'fitcheck-storage',
        }
    )
);

export default useStore;
