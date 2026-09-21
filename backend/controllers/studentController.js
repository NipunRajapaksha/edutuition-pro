const storage = require('../services/storage');
const bcrypt = require('bcryptjs');

const generateNextStudentId = () => {
  const currentYear = new Date().getFullYear();
  const students = storage.students.find();
  const yearPrefix = `STU-${currentYear}-`;
  
  let maxSeq = 0;
  students.forEach(s => {
    if (s.studentId && s.studentId.startsWith(yearPrefix)) {
      const seqStr = s.studentId.replace(yearPrefix, '');
      const seq = parseInt(seqStr, 10);
      if (!isNaN(seq) && seq > maxSeq) {
        maxSeq = seq;
      }
    }
  });

  const nextSeq = String(maxSeq + 1).padStart(3, '0');
  return `${yearPrefix}${nextSeq}`;
};

const getStudents = async (req, res, next) => {
  try {
    const { q, grade, status, classId } = req.query;
    let students = storage.students.find();

    if (q) {
      const query = q.toLowerCase();
      students = students.filter(s =>
        (s.fullName && s.fullName.toLowerCase().includes(query)) ||
        (s.studentId && s.studentId.toLowerCase().includes(query)) ||
        (s.phone && s.phone.includes(query)) ||
        (s.school && s.school.toLowerCase().includes(query))
      );
    }

    if (grade) {
      students = students.filter(s => s.grade === grade);
    }

    if (status) {
      students = students.filter(s => s.status === status);
    }

    if (classId) {
      students = students.filter(s => s.enrolledClasses && s.enrolledClasses.includes(classId));
    }

    // Enrich with class names and quick attendance stats
    const enriched = students.map(s => {
      const classes = (s.enrolledClasses || [])
        .map(cId => storage.classes.findById(cId))
        .filter(Boolean)
        .map(c => ({ id: c._id, name: c.name, subject: c.subject }));

      const attendances = storage.attendance.find({ studentId: s._id });
      const totalAtt = attendances.length;
      const presentCount = attendances.filter(a => a.status === 'present' || a.status === 'late').length;
      const attendanceRate = totalAtt > 0 ? Math.round((presentCount / totalAtt) * 100) : 100;

      return {
        ...s,
        classes,
        attendanceRate
      };
    });

    res.json({ success: true, count: enriched.length, data: enriched });
  } catch (err) {
    next(err);
  }
};

const getStudentById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const student = storage.students.findById(id);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    // Classes enrolled
    const classes = (student.enrolledClasses || [])
      .map(cId => storage.classes.findById(cId))
      .filter(Boolean);

    // Attendance stats
    const attendances = storage.attendance.find({ studentId: student._id });
    const totalDays = attendances.length;
    const present = attendances.filter(a => a.status === 'present').length;
    const late = attendances.filter(a => a.status === 'late').length;
    const absent = attendances.filter(a => a.status === 'absent').length;
    const excused = attendances.filter(a => a.status === 'excused').length;
    const attendancePercentage = totalDays > 0 ? Math.round(((present + late) / totalDays) * 100) : 100;

    // Fees summary
    const fees = storage.fees.find({ studentId: student._id });
    const totalFeeDue = fees.reduce((sum, f) => sum + (f.amountDue || 0), 0);
    const totalFeePaid = fees.reduce((sum, f) => sum + (f.amountPaid || 0), 0);
    const pendingBalance = totalFeeDue - totalFeePaid;

    // Exam marks
    const marks = storage.marks.find({ studentId: student._id });
    const enrichedMarks = marks.map(m => {
      const exam = storage.exams.findById(m.examId);
      return {
        ...m,
        examName: exam ? exam.name : 'Exam',
        subject: exam ? exam.subject : '',
        date: exam ? exam.date : '',
        totalMarks: exam ? exam.totalMarks : 100
      };
    });

    // Recent Homework
    const submissions = storage.homeworkSubmissions.find({ studentId: student._id });

    res.json({
      success: true,
      data: {
        ...student,
        classes,
        stats: {
          attendancePercentage,
          totalDays,
          present,
          late,
          absent,
          excused,
          totalFeeDue,
          totalFeePaid,
          pendingBalance,
          examsCount: marks.length,
          homeworkSubmissionsCount: submissions.length
        },
        recentAttendance: attendances.slice(-10).reverse(),
        recentMarks: enrichedMarks.slice(-10).reverse(),
        recentFees: fees.slice(-10).reverse()
      }
    });
  } catch (err) {
    next(err);
  }
};

const createStudent = async (req, res, next) => {
  try {
    const {
      fullName,
      photo,
      dob,
      gender = 'male',
      phone,
      email,
      address,
      parentName,
      parentPhone,
      school,
      grade,
      enrolledClasses = [],
      notes = '',
      createPortalAccount = true
    } = req.body;

    if (!fullName || !grade) {
      return res.status(400).json({ success: false, message: 'Full name and grade are required' });
    }

    const studentId = generateNextStudentId();

    const student = storage.students.create({
      studentId,
      fullName,
      photo: photo || `https://api.dicebear.com/7.x/bottts/png?seed=${encodeURIComponent(studentId)}`,
      dob: dob || '2009-05-15',
      gender,
      phone: phone || '',
      email: email || '',
      address: address || '',
      parentName: parentName || '',
      parentPhone: parentPhone || '',
      school: school || '',
      grade,
      enrolledClasses: Array.isArray(enrolledClasses) ? enrolledClasses : [],
      status: 'active',
      notes
    });

    // Create student login account if portal account is enabled
    if (createPortalAccount) {
      const loginEmail = email ? email.toLowerCase().trim() : `${studentId.toLowerCase()}@tuition.lk`;
      const defaultPassword = await bcrypt.hash('password123', 10);

      storage.users.create({
        name: fullName,
        email: loginEmail,
        password: defaultPassword,
        role: 'student',
        phone,
        studentProfileId: student._id
      });

      // Optionally create parent account
      if (parentPhone || parentName) {
        const parentEmail = `parent.${studentId.toLowerCase()}@tuition.lk`;
        storage.users.create({
          name: parentName || `Parent of ${fullName}`,
          email: parentEmail,
          password: defaultPassword,
          role: 'parent',
          phone: parentPhone,
          linkedStudentId: student._id
        });
      }
    }

    res.status(201).json({ success: true, message: 'Student created successfully', data: student });
  } catch (err) {
    next(err);
  }
};

const updateStudent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updated = storage.students.findByIdAndUpdate(id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }
    res.json({ success: true, message: 'Student updated successfully', data: updated });
  } catch (err) {
    next(err);
  }
};

const deleteStudent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const removed = storage.students.findByIdAndDelete(id);
    if (!removed) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }
    res.json({ success: true, message: 'Student removed successfully' });
  } catch (err) {
    next(err);
  }
};

const getStudentQrData = async (req, res, next) => {
  try {
    const { id } = req.params;
    const student = storage.students.findById(id);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    const payload = {
      type: 'TUITION_STUDENT_ID',
      studentId: student.studentId,
      id: student._id,
      name: student.fullName,
      grade: student.grade,
      school: student.school,
      issuedAt: new Date().toISOString()
    };

    res.json({ success: true, qrPayload: JSON.stringify(payload), student });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
  getStudentQrData
};
