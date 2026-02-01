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

    let enhancedPrompt = `You are a code execution simulator. You will simulate running the following ${languageNames[language]} code and provide ONLY the exact output that would be printed to the console.

${input ? `IMPORTANT - USER PROVIDED INPUT (stdin):
The program will read input values from stdin. Here are the values the user will provide, in order:
${input.split('\n').map((line, i) => `  Line ${i + 1}: "${line}"`).join('\n')}

When you see input functions like input(), scanf(), cin >>, Scanner.nextLine(), etc., use these values IN THE ORDER SHOWN ABOVE.

Example: If the code calls input() twice, the first call gets "${input.split('\n')[0] || ''}" and the second call gets "${input.split('\n')[1] || ''}".

` : ''}Code:
\`\`\`${language}
${code}
\`\`\`

${input ? `Remember: Use the provided input values "${input.split('\n').join('", "')}" when input functions are called.` : ''}

Execute this code and respond with ONLY the console output. Include the prompts (like "Enter name:") if the code prints them, followed by the actual program output using the provided input values. Do not include explanations.`;

    const prompt = enhancedPrompt;

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
