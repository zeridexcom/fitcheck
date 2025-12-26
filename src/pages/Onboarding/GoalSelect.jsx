import { motion } from 'framer-motion';
import { ArrowRight, ArrowLeft, Flame, Dumbbell, Scale, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useStore from '../../stores/useStore';

const goals = [
    {
        id: 'weight_loss',
        icon: Flame,
        title: 'Lose Weight',
        desc: 'Burn fat & get lean',
        color: 'var(--accent-warning)'
    },
    {
        id: 'muscle_gain',
        icon: Dumbbell,
        title: 'Build Muscle',
        desc: 'Gain strength & size',
        color: 'var(--accent-primary)'
    },
    {
        id: 'maintenance',
        icon: Scale,
        title: 'Maintain',
        desc: 'Stay fit & healthy',
        color: 'var(--accent-secondary)'
    },
    {
        id: 'general_health',
        icon: Heart,
        title: 'General Health',
        desc: 'Improve wellness',
        color: 'var(--accent-pink)'
    },
];

export default function GoalSelect() {
    const navigate = useNavigate();
    const { profile, updateProfile } = useStore();

    const handleContinue = () => {
        if (profile.goal) {
            navigate('/onboarding/profile');
        }
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
                    onClick={() => navigate('/onboarding')}
                    whileTap={{ scale: 0.95 }}
                    style={{ marginLeft: '-12px', marginBottom: '8px' }}
                >
                    <ArrowLeft size={20} />
                    Back
                </motion.button>

                <h2>What's your goal?</h2>
                <p className="mt-sm">Choose your primary fitness goal</p>
            </div>

            <div className="goal-grid">
                {goals.map((goal, i) => {
                    const Icon = goal.icon;
                    const isSelected = profile.goal === goal.id;

                    return (
                        <motion.button
                            key={goal.id}
                            className={`goal-card ${isSelected ? 'selected' : ''}`}
                            onClick={() => updateProfile({ goal: goal.id })}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                        >
                            <div
                                className="goal-card-icon"
                                style={{
                                    background: isSelected
                                        ? `linear-gradient(135deg, ${goal.color}30, ${goal.color}10)`
                                        : 'var(--glass-highlight)',
                                    color: isSelected ? goal.color : 'var(--text-secondary)'
                                }}
                            >
                                <Icon size={26} strokeWidth={2} />
                            </div>
                            <div className="goal-card-title">{goal.title}</div>
                            <div className="goal-card-desc">{goal.desc}</div>
                        </motion.button>
                    );
                })}
            </div>

            <motion.button
                className="btn btn-primary btn-lg btn-full"
                onClick={handleContinue}
                disabled={!profile.goal}
                whileHover={{ scale: profile.goal ? 1.02 : 1 }}
                whileTap={{ scale: profile.goal ? 0.98 : 1 }}
                style={{
                    opacity: profile.goal ? 1 : 0.5,
                    cursor: profile.goal ? 'pointer' : 'not-allowed'
                }}
            >
                Continue
                <ArrowRight size={20} />
            </motion.button>
        </motion.div>
    );
}
