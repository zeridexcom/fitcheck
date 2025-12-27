import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Pill, Plus, Check, Clock, Droplets, Zap, X, ChevronDown, History } from 'lucide-react';
import useStore from '../stores/useStore';

const SUPPLEMENT_ICONS = {
    creatine: '💪',
    protein: '🥛',
    bcaa: '⚡',
    multivitamin: '💊',
    omega3: '🐟',
    vitamin_d: '☀️',
    zinc: '🔩',
    magnesium: '🧲',
    caffeine: '☕',
    default: '💊',
};

export default function Supplements() {
    const { supplements, supplementPresets, logSupplement, getTodaySupplements } = useStore();

    const [showAddModal, setShowAddModal] = useState(false);
    const [customName, setCustomName] = useState('');
    const [customAmount, setCustomAmount] = useState('');
    const [customUnit, setCustomUnit] = useState('mg');
    const [showHistory, setShowHistory] = useState(false);

    const todaySupplements = getTodaySupplements();

    // Group today's supplements by name to show count
    const todaySummary = todaySupplements.reduce((acc, supp) => {
        const key = supp.name;
        if (!acc[key]) {
            acc[key] = { ...supp, count: 1 };
        } else {
            acc[key].count++;
        }
        return acc;
    }, {});

    const handleQuickLog = (preset) => {
        logSupplement({
            name: preset.name,
            amount: preset.amount,
            unit: preset.unit,
        });
    };

    const handleCustomLog = () => {
        if (customName && customAmount) {
            logSupplement({
                name: customName,
                amount: parseFloat(customAmount),
                unit: customUnit,
            });
            setCustomName('');
            setCustomAmount('');
            setShowAddModal(false);
        }
    };

    // Get last 7 days history
    const getHistory = () => {
        const last7Days = [];
        for (let i = 0; i < 7; i++) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            const daySupps = supplements.filter(s => s.date === dateStr);
            last7Days.push({
                date: dateStr,
                label: i === 0 ? 'Today' : i === 1 ? 'Yesterday' : date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
                supplements: daySupps,
            });
        }
        return last7Days;
    };

    const history = getHistory();

    return (
        <div className="screen">
            {/* Header */}
            <motion.div
                className="screen-header"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div className="flex items-center gap-md">
                    <div className="icon-badge icon-badge-primary" style={{ width: 48, height: 48 }}>
                        <Pill size={22} />
                    </div>
                    <div>
                        <h2>Supplements</h2>
                        <p style={{ color: 'var(--text-tertiary)', fontSize: 'var(--font-size-sm)' }}>
                            Track your daily stack
                        </p>
                    </div>
                </div>
                <motion.button
                    className="btn btn-ghost btn-icon"
                    onClick={() => setShowHistory(!showHistory)}
                    whileTap={{ scale: 0.9 }}
                    style={{ color: showHistory ? 'var(--accent-primary)' : 'var(--text-secondary)' }}
                >
                    <History size={22} />
                </motion.button>
            </motion.div>

            {/* Today's Summary */}
            <motion.div
                className="glass-card mb-lg"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
            >
                <div className="flex justify-between items-center mb-md">
                    <h4>Today's Stack</h4>
                    <span style={{
                        color: 'var(--accent-primary)',
                        fontSize: 'var(--font-size-sm)',
                        fontWeight: 600
                    }}>
                        {todaySupplements.length} logged
                    </span>
                </div>

                {Object.keys(todaySummary).length > 0 ? (
                    <div className="flex flex-wrap gap-sm">
                        {Object.values(todaySummary).map((supp, i) => (
                            <motion.div
                                key={supp.id}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.1 + i * 0.05 }}
                                style={{
                                    padding: '10px 14px',
                                    borderRadius: 'var(--radius-full)',
                                    background: 'var(--glass-highlight)',
                                    border: '1px solid var(--glass-border)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    fontSize: 'var(--font-size-sm)'
                                }}
                            >
                                <span>{SUPPLEMENT_ICONS[supp.name.toLowerCase().replace(' ', '_')] || SUPPLEMENT_ICONS.default}</span>
                                <span>{supp.name}</span>
                                {supp.count > 1 && (
                                    <span style={{
                                        background: 'var(--accent-primary)',
                                        color: '#000',
                                        borderRadius: '50%',
                                        width: 18,
                                        height: 18,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '10px',
                                        fontWeight: 700
                                    }}>
                                        {supp.count}
                                    </span>
                                )}
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <p style={{ color: 'var(--text-tertiary)', textAlign: 'center', padding: '20px 0' }}>
                        No supplements logged today
                    </p>
                )}
            </motion.div>

            {/* Quick Log Presets */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mb-lg"
            >
                <div className="flex justify-between items-center mb-md">
                    <h4>Quick Log</h4>
                    <motion.button
                        className="btn btn-secondary"
                        onClick={() => setShowAddModal(true)}
                        whileTap={{ scale: 0.95 }}
                        style={{ padding: '8px 14px', fontSize: 'var(--font-size-sm)' }}
                    >
                        <Plus size={16} />
                        Custom
                    </motion.button>
                </div>

                <div className="grid gap-sm" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
                    {supplementPresets.map((preset, i) => (
                        <motion.button
                            key={preset.id}
                            className="glass-card"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 + i * 0.05 }}
                            onClick={() => handleQuickLog(preset)}
                            whileHover={{ scale: 1.02, borderColor: 'var(--accent-primary)' }}
                            whileTap={{ scale: 0.98 }}
                            style={{
                                cursor: 'pointer',
                                textAlign: 'left',
                                padding: '16px',
                                transition: 'border-color 0.2s',
                            }}
                        >
                            <div className="flex items-center gap-md mb-sm">
                                <span style={{ fontSize: '24px' }}>
                                    {SUPPLEMENT_ICONS[preset.id] || SUPPLEMENT_ICONS.default}
                                </span>
                                <div>
                                    <p style={{ fontWeight: 600, marginBottom: '2px' }}>{preset.name}</p>
                                    <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)' }}>
                                        {preset.amount} {preset.unit}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-sm" style={{ color: 'var(--accent-primary)', fontSize: 'var(--font-size-xs)' }}>
                                <Plus size={12} />
                                <span>Tap to log</span>
                            </div>
                        </motion.button>
                    ))}
                </div>
            </motion.div>

            {/* History Section */}
            <AnimatePresence>
                {showHistory && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mb-lg"
                    >
                        <h4 className="mb-md">History</h4>
                        <div className="flex flex-col gap-md">
                            {history.map((day, i) => (
                                <motion.div
                                    key={day.date}
                                    className="glass-card"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    style={{ padding: '14px 16px' }}
                                >
                                    <div className="flex justify-between items-center mb-sm">
                                        <span style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)' }}>
                                            {day.label}
                                        </span>
                                        <span style={{
                                            color: day.supplements.length > 0 ? 'var(--accent-primary)' : 'var(--text-tertiary)',
                                            fontSize: 'var(--font-size-xs)'
                                        }}>
                                            {day.supplements.length} items
                                        </span>
                                    </div>
                                    {day.supplements.length > 0 ? (
                                        <div className="flex flex-wrap gap-xs">
                                            {day.supplements.map((supp, j) => (
                                                <span
                                                    key={supp.id}
                                                    style={{
                                                        padding: '4px 10px',
                                                        borderRadius: 'var(--radius-full)',
                                                        background: 'var(--bg-tertiary)',
                                                        fontSize: 'var(--font-size-xs)',
                                                        color: 'var(--text-secondary)'
                                                    }}
                                                >
                                                    {supp.name}
                                                </span>
                                            ))}
                                        </div>
                                    ) : (
                                        <p style={{ color: 'var(--text-tertiary)', fontSize: 'var(--font-size-xs)' }}>
                                            No supplements
                                        </p>
                                    )}
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Recent Logs (when not showing history) */}
            {!showHistory && todaySupplements.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <h4 className="mb-md">Today's Log</h4>
                    <div className="flex flex-col gap-sm">
                        {todaySupplements.slice().reverse().map((supp, i) => (
                            <motion.div
                                key={supp.id}
                                className="glass-card"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.3 + i * 0.05 }}
                                style={{ padding: '12px 16px' }}
                            >
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-md">
                                        <span style={{ fontSize: '20px' }}>
                                            {SUPPLEMENT_ICONS[supp.name.toLowerCase().replace(' ', '_')] || SUPPLEMENT_ICONS.default}
                                        </span>
                                        <div>
                                            <p style={{ fontWeight: 500 }}>{supp.name}</p>
                                            <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)' }}>
                                                {supp.amount} {supp.unit}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-sm" style={{ color: 'var(--text-tertiary)', fontSize: 'var(--font-size-xs)' }}>
                                        <Clock size={12} />
                                        <span>{supp.time}</span>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            )}

            {/* Add Custom Modal */}
            <AnimatePresence>
                {showAddModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="modal-overlay"
                        onClick={() => setShowAddModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="glass-card glass-card-elevated modal-content"
                            onClick={(e) => e.stopPropagation()}
                            style={{ maxWidth: '340px' }}
                        >
                            <div className="flex justify-between items-center mb-lg">
                                <h3>Log Custom Supplement</h3>
                                <button
                                    className="btn btn-ghost btn-icon"
                                    onClick={() => setShowAddModal(false)}
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="input-group mb-md">
                                <label className="input-label">Supplement Name</label>
                                <input
                                    type="text"
                                    className="input"
                                    placeholder="e.g. Vitamin D"
                                    value={customName}
                                    onChange={(e) => setCustomName(e.target.value)}
                                />
                            </div>

                            <div className="flex gap-md mb-lg">
                                <div className="input-group" style={{ flex: 2 }}>
                                    <label className="input-label">Amount</label>
                                    <input
                                        type="number"
                                        className="input"
                                        placeholder="e.g. 5000"
                                        value={customAmount}
                                        onChange={(e) => setCustomAmount(e.target.value)}
                                    />
                                </div>
                                <div className="input-group" style={{ flex: 1 }}>
                                    <label className="input-label">Unit</label>
                                    <select
                                        className="input"
                                        value={customUnit}
                                        onChange={(e) => setCustomUnit(e.target.value)}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        <option value="mg">mg</option>
                                        <option value="g">g</option>
                                        <option value="mcg">mcg</option>
                                        <option value="IU">IU</option>
                                        <option value="ml">ml</option>
                                        <option value="tablet">tablet</option>
                                        <option value="capsule">capsule</option>
                                    </select>
                                </div>
                            </div>

                            <motion.button
                                className="btn btn-primary btn-lg btn-full"
                                onClick={handleCustomLog}
                                disabled={!customName || !customAmount}
                                whileTap={{ scale: 0.98 }}
                            >
                                <Check size={20} />
                                Log Supplement
                            </motion.button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
