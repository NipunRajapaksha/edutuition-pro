const express = require('express');
const router = express.Router();
const {
  getAttendance,
  markSingle,
  markAllPresent,
  scanQrAttendance,
  getStudentAttendanceHistory
} = require('../controllers/attendanceController');
const { authenticateToken, requireRole } = require('../middleware/auth');

router.get('/', authenticateToken, getAttendance);
router.get('/student/:studentId', authenticateToken, getStudentAttendanceHistory);
router.post('/mark', authenticateToken, requireRole(['teacher']), markSingle);
router.post('/mark-all', authenticateToken, requireRole(['teacher']), markAllPresent);
router.post('/scan-qr', authenticateToken, scanQrAttendance);

module.exports = router;
