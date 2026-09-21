const express = require('express');
const router = express.Router();
const { getSettings, updateSettings } = require('../controllers/settingsController');
const { authenticateToken, requireRole } = require('../middleware/auth');

router.get('/', authenticateToken, getSettings);
router.put('/', authenticateToken, requireRole(['teacher']), updateSettings);

module.exports = router;
