const fs = require('fs');
const path = require('path');
const User = require('../models/User');

const DB_PATH = path.join(__dirname, '../db.json');

/**
 * Service to handle authentication lookups.
 * Includes 'Easy-Dev' mode with Persistent db.json fallback.
 */
class AuthService {
    constructor() {
        this._ensureDb();
    }

    _ensureDb() {
        if (!fs.existsSync(DB_PATH)) {
            fs.writeFileSync(DB_PATH, JSON.stringify({ users: [], deployments: [] }, null, 2));
        }
    }

    _readDb() {
        try {
            const data = JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
            return { users: data.users || [], deployments: data.deployments || data.projects || [] };
        } catch (e) {
            return { users: [], deployments: [] };
        }
    }

    _writeDb(data) {
        fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
    }

    async findOrCreateByEmail(email) {
        const emailRegex = /^\S+@\S+\.\S+$/;
        if (!emailRegex.test(email)) {
            throw new Error('Invalid email format');
        }

        try {
            // 1. Try Live MongoDB (Only if fully online)
            let user = null;
            if (require('mongoose').connection.readyState === 1) {
                user = await User.findOne({ email });
            }
            if (user) return user;

            // 2. Try Persistence Fallback (db.json)
            const db = this._readDb();
            const existing = db.users.find(u => u.email === email);
            if (existing) {
                return { ...existing, _id: existing.id || existing._id };
            }

            // 3. Create New (Try DB then File)
            console.log(`[Auth] New Identity Node Initialized: ${email}`);
            const newUser = {
                id: 'usr-' + Date.now(),
                _id: 'usr-' + Date.now(),
                username: email.split('@')[0],
                email: email,
                createdAt: new Date()
            };

            db.users.push(newUser);
            this._writeDb(db);
            return newUser;

        } catch (err) {
            console.warn('[AuthService] Operating in Offline Mode:', err.message);
            const db = this._readDb();
            const existing = db.users.find(u => u.email === email);
            if (existing) return { ...existing, _id: existing.id || existing._id };
            
            const newUser = { id: 'usr-' + Date.now(), _id: 'usr-' + Date.now(), username: email.split('@')[0], email: email };
            db.users.push(newUser);
            this._writeDb(db);
            return newUser;
        }
    }

    async getUserById(id) {
        try {
            if (require('mongoose').connection.readyState === 1) {
                const user = await User.findById(id);
                if (user) return user;
            }
        } catch (e) {}

        const db = this._readDb();
        const found = db.users.find(u => u.id === id || u._id === id);
        if (found) return { ...found, isGithubConnected: () => !!found.githubToken, isAwsConnected: () => !!found.awsAccessKey };
        
        return null;
    }
}

module.exports = new AuthService();
