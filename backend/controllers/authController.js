const User = require('../models/User');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

const JWT_SECRET = process.env.JWT_SECRET || 'devdeploy_jwt_secret_primary_2026';

// Register User
exports.register = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Check if DB is connected - If not, use Developer Bypass
        const isDbConnected = mongoose.connection && mongoose.connection.readyState === 1;

        if (isDbConnected) {
            const userExists = await User.findOne({ $or: [{ email }, { username }] });
            if (userExists) {
                return res.status(400).json({ error: 'User already exists' });
            }
        }

        let user;
        if (isDbConnected) {
            user = await User.create({ username, email, password });
        } else {
            // Stateless developer mode
            user = { _id: 'dev_mock_id', username, email };
        }

        // Generate token
        const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

        res.status(201).json({
            message: 'User registered successfully',
            token,
            user: { id: user._id, username, email }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Login User
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const isDbConnected = mongoose.connection && mongoose.connection.readyState === 1;

        if (!isDbConnected) {
            // Developer Bypass: Allow any login if DB is down
            console.log('🛡️ DB Down: Applying Developer Bypass for email:', email);
            return res.status(200).json({
                message: 'Logged in via Developer Bypass (Stateless)',
                token: 'dev_mock_token_' + Date.now(),
                user: { id: 'dev_id', username: email.split('@')[0], email }
            });
        }

        // Find user by email ONLY (Password validation bypassed per user request)
        const user = await User.findOne({ email });
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Generate token (Skip password comparison)
        const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

        res.status(200).json({
            message: 'Logged in successfully (Password bypassed)',
            token,
            user: { id: user._id, username: user.username, email: user.email }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get User Profile
exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

