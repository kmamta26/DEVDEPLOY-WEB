const express = require('express');
const router  = express.Router();
const auth = require('../middleware/auth');
const DeployController = require('../controllers/deployController');
const multer = require('multer');
const path = require('path');

// Configure gateway for mission-critical artifact ingestion
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, '../uploads');
        if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath, { recursive: true });
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({ 
    storage,
    limits: { fileSize: 500 * 1024 * 1024 } // 500MB Limit
});

/**
 * Main Deployment Interface
 * Synchronized with High-Resiliency Controller v3.11
 */

// Deployment Root
router.get('/', auth, (req, res) => DeployController.listDeployments(req, res));
router.delete('/:id', auth, (req, res) => DeployController.deleteDeployment(req, res));

// ZIP Upload Path - MISSION DATA INGESTION
router.post('/upload', auth, upload.single('zipFile'), (req, res) => DeployController.uploadProject(req, res));

// Secondary Logic (Compatibility)
router.post('/deploy', auth, (req, res) => DeployController.deployGitHub(req, res));

module.exports = router;
