import { motion } from 'framer-motion';
import { ArrowRight, Zap, Camera, Target, Brain, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Welcome() {
    const navigate = useNavigate();

    const features = [
        { icon: Camera, text: 'AI-powered food scanning', color: 'var(--accent-primary)' },
        { icon: Target, text: 'Personalized diet & workout plans', color: 'var(--accent-secondary)' },
        { icon: TrendingUp, text: 'Track macros & progress', color: 'var(--accent-orange)' },
        { icon: Brain, text: '24/7 AI fitness coach', color: 'var(--accent-purple)' },
    ];

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
                    <Zap size={36} strokeWidth={2.5} style={{ color: 'var(--accent-primary)' }} />
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
                    <h4 style={{ marginBottom: 'var(--spacing-lg)', fontWeight: 600 }}>
                        What you'll get
                    </h4>
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '16px'
                    }}>
                        {features.map((item, i) => (
                            <motion.div
                                key={i}
                                className="flex items-center gap-md"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.7 + i * 0.1 }}
                            >
                                <div className="icon-badge" style={{
                                    background: `linear-gradient(135deg, ${item.color}15, transparent)`,
                                    color: item.color,
                                    width: 40,
                                    height: 40,
                                }}>
                                    <item.icon size={18} strokeWidth={2} />
                                </div>
                                <span style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-md)' }}>
                                    {item.text}
                                </span>
                            </motion.div>
                        ))}
                    </div>
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
