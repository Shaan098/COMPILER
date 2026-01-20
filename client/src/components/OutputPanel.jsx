const OutputPanel = ({ output, status, executionTime, memory, shareId, onShare }) => {
    const getStatusColor = () => {
        switch (status) {
            case 'success':
                return 'status-success';
            case 'compilation_error':
            case 'runtime_error':
            case 'error':
                return 'status-error';
            case 'timeout':
                return 'status-warning';
            default:
                return 'status-pending';
        }
    };

    const getStatusLabel = () => {
        switch (status) {
            case 'success':
                return '✓ Success';
            case 'compilation_error':
                return '✗ Compilation Error';
            case 'runtime_error':
                return '✗ Runtime Error';
            case 'error':
                return '✗ Error';
            case 'timeout':
                return '⚠ Time Limit Exceeded';
            default:
                return 'Ready';
        }
    };

    return (
        <div className="output-panel">
            <div className="output-header">
                <h3>Output</h3>
                <div className="output-meta">
                    {status && (
                        <span className={`status-badge ${getStatusColor()}`}>
                            {getStatusLabel()}
                        </span>
                    )}
                    {executionTime && (
                        <span className="meta-item">
                            ⏱ {executionTime.toFixed(0)}ms
                        </span>
                    )}
                    {memory && (
                        <span className="meta-item">
                            💾 {(memory / 1024).toFixed(2)}MB
                        </span>
                    )}
                    {shareId && (
                        <button className="share-button" onClick={onShare}>
                            📤 Share
                        </button>
                    )}
                </div>
            </div>
            <div className={`output-content ${status === 'success' ? 'success' : status ? 'error' : ''}`}>
                {output ? (
                    <pre>{output}</pre>
                ) : (
                    <p className="placeholder">Run your code to see output here...</p>
                )}
            </div>
        </div>
    );
};

export default OutputPanel;
