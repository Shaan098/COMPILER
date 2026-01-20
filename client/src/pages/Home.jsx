import { useState } from 'react';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import CodeEditor from '../components/CodeEditor';
import OutputPanel from '../components/OutputPanel';

const API_URL = 'http://localhost:5000/api';

const DEFAULT_CODE = `# Python Code
print("Hello, World!")`;

const Home = () => {
    const [code, setCode] = useState(DEFAULT_CODE);
    const [language, setLanguage] = useState('python');
    const [output, setOutput] = useState('');
    const [status, setStatus] = useState(null);
    const [executionTime, setExecutionTime] = useState(null);
    const [memory, setMemory] = useState(null);
    const [shareId, setShareId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [showOutput, setShowOutput] = useState(false);

    const runCode = async () => {
        setLoading(true);
        setOutput('');
        setStatus(null);
        setShareId(null);

        try {
            const response = await axios.post(`${API_URL}/compile/run`, {
                code,
                language
            });

            const data = response.data;
            setOutput(data.output);
            setStatus(data.status);
            setExecutionTime(data.executionTime);
            setMemory(data.memory);
            setShareId(data.shareId);
            setShowOutput(true); // Show output panel after running

            if (data.status === 'success') {
                toast.success('Code executed successfully!', {
                    icon: '✅',
                    duration: 3000
                });
            } else {
                toast.error('Execution failed', {
                    icon: '❌',
                    duration: 3000
                });
            }
        } catch (error) {
            console.error('Error:', error);
            setOutput(error.response?.data?.error || 'An error occurred while running the code');
            setStatus('error');
            setShowOutput(true);
            toast.error('Error running code');
        } finally {
            setLoading(false);
        }
    };

    const handleShare = async () => {
        if (shareId) {
            const link = `${window.location.origin}/share/${shareId}`;
            try {
                await navigator.clipboard.writeText(link);
                toast.success('Share link copied!', { icon: '📋' });
            } catch (err) {
                const textArea = document.createElement('textarea');
                textArea.value = link;
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
                toast.success('Share link copied!');
            }
        } else {
            toast.error('Run your code first to get a share link');
        }
    };

    const closeOutput = () => {
        setShowOutput(false);
    };

    return (
        <div className="home-page">
            <Toaster
                position="top-center"
                toastOptions={{
                    style: {
                        background: '#1a1a2e',
                        color: '#fff',
                        border: '1px solid #4a4a6a',
                        borderRadius: '12px',
                        padding: '12px 20px',
                    },
                }}
            />

            {/* Full Screen Editor */}
            <div className="full-editor-container">
                <CodeEditor
                    code={code}
                    setCode={setCode}
                    language={language}
                    setLanguage={setLanguage}
                    onRun={runCode}
                    loading={loading}
                />
            </div>

            {/* Sliding Output Panel */}
            <div className={`output-overlay ${showOutput ? 'visible' : ''}`}>
                <div className={`output-slide-panel ${showOutput ? 'open' : ''}`}>
                    <button className="close-output-btn" onClick={closeOutput}>
                        ✕ Close
                    </button>
                    <OutputPanel
                        output={output}
                        status={status}
                        executionTime={executionTime}
                        memory={memory}
                        shareId={shareId}
                        onShare={handleShare}
                    />
                </div>
            </div>
        </div>
    );
};

export default Home;
