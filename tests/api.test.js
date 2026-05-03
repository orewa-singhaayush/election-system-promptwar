process.env.NODE_ENV = 'test';
const request = require('supertest');
const app = require('../server');

// ── Shared state ──────────────────────────────────────────────────────────
let savedVoterId;

const validVoter = {
    fullName: 'Test Voter',
    dob: '1990-06-15',
    zipCode: '110001',
    gender: 'Male',
    relativeName: 'Parent Name',
    houseNo: '42',
    street: 'MG Road',
    village: 'Delhi',
    postOffice: 'CP',
    district: 'Central Delhi',
    state: 'Delhi',
    constituency: 'New Delhi'
};

// ─────────────────────────────────────────────────────────────────────────
// STEP 1 — /api/health
// ─────────────────────────────────────────────────────────────────────────
describe('GET /api/health', () => {
    test('returns 200 with status ok and uptime', async () => {
        const res = await request(app).get('/api/health');
        expect(res.statusCode).toBe(200);
        expect(res.body.status).toBe('ok');
        expect(typeof res.body.uptime).toBe('number');
        expect(res.body.timestamp).toBeDefined();
    });
});

// ─────────────────────────────────────────────────────────────────────────
// POST /api/register
// ─────────────────────────────────────────────────────────────────────────
describe('POST /api/register', () => {
    test('Success — valid full payload', async () => {
        const res = await request(app).post('/api/register').send(validVoter);
        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.voterId).toMatch(/^[A-Z0-9]{6}$/);
        expect(res.body.status).toBe('Approved');
        savedVoterId = res.body.voterId;
    });

    test('Failure — missing dob and zipCode returns 400 with errors array', async () => {
        const res = await request(app).post('/api/register').send({ fullName: 'Only Name' });
        expect(res.statusCode).toBe(400);
        expect(Array.isArray(res.body.errors)).toBe(true);
        expect(res.body.errors.length).toBeGreaterThan(0);
    });

    test('Failure — underage voter (dob = today)', async () => {
        const res = await request(app).post('/api/register').send({
            ...validVoter,
            dob: new Date().toISOString().split('T')[0]
        });
        expect(res.statusCode).toBe(400);
        expect(res.body.message).toMatch(/18 years/i);
    });

    test('Failure — invalid zipCode (letters)', async () => {
        const res = await request(app).post('/api/register').send({
            ...validVoter,
            zipCode: 'ABCDEF'
        });
        expect(res.statusCode).toBe(400);
        expect(res.body.errors).toBeDefined();
    });

    test('Failure — zipCode too short', async () => {
        const res = await request(app).post('/api/register').send({
            ...validVoter,
            zipCode: '123'
        });
        expect(res.statusCode).toBe(400);
    });

    test('Failure — fullName too short', async () => {
        const res = await request(app).post('/api/register').send({
            ...validVoter,
            fullName: 'A'
        });
        expect(res.statusCode).toBe(400);
    });

    test('Failure — invalid gender value', async () => {
        const res = await request(app).post('/api/register').send({
            ...validVoter,
            gender: 'Robot'
        });
        expect(res.statusCode).toBe(400);
    });
});

// ─────────────────────────────────────────────────────────────────────────
// POST /api/status
// ─────────────────────────────────────────────────────────────────────────
describe('POST /api/status', () => {
    test('Success — find voter by saved voterId', async () => {
        if (!savedVoterId) return;
        const res = await request(app).post('/api/status').send({ voterId: savedVoterId });
        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.voter.voterId).toBe(savedVoterId);
        expect(res.body.voter.fullName).toBe('Test Voter');
    });

    test('Success — find voter by fullName + zipCode', async () => {
        const res = await request(app).post('/api/status').send({
            fullName: 'Test Voter',
            zipCode: '110001'
        });
        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
    });

    test('Failure — unknown voterId returns 404', async () => {
        const res = await request(app).post('/api/status').send({ voterId: 'ZZZZZZ' });
        expect(res.statusCode).toBe(404);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBeDefined();
    });

    test('Failure — no search params returns 404', async () => {
        const res = await request(app).post('/api/status').send({});
        expect(res.statusCode).toBe(404);
    });
});

// ─────────────────────────────────────────────────────────────────────────
// POST /api/chat
// ─────────────────────────────────────────────────────────────────────────
describe('POST /api/chat', () => {
    test('Failure — empty body returns 400', async () => {
        const res = await request(app).post('/api/chat').send({});
        expect(res.statusCode).toBe(400);
        expect(res.body.error).toBeDefined();
    });

    test('Failure — empty string message returns 400', async () => {
        const res = await request(app).post('/api/chat').send({ message: '   ' });
        expect(res.statusCode).toBe(400);
    });

    test('Failure — message over 500 chars returns 400', async () => {
        const res = await request(app).post('/api/chat').send({ message: 'A'.repeat(501) });
        expect(res.statusCode).toBe(400);
        expect(res.body.error).toMatch(/500 characters/i);
    });

    test('No API key — returns 200 with fallback reply (never crashes user)', async () => {
        const original = process.env.GEMINI_API_KEY;
        delete process.env.GEMINI_API_KEY;
        const res = await request(app).post('/api/chat').send({ message: 'How do I vote?' });
        expect(res.statusCode).toBe(200);
        expect(res.body.reply).toBeDefined();
        expect(typeof res.body.reply).toBe('string');
        expect(res.body.reply.length).toBeGreaterThan(10);
        process.env.GEMINI_API_KEY = original;
    });

    test('Placeholder API key — still returns fallback reply', async () => {
        const original = process.env.GEMINI_API_KEY;
        process.env.GEMINI_API_KEY = 'your_api_key_here';
        const res = await request(app).post('/api/chat').send({ message: 'How do I register?' });
        expect(res.statusCode).toBe(200);
        expect(res.body.reply).toBeDefined();
        expect(res.body.source).toBe('fallback');
        process.env.GEMINI_API_KEY = original;
    });
});

// ─────────────────────────────────────────────────────────────────────────
// 404 Route
// ─────────────────────────────────────────────────────────────────────────
describe('Unknown routes', () => {
    test('GET /api/nonexistent returns 404', async () => {
        const res = await request(app).get('/api/nonexistent');
        expect(res.statusCode).toBe(404);
        expect(res.body.message).toBeDefined();
    });
});
