const mongoose = require('mongoose');

const ClassSchema = new mongoose.Schema({
  name: { type: String, required: true }, // e.g. "Grade 10 Mathematics"
  subject: { type: String, required: true }, // e.g. "Mathematics", "Science"
  grade: { type: String, required: true }, // e.g. "Grade 10"
  teacherName: { type: String, default: 'Master N. Perera' },
  location: { type: String, default: 'Main Hall A' },
  dayOfWeek: { type: String, required: true }, // "Saturday", "Sunday", etc.
  startTime: { type: String, required: true }, // "08:00"
  endTime: { type: String, required: true },   // "10:00"
  monthlyFee: { type: Number, required: true }, // e.g. 2500
  maxStudents: { type: Number, default: 50 },
  status: { type: String, enum: ['active', 'archived'], default: 'active' },
  color: { type: String, default: '#4F46E5' }
}, { timestamps: true });

module.exports = mongoose.models.Class || mongoose.model('Class', ClassSchema);
