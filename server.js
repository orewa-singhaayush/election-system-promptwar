const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');
const path = require('path');
const apiRoutes = require('./routes/api');

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// ── Security ──────────────────────────────────────────────────────────────
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            ...helmet.contentSecurityPolicy.getDefaultDirectives(),
            'script-src': ["'self'", "'unsafe-inline'", 'https://cdn.jsdelivr.net', 'https://cdnjs.cloudflare.com'],
            'style-src': ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com', 'https://cdnjs.cloudflare.com'],
            'font-src': ["'self'", 'https://fonts.gstatic.com', 'https://cdnjs.cloudflare.com'],
            'img-src': ["'self'", 'data:', 'https://*'],
        },
    },
}));
app.use(cors());

// ── Request Logger (STEP 4) ───────────────────────────────────────────────
if (process.env.NODE_ENV !== 'test') {
    app.use(morgan(':method :url :status :res[content-length] - :response-time ms'));
}

app.use(express.json({ limit: '10kb' })); // payload size guard
app.use(express.static(path.join(__dirname, 'public')));

// ── API Routes ────────────────────────────────────────────────────────────
app.use('/api', apiRoutes);

// ── 404 Handler ───────────────────────────────────────────────────────────
app.use((req, res, next) => {
    res.status(404).json({ success: false, message: 'Route not found' });
});

// ── Centralized Error Middleware (STEP 3) — no stack traces in prod ───────
app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message = process.env.NODE_ENV === 'production' ? 'An unexpected error occurred.' : err.message;
    console.error(`[ERROR] ${req.method} ${req.path}:`, err.message);
    res.status(statusCode).json({ success: false, message });
});

if (process.env.NODE_ENV !== 'test') {
    app.listen(port, () => console.log(`🚀 Server running at http://localhost:${port}`));
}

module.exports = app;