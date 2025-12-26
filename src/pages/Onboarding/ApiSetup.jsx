import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Check, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useStore from '../../stores/useStore';

export default function ApiSetup() {
    const navigate = useNavigate();
    const { apiKey, calculateTargets, completeOnboarding } = useStore();

    // Auto-complete if API key is already set via environment variable
    useEffect(() => {
        if (apiKey) {
            calculateTargets();
            completeOnboarding();
            navigate('/');
        }
    }, [apiKey]);

    const handleComplete = () => {
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

                <h2>Almost Ready!</h2>
                <p className="mt-sm">Setting up your personalized experience</p>
            </div>

            <motion.div
                className="glass-card mb-lg"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
            >
                <div className="flex items-center gap-md mb-md">
                    <Sparkles size={24} style={{ color: 'var(--accent-primary)' }} />
                    <h4>AI Features Ready</h4>
                </div>
                <ul style={{
                    listStyle: 'none',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    color: 'var(--text-secondary)'
                }}>
                    <li>✅ Food photo scanning</li>
                    <li>✅ AI coaching & chat</li>
                    <li>✅ Diet & workout plans</li>
                </ul>
            </motion.div>

            <motion.button
                className="btn btn-primary btn-lg btn-full"
                onClick={handleComplete}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
            >
                <Check size={20} />
                Start FitCheck
            </motion.button>
        </motion.div>
    );
}
