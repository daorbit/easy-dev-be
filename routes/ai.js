const express = require('express');
const router = express.Router();
const { processText } = require('../controllers/aiController');

// @route   POST /api/ai/process-text
// @desc    Process text using AI
// @access  Private
router.post('/process-text', processText);

module.exports = router;