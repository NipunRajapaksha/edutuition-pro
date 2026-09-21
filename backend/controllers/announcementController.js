const storage = require('../services/storage');

const getAnnouncements = async (req, res, next) => {
  try {
    const { targetType, classId } = req.query;
    let list = storage.announcements.find();

    if (targetType) {
      list = list.filter(a => a.targetType === targetType || a.targetType === 'all');
    }
    if (classId) {
      list = list.filter(a => a.targetType === 'all' || a.targetClassId === classId);
    }

    // Role-based visibility
    if (req.user) {
      if (req.user.role === 'student' && req.user.studentProfileId) {
        const student = storage.students.findById(req.user.studentProfileId);
        const classes = student ? student.enrolledClasses || [] : [];
        list = list.filter(a =>
          a.targetType === 'all' ||
          (a.targetType === 'class' && classes.includes(a.targetClassId)) ||
          (a.targetType === 'specific_students' && a.targetStudentIds && a.targetStudentIds.includes(req.user.studentProfileId))
        );
      } else if (req.user.role === 'parent') {
        list = list.filter(a => a.targetType === 'all' || a.targetType === 'parents');
      }
    }

    list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));

    res.json({ success: true, count: list.length, data: list });
  } catch (err) {
    next(err);
  }
};

const createAnnouncement = async (req, res, next) => {
  try {
    const {
      title,
      content,
      targetType = 'all',
      targetClassId = null,
      targetStudentIds = [],
      priority = 'normal',
      expiryDate = ''
    } = req.body;

    if (!title || !content) {
      return res.status(400).json({ success: false, message: 'Title and content are required' });
    }

    const announcement = storage.announcements.create({
      title,
      content,
      targetType,
      targetClassId,
      targetStudentIds,
      priority,
      authorName: req.user ? req.user.name : 'Teacher / Admin',
      expiryDate
    });

    // Create notifications for targeted users
    let recipients = [];
    if (targetType === 'all') {
      recipients = storage.users.find();
    } else if (targetType === 'parents') {
      recipients = storage.users.find({ role: 'parent' });
    } else if (targetType === 'class' && targetClassId) {
      const enrolled = storage.students.find({ status: 'active' }).filter(s =>
        s.enrolledClasses && s.enrolledClasses.includes(targetClassId)
      );
      const studentIds = enrolled.map(s => s._id);
      recipients = storage.users.find().filter(u =>
        (u.studentProfileId && studentIds.includes(u.studentProfileId)) ||
        (u.linkedStudentId && studentIds.includes(u.linkedStudentId))
      );
    }

    recipients.forEach(u => {
      storage.notifications.create({
        userId: u._id,
        title: `Notice: ${title}`,
        message: content.length > 100 ? content.slice(0, 97) + '...' : content,
        type: 'announcement'
      });
    });

    res.status(201).json({ success: true, message: 'Announcement broadcasted successfully', data: announcement });
  } catch (err) {
    next(err);
  }
};

const deleteAnnouncement = async (req, res, next) => {
  try {
    const { id } = req.params;
    const removed = storage.announcements.findByIdAndDelete(id);
    if (!removed) {
      return res.status(404).json({ success: false, message: 'Announcement not found' });
    }
    res.json({ success: true, message: 'Announcement deleted' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAnnouncements,
  createAnnouncement,
  deleteAnnouncement
};
