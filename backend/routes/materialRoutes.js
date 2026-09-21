const express = require('express');
const router = express.Router();
const {
  getMaterials,
  createMaterial,
  deleteMaterial
} = require('../controllers/materialController');
const { authenticateToken, requireRole } = require('../middleware/auth');

router.get('/', authenticateToken, getMaterials);
router.post('/', authenticateToken, requireRole(['teacher']), createMaterial);
router.delete('/:id', authenticateToken, requireRole(['teacher']), deleteMaterial);

module.exports = router;
