import { useState, useRef } from 'react';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import CodeEditor from '../components/CodeEditor';
import OutputPanel from '../components/OutputPanel';
import API_URL from '../config/api';

const DEFAULT_CODE = `# Python Code
print("Hello, World!")`;

const LANGUAGES = [
    { id: 'python', name: 'Python', icon: '🐍', color: '#3776ab' },
    { id: 'javascript', name: 'JavaScript', icon: '📜', color: '#f7df1e' },
    { id: 'c', name: 'C', icon: '©️', color: '#a8b9cc' },
    { id: 'cpp', name: 'C++', icon: '➕', color: '#00599c' },
    { id: 'java', name: 'Java', icon: '☕', color: '#ea2d2e' }
];

const FEATURES = [
    {
        icon: '⚡',
        title: 'Lightning Fast',
        description: 'AI-powered code execution with instant results'
    },
    {
        icon: '🌐',
        title: 'Multi-Language',
        description: 'Support for C, C++, Python, Java & JavaScript'
    },
    {
        icon: '🔗',
        title: 'Easy Sharing',
        description: 'Share your code with a single click'
    },
    {
        icon: '💾',
        title: 'Auto Save',
        description: 'Never lose your work with automatic history'
    }
];

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
    const [stdin, setStdin] = useState('');
    const [showInput, setShowInput] = useState(false);
    const [showHero, setShowHero] = useState(true);
    const editorRef = useRef(null);

    const scrollToEditor = () => {
        setShowHero(false);
        setTimeout(() => {
            editorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
    };

    const handleQuickStart = (langId) => {
        setLanguage(langId);
        scrollToEditor();
    };

    const runCode = async () => {
        setLoading(true);
        setOutput('');
        setStatus(null);
        setShareId(null);

        try {
            const response = await axios.post(`${API_URL}/compile/run`, {
                code,
                language,
                input: stdin
            });

            const data = response.data;
            setOutput(data.output);
            setStatus(data.status);
            setExecutionTime(data.executionTime);
            setMemory(data.memory);
            setShareId(data.shareId);
            setShowOutput(true);

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

            {/* Hero Section */}
            {showHero && (
                <div className="hero-section">
                    <div className="hero-content">
                        <div className="hero-badge">
                            <span className="badge-icon">✨</span>
                            <span>AI-Powered Compiler</span>
                        </div>
                        <h1 className="hero-title">
                            Code. Compile.
                            <br />
                            <span className="gradient-text">Create Magic.</span>
                        </h1>
                        <p className="hero-subtitle">
                            Write and execute code in multiple languages instantly.
                            <br />
                            Powered by Groq AI for blazing-fast performance.
                        </p>
                        <button className="cta-button" onClick={scrollToEditor}>
                            <span className="cta-icon">🚀</span>
                            Start Coding Now
                            <span className="cta-arrow">→</span>
                        </button>

                        {/* Feature Cards */}
                        <div className="features-grid">
                            {FEATURES.map((feature, index) => (
                                <div key={index} className="feature-card" style={{ animationDelay: `${index * 0.1}s` }}>
                                    <div className="feature-icon">{feature.icon}</div>
                                    <h3 className="feature-title">{feature.title}</h3>
                                    <p className="feature-description">{feature.description}</p>
                                </div>
                            ))}
                        </div>

                        {/* Quick Language Selector */}
                        <div className="quick-start-section">
                            <h3 className="quick-start-title">Quick Start with:</h3>
                            <div className="language-grid">
                                {LANGUAGES.map((lang) => (
                                    <button
                                        key={lang.id}
                                        className="language-card"
                                        onClick={() => handleQuickStart(lang.id)}
                                    >
                                        <span className="lang-icon">{lang.icon}</span>
                                        <span className="lang-name">{lang.name}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="scroll-indicator" onClick={scrollToEditor}>
                            <span className="scroll-text">Scroll to Editor</span>
                            <span className="scroll-icon">↓</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Full Screen Editor */}
            <div className="full-editor-container" ref={editorRef}>
                <CodeEditor
                    code={code}
                    setCode={setCode}
                    language={language}
                    setLanguage={setLanguage}
                    onRun={runCode}
                    loading={loading}
                />

                {/* Toggle Input Button */}
                <div className="stdin-toggle-container">
                    <button
                        className={`stdin-toggle-btn ${showInput ? 'active' : ''}`}
                        onClick={() => setShowInput(!showInput)}
                    >
                        {showInput ? '📥 Hide Input' : '📥 Add Input (Optional)'}
                    </button>
                </div>

                {/* Collapsible Input Field */}
                {showInput && (
                    <div className="stdin-input-container">
                        <label htmlFor="stdin">Input (stdin):</label>
                        <textarea
                            id="stdin"
                            className="stdin-textarea"
                            placeholder="Enter input here (if your code uses input(), scanf, cin, etc.)&#10;&#10;Example for multiple inputs:&#10;5&#10;John&#10;&#10;Each line will be read by your program."
                            value={stdin}
                            onChange={(e) => setStdin(e.target.value)}
                            rows="4"
                        />
                    </div>
                )}
            </div>

            {/* Side-by-Side Output Panel */}
            <div className={`output-panel-side ${output ? 'hasOutput' : ''}`}>
                {output ? (
                    <OutputPanel
                        output={output}
                        status={status}
                        executionTime={executionTime}
                        memory={memory}
                        shareId={shareId}
                        onShare={handleShare}
                    />
                ) : (
                    <div className="placeholder">
                        <div className="placeholder-icon">📊</div>
                        <p>Run your code to see the output here</p>
                    </div>
                )}
            </div>

            {/* Floating Action Button */}
            {!showHero && (
                <button className="fab-home" onClick={() => setShowHero(true)} title="Back to Home">
                    <span>🏠</span>
                </button>
            )}
        </div>
    );
};

export default Home;
