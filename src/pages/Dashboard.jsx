import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Camera, Flame, Zap, Activity, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useStore from '../stores/useStore';
import ProgressRing from '../components/ProgressRing';
import MealCard from '../components/MealCard';
import Card3D from '../components/Card3D';
import GlowButton from '../components/GlowButton';

export default function Dashboard() {
    const navigate = useNavigate();
    const { profile, targets, getTodaysMeals, getTodaysTotals, deleteMeal } = useStore();

    const todaysMeals = getTodaysMeals();
    const totals = getTodaysTotals();

    // Calculate percentages
    const caloriePercent = Math.min(Math.round((totals.calories / targets.calories) * 100), 100);
    const proteinPercent = Math.min(Math.round((totals.protein / targets.protein) * 100), 100);
    const carbsPercent = Math.min(Math.round((totals.carbs / targets.carbs) * 100), 100);
    const fatPercent = Math.min(Math.round((totals.fat / targets.fat) * 100), 100);

    // Greeting based on time
    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Good Morning' : hour < 18 ? 'Good Afternoon' : 'Good Evening';

    const remainingCalories = Math.max(targets.calories - totals.calories, 0);

    return (
        <div className="screen" style={{ position: 'relative', zIndex: 1 }}>
            {/* Header */}
            <motion.div
                className="screen-header"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div>
                    <motion.p
                        style={{ color: 'var(--text-tertiary)', marginBottom: '4px', fontSize: 'var(--font-size-sm)' }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                    >
                        {greeting}
                    </motion.p>
                    <motion.h2
                        style={{ display: 'flex', alignItems: 'center', gap: '10px' }}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        {profile.name || 'Champion'}
                        <motion.div
                            animate={{
                                rotate: [0, 15, -15, 0],
                                scale: [1, 1.2, 1]
                            }}
                            transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                        >
                            <Zap size={26} style={{ color: 'var(--accent-primary)' }} />
                        </motion.div>
                    </motion.h2>
                </div>
                <motion.div
                    style={{ textAlign: 'right' }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                >
                    <p style={{ color: 'var(--text-tertiary)', fontSize: 'var(--font-size-sm)' }}>
                        {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                    </p>
                </motion.div>
            </motion.div>

            {/* Main Calorie Ring - 3D Card */}
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ delay: 0.2, type: 'spring' }}
            >
                <Card3D className="mb-lg" glowColor="var(--accent-primary)">
                    <div className="flex items-center justify-center" style={{ padding: '24px 0' }}>
                        <div style={{ position: 'relative' }}>
                            <ProgressRing
                                progress={caloriePercent}
                                size={180}
                                strokeWidth={16}
                                color="var(--accent-primary)"
                            >
                                <motion.div
                                    className="icon-badge icon-badge-primary"
                                    style={{ marginBottom: '6px', width: 40, height: 40 }}
                                    animate={{
                                        boxShadow: ['0 0 20px rgba(0,255,135,0.3)', '0 0 40px rgba(0,255,135,0.5)', '0 0 20px rgba(0,255,135,0.3)']
                                    }}
                                    transition={{ repeat: Infinity, duration: 2 }}
                                >
                                    <Flame size={20} />
                                </motion.div>
                                <motion.div
                                    style={{ fontSize: '36px', fontWeight: 700, fontFamily: 'var(--font-heading)' }}
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ delay: 0.5, type: 'spring' }}
                                >
                                    {totals.calories}
                                </motion.div>
                                <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-tertiary)' }}>
                                    / {targets.calories} kcal
                                </div>
                            </ProgressRing>

                            {/* Floating indicator */}
                            <motion.div
                                style={{
                                    position: 'absolute',
                                    top: -10,
                                    right: -10,
                                    background: 'linear-gradient(135deg, var(--accent-secondary), #0099CC)',
                                    borderRadius: 'var(--radius-full)',
                                    padding: '6px 14px',
                                    fontSize: 'var(--font-size-xs)',
                                    fontWeight: 600,
                                    color: '#000',
                                    boxShadow: '0 4px 20px rgba(0, 212, 255, 0.4)'
                                }}
                                initial={{ scale: 0, rotate: -20 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ delay: 0.7, type: 'spring' }}
                            >
                                {remainingCalories} left
                            </motion.div>
                        </div>
                    </div>

                    {/* Macro Rings */}
                    <div className="macro-rings" style={{ marginTop: '8px' }}>
                        {[
                            { label: 'Protein', value: totals.protein, target: targets.protein, percent: proteinPercent, color: 'var(--accent-orange)' },
                            { label: 'Carbs', value: totals.carbs, target: targets.carbs, percent: carbsPercent, color: 'var(--accent-secondary)' },
                            { label: 'Fat', value: totals.fat, target: targets.fat, percent: fatPercent, color: 'var(--accent-purple)' },
                        ].map((macro, i) => (
                            <motion.div
                                key={macro.label}
                                className="macro-ring-item"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 + i * 0.1 }}
                                whileHover={{ scale: 1.1 }}
                            >
                                <ProgressRing
                                    progress={macro.percent}
                                    size={68}
                                    strokeWidth={6}
                                    color={macro.color}
                                >
                                    <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 700, fontFamily: 'var(--font-heading)' }}>
                                        {macro.value}g
                                    </span>
                                </ProgressRing>
                                <span className="macro-ring-label">{macro.label}</span>
                            </motion.div>
                        ))}
                    </div>
                </Card3D>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
                className="flex gap-md mb-lg"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
            >
                <motion.button
                    className="glass-card flex-1"
                    onClick={() => navigate('/scanner')}
                    whileHover={{ scale: 1.03, y: -4 }}
                    whileTap={{ scale: 0.97 }}
                    style={{
                        padding: '18px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '10px',
                        cursor: 'pointer',
                        border: 'none'
                    }}
                >
                    <motion.div
                        className="icon-badge icon-badge-primary"
                        animate={{
                            boxShadow: ['0 0 15px rgba(0,255,135,0.2)', '0 0 30px rgba(0,255,135,0.4)', '0 0 15px rgba(0,255,135,0.2)']
                        }}
                        transition={{ repeat: Infinity, duration: 2 }}
                    >
                        <Camera size={22} />
                    </motion.div>
                    <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, fontFamily: 'var(--font-heading)' }}>
                        Scan Food
                    </span>
                </motion.button>

                <motion.button
                    className="glass-card flex-1"
                    onClick={() => navigate('/workout')}
                    whileHover={{ scale: 1.03, y: -4 }}
                    whileTap={{ scale: 0.97 }}
                    style={{
                        padding: '18px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '10px',
                        cursor: 'pointer',
                        border: 'none'
                    }}
                >
                    <div className="icon-badge icon-badge-secondary">
                        <Activity size={22} />
                    </div>
                    <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, fontFamily: 'var(--font-heading)' }}>
                        Workout
                    </span>
                </motion.button>

                <motion.button
                    className="glass-card flex-1"
                    onClick={() => navigate('/coach')}
                    whileHover={{ scale: 1.03, y: -4 }}
                    whileTap={{ scale: 0.97 }}
                    style={{
                        padding: '18px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '10px',
                        cursor: 'pointer',
                        border: 'none'
                    }}
                >
                    <div className="icon-badge icon-badge-purple">
                        <Sparkles size={22} />
                    </div>
                    <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, fontFamily: 'var(--font-heading)' }}>
                        AI Coach
                    </span>
                </motion.button>
            </motion.div>

            {/* Today's Meals */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
            >
                <div className="flex justify-between items-center mb-md">
                    <h4>Today's Meals</h4>
                    <span style={{ color: 'var(--text-tertiary)', fontSize: 'var(--font-size-sm)' }}>
                        {todaysMeals.length} logged
                    </span>
                </div>

                <AnimatePresence>
                    {todaysMeals.length > 0 ? (
                        todaysMeals.map((meal, i) => (
                            <motion.div
                                key={meal.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.1 }}
                            >
                                <MealCard meal={meal} onDelete={deleteMeal} />
                            </motion.div>
                        ))
                    ) : (
                        <motion.div
                            className="glass-card text-center"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            style={{ padding: '48px 24px' }}
                        >
                            <motion.div
                                className="icon-badge icon-badge-primary"
                                style={{ margin: '0 auto 20px', width: 72, height: 72 }}
                                animate={{
                                    y: [0, -8, 0],
                                    boxShadow: ['0 0 30px rgba(0,255,135,0.2)', '0 0 50px rgba(0,255,135,0.4)', '0 0 30px rgba(0,255,135,0.2)']
                                }}
                                transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                            >
                                <Camera size={32} />
                            </motion.div>
                            <p style={{ color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: 500 }}>
                                No meals logged today
                            </p>
                            <p style={{ color: 'var(--text-tertiary)', fontSize: 'var(--font-size-sm)' }}>
                                Tap below to scan your first meal!
                            </p>
                            <motion.div style={{ marginTop: '24px' }}>
                                <GlowButton onClick={() => navigate('/scanner')} className="btn-lg">
                                    <Camera size={18} />
                                    Scan Food Now
                                </GlowButton>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>

            {/* FAB */}
            <motion.button
                className="fab"
                onClick={() => navigate('/scanner')}
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.8, type: 'spring', stiffness: 200 }}
                whileHover={{ scale: 1.15, rotate: 90 }}
                whileTap={{ scale: 0.95 }}
                style={{
                    boxShadow: '0 8px 40px rgba(0, 255, 135, 0.5)'
                }}
            >
                <Plus size={30} strokeWidth={2.5} />
            </motion.button>
        </div>
    );
}
