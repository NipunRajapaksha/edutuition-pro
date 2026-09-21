const express = require('express');
const router = express.Router();
const {
  getCalendarEvents,
  createCalendarEvent,
  deleteCalendarEvent
} = require('../controllers/calendarController');
const { authenticateToken, requireRole } = require('../middleware/auth');

router.get('/', authenticateToken, getCalendarEvents);
router.post('/', authenticateToken, requireRole(['teacher']), createCalendarEvent);
router.delete('/:id', authenticateToken, requireRole(['teacher']), deleteCalendarEvent);

module.exports = router;
