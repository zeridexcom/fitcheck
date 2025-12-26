import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Volume2, X, Sparkles } from 'lucide-react';
import voiceService from '../services/voice';
import useStore from '../stores/useStore';
import { chatWithCoach } from '../services/openai';

export default function VoiceAgent({ isOpen, onClose }) {
    const { apiKey, addWater, profile, targets } = useStore();

    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [response, setResponse] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);

    const processCommand = useCallback(async (text) => {
        setIsProcessing(true);

        try {
            const command = voiceService.parseFoodCommand(text);

            switch (command.type) {
                case 'log_water':
                    addWater(command.amount);
                    const waterResponse = `Added ${command.amount} ml of water. Great job staying hydrated!`;
                    setResponse(waterResponse);
                    await voiceService.speak(waterResponse);
                    break;

                case 'question':
                case 'log_food':
                case 'unknown':
                default:
                    // Use AI coach for complex queries
                    if (apiKey) {
                        const messages = [{ role: 'user', content: text }];
                        const aiResponse = await chatWithCoach(apiKey, messages, { ...profile, targets });
                        setResponse(aiResponse);

                        // Speak a shortened version
                        const shortResponse = aiResponse.length > 200
                            ? aiResponse.substring(0, 200) + '...'
                            : aiResponse;
                        setIsSpeaking(true);
                        await voiceService.speak(shortResponse);
                        setIsSpeaking(false);
                    } else {
                        const noApiResponse = "I'd love to help, but I need an API key configured. Please add one in settings.";
                        setResponse(noApiResponse);
                        await voiceService.speak(noApiResponse);
                    }
                    break;
            }
        } catch (error) {
            console.error('Voice processing error:', error);
            const errorResponse = "Sorry, I couldn't process that. Please try again.";
            setResponse(errorResponse);
            await voiceService.speak(errorResponse);
        } finally {
            setIsProcessing(false);
        }
    }, [apiKey, addWater, profile, targets]);

    const toggleListening = useCallback(() => {
        if (isListening) {
            voiceService.stopListening();
            setIsListening(false);
        } else {
            setTranscript('');
            const started = voiceService.startListening(
                (text, isFinal) => {
                    setTranscript(text);
                    if (isFinal) {
                        setIsListening(false);
                        processCommand(text);
                    }
                },
                (error) => {
                    console.error('Voice error:', error);
                    setIsListening(false);
                }
            );
            setIsListening(started);
        }
    }, [isListening, processCommand]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            voiceService.stopListening();
            voiceService.stopSpeaking();
        };
    }, []);

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{
                    position: 'fixed',
                    inset: 0,
                    zIndex: 1000,
                    background: 'rgba(0, 0, 0, 0.9)',
                    backdropFilter: 'blur(20px)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '24px'
                }}
            >
                {/* Close button */}
                <motion.button
                    onClick={onClose}
                    style={{
                        position: 'absolute',
                        top: '24px',
                        right: '24px',
                        background: 'rgba(255,255,255,0.1)',
                        border: 'none',
                        borderRadius: '50%',
                        width: 44,
                        height: 44,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#fff',
                        cursor: 'pointer'
                    }}
                    whileTap={{ scale: 0.9 }}
                >
                    <X size={24} />
                </motion.button>

                {/* Main content */}
                <motion.div
                    initial={{ scale: 0.9, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    style={{ textAlign: 'center', maxWidth: '400px' }}
                >
                    <motion.div
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                        style={{ marginBottom: '24px' }}
                    >
                        <Sparkles size={48} style={{ color: 'var(--accent-primary)' }} />
                    </motion.div>

                    <h2 style={{ marginBottom: '8px' }}>FitCheck AI</h2>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>
                        {isListening ? 'Listening...' : isSpeaking ? 'Speaking...' : 'Tap the mic to speak'}
                    </p>

                    {/* Microphone Button */}
                    <motion.button
                        onClick={toggleListening}
                        disabled={isProcessing}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        style={{
                            width: 100,
                            height: 100,
                            borderRadius: '50%',
                            background: isListening
                                ? 'linear-gradient(135deg, #FF5E5E, #CC4444)'
                                : 'linear-gradient(135deg, var(--accent-primary), #00CC6A)',
                            border: 'none',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: isListening
                                ? '0 0 60px rgba(255, 94, 94, 0.5)'
                                : '0 0 60px rgba(0, 255, 135, 0.5)',
                            marginBottom: '24px'
                        }}
                    >
                        {isListening ? (
                            <motion.div
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{ repeat: Infinity, duration: 0.5 }}
                            >
                                <MicOff size={40} color="#fff" />
                            </motion.div>
                        ) : (
                            <Mic size={40} color="#000" />
                        )}
                    </motion.button>

                    {/* Voice waves animation */}
                    {isListening && (
                        <motion.div
                            className="flex justify-center gap-sm"
                            style={{ marginBottom: '24px' }}
                        >
                            {[...Array(5)].map((_, i) => (
                                <motion.div
                                    key={i}
                                    animate={{ scaleY: [1, 2, 1] }}
                                    transition={{
                                        repeat: Infinity,
                                        duration: 0.5,
                                        delay: i * 0.1
                                    }}
                                    style={{
                                        width: 4,
                                        height: 20,
                                        background: 'var(--accent-primary)',
                                        borderRadius: 2
                                    }}
                                />
                            ))}
                        </motion.div>
                    )}

                    {/* Transcript */}
                    {transcript && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="glass-card"
                            style={{ padding: '16px', marginBottom: '16px', textAlign: 'left' }}
                        >
                            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-tertiary)', marginBottom: '4px' }}>
                                You said:
                            </p>
                            <p style={{ fontWeight: 500 }}>{transcript}</p>
                        </motion.div>
                    )}

                    {/* Response */}
                    {response && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="glass-card"
                            style={{
                                padding: '16px',
                                textAlign: 'left',
                                background: 'rgba(0, 255, 135, 0.1)',
                                borderColor: 'rgba(0, 255, 135, 0.2)'
                            }}
                        >
                            <div className="flex items-center gap-sm" style={{ marginBottom: '8px' }}>
                                <Volume2 size={16} style={{ color: 'var(--accent-primary)' }} />
                                <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--accent-primary)' }}>
                                    FitCheck AI
                                </p>
                            </div>
                            <p style={{ fontSize: 'var(--font-size-sm)', lineHeight: 1.6 }}>{response}</p>
                        </motion.div>
                    )}

                    {/* Example commands */}
                    {!transcript && !response && (
                        <div style={{ marginTop: '24px' }}>
                            <p style={{ color: 'var(--text-tertiary)', fontSize: 'var(--font-size-sm)', marginBottom: '12px' }}>
                                Try saying:
                            </p>
                            <div className="flex flex-wrap gap-sm justify-center">
                                {['Log a glass of water', 'I had eggs for breakfast', 'How many calories today?'].map(cmd => (
                                    <span
                                        key={cmd}
                                        style={{
                                            background: 'rgba(255,255,255,0.1)',
                                            padding: '8px 12px',
                                            borderRadius: 'var(--radius-full)',
                                            fontSize: 'var(--font-size-xs)',
                                            color: 'var(--text-secondary)'
                                        }}
                                    >
                                        "{cmd}"
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
