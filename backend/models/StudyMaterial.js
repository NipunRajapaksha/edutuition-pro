const mongoose = require('mongoose');

const StudyMaterialSchema = new mongoose.Schema({
  classId: { type: String, required: true },
  subject: { type: String, required: true },
  topic: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  fileUrl: { type: String, required: true },
  fileType: { 
    type: String, 
    enum: ['pdf', 'video', 'image', 'doc', 'link'], 
    default: 'pdf' 
  },
  fileSize: { type: String, default: '2.4 MB' },
  uploadedBy: { type: String, default: 'Teacher' }
}, { timestamps: true });

module.exports = mongoose.models.StudyMaterial || mongoose.model('StudyMaterial', StudyMaterialSchema);
