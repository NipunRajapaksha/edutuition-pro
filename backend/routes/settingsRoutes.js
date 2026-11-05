const express = require('express');
const router = express.Router();
const { getSettings, updateSettings, activateLicense } = require('../controllers/settingsController');
const { authenticateToken, requireRole } = require('../middleware/auth');

router.get('/', authenticateToken, getSettings);
router.put('/', authenticateToken, requireRole(['teacher']), updateSettings);
router.post('/activate-license', authenticateToken, requireRole(['teacher']), activateLicense);

module.exports = router;
