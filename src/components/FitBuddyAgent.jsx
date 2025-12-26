import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, X, Volume2, Loader2, Check, Droplets, Dumbbell, Pill, MessageCircle } from 'lucide-react';
import fitBuddy from '../services/fitbuddy';
import useStore from '../stores/useStore';
import { askCoach } from '../services/openai';

export default function FitBuddyAgent({ alwaysListening = false }) {
    const {
        addWater, waterIntake, waterGoal, getTodaysTotals, targets,
        logSupplement, completeExercise, todayWorkout, workoutPlan,
        startFast, endFast
    } = useStore();

    const [isOpen, setIsOpen] = useState(false);
    const [status, setStatus] = useState('idle'); // idle, listening, sleeping, awake, processing
    const [transcript, setTranscript] = useState('');
    const [response, setResponse] = useState('');
    const [lastAction, setLastAction] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const responseRef = useRef(null);

    useEffect(() => {
        if (!fitBuddy.isSupported()) return;

        // Set up callbacks
        fitBuddy.onWakeUp = () => {
            setIsOpen(true);
            setStatus('awake');
            setTranscript('');
            setResponse('');
        };

        fitBuddy.onStatusChange = (newStatus) => {
            setStatus(newStatus);
            if (newStatus === 'sleeping') {
                // Keep modal open for a bit after sleeping
                setTimeout(() => {
                    if (status === 'sleeping') {
                        setIsOpen(false);
                    }
                }, 2000);
            }
        };

        fitBuddy.onTranscript = (text, isAwake) => {
            setTranscript(text);
        };

        fitBuddy.onCommand = async (command) => {
            await handleCommand(command);
        };

        // Start listening if always-on mode
        if (alwaysListening) {
            fitBuddy.startListening();
        }

        return () => {
            fitBuddy.stopListening();
        };
    }, [alwaysListening]);

    const handleCommand = async (command) => {
        setIsProcessing(true);
        setLastAction(command);

        try {
            switch (command.type) {
                case 'water': {
                    addWater(command.amount);
                    const msg = `Added ${command.amount}ml of water. Stay hydrated!`;
                    setResponse(msg);
                    fitBuddy.speak(msg);
                    break;
                }

                case 'supplement': {
                    logSupplement({ name: command.name, amount: command.amount, unit: command.unit });
                    const msg = `Logged ${command.amount}${command.unit} of ${command.name}. Great work!`;
                    setResponse(msg);
                    fitBuddy.speak(msg);
                    break;
                }

                case 'exercise_complete': {
                    // Find matching exercise in today's workout
                    const todayIndex = new Date().getDay();
                    const dayIdx = todayIndex === 0 ? 6 : todayIndex - 1;
                    const todayPlan = workoutPlan?.days?.[dayIdx % (workoutPlan?.days?.length || 1)];

                    if (todayPlan && command.exercise) {
                        const exercise = todayPlan.exercises.find(ex =>
                            ex.name.toLowerCase().includes(command.exercise.toLowerCase())
                        );
                        if (exercise && !todayWorkout.completedExercises.includes(exercise.id)) {
                            completeExercise(exercise.id);
                            const msg = `Marked ${exercise.name} as complete. Keep pushing!`;
                            setResponse(msg);
                            fitBuddy.speak(msg);
                        } else {
                            const msg = `Exercise completed! You're doing amazing!`;
                            setResponse(msg);
                            fitBuddy.speak(msg);
                        }
                    } else {
                        const msg = `Great job completing that exercise!`;
                        setResponse(msg);
                        fitBuddy.speak(msg);
                    }
                    break;
                }

                case 'start_fast': {
                    startFast(16, '16:8');
                    const msg = `Started your 16:8 fast. You've got this!`;
                    setResponse(msg);
                    fitBuddy.speak(msg);
                    break;
                }

                case 'end_fast': {
                    endFast(true);
                    const msg = `Fast completed! Great discipline!`;
                    setResponse(msg);
                    fitBuddy.speak(msg);
                    break;
                }

                case 'query': {
                    const totals = getTodaysTotals();
                    const today = new Date().toISOString().split('T')[0];
                    const water = waterIntake[today] || 0;

                    let msg = '';
                    switch (command.query) {
                        case 'calories':
                            const calLeft = Math.max(targets.calories - totals.calories, 0);
                            msg = `You've eaten ${totals.calories} calories today. ${calLeft} remaining.`;
                            break;
                        case 'water':
                            const waterLeft = Math.max(waterGoal - water, 0);
                            msg = `You've had ${water}ml of water. ${waterLeft}ml to reach your goal.`;
                            break;
                        case 'protein':
                            msg = `You've had ${totals.protein}g of protein out of ${targets.protein}g goal.`;
                            break;
                        case 'workout':
                            const completed = todayWorkout.completedExercises.length;
                            const todayIdx = new Date().getDay();
                            const dIdx = todayIdx === 0 ? 6 : todayIdx - 1;
                            const plan = workoutPlan?.days?.[dIdx % (workoutPlan?.days?.length || 1)];
                            const total = plan?.exercises?.length || 0;
                            msg = total > 0
                                ? `You've completed ${completed} out of ${total} exercises today.`
                                : `No workout plan set up yet.`;
                            break;
                    }
                    setResponse(msg);
                    fitBuddy.speak(msg);
                    break;
                }

                case 'ai_question': {
                    try {
                        const aiResponse = await askCoach(command.text);
                        // Truncate for speech
                        const shortResponse = aiResponse.length > 200
                            ? aiResponse.substring(0, 200) + '...'
                            : aiResponse;
                        setResponse(aiResponse);
                        fitBuddy.speak(shortResponse);
                    } catch (e) {
                        const msg = "I couldn't process that. Please try again.";
                        setResponse(msg);
                        fitBuddy.speak(msg);
                    }
                    break;
                }

                default:
                    setResponse(`I heard: "${command.text}"`);
            }
        } catch (error) {
            console.error('Command error:', error);
            setResponse("Sorry, something went wrong.");
        }

        setIsProcessing(false);
    };

    const toggleListening = () => {
        if (status === 'listening' || status === 'awake' || status === 'sleeping') {
            fitBuddy.stopListening();
            setIsOpen(false);
            setStatus('idle');
        } else {
            fitBuddy.startListening();
            setIsOpen(true);
        }
    };

    const manualWakeUp = () => {
        fitBuddy.wakeUp();
    };

    const getStatusIcon = () => {
        switch (lastAction?.type) {
            case 'water': return <Droplets size={20} />;
            case 'supplement': return <Pill size={20} />;
            case 'exercise_complete': return <Dumbbell size={20} />;
            default: return <MessageCircle size={20} />;
        }
    };

    const getStatusColor = () => {
        switch (status) {
            case 'awake': return 'var(--accent-primary)';
            case 'listening': return 'var(--accent-secondary)';
            case 'sleeping': return 'var(--accent-orange)';
            default: return 'var(--text-tertiary)';
        }
    };

    return (
        <>
            {/* Floating FitBuddy Button */}
            <motion.button
                onClick={toggleListening}
                className="fitbuddy-fab"
                style={{
                    position: 'fixed',
                    bottom: 100,
                    right: 20,
                    width: 60,
                    height: 60,
                    borderRadius: '50%',
                    background: status === 'awake' || status === 'listening'
                        ? 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))'
                        : 'var(--glass-bg)',
                    border: `2px solid ${getStatusColor()}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    zIndex: 999,
                    backdropFilter: 'blur(12px)',
                    boxShadow: status === 'awake'
                        ? '0 0 30px rgba(0, 255, 135, 0.5)'
                        : '0 4px 20px rgba(0,0,0,0.3)'
                }}
                animate={{
                    scale: status === 'awake' ? [1, 1.1, 1] : 1,
                    boxShadow: status === 'listening'
                        ? ['0 0 20px rgba(0, 212, 255, 0.3)', '0 0 40px rgba(0, 212, 255, 0.6)', '0 0 20px rgba(0, 212, 255, 0.3)']
                        : undefined
                }}
                transition={{ repeat: status === 'awake' || status === 'listening' ? Infinity : 0, duration: 1.5 }}
                whileTap={{ scale: 0.95 }}
            >
                {status === 'listening' || status === 'sleeping' ? (
                    <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ repeat: Infinity, duration: 1 }}
                    >
                        <Mic size={26} color="#fff" />
                    </motion.div>
                ) : status === 'awake' ? (
                    <Volume2 size={26} color="#fff" />
                ) : (
                    <MicOff size={26} style={{ color: 'var(--text-secondary)' }} />
                )}
            </motion.button>

            {/* Status Indicator */}
            {(status === 'listening' || status === 'sleeping') && !isOpen && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                        position: 'fixed',
                        bottom: 170,
                        right: 20,
                        padding: '8px 16px',
                        borderRadius: 'var(--radius-full)',
                        background: 'var(--glass-bg)',
                        border: '1px solid var(--glass-border)',
                        backdropFilter: 'blur(12px)',
                        zIndex: 999,
                        fontSize: 'var(--font-size-xs)',
                        color: getStatusColor()
                    }}
                >
                    Say "Hey FitBuddy"
                </motion.div>
            )}

            {/* Modal */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{
                            position: 'fixed',
                            inset: 0,
                            background: 'rgba(0, 0, 0, 0.8)',
                            backdropFilter: 'blur(8px)',
                            zIndex: 1000,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '24px'
                        }}
                    >
                        {/* Close Button */}
                        <motion.button
                            onClick={() => { fitBuddy.stopListening(); setIsOpen(false); }}
                            style={{
                                position: 'absolute',
                                top: 20,
                                right: 20,
                                width: 44,
                                height: 44,
                                borderRadius: '50%',
                                background: 'var(--glass-bg)',
                                border: '1px solid var(--glass-border)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                color: 'var(--text-secondary)'
                            }}
                            whileTap={{ scale: 0.9 }}
                        >
                            <X size={24} />
                        </motion.button>

                        {/* Avatar */}
                        <motion.div
                            animate={{
                                scale: status === 'awake' ? [1, 1.1, 1] : 1,
                                boxShadow: status === 'awake'
                                    ? ['0 0 30px rgba(0, 255, 135, 0.3)', '0 0 60px rgba(0, 255, 135, 0.6)', '0 0 30px rgba(0, 255, 135, 0.3)']
                                    : '0 0 30px rgba(0, 212, 255, 0.3)'
                            }}
                            transition={{ repeat: Infinity, duration: 2 }}
                            style={{
                                width: 120,
                                height: 120,
                                borderRadius: '50%',
                                background: status === 'awake'
                                    ? 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))'
                                    : 'linear-gradient(135deg, var(--accent-secondary), var(--accent-purple))',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginBottom: '24px'
                            }}
                        >
                            {isProcessing ? (
                                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
                                    <Loader2 size={48} color="#fff" />
                                </motion.div>
                            ) : status === 'awake' ? (
                                <Volume2 size={48} color="#fff" />
                            ) : (
                                <Mic size={48} color="#fff" />
                            )}
                        </motion.div>

                        {/* Title */}
                        <h2 style={{ marginBottom: '8px', fontFamily: 'var(--font-heading)' }}>
                            FitBuddy
                        </h2>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', fontSize: 'var(--font-size-sm)' }}>
                            {status === 'sleeping' ? 'Say "Hey FitBuddy" to wake me up' :
                                status === 'awake' ? "I'm listening..." :
                                    status === 'listening' ? 'Waiting for wake word...' : 'Ready to help'}
                        </p>

                        {/* Transcript */}
                        {transcript && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="glass-card"
                                style={{
                                    padding: '16px 24px',
                                    marginBottom: '16px',
                                    width: '100%',
                                    maxWidth: '400px',
                                    textAlign: 'center'
                                }}
                            >
                                <p style={{ color: 'var(--text-tertiary)', fontSize: 'var(--font-size-xs)', marginBottom: '4px' }}>
                                    You said:
                                </p>
                                <p style={{ fontWeight: 500 }}>"{transcript}"</p>
                            </motion.div>
                        )}

                        {/* Response */}
                        {response && (
                            <motion.div
                                ref={responseRef}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="glass-card"
                                style={{
                                    padding: '20px 24px',
                                    width: '100%',
                                    maxWidth: '400px',
                                    background: 'rgba(0, 255, 135, 0.1)',
                                    border: '1px solid rgba(0, 255, 135, 0.3)'
                                }}
                            >
                                <div className="flex items-center gap-md mb-sm">
                                    <div className="icon-badge icon-badge-primary" style={{ width: 36, height: 36 }}>
                                        {lastAction?.type === 'water' && <Droplets size={18} />}
                                        {lastAction?.type === 'supplement' && <Pill size={18} />}
                                        {lastAction?.type === 'exercise_complete' && <Dumbbell size={18} />}
                                        {!['water', 'supplement', 'exercise_complete'].includes(lastAction?.type) && <Check size={18} />}
                                    </div>
                                    <p style={{ fontWeight: 600, color: 'var(--accent-primary)' }}>FitBuddy</p>
                                </div>
                                <p style={{ lineHeight: 1.6 }}>{response}</p>
                            </motion.div>
                        )}

                        {/* Manual Wake Button */}
                        {status === 'sleeping' && (
                            <motion.button
                                onClick={manualWakeUp}
                                className="btn btn-primary"
                                style={{ marginTop: '24px' }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <Mic size={20} />
                                Tap to Speak
                            </motion.button>
                        )}

                        {/* Example Commands */}
                        {status === 'awake' && !response && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                style={{
                                    marginTop: '24px',
                                    textAlign: 'center',
                                    maxWidth: '300px'
                                }}
                            >
                                <p style={{ color: 'var(--text-tertiary)', fontSize: 'var(--font-size-xs)', marginBottom: '12px' }}>
                                    Try saying:
                                </p>
                                <div className="flex flex-col gap-sm">
                                    {[
                                        '"I drank a glass of water"',
                                        '"I took my creatine"',
                                        '"I finished my push-ups"',
                                        '"How many calories today?"',
                                    ].map((cmd, i) => (
                                        <span key={i} style={{
                                            color: 'var(--text-secondary)',
                                            fontSize: 'var(--font-size-sm)'
                                        }}>
                                            {cmd}
                                        </span>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
