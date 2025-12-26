import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Upload, ArrowLeft, Check, RotateCcw, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useStore from '../stores/useStore';
import { analyzeFoodImage } from '../services/openai';

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
        const file = e.target.files?.[0];
        if (file) {
            setError(null);
            setResult(null);

            // Create preview URL
            setImage(URL.createObjectURL(file));

            // Convert to base64
            const reader = new FileReader();
            reader.onloadend = () => {
                setImageBase64(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleAnalyze = async () => {
        if (!apiKey) {
            setError('Please add your OpenAI API key in Settings to use AI features');
            return;
        }

        if (!imageBase64) return;

        setAnalyzing(true);
        setError(null);

        try {
            const data = await analyzeFoodImage(apiKey, imageBase64);
            setResult(data);
        } catch (err) {
            setError(err.message || 'Failed to analyze image');
        } finally {
            setAnalyzing(false);
        }
    };

    const handleSave = () => {
        if (result) {
            addMeal({
                name: result.name,
                image: image,
                calories: result.calories,
                protein: result.protein,
                carbs: result.carbs,
                fat: result.fat,
                fiber: result.fiber,
                sugar: result.sugar,
                sodium: result.sodium,
                details: result.details,
            });
            navigate('/');
        }
    };

    const handleReset = () => {
        setImage(null);
        setImageBase64(null);
        setResult(null);
        setError(null);
    };

    return (
        <div className="screen">
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
                <div style={{ width: 40 }} />
            </motion.div>

            {/* Upload Area */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleFileSelect}
                    style={{ display: 'none' }}
                />

                <div
                    className="scanner-preview"
                    onClick={() => !image && fileInputRef.current?.click()}
                >
                    {image ? (
                        <>
                            <img src={image} alt="Food" />
                            {analyzing && (
                                <div className="scanner-overlay">
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                                    >
                                        <Sparkles size={40} style={{ color: 'var(--accent-primary)' }} />
                                    </motion.div>
                                    <p>Analyzing with AI...</p>
                                </div>
                            )}
                        </>
                    ) : (
                        <>
                            <Camera size={48} style={{ color: 'var(--text-tertiary)' }} />
                            <p style={{ color: 'var(--text-secondary)' }}>Tap to take photo or upload</p>
                            <p style={{ color: 'var(--text-tertiary)', fontSize: 'var(--font-size-sm)' }}>
                                Food, plates, or nutrition labels
                            </p>
                        </>
                    )}
                </div>

                {/* Action Buttons */}
                {image && !result && (
                    <motion.div
                        className="flex gap-md mt-lg"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <motion.button
                            className="btn btn-secondary flex-1"
                            onClick={handleReset}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <RotateCcw size={18} />
                            Retake
                        </motion.button>

                        <motion.button
                            className="btn btn-primary flex-1"
                            onClick={handleAnalyze}
                            disabled={analyzing}
                            whileHover={{ scale: analyzing ? 1 : 1.02 }}
                            whileTap={{ scale: analyzing ? 1 : 0.98 }}
                        >
                            {analyzing ? (
                                <>
                                    <div className="loading-spinner" style={{ width: 18, height: 18 }} />
                                    Analyzing...
                                </>
                            ) : (
                                <>
                                    <Sparkles size={18} />
                                    Analyze
                                </>
                            )}
                        </motion.button>
                    </motion.div>
                )}

                {/* Error */}
                {error && (
                    <motion.div
                        className="glass-card mt-lg"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        style={{
                            borderColor: 'var(--accent-warning)',
                            background: 'rgba(255, 107, 107, 0.1)'
                        }}
                    >
                        <p style={{ color: 'var(--accent-warning)' }}>{error}</p>
                    </motion.div>
                )}

                {/* Results */}
                <AnimatePresence>
                    {result && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="mt-lg"
                        >
                            <h4 className="mb-md">{result.name}</h4>
                            <p className="text-muted mb-md" style={{ fontSize: 'var(--font-size-sm)' }}>
                                Estimated weight: {result.estimatedWeight}
                            </p>

                            <div className="nutrition-grid">
                                <div className="nutrition-item">
                                    <div className="nutrition-value calories">{result.calories}</div>
                                    <div className="nutrition-label">Calories</div>
                                </div>
                                <div className="nutrition-item">
                                    <div className="nutrition-value protein">{result.protein}g</div>
                                    <div className="nutrition-label">Protein</div>
                                </div>
                                <div className="nutrition-item">
                                    <div className="nutrition-value carbs">{result.carbs}g</div>
                                    <div className="nutrition-label">Carbs</div>
                                </div>
                                <div className="nutrition-item">
                                    <div className="nutrition-value fat">{result.fat}g</div>
                                    <div className="nutrition-label">Fat</div>
                                </div>
                                <div className="nutrition-item">
                                    <div className="nutrition-value">{result.fiber}g</div>
                                    <div className="nutrition-label">Fiber</div>
                                </div>
                                <div className="nutrition-item">
                                    <div className="nutrition-value">{result.sugar}g</div>
                                    <div className="nutrition-label">Sugar</div>
                                </div>
                            </div>

                            {result.details && (
                                <p className="mt-md text-muted" style={{ fontSize: 'var(--font-size-sm)' }}>
                                    {result.details}
                                </p>
                            )}

                            <div className="flex gap-md mt-lg">
                                <motion.button
                                    className="btn btn-secondary flex-1"
                                    onClick={handleReset}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <RotateCcw size={18} />
                                    Scan Another
                                </motion.button>

                                <motion.button
                                    className="btn btn-primary flex-1"
                                    onClick={handleSave}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <Check size={18} />
                                    Log Meal
                                </motion.button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
}
