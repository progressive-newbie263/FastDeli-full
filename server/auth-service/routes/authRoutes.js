const express = require('express');
const router = express.Router();

const { login } = require('../controllers/loginController');
const { register } = require('../controllers/registerController');
const { getCurrentUser } = require('../controllers/profileController');

const auth = require('../middleware/auth');
const { registerValidationRules, loginValidationRules, validate } = require('../utils/validation');

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', registerValidationRules, validate, register);

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', loginValidationRules, validate, login);

// @route   GET /api/auth/me
// @desc    Get current user profile
// @access  Private
router.get('/profile', auth, getCurrentUser);

module.exports = router;