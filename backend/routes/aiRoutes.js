const express = require('express');
const router = express.Router();
const {
  generatePerformanceInsights,
  generateHomework,
  generateQuiz,
  generateQuestionPaper,
  detectStudentRisk
} = require('../controllers/aiController');
const { authenticateToken, requireRole } = require('../middleware/auth');

router.post('/performance-insights', authenticateToken, generatePerformanceInsights);
router.post('/generate-homework', authenticateToken, requireRole(['teacher']), generateHomework);
router.post('/generate-quiz', authenticateToken, requireRole(['teacher']), generateQuiz);
router.post('/generate-question-paper', authenticateToken, requireRole(['teacher']), generateQuestionPaper);
router.get('/student-risk-detection', authenticateToken, requireRole(['teacher']), detectStudentRisk);

module.exports = router;
