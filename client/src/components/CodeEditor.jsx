import { useState } from 'react';
import Editor from '@monaco-editor/react';

const LANGUAGE_OPTIONS = [
    { value: 'python', label: 'Python', monacoLang: 'python' },
    { value: 'javascript', label: 'JavaScript', monacoLang: 'javascript' },
    { value: 'c', label: 'C', monacoLang: 'c' },
    { value: 'cpp', label: 'C++', monacoLang: 'cpp' },
    { value: 'java', label: 'Java', monacoLang: 'java' }
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

    const handleLanguageChange = (e) => {
        const newLang = e.target.value;
        setLanguage(newLang);
        setCode(DEFAULT_CODE[newLang]);
    };

    return (
        <div className="code-editor-container">
            <div className="editor-header">
                <div className="language-selector">
                    <label>Language:</label>
                    <select value={language} onChange={handleLanguageChange}>
                        {LANGUAGE_OPTIONS.map(lang => (
                            <option key={lang.value} value={lang.value}>
                                {lang.label}
                            </option>
                        ))}
                    </select>
                </div>
                <button
                    className={`run-button ${loading ? 'loading' : ''}`}
                    onClick={onRun}
                    disabled={loading}
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
                </button>
            </div>
            <div className="editor-wrapper">
                <Editor
                    height="100%"
                    language={currentLang?.monacoLang || 'python'}
                    value={code}
                    onChange={(value) => setCode(value || '')}
                    theme="vs-dark"
                    options={{
                        fontSize: 14,
                        minimap: { enabled: false },
                        scrollBeyondLastLine: false,
                        automaticLayout: true,
                        padding: { top: 16 },
                        lineNumbers: 'on',
                        roundedSelection: true,
                        cursorBlinking: 'smooth',
                        cursorSmoothCaretAnimation: 'on'
                    }}
                />
            </div>
        </div>
    );
};

export default CodeEditor;
