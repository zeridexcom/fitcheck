import { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Settings as SettingsIcon, Download, Palette, Moon, Sun, User, Bell,
    Trash2, ChevronRight, Check, Scale, Droplets, Target, Calculator
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useStore from '../stores/useStore';
import Card3D from '../components/Card3D';
import GlowButton from '../components/GlowButton';

const THEMES = [
    { id: 'default', name: 'Electric Green', accent: '#00FF87', secondary: '#00D4FF' },
    { id: 'purple', name: 'Royal Purple', accent: '#A855F7', secondary: '#EC4899' },
    { id: 'orange', name: 'Sunset Orange', accent: '#FF9F43', secondary: '#FF5E5E' },
    { id: 'blue', name: 'Ocean Blue', accent: '#00D4FF', secondary: '#6366F1' },
    { id: 'pink', name: 'Hot Pink', accent: '#FF6B9D', secondary: '#A855F7' },
];

export default function Settings() {
    const navigate = useNavigate();
    const {
        profile, targets, waterGoal, setWaterGoal, meals, workouts,
        weightHistory, resetAll, updateProfile
    } = useStore();

    const [currentTheme, setCurrentTheme] = useState('default');
    const [showResetConfirm, setShowResetConfirm] = useState(false);
    const [exportSuccess, setExportSuccess] = useState(false);

    // Apply theme
    const applyTheme = (themeId) => {
        const theme = THEMES.find(t => t.id === themeId);
        if (theme) {
            document.documentElement.style.setProperty('--accent-primary', theme.accent);
            document.documentElement.style.setProperty('--accent-secondary', theme.secondary);
            setCurrentTheme(themeId);
            localStorage.setItem('fitcheck-theme', themeId);
        }
    };

    // Export data as JSON
    const exportData = () => {
        const data = {
            exportDate: new Date().toISOString(),
            profile,
            targets,
            meals,
            workouts,
            weightHistory,
            waterGoal,
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `fitcheck-export-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);

        setExportSuccess(true);
        setTimeout(() => setExportSuccess(false), 3000);
    };

    // Export as CSV
    const exportCSV = () => {
        // Meals CSV
        let csv = 'Date,Time,Food,Calories,Protein,Carbs,Fat\n';
        meals.forEach(meal => {
            csv += `${meal.date},${meal.time},"${meal.name}",${meal.calories},${meal.protein},${meal.carbs},${meal.fat}\n`;
        });

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `fitcheck-meals-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);

        setExportSuccess(true);
        setTimeout(() => setExportSuccess(false), 3000);
    };

    const handleReset = () => {
        resetAll();
        setShowResetConfirm(false);
        window.location.reload();
    };

    return (
        <div className="screen" style={{ position: 'relative', zIndex: 1 }}>
            {/* Header */}
            <motion.div
                className="screen-header"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div>
                    <h2>Settings</h2>
                    <p style={{ color: 'var(--text-tertiary)', fontSize: 'var(--font-size-sm)' }}>
                        Customize your experience
                    </p>
                </div>
                <div className="icon-badge icon-badge-primary">
                    <SettingsIcon size={20} />
                </div>
            </motion.div>

            {/* Profile Summary */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
            >
                <Card3D className="mb-lg">
                    <div className="flex items-center gap-md">
                        <div
                            className="icon-badge icon-badge-primary"
                            style={{ width: 56, height: 56 }}
                        >
                            <User size={26} />
                        </div>
                        <div>
                            <h3 style={{ marginBottom: '4px' }}>{profile.name || 'User'}</h3>
                            <p style={{ color: 'var(--text-tertiary)', fontSize: 'var(--font-size-sm)' }}>
                                {profile.age} years • {profile.weight}kg • {profile.height}cm
                            </p>
                        </div>
                    </div>

                    <div className="nutrition-grid" style={{ marginTop: '20px' }}>
                        <div className="nutrition-item" style={{ color: 'var(--accent-primary)' }}>
                            <div className="nutrition-value">{targets.calories}</div>
                            <div className="nutrition-label">Daily Cal</div>
                        </div>
                        <div className="nutrition-item" style={{ color: 'var(--accent-orange)' }}>
                            <div className="nutrition-value">{targets.protein}g</div>
                            <div className="nutrition-label">Protein</div>
                        </div>
                    </div>

                    <motion.button
                        className="btn btn-secondary btn-full mt-md"
                        onClick={() => navigate('/calorie-calc')}
                        whileTap={{ scale: 0.98 }}
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                    >
                        <Calculator size={18} />
                        Recalculate Macros
                    </motion.button>
                </Card3D>
            </motion.div>

            {/* Theme Customization */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mb-lg"
            >
                <div className="flex items-center gap-sm mb-md">
                    <Palette size={18} style={{ color: 'var(--accent-primary)' }} />
                    <h4>Theme</h4>
                </div>

                <div className="flex gap-sm" style={{ overflowX: 'auto', paddingBottom: '8px' }}>
                    {THEMES.map(theme => (
                        <motion.button
                            key={theme.id}
                            onClick={() => applyTheme(theme.id)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            style={{
                                minWidth: '80px',
                                padding: '12px',
                                borderRadius: 'var(--radius-md)',
                                background: currentTheme === theme.id ? 'var(--glass-highlight)' : 'var(--glass-bg)',
                                border: currentTheme === theme.id ? `2px solid ${theme.accent}` : '1px solid var(--glass-border)',
                                cursor: 'pointer',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '8px'
                            }}
                        >
                            <div style={{ display: 'flex', gap: '4px' }}>
                                <div style={{
                                    width: 20, height: 20, borderRadius: '50%',
                                    background: theme.accent,
                                    boxShadow: `0 0 10px ${theme.accent}40`
                                }} />
                                <div style={{
                                    width: 20, height: 20, borderRadius: '50%',
                                    background: theme.secondary,
                                    boxShadow: `0 0 10px ${theme.secondary}40`
                                }} />
                            </div>
                            <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)' }}>
                                {theme.name.split(' ')[0]}
                            </span>
                            {currentTheme === theme.id && (
                                <Check size={14} style={{ color: theme.accent }} />
                            )}
                        </motion.button>
                    ))}
                </div>
            </motion.div>

            {/* Goals */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mb-lg"
            >
                <div className="flex items-center gap-sm mb-md">
                    <Target size={18} style={{ color: 'var(--accent-secondary)' }} />
                    <h4>Daily Goals</h4>
                </div>

                <div className="glass-card" style={{ padding: '16px' }}>
                    <div className="flex items-center justify-between mb-md">
                        <div className="flex items-center gap-md">
                            <Droplets size={20} style={{ color: 'var(--accent-secondary)' }} />
                            <span>Water Goal</span>
                        </div>
                        <div className="flex items-center gap-sm">
                            {[1500, 2000, 2500, 3000].map(amount => (
                                <motion.button
                                    key={amount}
                                    onClick={() => setWaterGoal(amount)}
                                    whileTap={{ scale: 0.95 }}
                                    style={{
                                        padding: '6px 12px',
                                        borderRadius: 'var(--radius-full)',
                                        border: waterGoal === amount ? '2px solid var(--accent-secondary)' : '1px solid var(--glass-border)',
                                        background: waterGoal === amount ? 'rgba(0, 212, 255, 0.2)' : 'transparent',
                                        color: waterGoal === amount ? 'var(--accent-secondary)' : 'var(--text-secondary)',
                                        fontSize: 'var(--font-size-xs)',
                                        cursor: 'pointer',
                                        fontWeight: waterGoal === amount ? 600 : 400
                                    }}
                                >
                                    {amount / 1000}L
                                </motion.button>
                            ))}
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Export Data */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="mb-lg"
            >
                <div className="flex items-center gap-sm mb-md">
                    <Download size={18} style={{ color: 'var(--accent-orange)' }} />
                    <h4>Export Data</h4>
                </div>

                <div className="flex gap-md">
                    <motion.button
                        className="glass-card flex-1"
                        onClick={exportData}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        style={{
                            padding: '16px',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '8px',
                            cursor: 'pointer',
                            border: 'none'
                        }}
                    >
                        <Download size={24} style={{ color: 'var(--accent-primary)' }} />
                        <span style={{ fontWeight: 600 }}>Export JSON</span>
                        <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)' }}>
                            Full backup
                        </span>
                    </motion.button>

                    <motion.button
                        className="glass-card flex-1"
                        onClick={exportCSV}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        style={{
                            padding: '16px',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '8px',
                            cursor: 'pointer',
                            border: 'none'
                        }}
                    >
                        <Download size={24} style={{ color: 'var(--accent-secondary)' }} />
                        <span style={{ fontWeight: 600 }}>Export CSV</span>
                        <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)' }}>
                            Meals only
                        </span>
                    </motion.button>
                </div>

                {exportSuccess && (
                    <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{
                            color: 'var(--accent-primary)',
                            textAlign: 'center',
                            marginTop: '12px',
                            fontSize: 'var(--font-size-sm)'
                        }}
                    >
                        ✓ Export downloaded successfully!
                    </motion.p>
                )}
            </motion.div>

            {/* Stats */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mb-lg"
            >
                <h4 className="mb-md">Your Stats</h4>
                <div className="glass-card" style={{ padding: '16px' }}>
                    <div className="flex justify-between items-center" style={{ marginBottom: '12px' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>Total Meals Logged</span>
                        <span style={{ fontWeight: 700, color: 'var(--accent-primary)' }}>{meals.length}</span>
                    </div>
                    <div className="flex justify-between items-center" style={{ marginBottom: '12px' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>Total Workouts</span>
                        <span style={{ fontWeight: 700, color: 'var(--accent-orange)' }}>{workouts.length}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span style={{ color: 'var(--text-secondary)' }}>Weight Entries</span>
                        <span style={{ fontWeight: 700, color: 'var(--accent-secondary)' }}>{weightHistory.length}</span>
                    </div>
                </div>
            </motion.div>

            {/* Danger Zone */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
            >
                <div className="flex items-center gap-sm mb-md">
                    <Trash2 size={18} style={{ color: 'var(--accent-warning)' }} />
                    <h4 style={{ color: 'var(--accent-warning)' }}>Danger Zone</h4>
                </div>

                {!showResetConfirm ? (
                    <motion.button
                        className="glass-card btn-full"
                        onClick={() => setShowResetConfirm(true)}
                        whileHover={{ scale: 1.02 }}
                        style={{
                            padding: '16px',
                            border: '1px solid rgba(255, 94, 94, 0.3)',
                            background: 'rgba(255, 94, 94, 0.1)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px'
                        }}
                    >
                        <Trash2 size={18} style={{ color: 'var(--accent-warning)' }} />
                        <span style={{ color: 'var(--accent-warning)', fontWeight: 600 }}>Reset All Data</span>
                    </motion.button>
                ) : (
                    <div className="glass-card" style={{ padding: '16px', borderColor: 'var(--accent-warning)' }}>
                        <p style={{ color: 'var(--accent-warning)', marginBottom: '16px', textAlign: 'center' }}>
                            This will delete ALL your data permanently!
                        </p>
                        <div className="flex gap-md">
                            <motion.button
                                className="btn btn-secondary flex-1"
                                onClick={() => setShowResetConfirm(false)}
                                whileTap={{ scale: 0.95 }}
                            >
                                Cancel
                            </motion.button>
                            <GlowButton onClick={handleReset} variant="danger" className="flex-1">
                                <Trash2 size={16} />
                                Confirm Delete
                            </GlowButton>
                        </div>
                    </div>
                )}
            </motion.div>
        </div>
    );
}
