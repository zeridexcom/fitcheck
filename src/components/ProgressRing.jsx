import { motion } from 'framer-motion';

export default function ProgressRing({
    progress,
    size = 100,
    strokeWidth = 8,
    color = 'var(--accent-primary)',
    children
}) {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (Math.min(progress, 100) / 100) * circumference;

    return (
        <div className="progress-ring" style={{ width: size, height: size }}>
            <svg width={size} height={size}>
                <circle
                    className="progress-ring-bg"
                    strokeWidth={strokeWidth}
                    r={radius}
                    cx={size / 2}
                    cy={size / 2}
                />
                <motion.circle
                    className="progress-ring-progress"
                    strokeWidth={strokeWidth}
                    r={radius}
                    cx={size / 2}
                    cy={size / 2}
                    stroke={color}
                    strokeDasharray={circumference}
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset: offset }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                />
            </svg>
            <div className="progress-ring-content">
                {children}
            </div>
        </div>
    );
}
