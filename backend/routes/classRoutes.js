const express = require('express');
const router = express.Router();
const {
  getClasses,
  getClassById,
  createClass,
  updateClass,
  deleteClass,
  getTimetable
} = require('../controllers/classController');
const { authenticateToken, requireRole } = require('../middleware/auth');

router.get('/', authenticateToken, getClasses);
router.get('/timetable', authenticateToken, getTimetable);
router.get('/:id', authenticateToken, getClassById);
router.post('/', authenticateToken, requireRole(['teacher']), createClass);
router.put('/:id', authenticateToken, requireRole(['teacher']), updateClass);
router.delete('/:id', authenticateToken, requireRole(['teacher']), deleteClass);

module.exports = router;
