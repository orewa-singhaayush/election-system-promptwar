const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const rateLimit = require('express-rate-limit');
const voterController = require('../controllers/voterController');
const chatController = require('../controllers/chatController');

// ── Rate Limiters ──────────────────────────────────────────────────────────
const registerLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: 'Too many registrations. Try again in 15 minutes.' }
});

const chatLimiter = rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many messages. Please slow down.' }
});

const statusLimiter = rateLimit({
    windowMs: 5 * 60 * 1000,
    max: 30,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: 'Too many status checks. Try again later.' }
});

// ── Validation Chains (STEP 2) ─────────────────────────────────────────────
const registrationValidation = [
    body('fullName')
        .trim()
        .notEmpty().withMessage('Full name is required')
        .isLength({ min: 2, max: 100 }).withMessage('Name must be 2–100 characters'),
    body('dob')
        .isDate().withMessage('Valid date of birth is required (YYYY-MM-DD)'),
    body('zipCode')
        .trim()
        .isLength({ min: 6, max: 6 }).withMessage('PIN code must be exactly 6 digits')
        .isNumeric().withMessage('PIN code must contain only numbers'),
    body('gender')
        .optional()
        .isIn(['Male', 'Female', 'Third Gender']).withMessage('Invalid gender value'),
];

const chatValidation = [
    body('message')
        .trim()
        .notEmpty().withMessage('Message is required')
        .isLength({ min: 1, max: 500 }).withMessage('Message must be between 1 and 500 characters'),
];

const statusValidation = [
    body('voterId').optional().trim().isLength({ min: 4, max: 20 }).withMessage('Invalid voter ID format'),
    body('fullName').optional().trim().isLength({ min: 2, max: 100 }).withMessage('Invalid name'),
    body('zipCode').optional().trim().isNumeric().isLength({ min: 6, max: 6 }).withMessage('Invalid PIN code'),
];

// ── Routes ─────────────────────────────────────────────────────────────────
router.get('/health', (req, res) =>
    res.json({ status: 'ok', timestamp: new Date().toISOString(), uptime: process.uptime() })
);

router.post('/register', registerLimiter, registrationValidation, voterController.registerVoter);
router.post('/status',   statusLimiter,   statusValidation,        voterController.checkStatus);
router.post('/chat',     chatLimiter,     chatValidation,          chatController.handleChat);

module.exports = router;
