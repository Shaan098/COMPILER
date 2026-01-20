const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false // Allow anonymous submissions
    },
    code: {
        type: String,
        required: true
    },
    language: {
        type: String,
        required: true,
        enum: ['c', 'cpp', 'python', 'java', 'javascript']
    },
    languageId: {
        type: Number,
        required: true
    },
    input: {
        type: String,
        default: ''
    },
    output: {
        type: String,
        default: ''
    },
    status: {
        type: String,
        enum: ['pending', 'success', 'error', 'compilation_error', 'runtime_error', 'timeout'],
        default: 'pending'
    },
    executionTime: {
        type: Number,
        default: null
    },
    memory: {
        type: Number,
        default: null
    },
    shareId: {
        type: String,
        unique: true,
        sparse: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Generate unique share ID
submissionSchema.pre('save', function (next) {
    if (!this.shareId) {
        this.shareId = Math.random().toString(36).substring(2, 10);
    }
    next();
});

module.exports = mongoose.model('Submission', submissionSchema);
