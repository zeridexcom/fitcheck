import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dumbbell, ChevronRight, ChevronLeft, ChevronDown, ChevronUp, Sparkles, Check, Loader2, Edit2, Trash2, Plus, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useStore from '../stores/useStore';

const questions = [
    {
        id: 'goal',
        question: "What's your main fitness goal?",
        options: [
            { value: 'muscle', label: '💪 Build Muscle', desc: 'Gain size and strength' },
            { value: 'fat_loss', label: '🔥 Lose Fat', desc: 'Burn calories, get lean' },
            { value: 'strength', label: '🏋️ Get Stronger', desc: 'Increase your lifts' },
            { value: 'fitness', label: '❤️ General Fitness', desc: 'Overall health' },
        ]
    },
    {
        id: 'days',
        question: 'How many days can you workout?',
        options: [
            { value: 5, label: '5 Days', desc: 'Mon-Fri' },
            { value: 6, label: '6 Days', desc: 'One rest day' },
            { value: 7, label: '7 Days', desc: 'Every day (active recovery)' },
        ]
    },
    {
        id: 'location',
        question: 'Where do you train?',
        options: [
            { value: 'gym', label: '🏢 Gym', desc: 'Full equipment access' },
            { value: 'home', label: '🏠 Home', desc: 'Limited equipment' },
            { value: 'both', label: '🔄 Both', desc: 'Mix of gym and home' },
        ]
    },
    {
        id: 'experience',
        question: "What's your experience level?",
        options: [
            { value: 'beginner', label: '🌱 Beginner', desc: 'Less than 6 months' },
            { value: 'intermediate', label: '💪 Intermediate', desc: '6 months - 2 years' },
            { value: 'advanced', label: '🔥 Advanced', desc: '2+ years consistent' },
        ]
    },
    {
        id: 'equipment',
        question: 'What equipment do you have access to?',
        multi: true,
        options: [
            { value: 'barbell', label: 'Barbell' },
            { value: 'dumbbells', label: 'Dumbbells' },
            { value: 'cables', label: 'Cable Machine' },
            { value: 'bench', label: 'Bench' },
            { value: 'pullup_bar', label: 'Pull-up Bar' },
            { value: 'machines', label: 'Gym Machines' },
        ]
    },
    {
        id: 'focus',
        question: 'Which areas need more focus?',
        multi: true,
        options: [
            { value: 'chest', label: 'Chest' },
            { value: 'back', label: 'Back' },
            { value: 'shoulders', label: 'Shoulders' },
            { value: 'arms', label: 'Arms' },
            { value: 'legs', label: 'Legs' },
            { value: 'core', label: 'Core' },
        ]
    },
    {
        id: 'duration',
        question: 'How long per workout session?',
        options: [
            { value: 30, label: '30 min', desc: 'Quick & intense' },
            { value: 45, label: '45 min', desc: 'Balanced' },
            { value: 60, label: '60 min', desc: 'Full session' },
            { value: 90, label: '90 min', desc: 'Comprehensive' },
        ]
    },
    {
        id: 'split',
        question: 'Preferred training style?',
        options: [
            { value: 'ppl', label: 'Push-Pull-Legs', desc: 'Great for muscle building' },
            { value: 'upper_lower', label: 'Upper-Lower', desc: 'Good for beginners' },
            { value: 'bro_split', label: 'Bro Split', desc: 'One muscle group/day' },
            { value: 'full_body', label: 'Full Body', desc: 'Each session hits all' },
        ]
    },
];

export default function WorkoutBuilder() {
    const navigate = useNavigate();
    const { getApiKey, setWorkoutPlan } = useStore();

    const [step, setStep] = useState(0);
    const [answers, setAnswers] = useState({});
    const [generating, setGenerating] = useState(false);
    const [generatedPlan, setGeneratedPlan] = useState(null);
    const [error, setError] = useState(null);

    const currentQ = questions[step];
    const isLastQuestion = step === questions.length - 1;
    const progress = ((step + 1) / questions.length) * 100;

    const handleSelect = (value) => {
        if (currentQ.multi) {
            const current = answers[currentQ.id] || [];
            const updated = current.includes(value)
                ? current.filter(v => v !== value)
                : [...current, value];
            setAnswers({ ...answers, [currentQ.id]: updated });
        } else {
            setAnswers({ ...answers, [currentQ.id]: value });
            if (!isLastQuestion) {
                setTimeout(() => setStep(step + 1), 300);
            }
        }
    };

    const handleNext = () => {
        if (isLastQuestion) {
            generatePlan();
        } else {
            setStep(step + 1);
        }
    };

    const generatePlan = async () => {
        setGenerating(true);
        setError(null);

        const apiKey = getApiKey();
        if (!apiKey) {
            setError('Please set up your OpenAI API key in settings first.');
            setGenerating(false);
            return;
        }

        try {
            const prompt = `Create a ${answers.days}-day workout plan based on:
- Goal: ${answers.goal}
- Location: ${answers.location}
- Experience: ${answers.experience}
- Equipment: ${(answers.equipment || []).join(', ') || 'bodyweight'}
- Focus areas: ${(answers.focus || []).join(', ') || 'balanced'}
- Session duration: ${answers.duration} minutes
- Split preference: ${answers.split}

Return a JSON object with this EXACT structure (no markdown, just JSON):
{
  "name": "Plan Name",
  "days": [
    {
      "day": "Monday",
      "name": "Push Day",
      "focus": "Chest, Shoulders, Triceps",
      "exercises": [
        {"name": "Bench Press", "sets": 3, "reps": "10", "notes": "Focus on form"},
        {"name": "Shoulder Press", "sets": 3, "reps": "10", "notes": ""}
      ]
    }
  ]
}

Include 4-6 exercises per day. For rest days, use exercises: [] and name: "Rest Day".`;

            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    model: 'gpt-4o-mini',
                    messages: [
                        { role: 'system', content: 'You are a professional fitness coach. Return ONLY valid JSON, no markdown.' },
                        { role: 'user', content: prompt }
                    ],
                    max_tokens: 2000
                })
            });

            const data = await response.json();

            if (data.error) {
                throw new Error(data.error.message);
            }

            let planText = data.choices[0].message.content;
            // Clean up markdown if present
            planText = planText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

            const plan = JSON.parse(planText);

            // Add IDs to exercises
            plan.days = plan.days.map((day, dayIndex) => ({
                ...day,
                exercises: (day.exercises || []).map((ex, exIndex) => ({
                    ...ex,
                    id: `d${dayIndex}-e${exIndex}`
                }))
            }));

            setGeneratedPlan(plan);
        } catch (err) {
            console.error('Generation error:', err);
            setError(err.message || 'Failed to generate plan. Please try again.');
        }

        setGenerating(false);
    };

    const savePlan = () => {
        setWorkoutPlan(generatedPlan);
        navigate('/workout');
    };

    const [expandedDay, setExpandedDay] = useState(null);
    const [editingExercise, setEditingExercise] = useState(null);

    const toggleDay = (dayIndex) => {
        setExpandedDay(expandedDay === dayIndex ? null : dayIndex);
    };

    const deleteExercise = (dayIndex, exerciseId) => {
        const updated = { ...generatedPlan };
        updated.days[dayIndex].exercises = updated.days[dayIndex].exercises.filter(e => e.id !== exerciseId);
        setGeneratedPlan(updated);
    };

    const updateExercise = (dayIndex, exerciseId, field, value) => {
        const updated = { ...generatedPlan };
        const exercise = updated.days[dayIndex].exercises.find(e => e.id === exerciseId);
        if (exercise) {
            exercise[field] = value;
            setGeneratedPlan(updated);
        }
    };

    // Show generated plan preview
    if (generatedPlan) {
        return (
            <div className="screen">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                >
                    <div className="screen-header">
                        <div className="icon-badge icon-badge-primary" style={{ width: 56, height: 56 }}>
                            <Sparkles size={24} />
                        </div>
                        <h2 style={{ marginTop: 16, color: 'var(--text-primary)' }}>{generatedPlan.name}</h2>
                        <p style={{ color: 'var(--text-secondary)' }}>Tap a day to view & edit exercises</p>
                    </div>

                    <div className="flex flex-col gap-md mb-xl">
                        {generatedPlan.days.map((day, dayIndex) => (
                            <motion.div
                                key={dayIndex}
                                className="glass-card"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: dayIndex * 0.05 }}
                                style={{ overflow: 'hidden' }}
                            >
                                {/* Day Header - Clickable */}
                                <div
                                    className="flex justify-between items-center"
                                    onClick={() => toggleDay(dayIndex)}
                                    style={{ cursor: 'pointer', padding: '4px 0' }}
                                >
                                    <div>
                                        <h4 style={{ marginBottom: 4, color: 'var(--text-primary)' }}>{day.day}</h4>
                                        <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--accent-primary)' }}>
                                            {day.name}
                                        </p>
                                        {day.focus && (
                                            <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)', marginTop: 4 }}>
                                                {day.focus}
                                            </p>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-sm">
                                        <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)' }}>
                                            {day.exercises?.length || 0} exercises
                                        </span>
                                        {expandedDay === dayIndex ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                    </div>
                                </div>

                                {/* Expanded Exercise List */}
                                <AnimatePresence>
                                    {expandedDay === dayIndex && day.exercises?.length > 0 && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            style={{ overflow: 'hidden', marginTop: 16 }}
                                        >
                                            <div className="flex flex-col gap-sm">
                                                {day.exercises.map((exercise, exIndex) => (
                                                    <motion.div
                                                        key={exercise.id}
                                                        className="glass-card"
                                                        style={{
                                                            padding: '12px 16px',
                                                            background: 'rgba(255,255,255,0.03)'
                                                        }}
                                                        initial={{ opacity: 0, y: 10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{ delay: exIndex * 0.05 }}
                                                    >
                                                        <div className="flex justify-between items-start">
                                                            <div style={{ flex: 1 }}>
                                                                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                                                                    {exercise.name}
                                                                </span>
                                                                <div className="flex gap-md mt-sm" style={{ fontSize: 'var(--font-size-sm)' }}>
                                                                    <span style={{ color: 'var(--accent-primary)' }}>
                                                                        {exercise.sets} sets
                                                                    </span>
                                                                    <span style={{ color: 'var(--text-tertiary)' }}>
                                                                        × {exercise.reps} reps
                                                                    </span>
                                                                </div>
                                                                {exercise.notes && (
                                                                    <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)', marginTop: 6, fontStyle: 'italic' }}>
                                                                        💡 {exercise.notes}
                                                                    </p>
                                                                )}
                                                            </div>
                                                            <motion.button
                                                                onClick={() => deleteExercise(dayIndex, exercise.id)}
                                                                whileTap={{ scale: 0.9 }}
                                                                style={{
                                                                    background: 'rgba(255,100,100,0.1)',
                                                                    border: 'none',
                                                                    borderRadius: 6,
                                                                    padding: 8,
                                                                    cursor: 'pointer',
                                                                    color: '#ff6464'
                                                                }}
                                                            >
                                                                <Trash2 size={16} />
                                                            </motion.button>
                                                        </div>
                                                    </motion.div>
                                                ))}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* Rest day message */}
                                {expandedDay === dayIndex && (!day.exercises || day.exercises.length === 0) && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        style={{
                                            marginTop: 16,
                                            padding: 16,
                                            textAlign: 'center',
                                            background: 'rgba(255,255,255,0.03)',
                                            borderRadius: 8
                                        }}
                                    >
                                        <p style={{ color: 'var(--text-tertiary)' }}>🧘 Rest & Recovery Day</p>
                                    </motion.div>
                                )}
                            </motion.div>
                        ))}
                    </div>

                    <motion.button
                        className="btn btn-primary btn-lg btn-full"
                        onClick={savePlan}
                        whileTap={{ scale: 0.98 }}
                    >
                        <Check size={20} />
                        Save & Start Using
                    </motion.button>
                </motion.div>
            </div>
        );
    }

    // Generating state
    if (generating) {
        return (
            <div className="screen flex flex-col items-center justify-center" style={{ minHeight: '60vh' }}>
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
                >
                    <Sparkles size={48} style={{ color: 'var(--accent-primary)' }} />
                </motion.div>
                <h3 style={{ marginTop: 24 }}>Building Your Plan...</h3>
                <p style={{ color: 'var(--text-secondary)', marginTop: 8 }}>
                    Analyzing your goals and creating the perfect routine
                </p>
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
                    <h2 style={{ marginBottom: 24 }}>{currentQ.question}</h2>

                    <div className="flex flex-col gap-sm">
                        {currentQ.options.map((opt) => {
                            const isSelected = currentQ.multi
                                ? (answers[currentQ.id] || []).includes(opt.value)
                                : answers[currentQ.id] === opt.value;

                            return (
                                <motion.button
                                    key={opt.value}
                                    className={`glass-card ${isSelected ? 'selected' : ''}`}
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
                                            <motion.div
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                            >
                                                <Check size={20} style={{ color: 'var(--accent-primary)' }} />
                                            </motion.div>
                                        )}
                                    </div>
                                </motion.button>
                            );
                        })}
                    </div>

                    {error && (
                        <p style={{ color: 'var(--accent-warning)', marginTop: 16, fontSize: 'var(--font-size-sm)' }}>
                            {error}
                        </p>
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

                {(currentQ.multi || isLastQuestion) && (
                    <motion.button
                        className="btn btn-primary flex-1"
                        onClick={handleNext}
                        whileTap={{ scale: 0.98 }}
                        disabled={currentQ.multi && !(answers[currentQ.id]?.length > 0)}
                    >
                        {isLastQuestion ? (
                            <>
                                <Sparkles size={20} />
                                Generate Plan
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
