const express = require('express');
const router = express.Router();
const {
  getFees,
  recordPayment,
  getReceipt,
  getFinancialOverview
} = require('../controllers/feeController');
const { authenticateToken, requireRole } = require('../middleware/auth');

router.get('/', authenticateToken, getFees);
router.get('/overview', authenticateToken, requireRole(['teacher']), getFinancialOverview);
router.get('/receipt/:receiptNumber', authenticateToken, getReceipt);
router.post('/record', authenticateToken, requireRole(['teacher']), recordPayment);

module.exports = router;
