const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['homework', 'attendance', 'fee', 'exam', 'announcement', 'alert'], 
    default: 'alert' 
  },
  read: { type: Boolean, default: false },
  metadata: { type: mongoose.Schema.Types.Mixed, default: {} }
}, { timestamps: true });

module.exports = mongoose.models.Notification || mongoose.model('Notification', NotificationSchema);
