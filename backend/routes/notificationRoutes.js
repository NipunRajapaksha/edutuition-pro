const express = require('express');
const router = express.Router();
const {
  getNotifications,
  markAsRead,
  markAllAsRead
} = require('../controllers/notificationController');
const { authenticateToken } = require('../middleware/auth');

router.get('/', authenticateToken, getNotifications);
router.put('/:id/read', authenticateToken, markAsRead);
router.post('/read-all', authenticateToken, markAllAsRead);

module.exports = router;
