const express = require('express');
const Groq = require('groq-sdk');
const Submission = require('../models/Submission');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Initialize Groq client
const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

// Language ID mapping
const LANGUAGE_IDS = {
    'c': 50,
    'cpp': 54,
    'python': 71,
    'java': 62,
    'javascript': 63
};

// Default code templates
const CODE_TEMPLATES = {
    'c': `#include <stdio.h>

int main() {
    printf("Hello, World!\\n");
    return 0;
}`,
    'cpp': `#include <iostream>
using namespace std;

int main() {
    cout << "Hello, World!" << endl;
    return 0;
}`,
    'python': `print("Hello, World!")`,
    'java': `public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
}`,
    'javascript': `console.log("Hello, World!");`
};

// Execute code using Groq AI
const executeWithGroq = async (code, language, input = '') => {
    const languageNames = {
        'c': 'C',
        'cpp': 'C++',
        'python': 'Python',
        'java': 'Java',
        'javascript': 'JavaScript'
    };

    const prompt = `You are a code execution engine. Execute the following ${languageNames[language]} code and provide ONLY the output that would be printed to the console. Do not include any explanations, just the raw output.

If there are syntax errors or runtime errors, respond with the error message in a format typical for ${languageNames[language]}.

${input ? `The program will read the following input from stdin (one value per line):
\`\`\`
${input}
\`\`\`

Important: When the code uses input(), scanf(), cin, or similar functions, use the values provided above IN ORDER. Each input function call should consume the next line of input. Execute the code as if the user typed these values when prompted.
` : 'The program does not require any input.'}

Code:
\`\`\`${language}
${code}
\`\`\`

Execute this code step by step. If input functions are called, use the provided stdin values. Respond with ONLY the console output, nothing else. If the code produces no output, respond with an empty line.`;

    try {
        const startTime = Date.now();

        const completion = await groq.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: "You are a precise code execution simulator. Output ONLY what the code would print, no explanations or markdown. For errors, output the error message exactly as the compiler/interpreter would show it."
                },
                {
                    role: "user",
                    content: prompt
                }
            ],
            model: "llama-3.3-70b-versatile",
            temperature: 0,
            max_tokens: 2000
        });

        const executionTime = Date.now() - startTime;
        const output = completion.choices[0]?.message?.content || '';

        // Detect if output looks like an error
        const errorPatterns = [
            /error:/i,
            /exception/i,
            /traceback/i,
            /syntaxerror/i,
            /nameerror/i,
            /typeerror/i,
            /undefined/i,
            /cannot find/i,
            /compilation failed/i,
            /segmentation fault/i
        ];

        const isError = errorPatterns.some(pattern => pattern.test(output));

        return {
            success: !isError,
            output: output.trim(),
            status: isError ? 'runtime_error' : 'success',
            executionTime,
            memory: Math.floor(Math.random() * 5000) + 1000 // Simulated
        };
    } catch (error) {
        console.error('Groq API error:', error);
        return {
            success: false,
            output: `AI Execution Error: ${error.message}`,
            status: 'error',
            executionTime: 0,
            memory: 0
        };
    }
};

// Get default template
router.get('/template/:language', (req, res) => {
    const { language } = req.params;
    const template = CODE_TEMPLATES[language];

    if (!template) {
        return res.status(400).json({ error: 'Invalid language' });
    }

    res.json({ template });
});

// Check API mode
router.get('/mode', (req, res) => {
    const hasGroq = process.env.GROQ_API_KEY && process.env.GROQ_API_KEY.startsWith('gsk_');
    res.json({
        mode: hasGroq ? 'groq-ai' : 'demo',
        message: hasGroq ? 'Using Groq AI for code execution' : 'Running in demo mode'
    });
});

// Compile and run code
router.post('/run', authMiddleware, async (req, res) => {
    try {
        const { code, language, input = '' } = req.body;

        // Validate input
        if (!code || !language) {
            return res.status(400).json({ error: 'Code and language are required' });
        }

        const languageId = LANGUAGE_IDS[language];
        if (!languageId) {
            return res.status(400).json({ error: 'Invalid language. Supported: c, cpp, python, java, javascript' });
        }

        console.log(`🤖 Executing ${language} code with Groq AI...`);

        // Execute using Groq AI
        const result = await executeWithGroq(code, language, input);

        // Try to save submission to database (optional - don't fail if DB is down)
        let submissionId = null;
        let shareId = null;

        try {
            const submission = new Submission({
                user: req.user?.userId || null,
                code,
                language,
                languageId,
                input,
                output: result.output,
                status: result.status,
                executionTime: result.executionTime,
                memory: result.memory
            });

            await submission.save();
            submissionId = submission._id;
            shareId = submission.shareId;
        } catch (dbError) {
            console.warn('⚠️ Could not save to database:', dbError.message);
            // Continue without saving - user still gets their output
        }

        res.json({
            success: result.success,
            status: result.status,
            output: result.output,
            executionTime: result.executionTime,
            memory: result.memory,
            submissionId,
            shareId,
            aiPowered: true
        });

    } catch (error) {
        console.error('Execution error:', error);
        res.status(500).json({
            error: 'Execution failed',
            details: error.message
        });
    }
});

// Get shared code
router.get('/share/:shareId', async (req, res) => {
    try {
        const { shareId } = req.params;
        const submission = await Submission.findOne({ shareId });

        if (!submission) {
            return res.status(404).json({ error: 'Code not found' });
        }

        res.json({
            code: submission.code,
            language: submission.language,
            input: submission.input,
            output: submission.output,
            status: submission.status
        });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
