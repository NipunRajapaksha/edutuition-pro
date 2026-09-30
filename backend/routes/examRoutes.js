const express = require('express');
const router = express.Router();
const {
  getExams,
  createExam,
  updateExam,
  deleteExam,
  enterMarksBulk,
  getExamMarks
} = require('../controllers/examController');
const { authenticateToken, requireRole } = require('../middleware/auth');

router.get('/', authenticateToken, getExams);
router.get('/:examId/marks', authenticateToken, getExamMarks);
router.post('/', authenticateToken, requireRole(['teacher']), createExam);
router.put('/:id', authenticateToken, requireRole(['teacher']), updateExam);
router.delete('/:id', authenticateToken, requireRole(['teacher']), deleteExam);
router.post('/:examId/marks', authenticateToken, requireRole(['teacher']), enterMarksBulk);

module.exports = router;
