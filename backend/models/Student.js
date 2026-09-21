const mongoose = require('mongoose');

const StudentSchema = new mongoose.Schema({
  studentId: { type: String, required: true, unique: true }, // e.g. STU-2026-001
  fullName: { type: String, required: true },
  photo: { type: String, default: '' },
  dob: { type: String, default: '' },
  gender: { type: String, enum: ['male', 'female', 'other'], default: 'male' },
  phone: { type: String, default: '' },
  email: { type: String, default: '' },
  address: { type: String, default: '' },
  parentName: { type: String, default: '' },
  parentPhone: { type: String, default: '' },
  school: { type: String, default: '' },
  grade: { type: String, required: true }, // e.g. "Grade 10", "Grade 11", "A/L"
  enrolledClasses: [{ type: String }], // Array of Class IDs
  enrollmentDate: { type: String, default: () => new Date().toISOString().split('T')[0] },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  notes: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.models.Student || mongoose.model('Student', StudentSchema);
