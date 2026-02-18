import { motion, AnimatePresence } from 'framer-motion';

const OutputPanel = ({ output, status, executionTime, memory, shareId, onShare }) => {
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
                        <motion.p
                            key="placeholder"
                            className="placeholder"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                        >
                            Run your code to see output here...
                        </motion.p>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default OutputPanel;
