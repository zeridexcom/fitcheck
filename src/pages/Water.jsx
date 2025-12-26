import { motion } from 'framer-motion';
import { Droplets, Plus, Minus, Target, TrendingUp } from 'lucide-react';
import useStore from '../stores/useStore';
import Card3D from '../components/Card3D';
import GlowButton from '../components/GlowButton';

const GLASS_SIZE = 250; // ml per glass
const QUICK_ADD = [250, 500, 750];

export default function Water() {
    const { waterIntake, waterGoal, addWater, setWaterGoal, getWaterHistory } = useStore();

    const today = new Date().toISOString().split('T')[0];
    const todayIntake = waterIntake[today] || 0;
    const progress = Math.min((todayIntake / waterGoal) * 100, 100);
    const glassesCount = Math.floor(todayIntake / GLASS_SIZE);
    const remaining = Math.max(waterGoal - todayIntake, 0);

    // Get last 7 days history
    const history = getWaterHistory(7);
    const avgIntake = history.length > 0
        ? Math.round(history.reduce((sum, d) => sum + d.amount, 0) / history.length)
        : 0;

    return (
        <div className="screen" style={{ position: 'relative', zIndex: 1 }}>
            {/* Header */}
            <motion.div
                className="screen-header"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div>
                    <h2>Hydration</h2>
                    <p style={{ color: 'var(--text-tertiary)', fontSize: 'var(--font-size-sm)' }}>
                        Stay hydrated, stay healthy
                    </p>
                </div>
                <motion.div
                    className="icon-badge icon-badge-secondary"
                    animate={{
                        boxShadow: ['0 0 20px rgba(0,212,255,0.2)', '0 0 40px rgba(0,212,255,0.4)', '0 0 20px rgba(0,212,255,0.2)']
                    }}
                    transition={{ repeat: Infinity, duration: 2 }}
                >
                    <Droplets size={22} />
                </motion.div>
            </motion.div>

            {/* Main Water Display */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
            >
                <Card3D className="mb-lg text-center" glowColor="var(--accent-secondary)">
                    {/* Water Bottle Visualization */}
                    <div style={{ position: 'relative', width: '120px', height: '200px', margin: '0 auto 24px' }}>
                        {/* Bottle outline */}
                        <div style={{
                            position: 'absolute',
                            inset: 0,
                            border: '3px solid var(--glass-border)',
                            borderRadius: '20px 20px 40px 40px',
                            overflow: 'hidden'
                        }}>
                            {/* Water fill */}
                            <motion.div
                                initial={{ height: 0 }}
                                animate={{ height: `${progress}%` }}
                                transition={{ duration: 0.8, ease: 'easeOut' }}
                                style={{
                                    position: 'absolute',
                                    bottom: 0,
                                    left: 0,
                                    right: 0,
                                    background: 'linear-gradient(to top, #00D4FF, rgba(0, 212, 255, 0.3))',
                                    borderRadius: '0 0 37px 37px'
                                }}
                            />

                            {/* Bubbles animation */}
                            {[...Array(5)].map((_, i) => (
                                <motion.div
                                    key={i}
                                    animate={{
                                        y: [0, -180],
                                        x: [0, Math.random() * 20 - 10],
                                        opacity: [0.7, 0]
                                    }}
                                    transition={{
                                        repeat: Infinity,
                                        duration: 2 + Math.random(),
                                        delay: i * 0.4,
                                        ease: 'easeOut'
                                    }}
                                    style={{
                                        position: 'absolute',
                                        bottom: '10%',
                                        left: `${20 + Math.random() * 60}%`,
                                        width: 6 + Math.random() * 6,
                                        height: 6 + Math.random() * 6,
                                        borderRadius: '50%',
                                        background: 'rgba(255,255,255,0.6)'
                                    }}
                                />
                            ))}
                        </div>

                        {/* Bottle cap */}
                        <div style={{
                            position: 'absolute',
                            top: -15,
                            left: '25%',
                            right: '25%',
                            height: 20,
                            background: 'var(--bg-elevated)',
                            border: '2px solid var(--glass-border)',
                            borderRadius: '8px 8px 0 0'
                        }} />
                    </div>

                    {/* Stats */}
                    <motion.h1
                        className="text-gradient"
                        style={{ fontSize: '48px', marginBottom: '4px', color: 'var(--accent-secondary)' }}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.3, type: 'spring' }}
                    >
                        {todayIntake}
                        <span style={{ fontSize: '24px', color: 'var(--text-tertiary)' }}>ml</span>
                    </motion.h1>

                    <p style={{ color: 'var(--text-secondary)', marginBottom: '8px' }}>
                        {glassesCount} glasses • {remaining > 0 ? `${remaining}ml to go` : '🎉 Goal reached!'}
                    </p>

                    {/* Progress bar */}
                    <div style={{
                        height: '8px',
                        background: 'var(--glass-bg)',
                        borderRadius: 'var(--radius-full)',
                        overflow: 'hidden',
                        marginTop: '16px'
                    }}>
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 0.8 }}
                            style={{
                                height: '100%',
                                background: 'linear-gradient(90deg, var(--accent-secondary), #00FFFF)',
                                borderRadius: 'var(--radius-full)',
                                boxShadow: '0 0 20px var(--accent-secondary-glow)'
                            }}
                        />
                    </div>
                    <p style={{ color: 'var(--text-tertiary)', fontSize: 'var(--font-size-sm)', marginTop: '8px' }}>
                        {Math.round(progress)}% of {waterGoal}ml goal
                    </p>
                </Card3D>
            </motion.div>

            {/* Quick Add Buttons */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mb-lg"
            >
                <h4 className="mb-md">Quick Add</h4>
                <div className="flex gap-md">
                    {QUICK_ADD.map((amount, i) => (
                        <motion.button
                            key={amount}
                            className="glass-card flex-1"
                            onClick={() => addWater(amount)}
                            whileHover={{ scale: 1.05, y: -4 }}
                            whileTap={{ scale: 0.95 }}
                            style={{
                                padding: '20px 16px',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '8px',
                                cursor: 'pointer',
                                border: 'none'
                            }}
                        >
                            <Droplets size={24} style={{ color: 'var(--accent-secondary)' }} />
                            <span style={{ fontWeight: 600, fontFamily: 'var(--font-heading)' }}>
                                +{amount}ml
                            </span>
                        </motion.button>
                    ))}
                </div>
            </motion.div>

            {/* Custom Add */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mb-lg"
            >
                <GlowButton
                    onClick={() => addWater(GLASS_SIZE)}
                    className="btn-lg btn-full"
                    variant="secondary"
                >
                    <Plus size={22} />
                    Add 1 Glass (250ml)
                </GlowButton>
            </motion.div>

            {/* Stats Grid */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
            >
                <div className="nutrition-grid">
                    <div className="nutrition-item" style={{ color: 'var(--accent-secondary)' }}>
                        <div className="flex items-center justify-center gap-sm mb-sm">
                            <Target size={18} />
                        </div>
                        <div className="nutrition-value">{waterGoal}ml</div>
                        <div className="nutrition-label">Daily Goal</div>
                    </div>
                    <div className="nutrition-item" style={{ color: 'var(--accent-primary)' }}>
                        <div className="flex items-center justify-center gap-sm mb-sm">
                            <TrendingUp size={18} />
                        </div>
                        <div className="nutrition-value">{avgIntake}ml</div>
                        <div className="nutrition-label">7-Day Avg</div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
