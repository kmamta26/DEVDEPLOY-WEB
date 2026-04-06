const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const auth = require('../middleware/auth');
const { uploadProject, getProjects, deleteProject, getProjectLogs } = require('../controllers/projectController');

// Multer storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, path.join(__dirname, '../uploads')),
    filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});

const upload = multer({ 
    storage, 
    limits: { fileSize: 500 * 1024 * 1024 } // 500MB
});

router.post('/upload', auth, upload.single('zipFile'), uploadProject);
router.get('/', auth, getProjects);
router.get('/:id/logs', auth, getProjectLogs);
router.delete('/:id', auth, deleteProject);

module.exports = router;
