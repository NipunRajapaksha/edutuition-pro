const storage = require('../services/storage');

const getAttendance = async (req, res, next) => {
  try {
    const { classId, date } = req.query;
    if (!classId || !date) {
      return res.status(400).json({ success: false, message: 'classId and date are required' });
    }

    const cls = storage.classes.findById(classId);
    if (!cls) {
      return res.status(404).json({ success: false, message: 'Class not found' });
    }

    // Get all students enrolled in this class
    const enrolledStudents = storage.students.find({ status: 'active' }).filter(s =>
      s.enrolledClasses && s.enrolledClasses.includes(classId)
    );

    // Get recorded attendance for this class and date
    const recordedAttendance = storage.attendance.find({ classId, date });
    const attendanceMap = new Map();
    recordedAttendance.forEach(a => attendanceMap.set(a.studentId, a));

    // Combine roster with attendance status
    const studentRoster = enrolledStudents.map(student => {
      const record = attendanceMap.get(student._id);
      return {
        studentId: student._id,
        code: student.studentId,
        fullName: student.fullName,
        photo: student.photo,
        phone: student.phone,
        status: record ? record.status : 'not_marked',
        markedVia: record ? record.markedVia : null,
        time: record ? record.time : null,
        notes: record ? record.notes : '',
        attendanceId: record ? record._id : null
      };
    });

    const presentCount = recordedAttendance.filter(a => a.status === 'present').length;
    const lateCount = recordedAttendance.filter(a => a.status === 'late').length;
    const absentCount = recordedAttendance.filter(a => a.status === 'absent').length;
    const excusedCount = recordedAttendance.filter(a => a.status === 'excused').length;
    const totalEnrolled = enrolledStudents.length;

    const rate = totalEnrolled > 0 ? Math.round(((presentCount + lateCount) / totalEnrolled) * 100) : 0;

    res.json({
      success: true,
      data: {
        class: { id: cls._id, name: cls.name, subject: cls.subject, grade: cls.grade },
        date,
        summary: {
          totalEnrolled,
          presentCount,
          lateCount,
          absentCount,
          excusedCount,
          rate
        },
        roster: studentRoster
      }
    });
  } catch (err) {
    next(err);
  }
};

const markSingle = async (req, res, next) => {
  try {
    const { classId, studentId, date, status, notes = '', markedVia = 'manual' } = req.body;

    if (!classId || !studentId || !date || !status) {
      return res.status(400).json({ success: false, message: 'classId, studentId, date, and status are required' });
    }

    const existing = storage.attendance.findOne({ classId, studentId, date });
    let record;

    if (existing) {
      record = storage.attendance.findByIdAndUpdate(existing._id, {
        status,
        notes,
        markedVia,
        time: new Date().toLocaleTimeString()
      });
    } else {
      record = storage.attendance.create({
        classId,
        studentId,
        date,
        status,
        notes,
        markedVia,
        time: new Date().toLocaleTimeString()
      });
    }

    // Check attendance threshold for notifications if absent
    if (status === 'absent') {
      const student = storage.students.findById(studentId);
      const studentUser = storage.users.findOne({ studentProfileId: studentId });
      const parentUser = storage.users.findOne({ linkedStudentId: studentId });

      if (studentUser) {
        storage.notifications.create({
          userId: studentUser._id,
          title: 'Class Attendance Notice',
          message: `You were marked absent for today's class (${date}).`,
          type: 'attendance'
        });
      }
      if (parentUser) {
        storage.notifications.create({
          userId: parentUser._id,
          title: 'Absence Alert',
          message: `Your child ${student ? student.fullName : ''} was absent on ${date}.`,
          type: 'attendance'
        });
      }
    }

    res.json({ success: true, message: 'Attendance updated', data: record });
  } catch (err) {
    next(err);
  }
};

const markAllPresent = async (req, res, next) => {
  try {
    const { classId, date } = req.body;
    if (!classId || !date) {
      return res.status(400).json({ success: false, message: 'classId and date are required' });
    }

    const enrolledStudents = storage.students.find({ status: 'active' }).filter(s =>
      s.enrolledClasses && s.enrolledClasses.includes(classId)
    );

    const currentTime = new Date().toLocaleTimeString();

    enrolledStudents.forEach(student => {
      const existing = storage.attendance.findOne({ classId, studentId: student._id, date });
      if (existing) {
        storage.attendance.findByIdAndUpdate(existing._id, {
          status: 'present',
          time: currentTime,
          markedVia: 'manual'
        });
      } else {
        storage.attendance.create({
          classId,
          studentId: student._id,
          date,
          status: 'present',
          time: currentTime,
          markedVia: 'manual'
        });
      }
    });

    res.json({
      success: true,
      message: `Marked all ${enrolledStudents.length} students as Present for ${date}`
    });
  } catch (err) {
    next(err);
  }
};

const scanQrAttendance = async (req, res, next) => {
  try {
    const { qrData, studentId: overrideStudentId } = req.body;
    // qrData can be a JSON string generated by the teacher's screen:
    // { type: 'CLASS_ATTENDANCE_SESSION', classId: '...', date: '...', secret: '...' }

    let parsed = {};
    try {
      parsed = typeof qrData === 'string' ? JSON.parse(qrData) : qrData;
    } catch {
      return res.status(400).json({ success: false, message: 'Invalid QR code format' });
    }

    const classId = parsed.classId;
    const date = parsed.date || new Date().toISOString().split('T')[0];

    // Determine student: from logged-in student, or override from teacher scan
    let studentId = null;
    if (req.user && req.user.studentProfileId) {
      studentId = req.user.studentProfileId;
    } else if (overrideStudentId) {
      studentId = overrideStudentId;
    } else if (parsed.studentId) {
      studentId = parsed.studentId;
    }

    if (!studentId || !classId) {
      return res.status(400).json({ success: false, message: 'Student ID and Class ID are required' });
    }

    const student = storage.students.findById(studentId);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    // Verify enrollment
    if (!student.enrolledClasses || !student.enrolledClasses.includes(classId)) {
      return res.status(403).json({ success: false, message: 'Student is not enrolled in this class' });
    }

    // Check duplicate
    const existing = storage.attendance.findOne({ classId, studentId, date });
    if (existing && existing.status === 'present') {
      return res.json({
        success: true,
        alreadyMarked: true,
        message: 'Attendance was already marked present today.',
        data: existing
      });
    }

    const record = existing
      ? storage.attendance.findByIdAndUpdate(existing._id, {
          status: 'present',
          markedVia: 'qr',
          time: new Date().toLocaleTimeString()
        })
      : storage.attendance.create({
          classId,
          studentId,
          date,
          status: 'present',
          markedVia: 'qr',
          time: new Date().toLocaleTimeString()
        });

    res.json({
      success: true,
      message: `Attendance marked successfully for ${student.fullName}!`,
      data: record
    });
  } catch (err) {
    next(err);
  }
};

const getStudentAttendanceHistory = async (req, res, next) => {
  try {
    const { studentId } = req.params;
    const history = storage.attendance.find({ studentId }).sort((a, b) => b.date.localeCompare(a.date));

    const enriched = history.map(item => {
      const cls = storage.classes.findById(item.classId);
      return {
        ...item,
        className: cls ? cls.name : 'Class',
        subject: cls ? cls.subject : ''
      };
    });

    const total = enriched.length;
    const present = enriched.filter(e => e.status === 'present' || e.status === 'late').length;
    const percentage = total > 0 ? Math.round((present / total) * 100) : 100;

    res.json({
      success: true,
      data: {
        percentage,
        totalClasses: total,
        present,
        absent: enriched.filter(e => e.status === 'absent').length,
        history: enriched
      }
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAttendance,
  markSingle,
  markAllPresent,
  scanQrAttendance,
  getStudentAttendanceHistory
};
