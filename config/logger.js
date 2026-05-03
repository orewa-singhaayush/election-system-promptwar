/**
 * Google Cloud Logging wrapper (Structured).
 */

let log = null;

try {
    const { Logging } = require('@google-cloud/logging');
    const logging = new Logging();
    log = logging.log('voteassist-log');
    console.log('[GCLogger] ✓ Structured Logging initialised');
} catch (e) {
    console.warn('[GCLogger] Cloud Logging unavailable:', e.message);
}

/**
 * Write a structured log entry.
 * @param {'INFO'|'WARNING'|'ERROR'} severity
 * @param {object} payload
 */
async function writeLog(severity, payload) {
    const timestamp = new Date().toISOString();
    const message = payload.message || payload.type || 'No message provided';
    
    // Console mirror for Cloud Run capturing
    console.log(`[${severity}] [${timestamp}] ${JSON.stringify(payload)}`);

    if (!log) return;

    try {
        const metadata = {
            resource: { type: 'global' },
            severity,
            labels: { service: 'voteassist', ...payload.labels }
        };
        const entry = log.entry(metadata, { ...payload, timestamp });
        await log.write(entry);
    } catch (e) {
        console.warn('[GCLogger] Write error:', e.message);
    }
}

const logger = {
    info:    (payload) => writeLog('INFO',    payload),
    warn:    (payload) => writeLog('WARNING', payload),
    error:   (payload) => writeLog('ERROR',   payload),
};

module.exports = logger;
