const mongoose = require('mongoose');

const AttendanceSchema = new mongoose.Schema({
  classId: { type: String, required: true },
  studentId: { type: String, required: true },
  date: { type: String, required: true }, // "YYYY-MM-DD"
  status: { type: String, enum: ['present', 'absent', 'late', 'excused'], default: 'present' },
  markedVia: { type: String, enum: ['manual', 'qr'], default: 'manual' },
  time: { type: String, default: () => new Date().toLocaleTimeString() },
  notes: { type: String, default: '' }
}, { timestamps: true });

// Prevent duplicate attendance for student/class/date
AttendanceSchema.index({ classId: 1, studentId: 1, date: 1 }, { unique: true });

module.exports = mongoose.models.Attendance || mongoose.model('Attendance', AttendanceSchema);
