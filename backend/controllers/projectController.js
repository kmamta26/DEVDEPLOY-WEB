const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const AdmZip = require('adm-zip');
const { exec } = require('child_process');
const Project = require('../models/Project');
const mongoose = require('mongoose');

const DATA_DIR = path.join(__dirname, '../data');
const PROJECTS_FILE = path.join(DATA_DIR, 'projects.json');
const SITES_DIR = path.join(__dirname, '../sites');
const LOGS_DIR = path.join(__dirname, '../logs');

// Ensure directories exist
[DATA_DIR, SITES_DIR, LOGS_DIR].forEach(dir => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

if (!fs.existsSync(PROJECTS_FILE)) fs.writeFileSync(PROJECTS_FILE, JSON.stringify([]));

// Helpers
const readProjectsJson = () => { try { return JSON.parse(fs.readFileSync(PROJECTS_FILE, 'utf8')); } catch { return []; } };
const writeProjectsJson = (projects) => { fs.writeFileSync(PROJECTS_FILE, JSON.stringify(projects, null, 2)); };

const updateProjectStatus = async (id, status, buildLog = null) => {
    // Update JSON
    const projects = readProjectsJson();
    const idx = projects.findIndex(p => p.id === id || p._id === id);
    if (idx !== -1) {
        projects[idx].status = status;
        writeProjectsJson(projects);
    }
    // Update DB
    if (mongoose.connection.readyState === 1) {
        await Project.findOneAndUpdate({ $or: [{ _id: id }, { name: id }] }, { status });
    }
    // Append Log
    if (buildLog) {
        const logPath = path.join(LOGS_DIR, `${id}.log`);
        fs.appendFileSync(logPath, `[${new Date().toISOString()}] ${buildLog}\n`);
    }
};

/**
 * Recursively finds the true project root (folder containing index.html or package.json)
 * Now smarter: searches nested directories even if multiple items exist, 
 * giving priority to typical web root folders.
 */
const resolveProjectRoot = (currentPath, depth = 0) => {
    if (!fs.existsSync(currentPath) || depth > 3) return currentPath;
    
    // Priority 1: Current folder has the essential markers
    if (fs.existsSync(path.join(currentPath, 'index.html')) || fs.existsSync(path.join(currentPath, 'package.json'))) {
        return currentPath;
    }

    // Priority 2: Look for common nested web roots (client, frontend, app)
    const commonRoots = ['client', 'frontend', 'app', 'src'];
    for (const root of commonRoots) {
        const potential = path.join(currentPath, root);
        if (fs.existsSync(potential) && fs.statSync(potential).isDirectory()) {
            if (fs.existsSync(path.join(potential, 'package.json')) || fs.existsSync(path.join(potential, 'index.html'))) {
                return potential;
            }
        }
    }

    const items = fs.readdirSync(currentPath).filter(f => !f.startsWith('.') && f !== '__MACOSX' && f !== 'node_modules');
    
    // Priority 3: If only one directory exists (typical ZIP wrapper), recurse
    if (items.length === 1) {
        const nextPath = path.join(currentPath, items[0]);
        if (fs.statSync(nextPath).isDirectory()) {
            return resolveProjectRoot(nextPath, depth + 1);
        }
    }

    // Priority 4: Search for any directory that has markers (breadth-first-ish)
    for (const item of items) {
        const nextPath = path.join(currentPath, item);
        if (fs.statSync(nextPath).isDirectory()) {
            const resolved = resolveProjectRoot(nextPath, depth + 1);
            if (resolved !== nextPath) return resolved;
            if (fs.existsSync(path.join(nextPath, 'package.json')) || fs.existsSync(path.join(nextPath, 'index.html'))) {
                return nextPath;
            }
        }
    }
    
    return currentPath;
};

// Export for external controllers (like GitHub)
const runDeploymentPipeline = (projectId, baseSitePath) => {
    updateProjectStatus(projectId, 'building', 'Checking environment and resolving project root...');
    
    // 0. Resolve True Root (Flatten wrappers and find actual source)
    const projectPath = resolveProjectRoot(baseSitePath);
    console.log(`🚀 Final Project Root resolved: ${projectPath}`);

    const hasPackageJson = fs.existsSync(path.join(projectPath, 'package.json'));
    
    if (!hasPackageJson) {
        updateProjectStatus(projectId, 'Live', 'Static site detected. Deployment successful.');
        return;
    }

    updateProjectStatus(projectId, 'building', `Targeting ${path.basename(projectPath)} for build. Installing dependencies...`);
    
    // 1. npm install - Increased buffer to prevent crash on large dependency trees
    const installTask = exec('npm install', { cwd: projectPath, maxBuffer: 10 * 1024 * 1024 });
    
    installTask.on('close', (code) => {
        if (code !== 0) {
            updateProjectStatus(projectId, 'failed', 'NPM Install failed. Check logs for details.');
            return;
        }

        updateProjectStatus(projectId, 'building', 'Dependencies ready. Initiating production build...');
        
        // 2. npm run build
        const buildTask = exec('npm run build', { cwd: projectPath, maxBuffer: 10 * 1024 * 1024 });

        buildTask.on('close', (code) => {
            if (code !== 0) {
                // If "build" script is missing, some projects might just be running in dev mode
                // We'll treat it as a success if we can still serve the project
                updateProjectStatus(projectId, 'Live', 'Warning: Build script failed or missing, but dependencies are installed. Serving best-effort.');
            } else {
                updateProjectStatus(projectId, 'Live', 'Build successful. Project is now live.');
            }
            
            // Log the structure for debugging
            console.log(`✅ Deployment complete for ${projectId} at ${projectPath}`);
        });
    });

    // Capture logs
    installTask.stdout.on('data', (data) => updateProjectStatus(projectId, 'building', `INFO: ${data.substring(0, 100)}...`));
    installTask.stderr.on('data', (data) => console.warn(`[Install Log] ${data}`));
};

exports.runDeploymentPipeline = runDeploymentPipeline;

exports.getProjects = async (req, res) => {
    try {
        const jsonProjects = readProjectsJson();
        if (mongoose.connection.readyState === 1) {
            const dbProjects = await Project.find({}).sort({ createdAt: -1 });
            return res.status(200).json(dbProjects.length > 0 ? dbProjects : jsonProjects);
        }
        return res.status(200).json(jsonProjects);
    } catch { return res.status(200).json(readProjectsJson()); }
};

exports.getProjectLogs = (req, res) => {
    const { id } = req.params;
    const logPath = path.join(LOGS_DIR, `${id}.log`);
    if (fs.existsSync(logPath)) {
        return res.status(200).json({ logs: fs.readFileSync(logPath, 'utf8').split('\n') });
    }
    return res.status(200).json({ logs: ['No logs found for this project.'] });
};

exports.uploadProject = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

        const projects = readProjectsJson();
        let projectName = req.body.name || req.file.originalname.split('.')[0];
        const exists = projects.some(p => p.name === projectName);
        if (exists) projectName = `${projectName}_${Math.floor(Math.random() * 1000)}`;

        const newId = uuidv4();
        const projectSiteDir = path.join(SITES_DIR, newId);

        // EXTRACTION
        try {
            const zip = new AdmZip(req.file.path);
            zip.extractAllTo(projectSiteDir, true);
        } catch (extractErr) {
            return res.status(500).json({ error: 'Extraction failed' });
        }

        const newProject = {
            id: newId, _id: newId, name: projectName, filename: req.file.filename,
            size: req.file.size, status: 'building', url: `http://localhost:5000/sites/${newId}`,
            type: 'ZIP', createdAt: new Date()
        };

        // Persist
        try {
            if (mongoose.connection.readyState === 1) {
                await Project.create({ name: projectName, userId: req.user?.id || 'anonymous', port: 5000, url: newProject.url, status: 'deploying' });
            }
        } catch (dbErr) { /* fallback managed below */ }
        
        projects.push(newProject);
        writeProjectsJson(projects);

        // Start REAL Pipeline (Non-blocking)
        runDeploymentPipeline(newId, projectSiteDir);

        return res.status(201).json(newProject);

    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

exports.deleteProject = async (req, res) => {
    try {
        const { id } = req.params;
        console.log(`🗑️ Deletion requested for: ${id}`);

        // 1. Precise JSON Cleanup (Sync Step)
        const projects = readProjectsJson();
        const filtered = projects.filter(p => p.id !== id && p._id !== id && p.name !== id);
        writeProjectsJson(filtered);

        // 2. Comprehensive File System Cleanup
        const sitePath = path.join(SITES_DIR, id);
        if (fs.existsSync(sitePath)) {
            fs.rmSync(sitePath, { recursive: true, force: true });
            console.log(`📁 Project site folder cleared: ${id}`);
        }
        
        const logPath = path.join(LOGS_DIR, `${id}.log`);
        if (fs.existsSync(logPath)) fs.unlinkSync(logPath);

        // 3. Robust Database Cleanup (supports both ObjectId and Name matching)
        if (mongoose.connection.readyState === 1) {
            try {
                // Determine if it's a valid ID or a Name string
                const query = mongoose.Types.ObjectId.isValid(id) ? { _id: id } : { name: id };
                await Project.findOneAndDelete(query);
                console.log(`✅ MongoDB record cleared: ${id}`);
            } catch (dbErr) {
                console.warn('⚠️ MongoDB deletion skipped (CastError or missing).');
            }
        }

        res.status(200).json({ message: 'Project successfully purged from DevDeploy cluster.' });
    } catch (err) {
        console.error('🔴 Deletion failed:', err);
        res.status(500).json({ error: 'Purge failed: ' + err.message });
    }
};
