import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, RefreshCw, Check, ArrowLeft, Sparkles, AlertCircle, Zap, Scale } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useStore from '../stores/useStore';
import { analyzeFoodImage } from '../services/openai';
import Card3D from '../components/Card3D';
import GlowButton from '../components/GlowButton';
import CameraScanner from '../components/CameraScanner';

export default function Scanner() {
    const navigate = useNavigate();
    const { apiKey, addMeal } = useStore();

    const [showCamera, setShowCamera] = useState(false);
    const [image, setImage] = useState(null);
    const [imageBase64, setImageBase64] = useState(null);
    const [analyzing, setAnalyzing] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    const handleCameraCapture = (imageData) => {
        setImage(imageData);
        setImageBase64(imageData);
        setShowCamera(false);
        setResult(null);
        setError(null);
    };

    const handleAnalyze = async () => {
        if (!imageBase64 || !apiKey) {
            setError('Please capture an image and ensure API key is configured');
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

    // Show camera scanner
    if (showCamera) {
        return (
            <CameraScanner
                onCapture={handleCameraCapture}
                onClose={() => setShowCamera(false)}
            />
        );
    }

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

            {!image ? (
                /* No Image - Show capture options */
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 }}
                    style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}
                >
                    <Card3D className="mb-lg text-center" style={{ padding: '48px 24px' }}>
                        <motion.div
                            animate={{
                                y: [0, -10, 0],
                                scale: [1, 1.05, 1]
                            }}
                            transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                            style={{ marginBottom: '24px' }}
                        >
                            <div
                                className="icon-badge icon-badge-primary"
                                style={{ width: 80, height: 80, margin: '0 auto' }}
                            >
                                <Camera size={36} />
                            </div>
                        </motion.div>

                        <h3 style={{ marginBottom: '8px' }}>AI Food Scanner</h3>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>
                            Point your camera at any food to instantly get nutritional info
                        </p>

                        <GlowButton
                            onClick={() => setShowCamera(true)}
                            className="btn-lg btn-full"
                        >
                            <Camera size={22} />
                            Open Camera
                        </GlowButton>

                        <p style={{ color: 'var(--text-tertiary)', fontSize: 'var(--font-size-sm)', marginTop: '16px' }}>
                            Works with single items or full plates with multiple foods!
                        </p>
                    </Card3D>
                </motion.div>
            ) : (
                /* Image captured - Show preview and results */
                <>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.1 }}
                    >
                        <Card3D className="mb-lg" style={{ padding: 0, overflow: 'hidden' }}>
                            <div style={{ position: 'relative' }}>
                                <img
                                    src={image}
                                    alt="Food"
                                    style={{
                                        width: '100%',
                                        aspectRatio: '4/3',
                                        objectFit: 'cover',
                                        borderRadius: 'var(--radius-lg)'
                                    }}
                                />
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
                                            style={{ fontWeight: 500, color: '#fff' }}
                                        >
                                            Analyzing with AI...
                                        </motion.p>
                                    </motion.div>
                                )}
                            </div>
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

                    {/* Action Buttons - Before analysis */}
                    {!result && (
                        <motion.div
                            className="flex gap-md mb-lg"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                        >
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
                        </motion.div>
                    )}

                    {/* Results */}
                    <AnimatePresence>
                        {result && (
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 30 }}
                            >
                                <Card3D className="mb-lg" glowColor="var(--accent-primary)">
                                    <div className="flex items-center gap-md mb-md">
                                        <motion.div
                                            animate={{ rotate: [0, 360] }}
                                            transition={{ repeat: Infinity, duration: 4, ease: 'linear' }}
                                        >
                                            <Sparkles size={22} style={{ color: 'var(--accent-primary)' }} />
                                        </motion.div>
                                        <div style={{ flex: 1 }}>
                                            <h4 style={{ marginBottom: '2px' }}>{result.name}</h4>
                                        </div>
                                        {result.estimatedWeight && (
                                            <motion.div
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                style={{
                                                    background: 'linear-gradient(135deg, var(--accent-secondary), #0099CC)',
                                                    padding: '6px 14px',
                                                    borderRadius: 'var(--radius-full)',
                                                    fontSize: 'var(--font-size-sm)',
                                                    fontWeight: 600,
                                                    color: '#000',
                                                    boxShadow: '0 4px 15px rgba(0, 212, 255, 0.3)',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '4px'
                                                }}
                                            >
                                                <Scale size={14} />
                                                {result.estimatedWeight}
                                            </motion.div>
                                        )}
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
                </>
            )}
        </div>
    );
}
