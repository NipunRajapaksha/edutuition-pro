const storage = require('../services/storage');

const getNotifications = async (req, res, next) => {
  try {
    const userId = req.user ? req.user.id : req.query.userId;
    if (!userId) {
      return res.status(400).json({ success: false, message: 'User ID required' });
    }

    const notifications = storage.notifications
      .find({ userId })
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

    const unreadCount = notifications.filter(n => !n.read).length;

    res.json({
      success: true,
      unreadCount,
      data: notifications
    });
  } catch (err) {
    next(err);
  }
};

const markAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updated = storage.notifications.findByIdAndUpdate(id, { read: true });
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }
    res.json({ success: true, message: 'Marked as read', data: updated });
  } catch (err) {
    next(err);
  }
};

const markAllAsRead = async (req, res, next) => {
  try {
    const userId = req.user ? req.user.id : req.body.userId;
    if (!userId) {
      return res.status(400).json({ success: false, message: 'User ID required' });
    }

    const notifications = storage.notifications.find({ userId });
    notifications.forEach(n => {
      storage.notifications.findByIdAndUpdate(n._id, { read: true });
    });

    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead
};
