import { motion } from 'framer-motion';

export default function GlowButton({ children, onClick, className = '', disabled = false, variant = 'primary' }) {
    const variants = {
        primary: {
            bg: 'linear-gradient(135deg, #00FF87, #00CC6A)',
            glow: 'rgba(0, 255, 135, 0.4)',
            text: '#ffffff'
        },
        secondary: {
            bg: 'linear-gradient(135deg, #00D4FF, #0099CC)',
            glow: 'rgba(0, 212, 255, 0.4)',
            text: '#ffffff'
        },
        danger: {
            bg: 'linear-gradient(135deg, #FF5E5E, #CC4444)',
            glow: 'rgba(255, 94, 94, 0.4)',
            text: '#ffffff'
        }
    };

    const v = variants[variant] || variants.primary;

    return (
        <motion.button
            className={`btn ${className}`}
            onClick={onClick}
            disabled={disabled}
            whileHover={{
                scale: disabled ? 1 : 1.03,
                boxShadow: disabled ? 'none' : `0 0 40px ${v.glow}, 0 0 80px ${v.glow}`
            }}
            whileTap={{ scale: disabled ? 1 : 0.97 }}
            animate={{
                boxShadow: disabled ? 'none' : [`0 0 20px ${v.glow}`, `0 0 40px ${v.glow}`, `0 0 20px ${v.glow}`]
            }}
            transition={{
                boxShadow: { repeat: Infinity, duration: 2, ease: 'easeInOut' }
            }}
            style={{
                background: v.bg,
                color: v.text,
                border: 'none',
                position: 'relative',
                overflow: 'hidden',
                opacity: disabled ? 0.5 : 1,
                cursor: disabled ? 'not-allowed' : 'pointer',
                fontWeight: 700,
                textShadow: variant === 'danger' ? 'none' : '0 1px 2px rgba(0,0,0,0.3)'
            }}
        >
            {/* Shimmer effect */}
            {!disabled && (
                <motion.div
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: '-100%',
                        width: '100%',
                        height: '100%',
                        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
                    }}
                    animate={{ left: ['-100%', '200%'] }}
                    transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut', repeatDelay: 0.5 }}
                />
            )}
            <span style={{
                position: 'relative',
                zIndex: 1,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                color: v.text,
                fontWeight: 700
            }}>
                {children}
            </span>
        </motion.button>
    );
}
