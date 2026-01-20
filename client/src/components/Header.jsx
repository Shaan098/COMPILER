import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const Header = () => {
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <header className="header">
            <div className="header-content">
                <Link to="/" className="logo">
                    <span className="logo-icon">{'</>'}</span>
                    <span className="logo-text">CodeCompiler</span>
                </Link>

                <nav className="nav-links">
                    <Link to="/" className="nav-link">Editor</Link>
                    {user && (
                        <Link to="/history" className="nav-link">History</Link>
                    )}
                </nav>

                <div className="auth-section">
                    {/* Theme Toggle */}
                    <button className="theme-toggle" onClick={toggleTheme} title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}>
                        {theme === 'dark' ? '☀️' : '🌙'}
                    </button>

                    {user ? (
                        <div className="user-menu">
                            <span className="username">👤 {user.username}</span>
                            <button onClick={handleLogout} className="logout-btn">
                                Logout
                            </button>
                        </div>
                    ) : (
                        <div className="auth-buttons">
                            <Link to="/login" className="auth-btn login">Login</Link>
                            <Link to="/register" className="auth-btn register">Sign Up</Link>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;
