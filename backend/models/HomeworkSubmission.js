const mongoose = require('mongoose');

const HomeworkSubmissionSchema = new mongoose.Schema({
  homeworkId: { type: String, required: true },
  studentId: { type: String, required: true },
  submissionDate: { type: String, default: () => new Date().toISOString() },
  content: { type: String, default: '' },
  attachments: [{
    name: String,
    url: String,
    type: String
  }],
  status: { type: String, enum: ['not_started', 'submitted', 'late', 'reviewed'], default: 'submitted' },
  marksObtained: { type: Number, default: null },
  feedback: { type: String, default: '' },
  reviewedAt: { type: String, default: null }
}, { timestamps: true });

HomeworkSubmissionSchema.index({ homeworkId: 1, studentId: 1 }, { unique: true });

module.exports = mongoose.models.HomeworkSubmission || mongoose.model('HomeworkSubmission', HomeworkSubmissionSchema);
