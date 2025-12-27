import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Moon, Sun, Clock, Star, TrendingUp, Check, X, Target, ChevronLeft, ChevronRight } from 'lucide-react';
import useStore from '../stores/useStore';

const QUALITY_LABELS = ['', 'Terrible', 'Poor', 'Okay', 'Good', 'Excellent'];
const QUALITY_COLORS = ['', '#FF5E5E', '#FF9F43', '#FFD93D', '#00D4FF', '#00FF87'];

export default function Sleep() {
    const { sleepHistory, sleepGoal, logSleep, setSleepGoal, getWeeklySleepStats } = useStore();

    const [showLogModal, setShowLogModal] = useState(false);
    const [showGoalModal, setShowGoalModal] = useState(false);
    const [bedtime, setBedtime] = useState('23:00');
    const [wakeTime, setWakeTime] = useState('07:00');
    const [quality, setQuality] = useState(4);
    const [notes, setNotes] = useState('');

    const weeklyStats = getWeeklySleepStats();
    const lastNight = sleepHistory.length > 0 ? sleepHistory[sleepHistory.length - 1] : null;

    const calculateDuration = (bed, wake) => {
        const [bedH, bedM] = bed.split(':').map(Number);
        const [wakeH, wakeM] = wake.split(':').map(Number);

        let bedMinutes = bedH * 60 + bedM;
        let wakeMinutes = wakeH * 60 + wakeM;

        // If wake time is before bedtime, add 24 hours
        if (wakeMinutes < bedMinutes) {
            wakeMinutes += 24 * 60;
        }

        const durationMinutes = wakeMinutes - bedMinutes;
        return Math.round((durationMinutes / 60) * 10) / 10;
    };

    const duration = calculateDuration(bedtime, wakeTime);

    const handleLogSleep = () => {
        logSleep({
            bedtime,
            wakeTime,
            duration,
            quality,
            notes
        });
        setShowLogModal(false);
        setNotes('');
    };

    const handleSetGoal = (newGoal) => {
        setSleepGoal(newGoal);
        setShowGoalModal(false);
    };

    const formatDuration = (hours) => {
        const h = Math.floor(hours);
        const m = Math.round((hours - h) * 60);
        return `${h}h ${m}m`;
    };

    return (
        <div className="screen">
            {/* Header */}
            <motion.div
                className="screen-header"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div className="flex items-center gap-md">
                    <div className="icon-badge" style={{ width: 48, height: 48, background: 'rgba(99, 102, 241, 0.15)', color: '#6366F1' }}>
                        <Moon size={22} />
                    </div>
                    <div>
                        <h2>Sleep Tracker</h2>
                        <p style={{ color: 'var(--text-tertiary)', fontSize: 'var(--font-size-sm)' }}>
                            Rest & recovery
                        </p>
                    </div>
                </div>
            </motion.div>

            {/* Last Night Summary */}
            <motion.div
                className="glass-card mb-lg"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                style={{
                    background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(168, 85, 247, 0.05))',
                    border: '1px solid rgba(99, 102, 241, 0.2)'
                }}
            >
                <div className="flex justify-between items-start mb-md">
                    <div>
                        <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)', marginBottom: '4px' }}>
                            Last Night
                        </p>
                        {lastNight ? (
                            <>
                                <p style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700, fontFamily: 'var(--font-heading)', color: '#6366F1' }}>
                                    {formatDuration(lastNight.duration)}
                                </p>
                                <div className="flex items-center gap-sm mt-sm" style={{ fontSize: 'var(--font-size-sm)' }}>
                                    <Moon size={14} style={{ color: 'var(--text-tertiary)' }} />
                                    <span style={{ color: 'var(--text-secondary)' }}>{lastNight.bedtime}</span>
                                    <span style={{ color: 'var(--text-tertiary)' }}>→</span>
                                    <Sun size={14} style={{ color: 'var(--accent-orange)' }} />
                                    <span style={{ color: 'var(--text-secondary)' }}>{lastNight.wakeTime}</span>
                                </div>
                            </>
                        ) : (
                            <p style={{ color: 'var(--text-secondary)' }}>No sleep logged yet</p>
                        )}
                    </div>
                    {lastNight && (
                        <div style={{ textAlign: 'right' }}>
                            <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)', marginBottom: '4px' }}>Quality</p>
                            <div className="flex items-center gap-xs">
                                {[1, 2, 3, 4, 5].map((s) => (
                                    <Star
                                        key={s}
                                        size={16}
                                        fill={s <= lastNight.quality ? QUALITY_COLORS[lastNight.quality] : 'transparent'}
                                        stroke={s <= lastNight.quality ? QUALITY_COLORS[lastNight.quality] : 'var(--text-tertiary)'}
                                    />
                                ))}
                            </div>
                            <p style={{ fontSize: 'var(--font-size-xs)', color: QUALITY_COLORS[lastNight.quality], marginTop: '4px' }}>
                                {QUALITY_LABELS[lastNight.quality]}
                            </p>
                        </div>
                    )}
                </div>

                <motion.button
                    className="btn btn-primary btn-full"
                    onClick={() => setShowLogModal(true)}
                    whileTap={{ scale: 0.98 }}
                >
                    <Moon size={18} />
                    Log Sleep
                </motion.button>
            </motion.div>

            {/* Goal & Stats */}
            <motion.div
                className="flex gap-md mb-lg"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
            >
                <motion.div
                    className="glass-card flex-1"
                    onClick={() => setShowGoalModal(true)}
                    whileTap={{ scale: 0.98 }}
                    style={{ cursor: 'pointer', padding: '16px', textAlign: 'center' }}
                >
                    <Target size={20} style={{ color: 'var(--accent-primary)', marginBottom: '8px' }} />
                    <p style={{ fontSize: 'var(--font-size-xl)', fontWeight: 700, fontFamily: 'var(--font-heading)' }}>
                        {sleepGoal}h
                    </p>
                    <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)' }}>Goal</p>
                </motion.div>

                <div className="glass-card flex-1" style={{ padding: '16px', textAlign: 'center' }}>
                    <TrendingUp size={20} style={{ color: weeklyStats.goalMet ? 'var(--accent-primary)' : 'var(--accent-warning)', marginBottom: '8px' }} />
                    <p style={{ fontSize: 'var(--font-size-xl)', fontWeight: 700, fontFamily: 'var(--font-heading)' }}>
                        {weeklyStats.avgDuration}h
                    </p>
                    <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)' }}>Weekly Avg</p>
                </div>
            </motion.div>

            {/* Weekly Chart */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
            >
                <h4 className="mb-md">This Week</h4>
                <div className="glass-card">
                    <div className="flex justify-between" style={{ height: '140px', alignItems: 'flex-end', paddingBottom: '8px' }}>
                        {weeklyStats.days.map((day, i) => {
                            const heightPercent = Math.min((day.duration / sleepGoal) * 100, 100);
                            const dayName = new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' }).charAt(0);
                            const isToday = day.date === new Date().toISOString().split('T')[0];
                            const metGoal = day.duration >= sleepGoal;

                            return (
                                <div
                                    key={day.date}
                                    className="flex flex-col items-center"
                                    style={{ flex: 1 }}
                                >
                                    {day.duration > 0 && (
                                        <p style={{ fontSize: '10px', color: 'var(--text-tertiary)', marginBottom: '4px' }}>
                                            {day.duration}h
                                        </p>
                                    )}
                                    <motion.div
                                        initial={{ height: 0 }}
                                        animate={{ height: day.duration > 0 ? `${Math.max(heightPercent, 10)}%` : '4px' }}
                                        transition={{ delay: 0.4 + i * 0.05, duration: 0.5 }}
                                        style={{
                                            width: '60%',
                                            background: day.duration > 0
                                                ? metGoal
                                                    ? 'linear-gradient(to top, #6366F1, rgba(99, 102, 241, 0.3))'
                                                    : 'linear-gradient(to top, rgba(99, 102, 241, 0.5), rgba(99, 102, 241, 0.2))'
                                                : 'var(--glass-bg)',
                                            borderRadius: '6px 6px 0 0',
                                            minHeight: '4px',
                                            boxShadow: isToday && day.duration > 0 ? '0 0 20px rgba(99, 102, 241, 0.4)' : 'none'
                                        }}
                                    />
                                    <span style={{
                                        fontSize: 'var(--font-size-xs)',
                                        color: isToday ? '#6366F1' : 'var(--text-tertiary)',
                                        marginTop: '10px',
                                        fontWeight: isToday ? 600 : 400,
                                    }}>
                                        {dayName}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                    <div style={{ borderTop: '1px dashed var(--glass-border)', marginTop: '12px', paddingTop: '8px' }}>
                        <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)', textAlign: 'center' }}>
                            Goal: {sleepGoal} hours per night
                        </p>
                    </div>
                </div>
            </motion.div>

            {/* Log Sleep Modal */}
            <AnimatePresence>
                {showLogModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="modal-overlay"
                        onClick={() => setShowLogModal(false)}
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
                                <h3>Log Sleep</h3>
                                <button className="btn btn-ghost btn-icon" onClick={() => setShowLogModal(false)}>
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Time Inputs */}
                            <div className="flex gap-md mb-lg">
                                <div className="input-group flex-1">
                                    <label className="input-label flex items-center gap-sm">
                                        <Moon size={14} style={{ color: '#6366F1' }} />
                                        Bedtime
                                    </label>
                                    <input
                                        type="time"
                                        className="input"
                                        value={bedtime}
                                        onChange={(e) => setBedtime(e.target.value)}
                                        style={{ textAlign: 'center' }}
                                    />
                                </div>
                                <div className="input-group flex-1">
                                    <label className="input-label flex items-center gap-sm">
                                        <Sun size={14} style={{ color: 'var(--accent-orange)' }} />
                                        Wake Time
                                    </label>
                                    <input
                                        type="time"
                                        className="input"
                                        value={wakeTime}
                                        onChange={(e) => setWakeTime(e.target.value)}
                                        style={{ textAlign: 'center' }}
                                    />
                                </div>
                            </div>

                            {/* Duration Display */}
                            <div className="glass-card mb-lg" style={{ textAlign: 'center', padding: '16px', background: 'rgba(99, 102, 241, 0.1)' }}>
                                <Clock size={20} style={{ color: '#6366F1', marginBottom: '4px' }} />
                                <p style={{ fontSize: 'var(--font-size-xl)', fontWeight: 700, fontFamily: 'var(--font-heading)' }}>
                                    {formatDuration(duration)}
                                </p>
                                <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)' }}>Total Sleep</p>
                            </div>

                            {/* Quality Rating */}
                            <div className="mb-lg">
                                <label className="input-label mb-sm">Sleep Quality</label>
                                <div className="flex justify-center gap-md">
                                    {[1, 2, 3, 4, 5].map((s) => (
                                        <motion.button
                                            key={s}
                                            onClick={() => setQuality(s)}
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.9 }}
                                            style={{
                                                background: 'none',
                                                border: 'none',
                                                cursor: 'pointer',
                                                padding: '4px'
                                            }}
                                        >
                                            <Star
                                                size={28}
                                                fill={s <= quality ? QUALITY_COLORS[quality] : 'transparent'}
                                                stroke={s <= quality ? QUALITY_COLORS[quality] : 'var(--text-tertiary)'}
                                            />
                                        </motion.button>
                                    ))}
                                </div>
                                <p style={{ textAlign: 'center', fontSize: 'var(--font-size-sm)', color: QUALITY_COLORS[quality], marginTop: '8px' }}>
                                    {QUALITY_LABELS[quality]}
                                </p>
                            </div>

                            <motion.button
                                className="btn btn-primary btn-lg btn-full"
                                onClick={handleLogSleep}
                                whileTap={{ scale: 0.98 }}
                            >
                                <Check size={20} />
                                Save Sleep Log
                            </motion.button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Goal Modal */}
            <AnimatePresence>
                {showGoalModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="modal-overlay"
                        onClick={() => setShowGoalModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="glass-card glass-card-elevated modal-content"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h3 className="mb-lg text-center">Set Sleep Goal</h3>
                            <div className="flex flex-wrap gap-sm justify-center mb-lg">
                                {[6, 6.5, 7, 7.5, 8, 8.5, 9].map((h) => (
                                    <motion.button
                                        key={h}
                                        className={`glass-card ${sleepGoal === h ? 'active' : ''}`}
                                        onClick={() => handleSetGoal(h)}
                                        whileTap={{ scale: 0.95 }}
                                        style={{
                                            padding: '14px 20px',
                                            cursor: 'pointer',
                                            border: sleepGoal === h ? '2px solid #6366F1' : '1px solid var(--glass-border)',
                                            background: sleepGoal === h ? 'rgba(99, 102, 241, 0.15)' : 'var(--glass-bg)',
                                            minWidth: '70px',
                                            textAlign: 'center'
                                        }}
                                    >
                                        <p style={{ fontWeight: 600, color: sleepGoal === h ? '#6366F1' : 'var(--text-primary)' }}>
                                            {h}h
                                        </p>
                                    </motion.button>
                                ))}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
