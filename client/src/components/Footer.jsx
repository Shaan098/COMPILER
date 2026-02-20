import { motion } from 'framer-motion';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    const links = [
        { label: 'GitHub', icon: '⭐', href: '#' },
        { label: 'Docs', icon: '📖', href: '#' },
        { label: 'Report Bug', icon: '🐛', href: '#' },
    ];

    const stats = [
        { label: 'Languages', value: '5+', icon: '🌐' },
        { label: 'Open Source', value: '✓', icon: '💚' },
        { label: 'Uptime', value: '99.9%', icon: '⚡' },
    ];

    return (
        <motion.footer
            className="app-footer"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
        >
            <div className="footer-content">
                <div className="footer-brand">
                    <span className="footer-logo">{'</>'} CodeCompiler</span>
                    <p className="footer-tagline">Write. Compile. Create.</p>
                </div>

                <div className="footer-stats">
                    {stats.map((stat, i) => (
                        <motion.div
                            key={i}
                            className="footer-stat"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 + i * 0.1 }}
                        >
                            <span className="footer-stat-icon">{stat.icon}</span>
                            <span className="footer-stat-value">{stat.value}</span>
                            <span className="footer-stat-label">{stat.label}</span>
                        </motion.div>
                    ))}
                </div>

                <div className="footer-links">
                    {links.map((link, i) => (
                        <motion.a
                            key={i}
                            href={link.href}
                            className="footer-link"
                            whileHover={{ y: -2, scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <span>{link.icon}</span> {link.label}
                        </motion.a>
                    ))}
                </div>
            </div>

            <div className="footer-bottom">
                <span>© {currentYear} CodeCompiler. Built with 💚 and React.</span>
                <span className="footer-version">v2.0</span>
            </div>
        </motion.footer>
    );
};

export default Footer;
