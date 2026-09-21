const storage = require('../services/storage');

const getMaterials = async (req, res, next) => {
  try {
    const { classId, subject, topic } = req.query;
    let materials = storage.studyMaterials.find();

    if (classId) materials = materials.filter(m => m.classId === classId);
    if (subject) materials = materials.filter(m => m.subject.toLowerCase() === subject.toLowerCase());
    if (topic) materials = materials.filter(m => m.topic.toLowerCase().includes(topic.toLowerCase()));

    const enriched = materials.map(m => {
      const cls = storage.classes.findById(m.classId);
      return {
        ...m,
        className: cls ? cls.name : 'Class'
      };
    });

    res.json({ success: true, count: enriched.length, data: enriched });
  } catch (err) {
    next(err);
  }
};

const createMaterial = async (req, res, next) => {
  try {
    const {
      classId,
      subject,
      topic,
      title,
      description = '',
      fileUrl,
      fileType = 'pdf',
      fileSize = '1.8 MB'
    } = req.body;

    if (!classId || !subject || !topic || !title || !fileUrl) {
      return res.status(400).json({ success: false, message: 'classId, subject, topic, title, and fileUrl required' });
    }

    const material = storage.studyMaterials.create({
      classId,
      subject,
      topic,
      title,
      description,
      fileUrl,
      fileType,
      fileSize,
      uploadedBy: req.user ? req.user.name : 'Teacher'
    });

    // Notify enrolled students
    const enrolled = storage.students.find({ status: 'active' }).filter(s =>
      s.enrolledClasses && s.enrolledClasses.includes(classId)
    );

    enrolled.forEach(st => {
      const u = storage.users.findOne({ studentProfileId: st._id });
      if (u) {
        storage.notifications.create({
          userId: u._id,
          title: 'New Study Material Available',
          message: `New notes added for ${subject}: "${title}"`,
          type: 'announcement'
        });
      }
    });

    res.status(201).json({ success: true, message: 'Material uploaded successfully', data: material });
  } catch (err) {
    next(err);
  }
};

const deleteMaterial = async (req, res, next) => {
  try {
    const { id } = req.params;
    const removed = storage.studyMaterials.findByIdAndDelete(id);
    if (!removed) {
      return res.status(404).json({ success: false, message: 'Material not found' });
    }
    res.json({ success: true, message: 'Material deleted successfully' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getMaterials,
  createMaterial,
  deleteMaterial
};
