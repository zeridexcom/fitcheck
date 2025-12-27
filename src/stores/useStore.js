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
                targetWeight: null,
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

            // === BODY MEASUREMENTS ===
            bodyMeasurements: {
                waist: null,  // cm
                neck: null,   // cm
                hip: null,    // cm (for females)
            },

            // === BODY FAT HISTORY ===
            bodyFatHistory: [],  // { date, percentage, measurements }

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

            // === FASTING ===
            fastingState: {
                isActive: false,
                startTime: null,
                duration: 16, // hours
                plan: '16:8',
                history: [], // { date, plan, duration, completed }
            },

            // === WORKOUT PLAN ===
            workoutPlan: null, // Generated workout plan

            // === TODAY'S WORKOUT ===
            todayWorkout: {
                exercises: [],
                completedExercises: [],
            },

            // === SUPPLEMENTS ===
            supplements: [],
            supplementPresets: [
                { id: 'creatine', name: 'Creatine', amount: 5, unit: 'g' },
                { id: 'protein', name: 'Protein Shake', amount: 30, unit: 'g' },
                { id: 'bcaa', name: 'BCAA', amount: 5, unit: 'g' },
                { id: 'multivitamin', name: 'Multivitamin', amount: 1, unit: 'tablet' },
                { id: 'omega3', name: 'Omega-3', amount: 1000, unit: 'mg' },
            ],

            // === SLEEP TRACKING ===
            sleepHistory: [],  // { date, bedtime, wakeTime, duration, quality, notes }
            sleepGoal: 8,  // hours

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
                }],
                profile: { ...state.profile, weight }
            })),

            setTargetWeight: (targetWeight) => set((state) => ({
                profile: { ...state.profile, targetWeight }
            })),

            logBodyMeasurements: (measurements) => {
                set((state) => ({
                    bodyMeasurements: { ...state.bodyMeasurements, ...measurements }
                }));
                // Auto-calculate body fat after logging measurements
                get().calculateBodyFat();
            },

            calculateBodyFat: () => {
                const { profile, bodyMeasurements } = get();
                const { waist, neck, hip } = bodyMeasurements;
                const { height, gender } = profile;

                if (!waist || !neck || !height) return null;

                let bodyFat;

                if (gender === 'female') {
                    if (!hip) return null;
                    // US Navy formula for females
                    bodyFat = 495 / (1.29579 - 0.35004 * Math.log10(waist + hip - neck) + 0.22100 * Math.log10(height)) - 450;
                } else {
                    // US Navy formula for males
                    bodyFat = 495 / (1.0324 - 0.19077 * Math.log10(waist - neck) + 0.15456 * Math.log10(height)) - 450;
                }

                bodyFat = Math.max(0, Math.min(60, Math.round(bodyFat * 10) / 10));

                set((state) => ({
                    bodyFatHistory: [...state.bodyFatHistory, {
                        date: new Date().toISOString().split('T')[0],
                        percentage: bodyFat,
                        measurements: { waist, neck, hip }
                    }]
                }));

                return bodyFat;
            },

            getWeightProjection: () => {
                const { weightHistory, profile } = get();
                const { targetWeight } = profile;

                if (!targetWeight || weightHistory.length < 2) return null;

                // Calculate average weekly weight change from last 4 weeks
                const recentWeights = weightHistory.slice(-28);
                if (recentWeights.length < 2) return null;

                const firstWeight = recentWeights[0].weight;
                const lastWeight = recentWeights[recentWeights.length - 1].weight;
                const daysDiff = Math.max(1, (new Date(recentWeights[recentWeights.length - 1].date) - new Date(recentWeights[0].date)) / (1000 * 60 * 60 * 24));

                const weeklyChange = ((lastWeight - firstWeight) / daysDiff) * 7;
                const currentWeight = lastWeight;
                const weightToLose = currentWeight - targetWeight;

                if (Math.abs(weeklyChange) < 0.01) return { weeksToGoal: null, message: 'Not enough data' };

                const weeksToGoal = Math.abs(weightToLose / weeklyChange);

                if ((weightToLose > 0 && weeklyChange >= 0) || (weightToLose < 0 && weeklyChange <= 0)) {
                    return { weeksToGoal: null, message: 'Adjust your diet' };
                }

                return {
                    weeksToGoal: Math.round(weeksToGoal),
                    weeklyChange: Math.round(weeklyChange * 100) / 100,
                    projectedDate: new Date(Date.now() + weeksToGoal * 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
                };
            },

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

            // === FASTING ACTIONS ===
            startFast: (duration, plan) => set((state) => ({
                fastingState: {
                    ...state.fastingState,
                    isActive: true,
                    startTime: Date.now(),
                    duration,
                    plan,
                }
            })),

            endFast: (completed) => set((state) => ({
                fastingState: {
                    ...state.fastingState,
                    isActive: false,
                    startTime: null,
                    history: [
                        ...state.fastingState.history,
                        {
                            date: new Date().toISOString(),
                            plan: state.fastingState.plan,
                            duration: state.fastingState.duration,
                            completed,
                        }
                    ]
                }
            })),

            updateFastingState: (updates) => set((state) => ({
                fastingState: { ...state.fastingState, ...updates }
            })),

            // === WORKOUT PLAN ACTIONS ===
            setWorkoutPlan: (plan) => set({ workoutPlan: plan }),

            generateWorkoutPlan: async (preferences, equipment) => {
                // Generate workout plan based on preferences
                const { goal, workout_place, days_per_week, experience } = preferences;

                const WORKOUT_TEMPLATES = {
                    fat_loss: {
                        gym: ['Cardio + Full Body', 'Upper Body', 'HIIT', 'Lower Body', 'Core + Cardio', 'Full Body Circuit'],
                        home: ['HIIT Cardio', 'Bodyweight Upper', 'Tabata', 'Bodyweight Legs', 'Core Blast', 'Full Body Burn'],
                    },
                    muscle_gain: {
                        gym: ['Chest & Triceps', 'Back & Biceps', 'Legs & Shoulders', 'Push Day', 'Pull Day', 'Legs'],
                        home: ['Push Workout', 'Pull Workout', 'Legs', 'Upper Body', 'Lower Body', 'Full Body'],
                    },
                    maintenance: {
                        gym: ['Full Body A', 'Cardio', 'Full Body B', 'Active Recovery', 'Full Body C', 'Cardio'],
                        home: ['Full Body', 'Cardio', 'Strength', 'Flexibility', 'Cardio', 'Full Body'],
                    },
                    endurance: {
                        gym: ['Cardio Long', 'Circuit Training', 'HIIT', 'Steady State', 'Intervals', 'Recovery'],
                        home: ['Running/Walking', 'Bodyweight Circuit', 'HIIT', 'Jump Rope', 'Cardio Mix', 'Stretching'],
                    },
                };

                const EXERCISES = {
                    'Chest & Triceps': [
                        { name: 'Bench Press', sets: 4, reps: '8-10', weight: 'bodyweight + bar', notes: 'Keep back flat, lower to chest' },
                        { name: 'Incline Dumbbell Press', sets: 3, reps: '10-12', weight: '15-25 lbs', notes: '45 degree angle' },
                        { name: 'Cable Flyes', sets: 3, reps: '12-15', weight: 'light', notes: 'Squeeze at center' },
                        { name: 'Tricep Pushdowns', sets: 3, reps: '12-15', weight: 'moderate', notes: 'Keep elbows locked' },
                        { name: 'Overhead Tricep Extension', sets: 3, reps: '12', weight: 'moderate', notes: 'Full stretch at bottom' },
                    ],
                    'Back & Biceps': [
                        { name: 'Pull-ups', sets: 4, reps: '8-10', weight: 'bodyweight', notes: 'Full hang to chin over bar' },
                        { name: 'Barbell Rows', sets: 4, reps: '8-10', weight: '95-135 lbs', notes: 'Keep back straight' },
                        { name: 'Lat Pulldowns', sets: 3, reps: '10-12', weight: 'moderate', notes: 'Wide grip, pull to chest' },
                        { name: 'Dumbbell Curls', sets: 3, reps: '12', weight: '15-25 lbs', notes: 'Control the negative' },
                        { name: 'Hammer Curls', sets: 3, reps: '12', weight: '15-25 lbs', notes: 'Neutral grip' },
                    ],
                    'Legs & Shoulders': [
                        { name: 'Squats', sets: 4, reps: '8-10', weight: '135+ lbs', notes: 'Depth below parallel' },
                        { name: 'Romanian Deadlift', sets: 3, reps: '10', weight: '95-135 lbs', notes: 'Feel hamstring stretch' },
                        { name: 'Leg Press', sets: 3, reps: '12', weight: 'heavy', notes: 'Full range of motion' },
                        { name: 'Overhead Press', sets: 4, reps: '8-10', weight: '65-95 lbs', notes: 'Core tight' },
                        { name: 'Lateral Raises', sets: 3, reps: '15', weight: '10-15 lbs', notes: 'Slight bend in elbows' },
                    ],
                    'Push Workout': [
                        { name: 'Push-ups', sets: 4, reps: '15-20', weight: 'bodyweight', notes: 'Full range, chest to floor' },
                        { name: 'Pike Push-ups', sets: 3, reps: '10-12', weight: 'bodyweight', notes: 'Shoulders targeted' },
                        { name: 'Diamond Push-ups', sets: 3, reps: '12', weight: 'bodyweight', notes: 'Triceps focus' },
                        { name: 'Dips (chair)', sets: 3, reps: '12-15', weight: 'bodyweight', notes: 'Lower slowly' },
                        { name: 'Plank to Push-up', sets: 3, reps: '10 each side', weight: 'bodyweight', notes: 'Core engaged' },
                    ],
                    'Pull Workout': [
                        { name: 'Pull-ups', sets: 4, reps: 'max', weight: 'bodyweight', notes: 'Use assist if needed' },
                        { name: 'Inverted Rows', sets: 3, reps: '12-15', weight: 'bodyweight', notes: 'Use table or bar' },
                        { name: 'Doorframe Rows', sets: 3, reps: '15', weight: 'bodyweight', notes: 'Hold doorframe, lean back' },
                        { name: 'Superman Holds', sets: 3, reps: '30 sec', weight: 'bodyweight', notes: 'Squeeze lower back' },
                        { name: 'Bicep Curls', sets: 3, reps: '12', weight: 'available', notes: 'Use what you have' },
                    ],
                    'Legs': [
                        { name: 'Goblet Squats', sets: 4, reps: '15', weight: 'available', notes: 'Hold weight at chest' },
                        { name: 'Lunges', sets: 3, reps: '12 each leg', weight: 'bodyweight', notes: 'Step forward, knee down' },
                        { name: 'Bulgarian Split Squat', sets: 3, reps: '10 each', weight: 'bodyweight', notes: 'Back foot elevated' },
                        { name: 'Glute Bridges', sets: 3, reps: '15', weight: 'bodyweight', notes: 'Squeeze at top' },
                        { name: 'Calf Raises', sets: 4, reps: '20', weight: 'bodyweight', notes: 'Full stretch and squeeze' },
                    ],
                    'HIIT Cardio': [
                        { name: 'Burpees', sets: 4, reps: '30 sec', weight: 'bodyweight', notes: '10 sec rest between' },
                        { name: 'Mountain Climbers', sets: 4, reps: '30 sec', weight: 'bodyweight', notes: 'Fast pace' },
                        { name: 'Jump Squats', sets: 4, reps: '30 sec', weight: 'bodyweight', notes: 'Land soft' },
                        { name: 'High Knees', sets: 4, reps: '30 sec', weight: 'bodyweight', notes: 'Drive knees up' },
                        { name: 'Plank Jacks', sets: 4, reps: '30 sec', weight: 'bodyweight', notes: 'Keep hips level' },
                    ],
                };

                const place = workout_place === 'both' ? 'gym' : workout_place;
                const template = WORKOUT_TEMPLATES[goal]?.[place] || WORKOUT_TEMPLATES.maintenance.gym;

                const days = [];
                const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

                for (let i = 0; i < days_per_week; i++) {
                    const workoutName = template[i % template.length];
                    const exercises = EXERCISES[workoutName] || EXERCISES['Push Workout'];

                    days.push({
                        day: dayNames[i],
                        name: workoutName,
                        exercises: exercises.map((ex, idx) => ({
                            ...ex,
                            id: `${i}-${idx}`,
                            completed: false,
                        })),
                    });
                }

                const plan = {
                    id: Date.now().toString(),
                    createdAt: new Date().toISOString(),
                    preferences,
                    equipment,
                    daysPerWeek: days_per_week,
                    days,
                };

                set({ workoutPlan: plan });
                return plan;
            },

            setTodayWorkout: (exercises) => set({ todayWorkout: { exercises, completedExercises: [] } }),

            completeExercise: (exerciseId) => set((state) => ({
                todayWorkout: {
                    ...state.todayWorkout,
                    completedExercises: [...state.todayWorkout.completedExercises, exerciseId],
                }
            })),

            uncompleteExercise: (exerciseId) => set((state) => ({
                todayWorkout: {
                    ...state.todayWorkout,
                    completedExercises: state.todayWorkout.completedExercises.filter(id => id !== exerciseId),
                }
            })),

            // === SUPPLEMENT ACTIONS ===
            logSupplement: (supplement) => set((state) => ({
                supplements: [...state.supplements, {
                    ...supplement,
                    id: Date.now().toString(),
                    date: new Date().toISOString().split('T')[0],
                    time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
                }]
            })),

            getTodaySupplements: () => {
                const today = new Date().toISOString().split('T')[0];
                return get().supplements.filter(s => s.date === today);
            },

            // === SLEEP ACTIONS ===
            logSleep: (sleepData) => set((state) => ({
                sleepHistory: [...state.sleepHistory, {
                    id: Date.now().toString(),
                    date: new Date().toISOString().split('T')[0],
                    ...sleepData
                }]
            })),

            setSleepGoal: (hours) => set({ sleepGoal: hours }),

            getLastNightsSleep: () => {
                const yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);
                const yesterdayStr = yesterday.toISOString().split('T')[0];
                const today = new Date().toISOString().split('T')[0];

                return get().sleepHistory.find(s => s.date === today || s.date === yesterdayStr);
            },

            getWeeklySleepStats: () => {
                const { sleepHistory, sleepGoal } = get();
                const last7Days = [];

                for (let i = 0; i < 7; i++) {
                    const date = new Date();
                    date.setDate(date.getDate() - i);
                    const dateStr = date.toISOString().split('T')[0];
                    const sleep = sleepHistory.find(s => s.date === dateStr);
                    last7Days.push({
                        date: dateStr,
                        duration: sleep?.duration || 0,
                        quality: sleep?.quality || 0
                    });
                }

                const totalSleep = last7Days.reduce((sum, d) => sum + d.duration, 0);
                const avgSleep = last7Days.filter(d => d.duration > 0).length > 0
                    ? totalSleep / last7Days.filter(d => d.duration > 0).length
                    : 0;

                return {
                    days: last7Days.reverse(),
                    avgDuration: Math.round(avgSleep * 10) / 10,
                    goalMet: avgSleep >= sleepGoal
                };
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
                fastingState: {
                    isActive: false,
                    startTime: null,
                    duration: 16,
                    plan: '16:8',
                    history: [],
                },
                workoutPlan: null,
                todayWorkout: { exercises: [], completedExercises: [] },
                supplements: [],
            }),
        }),
        {
            name: 'fitcheck-storage',
        }
    )
);

export default useStore;
