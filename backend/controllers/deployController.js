const fs = require('fs');
const path = require('path');
const admzip = require('adm-zip');
const { spawn } = require('child_process');
const response = require('../utils/response');
const Deployment = require('../models/Deployment');

const WORK_DIR = path.resolve(__dirname, '../../workdir');
const DB_PATH = path.join(__dirname, '../db.json');

const _readDb = () => {
    try {
        const raw = fs.readFileSync(DB_PATH, 'utf8');
        const parsed = JSON.parse(raw);
        return (parsed && typeof parsed === 'object') ? parsed : { users: [], deployments: [] };
    } catch {
        return { users: [], deployments: [] };
    }
};

const _writeDb = (data) => {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
};

const DeployController = {
    async uploadProject(req, res) {
        try {
            if (!req.file) return response.error(res, 'No project node payload detected.', 400);

            const stamp = Date.now();
            const id = 'proj-' + stamp;
            const dest = path.join(WORK_DIR, id);
            if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });

            const zip = new admzip(req.file.path);
            zip.extractAllTo(dest, true);

            // Entry point validation - Detect project type
            let contents = fs.readdirSync(dest);
            let projectRoot = dest;
            
            // Handle if ZIP has a root folder
            if (contents.length === 1 && fs.statSync(path.join(dest, contents[0])).isDirectory()) {
                projectRoot = path.join(dest, contents[0]);
                contents = fs.readdirSync(projectRoot);
            }

            const hasPackageJson = contents.includes('package.json');
            const hasIndexHtml = contents.includes('index.html');

            const deployment = {
                id,
                userId: (req.user && req.user.id) || 'anonymous',
                projectName: req.body.projectName || req.file.originalname.replace('.zip', ''),
                folderPath: projectRoot,
                type: hasPackageJson ? 'node' : 'static',
                status: 'building',
                url: `http://localhost:5000/proj-${id}`,
                logs: [`[${new Date().toISOString()}] Extraction complete. Detected type: ${hasPackageJson ? 'Node/React' : 'Static'}`],
                createdAt: new Date()
            };

            const db = _readDb();
            db.deployments = db.deployments || [];
            db.deployments.push(deployment);
            _writeDb(db);

            // Initiation of Build Process
            this._buildProject(deployment, db);

            return response.success(res, deployment, 'Project uploaded. Starting deployment sequence...');
        } catch (err) { return response.error(res, err.message); }
    },

    async _buildProject(deployment, db) {
        const root = deployment.folderPath;
        const entryId = deployment.id;

        if (deployment.type === 'static') {
            deployment.status = 'active';
            deployment.logs.push(`[${new Date().toISOString()}] Static deployment successful.`);
            _writeDb(db);
            return;
        }

        // Node/React Build Pipeline
        try {
            deployment.logs.push(`[${new Date().toISOString()}] Running npm install...`);
            _writeDb(db);

            await this._runCmd('npm', ['install'], root, deployment, db);
            
            deployment.logs.push(`[${new Date().toISOString()}] Running npm run build...`);
            _writeDb(db);
            
            await this._runCmd('npm', ['run', 'build'], root, deployment, db);

            // Detection of build artifact
            const buildFolder = fs.readdirSync(root).find(f => ['dist', 'build', 'out'].includes(f));
            if (buildFolder) {
                deployment.folderPath = path.join(root, buildFolder);
                deployment.logs.push(`[${new Date().toISOString()}] Build artifact found: ${buildFolder}`);
            }

            deployment.status = 'active';
            deployment.logs.push(`[${new Date().toISOString()}] Deployment LIVE @ ${deployment.url}`);
            _writeDb(db);
        } catch (err) {
            deployment.status = 'failed';
            deployment.logs.push(`[${new Date().toISOString()}] Build failed: ${err}`);
            _writeDb(db);
        }
    },

    _runCmd(cmd, args, cwd, deployment, db) {
        return new Promise((resolve, reject) => {
            const proc = spawn(cmd, args, { cwd, shell: true });
            
            proc.stdout.on('data', (data) => {
                deployment.logs.push(data.toString().trim());
                _writeDb(db);
            });

            proc.stderr.on('data', (data) => {
                deployment.logs.push(`[WARN] ${data.toString().trim()}`);
                _writeDb(db);
            });

            proc.on('close', (code) => {
                if (code === 0) resolve();
                else reject(`Command failed with code ${code}`);
            });
        });
    },

    async listDeployments(req, res) {
        const db = _readDb();
        const userId = req.user && req.user.id;
        const list = (db.deployments || []).filter(d => d.userId === userId || userId === 'anonymous');
        return res.json(list);
    },

    async deleteDeployment(req, res) {
        try {
            const id = req.params.id;
            const db = _readDb();
            const idx = db.deployments.findIndex(d => d.id === id);
            
            if (idx === -1) return response.error(res, 'Deployment not found.', 404);
            const dep = db.deployments[idx];

            if (fs.existsSync(dep.folderPath)) {
                fs.rmSync(dep.folderPath, { recursive: true, force: true });
            }

            db.deployments.splice(idx, 1);
            _writeDb(db);
            
            return response.success(res, null, 'Project deleted.');
        } catch (err) { return response.error(res, err.message); }
    }
};

module.exports = DeployController;
