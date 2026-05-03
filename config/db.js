const fs = require('fs');
const path = require('path');

// ── Firestore: lazy-loaded only when credentials exist ────────────────────
// This avoids crashing in production when @google-cloud/firestore is not
// installed (it lives in devDependencies intentionally to keep the image slim).
let db = null;

function tryInitFirestore() {
    if (!(process.env.GOOGLE_APPLICATION_CREDENTIALS || process.env.K_SERVICE)) return;
    try {
        const { Firestore } = require('@google-cloud/firestore');
        db = new Firestore();
        console.log('📦 Connected to Google Cloud Firestore');
    } catch (e) {
        console.warn('⚠️  Firestore not available — falling back to local JSON:', e.message);
    }
}

tryInitFirestore();

// ── Local JSON fallback ───────────────────────────────────────────────────
const DB_FILE = path.join(__dirname, '..', 'data', 'voters.json');

try {
    if (!fs.existsSync(path.dirname(DB_FILE))) {
        fs.mkdirSync(path.dirname(DB_FILE), { recursive: true });
    }
    if (!fs.existsSync(DB_FILE)) {
        fs.writeFileSync(DB_FILE, JSON.stringify([]));
    }
} catch (e) {
    console.warn('⚠️  Could not initialise local JSON DB:', e.message);
}

function readLocalDB() {
    try { return JSON.parse(fs.readFileSync(DB_FILE, 'utf8')); }
    catch { return []; }
}

function writeLocalDB(data) {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

// ── Public API ────────────────────────────────────────────────────────────
const getVoters = async () => {
    if (db) {
        const snap = await db.collection('voters').get();
        return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }
    return readLocalDB();
};

const saveVoter = async (voter) => {
    if (db) {
        await db.collection('voters').add(voter);
    } else {
        const voters = readLocalDB();
        voters.push(voter);
        writeLocalDB(voters);
    }
};

const findVoter = async ({ voterId, fullName, zipCode }) => {
    if (db) {
        let snap;
        if (voterId) {
            snap = await db.collection('voters').where('voterId', '==', voterId.toUpperCase().trim()).get();
        } else if (fullName && zipCode) {
            snap = await db.collection('voters')
                .where('fullName', '==', fullName.trim())
                .where('zipCode', '==', zipCode.trim())
                .get();
        }
        return (!snap || snap.empty) ? null : snap.docs[0].data();
    }

    const voters = readLocalDB();
    if (voterId) {
        return voters.find(v => v.voterId === voterId.toUpperCase().trim()) || null;
    }
    if (fullName && zipCode) {
        return voters.find(v =>
            v.fullName.toLowerCase() === fullName.toLowerCase().trim() &&
            v.zipCode === zipCode.trim()
        ) || null;
    }
    return null;
};

module.exports = { getVoters, saveVoter, findVoter };
