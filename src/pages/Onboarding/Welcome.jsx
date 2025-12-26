import { motion } from 'framer-motion';
import { ArrowRight, Zap, Camera, Target, Brain, TrendingUp, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import GlowButton from '../../components/GlowButton';
import Card3D from '../../components/Card3D';

export default function Welcome() {
    const navigate = useNavigate();

    const features = [
        { icon: Camera, text: 'AI-powered food scanning', color: '#00FF87' },
        { icon: Target, text: 'Personalized diet & workout plans', color: '#00D4FF' },
        { icon: TrendingUp, text: 'Track macros & progress', color: '#FF9F43' },
        { icon: Brain, text: '24/7 AI fitness coach', color: '#A855F7' },
    ];

    return (
        <motion.div
            className="onboarding-screen"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ position: 'relative', zIndex: 1 }}
        >
            <div className="onboarding-hero">
                <motion.div
                    className="onboarding-logo"
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
                    style={{
                        boxShadow: '0 0 60px rgba(0, 255, 135, 0.4), 0 0 120px rgba(0, 255, 135, 0.2)'
                    }}
                >
                    <motion.div
                        animate={{
                            rotate: [0, 10, -10, 0],
                            scale: [1, 1.1, 1]
                        }}
                        transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
                    >
                        <Zap size={40} strokeWidth={2.5} style={{ color: 'var(--accent-primary)' }} />
                    </motion.div>
                </motion.div>

                <motion.h1
                    className="onboarding-title"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    style={{ fontSize: 'var(--font-size-4xl)' }}
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
                <Card3D className="mb-lg" glowColor="var(--accent-primary)">
                    <div className="flex items-center gap-md mb-lg">
                        <motion.div
                            animate={{ rotate: [0, 360] }}
                            transition={{ repeat: Infinity, duration: 8, ease: 'linear' }}
                        >
                            <Sparkles size={22} style={{ color: 'var(--accent-primary)' }} />
                        </motion.div>
                        <h4 style={{ fontWeight: 600 }}>What you'll get</h4>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                        {features.map((item, i) => (
                            <motion.div
                                key={i}
                                className="flex items-center gap-md"
                                initial={{ opacity: 0, x: -30 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.7 + i * 0.12 }}
                                whileHover={{ x: 8, transition: { duration: 0.2 } }}
                            >
                                <motion.div
                                    className="icon-badge"
                                    style={{
                                        background: `linear-gradient(135deg, ${item.color}20, transparent)`,
                                        color: item.color,
                                        width: 44,
                                        height: 44,
                                    }}
                                    whileHover={{
                                        scale: 1.15,
                                        boxShadow: `0 0 30px ${item.color}50`
                                    }}
                                >
                                    <item.icon size={20} strokeWidth={2} />
                                </motion.div>
                                <span style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-md)' }}>
                                    {item.text}
                                </span>
                            </motion.div>
                        ))}
                    </div>
                </Card3D>

                <GlowButton
                    onClick={() => navigate('/onboarding/goal')}
                    className="btn-lg btn-full"
                >
                    Start Your Journey
                    <ArrowRight size={22} />
                </GlowButton>
            </motion.div>
        </motion.div>
    );
}
