const express = require('express');
const router = express.Router();
const {
  getHomework,
  getStudentHomework,
  createHomework,
  updateHomework,
  deleteHomework,
  submitHomework,
  reviewSubmission,
  getHomeworkSubmissions
} = require('../controllers/homeworkController');
const { authenticateToken, requireRole } = require('../middleware/auth');

router.get('/', authenticateToken, getHomework);
router.get('/student/:studentId', authenticateToken, getStudentHomework);
router.get('/:homeworkId/submissions', authenticateToken, requireRole(['teacher']), getHomeworkSubmissions);
router.post('/', authenticateToken, requireRole(['teacher']), createHomework);
router.put('/:id', authenticateToken, requireRole(['teacher']), updateHomework);
router.delete('/:id', authenticateToken, requireRole(['teacher']), deleteHomework);
router.post('/submit', authenticateToken, submitHomework);
router.put('/submissions/:id/review', authenticateToken, requireRole(['teacher']), reviewSubmission);

module.exports = router;
