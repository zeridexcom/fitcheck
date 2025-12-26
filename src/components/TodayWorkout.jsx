import { motion } from 'framer-motion';
import { Check, Dumbbell, Info, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import useStore from '../stores/useStore';

export default function TodayWorkout() {
    const { workoutPlan, todayWorkout, completeExercise, uncompleteExercise } = useStore();
    const [expandedExercise, setExpandedExercise] = useState(null);

    // Get today's workout day
    const today = new Date().getDay(); // 0 = Sunday
    const dayIndex = today === 0 ? 6 : today - 1; // Convert to Monday = 0

    const todayPlan = workoutPlan?.days?.[dayIndex % (workoutPlan?.days?.length || 1)];

    if (!workoutPlan || !todayPlan) {
        return null; // No workout plan yet
    }

    const { completedExercises } = todayWorkout;
    const completedCount = todayPlan.exercises.filter(ex =>
        completedExercises.includes(ex.id)
    ).length;
    const totalExercises = todayPlan.exercises.length;
    const progress = (completedCount / totalExercises) * 100;

    const handleToggle = (exerciseId) => {
        if (completedExercises.includes(exerciseId)) {
            uncompleteExercise(exerciseId);
        } else {
            completeExercise(exerciseId);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card mb-lg"
            style={{ padding: '20px' }}
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-md">
                <div className="flex items-center gap-md">
                    <div className="icon-badge icon-badge-orange" style={{ width: 44, height: 44 }}>
                        <Dumbbell size={20} />
                    </div>
                    <div>
                        <h4 style={{ marginBottom: '2px' }}>Today's Workout</h4>
                        <p style={{ color: 'var(--accent-orange)', fontSize: 'var(--font-size-sm)', fontWeight: 600 }}>
                            {todayPlan.name}
                        </p>
                    </div>
                </div>
                <div style={{
                    background: 'var(--accent-primary-soft)',
                    padding: '6px 12px',
                    borderRadius: 'var(--radius-full)',
                    fontSize: 'var(--font-size-sm)',
                    fontWeight: 600,
                    color: 'var(--accent-primary)'
                }}>
                    {completedCount}/{totalExercises}
                </div>
            </div>

            {/* Progress Bar */}
            <div style={{
                height: 6,
                background: 'var(--glass-bg)',
                borderRadius: 'var(--radius-full)',
                marginBottom: '16px',
                overflow: 'hidden'
            }}>
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    style={{
                        height: '100%',
                        background: progress === 100 ? 'var(--accent-primary)' : 'var(--accent-orange)',
                        borderRadius: 'var(--radius-full)'
                    }}
                />
            </div>

            {/* Exercise List */}
            <div className="flex flex-col gap-sm">
                {todayPlan.exercises.map((exercise, i) => {
                    const isCompleted = completedExercises.includes(exercise.id);
                    const isExpanded = expandedExercise === exercise.id;

                    return (
                        <motion.div
                            key={exercise.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.05 }}
                            style={{
                                background: isCompleted ? 'rgba(0, 255, 135, 0.1)' : 'var(--glass-bg)',
                                borderRadius: 'var(--radius-md)',
                                border: isCompleted ? '1px solid rgba(0, 255, 135, 0.3)' : '1px solid var(--glass-border)',
                                overflow: 'hidden'
                            }}
                        >
                            {/* Main Row */}
                            <div
                                className="flex items-center gap-md"
                                style={{ padding: '14px 16px', cursor: 'pointer' }}
                                onClick={() => setExpandedExercise(isExpanded ? null : exercise.id)}
                            >
                                {/* Checkbox */}
                                <motion.button
                                    onClick={(e) => { e.stopPropagation(); handleToggle(exercise.id); }}
                                    whileTap={{ scale: 0.9 }}
                                    style={{
                                        width: 28,
                                        height: 28,
                                        borderRadius: '50%',
                                        background: isCompleted ? 'var(--accent-primary)' : 'transparent',
                                        border: isCompleted ? 'none' : '2px solid var(--glass-border)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        cursor: 'pointer',
                                        flexShrink: 0
                                    }}
                                >
                                    {isCompleted && <Check size={16} color="#fff" />}
                                </motion.button>

                                {/* Exercise Info */}
                                <div style={{ flex: 1 }}>
                                    <p style={{
                                        fontWeight: 600,
                                        fontSize: 'var(--font-size-sm)',
                                        textDecoration: isCompleted ? 'line-through' : 'none',
                                        opacity: isCompleted ? 0.7 : 1
                                    }}>
                                        {exercise.name}
                                    </p>
                                    <p style={{
                                        color: 'var(--text-tertiary)',
                                        fontSize: 'var(--font-size-xs)'
                                    }}>
                                        {exercise.sets} sets × {exercise.reps} • {exercise.weight}
                                    </p>
                                </div>

                                {/* Expand Icon */}
                                <div style={{ color: 'var(--text-tertiary)' }}>
                                    {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                                </div>
                            </div>

                            {/* Expanded Details */}
                            {isExpanded && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    style={{
                                        borderTop: '1px solid var(--glass-border)',
                                        padding: '12px 16px',
                                        background: 'rgba(0,0,0,0.2)'
                                    }}
                                >
                                    <div className="flex items-start gap-sm">
                                        <Info size={16} style={{ color: 'var(--accent-secondary)', marginTop: '2px' }} />
                                        <div>
                                            <p style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)', marginBottom: '4px', color: 'var(--accent-secondary)' }}>
                                                Form Tips
                                            </p>
                                            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                                                {exercise.notes}
                                            </p>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </motion.div>
                    );
                })}
            </div>

            {/* Completion Message */}
            {progress === 100 && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center"
                    style={{ marginTop: '16px', padding: '16px', background: 'rgba(0, 255, 135, 0.1)', borderRadius: 'var(--radius-md)' }}
                >
                    <span style={{ fontSize: '24px' }}>🎉</span>
                    <p style={{ color: 'var(--accent-primary)', fontWeight: 600, marginTop: '8px' }}>
                        Workout Complete! Great job!
                    </p>
                </motion.div>
            )}
        </motion.div>
    );
}
