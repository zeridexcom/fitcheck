import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Heart, RefreshCw, Share2 } from 'lucide-react';
import { getDailyVerse, getRandomVerse } from '../data/verses';
import useStore from '../stores/useStore';

export default function DailyVerse({ compact = false }) {
    const { savedVerses = [], saveVerse } = useStore();
    const [verse, setVerse] = useState(getDailyVerse());
    const [isSaved, setIsSaved] = useState(false);

    useEffect(() => {
        setIsSaved(savedVerses?.some(v => v.reference === verse.reference));
    }, [verse, savedVerses]);

    const handleRefresh = () => {
        setVerse(getRandomVerse());
    };

    const handleSave = () => {
        if (saveVerse) {
            saveVerse(verse);
            setIsSaved(true);
        }
    };

    const handleShare = async () => {
        const shareText = `"${verse.text}" - ${verse.reference}`;
        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'Daily Bible Verse',
                    text: shareText
                });
            } catch (err) {
                console.log('Share cancelled');
            }
        } else {
            navigator.clipboard.writeText(shareText);
        }
    };

    if (compact) {
        return (
            <motion.div
                className="glass-card"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                    padding: '16px',
                    marginBottom: 'var(--spacing-lg)',
                    background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.08), rgba(255, 255, 255, 0.02))',
                    borderLeft: '4px solid #FFD700'
                }}
            >
                <div className="flex items-start gap-md">
                    <span style={{ fontSize: '20px' }}>✝️</span>
                    <div style={{ flex: 1 }}>
                        <p style={{
                            fontSize: 'var(--font-size-sm)',
                            fontStyle: 'italic',
                            lineHeight: 1.5,
                            color: 'var(--text-secondary)'
                        }}>
                            "{verse.text.length > 120 ? verse.text.substring(0, 120) + '...' : verse.text}"
                        </p>
                        <p style={{
                            fontSize: 'var(--font-size-xs)',
                            color: '#FFD700',
                            marginTop: '8px',
                            fontWeight: 600
                        }}>
                            — {verse.reference}
                        </p>
                    </div>
                </div>
            </motion.div>
        );
    }

    return (
        <motion.div
            className="glass-card"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
                padding: '20px',
                marginBottom: 'var(--spacing-lg)',
                background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.1), rgba(255, 255, 255, 0.02))',
                border: '1px solid rgba(255, 215, 0, 0.2)'
            }}
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-md">
                <div className="flex items-center gap-sm">
                    <div style={{
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        background: 'rgba(255, 215, 0, 0.15)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <BookOpen size={16} style={{ color: '#FFD700' }} />
                    </div>
                    <span style={{
                        fontSize: 'var(--font-size-sm)',
                        color: '#FFD700',
                        fontWeight: 600
                    }}>
                        Daily Verse
                    </span>
                </div>
                <div className="flex items-center gap-xs">
                    <motion.button
                        onClick={handleRefresh}
                        whileTap={{ scale: 0.9, rotate: 180 }}
                        style={{
                            background: 'none',
                            border: 'none',
                            padding: '6px',
                            cursor: 'pointer',
                            color: 'var(--text-tertiary)'
                        }}
                    >
                        <RefreshCw size={16} />
                    </motion.button>
                    <motion.button
                        onClick={handleShare}
                        whileTap={{ scale: 0.9 }}
                        style={{
                            background: 'none',
                            border: 'none',
                            padding: '6px',
                            cursor: 'pointer',
                            color: 'var(--text-tertiary)'
                        }}
                    >
                        <Share2 size={16} />
                    </motion.button>
                    <motion.button
                        onClick={handleSave}
                        whileTap={{ scale: 0.9 }}
                        style={{
                            background: 'none',
                            border: 'none',
                            padding: '6px',
                            cursor: 'pointer',
                            color: isSaved ? '#FF6B9D' : 'var(--text-tertiary)'
                        }}
                    >
                        <Heart size={16} fill={isSaved ? '#FF6B9D' : 'transparent'} />
                    </motion.button>
                </div>
            </div>

            {/* Verse Text */}
            <motion.p
                key={verse.reference}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{
                    fontSize: 'var(--font-size-md)',
                    fontStyle: 'italic',
                    lineHeight: 1.6,
                    color: 'var(--text-primary)',
                    marginBottom: '12px'
                }}
            >
                "{verse.text}"
            </motion.p>

            {/* Reference */}
            <p style={{
                fontSize: 'var(--font-size-sm)',
                color: '#FFD700',
                fontWeight: 600,
                textAlign: 'right'
            }}>
                — {verse.reference}
            </p>
        </motion.div>
    );
}
