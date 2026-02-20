import { useState, useEffect, useCallback } from 'react';
import Editor from '@monaco-editor/react';
import { motion } from 'framer-motion';
import { useTheme } from '../hooks/useTheme';

const LANGUAGE_OPTIONS = [
    { value: 'python', label: 'Python', monacoLang: 'python', ext: '.py' },
    { value: 'javascript', label: 'JavaScript', monacoLang: 'javascript', ext: '.js' },
    { value: 'c', label: 'C', monacoLang: 'c', ext: '.c' },
    { value: 'cpp', label: 'C++', monacoLang: 'cpp', ext: '.cpp' },
    { value: 'java', label: 'Java', monacoLang: 'java', ext: '.java' }
];

const DEFAULT_CODE = {
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

const CodeEditor = ({ code, setCode, language, setLanguage, onRun, loading }) => {
    const currentLang = LANGUAGE_OPTIONS.find(l => l.value === language);
    const { theme } = useTheme();
    const [lineCount, setLineCount] = useState(1);
    const [charCount, setCharCount] = useState(0);
    const [cursorPos, setCursorPos] = useState({ line: 1, col: 1 });

    // Keyboard shortcut: Ctrl/Cmd + Enter to run
    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                e.preventDefault();
                if (!loading) onRun();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onRun, loading]);

    const handleLanguageChange = (e) => {
        const newLang = e.target.value;
        setLanguage(newLang);
        setCode(DEFAULT_CODE[newLang]);
    };

    const handleEditorChange = useCallback((value) => {
        setCode(value || '');
        setLineCount((value || '').split('\n').length);
        setCharCount((value || '').length);
    }, [setCode]);

    const handleEditorMount = useCallback((editor) => {
        editor.onDidChangeCursorPosition((e) => {
            setCursorPos({ line: e.position.lineNumber, col: e.position.column });
        });
    }, []);

    return (
        <div className="code-editor-container">
            <div className="editor-header">
                <div className="language-selector">
                    <label>Language</label>
                    <select value={language} onChange={handleLanguageChange}>
                        {LANGUAGE_OPTIONS.map(lang => (
                            <option key={lang.value} value={lang.value}>
                                {lang.label}
                            </option>
                        ))}
                    </select>
                    <span style={{
                        fontSize: '0.72rem',
                        color: 'var(--text-muted)',
                        padding: '0.2rem 0.5rem',
                        background: 'var(--bg-primary)',
                        borderRadius: '6px',
                        border: '1px solid var(--border-color)',
                        fontWeight: 600,
                    }}>
                        {lineCount} lines
                    </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <motion.button
                        className={`run-button ${loading ? 'loading' : ''}`}
                        onClick={onRun}
                        disabled={loading}
                        whileHover={!loading ? { scale: 1.04 } : {}}
                        whileTap={!loading ? { scale: 0.96 } : {}}
                    >
                        {loading ? (
                            <>
                                <span className="spinner"></span>
                                Running...
                            </>
                        ) : (
                            <>
                                <span className="play-icon">▶</span>
                                Run Code
                            </>
                        )}
                    </motion.button>
                    <span className="kbd-hint">
                        <span className="kbd">Ctrl</span>
                        <span>+</span>
                        <span className="kbd">↵</span>
                    </span>
                </div>
            </div>
            <div className="editor-wrapper">
                <Editor
                    height="100%"
                    language={currentLang?.monacoLang || 'python'}
                    value={code}
                    onChange={handleEditorChange}
                    onMount={handleEditorMount}
                    theme={theme === 'dark' ? 'vs-dark' : 'light'}
                    options={{
                        fontSize: 15,
                        fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
                        fontLigatures: true,
                        minimap: { enabled: false },
                        scrollBeyondLastLine: false,
                        automaticLayout: true,
                        padding: { top: 16, bottom: 16 },
                        lineNumbers: 'on',
                        roundedSelection: true,
                        cursorBlinking: 'smooth',
                        cursorSmoothCaretAnimation: 'on',
                        smoothScrolling: true,
                        renderLineHighlight: 'all',
                        bracketPairColorization: { enabled: true },
                        guides: {
                            bracketPairs: true,
                            indentation: true,
                        },
                        suggest: {
                            showMethods: true,
                            showFunctions: true,
                            showKeywords: true,
                        },
                        scrollbar: {
                            verticalScrollbarSize: 8,
                            horizontalScrollbarSize: 8,
                        },
                    }}
                />
            </div>
            <div className="editor-statusbar">
                <div className="statusbar-left">
                    <span className="statusbar-item statusbar-lang">
                        {currentLang?.label}{currentLang?.ext}
                    </span>
                    <span className="statusbar-item">
                        Ln {cursorPos.line}, Col {cursorPos.col}
                    </span>
                </div>
                <div className="statusbar-right">
                    <span className="statusbar-item">{lineCount} lines</span>
                    <span className="statusbar-item">{charCount} chars</span>
                    <span className="statusbar-item">UTF-8</span>
                </div>
            </div>
        </div>
    );
};

export default CodeEditor;
