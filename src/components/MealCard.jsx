import { motion } from 'framer-motion';
import { X } from 'lucide-react';

export default function MealCard({ meal, onDelete }) {
    return (
        <motion.div
            className="meal-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -100 }}
            whileHover={{ scale: 1.02 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        >
            {meal.image ? (
                <img src={meal.image} alt={meal.name} className="meal-card-image" />
            ) : (
                <div className="meal-card-image" style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '24px'
                }}>
                    🍽️
                </div>
            )}

            <div className="meal-card-content">
                <div className="meal-card-name">{meal.name}</div>
                <div className="meal-card-macros">
                    <span className="meal-card-calories">{meal.calories} kcal</span>
                    <span>P: {meal.protein}g</span>
                    <span>C: {meal.carbs}g</span>
                    <span>F: {meal.fat}g</span>
                </div>
                <div className="text-muted" style={{ fontSize: 'var(--font-size-xs)', marginTop: '4px' }}>
                    {meal.time}
                </div>
            </div>

            {onDelete && (
                <motion.button
                    className="btn btn-ghost btn-icon"
                    onClick={() => onDelete(meal.id)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    style={{ width: 32, height: 32 }}
                >
                    <X size={16} />
                </motion.button>
            )}
        </motion.div>
    );
}
