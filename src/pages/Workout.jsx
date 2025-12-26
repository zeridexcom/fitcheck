import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Dumbbell, Clock, Flame, X, Check } from 'lucide-react';
import useStore from '../stores/useStore';

const exerciseCategories = [
    {
        name: 'Cardio',
        emoji: '🏃',
        exercises: [
            { name: 'Running', caloriesPerMin: 10 },
            { name: 'Walking', caloriesPerMin: 4 },
            { name: 'Cycling', caloriesPerMin: 8 },
            { name: 'Jump Rope', caloriesPerMin: 12 },
            { name: 'Swimming', caloriesPerMin: 9 },
        ]
    },
    {
        name: 'Strength',
        emoji: '💪',
        exercises: [
            { name: 'Push-ups', caloriesPerMin: 7 },
            { name: 'Squats', caloriesPerMin: 8 },
            { name: 'Lunges', caloriesPerMin: 6 },
            { name: 'Planks', caloriesPerMin: 4 },
            { name: 'Deadlifts', caloriesPerMin: 8 },
            { name: 'Bench Press', caloriesPerMin: 6 },
        ]
    },
    {
        name: 'Flexibility',
        emoji: '🧘',
        exercises: [
            { name: 'Yoga', caloriesPerMin: 3 },
            { name: 'Stretching', caloriesPerMin: 2 },
            { name: 'Pilates', caloriesPerMin: 4 },
        ]
    },
];

export default function Workout() {
    const { workouts, addWorkout } = useStore();

    const [showModal, setShowModal] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [selectedExercise, setSelectedExercise] = useState(null);
    const [duration, setDuration] = useState(30);

    const todaysWorkouts = workouts.filter(
        w => w.date === new Date().toISOString().split('T')[0]
    );

    const totalCaloriesBurned = todaysWorkouts.reduce(
        (sum, w) => sum + (w.caloriesBurned || 0), 0
    );

    const handleAddWorkout = () => {
        if (selectedExercise && duration > 0) {
            const caloriesBurned = Math.round(selectedExercise.caloriesPerMin * duration);
            addWorkout({
                exercise: selectedExercise.name,
                category: selectedCategory.name,
                duration,
                caloriesBurned,
            });
            setShowModal(false);
            setSelectedCategory(null);
            setSelectedExercise(null);
            setDuration(30);
        }
    };

    return (
        <div className="screen">
            {/* Header */}
            <motion.div
                className="screen-header"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div>
                    <h2>Workouts</h2>
                    <p style={{ color: 'var(--text-tertiary)', fontSize: 'var(--font-size-sm)' }}>
                        Track your exercises
                    </p>
                </div>
            </motion.div>

            {/* Today's Summary */}
            <motion.div
                className="glass-card mb-lg"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
            >
                <div className="flex justify-between items-center">
                    <div>
                        <p style={{ color: 'var(--text-tertiary)', fontSize: 'var(--font-size-sm)' }}>
                            Today's Activity
                        </p>
                        <h3 style={{ color: 'var(--accent-primary)' }}>
                            {totalCaloriesBurned} kcal burned
                        </h3>
                    </div>
                    <div className="flex items-center gap-sm">
                        <Dumbbell size={20} style={{ color: 'var(--text-tertiary)' }} />
                        <span style={{ fontSize: 'var(--font-size-lg)', fontWeight: 600 }}>
                            {todaysWorkouts.length}
                        </span>
                    </div>
                </div>
            </motion.div>

            {/* Exercise Categories */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
            >
                <h4 className="mb-md">Quick Add</h4>
                <div className="flex gap-md mb-lg" style={{ overflowX: 'auto', paddingBottom: '8px' }}>
                    {exerciseCategories.map((cat) => (
                        <motion.button
                            key={cat.name}
                            className="glass-card"
                            onClick={() => {
                                setSelectedCategory(cat);
                                setShowModal(true);
                            }}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            style={{
                                padding: '16px 24px',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '8px',
                                minWidth: '100px',
                                cursor: 'pointer'
                            }}
                        >
                            <span style={{ fontSize: '28px' }}>{cat.emoji}</span>
                            <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 500 }}>
                                {cat.name}
                            </span>
                        </motion.button>
                    ))}
                </div>
            </motion.div>

            {/* Today's Workouts */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
            >
                <h4 className="mb-md">Today's Workouts</h4>

                <AnimatePresence>
                    {todaysWorkouts.length > 0 ? (
                        todaysWorkouts.map((workout, i) => (
                            <motion.div
                                key={workout.id}
                                className="glass-card mb-md"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.1 }}
                                style={{ padding: '16px' }}
                            >
                                <div className="flex justify-between items-center">
                                    <div>
                                        <h4 style={{ marginBottom: '4px' }}>{workout.exercise}</h4>
                                        <div className="flex gap-md" style={{ color: 'var(--text-tertiary)', fontSize: 'var(--font-size-sm)' }}>
                                            <span className="flex items-center gap-sm">
                                                <Clock size={14} /> {workout.duration} min
                                            </span>
                                            <span className="flex items-center gap-sm">
                                                <Flame size={14} /> {workout.caloriesBurned} kcal
                                            </span>
                                        </div>
                                    </div>
                                    <span style={{
                                        background: 'var(--glass-bg)',
                                        padding: '4px 12px',
                                        borderRadius: 'var(--radius-full)',
                                        fontSize: 'var(--font-size-xs)',
                                        color: 'var(--text-tertiary)'
                                    }}>
                                        {workout.category}
                                    </span>
                                </div>
                            </motion.div>
                        ))
                    ) : (
                        <motion.div
                            className="glass-card text-center"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            style={{ padding: '32px' }}
                        >
                            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🏋️</div>
                            <p style={{ color: 'var(--text-secondary)' }}>
                                No workouts logged today
                            </p>
                            <p style={{ color: 'var(--text-tertiary)', fontSize: 'var(--font-size-sm)', marginTop: '4px' }}>
                                Tap a category above to add your first workout!
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>

            {/* FAB */}
            <motion.button
                className="fab"
                onClick={() => setShowModal(true)}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: 0.4 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
            >
                <Plus size={28} />
            </motion.button>

            {/* Modal */}
            <AnimatePresence>
                {showModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{
                            position: 'fixed',
                            inset: 0,
                            background: 'rgba(0,0,0,0.8)',
                            display: 'flex',
                            alignItems: 'flex-end',
                            justifyContent: 'center',
                            zIndex: 200,
                            padding: '16px',
                        }}
                        onClick={() => setShowModal(false)}
                    >
                        <motion.div
                            initial={{ y: '100%' }}
                            animate={{ y: 0 }}
                            exit={{ y: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                            className="glass-card glass-card-elevated"
                            onClick={(e) => e.stopPropagation()}
                            style={{
                                width: '100%',
                                maxWidth: '400px',
                                maxHeight: '80vh',
                                overflow: 'auto',
                                background: 'var(--bg-secondary)'
                            }}
                        >
                            <div className="flex justify-between items-center mb-lg">
                                <h3>Add Workout</h3>
                                <motion.button
                                    className="btn btn-ghost btn-icon"
                                    onClick={() => setShowModal(false)}
                                    whileTap={{ scale: 0.9 }}
                                >
                                    <X size={20} />
                                </motion.button>
                            </div>

                            {!selectedCategory ? (
                                <div className="flex flex-col gap-md">
                                    {exerciseCategories.map((cat) => (
                                        <motion.button
                                            key={cat.name}
                                            className="glass-card"
                                            onClick={() => setSelectedCategory(cat)}
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            style={{
                                                padding: '16px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '16px',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            <span style={{ fontSize: '32px' }}>{cat.emoji}</span>
                                            <span style={{ fontWeight: 500 }}>{cat.name}</span>
                                        </motion.button>
                                    ))}
                                </div>
                            ) : !selectedExercise ? (
                                <div className="flex flex-col gap-md">
                                    <motion.button
                                        className="btn btn-ghost"
                                        onClick={() => setSelectedCategory(null)}
                                        whileTap={{ scale: 0.95 }}
                                        style={{ alignSelf: 'flex-start', marginBottom: '8px' }}
                                    >
                                        ← Back
                                    </motion.button>

                                    {selectedCategory.exercises.map((ex) => (
                                        <motion.button
                                            key={ex.name}
                                            className="glass-card"
                                            onClick={() => setSelectedExercise(ex)}
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            style={{
                                                padding: '16px',
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            <span style={{ fontWeight: 500 }}>{ex.name}</span>
                                            <span style={{ color: 'var(--text-tertiary)', fontSize: 'var(--font-size-sm)' }}>
                                                ~{ex.caloriesPerMin} kcal/min
                                            </span>
                                        </motion.button>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col gap-lg">
                                    <motion.button
                                        className="btn btn-ghost"
                                        onClick={() => setSelectedExercise(null)}
                                        whileTap={{ scale: 0.95 }}
                                        style={{ alignSelf: 'flex-start' }}
                                    >
                                        ← Back
                                    </motion.button>

                                    <div className="text-center">
                                        <h4>{selectedExercise.name}</h4>
                                        <p style={{ color: 'var(--text-tertiary)' }}>
                                            {selectedCategory.name}
                                        </p>
                                    </div>

                                    <div className="input-group">
                                        <label className="input-label">Duration (minutes)</label>
                                        <input
                                            type="number"
                                            className="input"
                                            value={duration}
                                            onChange={(e) => setDuration(parseInt(e.target.value) || 0)}
                                            min={1}
                                            max={300}
                                        />
                                    </div>

                                    <div className="glass-card text-center" style={{ padding: '16px' }}>
                                        <p style={{ color: 'var(--text-tertiary)', marginBottom: '4px' }}>
                                            Estimated calories burned
                                        </p>
                                        <h2 style={{ color: 'var(--accent-primary)' }}>
                                            {Math.round(selectedExercise.caloriesPerMin * duration)} kcal
                                        </h2>
                                    </div>

                                    <motion.button
                                        className="btn btn-primary btn-lg btn-full"
                                        onClick={handleAddWorkout}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        <Check size={20} />
                                        Log Workout
                                    </motion.button>
                                </div>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
