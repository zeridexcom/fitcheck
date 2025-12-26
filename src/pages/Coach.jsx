import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Sparkles, Utensils, Dumbbell, Lightbulb, Trash2 } from 'lucide-react';
import useStore from '../stores/useStore';
import { chatWithCoach, generateDietPlan, generateWorkoutPlan } from '../services/openai';

const quickPrompts = [
    { icon: Utensils, label: 'Diet Plan', prompt: 'Create me a diet plan for today' },
    { icon: Dumbbell, label: 'Workout', prompt: 'Give me a workout routine for today' },
    { icon: Lightbulb, label: 'Tips', prompt: 'Give me 5 quick health tips' },
];

export default function Coach() {
    const messagesEndRef = useRef(null);
    const { apiKey, profile, targets, chatHistory, addChatMessage, clearChat } = useStore();

    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [chatHistory]);

    const sendMessage = async (message) => {
        if (!message.trim() || loading) return;
        if (!apiKey) {
            addChatMessage('assistant', "I need an OpenAI API key to help you. Please add your key in Settings! 🔑");
            return;
        }

        addChatMessage('user', message);
        setInput('');
        setLoading(true);

        try {
            const userProfile = { ...profile, targets };
            const response = await chatWithCoach(
                apiKey,
                [...chatHistory, { role: 'user', content: message }],
                userProfile
            );
            addChatMessage('assistant', response);
        } catch (err) {
            addChatMessage('assistant', `Sorry, I encountered an error: ${err.message}. Please try again! 🙏`);
        } finally {
            setLoading(false);
        }
    };

    const handleQuickPrompt = (prompt) => {
        sendMessage(prompt);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        sendMessage(input);
    };

    return (
        <div className="screen" style={{ padding: 0, paddingBottom: 80 }}>
            {/* Header */}
            <motion.div
                className="screen-header"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ padding: 'var(--spacing-lg)' }}
            >
                <div className="flex items-center gap-md">
                    <motion.div
                        animate={{
                            scale: [1, 1.1, 1],
                            rotate: [0, 5, -5, 0]
                        }}
                        transition={{ repeat: Infinity, duration: 3 }}
                    >
                        <Sparkles size={24} style={{ color: 'var(--accent-primary)' }} />
                    </motion.div>
                    <div>
                        <h3 className="screen-title" style={{ marginBottom: '2px' }}>AI Coach</h3>
                        <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)' }}>
                            Your personal fitness assistant
                        </p>
                    </div>
                </div>

                {chatHistory.length > 0 && (
                    <motion.button
                        className="btn btn-ghost btn-icon"
                        onClick={clearChat}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        title="Clear chat"
                    >
                        <Trash2 size={18} />
                    </motion.button>
                )}
            </motion.div>

            {/* Chat Messages */}
            <div className="chat-container">
                <div className="chat-messages">
                    {chatHistory.length === 0 ? (
                        <motion.div
                            className="flex flex-col items-center justify-center flex-1"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            style={{ padding: 'var(--spacing-xl)', textAlign: 'center' }}
                        >
                            <div style={{ fontSize: '64px', marginBottom: 'var(--spacing-lg)' }}>🤖</div>
                            <h4 style={{ marginBottom: 'var(--spacing-sm)' }}>Hey {profile.name || 'there'}!</h4>
                            <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--spacing-xl)' }}>
                                I'm your AI fitness coach. Ask me anything about diet, workouts, or health!
                            </p>

                            {/* Quick Prompts */}
                            <div className="flex flex-col gap-sm w-full" style={{ maxWidth: '300px' }}>
                                {quickPrompts.map(({ icon: Icon, label, prompt }) => (
                                    <motion.button
                                        key={label}
                                        className="btn btn-secondary"
                                        onClick={() => handleQuickPrompt(prompt)}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        <Icon size={18} />
                                        {label}
                                    </motion.button>
                                ))}
                            </div>
                        </motion.div>
                    ) : (
                        <>
                            <AnimatePresence>
                                {chatHistory.map((msg, i) => (
                                    <motion.div
                                        key={i}
                                        className={`chat-message ${msg.role}`}
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                                    >
                                        <div style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>

                            {loading && (
                                <motion.div
                                    className="chat-message assistant"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                >
                                    <div className="flex items-center gap-sm">
                                        <motion.div
                                            animate={{ scale: [1, 1.2, 1] }}
                                            transition={{ repeat: Infinity, duration: 0.6 }}
                                            style={{
                                                width: 8,
                                                height: 8,
                                                borderRadius: '50%',
                                                background: 'var(--accent-primary)'
                                            }}
                                        />
                                        <motion.div
                                            animate={{ scale: [1, 1.2, 1] }}
                                            transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }}
                                            style={{
                                                width: 8,
                                                height: 8,
                                                borderRadius: '50%',
                                                background: 'var(--accent-primary)'
                                            }}
                                        />
                                        <motion.div
                                            animate={{ scale: [1, 1.2, 1] }}
                                            transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }}
                                            style={{
                                                width: 8,
                                                height: 8,
                                                borderRadius: '50%',
                                                background: 'var(--accent-primary)'
                                            }}
                                        />
                                    </div>
                                </motion.div>
                            )}

                            <div ref={messagesEndRef} />
                        </>
                    )}
                </div>

                {/* Input */}
                <form onSubmit={handleSubmit} className="chat-input-container">
                    <input
                        type="text"
                        className="input chat-input"
                        placeholder="Ask me anything..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        disabled={loading}
                    />
                    <motion.button
                        type="submit"
                        className="btn btn-primary btn-icon"
                        disabled={!input.trim() || loading}
                        whileHover={{ scale: input.trim() && !loading ? 1.1 : 1 }}
                        whileTap={{ scale: input.trim() && !loading ? 0.9 : 1 }}
                        style={{
                            opacity: input.trim() && !loading ? 1 : 0.5,
                            cursor: input.trim() && !loading ? 'pointer' : 'not-allowed'
                        }}
                    >
                        <Send size={20} />
                    </motion.button>
                </form>
            </div>
        </div>
    );
}
