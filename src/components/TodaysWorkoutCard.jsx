import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Dumbbell, Trophy, Book, ChevronDown, ChevronUp } from 'lucide-react';
import useStore from '../stores/useStore';

// Motivational Bible verses for workout completion
const completionVerses = [
    { text: "I can do all things through Christ who strengthens me.", ref: "Philippians 4:13" },
    { text: "Do you not know that your bodies are temples of the Holy Spirit?", ref: "1 Corinthians 6:19" },
    { text: "Physical training is of some value, but godliness has value for all things.", ref: "1 Timothy 4:8" },
    { text: "Whatever you do, work at it with all your heart, as working for the Lord.", ref: "Colossians 3:23" },
    { text: "Be strong and courageous. Do not be afraid; do not be discouraged.", ref: "Joshua 1:9" },
    { text: "But those who hope in the LORD will renew their strength.", ref: "Isaiah 40:31" },
];

export default function TodaysWorkoutCard() {
    const {
        getTodaysWorkoutPlan,
        completeSet,
        isSetCompleted,
        getWorkoutProgress,
        isWorkoutComplete,
        workoutProgress
    } = useStore();

    const [showCelebration, setShowCelebration] = useState(false);
    const [expandedExercise, setExpandedExercise] = useState(null);
    const [verse, setVerse] = useState(null);

    const todayPlan = getTodaysWorkoutPlan();
    const progress = getWorkoutProgress();
    const isComplete = isWorkoutComplete();

    useEffect(() => {
        if (isComplete && !showCelebration) {
            setVerse(completionVerses[Math.floor(Math.random() * completionVerses.length)]);
            setShowCelebration(true);
        }
    }, [isComplete]);

    if (!todayPlan) {
        return (
            <motion.div
                className="glass-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div className="flex items-center gap-md mb-md">
                    <div className="icon-badge icon-badge-secondary" style={{ width: 40, height: 40 }}>
                        <Dumbbell size={18} />
                    </div>
                    <div>
                        <h4>No Workout Today</h4>
                        <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)' }}>
                            Create a workout plan to get started
                        </p>
                    </div>
                </div>
            </motion.div>
        );
    }

    const handleSetClick = (exerciseId, setNumber) => {
        if (!isSetCompleted(exerciseId, setNumber)) {
            completeSet(exerciseId, setNumber);
        }
    };

    const isExerciseComplete = (exercise) => {
        const completedCount = Array.from({ length: exercise.sets }, (_, i) => i + 1)
            .filter(setNum => isSetCompleted(exercise.id, setNum)).length;
        return completedCount >= exercise.sets;
    };

    return (
        <>
            <motion.div
                className="glass-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                {/* Header */}
                <div className="flex justify-between items-center mb-md">
                    <div className="flex items-center gap-md">
                        <div className="icon-badge icon-badge-primary" style={{ width: 40, height: 40 }}>
                            <Dumbbell size={18} />
                        </div>
                        <div>
                            <h4>{todayPlan.day} - {todayPlan.name}</h4>
                            <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)' }}>
                                {todayPlan.focus}
                            </p>
                        </div>
                    </div>
                    <span style={{
                        fontSize: 'var(--font-size-sm)',
                        fontWeight: 700,
                        color: isComplete ? 'var(--accent-primary)' : 'var(--text-secondary)'
                    }}>
                        {progress.percentage}%
                    </span>
                </div>

                {/* Progress Bar */}
                <div style={{
                    height: 6,
                    background: 'var(--glass-bg)',
                    borderRadius: 3,
                    marginBottom: 16,
                    overflow: 'hidden'
                }}>
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progress.percentage}%` }}
                        style={{
                            height: '100%',
                            background: isComplete
                                ? 'linear-gradient(90deg, var(--accent-primary), var(--accent-secondary))'
                                : 'var(--accent-primary)',
                            borderRadius: 3
                        }}
                    />
                </div>

                {/* Exercises */}
                <div className="flex flex-col gap-sm">
                    {todayPlan.exercises?.map((exercise, i) => {
                        const exerciseComplete = isExerciseComplete(exercise);
                        const isExpanded = expandedExercise === exercise.id;

                        return (
                            <motion.div
                                key={exercise.id}
                                className="glass-card"
                                style={{
                                    padding: '12px 16px',
                                    background: exerciseComplete ? 'var(--accent-primary-soft)' : 'var(--glass-bg)',
                                    border: exerciseComplete ? '1px solid var(--accent-primary)' : '1px solid var(--glass-border)'
                                }}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.05 }}
                            >
                                {/* Exercise Header */}
                                <div
                                    className="flex justify-between items-center"
                                    onClick={() => setExpandedExercise(isExpanded ? null : exercise.id)}
                                    style={{ cursor: 'pointer' }}
                                >
                                    <div className="flex items-center gap-sm">
                                        {exerciseComplete ? (
                                            <motion.div
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                style={{
                                                    width: 24, height: 24,
                                                    borderRadius: '50%',
                                                    background: 'var(--accent-primary)',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                                                }}
                                            >
                                                <Check size={14} color="#000" />
                                            </motion.div>
                                        ) : (
                                            <div style={{
                                                width: 24, height: 24,
                                                borderRadius: '50%',
                                                border: '2px solid var(--glass-border)'
                                            }} />
                                        )}
                                        <span style={{
                                            fontWeight: 600,
                                            textDecoration: exerciseComplete ? 'line-through' : 'none',
                                            opacity: exerciseComplete ? 0.7 : 1
                                        }}>
                                            {exercise.name}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-sm">
                                        <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-tertiary)' }}>
                                            {exercise.sets}x{exercise.reps}
                                        </span>
                                        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                    </div>
                                </div>

                                {/* Expandable Sets */}
                                <AnimatePresence>
                                    {isExpanded && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            style={{ overflow: 'hidden' }}
                                        >
                                            <div className="flex flex-wrap gap-sm mt-md">
                                                {Array.from({ length: exercise.sets }, (_, i) => i + 1).map(setNum => {
                                                    const completed = isSetCompleted(exercise.id, setNum);
                                                    return (
                                                        <motion.button
                                                            key={setNum}
                                                            onClick={() => handleSetClick(exercise.id, setNum)}
                                                            whileTap={{ scale: 0.95 }}
                                                            style={{
                                                                padding: '8px 16px',
                                                                borderRadius: 8,
                                                                border: 'none',
                                                                background: completed
                                                                    ? 'var(--accent-primary)'
                                                                    : 'var(--glass-bg)',
                                                                color: completed ? '#000' : 'var(--text-primary)',
                                                                fontWeight: 600,
                                                                fontSize: 'var(--font-size-sm)',
                                                                cursor: completed ? 'default' : 'pointer',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                gap: '6px'
                                                            }}
                                                        >
                                                            {completed && <Check size={14} />}
                                                            Set {setNum}
                                                        </motion.button>
                                                    );
                                                })}
                                            </div>
                                            {exercise.notes && (
                                                <p style={{
                                                    fontSize: 'var(--font-size-xs)',
                                                    color: 'var(--text-tertiary)',
                                                    marginTop: 8,
                                                    fontStyle: 'italic'
                                                }}>
                                                    💡 {exercise.notes}
                                                </p>
                                            )}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        );
                    })}
                </div>

                {/* Progress Summary */}
                <div style={{
                    marginTop: 16,
                    textAlign: 'center',
                    fontSize: 'var(--font-size-sm)',
                    color: 'var(--text-tertiary)'
                }}>
                    {progress.completed} / {progress.total} sets completed
                </div>
            </motion.div>

            {/* Celebration Modal */}
            <AnimatePresence>
                {showCelebration && (
                    <motion.div
                        className="modal-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowCelebration(false)}
                    >
                        <motion.div
                            className="glass-card glass-card-elevated"
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            style={{
                                maxWidth: 340,
                                width: '100%',
                                textAlign: 'center',
                                padding: 32
                            }}
                        >
                            <motion.div
                                animate={{
                                    scale: [1, 1.2, 1],
                                    rotate: [0, 10, -10, 0]
                                }}
                                transition={{ repeat: 2, duration: 0.5 }}
                            >
                                <Trophy size={64} style={{ color: 'var(--accent-warning)' }} />
                            </motion.div>

                            <h2 style={{ marginTop: 16, marginBottom: 8 }}>
                                🏆 WORKOUT COMPLETE!
                            </h2>

                            <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>
                                Amazing discipline! You crushed it today.
                            </p>

                            {verse && (
                                <div
                                    className="glass-card"
                                    style={{
                                        background: 'var(--accent-primary-soft)',
                                        padding: 16,
                                        marginBottom: 24
                                    }}
                                >
                                    <Book size={20} style={{ color: 'var(--accent-primary)', marginBottom: 8 }} />
                                    <p style={{
                                        fontStyle: 'italic',
                                        fontSize: 'var(--font-size-sm)',
                                        marginBottom: 8,
                                        lineHeight: 1.5
                                    }}>
                                        "{verse.text}"
                                    </p>
                                    <p style={{
                                        fontSize: 'var(--font-size-xs)',
                                        color: 'var(--accent-primary)',
                                        fontWeight: 600
                                    }}>
                                        {verse.ref}
                                    </p>
                                </div>
                            )}

                            <div style={{
                                display: 'flex',
                                gap: 16,
                                justifyContent: 'center',
                                marginBottom: 16
                            }}>
                                <div>
                                    <p style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700 }}>
                                        {todayPlan.exercises?.length || 0}
                                    </p>
                                    <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)' }}>
                                        Exercises
                                    </p>
                                </div>
                                <div>
                                    <p style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700 }}>
                                        {progress.total}
                                    </p>
                                    <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)' }}>
                                        Sets
                                    </p>
                                </div>
                            </div>

                            <motion.button
                                className="btn btn-primary btn-full"
                                onClick={() => setShowCelebration(false)}
                                whileTap={{ scale: 0.98 }}
                            >
                                Continue 💪
                            </motion.button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
