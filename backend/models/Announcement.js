const mongoose = require('mongoose');

const AnnouncementSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  targetType: { 
    type: String, 
    enum: ['all', 'class', 'specific_students', 'parents'], 
    default: 'all' 
  },
  targetClassId: { type: String, default: null },
  targetStudentIds: [{ type: String }],
  priority: { type: String, enum: ['normal', 'high', 'urgent'], default: 'normal' },
  authorName: { type: String, default: 'Institute Administration' },
  expiryDate: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.models.Announcement || mongoose.model('Announcement', AnnouncementSchema);
