import { useState, useEffect } from 'react';
import { ThemeContext } from '../hooks/useTheme';

export const ThemeProvider = ({ children }) => {
    // initialize theme from localStorage (or default) and apply it synchronously
    const [theme, setTheme] = useState(() => {
        const saved = localStorage.getItem('theme');
        const initial = saved || 'dark';
        // make sure the document has the correct attribute right away to avoid
        // a flash of the wrong theme on first render
        if (typeof document !== 'undefined') {
            document.documentElement.setAttribute('data-theme', initial);
        }
        return initial;
    });

    useEffect(() => {
        localStorage.setItem('theme', theme);
        document.documentElement.setAttribute('data-theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prev => prev === 'dark' ? 'light' : 'dark');
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};
