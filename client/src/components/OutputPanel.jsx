import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const OutputPanel = ({ output, status, executionTime, memory, shareId, onShare, onClear }) => {
    const [copied, setCopied] = useState(false);

    const getStatusColor = () => {
        switch (status) {
            case 'success': return 'status-success';
            case 'compilation_error':
            case 'runtime_error':
            case 'error': return 'status-error';
            case 'timeout': return 'status-warning';
            default: return 'status-pending';
        }
    };

    const getStatusLabel = () => {
        switch (status) {
            case 'success': return '✓ Success';
            case 'compilation_error': return '✗ Compilation Error';
            case 'runtime_error': return '✗ Runtime Error';
            case 'error': return '✗ Error';
            case 'timeout': return '⚠ Time Limit Exceeded';
            default: return '● Ready';
        }
    };

    const handleCopy = async () => {
        if (!output) return;
        try {
            await navigator.clipboard.writeText(output);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            const ta = document.createElement('textarea');
            ta.value = output;
            document.body.appendChild(ta);
            ta.select();
            document.execCommand('copy');
            document.body.removeChild(ta);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const lineCount = output ? output.split('\n').length : 0;

    return (
        <div className="output-panel">
            <div className="output-header">
                <h3>Terminal</h3>
                <div className="output-meta">
                    <AnimatePresence mode="wait">
                        {status && (
                            <motion.span
                                key={status}
                                className={`status-badge ${getStatusColor()}`}
                                initial={{ opacity: 0, scale: 0.8, y: -5 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.8, y: 5 }}
                                transition={{ duration: 0.25, ease: 'easeOut' }}
                            >
                                {getStatusLabel()}
                            </motion.span>
                        )}
                    </AnimatePresence>
                    {executionTime && (
                        <motion.span
                            className="meta-item"
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 }}
                        >
                            ⏱ {executionTime.toFixed(0)}ms
                        </motion.span>
                    )}
                    {memory && (
                        <motion.span
                            className="meta-item"
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            💾 {(memory / 1024).toFixed(2)}MB
                        </motion.span>
                    )}
                    {shareId && onShare && (
                        <motion.button
                            className="share-button"
                            onClick={onShare}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 }}
                        >
                            📤 Share
                        </motion.button>
                    )}
                </div>
            </div>

            {/* Action toolbar */}
            <AnimatePresence>
                {output && (
                    <motion.div
                        className="output-toolbar"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.25 }}
                    >
                        <span className="output-line-count">
                            {lineCount} line{lineCount !== 1 ? 's' : ''}
                        </span>
                        <div className="output-actions">
                            <motion.button
                                className={`output-action-btn ${copied ? 'copied' : ''}`}
                                onClick={handleCopy}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.92 }}
                                title="Copy output"
                            >
                                {copied ? '✅ Copied!' : '📋 Copy'}
                            </motion.button>
                            {onClear && (
                                <motion.button
                                    className="output-action-btn clear"
                                    onClick={onClear}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.92 }}
                                    title="Clear output"
                                >
                                    🧹 Clear
                                </motion.button>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className={`output-content ${status === 'success' ? 'success' : status ? 'error' : ''}`}>
                <AnimatePresence mode="wait">
                    {output ? (
                        <motion.pre
                            key={output}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.35, ease: 'easeOut' }}
                        >
                            {output}
                        </motion.pre>
                    ) : (
                        <motion.div
                            key="placeholder"
                            className="output-empty-state"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                        >
                            <motion.div
                                className="empty-terminal-icon"
                                animate={{ opacity: [0.3, 0.6, 0.3] }}
                                transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
                            >
                                {'>'}_
                            </motion.div>
                            <p className="placeholder">Run your code to see output here...</p>
                            <span className="placeholder-hint">Press Ctrl + Enter to run</span>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default OutputPanel;
