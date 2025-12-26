import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Upload, RefreshCw, Check, ArrowLeft, Sparkles, AlertCircle, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useStore from '../stores/useStore';
import { analyzeFoodImage } from '../services/openai';
import Card3D from '../components/Card3D';
import GlowButton from '../components/GlowButton';

export default function Scanner() {
    const navigate = useNavigate();
    const fileInputRef = useRef(null);
    const { apiKey, addMeal } = useStore();

    const [image, setImage] = useState(null);
    const [imageBase64, setImageBase64] = useState(null);
    const [analyzing, setAnalyzing] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(URL.createObjectURL(file));
            setResult(null);
            setError(null);

            const reader = new FileReader();
            reader.onload = (ev) => {
                setImageBase64(ev.target.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleAnalyze = async () => {
        if (!imageBase64 || !apiKey) {
            setError('Please upload an image and ensure API key is configured');
            return;
        }

        setAnalyzing(true);
        setError(null);

        try {
            const data = await analyzeFoodImage(apiKey, imageBase64);
            setResult(data);
        } catch (err) {
            console.error('Analysis error:', err);
            setError(err.message || 'Failed to analyze image. Please try again.');
        } finally {
            setAnalyzing(false);
        }
    };

    const handleSave = () => {
        if (result) {
            addMeal({
                name: result.name,
                calories: result.calories || 0,
                protein: result.protein || 0,
                carbs: result.carbs || 0,
                fat: result.fat || 0,
                image: image,
            });
            navigate('/');
        }
    };

    const handleRetake = () => {
        setImage(null);
        setImageBase64(null);
        setResult(null);
        setError(null);
    };

    return (
        <div className="screen" style={{ position: 'relative', zIndex: 1 }}>
            {/* Header */}
            <motion.div
                className="screen-header"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <motion.button
                    className="btn btn-ghost"
                    onClick={() => navigate('/')}
                    whileTap={{ scale: 0.95 }}
                    style={{ marginLeft: '-12px' }}
                >
                    <ArrowLeft size={20} />
                </motion.button>
                <h3 className="screen-title">Scan Food</h3>
                <div style={{ width: 48 }} />
            </motion.div>

            {/* Camera/Upload Area */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
            >
                <Card3D className="mb-lg" style={{ padding: 0, overflow: 'hidden' }}>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        capture="environment"
                        onChange={handleFileSelect}
                        style={{ display: 'none' }}
                    />

                    <motion.div
                        className="scanner-preview"
                        onClick={() => fileInputRef.current?.click()}
                        style={{
                            aspectRatio: '1',
                            borderRadius: 'var(--radius-lg)',
                            cursor: 'pointer',
                            minHeight: '280px'
                        }}
                        whileHover={{
                            borderColor: 'var(--accent-primary)',
                            background: 'rgba(0, 255, 135, 0.05)'
                        }}
                    >
                        {image ? (
                            <>
                                <img src={image} alt="Food" />
                                {analyzing && (
                                    <motion.div
                                        className="scanner-overlay"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                    >
                                        <motion.div
                                            animate={{ rotate: 360 }}
                                            transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
                                        >
                                            <Sparkles size={40} style={{ color: 'var(--accent-primary)' }} />
                                        </motion.div>
                                        <motion.p
                                            animate={{ opacity: [0.5, 1, 0.5] }}
                                            transition={{ repeat: Infinity, duration: 1.5 }}
                                            style={{ fontWeight: 500 }}
                                        >
                                            Analyzing with AI...
                                        </motion.p>
                                    </motion.div>
                                )}
                            </>
                        ) : (
                            <>
                                <motion.div
                                    animate={{
                                        y: [0, -10, 0],
                                        scale: [1, 1.05, 1]
                                    }}
                                    transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                                >
                                    <Camera size={56} style={{ color: 'var(--accent-primary)' }} />
                                </motion.div>
                                <div style={{ textAlign: 'center' }}>
                                    <p style={{ color: 'var(--text-secondary)', fontWeight: 500, marginBottom: '4px' }}>
                                        Tap to take a photo
                                    </p>
                                    <p style={{ color: 'var(--text-tertiary)', fontSize: 'var(--font-size-sm)' }}>
                                        or upload from gallery
                                    </p>
                                </div>

                                {/* Scanning animation lines */}
                                <motion.div
                                    style={{
                                        position: 'absolute',
                                        inset: 0,
                                        borderRadius: 'inherit',
                                        overflow: 'hidden',
                                        pointerEvents: 'none'
                                    }}
                                >
                                    <motion.div
                                        style={{
                                            position: 'absolute',
                                            left: '10%',
                                            right: '10%',
                                            height: '2px',
                                            background: 'linear-gradient(90deg, transparent, var(--accent-primary), transparent)',
                                            boxShadow: '0 0 20px var(--accent-primary)'
                                        }}
                                        animate={{ top: ['20%', '80%', '20%'] }}
                                        transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
                                    />
                                </motion.div>
                            </>
                        )}
                    </motion.div>
                </Card3D>
            </motion.div>

            {/* Error Message */}
            <AnimatePresence>
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="glass-card mb-md"
                        style={{
                            padding: '16px',
                            borderColor: 'var(--accent-warning)',
                            background: 'rgba(255, 94, 94, 0.1)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px'
                        }}
                    >
                        <AlertCircle size={20} style={{ color: 'var(--accent-warning)' }} />
                        <p style={{ color: 'var(--accent-warning)', fontSize: 'var(--font-size-sm)', margin: 0 }}>
                            {error}
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Action Buttons */}
            <motion.div
                className="flex gap-md mb-lg"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
            >
                {image && !result && (
                    <>
                        <motion.button
                            className="btn btn-secondary flex-1"
                            onClick={handleRetake}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <RefreshCw size={18} />
                            Retake
                        </motion.button>
                        <GlowButton
                            onClick={handleAnalyze}
                            disabled={analyzing}
                            className="btn-lg flex-1"
                        >
                            {analyzing ? (
                                <>
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                                    >
                                        <Sparkles size={18} />
                                    </motion.div>
                                    Analyzing...
                                </>
                            ) : (
                                <>
                                    <Zap size={18} />
                                    Analyze
                                </>
                            )}
                        </GlowButton>
                    </>
                )}
            </motion.div>

            {/* Results */}
            <AnimatePresence>
                {result && (
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 30 }}
                    >
                        <Card3D className="mb-lg" glowColor="var(--accent-primary)">
                            <div className="flex items-center gap-md mb-lg">
                                <motion.div
                                    animate={{ rotate: [0, 360] }}
                                    transition={{ repeat: Infinity, duration: 4, ease: 'linear' }}
                                >
                                    <Sparkles size={22} style={{ color: 'var(--accent-primary)' }} />
                                </motion.div>
                                <div>
                                    <h4 style={{ marginBottom: '2px' }}>{result.name}</h4>
                                    <p style={{ color: 'var(--text-tertiary)', fontSize: 'var(--font-size-sm)', margin: 0 }}>
                                        {result.estimatedWeight || 'Portion analyzed'}
                                    </p>
                                </div>
                            </div>

                            {/* Main Calories */}
                            <motion.div
                                className="text-center mb-lg"
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.2, type: 'spring' }}
                            >
                                <motion.h1
                                    className="text-gradient"
                                    style={{ fontSize: '56px', marginBottom: '4px' }}
                                    animate={{
                                        textShadow: ['0 0 20px rgba(0,255,135,0.3)', '0 0 40px rgba(0,255,135,0.5)', '0 0 20px rgba(0,255,135,0.3)']
                                    }}
                                    transition={{ repeat: Infinity, duration: 2 }}
                                >
                                    {result.calories}
                                </motion.h1>
                                <p style={{ color: 'var(--text-tertiary)', fontSize: 'var(--font-size-sm)' }}>calories</p>
                            </motion.div>

                            {/* Macros Grid */}
                            <div className="nutrition-grid">
                                {[
                                    { label: 'Protein', value: result.protein, unit: 'g', color: 'var(--accent-orange)' },
                                    { label: 'Carbs', value: result.carbs, unit: 'g', color: 'var(--accent-secondary)' },
                                    { label: 'Fat', value: result.fat, unit: 'g', color: 'var(--accent-purple)' },
                                    { label: 'Fiber', value: result.fiber || 0, unit: 'g', color: 'var(--accent-primary)' },
                                ].map((item, i) => (
                                    <motion.div
                                        key={item.label}
                                        className="nutrition-item"
                                        style={{ color: item.color }}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.3 + i * 0.1 }}
                                        whileHover={{ scale: 1.05 }}
                                    >
                                        <div className="nutrition-value" style={{ color: item.color }}>
                                            {item.value}{item.unit}
                                        </div>
                                        <div className="nutrition-label">{item.label}</div>
                                    </motion.div>
                                ))}
                            </div>

                            {result.details && (
                                <motion.p
                                    style={{
                                        color: 'var(--text-tertiary)',
                                        fontSize: 'var(--font-size-sm)',
                                        marginTop: 'var(--spacing-lg)',
                                        textAlign: 'center',
                                        fontStyle: 'italic'
                                    }}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.5 }}
                                >
                                    "{result.details}"
                                </motion.p>
                            )}
                        </Card3D>

                        {/* Save Button */}
                        <div className="flex gap-md">
                            <motion.button
                                className="btn btn-secondary flex-1"
                                onClick={handleRetake}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <RefreshCw size={18} />
                                Retake
                            </motion.button>
                            <GlowButton
                                onClick={handleSave}
                                className="btn-lg flex-1"
                            >
                                <Check size={18} />
                                Save Meal
                            </GlowButton>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
