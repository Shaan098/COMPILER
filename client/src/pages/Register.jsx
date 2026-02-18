import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const Register = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [focusedField, setFocusedField] = useState(null);
    const { register } = useAuth();
    const navigate = useNavigate();

    const getPasswordStrength = (pwd) => {
        if (!pwd) return { strength: 0, label: '', color: '' };
        let strength = 0;
        if (pwd.length >= 6) strength += 25;
        if (pwd.length >= 10) strength += 25;
        if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) strength += 25;
        if (/[0-9]/.test(pwd)) strength += 15;
        if (/[^a-zA-Z0-9]/.test(pwd)) strength += 10;

        let label = '';
        let color = '';
        if (strength < 40) { label = 'Weak'; color = '#ff6b6b'; }
        else if (strength < 70) { label = 'Good'; color = '#ffd93d'; }
        else { label = 'Strong'; color = '#00c853'; }

        return { strength: Math.min(strength, 100), label, color };
    };

    const passwordStrength = getPasswordStrength(password);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setLoading(true);

        try {
            await register(username, email, password);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.error || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    const formFields = [
        { id: 'username', label: 'Username', icon: '👤', type: 'text', placeholder: 'Choose a username', value: username, setter: setUsername, minLength: 3, delay: 0.3 },
        { id: 'email', label: 'Email Address', icon: '📧', type: 'email', placeholder: 'Enter your email', value: email, setter: setEmail, delay: 0.35 },
    ];

    return (
        <div className="auth-page">
            <motion.div
                className="auth-card"
                initial={{ opacity: 0, y: 30, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
                <motion.div
                    className="auth-header"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.4 }}
                >
                    <motion.div
                        className="auth-icon"
                        animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
                        transition={{ delay: 0.5, duration: 0.8, ease: 'easeInOut' }}
                    >
                        ✨
                    </motion.div>
                    <h2>Create Account</h2>
                    <p className="auth-subtitle">Join us and start coding today</p>
                </motion.div>

                <AnimatePresence>
                    {error && (
                        <motion.div
                            className="error-message"
                            initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                            animate={{ opacity: 1, height: 'auto', marginBottom: '1rem' }}
                            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            <span className="error-icon">⚠️</span>
                            {error}
                        </motion.div>
                    )}
                </AnimatePresence>

                <form onSubmit={handleSubmit}>
                    {formFields.map((field) => (
                        <motion.div
                            key={field.id}
                            className="form-group"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: field.delay, duration: 0.4 }}
                        >
                            <label htmlFor={field.id}>{field.label}</label>
                            <div className={`input-wrapper ${focusedField === field.id ? 'focused' : ''}`}>
                                <span className="input-icon">{field.icon}</span>
                                <input
                                    id={field.id}
                                    type={field.type}
                                    value={field.value}
                                    onChange={(e) => field.setter(e.target.value)}
                                    onFocus={() => setFocusedField(field.id)}
                                    onBlur={() => setFocusedField(null)}
                                    placeholder={field.placeholder}
                                    required
                                    minLength={field.minLength}
                                    className={field.value ? 'has-value' : ''}
                                />
                            </div>
                        </motion.div>
                    ))}

                    <motion.div
                        className="form-group"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4, duration: 0.4 }}
                    >
                        <label htmlFor="password">Password</label>
                        <div className={`input-wrapper ${focusedField === 'password' ? 'focused' : ''}`}>
                            <span className="input-icon">🔒</span>
                            <input
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                onFocus={() => setFocusedField('password')}
                                onBlur={() => setFocusedField(null)}
                                placeholder="Create a password"
                                required
                                minLength={6}
                                className={password ? 'has-value' : ''}
                            />
                            <button
                                type="button"
                                className="toggle-password"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? '👁️' : '👁️‍🗨️'}
                            </button>
                        </div>
                        <AnimatePresence>
                            {password && (
                                <motion.div
                                    className="password-strength"
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={{ duration: 0.25 }}
                                >
                                    <div className="strength-bar">
                                        <motion.div
                                            className="strength-fill"
                                            initial={{ width: 0 }}
                                            animate={{
                                                width: `${passwordStrength.strength}%`,
                                                backgroundColor: passwordStrength.color
                                            }}
                                            transition={{ duration: 0.4, ease: 'easeOut' }}
                                        />
                                    </div>
                                    <span className="strength-label" style={{ color: passwordStrength.color }}>
                                        {passwordStrength.label}
                                    </span>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>

                    <motion.div
                        className="form-group"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.45, duration: 0.4 }}
                    >
                        <label htmlFor="confirmPassword">Confirm Password</label>
                        <div className={`input-wrapper ${focusedField === 'confirmPassword' ? 'focused' : ''}`}>
                            <span className="input-icon">🔒</span>
                            <input
                                id="confirmPassword"
                                type={showConfirmPassword ? 'text' : 'password'}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                onFocus={() => setFocusedField('confirmPassword')}
                                onBlur={() => setFocusedField(null)}
                                placeholder="Confirm your password"
                                required
                                className={confirmPassword ? 'has-value' : ''}
                            />
                            <button
                                type="button"
                                className="toggle-password"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            >
                                {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                            </button>
                        </div>
                        <AnimatePresence>
                            {confirmPassword && password && (
                                <motion.div
                                    className="password-match"
                                    initial={{ opacity: 0, y: -5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -5 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    {password === confirmPassword ? (
                                        <span className="match-success">✓ Passwords match</span>
                                    ) : (
                                        <span className="match-error">✗ Passwords don't match</span>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>

                    <motion.button
                        type="submit"
                        className={`submit-btn ${loading ? 'loading' : ''}`}
                        disabled={loading}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.55, duration: 0.4 }}
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        {loading ? (
                            <>
                                <span className="btn-spinner"></span>
                                Creating Account...
                            </>
                        ) : (
                            <>
                                <span className="btn-icon">→</span>
                                Create Account
                            </>
                        )}
                    </motion.button>
                </form>

                <motion.p
                    className="auth-footer"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.65 }}
                >
                    Already have an account? <Link to="/login" className="auth-link">Sign in</Link>
                </motion.p>
            </motion.div>
        </div>
    );
};

export default Register;
