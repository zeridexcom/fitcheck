import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useStore from '../../stores/useStore';

const activityLevels = [
    { id: 'sedentary', label: 'Sedentary', desc: 'Little to no exercise' },
    { id: 'light', label: 'Light', desc: '1-2 days/week' },
    { id: 'moderate', label: 'Moderate', desc: '3-5 days/week' },
    { id: 'active', label: 'Active', desc: '6-7 days/week' },
    { id: 'very_active', label: 'Very Active', desc: 'Intense daily' },
];

export default function ProfileSetup() {
    const navigate = useNavigate();
    const { profile, updateProfile } = useStore();

    const [form, setForm] = useState({
        name: profile.name || '',
        age: profile.age || 25,
        gender: profile.gender || 'male',
        weight: profile.weight || 70,
        height: profile.height || 170,
        activityLevel: profile.activityLevel || 'moderate',
    });

    const handleChange = (key, value) => {
        setForm(prev => ({ ...prev, [key]: value }));
    };

    const handleContinue = () => {
        updateProfile(form);
        navigate('/onboarding/api');
    };

    const isValid = form.name && form.age && form.weight && form.height;

    return (
        <motion.div
            className="onboarding-screen"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            style={{ justifyContent: 'flex-start', paddingTop: '60px' }}
        >
            <div style={{ marginBottom: 'var(--spacing-lg)' }}>
                <motion.button
                    className="btn btn-ghost"
                    onClick={() => navigate('/onboarding/goal')}
                    whileTap={{ scale: 0.95 }}
                    style={{ marginLeft: '-12px', marginBottom: '8px' }}
                >
                    <ArrowLeft size={20} />
                    Back
                </motion.button>

                <h2>About You</h2>
                <p className="mt-sm">We'll customize your experience</p>
            </div>

            <div className="flex flex-col gap-md" style={{ marginBottom: 'var(--spacing-xl)' }}>
                <motion.div
                    className="input-group"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <label className="input-label">Your Name</label>
                    <input
                        type="text"
                        className="input"
                        placeholder="Enter your name"
                        value={form.name}
                        onChange={(e) => handleChange('name', e.target.value)}
                    />
                </motion.div>

                <motion.div
                    className="flex gap-md"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <div className="input-group" style={{ flex: 1 }}>
                        <label className="input-label">Age</label>
                        <input
                            type="number"
                            className="input"
                            value={form.age}
                            onChange={(e) => handleChange('age', parseInt(e.target.value) || 0)}
                            min={10}
                            max={100}
                        />
                    </div>

                    <div className="input-group" style={{ flex: 1 }}>
                        <label className="input-label">Gender</label>
                        <select
                            className="input"
                            value={form.gender}
                            onChange={(e) => handleChange('gender', e.target.value)}
                        >
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                        </select>
                    </div>
                </motion.div>

                <motion.div
                    className="flex gap-md"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <div className="input-group" style={{ flex: 1 }}>
                        <label className="input-label">Weight (kg)</label>
                        <input
                            type="number"
                            className="input"
                            value={form.weight}
                            onChange={(e) => handleChange('weight', parseFloat(e.target.value) || 0)}
                            min={30}
                            max={300}
                        />
                    </div>

                    <div className="input-group" style={{ flex: 1 }}>
                        <label className="input-label">Height (cm)</label>
                        <input
                            type="number"
                            className="input"
                            value={form.height}
                            onChange={(e) => handleChange('height', parseInt(e.target.value) || 0)}
                            min={100}
                            max={250}
                        />
                    </div>
                </motion.div>

                <motion.div
                    className="input-group"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                >
                    <label className="input-label">Activity Level</label>
                    <div className="flex flex-col gap-sm">
                        {activityLevels.map((level) => (
                            <motion.button
                                key={level.id}
                                onClick={() => handleChange('activityLevel', level.id)}
                                className="glass-card"
                                whileHover={{ scale: 1.01 }}
                                whileTap={{ scale: 0.99 }}
                                style={{
                                    padding: '12px 16px',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    cursor: 'pointer',
                                    border: form.activityLevel === level.id
                                        ? '1px solid var(--accent-primary)'
                                        : '1px solid var(--glass-border)',
                                    background: form.activityLevel === level.id
                                        ? 'rgba(0, 255, 135, 0.05)'
                                        : 'var(--glass-bg)'
                                }}
                            >
                                <span style={{ fontWeight: 500 }}>{level.label}</span>
                                <span style={{
                                    color: 'var(--text-tertiary)',
                                    fontSize: 'var(--font-size-sm)'
                                }}>
                                    {level.desc}
                                </span>
                            </motion.button>
                        ))}
                    </div>
                </motion.div>
            </div>

            <motion.button
                className="btn btn-primary btn-lg btn-full"
                onClick={handleContinue}
                disabled={!isValid}
                whileHover={{ scale: isValid ? 1.02 : 1 }}
                whileTap={{ scale: isValid ? 0.98 : 1 }}
                style={{
                    opacity: isValid ? 1 : 0.5,
                    cursor: isValid ? 'pointer' : 'not-allowed'
                }}
            >
                Continue
                <ArrowRight size={20} />
            </motion.button>
        </motion.div>
    );
}
