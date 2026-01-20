const express = require('express');
const Submission = require('../models/Submission');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// Get user's submissions (requires auth)
router.get('/my', requireAuth, async (req, res) => {
    try {
        const submissions = await Submission.find({ user: req.user.userId })
            .sort({ createdAt: -1 })
            .limit(50)
            .select('-__v');

        res.json({ submissions });
    } catch (error) {
        console.error('Error fetching submissions:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get single submission by ID
router.get('/:id', async (req, res) => {
    try {
        const submission = await Submission.findById(req.params.id).select('-__v');

        if (!submission) {
            return res.status(404).json({ error: 'Submission not found' });
        }

        res.json({ submission });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Delete submission (requires auth)
router.delete('/:id', requireAuth, async (req, res) => {
    try {
        const submission = await Submission.findOneAndDelete({
            _id: req.params.id,
            user: req.user.userId
        });

        if (!submission) {
            return res.status(404).json({ error: 'Submission not found or unauthorized' });
        }

        res.json({ message: 'Submission deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
