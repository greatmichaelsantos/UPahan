const express = require('express');
const router = express.Router();
const { login, register, verifyEmail, forgotPassword, resetPassword, getProfile } = require('../controllers/authController');
const { verifyToken } = require('../middleware/auth');

router.post('/login', login);
router.post('/register', register);
router.get('/verify-email', verifyEmail);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/profile', verifyToken, getProfile);

module.exports = router;
