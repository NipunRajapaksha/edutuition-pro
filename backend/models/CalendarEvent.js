const mongoose = require('mongoose');

const CalendarEventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['class', 'exam', 'homework_deadline', 'fee_deadline', 'holiday', 'event'], 
    default: 'class' 
  },
  date: { type: String, required: true }, // "YYYY-MM-DD"
  startTime: { type: String, default: '' },
  endTime: { type: String, default: '' },
  classId: { type: String, default: null },
  color: { type: String, default: '#3B82F6' },
  description: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.models.CalendarEvent || mongoose.model('CalendarEvent', CalendarEventSchema);
