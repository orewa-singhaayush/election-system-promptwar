const { saveVoter, findVoter } = require('../config/db');
const { validationResult } = require('express-validator');

const generateVoterId = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
};

const registerVoter = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
        const { 
            fullName, dob, zipCode, gender, relativeName, 
            houseNo, street, village, postOffice, district, state, constituency 
        } = req.body;

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

        await saveVoter(newVoter);

        res.json({
            success: true,
            voterId,
            status: 'Approved'
        });

    } catch (error) {
        console.error('Registration Error:', error);
        res.status(500).json({ success: false, message: 'Registration failed' });
    }
};

const checkStatus = async (req, res) => {
    try {
        const { voterId, fullName, zipCode } = req.body;
        const voter = await findVoter({ voterId, fullName, zipCode });

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
        console.error('Status Check Error:', error);
        res.status(500).json({ success: false, message: 'Status check failed' });
    }
};

module.exports = { registerVoter, checkStatus };
