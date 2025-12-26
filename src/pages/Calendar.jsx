import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Flame, Droplets, Dumbbell, X } from 'lucide-react';
import useStore from '../stores/useStore';

export default function Calendar() {
    const { meals, workouts, waterIntake, waterGoal, targets } = useStore();

    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(null);

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'];

    // Get days in month
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay();

    // Get data for a specific date
    const getDateData = (date) => {
        const dateStr = date.toISOString().split('T')[0];
        const dayMeals = meals.filter(m => m.date === dateStr);
        const dayWorkouts = workouts.filter(w => w.date === dateStr);
        const dayWater = waterIntake[dateStr] || 0;
        const totalCalories = dayMeals.reduce((sum, m) => sum + (m.calories || 0), 0);

        return { meals: dayMeals, workouts: dayWorkouts, water: dayWater, calories: totalCalories };
    };

    // Get intensity for heatmap
    const getIntensity = (date) => {
        const data = getDateData(date);
        let score = 0;
        if (data.meals.length > 0) score += 1;
        if (data.workouts.length > 0) score += 1;
        if (data.water >= waterGoal) score += 1;
        if (data.calories >= targets.calories * 0.8) score += 1;
        return score;
    };

    const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
    const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

    const today = new Date().toISOString().split('T')[0];

    // Generate calendar days
    const calendarDays = [];

    // Empty cells for days before first day of month
    for (let i = 0; i < firstDayOfMonth; i++) {
        calendarDays.push(null);
    }

    // Days of month
    for (let day = 1; day <= daysInMonth; day++) {
        calendarDays.push(new Date(year, month, day));
    }

    const selectedData = selectedDate ? getDateData(selectedDate) : null;

    return (
        <div className="screen" style={{ position: 'relative', zIndex: 1 }}>
            {/* Header */}
            <motion.div
                className="screen-header"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div>
                    <h2>Calendar</h2>
                    <p style={{ color: 'var(--text-tertiary)', fontSize: 'var(--font-size-sm)' }}>
                        Your fitness journey
                    </p>
                </div>
                <div className="icon-badge icon-badge-secondary">
                    <CalendarIcon size={20} />
                </div>
            </motion.div>

            {/* Month Navigation */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card mb-lg"
                style={{ padding: '16px' }}
            >
                <div className="flex items-center justify-between">
                    <motion.button
                        onClick={prevMonth}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        style={{
                            width: 40, height: 40,
                            borderRadius: '50%',
                            background: 'var(--glass-bg)',
                            border: '1px solid var(--glass-border)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            color: 'var(--text-primary)'
                        }}
                    >
                        <ChevronLeft size={20} />
                    </motion.button>

                    <h3 style={{ fontFamily: 'var(--font-heading)' }}>
                        {monthNames[month]} {year}
                    </h3>

                    <motion.button
                        onClick={nextMonth}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        style={{
                            width: 40, height: 40,
                            borderRadius: '50%',
                            background: 'var(--glass-bg)',
                            border: '1px solid var(--glass-border)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            color: 'var(--text-primary)'
                        }}
                    >
                        <ChevronRight size={20} />
                    </motion.button>
                </div>

                {/* Day Names */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(7, 1fr)',
                    gap: '4px',
                    marginTop: '20px',
                    marginBottom: '8px'
                }}>
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                        <div key={day} style={{
                            textAlign: 'center',
                            fontSize: 'var(--font-size-xs)',
                            color: 'var(--text-tertiary)',
                            fontWeight: 600
                        }}>
                            {day}
                        </div>
                    ))}
                </div>

                {/* Calendar Grid */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(7, 1fr)',
                    gap: '4px'
                }}>
                    {calendarDays.map((date, i) => {
                        if (!date) {
                            return <div key={`empty-${i}`} />;
                        }

                        const dateStr = date.toISOString().split('T')[0];
                        const isToday = dateStr === today;
                        const isSelected = selectedDate?.toISOString().split('T')[0] === dateStr;
                        const intensity = getIntensity(date);
                        const data = getDateData(date);

                        // Color based on intensity
                        const bgColors = [
                            'transparent',
                            'rgba(0, 255, 135, 0.2)',
                            'rgba(0, 255, 135, 0.4)',
                            'rgba(0, 255, 135, 0.6)',
                            'rgba(0, 255, 135, 0.8)',
                        ];

                        return (
                            <motion.button
                                key={dateStr}
                                onClick={() => setSelectedDate(date)}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                                style={{
                                    aspectRatio: '1',
                                    borderRadius: 'var(--radius-sm)',
                                    background: isSelected ? 'var(--accent-primary)' : bgColors[intensity],
                                    border: isToday ? '2px solid var(--accent-secondary)' : '1px solid transparent',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    color: isSelected ? '#fff' : 'var(--text-primary)',
                                    fontWeight: isToday ? 700 : 400,
                                    fontSize: 'var(--font-size-sm)',
                                    position: 'relative'
                                }}
                            >
                                {date.getDate()}

                                {/* Activity indicators */}
                                {(data.meals.length > 0 || data.workouts.length > 0) && !isSelected && (
                                    <div style={{
                                        position: 'absolute',
                                        bottom: 2,
                                        display: 'flex',
                                        gap: '2px'
                                    }}>
                                        {data.meals.length > 0 && (
                                            <div style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--accent-orange)' }} />
                                        )}
                                        {data.workouts.length > 0 && (
                                            <div style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--accent-purple)' }} />
                                        )}
                                    </div>
                                )}
                            </motion.button>
                        );
                    })}
                </div>
            </motion.div>

            {/* Legend */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="flex justify-center gap-lg mb-lg"
            >
                <div className="flex items-center gap-sm">
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent-orange)' }} />
                    <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)' }}>Meals</span>
                </div>
                <div className="flex items-center gap-sm">
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent-purple)' }} />
                    <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)' }}>Workout</span>
                </div>
                <div className="flex items-center gap-sm">
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent-primary)' }} />
                    <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)' }}>Active</span>
                </div>
            </motion.div>

            {/* Selected Date Details */}
            <AnimatePresence>
                {selectedDate && selectedData && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="glass-card"
                        style={{ padding: '20px' }}
                    >
                        <div className="flex items-center justify-between mb-md">
                            <h4>
                                {selectedDate.toLocaleDateString('en-US', {
                                    weekday: 'long',
                                    month: 'short',
                                    day: 'numeric'
                                })}
                            </h4>
                            <motion.button
                                onClick={() => setSelectedDate(null)}
                                whileTap={{ scale: 0.9 }}
                                style={{
                                    width: 32, height: 32,
                                    borderRadius: '50%',
                                    background: 'var(--glass-bg)',
                                    border: 'none',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    color: 'var(--text-secondary)'
                                }}
                            >
                                <X size={16} />
                            </motion.button>
                        </div>

                        {/* Stats Grid */}
                        <div className="nutrition-grid mb-md">
                            <div className="nutrition-item">
                                <Flame size={18} style={{ color: 'var(--accent-orange)', marginBottom: '4px' }} />
                                <div className="nutrition-value" style={{ color: 'var(--accent-orange)' }}>{selectedData.calories}</div>
                                <div className="nutrition-label">Calories</div>
                            </div>
                            <div className="nutrition-item">
                                <Droplets size={18} style={{ color: 'var(--accent-secondary)', marginBottom: '4px' }} />
                                <div className="nutrition-value" style={{ color: 'var(--accent-secondary)' }}>{selectedData.water}ml</div>
                                <div className="nutrition-label">Water</div>
                            </div>
                            <div className="nutrition-item">
                                <Dumbbell size={18} style={{ color: 'var(--accent-purple)', marginBottom: '4px' }} />
                                <div className="nutrition-value" style={{ color: 'var(--accent-purple)' }}>{selectedData.workouts.length}</div>
                                <div className="nutrition-label">Workouts</div>
                            </div>
                        </div>

                        {/* Meals List */}
                        {selectedData.meals.length > 0 && (
                            <div>
                                <h5 style={{ marginBottom: '8px', color: 'var(--text-secondary)' }}>Meals Logged</h5>
                                {selectedData.meals.map((meal, i) => (
                                    <div
                                        key={i}
                                        style={{
                                            padding: '10px',
                                            background: 'var(--glass-bg)',
                                            borderRadius: 'var(--radius-sm)',
                                            marginBottom: '8px',
                                            display: 'flex',
                                            justifyContent: 'space-between'
                                        }}
                                    >
                                        <span>{meal.name}</span>
                                        <span style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>{meal.calories} cal</span>
                                    </div>
                                ))}
                            </div>
                        )}

                        {selectedData.meals.length === 0 && selectedData.workouts.length === 0 && (
                            <p style={{ textAlign: 'center', color: 'var(--text-tertiary)', padding: '20px 0' }}>
                                No activity logged for this day
                            </p>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
