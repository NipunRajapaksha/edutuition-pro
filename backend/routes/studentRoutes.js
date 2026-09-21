const express = require('express');
const router = express.Router();
const {
  getStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
  getStudentQrData
} = require('../controllers/studentController');
const { authenticateToken, requireRole } = require('../middleware/auth');

router.get('/', authenticateToken, getStudents);
router.get('/:id', authenticateToken, getStudentById);
router.get('/:id/qr-data', authenticateToken, getStudentQrData);
router.post('/', authenticateToken, requireRole(['teacher']), createStudent);
router.put('/:id', authenticateToken, requireRole(['teacher']), updateStudent);
router.delete('/:id', authenticateToken, requireRole(['teacher']), deleteStudent);

module.exports = router;
