import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Timer, Play, Pause, RotateCcw, Clock, Flame, Check } from 'lucide-react';
import Card3D from '../components/Card3D';
import GlowButton from '../components/GlowButton';
import useStore from '../stores/useStore';

const FASTING_PLANS = [
    { id: '16:8', name: '16:8', fastHours: 16, eatHours: 8, description: 'Most popular' },
    { id: '18:6', name: '18:6', fastHours: 18, eatHours: 6, description: 'Intermediate' },
    { id: '20:4', name: '20:4', fastHours: 20, eatHours: 4, description: 'Advanced' },
    { id: '24:0', name: '24h', fastHours: 24, eatHours: 0, description: 'One meal a day' },
];

export default function Fasting() {
    const { fastingState, startFast, endFast, updateFastingState } = useStore();

    const [selectedPlan, setSelectedPlan] = useState(FASTING_PLANS[0]);
    const [timeLeft, setTimeLeft] = useState(0);
    const [progress, setProgress] = useState(0);

    // Calculate time remaining
    useEffect(() => {
        if (!fastingState.isActive) return;

        const interval = setInterval(() => {
            const now = Date.now();
            const elapsed = now - fastingState.startTime;
            const totalDuration = fastingState.duration * 60 * 60 * 1000; // hours to ms
            const remaining = Math.max(totalDuration - elapsed, 0);

            setTimeLeft(remaining);
            setProgress(Math.min((elapsed / totalDuration) * 100, 100));

            if (remaining === 0 && fastingState.isActive) {
                endFast(true);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [fastingState.isActive, fastingState.startTime, fastingState.duration]);

    const formatTime = (ms) => {
        const hours = Math.floor(ms / (1000 * 60 * 60));
        const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((ms % (1000 * 60)) / 1000);
        return { hours, minutes, seconds };
    };

    const time = formatTime(timeLeft);
    const elapsedHours = fastingState.isActive
        ? ((Date.now() - fastingState.startTime) / (1000 * 60 * 60)).toFixed(1)
        : 0;

    const handleStart = () => {
        startFast(selectedPlan.fastHours, selectedPlan.id);
    };

    const handleStop = () => {
        endFast(false);
        setProgress(0);
        setTimeLeft(0);
    };

    return (
        <div className="screen" style={{ position: 'relative', zIndex: 1 }}>
            {/* Header */}
            <motion.div
                className="screen-header"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div>
                    <h2>Fasting</h2>
                    <p style={{ color: 'var(--text-tertiary)', fontSize: 'var(--font-size-sm)' }}>
                        Intermittent fasting timer
                    </p>
                </div>
                <motion.div
                    className="icon-badge icon-badge-orange"
                    animate={{
                        boxShadow: fastingState.isActive
                            ? ['0 0 20px rgba(255,159,67,0.3)', '0 0 40px rgba(255,159,67,0.5)', '0 0 20px rgba(255,159,67,0.3)']
                            : 'none'
                    }}
                    transition={{ repeat: Infinity, duration: 2 }}
                >
                    <Timer size={22} />
                </motion.div>
            </motion.div>

            {/* Main Timer */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
            >
                <Card3D className="mb-lg text-center" glowColor={fastingState.isActive ? 'var(--accent-orange)' : 'var(--accent-primary)'}>
                    {/* Progress Ring */}
                    <div style={{ position: 'relative', width: '220px', height: '220px', margin: '0 auto 24px' }}>
                        <svg width="220" height="220" viewBox="0 0 220 220">
                            {/* Background circle */}
                            <circle
                                cx="110"
                                cy="110"
                                r="100"
                                fill="none"
                                stroke="var(--glass-border)"
                                strokeWidth="12"
                            />
                            {/* Progress circle */}
                            <motion.circle
                                cx="110"
                                cy="110"
                                r="100"
                                fill="none"
                                stroke={fastingState.isActive ? 'var(--accent-orange)' : 'var(--accent-primary)'}
                                strokeWidth="12"
                                strokeLinecap="round"
                                strokeDasharray={628}
                                strokeDashoffset={628 - (628 * progress) / 100}
                                transform="rotate(-90 110 110)"
                                style={{ filter: 'drop-shadow(0 0 10px currentColor)' }}
                            />
                        </svg>

                        {/* Center content */}
                        <div style={{
                            position: 'absolute',
                            inset: 0,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            {fastingState.isActive ? (
                                <>
                                    <motion.div
                                        animate={{ scale: [1, 1.1, 1] }}
                                        transition={{ repeat: Infinity, duration: 1.5 }}
                                    >
                                        <Flame size={28} style={{ color: 'var(--accent-orange)', marginBottom: '8px' }} />
                                    </motion.div>
                                    <div style={{ fontFamily: 'var(--font-heading)', fontSize: '40px', fontWeight: 700 }}>
                                        {String(time.hours).padStart(2, '0')}:{String(time.minutes).padStart(2, '0')}
                                    </div>
                                    <div style={{ color: 'var(--text-tertiary)', fontSize: 'var(--font-size-sm)' }}>
                                        {String(time.seconds).padStart(2, '0')} sec
                                    </div>
                                </>
                            ) : (
                                <>
                                    <Timer size={32} style={{ color: 'var(--text-tertiary)', marginBottom: '8px' }} />
                                    <div style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-lg)' }}>
                                        Ready to fast
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Status */}
                    {fastingState.isActive && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex justify-center gap-lg mb-lg"
                        >
                            <div className="text-center">
                                <p style={{ fontSize: 'var(--font-size-xl)', fontWeight: 700, color: 'var(--accent-orange)' }}>
                                    {elapsedHours}h
                                </p>
                                <p style={{ color: 'var(--text-tertiary)', fontSize: 'var(--font-size-xs)' }}>Elapsed</p>
                            </div>
                            <div className="text-center">
                                <p style={{ fontSize: 'var(--font-size-xl)', fontWeight: 700, color: 'var(--accent-primary)' }}>
                                    {fastingState.duration}h
                                </p>
                                <p style={{ color: 'var(--text-tertiary)', fontSize: 'var(--font-size-xs)' }}>Goal</p>
                            </div>
                            <div className="text-center">
                                <p style={{ fontSize: 'var(--font-size-xl)', fontWeight: 700, color: 'var(--accent-secondary)' }}>
                                    {Math.round(progress)}%
                                </p>
                                <p style={{ color: 'var(--text-tertiary)', fontSize: 'var(--font-size-xs)' }}>Complete</p>
                            </div>
                        </motion.div>
                    )}

                    {/* Control Buttons */}
                    <div className="flex gap-md justify-center">
                        {!fastingState.isActive ? (
                            <GlowButton onClick={handleStart} className="btn-lg">
                                <Play size={20} />
                                Start Fasting
                            </GlowButton>
                        ) : (
                            <>
                                <motion.button
                                    className="btn btn-secondary"
                                    onClick={handleStop}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <RotateCcw size={18} />
                                    Reset
                                </motion.button>
                                <GlowButton onClick={() => endFast(true)} variant="primary">
                                    <Check size={18} />
                                    Complete
                                </GlowButton>
                            </>
                        )}
                    </div>
                </Card3D>
            </motion.div>

            {/* Fasting Plans */}
            {!fastingState.isActive && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <h4 className="mb-md">Choose Plan</h4>
                    <div className="flex flex-wrap gap-md">
                        {FASTING_PLANS.map((plan) => (
                            <motion.button
                                key={plan.id}
                                className={`glass-card ${selectedPlan.id === plan.id ? 'selected' : ''}`}
                                onClick={() => setSelectedPlan(plan)}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                style={{
                                    flex: '1 1 calc(50% - 8px)',
                                    padding: '16px',
                                    textAlign: 'center',
                                    border: selectedPlan.id === plan.id ? '2px solid var(--accent-primary)' : '1px solid var(--glass-border)',
                                    background: selectedPlan.id === plan.id ? 'var(--accent-primary-soft)' : 'var(--glass-bg)',
                                    cursor: 'pointer'
                                }}
                            >
                                <div style={{ fontSize: 'var(--font-size-xl)', fontWeight: 700, fontFamily: 'var(--font-heading)', marginBottom: '4px' }}>
                                    {plan.name}
                                </div>
                                <div style={{ color: 'var(--text-tertiary)', fontSize: 'var(--font-size-xs)' }}>
                                    {plan.description}
                                </div>
                            </motion.button>
                        ))}
                    </div>
                </motion.div>
            )}

            {/* Fasting History */}
            {fastingState.history && fastingState.history.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    style={{ marginTop: '24px' }}
                >
                    <h4 className="mb-md">Recent Fasts</h4>
                    {fastingState.history.slice(-3).reverse().map((fast, i) => (
                        <motion.div
                            key={i}
                            className="glass-card mb-sm"
                            style={{ padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                        >
                            <div>
                                <p style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)' }}>{fast.plan}</p>
                                <p style={{ color: 'var(--text-tertiary)', fontSize: 'var(--font-size-xs)' }}>
                                    {new Date(fast.date).toLocaleDateString()}
                                </p>
                            </div>
                            <div style={{
                                color: fast.completed ? 'var(--accent-primary)' : 'var(--accent-warning)',
                                fontWeight: 600
                            }}>
                                {fast.completed ? '✓ Completed' : 'Ended early'}
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            )}
        </div>
    );
}
