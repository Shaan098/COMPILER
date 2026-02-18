import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../hooks/useTheme';

const Header = () => {
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const location = useLocation();
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 10);
        window.addEventListener('scroll', onScroll);
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <motion.header
            className="header"
            initial={{ y: -64, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
            style={{
                boxShadow: scrolled ? '0 4px 30px rgba(0,0,0,0.15)' : 'none',
            }}
        >
            <div className="header-content">
                <Link to="/" className="logo">
                    <motion.span
                        className="logo-icon"
                        whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
                        transition={{ duration: 0.4 }}
                    >
                        {'</>'}
                    </motion.span>
                    <span className="logo-text">CodeCompiler</span>
                </Link>

                <nav className="nav-links">
                    {[
                        { to: '/', label: 'Editor', icon: '⚡' },
                        ...(user ? [{ to: '/history', label: 'History', icon: '📜' }] : []),
                    ].map((link) => (
                        <Link key={link.to} to={link.to} className="nav-link" style={{ position: 'relative' }}>
                            <span>{link.icon} {link.label}</span>
                            {location.pathname === link.to && (
                                <motion.div
                                    layoutId="nav-indicator"
                                    style={{
                                        position: 'absolute',
                                        bottom: 0,
                                        left: '10%',
                                        right: '10%',
                                        height: '2px',
                                        background: 'var(--gradient-main)',
                                        borderRadius: '2px',
                                    }}
                                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                                />
                            )}
                        </Link>
                    ))}
                </nav>

                <div className="auth-section">
                    {/* Theme Toggle */}
                    <motion.button
                        className="theme-toggle"
                        onClick={toggleTheme}
                        title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
                        whileTap={{ scale: 0.85, rotate: 180 }}
                        whileHover={{ scale: 1.1 }}
                    >
                        <AnimatePresence mode="wait">
                            <motion.span
                                key={theme}
                                initial={{ y: -20, opacity: 0, rotate: -90 }}
                                animate={{ y: 0, opacity: 1, rotate: 0 }}
                                exit={{ y: 20, opacity: 0, rotate: 90 }}
                                transition={{ duration: 0.2 }}
                            >
                                {theme === 'dark' ? '☀️' : '🌙'}
                            </motion.span>
                        </AnimatePresence>
                    </motion.button>

                    <AnimatePresence mode="wait">
                        {user ? (
                            <motion.div
                                key="user-menu"
                                className="user-menu"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3 }}
                            >
                                <span className="username">👤 {user.username}</span>
                                <motion.button
                                    onClick={handleLogout}
                                    className="logout-btn"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    Logout
                                </motion.button>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="auth-buttons"
                                className="auth-buttons"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3 }}
                            >
                                <Link to="/login" className="auth-btn login">Login</Link>
                                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                    <Link to="/register" className="auth-btn register">Sign Up</Link>
                                </motion.div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </motion.header>
    );
};

export default Header;
