const { GoogleGenerativeAI } = require('@google/generative-ai');
const { validationResult } = require('express-validator');
const xss = require('xss');

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
    if (msg.includes('register') || msg.includes('form') || msg.includes('sign up'))        return FALLBACKS[1];
    if (msg.includes('check') || msg.includes('status') || msg.includes('list'))            return FALLBACKS[2];
    if (msg.includes('booth') || msg.includes('polling') || msg.includes('where'))          return FALLBACKS[5];
    if (msg.includes('cast') || msg.includes('election day') || msg.includes('how to vote'))return FALLBACKS[3];
    if (msg.includes('move') || msg.includes('transfer') || msg.includes('address'))        return FALLBACKS[4];
    return FALLBACKS[0];
}

// ── In-Memory Cache (TTL = 10 min, max 200 entries) ───────────────────────
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

// ── Key check ─────────────────────────────────────────────────────────────
function isKeyConfigured() {
    const key = process.env.GEMINI_API_KEY;
    return key && key.trim().length > 10 && key !== 'your_api_key_here';
}

// ── Single model call — returns text or throws ────────────────────────────
async function callGemini(genAI, modelName, message) {
    const model = genAI.getGenerativeModel({ model: modelName });
    const prompt = `You are VoteAssist, a smart AI Election Assistant for India.
Your job:
- Help people understand the Indian voting and election process.
- Give clear, concise, step-by-step guidance.
- Keep responses under 150 words.
- Be friendly and helpful.
- NEVER say you cannot help with election questions.

User question: ${message}`;

    const result = await model.generateContent(prompt);
    return result.response.text();
}

// ── Handler ───────────────────────────────────────────────────────────────
const handleChat = async (req, res) => {
    // 1. Validate
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ error: errors.array()[0].msg });
    }

    // 2. Sanitize
    const message = xss(req.body.message.trim());
    console.log(`[Chat] ← "${message.substring(0, 100)}"`);

    // 3. Cache hit
    const cacheKey = message.toLowerCase().replace(/\s+/g, ' ');
    const cached = getCached(cacheKey);
    if (cached) {
        console.log('[Chat] ✓ cache hit');
        return res.json({ reply: cached, cached: true, source: 'cache' });
    }

    // 4. No key → fallback immediately
    if (!isKeyConfigured()) {
        console.warn('[Chat] ✗ API key not configured — using fallback');
        return res.json({ reply: getFallback(message), cached: false, source: 'fallback' });
    }

    // 5. Try Gemini with model fallback chain
    // Try ALL models before giving up — only fall back to static if every model fails
    const MODELS = [
        'gemini-2.5-flash',       // best quality, generous free tier
        'gemini-2.0-flash-lite',  // lightweight, separate quota
        'gemini-2.0-flash',       // fallback
    ];

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY.trim());

    for (let i = 0; i < MODELS.length; i++) {
        const modelName = MODELS[i];
        try {
            console.log(`[Chat] → trying ${modelName}...`);
            const text = await callGemini(genAI, modelName, message);

            // Success
            console.log(`[Chat] ✓ ${modelName} responded (${text.length} chars)`);
            setCache(cacheKey, text);
            return res.json({ reply: text, cached: false, source: modelName });

        } catch (err) {
            const msg = err.message || '';
            const isQuota   = msg.includes('429') || msg.includes('quota') || msg.includes('RESOURCE_EXHAUSTED');
            const isNotFound= msg.includes('404') || msg.includes('not found') || msg.includes('not supported');
            const isAuth    = msg.includes('401') || msg.includes('403') || msg.includes('API_KEY');
            const isNetwork = msg.includes('ENOTFOUND') || msg.includes('ECONNREFUSED') || msg.includes('network');

            if (isAuth) {
                // Auth errors won't be fixed by trying another model — log and break
                console.error(`[Chat] ✗ AUTH error on ${modelName}: ${msg.substring(0, 120)}`);
                break;
            }

            if (isQuota || isNotFound) {
                // Quota or wrong model — try next
                console.warn(`[Chat] ✗ ${modelName} ${isQuota ? 'quota exceeded' : 'not found'} — trying next`);
                continue;
            }

            if (isNetwork) {
                console.error(`[Chat] ✗ Network error: ${msg.substring(0, 120)}`);
                break; // network is down — no point trying other models
            }

            // Unknown error — log and try next model anyway
            console.error(`[Chat] ✗ ${modelName} error: ${msg.substring(0, 120)}`);
            if (i < MODELS.length - 1) continue;
        }
    }

    // 6. All models failed — guaranteed fallback (never shows error to user)
    console.warn('[Chat] ✗ All models failed — using static fallback');
    const fallback = getFallback(message);
    return res.json({ reply: fallback, cached: false, source: 'fallback' });
};

module.exports = { handleChat };
