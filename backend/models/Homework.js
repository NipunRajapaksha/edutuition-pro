const mongoose = require('mongoose');

const HomeworkSchema = new mongoose.Schema({
  classId: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  subject: { type: String, default: '' },
  attachments: [{
    name: String,
    url: String,
    type: String
  }],
  deadline: { type: String, required: true }, // "YYYY-MM-DD"
  totalMarks: { type: Number, default: 100 },
  teacherName: { type: String, default: 'Master N. Perera' }
}, { timestamps: true });

module.exports = mongoose.models.Homework || mongoose.model('Homework', HomeworkSchema);
