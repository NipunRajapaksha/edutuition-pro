const express = require('express');
const router = express.Router();
const {
  getHomework,
  getStudentHomework,
  createHomework,
  submitHomework,
  reviewSubmission,
  getHomeworkSubmissions
} = require('../controllers/homeworkController');
const { authenticateToken, requireRole } = require('../middleware/auth');

router.get('/', authenticateToken, getHomework);
router.get('/student/:studentId', authenticateToken, getStudentHomework);
router.get('/:homeworkId/submissions', authenticateToken, requireRole(['teacher']), getHomeworkSubmissions);
router.post('/', authenticateToken, requireRole(['teacher']), createHomework);
router.post('/submit', authenticateToken, submitHomework);
router.put('/submissions/:id/review', authenticateToken, requireRole(['teacher']), reviewSubmission);

module.exports = router;
