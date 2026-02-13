import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../config/api';

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
        } catch (error) {
            console.error('Error deleting submission:', error);
        }
    };

    const getLanguageIcon = (lang) => {
        const icons = {
            python: '🐍',
            javascript: '📜',
            c: '©️',
            cpp: '➕',
            java: '☕'
        };
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
                <div className="loading-spinner">Loading...</div>
            </div>
        );
    }

    return (
        <div className="history-page">
            <div className="history-container">
                <h2>📜 Your Code History</h2>

                {submissions.length === 0 ? (
                    <div className="empty-state">
                        <p>No submissions yet. Start coding!</p>
                        <button onClick={() => navigate('/')} className="start-coding-btn">
                            Go to Editor
                        </button>
                    </div>
                ) : (
                    <div className="submissions-list">
                        {submissions.map((sub) => {
                            const badge = getStatusBadge(sub.status);
                            return (
                                <div key={sub._id} className="submission-card">
                                    <div className="submission-header">
                                        <span className="language-badge">
                                            {getLanguageIcon(sub.language)} {sub.language.toUpperCase()}
                                        </span>
                                        <span className={`status-badge ${badge.class}`}>
                                            {badge.icon} {sub.status}
                                        </span>
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
                                            <button
                                                className="action-btn share"
                                                onClick={() => {
                                                    const link = `${window.location.origin}/share/${sub.shareId}`;
                                                    navigator.clipboard.writeText(link);
                                                    alert('Share link copied!');
                                                }}
                                            >
                                                📤 Share
                                            </button>
                                            <button
                                                className="action-btn delete"
                                                onClick={() => deleteSubmission(sub._id)}
                                            >
                                                🗑️ Delete
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default History;
