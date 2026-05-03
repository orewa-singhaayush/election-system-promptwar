/**
 * Google Cloud Logging wrapper.
 * - On Cloud Run: writes structured logs to Cloud Logging via GCP SDK.
 * - Locally / if SDK unavailable: falls back to console, never crashes.
 */

let log = null;

try {
    const { Logging } = require('@google-cloud/logging');
    const logging = new Logging();              // auto-detects project on Cloud Run
    log = logging.log('voteassist-log');
    console.log('[GCLogger] ✓ Google Cloud Logging initialised');
} catch (e) {
    console.warn('[GCLogger] Cloud Logging unavailable — using console fallback:', e.message);
}

/**
 * Write a structured log entry.
 * @param {'INFO'|'WARNING'|'ERROR'} severity
 * @param {string} message
 * @param {object} [labels]
 */
async function writeLog(severity, message, labels = {}) {
    // Always mirror to stdout (Cloud Run captures stdout anyway)
    const prefix = severity === 'ERROR' ? '✗' : severity === 'WARNING' ? '⚠' : '✓';
    console.log(`[GCLogger] ${prefix} [${severity}] ${message}`);

    if (!log) return; // local dev — console only

    try {
        const metadata = {
            resource: { type: 'global' },
            severity,
            labels: { service: 'voteassist', ...labels }
        };
        const entry = log.entry(metadata, { message, ...labels });
        await log.write(entry);
    } catch (e) {
        // Never crash the request over a logging failure
        console.warn('[GCLogger] Failed to write to Cloud Logging:', e.message);
    }
}

// Convenience shortcuts
const logger = {
    info:    (msg, labels) => writeLog('INFO',    msg, labels),
    warn:    (msg, labels) => writeLog('WARNING', msg, labels),
    error:   (msg, labels) => writeLog('ERROR',   msg, labels),
};

module.exports = logger;
