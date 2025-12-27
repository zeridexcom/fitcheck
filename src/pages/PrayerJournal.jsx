import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Heart, Plus, Trash2, X, Check, Calendar, Sparkles } from 'lucide-react';
import useStore from '../stores/useStore';
import { fitnessVerses, getRandomVerse } from '../data/verses';

export default function PrayerJournal() {
    const { prayerJournal = [], addPrayerEntry, deletePrayerEntry, savedVerses = [] } = useStore();

    const [showAddModal, setShowAddModal] = useState(false);
    const [activeTab, setActiveTab] = useState('gratitude'); // 'gratitude', 'prayers', 'verses'
    const [newEntry, setNewEntry] = useState({ type: 'gratitude', items: ['', '', ''], prayer: '' });

    const today = new Date().toISOString().split('T')[0];
    const todaysEntries = prayerJournal.filter(e => e.date === today);

    const handleSaveEntry = () => {
        if (newEntry.type === 'gratitude') {
            const validItems = newEntry.items.filter(i => i.trim());
            if (validItems.length > 0) {
                addPrayerEntry({
                    type: 'gratitude',
                    items: validItems
                });
            }
        } else {
            if (newEntry.prayer.trim()) {
                addPrayerEntry({
                    type: 'prayer',
                    text: newEntry.prayer
                });
            }
        }
        setNewEntry({ type: 'gratitude', items: ['', '', ''], prayer: '' });
        setShowAddModal(false);
    };

    const formatDate = (dateStr) => {
        return new Date(dateStr).toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric'
        });
    };

    return (
        <div className="screen">
            {/* Header */}
            <motion.div
                className="screen-header"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div className="flex items-center gap-md">
                    <div className="icon-badge" style={{ width: 48, height: 48, background: 'rgba(255, 215, 0, 0.15)', color: '#FFD700' }}>
                        <BookOpen size={22} />
                    </div>
                    <div>
                        <h2>Prayer Journal</h2>
                        <p style={{ color: 'var(--text-tertiary)', fontSize: 'var(--font-size-sm)' }}>
                            Gratitude & Spiritual Wellness
                        </p>
                    </div>
                </div>
            </motion.div>

            {/* Tabs */}
            <motion.div
                className="flex gap-sm mb-lg"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
            >
                {[
                    { id: 'gratitude', label: '🙏 Gratitude', color: '#FFD700' },
                    { id: 'prayers', label: '✝️ Prayers', color: '#A855F7' },
                    { id: 'verses', label: '📖 Saved Verses', color: '#00D4FF' }
                ].map((tab) => (
                    <motion.button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        whileTap={{ scale: 0.95 }}
                        className={`glass-card flex-1 ${activeTab === tab.id ? 'active' : ''}`}
                        style={{
                            padding: '12px',
                            cursor: 'pointer',
                            border: activeTab === tab.id ? `2px solid ${tab.color}` : '1px solid var(--glass-border)',
                            background: activeTab === tab.id ? `${tab.color}15` : 'var(--glass-bg)',
                            fontSize: 'var(--font-size-xs)'
                        }}
                    >
                        {tab.label}
                    </motion.button>
                ))}
            </motion.div>

            {/* Add Button */}
            {activeTab !== 'verses' && (
                <motion.button
                    className="btn btn-primary btn-full mb-lg"
                    onClick={() => {
                        setNewEntry({ ...newEntry, type: activeTab === 'gratitude' ? 'gratitude' : 'prayer' });
                        setShowAddModal(true);
                    }}
                    whileTap={{ scale: 0.98 }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                >
                    <Plus size={18} />
                    {activeTab === 'gratitude' ? 'Add Gratitude' : 'Add Prayer Request'}
                </motion.button>
            )}

            {/* Content */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
            >
                {activeTab === 'gratitude' && (
                    <div className="flex flex-col gap-md">
                        {prayerJournal.filter(e => e.type === 'gratitude').length > 0 ? (
                            prayerJournal.filter(e => e.type === 'gratitude').reverse().map((entry, i) => (
                                <motion.div
                                    key={entry.id}
                                    className="glass-card"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                >
                                    <div className="flex justify-between items-start mb-sm">
                                        <span style={{ fontSize: 'var(--font-size-xs)', color: '#FFD700' }}>
                                            {formatDate(entry.date)}
                                        </span>
                                        <motion.button
                                            onClick={() => deletePrayerEntry(entry.id)}
                                            whileTap={{ scale: 0.9 }}
                                            style={{ background: 'none', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer', padding: '4px' }}
                                        >
                                            <Trash2 size={14} />
                                        </motion.button>
                                    </div>
                                    <div className="flex flex-col gap-xs">
                                        {entry.items.map((item, idx) => (
                                            <div key={idx} className="flex items-start gap-sm">
                                                <span style={{ color: '#FFD700' }}>•</span>
                                                <span style={{ fontSize: 'var(--font-size-sm)' }}>{item}</span>
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            ))
                        ) : (
                            <div className="glass-card" style={{ textAlign: 'center', padding: '40px 20px' }}>
                                <span style={{ fontSize: '40px' }}>🙏</span>
                                <p style={{ marginTop: '12px', color: 'var(--text-secondary)' }}>
                                    Start your gratitude practice today
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'prayers' && (
                    <div className="flex flex-col gap-md">
                        {prayerJournal.filter(e => e.type === 'prayer').length > 0 ? (
                            prayerJournal.filter(e => e.type === 'prayer').reverse().map((entry, i) => (
                                <motion.div
                                    key={entry.id}
                                    className="glass-card"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    style={{
                                        borderLeft: '4px solid #A855F7'
                                    }}
                                >
                                    <div className="flex justify-between items-start mb-sm">
                                        <span style={{ fontSize: 'var(--font-size-xs)', color: '#A855F7' }}>
                                            {formatDate(entry.date)}
                                        </span>
                                        <motion.button
                                            onClick={() => deletePrayerEntry(entry.id)}
                                            whileTap={{ scale: 0.9 }}
                                            style={{ background: 'none', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer', padding: '4px' }}
                                        >
                                            <Trash2 size={14} />
                                        </motion.button>
                                    </div>
                                    <p style={{ fontSize: 'var(--font-size-sm)', lineHeight: 1.5 }}>{entry.text}</p>
                                </motion.div>
                            ))
                        ) : (
                            <div className="glass-card" style={{ textAlign: 'center', padding: '40px 20px' }}>
                                <span style={{ fontSize: '40px' }}>✝️</span>
                                <p style={{ marginTop: '12px', color: 'var(--text-secondary)' }}>
                                    Log your prayer requests
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'verses' && (
                    <div className="flex flex-col gap-md">
                        {savedVerses.length > 0 ? (
                            savedVerses.map((verse, i) => (
                                <motion.div
                                    key={i}
                                    className="glass-card"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    style={{
                                        background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.08), transparent)',
                                        borderLeft: '4px solid #FFD700'
                                    }}
                                >
                                    <p style={{ fontSize: 'var(--font-size-sm)', fontStyle: 'italic', lineHeight: 1.5, marginBottom: '8px' }}>
                                        "{verse.text}"
                                    </p>
                                    <p style={{ fontSize: 'var(--font-size-xs)', color: '#FFD700', fontWeight: 600 }}>
                                        — {verse.reference}
                                    </p>
                                </motion.div>
                            ))
                        ) : (
                            <div className="glass-card" style={{ textAlign: 'center', padding: '40px 20px' }}>
                                <span style={{ fontSize: '40px' }}>📖</span>
                                <p style={{ marginTop: '12px', color: 'var(--text-secondary)' }}>
                                    Save verses from the Daily Verse widget
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </motion.div>

            {/* Add Modal */}
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
                            style={{ maxWidth: '360px' }}
                        >
                            <div className="flex justify-between items-center mb-lg">
                                <h3>{newEntry.type === 'gratitude' ? '🙏 3 Things I\'m Grateful For' : '✝️ Prayer Request'}</h3>
                                <button className="btn btn-ghost btn-icon" onClick={() => setShowAddModal(false)}>
                                    <X size={20} />
                                </button>
                            </div>

                            {newEntry.type === 'gratitude' ? (
                                <div className="flex flex-col gap-md mb-lg">
                                    {[0, 1, 2].map((i) => (
                                        <div key={i} className="input-group">
                                            <label className="input-label">
                                                {i + 1}. {['First blessing', 'Second blessing', 'Third blessing'][i]}
                                            </label>
                                            <input
                                                type="text"
                                                className="input"
                                                placeholder={['e.g. My health', 'e.g. My family', 'e.g. This day'][i]}
                                                value={newEntry.items[i]}
                                                onChange={(e) => {
                                                    const items = [...newEntry.items];
                                                    items[i] = e.target.value;
                                                    setNewEntry({ ...newEntry, items });
                                                }}
                                            />
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="input-group mb-lg">
                                    <label className="input-label">Your Prayer</label>
                                    <textarea
                                        className="input"
                                        rows={4}
                                        placeholder="Write your prayer request..."
                                        value={newEntry.prayer}
                                        onChange={(e) => setNewEntry({ ...newEntry, prayer: e.target.value })}
                                        style={{ resize: 'none' }}
                                    />
                                </div>
                            )}

                            <motion.button
                                className="btn btn-primary btn-lg btn-full"
                                onClick={handleSaveEntry}
                                whileTap={{ scale: 0.98 }}
                            >
                                <Check size={20} />
                                Save
                            </motion.button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
