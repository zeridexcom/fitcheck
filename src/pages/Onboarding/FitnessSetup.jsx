import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Sparkles, Dumbbell, Home, Target, Calendar, ChevronRight,
    Check, Flame, Scale, Timer, Zap
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useStore from '../../stores/useStore';
import GlowButton from '../../components/GlowButton';

const QUESTIONS = [
    {
        id: 'goal',
        question: "What's your fitness goal?",
        options: [
            { value: 'fat_loss', label: 'Burn Fat', icon: Flame, description: 'Lose weight & get lean' },
            { value: 'muscle_gain', label: 'Build Muscle', icon: Dumbbell, description: 'Get stronger & bigger' },
            { value: 'maintenance', label: 'Stay Fit', icon: Target, description: 'Maintain current shape' },
            { value: 'endurance', label: 'Endurance', icon: Timer, description: 'Improve stamina' },
        ]
    },
    {
        id: 'workout_place',
        question: "Where do you prefer to workout?",
        options: [
            { value: 'gym', label: 'Gym', icon: Dumbbell, description: 'Full equipment access' },
            { value: 'home', label: 'Home', icon: Home, description: 'Workout at home' },
            { value: 'both', label: 'Both', icon: Zap, description: 'Mix of gym & home' },
        ]
    },
    {
        id: 'days_per_week',
        question: "How many days can you workout?",
        options: [
            { value: 3, label: '3 Days', description: 'Beginner friendly' },
            { value: 4, label: '4 Days', description: 'Balanced routine' },
            { value: 5, label: '5 Days', description: 'Dedicated training' },
            { value: 6, label: '6 Days', description: 'Advanced level' },
        ]
    },
    {
        id: 'experience',
        question: "What's your fitness experience?",
        options: [
            { value: 'beginner', label: 'Beginner', description: 'New to fitness' },
            { value: 'intermediate', label: 'Intermediate', description: '6+ months training' },
            { value: 'advanced', label: 'Advanced', description: '2+ years training' },
        ]
    },
];

const HOME_EQUIPMENT = [
    { id: 'dumbbells', label: 'Dumbbells', icon: '🏋️' },
    { id: 'barbell', label: 'Barbell & Plates', icon: '💪' },
    { id: 'pullup_bar', label: 'Pull-up Bar', icon: '🔝' },
    { id: 'resistance_bands', label: 'Resistance Bands', icon: '🎗️' },
    { id: 'kettlebell', label: 'Kettlebell', icon: '🔔' },
    { id: 'bench', label: 'Workout Bench', icon: '🛋️' },
    { id: 'none', label: 'No Equipment', icon: '🙌' },
];

export default function FitnessSetup() {
    const navigate = useNavigate();
    const { updateProfile, setWorkoutPlan, generateWorkoutPlan } = useStore();

    const [step, setStep] = useState(0);
    const [answers, setAnswers] = useState({});
    const [equipment, setEquipment] = useState([]);
    const [isGenerating, setIsGenerating] = useState(false);

    const currentQuestion = QUESTIONS[step];
    const showEquipmentStep = answers.workout_place === 'home' || answers.workout_place === 'both';
    const isEquipmentStep = step === QUESTIONS.length && showEquipmentStep;
    const isFinalStep = step === QUESTIONS.length && !showEquipmentStep || step === QUESTIONS.length + 1;

    const handleAnswer = (value) => {
        setAnswers({ ...answers, [currentQuestion.id]: value });

        if (step < QUESTIONS.length - 1) {
            setStep(step + 1);
        } else if (showEquipmentStep && step === QUESTIONS.length - 1) {
            setStep(QUESTIONS.length); // Go to equipment step
        } else {
            handleComplete({ ...answers, [currentQuestion.id]: value });
        }
    };

    const handleEquipmentToggle = (id) => {
        if (id === 'none') {
            setEquipment(['none']);
        } else {
            const newEquipment = equipment.filter(e => e !== 'none');
            if (equipment.includes(id)) {
                setEquipment(newEquipment.filter(e => e !== id));
            } else {
                setEquipment([...newEquipment, id]);
            }
        }
    };

    const handleComplete = async (finalAnswers) => {
        setIsGenerating(true);

        // Save preferences
        updateProfile({
            fitnessGoal: finalAnswers.goal,
            workoutPlace: finalAnswers.workout_place,
            daysPerWeek: finalAnswers.days_per_week,
            experience: finalAnswers.experience,
            equipment: equipment,
        });

        // Generate workout plan
        await generateWorkoutPlan(finalAnswers, equipment);

        setIsGenerating(false);
        navigate('/');
    };

    return (
        <div className="screen" style={{ position: 'relative', zIndex: 1 }}>
            {/* Header */}
            <motion.div
                className="screen-header"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div>
                    <h2>Setup Your Plan</h2>
                    <p style={{ color: 'var(--text-tertiary)', fontSize: 'var(--font-size-sm)' }}>
                        {isGenerating ? 'Creating your plan...' : `Step ${Math.min(step + 1, QUESTIONS.length + (showEquipmentStep ? 1 : 0))}`}
                    </p>
                </div>
                <motion.div
                    className="icon-badge icon-badge-primary"
                    animate={{ rotate: isGenerating ? 360 : 0 }}
                    transition={{ repeat: isGenerating ? Infinity : 0, duration: 2, ease: 'linear' }}
                >
                    <Sparkles size={20} />
                </motion.div>
            </motion.div>

            {/* Progress Bar */}
            <motion.div
                className="mb-lg"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
            >
                <div style={{
                    height: 4,
                    background: 'var(--glass-border)',
                    borderRadius: 'var(--radius-full)',
                    overflow: 'hidden'
                }}>
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{
                            width: `${((step + 1) / (QUESTIONS.length + (showEquipmentStep ? 1 : 0))) * 100}%`
                        }}
                        style={{
                            height: '100%',
                            background: 'var(--accent-primary)',
                            borderRadius: 'var(--radius-full)'
                        }}
                    />
                </div>
            </motion.div>

            {/* Generating Screen */}
            {isGenerating && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="glass-card text-center"
                    style={{ padding: '48px 24px' }}
                >
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
                        style={{ marginBottom: '24px' }}
                    >
                        <Sparkles size={48} style={{ color: 'var(--accent-primary)' }} />
                    </motion.div>
                    <h3 style={{ marginBottom: '8px' }}>Creating Your Personalized Plan</h3>
                    <p style={{ color: 'var(--text-secondary)' }}>
                        AI is designing your {answers.days_per_week}-day workout program...
                    </p>
                </motion.div>
            )}

            {/* Question */}
            {!isGenerating && !isEquipmentStep && currentQuestion && (
                <AnimatePresence mode="wait">
                    <motion.div
                        key={step}
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -50 }}
                    >
                        <h3 className="text-center mb-lg" style={{ fontSize: 'var(--font-size-xl)' }}>
                            {currentQuestion.question}
                        </h3>

                        <div className="flex flex-col gap-md">
                            {currentQuestion.options.map((option, i) => {
                                const Icon = option.icon;
                                return (
                                    <motion.button
                                        key={option.value}
                                        onClick={() => handleAnswer(option.value)}
                                        className="glass-card"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.1 }}
                                        whileHover={{ scale: 1.02, x: 8 }}
                                        whileTap={{ scale: 0.98 }}
                                        style={{
                                            padding: '20px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '16px',
                                            cursor: 'pointer',
                                            border: 'none',
                                            textAlign: 'left'
                                        }}
                                    >
                                        {Icon && (
                                            <div className="icon-badge icon-badge-primary" style={{ width: 48, height: 48 }}>
                                                <Icon size={22} />
                                            </div>
                                        )}
                                        <div style={{ flex: 1 }}>
                                            <p style={{ fontWeight: 600, fontSize: 'var(--font-size-md)', marginBottom: '2px' }}>
                                                {option.label}
                                            </p>
                                            {option.description && (
                                                <p style={{ color: 'var(--text-tertiary)', fontSize: 'var(--font-size-sm)' }}>
                                                    {option.description}
                                                </p>
                                            )}
                                        </div>
                                        <ChevronRight size={20} style={{ color: 'var(--text-tertiary)' }} />
                                    </motion.button>
                                );
                            })}
                        </div>
                    </motion.div>
                </AnimatePresence>
            )}

            {/* Equipment Selection */}
            {!isGenerating && isEquipmentStep && (
                <motion.div
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                >
                    <h3 className="text-center mb-lg" style={{ fontSize: 'var(--font-size-xl)' }}>
                        What equipment do you have?
                    </h3>

                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(2, 1fr)',
                        gap: '12px',
                        marginBottom: '24px'
                    }}>
                        {HOME_EQUIPMENT.map((item, i) => {
                            const isSelected = equipment.includes(item.id);
                            return (
                                <motion.button
                                    key={item.id}
                                    onClick={() => handleEquipmentToggle(item.id)}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: i * 0.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    style={{
                                        padding: '16px',
                                        borderRadius: 'var(--radius-md)',
                                        background: isSelected ? 'var(--accent-primary-soft)' : 'var(--glass-bg)',
                                        border: isSelected ? '2px solid var(--accent-primary)' : '1px solid var(--glass-border)',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        gap: '8px',
                                        position: 'relative'
                                    }}
                                >
                                    <span style={{ fontSize: '28px' }}>{item.icon}</span>
                                    <span style={{
                                        fontSize: 'var(--font-size-sm)',
                                        fontWeight: isSelected ? 600 : 400,
                                        color: isSelected ? 'var(--accent-primary)' : 'var(--text-secondary)'
                                    }}>
                                        {item.label}
                                    </span>
                                    {isSelected && (
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            style={{
                                                position: 'absolute',
                                                top: 8,
                                                right: 8,
                                                width: 20,
                                                height: 20,
                                                borderRadius: '50%',
                                                background: 'var(--accent-primary)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}
                                        >
                                            <Check size={12} color="#fff" />
                                        </motion.div>
                                    )}
                                </motion.button>
                            );
                        })}
                    </div>

                    <GlowButton
                        onClick={() => handleComplete(answers)}
                        className="btn-full btn-lg"
                        disabled={equipment.length === 0}
                    >
                        <Sparkles size={20} />
                        Generate My Plan
                    </GlowButton>
                </motion.div>
            )}
        </div>
    );
}
