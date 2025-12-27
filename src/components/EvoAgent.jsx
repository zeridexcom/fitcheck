import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Volume2, Loader2, Sparkles, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import evo from '../services/evo';
import useStore from '../stores/useStore';

export default function EvoAgent() {
    const navigate = useNavigate();
    const store = useStore();

    const [status, setStatus] = useState('initializing'); // initializing, listening, awake, processing
    const [transcript, setTranscript] = useState('');
    const [response, setResponse] = useState('');
    const [isExpanded, setIsExpanded] = useState(false);
    const [showWaveform, setShowWaveform] = useState(false);

    // Extract actions from store
    const {
        updateProfile, addMeal, addWater, logSupplement,
        startFast, endFast, getTodaysTotals, getLastNightsSleep,
        profile, targets, waterIntake, waterGoal, apiKey,
        workoutPlan, todayWorkout, completeExercise
    } = store;

    useEffect(() => {
        if (!evo.isSupported()) {
            setStatus('unsupported');
            return;
        }

        // Set app context for Evo
        evo.setAppContext(
            { profile, targets, waterIntake, waterGoal, apiKey, getTodaysTotals, getLastNightsSleep, workoutPlan, todayWorkout },
            { updateProfile, addMeal, addWater, logSupplement, startFast, endFast, completeExercise },
            navigate
        );

        // Set up callbacks
        evo.onWakeUp = () => {
            setIsExpanded(true);
            setShowWaveform(true);
            setTranscript('');
        };

        evo.onStatusChange = (newStatus) => {
            setStatus(newStatus);
            if (newStatus === 'sleeping') {
                setTimeout(() => {
                    setIsExpanded(false);
                    setShowWaveform(false);
                }, 3000);
            }
        };

        evo.onTranscript = (text, isAwake) => {
            setTranscript(text);
            if (isAwake) setShowWaveform(true);
        };

        evo.onResponse = (text) => {
            setResponse(text);
        };

        evo.onCommand = ({ text, result }) => {
            console.log('Command processed:', text, result);
        };

        // Start always-on listening
        setTimeout(() => {
            evo.startListening();
            setStatus('listening');
        }, 1000);

        return () => {
            evo.stopListening();
        };
    }, []);

    // Update context when store changes
    useEffect(() => {
        evo.setAppContext(
            { profile, targets, waterIntake, waterGoal, apiKey, getTodaysTotals, getLastNightsSleep, workoutPlan, todayWorkout },
            { updateProfile, addMeal, addWater, logSupplement, startFast, endFast, completeExercise },
            navigate
        );
    }, [profile, targets, waterIntake, apiKey]);

    const getStatusColor = () => {
        switch (status) {
            case 'awake': return '#00FF87';
            case 'listening': return 'rgba(255, 255, 255, 0.3)';
            case 'processing': return '#00D4FF';
            default: return 'rgba(255, 255, 255, 0.2)';
        }
    };

    const getStatusText = () => {
        switch (status) {
            case 'awake': return 'Evo is listening...';
            case 'listening': return 'Say "Evo" to wake me';
            case 'processing': return 'Thinking...';
            case 'unsupported': return 'Voice not supported';
            default: return 'Starting...';
        }
    };

    return (
        <>
            {/* Minimal Indicator - Always visible */}
            <motion.div
                style={{
                    position: 'fixed',
                    top: 16,
                    right: 16,
                    zIndex: 1000,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                }}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                {/* Small pulsing dot */}
                <motion.div
                    animate={{
                        scale: status === 'awake' ? [1, 1.3, 1] : 1,
                        boxShadow: status === 'awake'
                            ? ['0 0 0 0 rgba(0, 255, 135, 0.4)', '0 0 0 10px rgba(0, 255, 135, 0)', '0 0 0 0 rgba(0, 255, 135, 0.4)']
                            : '0 0 0 0 transparent'
                    }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                    style={{
                        width: 12,
                        height: 12,
                        borderRadius: '50%',
                        background: getStatusColor(),
                        cursor: 'pointer'
                    }}
                    onClick={() => setIsExpanded(!isExpanded)}
                />
                {status === 'listening' && (
                    <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>
                        "Evo" 🎤
                    </span>
                )}
            </motion.div>

            {/* Expanded Panel */}
            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ opacity: 0, y: -20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -20, scale: 0.95 }}
                        style={{
                            position: 'fixed',
                            top: 60,
                            right: 16,
                            left: 16,
                            zIndex: 999,
                            maxWidth: 400,
                            marginLeft: 'auto'
                        }}
                    >
                        <div
                            className="glass-card glass-card-elevated"
                            style={{
                                padding: '20px',
                                borderLeft: `4px solid ${getStatusColor()}`
                            }}
                        >
                            {/* Header */}
                            <div className="flex justify-between items-center mb-md">
                                <div className="flex items-center gap-sm">
                                    <motion.div
                                        animate={{ rotate: status === 'processing' ? 360 : 0 }}
                                        transition={{ repeat: status === 'processing' ? Infinity : 0, duration: 1 }}
                                    >
                                        <Sparkles size={20} style={{ color: '#00FF87' }} />
                                    </motion.div>
                                    <span style={{ fontWeight: 700, fontSize: 'var(--font-size-md)' }}>Evo</span>
                                </div>
                                <button
                                    onClick={() => setIsExpanded(false)}
                                    style={{ background: 'none', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer' }}
                                >
                                    <X size={18} />
                                </button>
                            </div>

                            {/* Waveform Animation */}
                            {showWaveform && (
                                <motion.div
                                    className="flex justify-center items-center gap-xs mb-md"
                                    style={{ height: 30 }}
                                >
                                    {[...Array(5)].map((_, i) => (
                                        <motion.div
                                            key={i}
                                            animate={{
                                                height: [10, 25, 10],
                                            }}
                                            transition={{
                                                repeat: Infinity,
                                                duration: 0.5,
                                                delay: i * 0.1,
                                            }}
                                            style={{
                                                width: 4,
                                                background: 'linear-gradient(to top, #00FF87, #00D4FF)',
                                                borderRadius: 2
                                            }}
                                        />
                                    ))}
                                </motion.div>
                            )}

                            {/* Transcript */}
                            {transcript && (
                                <div
                                    className="glass-card mb-md"
                                    style={{ padding: '12px', background: 'rgba(255, 255, 255, 0.03)' }}
                                >
                                    <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)', marginBottom: '4px' }}>
                                        You said:
                                    </p>
                                    <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-primary)' }}>
                                        "{transcript}"
                                    </p>
                                </div>
                            )}

                            {/* Response */}
                            {response && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="glass-card"
                                    style={{
                                        padding: '12px',
                                        background: 'rgba(0, 255, 135, 0.05)',
                                        borderLeft: '3px solid #00FF87'
                                    }}
                                >
                                    <p style={{ fontSize: 'var(--font-size-xs)', color: '#00FF87', marginBottom: '4px' }}>
                                        Evo:
                                    </p>
                                    <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-primary)', lineHeight: 1.5 }}>
                                        {response}
                                    </p>
                                </motion.div>
                            )}

                            {/* Status */}
                            <p style={{
                                fontSize: 'var(--font-size-xs)',
                                color: 'var(--text-tertiary)',
                                textAlign: 'center',
                                marginTop: '12px'
                            }}>
                                {getStatusText()}
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
