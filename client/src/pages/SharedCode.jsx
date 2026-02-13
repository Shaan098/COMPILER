import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import CodeEditor from '../components/CodeEditor';
import OutputPanel from '../components/OutputPanel';
import api from '../config/api';

const SharedCode = () => {
    const { shareId } = useParams();
    const [code, setCode] = useState('');
    const [language, setLanguage] = useState('python');
    const [originalOutput, setOriginalOutput] = useState('');
    const [originalStatus, setOriginalStatus] = useState(null);
    const [output, setOutput] = useState('');
    const [status, setStatus] = useState(null);
    const [executionTime, setExecutionTime] = useState(null);
    const [memory, setMemory] = useState(null);
    const [loading, setLoading] = useState(true);
    const [running, setRunning] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchSharedCode();
    }, [shareId]);

    const fetchSharedCode = async () => {
        try {
            const res = await api.get(`/compile/share/${shareId}`);
            setCode(res.data.code);
            setLanguage(res.data.language);
            setOriginalOutput(res.data.output);
            setOriginalStatus(res.data.status);
            setOutput(res.data.output);
            setStatus(res.data.status);
        } catch (err) {
            setError('Code not found');
        } finally {
            setLoading(false);
        }
    };

    const runCode = async () => {
        setRunning(true);
        setOutput('');
        setStatus(null);

        try {
            const response = await api.post('/compile/run', {
                code,
                language
            });

            setOutput(response.data.output);
            setStatus(response.data.status);
            setExecutionTime(response.data.executionTime);
            setMemory(response.data.memory);
        } catch (err) {
            setOutput(err.response?.data?.error || 'Error running code');
            setStatus('error');
        } finally {
            setRunning(false);
        }
    };

    if (loading) {
        return (
            <div className="shared-page">
                <div className="loading-spinner">Loading shared code...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="shared-page">
                <div className="error-state">
                    <h2>😕 {error}</h2>
                    <p>This code may have been deleted or the link is invalid.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="home-page">
            <div className="shared-banner">
                📤 You're viewing shared code. Feel free to edit and run it!
            </div>
            <div className="compiler-container">
                <CodeEditor
                    code={code}
                    setCode={setCode}
                    language={language}
                    setLanguage={setLanguage}
                    onRun={runCode}
                    loading={running}
                />
                <OutputPanel
                    output={output}
                    status={status}
                    executionTime={executionTime}
                    memory={memory}
                />
            </div>
        </div>
    );
};

export default SharedCode;
