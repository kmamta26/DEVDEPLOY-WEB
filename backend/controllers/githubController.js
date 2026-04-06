const axios = require('axios');
const simpleGit = require('simple-git');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const { runDeploymentPipeline } = require('./projectController');

const SITES_DIR = path.join(__dirname, '../../sites');

exports.fetchRepos = async (req, res) => {
    const { token } = req.body;
    if (!token) return res.status(400).json({ error: 'GitHub Personal Access Token is required.' });

    try {
        console.log('📡 Fetching GitHub repositories...');
        const response = await axios.get('https://api.github.com/user/repos', {
            headers: { Authorization: `token ${token}` },
            params: { sort: 'updated', per_page: 50 }
        });
        
        const repos = response.data.map(repo => ({
            id: repo.id,
            name: repo.name,
            full_name: repo.full_name,
            url: repo.clone_url,
            private: repo.private,
            description: repo.description
        }));

        res.status(200).json({ repos });
    } catch (err) {
        console.error('❌ GitHub Repo Fetch Failed:', err.message);
        res.status(500).json({ error: 'Failed to fetch repositories. Check your token permissions.' });
    }
};

exports.deployFromGithub = async (req, res) => {
    const { githubUrl, branch, token } = req.body;
    const githubUrlClean = (githubUrl || '').trim();
    const tokenClean = (token || '').trim();
    const branchClean = (branch || 'main').trim();

    const newId = uuidv4();
    const projectPath = path.join(SITES_DIR, newId);

    if (!githubUrlClean) return res.status(400).json({ error: 'GitHub repository URL is required.' });

    try {
        console.log(`🚀 Git Clone Initiated: ${githubUrlClean} (Branch: ${branchClean})`);
        
        // Comprehensive cleanup before cloning to avoid "Folder already exists" errors
        if (fs.existsSync(projectPath)) {
            console.log(`🧹 Clearing stale directory: ${projectPath}`);
            fs.rmSync(projectPath, { recursive: true, force: true });
        }

        // Ensure parent sites directory exists
        if (!fs.existsSync(SITES_DIR)) fs.mkdirSync(SITES_DIR, { recursive: true });

        const git = simpleGit();
        
        // CLONE OPERATION
        await git.clone(githubUrlClean, projectPath, ['--depth', '1', '-b', branchClean]);

        console.log(`✅ ${newId} clone complete. Building infrastructure...`);
        
        // Trigger the REAL deployment pipeline (npm install / build)
        const { runDeploymentPipeline } = require('./projectController');
        runDeploymentPipeline(newId, projectPath);

        res.status(201).json({ 
            message: 'Repository successfully linked. Building project...', 
            projectId: newId,
            url: `http://localhost:5000/sites/${newId}`
        });

    } catch (err) {
        console.error('❌ GitHub Deployment Failed:', err);
        // Clean up the partial directory if clone failed
        if (fs.existsSync(projectPath)) fs.rmSync(projectPath, { recursive: true, force: true });
        
        const cleanMsg = err.message.includes('not found') ? 'Repository not found or private.' : err.message;
        res.status(500).json({ error: `Deployment Failed: ${cleanMsg}` });
    }
};
