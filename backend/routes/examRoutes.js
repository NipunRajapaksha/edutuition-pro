const express = require('express');
const router = express.Router();
const {
  getExams,
  createExam,
  enterMarksBulk,
  getExamMarks
} = require('../controllers/examController');
const { authenticateToken, requireRole } = require('../middleware/auth');

router.get('/', authenticateToken, getExams);
router.get('/:examId/marks', authenticateToken, getExamMarks);
router.post('/', authenticateToken, requireRole(['teacher']), createExam);
router.post('/:examId/marks', authenticateToken, requireRole(['teacher']), enterMarksBulk);

module.exports = router;
