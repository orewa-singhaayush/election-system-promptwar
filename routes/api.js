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
    message: { success: false, message: 'Too many registrations. Try again later.' }
});

const chatLimiter = rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 20,
    message: { success: false, error: 'Too many messages. Please slow down.' }
});

const statusLimiter = rateLimit({
    windowMs: 5 * 60 * 1000,
    max: 30,
    message: { success: false, message: 'Too many status checks. Try again later.' }
});

// ── Validation Chains ─────────────────────────────────────────────────────
const registrationValidation = [
    body('fullName').trim().notEmpty().withMessage('Full name is required').isLength({ min: 2, max: 100 }),
    body('dob').isDate().withMessage('Valid date of birth required (YYYY-MM-DD)'),
    body('zipCode').trim().isLength({ min: 6, max: 6 }).isNumeric(),
    body('gender').optional().isIn(['Male', 'Female', 'Third Gender']),
];

const chatValidation = [
    body('message').trim().notEmpty().isLength({ min: 1, max: 500 }),
];

const statusValidation = [
    body('voterId').optional().trim().isLength({ min: 4, max: 20 }),
    body('fullName').optional().trim(),
    body('zipCode').optional().trim().isNumeric().isLength({ min: 6, max: 6 }),
];

// ── Routes ─────────────────────────────────────────────────────────────────
router.get('/health', (req, res) => {
    res.json({
        success: true,
        data: {
            status: "ok",
            service: "voteassist",
            ai: "gemini",
            project: process.env.GOOGLE_CLOUD_PROJECT || "unknown",
            uptime: process.uptime()
        }
    });
});

router.post('/register', registerLimiter, registrationValidation, voterController.registerVoter);
router.post('/status',   statusLimiter,   statusValidation,        voterController.checkStatus);
router.post('/chat',     chatLimiter,     chatValidation,          chatController.handleChat);

module.exports = router;
