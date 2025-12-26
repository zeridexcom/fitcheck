import { useState } from 'react';
import { motion } from 'framer-motion';
import { Scale, TrendingUp, Flame, Target, Check, Zap, Trophy, Calendar } from 'lucide-react';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Filler,
    Tooltip,
} from 'chart.js';
import useStore from '../stores/useStore';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip);

export default function Progress() {
    const { profile, targets, weightHistory, meals, workouts, logWeight } = useStore();

    const [showWeightModal, setShowWeightModal] = useState(false);
    const [newWeight, setNewWeight] = useState(profile.weight || 70);

    // Calculate stats
    const today = new Date().toISOString().split('T')[0];
    const last7Days = [...Array(7)].map((_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - i);
        return date.toISOString().split('T')[0];
    }).reverse();

    const weeklyCalories = last7Days.map(date => {
        const dayMeals = meals.filter(m => m.date === date);
        return dayMeals.reduce((sum, m) => sum + (m.calories || 0), 0);
    });

    const avgCalories = Math.round(weeklyCalories.reduce((a, b) => a + b, 0) / 7);

    const totalWorkouts = workouts.filter(w =>
        last7Days.includes(w.date)
    ).length;

    // Streak calculation
    const streak = (() => {
        let count = 0;
        const sortedDates = [...new Set(meals.map(m => m.date))].sort().reverse();
        const checkDate = new Date();

        for (let i = 0; i < sortedDates.length; i++) {
            const expected = new Date(checkDate);
            expected.setDate(expected.getDate() - i);
            const expectedStr = expected.toISOString().split('T')[0];

            if (sortedDates.includes(expectedStr)) {
                count++;
            } else {
                break;
            }
        }
        return count;
    })();

    // Weight chart data
    const weightData = {
        labels: weightHistory.slice(-7).map(w => {
            const date = new Date(w.date);
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        }),
        datasets: [
            {
                data: weightHistory.slice(-7).map(w => w.weight),
                borderColor: '#00FF87',
                backgroundColor: 'rgba(0, 255, 135, 0.1)',
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#00FF87',
                pointBorderColor: '#00FF87',
                pointRadius: 5,
                pointHoverRadius: 7,
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
        },
        scales: {
            x: {
                grid: { color: 'rgba(255,255,255,0.03)' },
                ticks: { color: 'rgba(255,255,255,0.35)', font: { size: 10, family: 'Outfit' } },
            },
            y: {
                grid: { color: 'rgba(255,255,255,0.03)' },
                ticks: { color: 'rgba(255,255,255,0.35)', font: { size: 10, family: 'Outfit' } },
            },
        },
    };

    const handleLogWeight = () => {
        if (newWeight > 0) {
            logWeight(newWeight);
            setShowWeightModal(false);
        }
    };

    const stats = [
        { icon: Flame, label: 'Streak', value: streak, suffix: ' days', color: 'var(--accent-warning)' },
        { icon: Zap, label: 'Avg Cal', value: avgCalories, suffix: '', color: 'var(--accent-secondary)' },
        { icon: Trophy, label: 'Workouts', value: totalWorkouts, suffix: '', color: 'var(--accent-orange)' },
        { icon: Target, label: 'Goal', value: profile.goal?.split('_')[0] || 'Set', suffix: '', color: 'var(--accent-purple)' },
    ];

    return (
        <div className="screen">
            {/* Header */}
            <motion.div
                className="screen-header"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div>
                    <h2>Progress</h2>
                    <p style={{ color: 'var(--text-tertiary)', fontSize: 'var(--font-size-sm)' }}>
                        Track your journey
                    </p>
                </div>
            </motion.div>

            {/* Stats Grid */}
            <motion.div
                className="nutrition-grid mb-lg"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
            >
                {stats.map((stat, i) => {
                    const Icon = stat.icon;
                    return (
                        <motion.div
                            key={stat.label}
                            className="nutrition-item"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 + i * 0.05 }}
                            style={{ color: stat.color }}
                        >
                            <div className="flex items-center justify-center gap-sm" style={{ marginBottom: '8px' }}>
                                <Icon size={18} />
                            </div>
                            <div className="nutrition-value" style={{ color: stat.color }}>
                                {stat.value}{stat.suffix}
                            </div>
                            <div className="nutrition-label">{stat.label}</div>
                        </motion.div>
                    );
                })}
            </motion.div>

            {/* Weight Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mb-lg"
            >
                <div className="flex justify-between items-center mb-md">
                    <h4>Weight Tracking</h4>
                    <motion.button
                        className="btn btn-secondary"
                        onClick={() => setShowWeightModal(true)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        style={{ padding: '10px 16px', fontSize: 'var(--font-size-sm)' }}
                    >
                        <Scale size={16} />
                        Log Weight
                    </motion.button>
                </div>

                <div className="glass-card">
                    {weightHistory.length > 1 ? (
                        <div style={{ height: '180px' }}>
                            <Line data={weightData} options={chartOptions} />
                        </div>
                    ) : (
                        <div className="text-center" style={{ padding: '40px 24px' }}>
                            <div className="icon-badge icon-badge-primary" style={{ margin: '0 auto 16px', width: 64, height: 64 }}>
                                <Scale size={28} />
                            </div>
                            <p style={{ color: 'var(--text-secondary)' }}>
                                Start logging your weight to see trends
                            </p>
                            <p style={{ color: 'var(--text-tertiary)', fontSize: 'var(--font-size-sm)', marginTop: '4px' }}>
                                Current: {profile.weight} kg
                            </p>
                        </div>
                    )}
                </div>
            </motion.div>

            {/* Weekly Calories */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
            >
                <div className="flex items-center gap-sm mb-md">
                    <Calendar size={18} style={{ color: 'var(--text-tertiary)' }} />
                    <h4>This Week</h4>
                </div>
                <div className="glass-card">
                    <div className="flex justify-between" style={{ height: '120px', alignItems: 'flex-end' }}>
                        {last7Days.map((date, i) => {
                            const calories = weeklyCalories[i];
                            const heightPercent = Math.min((calories / targets.calories) * 100, 100);
                            const dayName = new Date(date).toLocaleDateString('en-US', { weekday: 'short' }).charAt(0);
                            const isToday = date === today;

                            return (
                                <div
                                    key={date}
                                    className="flex flex-col items-center"
                                    style={{ flex: 1 }}
                                >
                                    <motion.div
                                        initial={{ height: 0 }}
                                        animate={{ height: `${Math.max(heightPercent, 5)}%` }}
                                        transition={{ delay: 0.4 + i * 0.05, duration: 0.5 }}
                                        style={{
                                            width: '55%',
                                            background: isToday
                                                ? 'linear-gradient(to top, var(--accent-primary), rgba(0,255,135,0.2))'
                                                : 'var(--glass-highlight)',
                                            borderRadius: '6px 6px 0 0',
                                            minHeight: '4px',
                                            boxShadow: isToday ? '0 0 20px var(--accent-primary-glow)' : 'none'
                                        }}
                                    />
                                    <span style={{
                                        fontSize: 'var(--font-size-xs)',
                                        color: isToday ? 'var(--accent-primary)' : 'var(--text-tertiary)',
                                        marginTop: '10px',
                                        fontWeight: isToday ? 600 : 400,
                                        fontFamily: 'var(--font-heading)'
                                    }}>
                                        {dayName}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                    <div className="flex justify-between mt-md" style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)' }}>
                        <span>Target: {targets.calories} kcal/day</span>
                        <span>Avg: {avgCalories} kcal</span>
                    </div>
                </div>
            </motion.div>

            {/* Weight Modal */}
            {showWeightModal && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    style={{
                        position: 'fixed',
                        inset: 0,
                        background: 'rgba(0,0,0,0.85)',
                        backdropFilter: 'blur(8px)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 200,
                        padding: '16px',
                    }}
                    onClick={() => setShowWeightModal(false)}
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="glass-card glass-card-elevated"
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            width: '100%',
                            maxWidth: '320px',
                            background: 'var(--bg-secondary)'
                        }}
                    >
                        <h3 className="mb-lg text-center">Log Weight</h3>

                        <div className="input-group mb-lg">
                            <label className="input-label">Current Weight (kg)</label>
                            <input
                                type="number"
                                className="input"
                                value={newWeight}
                                onChange={(e) => setNewWeight(parseFloat(e.target.value) || 0)}
                                min={30}
                                max={300}
                                step={0.1}
                                style={{ fontSize: 'var(--font-size-2xl)', textAlign: 'center', fontFamily: 'var(--font-heading)' }}
                            />
                        </div>

                        <motion.button
                            className="btn btn-primary btn-lg btn-full"
                            onClick={handleLogWeight}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <Check size={20} />
                            Save
                        </motion.button>
                    </motion.div>
                </motion.div>
            )}
        </div>
    );
}
