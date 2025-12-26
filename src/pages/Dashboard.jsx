import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Camera, Flame, Zap, ChevronRight } from 'lucide-react';
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
                    <p style={{ color: 'var(--text-tertiary)', marginBottom: '4px', fontSize: 'var(--font-size-sm)' }}>
                        {greeting}
                    </p>
                    <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {profile.name || 'Champion'}
                        <Zap size={24} style={{ color: 'var(--accent-primary)' }} />
                    </h2>
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
                <div className="flex items-center justify-center" style={{ padding: '20px 0' }}>
                    <ProgressRing
                        progress={caloriePercent}
                        size={170}
                        strokeWidth={14}
                        color="var(--accent-primary)"
                    >
                        <div className="icon-badge icon-badge-primary" style={{ marginBottom: '4px', width: 36, height: 36 }}>
                            <Flame size={18} />
                        </div>
                        <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700, fontFamily: 'var(--font-heading)' }}>
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
                            size={64}
                            strokeWidth={5}
                            color="var(--accent-orange)"
                        >
                            <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, fontFamily: 'var(--font-heading)' }}>
                                {totals.protein}g
                            </span>
                        </ProgressRing>
                        <span className="macro-ring-label">Protein</span>
                    </div>

                    <div className="macro-ring-item">
                        <ProgressRing
                            progress={carbsPercent}
                            size={64}
                            strokeWidth={5}
                            color="var(--accent-secondary)"
                        >
                            <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, fontFamily: 'var(--font-heading)' }}>
                                {totals.carbs}g
                            </span>
                        </ProgressRing>
                        <span className="macro-ring-label">Carbs</span>
                    </div>

                    <div className="macro-ring-item">
                        <ProgressRing
                            progress={fatPercent}
                            size={64}
                            strokeWidth={5}
                            color="var(--accent-purple)"
                        >
                            <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, fontFamily: 'var(--font-heading)' }}>
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
                        style={{ padding: '10px 16px', fontSize: 'var(--font-size-sm)' }}
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
                            style={{ padding: '40px 24px' }}
                        >
                            <div className="icon-badge icon-badge-primary" style={{ margin: '0 auto 16px', width: 64, height: 64 }}>
                                <Camera size={28} />
                            </div>
                            <p style={{ color: 'var(--text-secondary)', marginBottom: '4px' }}>
                                No meals logged today
                            </p>
                            <p style={{ color: 'var(--text-tertiary)', fontSize: 'var(--font-size-sm)' }}>
                                Tap the + button to scan your first meal
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
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.95 }}
            >
                <Plus size={28} strokeWidth={2.5} />
            </motion.button>
        </div>
    );
}
