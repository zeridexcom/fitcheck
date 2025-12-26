import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Check, Key, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useStore from '../../stores/useStore';

export default function ApiSetup() {
    const navigate = useNavigate();
    const { setApiKey, calculateTargets, completeOnboarding } = useStore();

    const [key, setKey] = useState('');
    const [error, setError] = useState('');
    const [testing, setTesting] = useState(false);

    const handleComplete = async () => {
        if (!key.startsWith('sk-')) {
            setError('API key should start with "sk-"');
            return;
        }

        setTesting(true);
        setError('');

        try {
            // Quick test call
            const response = await fetch('https://api.openai.com/v1/models', {
                headers: { 'Authorization': `Bearer ${key}` }
            });

            if (!response.ok) {
                throw new Error('Invalid API key');
            }

            setApiKey(key);
            calculateTargets();
            completeOnboarding();
            navigate('/');
        } catch (err) {
            setError('Invalid API key. Please check and try again.');
        } finally {
            setTesting(false);
        }
    };

    const handleSkip = () => {
        calculateTargets();
        completeOnboarding();
        navigate('/');
    };

    return (
        <motion.div
            className="onboarding-screen"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
        >
            <div style={{ marginBottom: 'var(--spacing-xl)' }}>
                <motion.button
                    className="btn btn-ghost"
                    onClick={() => navigate('/onboarding/profile')}
                    whileTap={{ scale: 0.95 }}
                    style={{ marginLeft: '-12px', marginBottom: '8px' }}
                >
                    <ArrowLeft size={20} />
                    Back
                </motion.button>

                <h2>Connect AI</h2>
                <p className="mt-sm">Enter your OpenAI API key for AI features</p>
            </div>

            <motion.div
                className="glass-card mb-lg"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
            >
                <div className="flex items-center gap-md mb-md">
                    <Key size={24} style={{ color: 'var(--accent-primary)' }} />
                    <h4>API Key Required For</h4>
                </div>
                <ul style={{
                    listStyle: 'none',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    color: 'var(--text-secondary)'
                }}>
                    <li>📸 Food photo scanning</li>
                    <li>🤖 AI coaching & chat</li>
                    <li>📋 Diet & workout plans</li>
                </ul>
            </motion.div>

            <motion.div
                className="input-group mb-lg"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
            >
                <label className="input-label">OpenAI API Key</label>
                <input
                    type="password"
                    className="input"
                    placeholder="sk-..."
                    value={key}
                    onChange={(e) => setKey(e.target.value)}
                    style={{ fontFamily: 'monospace' }}
                />
                {error && (
                    <motion.div
                        className="flex items-center gap-sm mt-sm"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        style={{ color: 'var(--accent-warning)' }}
                    >
                        <AlertCircle size={16} />
                        <span style={{ fontSize: 'var(--font-size-sm)' }}>{error}</span>
                    </motion.div>
                )}
                <p style={{
                    fontSize: 'var(--font-size-sm)',
                    color: 'var(--text-tertiary)',
                    marginTop: '8px'
                }}>
                    Get your key from{' '}
                    <a
                        href="https://platform.openai.com/api-keys"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: 'var(--accent-primary)' }}
                    >
                        platform.openai.com
                    </a>
                </p>
            </motion.div>

            <div className="flex flex-col gap-md">
                <motion.button
                    className="btn btn-primary btn-lg btn-full"
                    onClick={handleComplete}
                    disabled={!key || testing}
                    whileHover={{ scale: key && !testing ? 1.02 : 1 }}
                    whileTap={{ scale: key && !testing ? 0.98 : 1 }}
                    style={{
                        opacity: key && !testing ? 1 : 0.5,
                        cursor: key && !testing ? 'pointer' : 'not-allowed'
                    }}
                >
                    {testing ? (
                        <>
                            <div className="loading-spinner" style={{ width: 20, height: 20 }} />
                            Testing...
                        </>
                    ) : (
                        <>
                            Complete Setup
                            <Check size={20} />
                        </>
                    )}
                </motion.button>

                <motion.button
                    className="btn btn-ghost btn-full"
                    onClick={handleSkip}
                    whileTap={{ scale: 0.98 }}
                >
                    Skip for now
                </motion.button>
            </div>
        </motion.div>
    );
}
