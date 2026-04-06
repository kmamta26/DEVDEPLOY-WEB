const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { listInstances, toggleInstance } = require('../controllers/awsController');

router.get('/instances', auth, listInstances);
router.post('/instances/:id/:action', auth, toggleInstance); // action: start | stop

module.exports = router;
