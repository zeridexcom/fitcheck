import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calculator, ChevronRight, ChevronLeft, Check, Sparkles, Activity, Target } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useStore from '../stores/useStore';

// 12 comprehensive questions for precise calorie calculation
const questions = [
    {
        id: 'gender',
        question: "What's your biological sex?",
        desc: "For accurate metabolic calculation",
        options: [
            { value: 'male', label: '♂️ Male' },
            { value: 'female', label: '♀️ Female' }
        ]
    },
    {
        id: 'age',
        question: "What's your age?",
        desc: "Metabolism changes with age",
        type: 'number',
        min: 15,
        max: 100,
        unit: 'years'
    },
    {
        id: 'weight',
        question: "What's your current weight?",
        desc: "Be as accurate as possible",
        type: 'number',
        min: 30,
        max: 300,
        unit: 'kg'
    },
    {
        id: 'height',
        question: "What's your height?",
        desc: "Height affects calorie needs",
        type: 'number',
        min: 100,
        max: 250,
        unit: 'cm'
    },
    {
        id: 'bodyFat',
        question: "Estimated body fat percentage?",
        desc: "Skip if unknown - we'll calculate",
        options: [
            { value: 'skip', label: '❓ I don\'t know', desc: 'We\'ll estimate' },
            { value: 'low', label: '💪 Under 15%', desc: 'Very lean' },
            { value: 'medium', label: '🏃 15-25%', desc: 'Athletic' },
            { value: 'high', label: '📊 25-35%', desc: 'Average' },
            { value: 'very_high', label: '📈 Over 35%', desc: 'Higher' }
        ]
    },
    {
        id: 'goal',
        question: "What's your primary goal?",
        desc: "This determines calorie adjustment",
        options: [
            { value: 'lose_aggressive', label: '🔥 Aggressive Fat Loss', desc: '-750 cal/day deficit' },
            { value: 'lose_moderate', label: '⚖️ Moderate Fat Loss', desc: '-500 cal/day deficit' },
            { value: 'lose_slow', label: '🐢 Slow Fat Loss', desc: '-250 cal/day deficit' },
            { value: 'maintain', label: '🎯 Maintain Weight', desc: 'No change' },
            { value: 'gain_slow', label: '📈 Lean Bulk', desc: '+250 cal/day surplus' },
            { value: 'gain_aggressive', label: '💪 Aggressive Bulk', desc: '+500 cal/day surplus' }
        ]
    },
    {
        id: 'workActivity',
        question: "What's your daily work activity?",
        desc: "Your job's physical demands",
        options: [
            { value: 'sedentary', label: '🪑 Desk Job', desc: 'Mostly sitting' },
            { value: 'light', label: '🚶 Light Activity', desc: 'Some walking' },
            { value: 'moderate', label: '🏃 Moderate', desc: 'On feet a lot' },
            { value: 'heavy', label: '🏋️ Physical Labor', desc: 'Very active job' }
        ]
    },
    {
        id: 'exerciseFreq',
        question: "How many days do you exercise per week?",
        desc: "Include all workout sessions",
        options: [
            { value: 0, label: '0', desc: 'No exercise' },
            { value: 1, label: '1-2', desc: 'Light' },
            { value: 3, label: '3-4', desc: 'Moderate' },
            { value: 5, label: '5-6', desc: 'Active' },
            { value: 7, label: '7+', desc: 'Athlete' }
        ]
    },
    {
        id: 'exerciseIntensity',
        question: "How intense are your workouts?",
        desc: "Average intensity level",
        options: [
            { value: 'light', label: '🚶 Light', desc: 'Walking, yoga' },
            { value: 'moderate', label: '🏃 Moderate', desc: 'Steady cardio, weights' },
            { value: 'intense', label: '🔥 Intense', desc: 'HIIT, heavy lifting' },
            { value: 'extreme', label: '💀 Extreme', desc: 'Pro-level training' }
        ]
    },
    {
        id: 'cardio',
        question: "How much cardio do you do weekly?",
        desc: "Total cardio hours per week",
        options: [
            { value: 0, label: '0 hours', desc: 'No cardio' },
            { value: 1, label: '1-2 hours' },
            { value: 3, label: '3-5 hours' },
            { value: 6, label: '6+ hours', desc: 'Endurance athlete' }
        ]
    },
    {
        id: 'neat',
        question: "How active are you outside exercise?",
        desc: "Non-exercise activity (NEAT)",
        options: [
            { value: 'low', label: '📺 Low', desc: 'Mostly sedentary' },
            { value: 'medium', label: '🚶 Medium', desc: 'Some walking, chores' },
            { value: 'high', label: '🏃 High', desc: 'Always moving' }
        ]
    },
    {
        id: 'metabolism',
        question: "How would you describe your metabolism?",
        desc: "Based on your weight history",
        options: [
            { value: 'slow', label: '🐢 Slow', desc: 'Gain weight easily' },
            { value: 'normal', label: '⚖️ Normal', desc: 'Typical' },
            { value: 'fast', label: '🚀 Fast', desc: 'Hard to gain weight' }
        ]
    }
];

export default function CalorieCalculator() {
    const navigate = useNavigate();
    const { updateProfile, setTargets, profile } = useStore();

    const [step, setStep] = useState(0);
    const [answers, setAnswers] = useState({
        gender: profile.gender || 'male',
        age: profile.age || 25,
        weight: profile.weight || 70,
        height: profile.height || 170,
        bodyFat: 'skip',
        goal: 'lose_moderate',
        workActivity: 'sedentary',
        exerciseFreq: 3,
        exerciseIntensity: 'moderate',
        cardio: 1,
        neat: 'medium',
        metabolism: 'normal'
    });
    const [result, setResult] = useState(null);

    const currentQ = questions[step];
    const progress = ((step + 1) / questions.length) * 100;
    const isLastQuestion = step === questions.length - 1;

    const handleSelect = (value) => {
        setAnswers(prev => ({ ...prev, [currentQ.id]: value }));
        if (currentQ.options && !isLastQuestion) {
            setTimeout(() => setStep(step + 1), 300);
        }
    };

    const handleNumberChange = (value) => {
        setAnswers(prev => ({ ...prev, [currentQ.id]: value }));
    };

    const calculateCalories = () => {
        const { gender, age, weight, height, bodyFat, goal, workActivity, exerciseFreq, exerciseIntensity, cardio, neat, metabolism } = answers;

        // Mifflin-St Jeor BMR Formula (most accurate)
        let bmr;
        if (gender === 'male') {
            bmr = 10 * weight + 6.25 * height - 5 * age + 5;
        } else {
            bmr = 10 * weight + 6.25 * height - 5 * age - 161;
        }

        // Activity multipliers
        const workMultipliers = { sedentary: 1.2, light: 1.35, moderate: 1.5, heavy: 1.7 };
        const exerciseMultipliers = { 0: 0, 1: 0.1, 3: 0.2, 5: 0.3, 7: 0.4 };
        const intensityMultipliers = { light: 0.8, moderate: 1.0, intense: 1.2, extreme: 1.4 };
        const cardioMultipliers = { 0: 0, 1: 0.05, 3: 0.1, 6: 0.15 };
        const neatMultipliers = { low: 0, medium: 0.05, high: 0.1 };
        const metabolismMultipliers = { slow: 0.95, normal: 1.0, fast: 1.08 };

        // Calculate TDEE
        let tdee = bmr * workMultipliers[workActivity];
        tdee += bmr * exerciseMultipliers[exerciseFreq] * intensityMultipliers[exerciseIntensity];
        tdee += bmr * cardioMultipliers[cardio];
        tdee += bmr * neatMultipliers[neat];
        tdee *= metabolismMultipliers[metabolism];

        // Goal adjustments
        const goalAdjustments = {
            lose_aggressive: -750,
            lose_moderate: -500,
            lose_slow: -250,
            maintain: 0,
            gain_slow: 250,
            gain_aggressive: 500
        };

        const targetCalories = Math.round(tdee + goalAdjustments[goal]);

        // Calculate macros (protein-focused)
        let proteinRatio, carbRatio, fatRatio;

        if (goal.includes('lose')) {
            // Fat loss: High protein, moderate fat, lower carbs
            proteinRatio = 0.35; // 35% from protein
            fatRatio = 0.30;     // 30% from fat
            carbRatio = 0.35;    // 35% from carbs
        } else if (goal.includes('gain')) {
            // Muscle gain: High protein, high carbs, moderate fat
            proteinRatio = 0.30;
            fatRatio = 0.25;
            carbRatio = 0.45;
        } else {
            // Maintenance: Balanced
            proteinRatio = 0.30;
            fatRatio = 0.30;
            carbRatio = 0.40;
        }

        // Protein: minimum 1.6g per kg for active individuals
        const minProtein = Math.round(weight * 1.6);
        const proteinFromCalories = Math.round((targetCalories * proteinRatio) / 4);
        const protein = Math.max(minProtein, proteinFromCalories);

        // Recalculate carbs and fats based on remaining calories
        const proteinCalories = protein * 4;
        const remainingCalories = targetCalories - proteinCalories;
        const fatCalories = remainingCalories * (fatRatio / (fatRatio + carbRatio));
        const carbCalories = remainingCalories - fatCalories;

        const fat = Math.round(fatCalories / 9);
        const carbs = Math.round(carbCalories / 4);

        return {
            calories: targetCalories,
            protein,
            carbs,
            fat,
            bmr: Math.round(bmr),
            tdee: Math.round(tdee)
        };
    };

    const handleFinish = () => {
        const calculated = calculateCalories();
        setResult(calculated);
    };

    const saveResults = () => {
        if (result) {
            // Update profile with new data
            updateProfile({
                ...profile,
                gender: answers.gender,
                age: answers.age,
                weight: answers.weight,
                height: answers.height,
                activityLevel: answers.workActivity
            });

            // Set new targets
            setTargets({
                calories: result.calories,
                protein: result.protein,
                carbs: result.carbs,
                fat: result.fat
            });

            navigate('/');
        }
    };

    // Show results
    if (result) {
        return (
            <div className="screen">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                >
                    <div className="text-center mb-xl">
                        <div className="icon-badge icon-badge-primary" style={{ width: 64, height: 64, margin: '0 auto 16px' }}>
                            <Sparkles size={28} />
                        </div>
                        <h2 style={{ color: 'var(--text-primary)' }}>Your Personalized Macros</h2>
                        <p style={{ color: 'var(--text-secondary)' }}>Calculated using Mifflin-St Jeor formula</p>
                    </div>

                    {/* Main Calorie Display */}
                    <motion.div
                        className="glass-card glass-card-elevated mb-lg text-center"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <h1 style={{ fontSize: 64, color: 'var(--accent-primary)', marginBottom: 8 }}>
                            {result.calories}
                        </h1>
                        <p style={{ fontSize: 'var(--font-size-lg)', color: 'var(--text-secondary)' }}>
                            Daily Calories
                        </p>
                        <div className="flex justify-center gap-lg mt-md" style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-tertiary)' }}>
                            <span>BMR: {result.bmr}</span>
                            <span>TDEE: {result.tdee}</span>
                        </div>
                    </motion.div>

                    {/* Macro Grid */}
                    <div className="nutrition-grid mb-lg">
                        <motion.div
                            className="nutrition-item"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            style={{ color: '#FF6B6B' }}
                        >
                            <div className="nutrition-value">{result.protein}g</div>
                            <div className="nutrition-label">Protein</div>
                            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)' }}>
                                {Math.round(result.protein * 4)} cal
                            </div>
                        </motion.div>
                        <motion.div
                            className="nutrition-item"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            style={{ color: '#4ECDC4' }}
                        >
                            <div className="nutrition-value">{result.carbs}g</div>
                            <div className="nutrition-label">Carbs</div>
                            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)' }}>
                                {Math.round(result.carbs * 4)} cal
                            </div>
                        </motion.div>
                        <motion.div
                            className="nutrition-item"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            style={{ color: '#FFE66D' }}
                        >
                            <div className="nutrition-value">{result.fat}g</div>
                            <div className="nutrition-label">Fat</div>
                            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)' }}>
                                {Math.round(result.fat * 9)} cal
                            </div>
                        </motion.div>
                    </div>

                    <motion.button
                        className="btn btn-primary btn-lg btn-full"
                        onClick={saveResults}
                        whileTap={{ scale: 0.98 }}
                    >
                        <Check size={20} />
                        Apply These Targets
                    </motion.button>

                    <motion.button
                        className="btn btn-ghost btn-full mt-md"
                        onClick={() => { setResult(null); setStep(0); }}
                        whileTap={{ scale: 0.98 }}
                    >
                        Recalculate
                    </motion.button>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="screen">
            {/* Progress Bar */}
            <div style={{ marginBottom: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)' }}>
                        Question {step + 1} of {questions.length}
                    </span>
                    <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--accent-primary)' }}>
                        {Math.round(progress)}%
                    </span>
                </div>
                <div style={{ height: 4, background: 'var(--glass-bg)', borderRadius: 2 }}>
                    <motion.div
                        style={{ height: '100%', background: 'var(--accent-primary)', borderRadius: 2 }}
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                    />
                </div>
            </div>

            {/* Question */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={step}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                >
                    <h2 style={{ marginBottom: 8, color: 'var(--text-primary)' }}>{currentQ.question}</h2>
                    <p style={{ color: 'var(--text-tertiary)', fontSize: 'var(--font-size-sm)', marginBottom: 24 }}>
                        {currentQ.desc}
                    </p>

                    {currentQ.type === 'number' ? (
                        <div className="glass-card" style={{ padding: 24 }}>
                            <input
                                type="number"
                                className="input"
                                value={answers[currentQ.id] || ''}
                                onChange={(e) => handleNumberChange(parseInt(e.target.value) || 0)}
                                min={currentQ.min}
                                max={currentQ.max}
                                style={{
                                    fontSize: 'var(--font-size-2xl)',
                                    textAlign: 'center',
                                    color: 'var(--text-primary)'
                                }}
                            />
                            <p style={{ textAlign: 'center', marginTop: 8, color: 'var(--text-tertiary)' }}>
                                {currentQ.unit}
                            </p>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-sm">
                            {currentQ.options.map((opt) => {
                                const isSelected = answers[currentQ.id] === opt.value;
                                return (
                                    <motion.button
                                        key={opt.value}
                                        className="glass-card"
                                        onClick={() => handleSelect(opt.value)}
                                        whileTap={{ scale: 0.98 }}
                                        style={{
                                            padding: '16px 20px',
                                            textAlign: 'left',
                                            cursor: 'pointer',
                                            border: isSelected ? '2px solid var(--accent-primary)' : '1px solid var(--glass-border)',
                                            background: isSelected ? 'var(--accent-primary-soft)' : 'var(--glass-bg)'
                                        }}
                                    >
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{opt.label}</span>
                                                {opt.desc && (
                                                    <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)', marginTop: 4 }}>
                                                        {opt.desc}
                                                    </p>
                                                )}
                                            </div>
                                            {isSelected && (
                                                <Check size={20} style={{ color: 'var(--accent-primary)' }} />
                                            )}
                                        </div>
                                    </motion.button>
                                );
                            })}
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>

            {/* Navigation */}
            <div className="flex gap-md mt-xl">
                {step > 0 && (
                    <motion.button
                        className="btn btn-secondary"
                        onClick={() => setStep(step - 1)}
                        whileTap={{ scale: 0.98 }}
                    >
                        <ChevronLeft size={20} />
                        Back
                    </motion.button>
                )}

                {(currentQ.type === 'number' || isLastQuestion) && (
                    <motion.button
                        className="btn btn-primary flex-1"
                        onClick={isLastQuestion ? handleFinish : () => setStep(step + 1)}
                        whileTap={{ scale: 0.98 }}
                    >
                        {isLastQuestion ? (
                            <>
                                <Calculator size={20} />
                                Calculate
                            </>
                        ) : (
                            <>
                                Next
                                <ChevronRight size={20} />
                            </>
                        )}
                    </motion.button>
                )}
            </div>
        </div>
    );
}
