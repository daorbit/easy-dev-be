const express = require('express');
const router = express.Router();
const { signup, signin, getMe } = require('../controllers/authController');

// @route   POST /api/auth/signup
// @desc    Register a user
// @access  Public
router.post('/signup', signup);

// @route   POST /api/auth/signin
// @desc    Authenticate user & get token
// @access  Public
router.post('/signin', signin);

// @route   GET /api/auth/me
// @desc    Get current user info
// @access  Private
router.get('/me', getMe);

module.exports = router;