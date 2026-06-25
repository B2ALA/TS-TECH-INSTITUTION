const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

/**
 * @route   POST /api/auth/signup
 * @desc    Initialize a brand new profile instance (Student / Instructor)
 * @access  Public
 */
router.post('/signup', authController.signup);

/**
 * @route   POST /api/auth/login
 * @desc    Establish identity verification and sign session tokens
 * @access  Public
 */
router.post('/login', authController.login);

module.exports = router;
