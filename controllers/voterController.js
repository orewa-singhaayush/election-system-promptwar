const { saveVoter, findVoter } = require('../config/db');
const { validationResult } = require('express-validator');
const logger = require('../config/logger');

const generateVoterId = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
};

const registerVoter = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
        const { fullName, dob, zipCode } = req.body;

        // Age check
        const birthDate = new Date(dob);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        if (today.getMonth() < birthDate.getMonth() || (today.getMonth() === birthDate.getMonth() && today.getDate() < birthDate.getDate())) {
            age--;
        }

        if (age < 18) {
            return res.status(400).json({ success: false, message: 'You must be at least 18 years old to vote.' });
        }

        const voterId = generateVoterId();
        const newVoter = { ...req.body, voterId, status: 'Approved', registeredAt: new Date().toISOString() };

        await saveVoter(newVoter);
        logger.info({ type: 'voter_registration', voterId, message: 'Voter registered successfully' });

        res.json({ success: true, data: { voterId, status: 'Approved' } });

    } catch (error) {
        logger.error({ type: 'voter_registration_error', message: error.message });
        res.status(500).json({ success: false, message: 'Registration failed' });
    }
};

const checkStatus = async (req, res) => {
    try {
        const { voterId, fullName, zipCode } = req.body;
        const voter = await findVoter({ voterId, fullName, zipCode });

        if (!voter) {
            return res.status(404).json({ success: false, message: 'Voter not found' });
        }

        logger.info({ type: 'voter_status_check', voterId: voter.voterId, message: 'Voter status found' });
        res.json({ success: true, data: { voter } });

    } catch (error) {
        logger.error({ type: 'voter_status_error', message: error.message });
        res.status(500).json({ success: false, message: 'Status check failed' });
    }
};

module.exports = { registerVoter, checkStatus };
