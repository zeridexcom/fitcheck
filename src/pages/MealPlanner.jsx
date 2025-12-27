import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Utensils, RefreshCw, Loader2, ChevronRight, Flame, Zap, Cookie, Droplet, Calendar, Check, X, Sparkles } from 'lucide-react';
import useStore from '../stores/useStore';
import { generateMealPlan, swapMeal } from '../services/openai';

const MEAL_TYPE_ICONS = {
    breakfast: '🌅',
    lunch: '☀️',
    dinner: '🌙',
    snack: '🍎',
};

export default function MealPlanner() {
    const { apiKey, targets, profile } = useStore();

    const [mealPlan, setMealPlan] = useState(null);
    const [loading, setLoading] = useState(false);
    const [swapping, setSwapping] = useState(null);
    const [error, setError] = useState(null);
    const [selectedDay, setSelectedDay] = useState(0);

    const handleGeneratePlan = async () => {
        setLoading(true);
        setError(null);

        try {
            const plan = await generateMealPlan(apiKey, { targets, profile }, 3);
            // Add unique IDs if not present
            plan.days = plan.days.map((day, dayIdx) => ({
                ...day,
                meals: day.meals.map((meal, mealIdx) => ({
                    ...meal,
                    id: meal.id || `day${dayIdx}-meal${mealIdx}-${Date.now()}`
                }))
            }));
            setMealPlan(plan);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSwapMeal = async (dayIndex, mealIndex, meal) => {
        setSwapping(`${dayIndex}-${mealIndex}`);

        try {
            const newMeal = await swapMeal(apiKey, meal);
            newMeal.id = `swapped-${Date.now()}`;

            setMealPlan(prev => {
                const updated = { ...prev };
                updated.days = [...prev.days];
                updated.days[dayIndex] = { ...prev.days[dayIndex] };
                updated.days[dayIndex].meals = [...prev.days[dayIndex].meals];
                updated.days[dayIndex].meals[mealIndex] = newMeal;
                return updated;
            });
        } catch (err) {
            setError(err.message);
        } finally {
            setSwapping(null);
        }
    };

    const currentDay = mealPlan?.days?.[selectedDay];

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
                        <Utensils size={22} />
                    </div>
                    <div>
                        <h2>Meal Planner</h2>
                        <p style={{ color: 'var(--text-tertiary)', fontSize: 'var(--font-size-sm)' }}>
                            AI-powered meal plans
                        </p>
                    </div>
                </div>
            </motion.div>

            {/* Target Summary */}
            <motion.div
                className="glass-card mb-lg"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                style={{ padding: '16px' }}
            >
                <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)', marginBottom: '12px' }}>
                    Daily Targets
                </p>
                <div className="flex justify-between">
                    <div className="flex items-center gap-sm">
                        <Flame size={16} style={{ color: 'var(--accent-primary)' }} />
                        <span style={{ fontWeight: 600 }}>{targets.calories}</span>
                        <span style={{ color: 'var(--text-tertiary)', fontSize: 'var(--font-size-xs)' }}>kcal</span>
                    </div>
                    <div className="flex items-center gap-sm">
                        <Zap size={16} style={{ color: 'var(--accent-secondary)' }} />
                        <span style={{ fontWeight: 600 }}>{targets.protein}g</span>
                        <span style={{ color: 'var(--text-tertiary)', fontSize: 'var(--font-size-xs)' }}>protein</span>
                    </div>
                    <div className="flex items-center gap-sm">
                        <Cookie size={16} style={{ color: 'var(--accent-orange)' }} />
                        <span style={{ fontWeight: 600 }}>{targets.carbs}g</span>
                        <span style={{ color: 'var(--text-tertiary)', fontSize: 'var(--font-size-xs)' }}>carbs</span>
                    </div>
                </div>
            </motion.div>

            {/* Generate Button or Plan */}
            {!mealPlan ? (
                <motion.div
                    className="glass-card"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    style={{ textAlign: 'center', padding: '48px 24px' }}
                >
                    <div className="icon-badge icon-badge-primary" style={{ margin: '0 auto 20px', width: 72, height: 72 }}>
                        <Sparkles size={32} />
                    </div>
                    <h3 style={{ marginBottom: '8px' }}>Generate Your Meal Plan</h3>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', fontSize: 'var(--font-size-sm)' }}>
                        AI will create a personalized 3-day meal plan based on your macros and goals.
                    </p>

                    <motion.button
                        className="btn btn-primary btn-lg"
                        onClick={handleGeneratePlan}
                        disabled={loading}
                        whileTap={{ scale: 0.98 }}
                    >
                        {loading ? (
                            <>
                                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
                                    <Loader2 size={20} />
                                </motion.div>
                                Generating...
                            </>
                        ) : (
                            <>
                                <Sparkles size={20} />
                                Generate 3-Day Plan
                            </>
                        )}
                    </motion.button>

                    {error && (
                        <p style={{ color: 'var(--accent-warning)', marginTop: '16px', fontSize: 'var(--font-size-sm)' }}>
                            {error}
                        </p>
                    )}
                </motion.div>
            ) : (
                <>
                    {/* Day Tabs */}
                    <motion.div
                        className="flex gap-sm mb-lg"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        {mealPlan.days.map((day, i) => (
                            <motion.button
                                key={i}
                                className={`glass-card ${selectedDay === i ? 'active' : ''}`}
                                onClick={() => setSelectedDay(i)}
                                whileTap={{ scale: 0.95 }}
                                style={{
                                    flex: 1,
                                    padding: '12px 8px',
                                    cursor: 'pointer',
                                    border: selectedDay === i ? '2px solid var(--accent-primary)' : '1px solid var(--glass-border)',
                                    background: selectedDay === i ? 'rgba(0, 255, 135, 0.1)' : 'var(--glass-bg)',
                                }}
                            >
                                <Calendar size={16} style={{ margin: '0 auto 4px', color: selectedDay === i ? 'var(--accent-primary)' : 'var(--text-tertiary)' }} />
                                <p style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600 }}>Day {day.day}</p>
                            </motion.button>
                        ))}

                        <motion.button
                            className="glass-card"
                            onClick={handleGeneratePlan}
                            disabled={loading}
                            whileTap={{ scale: 0.95 }}
                            style={{
                                width: 48,
                                padding: '12px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            {loading ? (
                                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
                                    <Loader2 size={18} />
                                </motion.div>
                            ) : (
                                <RefreshCw size={18} style={{ color: 'var(--text-secondary)' }} />
                            )}
                        </motion.button>
                    </motion.div>

                    {/* Day Totals */}
                    {currentDay?.totals && (
                        <motion.div
                            className="glass-card mb-md"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            style={{
                                padding: '12px 16px',
                                background: 'linear-gradient(135deg, rgba(0, 255, 135, 0.05), rgba(0, 212, 255, 0.05))',
                                border: '1px solid rgba(0, 255, 135, 0.2)'
                            }}
                        >
                            <div className="flex justify-between items-center">
                                <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>Day {currentDay.day} totals:</span>
                                <div className="flex gap-md" style={{ fontSize: 'var(--font-size-xs)' }}>
                                    <span><strong style={{ color: 'var(--accent-primary)' }}>{currentDay.totals.calories}</strong> kcal</span>
                                    <span><strong style={{ color: 'var(--accent-secondary)' }}>{currentDay.totals.protein}g</strong> P</span>
                                    <span><strong style={{ color: 'var(--accent-orange)' }}>{currentDay.totals.carbs}g</strong> C</span>
                                    <span><strong>{currentDay.totals.fat}g</strong> F</span>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* Meals List */}
                    <motion.div
                        className="flex flex-col gap-md"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                    >
                        {currentDay?.meals?.map((meal, mealIdx) => (
                            <motion.div
                                key={meal.id}
                                className="glass-card"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.3 + mealIdx * 0.1 }}
                                layout
                            >
                                <div className="flex justify-between items-start mb-md">
                                    <div className="flex items-center gap-md">
                                        <span style={{ fontSize: '28px' }}>{MEAL_TYPE_ICONS[meal.type] || '🍽️'}</span>
                                        <div>
                                            <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)', textTransform: 'capitalize' }}>
                                                {meal.type}
                                            </p>
                                            <p style={{ fontWeight: 600, fontSize: 'var(--font-size-md)' }}>{meal.name}</p>
                                        </div>
                                    </div>

                                    <motion.button
                                        className="btn btn-ghost btn-icon"
                                        onClick={() => handleSwapMeal(selectedDay, mealIdx, meal)}
                                        disabled={swapping === `${selectedDay}-${mealIdx}`}
                                        whileTap={{ scale: 0.9 }}
                                        style={{ color: 'var(--accent-secondary)' }}
                                        title="Swap for similar meal"
                                    >
                                        {swapping === `${selectedDay}-${mealIdx}` ? (
                                            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
                                                <Loader2 size={18} />
                                            </motion.div>
                                        ) : (
                                            <RefreshCw size={18} />
                                        )}
                                    </motion.button>
                                </div>

                                {meal.description && (
                                    <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)', marginBottom: '12px' }}>
                                        {meal.description}
                                    </p>
                                )}

                                {/* Macros */}
                                <div className="flex gap-md" style={{ marginBottom: '12px' }}>
                                    <div className="flex items-center gap-xs" style={{ fontSize: 'var(--font-size-xs)' }}>
                                        <Flame size={12} style={{ color: 'var(--accent-primary)' }} />
                                        <span>{meal.calories} kcal</span>
                                    </div>
                                    <div className="flex items-center gap-xs" style={{ fontSize: 'var(--font-size-xs)' }}>
                                        <span style={{ color: 'var(--accent-secondary)' }}>{meal.protein}g P</span>
                                    </div>
                                    <div className="flex items-center gap-xs" style={{ fontSize: 'var(--font-size-xs)' }}>
                                        <span style={{ color: 'var(--accent-orange)' }}>{meal.carbs}g C</span>
                                    </div>
                                    <div className="flex items-center gap-xs" style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)' }}>
                                        <span>{meal.fat}g F</span>
                                    </div>
                                </div>

                                {/* Ingredients */}
                                {meal.ingredients && meal.ingredients.length > 0 && (
                                    <div className="flex flex-wrap gap-xs">
                                        {meal.ingredients.map((ingredient, i) => (
                                            <span
                                                key={i}
                                                style={{
                                                    padding: '4px 10px',
                                                    borderRadius: 'var(--radius-full)',
                                                    background: 'var(--bg-tertiary)',
                                                    fontSize: 'var(--font-size-xs)',
                                                    color: 'var(--text-tertiary)'
                                                }}
                                            >
                                                {ingredient}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </motion.div>
                        ))}
                    </motion.div>
                </>
            )}
        </div>
    );
}
