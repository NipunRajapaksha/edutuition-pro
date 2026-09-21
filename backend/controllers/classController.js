const storage = require('../services/storage');

const getClasses = async (req, res, next) => {
  try {
    const { status, grade } = req.query;
    let classes = storage.classes.find();

    if (status) {
      classes = classes.filter(c => c.status === status);
    }
    if (grade) {
      classes = classes.filter(c => c.grade === grade);
    }

    const allStudents = storage.students.find({ status: 'active' });

    const enriched = classes.map(cls => {
      const enrolledCount = allStudents.filter(s => 
        s.enrolledClasses && s.enrolledClasses.includes(cls._id)
      ).length;

      return {
        ...cls,
        enrolledCount,
        availableSeats: Math.max(0, (cls.maxStudents || 50) - enrolledCount)
      };
    });

    res.json({ success: true, count: enriched.length, data: enriched });
  } catch (err) {
    next(err);
  }
};

const getClassById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const cls = storage.classes.findById(id);
    if (!cls) {
      return res.status(404).json({ success: false, message: 'Class not found' });
    }

    const students = storage.students.find({ status: 'active' }).filter(s =>
      s.enrolledClasses && s.enrolledClasses.includes(cls._id)
    );

    const upcomingExams = storage.exams.find({ classId: cls._id }).slice(0, 5);
    const activeHomework = storage.homework.find({ classId: cls._id }).slice(0, 5);

    res.json({
      success: true,
      data: {
        ...cls,
        enrolledCount: students.length,
        students: students.map(s => ({
          _id: s._id,
          studentId: s.studentId,
          fullName: s.fullName,
          phone: s.phone,
          school: s.school,
          photo: s.photo
        })),
        upcomingExams,
        activeHomework
      }
    });
  } catch (err) {
    next(err);
  }
};

const createClass = async (req, res, next) => {
  try {
    const {
      name,
      subject,
      grade,
      teacherName = 'Master N. Perera',
      location = 'Room 101',
      dayOfWeek,
      startTime,
      endTime,
      monthlyFee,
      maxStudents = 50,
      color = '#4F46E5'
    } = req.body;

    if (!name || !subject || !grade || !dayOfWeek || !startTime || !endTime || !monthlyFee) {
      return res.status(400).json({ success: false, message: 'Please provide all required class fields' });
    }

    const newClass = storage.classes.create({
      name,
      subject,
      grade,
      teacherName,
      location,
      dayOfWeek,
      startTime,
      endTime,
      monthlyFee: Number(monthlyFee),
      maxStudents: Number(maxStudents),
      status: 'active',
      color
    });

    // Also register a calendar entry for weekly recurring class
    storage.calendarEvents.create({
      title: `${name} (${dayOfWeek})`,
      type: 'class',
      date: new Date().toISOString().split('T')[0],
      startTime,
      endTime,
      classId: newClass._id,
      color,
      description: `${subject} - ${grade}`
    });

    res.status(201).json({ success: true, message: 'Class created successfully', data: newClass });
  } catch (err) {
    next(err);
  }
};

const updateClass = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updated = storage.classes.findByIdAndUpdate(id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Class not found' });
    }
    res.json({ success: true, message: 'Class updated successfully', data: updated });
  } catch (err) {
    next(err);
  }
};

const deleteClass = async (req, res, next) => {
  try {
    const { id } = req.params;
    const removed = storage.classes.findByIdAndDelete(id);
    if (!removed) {
      return res.status(404).json({ success: false, message: 'Class not found' });
    }
    res.json({ success: true, message: 'Class removed successfully' });
  } catch (err) {
    next(err);
  }
};

const getTimetable = async (req, res, next) => {
  try {
    const classes = storage.classes.find({ status: 'active' });
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    const timetable = {};
    days.forEach(day => {
      timetable[day] = classes
        .filter(c => c.dayOfWeek.toLowerCase() === day.toLowerCase())
        .sort((a, b) => a.startTime.localeCompare(b.startTime));
    });

    res.json({ success: true, data: timetable });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getClasses,
  getClassById,
  createClass,
  updateClass,
  deleteClass,
  getTimetable
};
