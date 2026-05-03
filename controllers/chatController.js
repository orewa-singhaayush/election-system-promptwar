const { GoogleGenerativeAI } = require('@google/generative-ai');
const { validationResult } = require('express-validator');
const xss = require('xss');
const logger = require('../config/logger');

// ── Fallback responses ────────────────────────────────────────────────────
const FALLBACKS = [
    "To vote in India, you need to be 18+, registered on the electoral roll, and carry valid ID (Voter ID/Aadhaar/PAN) to your polling booth on election day.",
    "You can register to vote using the Voter Helpline App, NVSP portal (nvsp.in), or by submitting Form 6 at your local Electoral Registration Office.",
    "Check your name on the voter list at electoralsearch.eci.gov.in using your name, date of birth, and address. You'll also find your polling booth details there.",
    "On election day: carry your Voter ID (EPIC card), go to your assigned polling booth (shown on your voter slip), and cast your vote using the EVM machine.",
    "If you've moved recently, update your voter registration by submitting Form 8A to transfer your entry to your new constituency.",
    "You can find your polling booth location on your voter slip, or check electoralsearch.eci.gov.in. The Election Commission also provides a helpline: 1950."
];

function getFallback(message) {
    const msg = (message || '').toLowerCase();
    if (msg.includes('register') || msg.includes('form') || msg.includes('sign up'))         return FALLBACKS[1];
    if (msg.includes('check') || msg.includes('status') || msg.includes('list'))             return FALLBACKS[2];
    if (msg.includes('booth') || msg.includes('polling') || msg.includes('where'))           return FALLBACKS[5];
    if (msg.includes('cast') || msg.includes('election day') || msg.includes('how to vote')) return FALLBACKS[3];
    if (msg.includes('move') || msg.includes('transfer') || msg.includes('address'))         return FALLBACKS[4];
    return FALLBACKS[0];
}

// ── In-Memory Cache ───────────────────────────────────────────────────────
const responseCache = new Map();
const CACHE_TTL_MS = 10 * 60 * 1000;

function getCached(key) {
    const entry = responseCache.get(key);
    if (!entry) return null;
    if (Date.now() - entry.timestamp > CACHE_TTL_MS) { responseCache.delete(key); return null; }
    return entry.value;
}

function setCache(key, value) {
    if (responseCache.size >= 200) responseCache.delete(responseCache.keys().next().value);
    responseCache.set(key, { value, timestamp: Date.now() });
}

function isKeyConfigured() {
    const key = process.env.GEMINI_API_KEY;
    return key && key.trim().length > 10 && key !== 'your_api_key_here';
}

async function callGemini(genAI, modelName, message) {
    const model = genAI.getGenerativeModel({ model: modelName });
    const prompt = `You are VoteAssist, a smart AI Election Assistant for India. Help people understand the Indian voting process. Concise, step-by-step guidance under 150 words. User question: ${message}`;
    const result = await model.generateContent(prompt);
    return result.response.text();
}

// ── Handler ───────────────────────────────────────────────────────────────
const handleChat = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, error: errors.array()[0].msg });
    }

    const message = xss(req.body.message.trim());
    logger.info({ type: "chat_request", message });

    const cacheKey = message.toLowerCase().replace(/\s+/g, ' ');
    const cached = getCached(cacheKey);
    if (cached) {
        logger.info({ type: "chat_response", source: "cache", cached: true, message: "Cache hit" });
        return res.json({ success: true, data: { reply: cached, source: "cache" } });
    }

    if (!isKeyConfigured()) {
        const fb = getFallback(message);
        logger.warn({ type: "chat_response", source: "fallback", reason: "no_key", message: "Key not configured" });
        return res.json({ success: true, data: { reply: fb, source: "fallback" } });
    }

    const MODELS = ['gemini-2.5-flash', 'gemini-2.0-flash-lite', 'gemini-2.0-flash'];
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY.trim());

    for (let modelName of MODELS) {
        try {
            const text = await callGemini(genAI, modelName, message);
            logger.info({ type: "chat_response", source: modelName, cached: false, message: "Gemini success" });
            setCache(cacheKey, text);
            return res.json({ success: true, data: { reply: text, source: modelName } });
        } catch (err) {
            logger.warn({ type: "gemini_model_fallback", model: modelName, error: err.message });
        }
    }

    const fb = getFallback(message);
    logger.warn({ type: "chat_response", source: "fallback", message: "All models failed" });
    return res.json({ success: true, data: { reply: fb, source: "fallback" } });
};

module.exports = { handleChat };
