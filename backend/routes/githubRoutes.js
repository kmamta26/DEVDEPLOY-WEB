const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { fetchRepos, deployFromGithub } = require('../controllers/githubController');

router.post('/repos', auth, fetchRepos);
router.post('/deploy', auth, deployFromGithub);

module.exports = router;
