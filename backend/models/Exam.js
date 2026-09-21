const mongoose = require('mongoose');

const ExamSchema = new mongoose.Schema({
  name: { type: String, required: true }, // e.g. "Term 1 Evaluation", "Monthly Test - Feb"
  type: { 
    type: String, 
    enum: ['monthly_test', 'term_test', 'model_paper', 'class_test', 'final_exam'], 
    default: 'monthly_test' 
  },
  classId: { type: String, required: true },
  subject: { type: String, required: true },
  date: { type: String, required: true }, // "YYYY-MM-DD"
  totalMarks: { type: Number, default: 100 },
  status: { type: String, enum: ['scheduled', 'completed', 'graded'], default: 'completed' },
  notes: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.models.Exam || mongoose.model('Exam', ExamSchema);
