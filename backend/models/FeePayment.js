const mongoose = require('mongoose');

const FeePaymentSchema = new mongoose.Schema({
  receiptNumber: { type: String, required: true, unique: true }, // e.g. "REC-2026-001"
  studentId: { type: String, required: true },
  classId: { type: String, required: true },
  month: { type: String, required: true }, // "January", "February", etc.
  year: { type: Number, required: true },  // 2026
  amountDue: { type: Number, required: true },
  amountPaid: { type: Number, required: true },
  balance: { type: Number, default: 0 },
  status: { type: String, enum: ['paid', 'partially_paid', 'pending', 'overdue'], default: 'pending' },
  paymentMethod: { type: String, enum: ['cash', 'bank_transfer', 'online', 'other'], default: 'cash' },
  paymentDate: { type: String, default: () => new Date().toISOString().split('T')[0] },
  transactionId: { type: String, default: '' },
  notes: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.models.FeePayment || mongoose.model('FeePayment', FeePaymentSchema);
