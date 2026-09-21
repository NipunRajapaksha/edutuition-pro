const express = require('express');
const router = express.Router();
const {
  getTeacherDashboardStats,
  getStudentPerformance
} = require('../controllers/analyticsController');
const { authenticateToken, requireRole } = require('../middleware/auth');

router.get('/dashboard-stats', authenticateToken, requireRole(['teacher']), getTeacherDashboardStats);
router.get('/performance/:studentId', authenticateToken, getStudentPerformance);

module.exports = router;
