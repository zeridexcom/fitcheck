import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Welcome() {
    const navigate = useNavigate();

    return (
        <motion.div
            className="onboarding-screen"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
            <div className="onboarding-hero">
                <motion.div
                    className="onboarding-logo"
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
                >
                    💪
                </motion.div>

                <motion.h1
                    className="onboarding-title"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                >
                    FitCheck
                </motion.h1>

                <motion.p
                    className="onboarding-subtitle"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                >
                    AI-Powered Fitness & Nutrition
                </motion.p>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
            >
                <div className="glass-card mb-lg">
                    <div className="flex items-center gap-md mb-md">
                        <Sparkles size={24} style={{ color: 'var(--accent-primary)' }} />
                        <h4>What you'll get</h4>
                    </div>
                    <ul style={{
                        listStyle: 'none',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '12px'
                    }}>
                        {[
                            '📸 Scan food with AI for instant calories',
                            '🎯 Personalized diet & workout plans',
                            '📊 Track macros, weight & progress',
                            '🤖 24/7 AI fitness coach'
                        ].map((item, i) => (
                            <motion.li
                                key={i}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.7 + i * 0.1 }}
                                style={{ color: 'var(--text-secondary)' }}
                            >
                                {item}
                            </motion.li>
                        ))}
                    </ul>
                </div>

                <motion.button
                    className="btn btn-primary btn-lg btn-full"
                    onClick={() => navigate('/onboarding/goal')}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                >
                    Start Your Journey
                    <ArrowRight size={20} />
                </motion.button>
            </motion.div>
        </motion.div>
    );
}
