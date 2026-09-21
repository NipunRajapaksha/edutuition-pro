const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['teacher', 'student', 'parent'], default: 'student' },
  phone: { type: String, default: '' },
  avatar: { type: String, default: '' },
  studentProfileId: { type: String, default: null }, // for students, links to Student document
  linkedStudentId: { type: String, default: null },   // for parents, links to Student document
  status: { type: String, enum: ['active', 'inactive'], default: 'active' }
}, { timestamps: true });

module.exports = mongoose.models.User || mongoose.model('User', UserSchema);
