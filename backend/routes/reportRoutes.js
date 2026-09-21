const express = require('express');
const router = express.Router();
const {
  getStudentReport,
  getClassReport,
  getFinancialReport
} = require('../controllers/reportController');
const { authenticateToken, requireRole } = require('../middleware/auth');

router.get('/student/:studentId', authenticateToken, getStudentReport);
router.get('/class/:classId', authenticateToken, requireRole(['teacher']), getClassReport);
router.get('/financial', authenticateToken, requireRole(['teacher']), getFinancialReport);

module.exports = router;
