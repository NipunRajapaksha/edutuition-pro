const storage = require('../services/storage');

const getCalendarEvents = async (req, res, next) => {
  try {
    const { month, year } = req.query; // optional filter
    let events = storage.calendarEvents.find();

    // Also dynamically inject active homework deadlines and exams into calendar view
    const exams = storage.exams.find();
    exams.forEach(e => {
      const cls = storage.classes.findById(e.classId);
      if (!events.some(ev => ev.type === 'exam' && ev.date === e.date && ev.title.includes(e.name))) {
        events.push({
          _id: `exam-${e._id}`,
          title: `Exam: ${e.name}`,
          type: 'exam',
          date: e.date,
          startTime: '08:30',
          endTime: '10:30',
          classId: e.classId,
          className: cls ? cls.name : 'Class',
          color: '#EF4444',
          description: `${e.subject} (${e.totalMarks} Marks)`
        });
      }
    });

    const homework = storage.homework.find();
    homework.forEach(h => {
      const cls = storage.classes.findById(h.classId);
      if (!events.some(ev => ev.type === 'homework_deadline' && ev.date === h.deadline && ev.title.includes(h.title))) {
        events.push({
          _id: `hw-${h._id}`,
          title: `Due: ${h.title}`,
          type: 'homework_deadline',
          date: h.deadline,
          startTime: '23:59',
          endTime: '23:59',
          classId: h.classId,
          className: cls ? cls.name : 'Class',
          color: '#F59E0B',
          description: `Homework deadline for ${cls ? cls.name : 'Class'}`
        });
      }
    });

    if (month && year) {
      const prefix = `${year}-${String(month).padStart(2, '0')}`;
      events = events.filter(e => e.date && e.date.startsWith(prefix));
    }

    events.sort((a, b) => (a.date || '').localeCompare(b.date || ''));

    res.json({ success: true, count: events.length, data: events });
  } catch (err) {
    next(err);
  }
};

const createCalendarEvent = async (req, res, next) => {
  try {
    const { title, type = 'event', date, startTime = '', endTime = '', classId = null, color = '#3B82F6', description = '' } = req.body;

    if (!title || !date) {
      return res.status(400).json({ success: false, message: 'Title and date are required' });
    }

    const newEvent = storage.calendarEvents.create({
      title,
      type,
      date,
      startTime,
      endTime,
      classId,
      color,
      description
    });

    res.status(201).json({ success: true, message: 'Calendar event created', data: newEvent });
  } catch (err) {
    next(err);
  }
};

const deleteCalendarEvent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const removed = storage.calendarEvents.findByIdAndDelete(id);
    if (!removed) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }
    res.json({ success: true, message: 'Event removed' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getCalendarEvents,
  createCalendarEvent,
  deleteCalendarEvent
};
