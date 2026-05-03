const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Database file
const DB_FILE = path.join(__dirname, 'data', 'voters.json');

// Initialize DB if not exists
if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify([]));
}

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// -------------------------
// DATABASE HELPERS
// -------------------------
function readDatabase() {
    try {
        const data = fs.readFileSync(DB_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error("Error reading database:", error);
        return [];
    }
}

function writeDatabase(data) {
    try {
        fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
    } catch (error) {
        console.error("Error writing database:", error);
    }
}

function generateVoterId() {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
}

// -------------------------
// ROUTES
// -------------------------

// ✅ Register
app.post('/api/register', (req, res) => {
    try {
        const { 
            fullName, dob, zipCode, gender, relativeName, 
            houseNo, street, village, postOffice, district, state, constituency 
        } = req.body;

        if (!fullName || !dob || !zipCode) {
            return res.status(400).json({ success: false, message: 'Primary fields are required.' });
        }

        // Age check
        const birthDate = new Date(dob);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();

        if (
            today.getMonth() < birthDate.getMonth() ||
            (today.getMonth() === birthDate.getMonth() && today.getDate() < birthDate.getDate())
        ) {
            age--;
        }

        if (age < 18) {
            return res.status(400).json({
                success: false,
                message: 'You must be at least 18 years old to vote.'
            });
        }

        const voterId = generateVoterId();

        const newVoter = {
            voterId,
            fullName,
            dob,
            zipCode,
            gender,
            relativeName,
            houseNo,
            street,
            village,
            postOffice,
            district,
            state,
            constituency,
            status: 'Approved',
            registeredAt: new Date().toISOString()
        };

        const voters = readDatabase();
        voters.push(newVoter);
        writeDatabase(voters);

        res.json({
            success: true,
            voterId,
            status: 'Approved'
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Registration failed' });
    }
});

// ✅ Check Status
app.post('/api/status', (req, res) => {
    try {
        const { voterId, fullName, zipCode } = req.body;
        const voters = readDatabase();

        let voter = null;

        if (voterId) {
            voter = voters.find(v => v.voterId === voterId.toUpperCase().trim());
        } else if (fullName && zipCode) {
            voter = voters.find(v =>
                v.fullName.toLowerCase() === fullName.toLowerCase().trim() &&
                v.zipCode === zipCode.trim()
            );
        }

        if (!voter) {
            return res.status(404).json({
                success: false,
                message: 'Voter not found'
            });
        }

        res.json({
            success: true,
            voter
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Status check failed' });
    }
});

// ✅ REAL AI CHAT (GEMINI)
app.post('/api/chat', async (req, res) => {
    try {
        const { message } = req.body;

        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }

        if (!process.env.GEMINI_API_KEY) {
            return res.status(500).json({
                error: "API key missing in .env file"
            });
        }

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

        const model = genAI.getGenerativeModel({
            model: "gemini-1.5-flash"
        });

        const prompt = `
You are a smart AI Election Assistant for India.

Your job:
- Help people understand voting process
- Give clear step-by-step guidance
- Answer like a real human assistant
- Keep responses simple and useful
- NEVER say "I am just an assistant"

User question:
${message}
`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        res.json({ reply: text });

    } catch (error) {
        console.error("AI ERROR:", error);
        res.status(500).json({
            error: "AI failed. Check API key or internet."
        });
    }
});

// -------------------------
// START SERVER
// -------------------------
app.listen(port, () => {
    console.log(`🚀 Server running at http://localhost:${port}`);
});