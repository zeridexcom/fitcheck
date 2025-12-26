import { NavLink, useLocation } from 'react-router-dom';
import { Home, Camera, Droplets, MessageCircle, Settings } from 'lucide-react';
import { motion } from 'framer-motion';

const navItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/scanner', icon: Camera, label: 'Scan' },
    { path: '/water', icon: Droplets, label: 'Water' },
    { path: '/coach', icon: MessageCircle, label: 'Coach' },
    { path: '/settings', icon: Settings, label: 'More' },
];

export default function BottomNav() {
    const location = useLocation();

    return (
        <nav className="bottom-nav">
            {navItems.map(({ path, icon: Icon, label }) => {
                const isActive = location.pathname === path;

                return (
                    <NavLink
                        key={path}
                        to={path}
                        className={`nav-item ${isActive ? 'active' : ''}`}
                    >
                        <motion.div
                            initial={false}
                            animate={{
                                scale: isActive ? 1.1 : 1,
                                y: isActive ? -2 : 0
                            }}
                            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                        >
                            <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                        </motion.div>
                        <span>{label}</span>
                    </NavLink>
                );
            })}
        </nav>
    );
}
