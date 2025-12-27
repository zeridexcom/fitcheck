import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Flame, Cookie, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import useStore from '../stores/useStore';

// Danger zone thresholds
const DANGER_THRESHOLD = 0.9;  // 90%
const WARNING_THRESHOLD = 0.75; // 75%

export default function MacroAlerts() {
    const { targets, getTodaysTotals } = useStore();
    const totals = getTodaysTotals();

    const [dismissedAlerts, setDismissedAlerts] = useState([]);
    const [shownAlerts, setShownAlerts] = useState([]);

    // Calculate percentages
    const fatPercent = totals.fat / targets.fat;
    const sugarPercent = totals.sugar / (targets.sugar || 50);

    // Get current hour to determine if it's "early" in the day
    const currentHour = new Date().getHours();
    const isEarlyDay = currentHour < 16; // Before 4 PM

    // Build alerts list
    useEffect(() => {
        const alerts = [];

        // Fat danger zone
        if (fatPercent >= DANGER_THRESHOLD && !dismissedAlerts.includes('fat-danger')) {
            alerts.push({
                id: 'fat-danger',
                type: 'danger',
                icon: <Flame size={18} />,
                color: '#FF5E5E',
                title: 'Fat Limit Alert! 🚨',
                message: `You've hit ${Math.round(fatPercent * 100)}% of your daily fat (${totals.fat}g/${targets.fat}g)${isEarlyDay ? ' and it\'s still early!' : '.'}`,
                macro: 'fat',
                value: totals.fat,
                target: targets.fat
            });
        } else if (fatPercent >= WARNING_THRESHOLD && fatPercent < DANGER_THRESHOLD && !dismissedAlerts.includes('fat-warning')) {
            alerts.push({
                id: 'fat-warning',
                type: 'warning',
                icon: <Flame size={18} />,
                color: '#FF9F43',
                title: 'Fat Approaching Limit',
                message: `${Math.round(fatPercent * 100)}% of daily fat used (${totals.fat}g/${targets.fat}g)`,
                macro: 'fat',
                value: totals.fat,
                target: targets.fat
            });
        }

        // Sugar danger zone
        if (sugarPercent >= DANGER_THRESHOLD && !dismissedAlerts.includes('sugar-danger')) {
            alerts.push({
                id: 'sugar-danger',
                type: 'danger',
                icon: <Cookie size={18} />,
                color: '#FF5E5E',
                title: 'Sugar Limit Alert! 🚨',
                message: `You've hit ${Math.round(sugarPercent * 100)}% of your daily sugar (${totals.sugar}g/${targets.sugar || 50}g)${isEarlyDay ? ' and it\'s still early!' : '.'}`,
                macro: 'sugar',
                value: totals.sugar,
                target: targets.sugar || 50
            });
        } else if (sugarPercent >= WARNING_THRESHOLD && sugarPercent < DANGER_THRESHOLD && !dismissedAlerts.includes('sugar-warning')) {
            alerts.push({
                id: 'sugar-warning',
                type: 'warning',
                icon: <Cookie size={18} />,
                color: '#FF9F43',
                title: 'Sugar Approaching Limit',
                message: `${Math.round(sugarPercent * 100)}% of daily sugar used (${totals.sugar}g/${targets.sugar || 50}g)`,
                macro: 'sugar',
                value: totals.sugar,
                target: targets.sugar || 50
            });
        }

        setShownAlerts(alerts);
    }, [totals.fat, totals.sugar, targets.fat, targets.sugar, dismissedAlerts, isEarlyDay]);

    const dismissAlert = (alertId) => {
        setDismissedAlerts(prev => [...prev, alertId]);
    };

    if (shownAlerts.length === 0) return null;

    return (
        <motion.div
            className="flex flex-col gap-sm mb-lg"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
        >
            <AnimatePresence>
                {shownAlerts.map((alert) => (
                    <motion.div
                        key={alert.id}
                        initial={{ opacity: 0, x: -50, height: 0 }}
                        animate={{ opacity: 1, x: 0, height: 'auto' }}
                        exit={{ opacity: 0, x: 50, height: 0 }}
                        className="glass-card"
                        style={{
                            padding: '12px 16px',
                            background: alert.type === 'danger'
                                ? 'linear-gradient(135deg, rgba(255, 94, 94, 0.15), rgba(255, 94, 94, 0.05))'
                                : 'linear-gradient(135deg, rgba(255, 159, 67, 0.15), rgba(255, 159, 67, 0.05))',
                            border: `1px solid ${alert.color}40`,
                            borderLeft: `4px solid ${alert.color}`
                        }}
                    >
                        <div className="flex items-start gap-md">
                            <div style={{
                                color: alert.color,
                                marginTop: '2px'
                            }}>
                                {alert.icon}
                            </div>
                            <div style={{ flex: 1 }}>
                                <div className="flex items-center gap-sm mb-xs">
                                    <p style={{
                                        fontWeight: 700,
                                        fontSize: 'var(--font-size-sm)',
                                        color: alert.color
                                    }}>
                                        {alert.title}
                                    </p>
                                    {alert.type === 'danger' && (
                                        <motion.span
                                            animate={{ scale: [1, 1.2, 1] }}
                                            transition={{ repeat: Infinity, duration: 1 }}
                                        >
                                            <AlertTriangle size={14} style={{ color: alert.color }} />
                                        </motion.span>
                                    )}
                                </div>
                                <p style={{
                                    fontSize: 'var(--font-size-xs)',
                                    color: 'var(--text-secondary)',
                                    lineHeight: 1.4
                                }}>
                                    {alert.message}
                                </p>

                                {/* Progress bar */}
                                <div style={{
                                    marginTop: '8px',
                                    height: '6px',
                                    background: 'var(--glass-bg)',
                                    borderRadius: 'var(--radius-full)',
                                    overflow: 'hidden'
                                }}>
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${Math.min((alert.value / alert.target) * 100, 100)}%` }}
                                        style={{
                                            height: '100%',
                                            background: alert.color,
                                            borderRadius: 'var(--radius-full)'
                                        }}
                                    />
                                </div>
                            </div>
                            <motion.button
                                className="btn btn-ghost btn-icon"
                                onClick={() => dismissAlert(alert.id)}
                                whileTap={{ scale: 0.9 }}
                                style={{
                                    padding: '4px',
                                    color: 'var(--text-tertiary)',
                                    marginTop: '-4px',
                                    marginRight: '-8px'
                                }}
                            >
                                <X size={16} />
                            </motion.button>
                        </div>
                    </motion.div>
                ))}
            </AnimatePresence>
        </motion.div>
    );
}
