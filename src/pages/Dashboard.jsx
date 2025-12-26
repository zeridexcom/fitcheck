import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Camera, Flame } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useStore from '../stores/useStore';
import ProgressRing from '../components/ProgressRing';
import MealCard from '../components/MealCard';

export default function Dashboard() {
    const navigate = useNavigate();
    const { profile, targets, getTodaysMeals, getTodaysTotals, deleteMeal } = useStore();

    const todaysMeals = getTodaysMeals();
    const totals = getTodaysTotals();

    // Calculate percentages
    const caloriePercent = Math.round((totals.calories / targets.calories) * 100);
    const proteinPercent = Math.round((totals.protein / targets.protein) * 100);
    const carbsPercent = Math.round((totals.carbs / targets.carbs) * 100);
    const fatPercent = Math.round((totals.fat / targets.fat) * 100);

    // Greeting based on time
    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Good Morning' : hour < 18 ? 'Good Afternoon' : 'Good Evening';

    return (
        <div className="screen">
            {/* Header */}
            <motion.div
                className="screen-header"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div>
                    <p style={{ color: 'var(--text-tertiary)', marginBottom: '4px' }}>{greeting}</p>
                    <h2>{profile.name || 'Champion'} 💪</h2>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <p style={{ color: 'var(--text-tertiary)', fontSize: 'var(--font-size-sm)' }}>
                        {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                    </p>
                </div>
            </motion.div>

            {/* Main Calorie Ring */}
            <motion.div
                className="glass-card mb-lg"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
            >
                <div className="flex items-center justify-center" style={{ padding: '16px 0' }}>
                    <ProgressRing
                        progress={caloriePercent}
                        size={160}
                        strokeWidth={12}
                        color="var(--accent-primary)"
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
                            <Flame size={18} style={{ color: 'var(--accent-primary)' }} />
                        </div>
                        <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700 }}>
                            {totals.calories}
                        </div>
                        <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-tertiary)' }}>
                            / {targets.calories} kcal
                        </div>
                    </ProgressRing>
                </div>

                {/* Macro Rings */}
                <div className="macro-rings">
                    <div className="macro-ring-item">
                        <ProgressRing
                            progress={proteinPercent}
                            size={60}
                            strokeWidth={5}
                            color="var(--accent-orange)"
                        >
                            <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600 }}>
                                {totals.protein}g
                            </span>
                        </ProgressRing>
                        <span className="macro-ring-label">Protein</span>
                    </div>

                    <div className="macro-ring-item">
                        <ProgressRing
                            progress={carbsPercent}
                            size={60}
                            strokeWidth={5}
                            color="var(--accent-secondary)"
                        >
                            <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600 }}>
                                {totals.carbs}g
                            </span>
                        </ProgressRing>
                        <span className="macro-ring-label">Carbs</span>
                    </div>

                    <div className="macro-ring-item">
                        <ProgressRing
                            progress={fatPercent}
                            size={60}
                            strokeWidth={5}
                            color="var(--accent-purple)"
                        >
                            <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600 }}>
                                {totals.fat}g
                            </span>
                        </ProgressRing>
                        <span className="macro-ring-label">Fat</span>
                    </div>
                </div>
            </motion.div>

            {/* Today's Meals */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
            >
                <div className="flex justify-between items-center mb-md">
                    <h4>Today's Meals</h4>
                    <motion.button
                        className="btn btn-secondary"
                        onClick={() => navigate('/scanner')}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        style={{ padding: '8px 16px', fontSize: 'var(--font-size-sm)' }}
                    >
                        <Camera size={16} />
                        Scan Food
                    </motion.button>
                </div>

                <AnimatePresence>
                    {todaysMeals.length > 0 ? (
                        todaysMeals.map(meal => (
                            <MealCard
                                key={meal.id}
                                meal={meal}
                                onDelete={deleteMeal}
                            />
                        ))
                    ) : (
                        <motion.div
                            className="glass-card text-center"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            style={{ padding: '32px' }}
                        >
                            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🍽️</div>
                            <p style={{ color: 'var(--text-secondary)' }}>
                                No meals logged today
                            </p>
                            <p style={{ color: 'var(--text-tertiary)', fontSize: 'var(--font-size-sm)', marginTop: '4px' }}>
                                Tap the + button to scan your first meal!
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>

            {/* FAB */}
            <motion.button
                className="fab"
                onClick={() => navigate('/scanner')}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: 0.4 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
            >
                <Plus size={28} />
            </motion.button>
        </div>
    );
}
