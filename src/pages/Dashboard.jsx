import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Camera, Flame, Zap, Activity, Sparkles, Droplets, Trophy, Timer, MessageCircle, Pill, Utensils, Moon, ImagePlus, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import useStore from '../stores/useStore';
import ProgressRing from '../components/ProgressRing';
import MealCard from '../components/MealCard';
import Card3D from '../components/Card3D';
import GlowButton from '../components/GlowButton';
import TodayWorkout from '../components/TodayWorkout';
import MacroAlerts from '../components/MacroAlerts';
import DailyVerse from '../components/DailyVerse';

export default function Dashboard() {
    const navigate = useNavigate();
    const {
        profile, targets, getTodaysMeals, getTodaysTotals, deleteMeal,
        streaks, waterIntake, waterGoal, addWater, achievements, getNewAchievements,
        workoutPlan
    } = useStore();

    const [showAchievement, setShowAchievement] = useState(null);

    const todaysMeals = getTodaysMeals();
    const totals = getTodaysTotals();
    const today = new Date().toISOString().split('T')[0];
    const todayWater = waterIntake[today] || 0;
    const waterPercent = Math.min((todayWater / waterGoal) * 100, 100);

    // Check for new achievements
    useEffect(() => {
        const newAchievements = getNewAchievements();
        if (newAchievements.length > 0 && !showAchievement) {
            setShowAchievement(newAchievements[0]);
            setTimeout(() => setShowAchievement(null), 4000);
        }
    }, [achievements]);

    const caloriePercent = Math.min(Math.round((totals.calories / targets.calories) * 100), 100);
    const proteinPercent = Math.min(Math.round((totals.protein / targets.protein) * 100), 100);
    const carbsPercent = Math.min(Math.round((totals.carbs / targets.carbs) * 100), 100);
    const fatPercent = Math.min(Math.round((totals.fat / targets.fat) * 100), 100);

    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Good Morning' : hour < 18 ? 'Good Afternoon' : 'Good Evening';
    const remainingCalories = Math.max(targets.calories - totals.calories, 0);

    return (
        <div className="screen" style={{ position: 'relative', zIndex: 1 }}>
            {/* Achievement Popup */}
            <AnimatePresence>
                {showAchievement && (
                    <motion.div
                        initial={{ y: -100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -100, opacity: 0 }}
                        style={{
                            position: 'fixed',
                            top: 60,
                            left: '50%',
                            transform: 'translateX(-50%)',
                            zIndex: 1000,
                            background: 'linear-gradient(135deg, var(--accent-primary), #00CC6A)',
                            padding: '16px 24px',
                            borderRadius: 'var(--radius-full)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            boxShadow: '0 10px 40px rgba(0,255,135,0.4)',
                            color: '#fff',
                            fontWeight: 600
                        }}
                    >
                        <span style={{ fontSize: '24px' }}>{showAchievement.icon}</span>
                        <div>
                            <div style={{ fontSize: 'var(--font-size-xs)', opacity: 0.9 }}>Achievement Unlocked!</div>
                            <div>{showAchievement.name}</div>
                        </div>
                        <Trophy size={20} />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Macro Danger Zone Alerts */}
            <MacroAlerts />

            {/* Daily Bible Verse */}
            <DailyVerse compact />

            {/* Header with Streak */}
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

                {/* Streak Badge */}
                {streaks.currentStreak > 0 && (
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            background: 'linear-gradient(135deg, rgba(255, 159, 67, 0.2), transparent)',
                            padding: '8px 14px',
                            borderRadius: 'var(--radius-full)',
                            border: '1px solid rgba(255, 159, 67, 0.3)'
                        }}
                    >
                        <motion.div
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ repeat: Infinity, duration: 1 }}
                        >
                            <Flame size={18} style={{ color: 'var(--accent-orange)' }} />
                        </motion.div>
                        <span style={{ fontWeight: 700, color: 'var(--accent-orange)', fontFamily: 'var(--font-heading)' }}>
                            {streaks.currentStreak}
                        </span>
                    </motion.div>
                )}
            </motion.div>

            {/* Main Calorie Ring */}
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ delay: 0.2, type: 'spring' }}
            >
                <Card3D className="mb-lg" glowColor="var(--accent-primary)">
                    <div className="flex items-center justify-center" style={{ padding: '20px 0' }}>
                        <div style={{ position: 'relative' }}>
                            <ProgressRing
                                progress={caloriePercent}
                                size={160}
                                strokeWidth={14}
                                color="var(--accent-primary)"
                            >
                                <motion.div
                                    className="icon-badge icon-badge-primary"
                                    style={{ marginBottom: '4px', width: 36, height: 36 }}
                                    animate={{
                                        boxShadow: ['0 0 20px rgba(0,255,135,0.3)', '0 0 40px rgba(0,255,135,0.5)', '0 0 20px rgba(0,255,135,0.3)']
                                    }}
                                    transition={{ repeat: Infinity, duration: 2 }}
                                >
                                    <Flame size={18} />
                                </motion.div>
                                <motion.div
                                    style={{ fontSize: '32px', fontWeight: 700, fontFamily: 'var(--font-heading)' }}
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ delay: 0.5, type: 'spring' }}
                                >
                                    {totals.calories}
                                </motion.div>
                                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)' }}>
                                    / {targets.calories} kcal
                                </div>
                            </ProgressRing>

                            <motion.div
                                style={{
                                    position: 'absolute',
                                    top: -8,
                                    right: -8,
                                    background: 'linear-gradient(135deg, var(--accent-secondary), #0099CC)',
                                    borderRadius: 'var(--radius-full)',
                                    padding: '4px 12px',
                                    fontSize: 'var(--font-size-xs)',
                                    fontWeight: 600,
                                    color: '#fff',
                                }}
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.7 }}
                            >
                                {remainingCalories} left
                            </motion.div>
                        </div>
                    </div>

                    {/* Macro Rings */}
                    <div className="macro-rings" style={{ marginTop: '4px' }}>
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
                            >
                                <ProgressRing
                                    progress={macro.percent}
                                    size={56}
                                    strokeWidth={5}
                                    color={macro.color}
                                >
                                    <span style={{ fontSize: '11px', fontWeight: 700, fontFamily: 'var(--font-heading)' }}>
                                        {macro.value}g
                                    </span>
                                </ProgressRing>
                                <span className="macro-ring-label">{macro.label}</span>
                            </motion.div>
                        ))}
                    </div>
                </Card3D>
            </motion.div>

            {/* Quick Water Add */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="glass-card mb-lg"
                style={{ padding: '16px' }}
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-md">
                        <div className="icon-badge icon-badge-secondary" style={{ width: 40, height: 40 }}>
                            <Droplets size={18} />
                        </div>
                        <div>
                            <p style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)', marginBottom: '2px' }}>Hydration</p>
                            <p style={{ color: 'var(--text-tertiary)', fontSize: 'var(--font-size-xs)' }}>
                                {todayWater}ml / {waterGoal}ml
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-sm">
                        {/* Mini progress bar */}
                        <div style={{ width: 60, height: 6, background: 'var(--glass-bg)', borderRadius: 'var(--radius-full)' }}>
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${waterPercent}%` }}
                                style={{ height: '100%', background: 'var(--accent-secondary)', borderRadius: 'var(--radius-full)' }}
                            />
                        </div>
                        <motion.button
                            onClick={() => addWater(250)}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            style={{
                                width: 36,
                                height: 36,
                                borderRadius: '50%',
                                background: 'var(--accent-secondary)',
                                border: 'none',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#fff',
                                cursor: 'pointer'
                            }}
                        >
                            <Plus size={18} />
                        </motion.button>
                    </div>
                </div>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
                className="mb-lg"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(4, 1fr)',
                    gap: '8px'
                }}
            >
                <motion.button
                    className="glass-card"
                    onClick={() => navigate('/scanner')}
                    whileHover={{ scale: 1.03, y: -4 }}
                    whileTap={{ scale: 0.97 }}
                    style={{ padding: '14px 8px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', cursor: 'pointer', border: 'none' }}
                >
                    <div className="icon-badge icon-badge-primary" style={{ width: 36, height: 36 }}>
                        <Camera size={16} />
                    </div>
                    <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 600 }}>Scan</span>
                </motion.button>

                <motion.button
                    className="glass-card"
                    onClick={() => navigate('/fasting')}
                    whileHover={{ scale: 1.03, y: -4 }}
                    whileTap={{ scale: 0.97 }}
                    style={{ padding: '14px 8px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', cursor: 'pointer', border: 'none' }}
                >
                    <div className="icon-badge icon-badge-orange" style={{ width: 36, height: 36 }}>
                        <Timer size={16} />
                    </div>
                    <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 600 }}>Fast</span>
                </motion.button>

                <motion.button
                    className="glass-card"
                    onClick={() => navigate('/coach')}
                    whileHover={{ scale: 1.03, y: -4 }}
                    whileTap={{ scale: 0.97 }}
                    style={{ padding: '14px 8px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', cursor: 'pointer', border: 'none' }}
                >
                    <div className="icon-badge icon-badge-secondary" style={{ width: 36, height: 36 }}>
                        <Sparkles size={16} />
                    </div>
                    <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 600 }}>Coach</span>
                </motion.button>

                <motion.button
                    className="glass-card"
                    onClick={() => navigate('/supplements')}
                    whileHover={{ scale: 1.03, y: -4 }}
                    whileTap={{ scale: 0.97 }}
                    style={{ padding: '14px 8px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', cursor: 'pointer', border: 'none' }}
                >
                    <div className="icon-badge" style={{ width: 36, height: 36, background: 'rgba(236, 72, 153, 0.15)', color: '#EC4899' }}>
                        <Pill size={16} />
                    </div>
                    <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 600 }}>Supps</span>
                </motion.button>

                <motion.button
                    className="glass-card"
                    onClick={() => navigate('/meal-planner')}
                    whileHover={{ scale: 1.03, y: -4 }}
                    whileTap={{ scale: 0.97 }}
                    style={{ padding: '14px 8px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', cursor: 'pointer', border: 'none' }}
                >
                    <div className="icon-badge" style={{ width: 36, height: 36, background: 'rgba(255, 159, 67, 0.15)', color: '#FF9F43' }}>
                        <Utensils size={16} />
                    </div>
                    <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 600 }}>Meals</span>
                </motion.button>

                <motion.button
                    className="glass-card"
                    onClick={() => navigate('/sleep')}
                    whileHover={{ scale: 1.03, y: -4 }}
                    whileTap={{ scale: 0.97 }}
                    style={{ padding: '14px 8px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', cursor: 'pointer', border: 'none' }}
                >
                    <div className="icon-badge" style={{ width: 36, height: 36, background: 'rgba(99, 102, 241, 0.15)', color: '#6366F1' }}>
                        <Moon size={16} />
                    </div>
                    <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 600 }}>Sleep</span>
                </motion.button>

                <motion.button
                    className="glass-card"
                    onClick={() => navigate('/gallery')}
                    whileHover={{ scale: 1.03, y: -4 }}
                    whileTap={{ scale: 0.97 }}
                    style={{ padding: '14px 8px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', cursor: 'pointer', border: 'none' }}
                >
                    <div className="icon-badge" style={{ width: 36, height: 36, background: 'rgba(168, 85, 247, 0.15)', color: '#A855F7' }}>
                        <ImagePlus size={16} />
                    </div>
                    <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 600 }}>Photos</span>
                </motion.button>

                <motion.button
                    className="glass-card"
                    onClick={() => navigate('/prayer')}
                    whileHover={{ scale: 1.03, y: -4 }}
                    whileTap={{ scale: 0.97 }}
                    style={{ padding: '14px 8px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', cursor: 'pointer', border: 'none' }}
                >
                    <div className="icon-badge" style={{ width: 36, height: 36, background: 'rgba(255, 215, 0, 0.15)', color: '#FFD700' }}>
                        <BookOpen size={16} />
                    </div>
                    <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 600 }}>Prayer</span>
                </motion.button>
            </motion.div>

            {/* Today's Workout - if workout plan exists */}
            {workoutPlan && <TodayWorkout />}

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
                        todaysMeals.slice(0, 3).map((meal, i) => (
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
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            style={{ padding: '32px 24px' }}
                        >
                            <div className="icon-badge icon-badge-primary" style={{ margin: '0 auto 16px', width: 56, height: 56 }}>
                                <Camera size={24} />
                            </div>
                            <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>No meals logged yet</p>
                            <GlowButton onClick={() => navigate('/scanner')}>
                                <Camera size={16} />
                                Scan Food
                            </GlowButton>
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
                transition={{ delay: 0.8, type: 'spring' }}
                whileHover={{ scale: 1.15, rotate: 90 }}
                whileTap={{ scale: 0.95 }}
            >
                <Plus size={28} />
            </motion.button>
        </div>
    );
}
