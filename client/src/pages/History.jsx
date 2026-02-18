import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast, { Toaster } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import api from '../config/api';

const cardVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: (i) => ({
        opacity: 1, y: 0, scale: 1,
        transition: { delay: i * 0.06, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }
    }),
    exit: { opacity: 0, scale: 0.9, y: -10, transition: { duration: 0.25 } }
};

const History = () => {
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }
        fetchSubmissions();
    }, [user, navigate]);

    const fetchSubmissions = async () => {
        try {
            const res = await api.get('/submissions/my');
            setSubmissions(res.data.submissions);
        } catch (error) {
            console.error('Error fetching submissions:', error);
        } finally {
            setLoading(false);
        }
    };

    const deleteSubmission = async (id) => {
        if (!window.confirm('Delete this submission?')) return;

        try {
            await api.delete(`/submissions/${id}`);
            setSubmissions(submissions.filter(s => s._id !== id));
            toast.success('Submission deleted', { icon: '🗑️' });
        } catch (error) {
            console.error('Error deleting submission:', error);
            toast.error('Failed to delete');
        }
    };

    const getLanguageIcon = (lang) => {
        const icons = { python: '🐍', javascript: '📜', c: '©️', cpp: '➕', java: '☕' };
        return icons[lang] || '📄';
    };

    const getStatusBadge = (status) => {
        const badges = {
            success: { class: 'badge-success', icon: '✓' },
            compilation_error: { class: 'badge-error', icon: '✗' },
            runtime_error: { class: 'badge-error', icon: '✗' },
            error: { class: 'badge-error', icon: '✗' },
            timeout: { class: 'badge-warning', icon: '⚠' }
        };
        return badges[status] || { class: 'badge-pending', icon: '○' };
    };

    if (loading) {
        return (
            <div className="history-page">
                <motion.div
                    className="loading-spinner"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                >
                    <motion.span
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                        style={{ display: 'inline-block', fontSize: '2rem' }}
                    >
                        ⚙️
                    </motion.span>
                    <p>Loading history...</p>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="history-page">
            <Toaster
                position="top-center"
                toastOptions={{
                    style: {
                        background: 'var(--bg-tertiary)',
                        color: 'var(--text-primary)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '12px',
                        fontSize: '0.9rem',
                        fontWeight: 600,
                        backdropFilter: 'blur(12px)',
                    },
                }}
            />
            <motion.div
                className="history-container"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <motion.h2
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1, duration: 0.4 }}
                >
                    📜 Your Code History
                </motion.h2>

                {submissions.length === 0 ? (
                    <motion.div
                        className="empty-state"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2, duration: 0.4 }}
                    >
                        <motion.div
                            style={{ fontSize: '3rem', marginBottom: '1rem' }}
                            animate={{ y: [0, -8, 0] }}
                            transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                        >
                            📭
                        </motion.div>
                        <p>No submissions yet. Start coding!</p>
                        <motion.button
                            onClick={() => navigate('/')}
                            className="start-coding-btn"
                            whileHover={{ scale: 1.05, y: -2 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            Go to Editor
                        </motion.button>
                    </motion.div>
                ) : (
                    <div className="submissions-list">
                        <AnimatePresence mode="popLayout">
                            {submissions.map((sub, index) => {
                                const badge = getStatusBadge(sub.status);
                                return (
                                    <motion.div
                                        key={sub._id}
                                        className="submission-card"
                                        variants={cardVariants}
                                        initial="hidden"
                                        animate="visible"
                                        exit="exit"
                                        custom={index}
                                        layout
                                        whileHover={{ y: -4, scale: 1.01 }}
                                        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                                    >
                                        <div className="submission-header">
                                            <span className="language-badge">
                                                {getLanguageIcon(sub.language)} {sub.language.toUpperCase()}
                                            </span>
                                            <motion.span
                                                className={`status-badge ${badge.class}`}
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                transition={{ delay: 0.2 + index * 0.06, type: 'spring', stiffness: 400, damping: 15 }}
                                            >
                                                {badge.icon} {sub.status}
                                            </motion.span>
                                        </div>

                                        <pre className="code-preview">
                                            {sub.code.length > 150 ? sub.code.substring(0, 150) + '...' : sub.code}
                                        </pre>

                                        <div className="submission-footer">
                                            <span className="date">
                                                {new Date(sub.createdAt).toLocaleDateString()} at{' '}
                                                {new Date(sub.createdAt).toLocaleTimeString()}
                                            </span>
                                            <div className="actions">
                                                <motion.button
                                                    className="action-btn share"
                                                    onClick={() => {
                                                        const link = `${window.location.origin}/share/${sub.shareId}`;
                                                        navigator.clipboard.writeText(link);
                                                        toast.success('Share link copied!', { icon: '📋' });
                                                    }}
                                                    whileHover={{ scale: 1.08 }}
                                                    whileTap={{ scale: 0.92 }}
                                                >
                                                    📤 Share
                                                </motion.button>
                                                <motion.button
                                                    className="action-btn delete"
                                                    onClick={() => deleteSubmission(sub._id)}
                                                    whileHover={{ scale: 1.08 }}
                                                    whileTap={{ scale: 0.92 }}
                                                >
                                                    🗑️ Delete
                                                </motion.button>
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </div>
                )}
            </motion.div>
        </div>
    );
};

export default History;
