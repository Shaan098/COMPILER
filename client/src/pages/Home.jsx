import { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast, { Toaster } from 'react-hot-toast';
import CodeEditor from '../components/CodeEditor';
import OutputPanel from '../components/OutputPanel';
import api from '../config/api';

const CODE_TEMPLATES = {
    python: `# Python Code
print("Hello, World!")`,
    javascript: `// JavaScript Code
console.log("Hello, World!");`,
    c: `// C Code
#include <stdio.h>

int main() {
    printf("Hello, World!\\n");
    return 0;
}`,
    cpp: `// C++ Code
#include <iostream>
using namespace std;

int main() {
    cout << "Hello, World!" << endl;
    return 0;
}`,
    java: `// Java Code
public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
}`
};

const LANGUAGES = [
    { id: 'python', name: 'Python', icon: '🐍', color: '#3776ab' },
    { id: 'javascript', name: 'JavaScript', icon: '📜', color: '#f7df1e' },
    { id: 'c', name: 'C', icon: '©️', color: '#a8b9cc' },
    { id: 'cpp', name: 'C++', icon: '➕', color: '#00599c' },
    { id: 'java', name: 'Java', icon: '☕', color: '#ea2d2e' }
];

const FEATURES = [
    { icon: '⚡', title: 'Lightning Fast', description: 'AI-powered code execution with instant results' },
    { icon: '🌐', title: 'Multi-Language', description: 'Support for C, C++, Python, Java & JavaScript' },
    { icon: '🔗', title: 'Easy Sharing', description: 'Share your code with a single click' },
    { icon: '💾', title: 'Auto Save', description: 'Never lose your work with automatic history' }
];

// Input detection patterns (per language)
const INPUT_PATTERNS = {
    python: /\b(input\s*\(|sys\.stdin)/,
    javascript: /\b(prompt\s*\(|readline|process\.stdin)/,
    c: /\b(scanf|gets|fgets|getchar|getc)\s*\(/,
    cpp: /\b(cin\s*>>|getline\s*\(|scanf|gets)\b/,
    java: /\b(Scanner|BufferedReader|System\.in|readLine)\b/,
};

// Animation variants
const staggerContainer = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } }
};

const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] } }
};

const scaleIn = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.4, ease: [0.34, 1.56, 0.64, 1] } }
};

const Home = () => {
    const [code, setCode] = useState(CODE_TEMPLATES.python);
    const [language, setLanguage] = useState('python');
    const [output, setOutput] = useState('');
    const [status, setStatus] = useState(null);
    const [executionTime, setExecutionTime] = useState(null);
    const [memory, setMemory] = useState(null);
    const [shareId, setShareId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [stdin, setStdin] = useState('');
    const [showInput, setShowInput] = useState(false);
    const [showHero, setShowHero] = useState(false);
    const [runCount, setRunCount] = useState(0);
    const editorRef = useRef(null);

    const scrollToEditor = () => {
        setShowHero(false);
        setTimeout(() => {
            editorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
    };

    const handleQuickStart = (langId) => {
        setLanguage(langId);
        setCode(CODE_TEMPLATES[langId]);
        scrollToEditor();
    };

    const handleLanguageChange = (langId) => {
        setLanguage(langId);
        setCode(CODE_TEMPLATES[langId]);
        const langName = LANGUAGES.find(l => l.id === langId)?.name;
        toast.success(`Switched to ${langName}!`, { icon: '🔄', duration: 2000 });
    };

    // Detect if code contains input/read functions
    const needsInput = useMemo(
        () => INPUT_PATTERNS[language]?.test(code) ?? false,
        [code, language]
    );

    // Auto-open input panel when code contains input functions
    useEffect(() => {
        if (needsInput && !showInput) {
            setShowInput(true);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [needsInput]);

    // Count approximate number of input calls
    const inputCount = useMemo(() => {
        if (!needsInput) return 0;
        const countPatterns = {
            python: /\binput\s*\(/g,
            javascript: /\b(prompt\s*\(|readline\s*\()/g,
            c: /\b(scanf|gets|fgets|getchar|getc)\s*\(/g,
            cpp: /\b(cin\s*>>|getline\s*\(|scanf)\b/g,
            java: /\b(nextLine|nextInt|nextDouble|next|readLine)\s*\(/g,
        };
        const matches = code.match(countPatterns[language] || /$/g);
        return matches ? matches.length : 1;
    }, [code, language, needsInput]);

    const runCode = async () => {
        // If code needs input but user hasn't provided any, block and focus
        if (needsInput && !stdin.trim()) {
            setShowInput(true);
            toast.error('Enter your input values below before running!', {
                icon: '⚠️',
                duration: 3000,
            });
            // Focus the textarea
            setTimeout(() => {
                document.getElementById('stdin')?.focus();
            }, 100);
            return;
        }

        setLoading(true);
        setOutput('');
        setStatus(null);
        setShareId(null);

        try {
            const response = await api.post('/compile/run', {
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
            setRunCount(prev => prev + 1);

            if (data.status === 'success') {
                toast.success('Executed successfully!', { icon: '✅', duration: 2500 });
            } else {
                toast.error('Execution failed', { icon: '❌', duration: 2500 });
            }
        } catch (error) {
            console.error('Error:', error);
            setOutput(error.response?.data?.error || 'An error occurred while running the code');
            setStatus('error');
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
            } catch {
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

    return (
        <div className="home-page">
            <Toaster
                position="top-center"
                toastOptions={{
                    style: {
                        background: 'var(--bg-tertiary)',
                        color: 'var(--text-primary)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '12px',
                        padding: '10px 18px',
                        fontSize: '0.9rem',
                        fontWeight: 600,
                        backdropFilter: 'blur(12px)',
                    },
                }}
            />

            {/* Hero Section */}
            <AnimatePresence>
                {showHero && (
                    <motion.div
                        className="hero-section"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0, y: -40 }}
                        transition={{ duration: 0.5 }}
                    >
                        <motion.div
                            className="hero-content"
                            variants={staggerContainer}
                            initial="hidden"
                            animate="visible"
                        >
                            <motion.div className="hero-badge" variants={fadeUp}>
                                <span className="badge-icon">✨</span>
                                <span>AI-Powered Compiler</span>
                            </motion.div>

                            <motion.h1 className="hero-title" variants={fadeUp}>
                                Code. Compile.
                                <br />
                                <span className="gradient-text">Create Magic.</span>
                            </motion.h1>

                            <motion.p className="hero-subtitle" variants={fadeUp}>
                                Write and execute code in multiple languages instantly.
                                <br />
                                Powered by Groq AI for blazing-fast performance.
                            </motion.p>

                            <motion.button
                                className="cta-button"
                                onClick={scrollToEditor}
                                variants={fadeUp}
                                whileHover={{ scale: 1.04, y: -4 }}
                                whileTap={{ scale: 0.97 }}
                            >
                                <span className="cta-icon">🚀</span>
                                Start Coding Now
                                <span className="cta-arrow">→</span>
                            </motion.button>

                            {/* Features */}
                            <motion.div className="features-grid" variants={staggerContainer}>
                                {FEATURES.map((feature, index) => (
                                    <motion.div
                                        key={index}
                                        className="feature-card"
                                        variants={scaleIn}
                                        whileHover={{ y: -8, scale: 1.02 }}
                                    >
                                        <div className="feature-icon">{feature.icon}</div>
                                        <h3 className="feature-title">{feature.title}</h3>
                                        <p className="feature-description">{feature.description}</p>
                                    </motion.div>
                                ))}
                            </motion.div>

                            {/* Quick Start */}
                            <motion.div className="quick-start-section" variants={fadeUp}>
                                <h3 className="quick-start-title">Quick Start with:</h3>
                                <div className="language-grid">
                                    {LANGUAGES.map((lang, i) => (
                                        <motion.button
                                            key={lang.id}
                                            className="language-card"
                                            onClick={() => handleQuickStart(lang.id)}
                                            whileHover={{ y: -6, scale: 1.04 }}
                                            whileTap={{ scale: 0.96 }}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.6 + i * 0.08 }}
                                        >
                                            <span className="lang-icon">{lang.icon}</span>
                                            <span className="lang-name">{lang.name}</span>
                                        </motion.button>
                                    ))}
                                </div>
                            </motion.div>

                            <motion.div
                                className="scroll-indicator"
                                onClick={scrollToEditor}
                                variants={fadeUp}
                                whileHover={{ y: 4 }}
                            >
                                <span className="scroll-text">Scroll to Editor</span>
                                <span className="scroll-icon">↓</span>
                            </motion.div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* 3-Column Editor Layout */}
            <motion.div
                className="full-editor-container"
                ref={editorRef}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, delay: showHero ? 0 : 0.1 }}
            >
                {/* Column 1: Language Sidebar */}
                <div className="language-sidebar">
                    {LANGUAGES.map((lang, i) => (
                        <motion.button
                            key={lang.id}
                            className={`lang-tab ${language === lang.id ? 'active' : ''}`}
                            onClick={() => handleLanguageChange(lang.id)}
                            title={lang.name}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 + i * 0.05, ease: [0.34, 1.56, 0.64, 1] }}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.92 }}
                        >
                            {lang.icon}
                        </motion.button>
                    ))}
                </div>

                {/* Column 2: Editor */}
                <div className="editor-main-area">
                    <CodeEditor
                        code={code}
                        setCode={setCode}
                        language={language}
                        setLanguage={setLanguage}
                        onRun={runCode}
                        loading={loading}
                    />

                    <div className="stdin-toggle-container">
                        {needsInput ? (
                            <motion.div
                                className="stdin-required-badge"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                            >
                                ⚠️ Your code requires <strong>{inputCount}</strong> input{inputCount > 1 ? 's' : ''} — enter {inputCount > 1 ? 'them' : 'it'} below
                            </motion.div>
                        ) : (
                            <motion.button
                                className={`stdin-toggle-btn ${showInput ? 'active' : ''}`}
                                onClick={() => setShowInput(!showInput)}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                {showInput ? '📥 Hide Input' : '📥 Add Input (Optional)'}
                            </motion.button>
                        )}
                    </div>

                    <AnimatePresence>
                        {showInput && (
                            <motion.div
                                className={`stdin-input-container ${needsInput ? 'stdin-required' : ''}`}
                                initial={{ height: 0, opacity: 0, padding: 0 }}
                                animate={{ height: 'auto', opacity: 1, padding: '0.85rem 1.25rem' }}
                                exit={{ height: 0, opacity: 0, padding: 0 }}
                                transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                                style={{ overflow: 'hidden' }}
                            >
                                <label htmlFor="stdin">
                                    {needsInput ? '⌨️ Enter your input values (one per line):' : '📎 Input (stdin):'}
                                </label>
                                {needsInput && (
                                    <span className="stdin-hint">
                                        Your code reads {inputCount} input{inputCount > 1 ? 's' : ''}. Enter {inputCount > 1 ? 'each value on a new line' : 'the value below'}.
                                    </span>
                                )}
                                <textarea
                                    id="stdin"
                                    className="stdin-textarea"
                                    placeholder={needsInput
                                        ? `Enter value 1 here\n${inputCount > 1 ? 'Enter value 2 here\n' : ''}${inputCount > 2 ? 'Enter value 3 here' : ''}`
                                        : "Enter input here (if your code uses input(), scanf, cin, etc.)\n\nEach line will be read by your program."
                                    }
                                    value={stdin}
                                    onChange={(e) => setStdin(e.target.value)}
                                    rows={Math.max(inputCount, 3)}
                                    autoFocus={needsInput}
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Column 3: Output Panel */}
                <motion.div
                    className={`output-panel-side ${output ? 'hasOutput' : ''}`}
                    key={runCount}
                    initial={output ? { opacity: 0.8 } : false}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                >
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
                        <div className="output-placeholder">
                            <motion.div
                                className="output-placeholder-icon"
                                animate={{ scale: [1, 1.05, 1] }}
                                transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
                            >
                                📊
                            </motion.div>
                            <p><strong>Run Code</strong> to see output here</p>
                            <span style={{
                                fontSize: '0.75rem',
                                color: 'var(--text-muted)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.25rem',
                            }}>
                                <span className="kbd">Ctrl</span> + <span className="kbd">↵</span>
                            </span>
                        </div>
                    )}
                </motion.div>
            </motion.div>

            {/* FAB */}
            <AnimatePresence>
                {!showHero && (
                    <motion.button
                        className="fab-home"
                        onClick={() => setShowHero(true)}
                        title="Back to Home"
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        whileTap={{ scale: 0.9 }}
                    >
                        🏠
                    </motion.button>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Home;
