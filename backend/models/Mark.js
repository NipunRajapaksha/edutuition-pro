const mongoose = require('mongoose');

const MarkSchema = new mongoose.Schema({
  examId: { type: String, required: true },
  studentId: { type: String, required: true },
  marksObtained: { type: Number, required: true },
  percentage: { type: Number, required: true },
  grade: { type: String, required: true }, // "A+", "A", "B", "C", "S", "F"
  rank: { type: Number, default: 1 },
  remarks: { type: String, default: '' }
}, { timestamps: true });

MarkSchema.index({ examId: 1, studentId: 1 }, { unique: true });

module.exports = mongoose.models.Mark || mongoose.model('Mark', MarkSchema);
