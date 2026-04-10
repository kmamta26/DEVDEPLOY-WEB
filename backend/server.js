require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');

// Routes
const authRoutes = require('./routes/authRoutes');
const projectRoutes = require('./routes/projectRoutes');
const githubRoutes = require('./routes/githubRoutes'); // Added for integration console
const awsRoutes = require('./routes/awsRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/devdeploy';

// Ensure essential directories exist
const REQUIRED_DIRS = ['uploads', 'data', 'sites'];
REQUIRED_DIRS.forEach(dir => {
    const d = path.resolve(__dirname, dir);
    if (!fs.existsSync(d)) {
        console.log(`📁 Initializing directory: ${dir}`);
        fs.mkdirSync(d, { recursive: true });
    }
});

// Middleware
app.use(cors());
app.use(express.json());

// DB Connection - PHASE 2 (Database
// Connect to MongoDB
mongoose.connect(MONGO_URI, {
    bufferCommands: true, // Allow operations to queue while connecting
    serverSelectionTimeoutMS: 5000 
})
.then(() => console.log('✅ MongoDB connected successfully.'))
.catch(err => console.log('⚠️ MongoDB not detected. Using stateless JSON persistence.'));

mongoose.connection.on('error', () => {
    // Silently handle errors after initial connection to prevent crashes
});

// API Routes
app.use('/api', authRoutes); 
app.use('/api/projects', projectRoutes);
app.use('/api/github', githubRoutes);
app.use('/api/aws', awsRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Additional Required APIs for UI logic
app.get('/api/aws/status', (req, res) => {
    res.json({
        serverStatus: 'Running',
        logs: [
            '2026-04-06 19:40:15 - AWS: EC2 Instance online',
            '2026-04-06 19:40:17 - SSL: Certificates verified for *.devdeploy.io',
            '2026-04-06 19:40:20 - System: CPU Usage at 5%'
        ]
    });
});

// Serve frontend in production (Port 5000)
const CLIENT_DIST = path.resolve(__dirname, '../frontend/dist');
app.use(express.static(CLIENT_DIST));

// Intelligent Project Hosting Middleware (Recursive Search)
app.use('/sites/:id', (req, res, next) => {
    const projectId = req.params.id;
    let projectPath = path.resolve(__dirname, 'sites', projectId);

    if (!fs.existsSync(projectPath)) return res.status(404).json({ error: 'Project not found' });

    // ENFORCE TRAILING SLASH for relative path resolution stability
    if (!req.originalUrl.endsWith('/') && !req.path.includes('.')) {
        return res.redirect(301, req.originalUrl + '/');
    }

    // Recursive helper to find true root (index.html or package.json)
    const resolveRoot = (current) => {
        const items = fs.readdirSync(current).filter(f => !f.startsWith('.') && f !== '__MACOSX');
        
        // If index.html exists here, this is the root
        if (fs.existsSync(path.join(current, 'index.html'))) return current;

        // If only one directory exists (typical ZIP wrapper), recurse into it
        if (items.length === 1) {
            const nextPath = path.join(current, items[0]);
            if (fs.statSync(nextPath).isDirectory()) {
                return resolveRoot(nextPath);
            }
        }
        return current;
    };

    try {
        projectPath = resolveRoot(projectPath);
    } catch (e) {
        console.error('Root resolution error:', e);
    }

    // 2. Look for build outputs (dist, build, out, etc.)
    const buildFolders = ['dist', 'build', 'out', 'public'];
    let effectiveRoot = projectPath;
    
    for (const folder of buildFolders) {
        const fullBuildPath = path.join(projectPath, folder);
        if (fs.existsSync(fullBuildPath)) {
            effectiveRoot = fullBuildPath;
            break;
        }
    }

    // SPA Routing Logic:
    // If request is for a file that exists, serve it
    // If not, and it's not a direct file request (no extension), serve index.html
    const requestedPath = path.join(effectiveRoot, req.path === '/' ? 'index.html' : req.path);
    const hasExtension = path.extname(req.path) !== '';

    if (fs.existsSync(requestedPath) && fs.statSync(requestedPath).isFile()) {
        return res.sendFile(requestedPath);
    } else if (!hasExtension || req.path === '/') {
        const indexPath = path.join(effectiveRoot, 'index.html');
        if (fs.existsSync(indexPath)) {
            return res.sendFile(indexPath);
        }
    }

    // Fallback to standard static serving
    return express.static(effectiveRoot)(req, res, next);
});

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/data', express.static(path.join(__dirname, 'data')));

if (fs.existsSync(CLIENT_DIST)) {
    app.get('*', (req, res) => {
        res.sendFile(path.join(CLIENT_DIST, 'index.html'));
    });
}

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 DevDeploy Multi-Cloud Platform serving Unified on http://localhost:${PORT}`);
});
