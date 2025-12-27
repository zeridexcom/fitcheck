import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Scale, TrendingUp, Flame, Target, Check, Zap, Trophy, Calendar, Ruler, Activity, X, ChevronRight } from 'lucide-react';
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
import annotationPlugin from 'chartjs-plugin-annotation';
import useStore from '../stores/useStore';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip, annotationPlugin);

export default function Progress() {
    const {
        profile, targets, weightHistory, meals, workouts, logWeight,
        setTargetWeight, bodyMeasurements, logBodyMeasurements, bodyFatHistory,
        getWeightProjection
    } = useStore();

    const [showWeightModal, setShowWeightModal] = useState(false);
    const [showTargetModal, setShowTargetModal] = useState(false);
    const [showBodyFatModal, setShowBodyFatModal] = useState(false);
    const [newWeight, setNewWeight] = useState(profile.weight || 70);
    const [newTargetWeight, setNewTargetWeight] = useState(profile.targetWeight || profile.weight - 5);
    const [measurements, setMeasurements] = useState({
        waist: bodyMeasurements.waist || '',
        neck: bodyMeasurements.neck || '',
        hip: bodyMeasurements.hip || '',
    });

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

    // Weight projection
    const projection = getWeightProjection();
    const latestBodyFat = bodyFatHistory.length > 0 ? bodyFatHistory[bodyFatHistory.length - 1] : null;

    // Weight chart data with target line
    const recentWeights = weightHistory.slice(-7);
    const weightData = {
        labels: recentWeights.map(w => {
            const date = new Date(w.date);
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        }),
        datasets: [
            {
                label: 'Weight',
                data: recentWeights.map(w => w.weight),
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

    // Add target weight line if set
    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            annotation: profile.targetWeight ? {
                annotations: {
                    targetLine: {
                        type: 'line',
                        yMin: profile.targetWeight,
                        yMax: profile.targetWeight,
                        borderColor: 'rgba(255, 99, 132, 0.8)',
                        borderWidth: 2,
                        borderDash: [6, 4],
                        label: {
                            display: true,
                            content: `Goal: ${profile.targetWeight} kg`,
                            position: 'end',
                            backgroundColor: 'rgba(255, 99, 132, 0.8)',
                            font: { size: 10, family: 'Outfit' },
                            padding: 4
                        }
                    }
                }
            } : {}
        },
        scales: {
            x: {
                grid: { color: 'rgba(255,255,255,0.03)' },
                ticks: { color: 'rgba(255,255,255,0.35)', font: { size: 10, family: 'Outfit' } },
            },
            y: {
                grid: { color: 'rgba(255,255,255,0.03)' },
                ticks: { color: 'rgba(255,255,255,0.35)', font: { size: 10, family: 'Outfit' } },
                suggestedMin: profile.targetWeight ? Math.min(profile.targetWeight - 2, ...recentWeights.map(w => w.weight)) : undefined,
                suggestedMax: profile.targetWeight ? Math.max(profile.targetWeight + 2, ...recentWeights.map(w => w.weight)) : undefined,
            },
        },
    };

    const handleLogWeight = () => {
        if (newWeight > 0) {
            logWeight(newWeight);
            setShowWeightModal(false);
        }
    };

    const handleSetTarget = () => {
        if (newTargetWeight > 0) {
            setTargetWeight(newTargetWeight);
            setShowTargetModal(false);
        }
    };

    const handleLogBodyFat = () => {
        if (measurements.waist && measurements.neck) {
            logBodyMeasurements({
                waist: parseFloat(measurements.waist),
                neck: parseFloat(measurements.neck),
                hip: measurements.hip ? parseFloat(measurements.hip) : null,
            });
            setShowBodyFatModal(false);
        }
    };

    const stats = [
        { icon: Flame, label: 'Streak', value: streak, suffix: ' days', color: 'var(--accent-warning)' },
        { icon: Zap, label: 'Avg Cal', value: avgCalories, suffix: '', color: 'var(--accent-secondary)' },
        { icon: Trophy, label: 'Workouts', value: totalWorkouts, suffix: '', color: 'var(--accent-orange)' },
        { icon: Activity, label: 'Body Fat', value: latestBodyFat ? latestBodyFat.percentage : '--', suffix: latestBodyFat ? '%' : '', color: 'var(--accent-purple)' },
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
                            style={{ color: stat.color, cursor: stat.label === 'Body Fat' ? 'pointer' : 'default' }}
                            onClick={() => stat.label === 'Body Fat' && setShowBodyFatModal(true)}
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
                    <div className="flex gap-sm">
                        <motion.button
                            className="btn btn-ghost"
                            onClick={() => setShowTargetModal(true)}
                            whileTap={{ scale: 0.95 }}
                            style={{ padding: '8px 12px', fontSize: 'var(--font-size-xs)' }}
                        >
                            <Target size={14} />
                            Set Goal
                        </motion.button>
                        <motion.button
                            className="btn btn-secondary"
                            onClick={() => setShowWeightModal(true)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            style={{ padding: '10px 16px', fontSize: 'var(--font-size-sm)' }}
                        >
                            <Scale size={16} />
                            Log
                        </motion.button>
                    </div>
                </div>

                {/* Goal Projection Card */}
                {profile.targetWeight && (
                    <motion.div
                        className="glass-card mb-md"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        style={{
                            background: 'linear-gradient(135deg, rgba(255, 99, 132, 0.1), rgba(0, 255, 135, 0.05))',
                            border: '1px solid rgba(255, 99, 132, 0.3)',
                            padding: '16px'
                        }}
                    >
                        <div className="flex justify-between items-center">
                            <div>
                                <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)', marginBottom: '4px' }}>
                                    Target Weight
                                </p>
                                <p style={{ fontSize: 'var(--font-size-xl)', fontWeight: 600, fontFamily: 'var(--font-heading)' }}>
                                    {profile.targetWeight} kg
                                </p>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                {projection && projection.weeksToGoal ? (
                                    <>
                                        <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)', marginBottom: '4px' }}>
                                            Reach goal in
                                        </p>
                                        <p style={{ fontSize: 'var(--font-size-lg)', fontWeight: 600, color: 'var(--accent-primary)' }}>
                                            ~{projection.weeksToGoal} weeks
                                        </p>
                                        <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)' }}>
                                            {projection.projectedDate}
                                        </p>
                                    </>
                                ) : (
                                    <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
                                        {projection?.message || 'Log more weight data'}
                                    </p>
                                )}
                            </div>
                        </div>
                        {projection && projection.weeklyChange && (
                            <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid var(--glass-border)' }}>
                                <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)' }}>
                                    Avg change: <span style={{ color: projection.weeklyChange < 0 ? 'var(--accent-primary)' : 'var(--accent-warning)' }}>
                                        {projection.weeklyChange > 0 ? '+' : ''}{projection.weeklyChange} kg/week
                                    </span>
                                </p>
                            </div>
                        )}
                    </motion.div>
                )}

                <div className="glass-card">
                    {weightHistory.length > 1 ? (
                        <div style={{ height: '200px' }}>
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

            {/* Body Fat Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="mb-lg"
            >
                <div className="flex justify-between items-center mb-md">
                    <h4>Body Composition</h4>
                    <motion.button
                        className="btn btn-secondary"
                        onClick={() => setShowBodyFatModal(true)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        style={{ padding: '10px 16px', fontSize: 'var(--font-size-sm)' }}
                    >
                        <Ruler size={16} />
                        Measure
                    </motion.button>
                </div>

                <div className="glass-card">
                    {latestBodyFat ? (
                        <div className="flex justify-between items-center">
                            <div>
                                <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)', marginBottom: '4px' }}>
                                    Body Fat %
                                </p>
                                <p style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700, fontFamily: 'var(--font-heading)', color: 'var(--accent-purple)' }}>
                                    {latestBodyFat.percentage}%
                                </p>
                                <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)', marginTop: '4px' }}>
                                    Last measured: {new Date(latestBodyFat.date).toLocaleDateString()}
                                </p>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)' }}>
                                    Waist: {latestBodyFat.measurements.waist} cm
                                </p>
                                <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)' }}>
                                    Neck: {latestBodyFat.measurements.neck} cm
                                </p>
                                {latestBodyFat.measurements.hip && (
                                    <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)' }}>
                                        Hip: {latestBodyFat.measurements.hip} cm
                                    </p>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="text-center" style={{ padding: '32px 24px' }}>
                            <div className="icon-badge" style={{ margin: '0 auto 16px', width: 56, height: 56, background: 'rgba(168, 85, 247, 0.2)', color: 'var(--accent-purple)' }}>
                                <Activity size={24} />
                            </div>
                            <p style={{ color: 'var(--text-secondary)', marginBottom: '4px' }}>
                                Track your body fat %
                            </p>
                            <p style={{ color: 'var(--text-tertiary)', fontSize: 'var(--font-size-xs)' }}>
                                Measure waist & neck to calculate
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
            <AnimatePresence>
                {showWeightModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="modal-overlay"
                        onClick={() => setShowWeightModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="glass-card glass-card-elevated modal-content"
                            onClick={(e) => e.stopPropagation()}
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
                                whileTap={{ scale: 0.98 }}
                            >
                                <Check size={20} />
                                Save
                            </motion.button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Target Weight Modal */}
            <AnimatePresence>
                {showTargetModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="modal-overlay"
                        onClick={() => setShowTargetModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="glass-card glass-card-elevated modal-content"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h3 className="mb-lg text-center">Set Goal Weight</h3>
                            <p style={{ color: 'var(--text-secondary)', textAlign: 'center', marginBottom: '24px', fontSize: 'var(--font-size-sm)' }}>
                                What weight do you want to reach?
                            </p>
                            <div className="input-group mb-lg">
                                <label className="input-label">Target Weight (kg)</label>
                                <input
                                    type="number"
                                    className="input"
                                    value={newTargetWeight}
                                    onChange={(e) => setNewTargetWeight(parseFloat(e.target.value) || 0)}
                                    min={30}
                                    max={300}
                                    step={0.5}
                                    style={{ fontSize: 'var(--font-size-2xl)', textAlign: 'center', fontFamily: 'var(--font-heading)' }}
                                />
                            </div>
                            <motion.button
                                className="btn btn-primary btn-lg btn-full"
                                onClick={handleSetTarget}
                                whileTap={{ scale: 0.98 }}
                            >
                                <Target size={20} />
                                Set Goal
                            </motion.button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Body Fat Modal */}
            <AnimatePresence>
                {showBodyFatModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="modal-overlay"
                        onClick={() => setShowBodyFatModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="glass-card glass-card-elevated modal-content"
                            onClick={(e) => e.stopPropagation()}
                            style={{ maxWidth: '360px' }}
                        >
                            <div className="flex justify-between items-center mb-lg">
                                <h3>Body Measurements</h3>
                                <button
                                    className="btn btn-ghost btn-icon"
                                    onClick={() => setShowBodyFatModal(false)}
                                    style={{ marginRight: '-8px' }}
                                >
                                    <X size={20} />
                                </button>
                            </div>
                            <p style={{ color: 'var(--text-secondary)', marginBottom: '20px', fontSize: 'var(--font-size-sm)' }}>
                                Measure with a tape (in cm) for accurate body fat calculation.
                            </p>

                            <div className="input-group mb-md">
                                <label className="input-label">Waist (cm) *</label>
                                <input
                                    type="number"
                                    className="input"
                                    placeholder="e.g. 85"
                                    value={measurements.waist}
                                    onChange={(e) => setMeasurements({ ...measurements, waist: e.target.value })}
                                    min={40}
                                    max={200}
                                    step={0.5}
                                />
                            </div>

                            <div className="input-group mb-md">
                                <label className="input-label">Neck (cm) *</label>
                                <input
                                    type="number"
                                    className="input"
                                    placeholder="e.g. 38"
                                    value={measurements.neck}
                                    onChange={(e) => setMeasurements({ ...measurements, neck: e.target.value })}
                                    min={20}
                                    max={60}
                                    step={0.5}
                                />
                            </div>

                            {profile.gender === 'female' && (
                                <div className="input-group mb-md">
                                    <label className="input-label">Hip (cm) *</label>
                                    <input
                                        type="number"
                                        className="input"
                                        placeholder="e.g. 95"
                                        value={measurements.hip}
                                        onChange={(e) => setMeasurements({ ...measurements, hip: e.target.value })}
                                        min={50}
                                        max={200}
                                        step={0.5}
                                    />
                                </div>
                            )}

                            <motion.button
                                className="btn btn-primary btn-lg btn-full"
                                onClick={handleLogBodyFat}
                                disabled={!measurements.waist || !measurements.neck || (profile.gender === 'female' && !measurements.hip)}
                                whileTap={{ scale: 0.98 }}
                                style={{ marginTop: '8px' }}
                            >
                                <Activity size={20} />
                                Calculate Body Fat %
                            </motion.button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
