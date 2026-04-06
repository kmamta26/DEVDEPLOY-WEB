const Project = require('../models/Project');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

const PROJECTS_FILE = path.join(__dirname, '../data/projects.json');

const readProjectsJson = () => { try { return JSON.parse(fs.readFileSync(PROJECTS_FILE, 'utf8')); } catch { return []; } };

exports.getStats = async (req, res) => {
    try {
        const userId = req.user?.id || 'anonymous';
        let projects = [];

        // Check if DB is connected
        if (mongoose.connection.readyState === 1) {
            projects = await Project.find({ userId });
        } else {
            // Fallback to JSON
            projects = readProjectsJson();
        }

        const totalProjects = projects.length;
        const activeProjects = projects.filter(p => p.status === 'Live' || p.status === 'running' || p.status === 'active').length;
        
        // Calculate Uptime (mock logic if not present, but use data if available)
        const avgUptime = projects.length > 0
            ? projects.reduce((sum, p) => sum + (p.uptime || 99.98), 0) / projects.length
            : 0;

        res.json({
            totalProjects,
            activeProjects,
            avgUptime: avgUptime.toFixed(2),
            bandwidth: (Math.random() * 5).toFixed(1) + ' TB' // Keeping a mock for bandwidth as requested in UI
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
