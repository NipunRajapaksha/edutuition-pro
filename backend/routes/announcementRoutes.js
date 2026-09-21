const express = require('express');
const router = express.Router();
const {
  getAnnouncements,
  createAnnouncement,
  deleteAnnouncement
} = require('../controllers/announcementController');
const { authenticateToken, requireRole } = require('../middleware/auth');

router.get('/', authenticateToken, getAnnouncements);
router.post('/', authenticateToken, requireRole(['teacher']), createAnnouncement);
router.delete('/:id', authenticateToken, requireRole(['teacher']), deleteAnnouncement);

module.exports = router;
