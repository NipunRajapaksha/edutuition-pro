const storage = require('../services/storage');

const getHomework = async (req, res, next) => {
  try {
    const { classId } = req.query;
    let homeworkList = storage.homework.find();

    if (classId) {
      homeworkList = homeworkList.filter(h => h.classId === classId);
    }

    const allStudents = storage.students.find({ status: 'active' });

    const enriched = homeworkList.map(hw => {
      const cls = storage.classes.findById(hw.classId);
      const enrolledInClass = allStudents.filter(s =>
        s.enrolledClasses && s.enrolledClasses.includes(hw.classId)
      ).length;

      const submissions = storage.homeworkSubmissions.find({ homeworkId: hw._id });
      const reviewed = submissions.filter(s => s.status === 'reviewed').length;

      return {
        ...hw,
        className: cls ? cls.name : 'Class',
        subject: cls ? cls.subject : hw.subject,
        totalAssigned: enrolledInClass,
        submittedCount: submissions.length,
        reviewedCount: reviewed,
        isOverdue: new Date(hw.deadline) < new Date()
      };
    });

    enriched.sort((a, b) => b.createdAt.localeCompare(a.createdAt));

    res.json({ success: true, count: enriched.length, data: enriched });
  } catch (err) {
    next(err);
  }
};

const getStudentHomework = async (req, res, next) => {
  try {
    const studentId = req.params.studentId || (req.user && req.user.studentProfileId);
    if (!studentId) {
      return res.status(400).json({ success: false, message: 'Student ID required' });
    }

    const student = storage.students.findById(studentId);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    const enrolledClasses = student.enrolledClasses || [];
    const allHw = storage.homework.find().filter(h => enrolledClasses.includes(h.classId));

    const result = allHw.map(hw => {
      const cls = storage.classes.findById(hw.classId);
      const submission = storage.homeworkSubmissions.findOne({ homeworkId: hw._id, studentId });

      let status = 'not_started';
      if (submission) {
        status = submission.status;
      } else if (new Date(hw.deadline) < new Date()) {
        status = 'overdue';
      }

      return {
        ...hw,
        className: cls ? cls.name : 'Class',
        submissionStatus: status,
        submission: submission || null
      };
    });

    result.sort((a, b) => b.deadline.localeCompare(a.deadline));

    res.json({ success: true, count: result.length, data: result });
  } catch (err) {
    next(err);
  }
};

const createHomework = async (req, res, next) => {
  try {
    const {
      classId,
      title,
      description = '',
      subject = '',
      attachments = [],
      deadline,
      totalMarks = 100
    } = req.body;

    if (!classId || !title || !deadline) {
      return res.status(400).json({ success: false, message: 'Class ID, title, and deadline are required' });
    }

    const cls = storage.classes.findById(classId);

    const homework = storage.homework.create({
      classId,
      title,
      description,
      subject: subject || (cls ? cls.subject : 'Subject'),
      attachments,
      deadline,
      totalMarks: Number(totalMarks),
      teacherName: cls ? cls.teacherName : 'Teacher'
    });

    // Calendar entry for homework deadline
    storage.calendarEvents.create({
      title: `Due: ${title}`,
      type: 'homework_deadline',
      date: deadline,
      classId,
      color: '#F59E0B',
      description: `Homework deadline for ${cls ? cls.name : 'class'}`
    });

    // Notify enrolled students
    const enrolledStudents = storage.students.find({ status: 'active' }).filter(s =>
      s.enrolledClasses && s.enrolledClasses.includes(classId)
    );

    enrolledStudents.forEach(st => {
      const studentUser = storage.users.findOne({ studentProfileId: st._id });
      if (studentUser) {
        storage.notifications.create({
          userId: studentUser._id,
          title: 'New Homework Assigned',
          message: `${title} is assigned. Due on ${deadline}.`,
          type: 'homework'
        });
      }
    });

    res.status(201).json({ success: true, message: 'Homework created successfully', data: homework });
  } catch (err) {
    next(err);
  }
};

const submitHomework = async (req, res, next) => {
  try {
    const { homeworkId, studentId, content = '', attachments = [] } = req.body;

    const sId = studentId || (req.user && req.user.studentProfileId);
    if (!homeworkId || !sId) {
      return res.status(400).json({ success: false, message: 'homeworkId and studentId are required' });
    }

    const hw = storage.homework.findById(homeworkId);
    if (!hw) {
      return res.status(404).json({ success: false, message: 'Homework assignment not found' });
    }

    const isLate = new Date() > new Date(hw.deadline);
    const status = isLate ? 'late' : 'submitted';

    const existing = storage.homeworkSubmissions.findOne({ homeworkId, studentId: sId });
    let submission;

    if (existing) {
      submission = storage.homeworkSubmissions.findByIdAndUpdate(existing._id, {
        content,
        attachments,
        status,
        submissionDate: new Date().toISOString()
      });
    } else {
      submission = storage.homeworkSubmissions.create({
        homeworkId,
        studentId: sId,
        content,
        attachments,
        status,
        submissionDate: new Date().toISOString()
      });
    }

    // Notify teacher
    const student = storage.students.findById(sId);
    const teacherUsers = storage.users.find({ role: 'teacher' });
    teacherUsers.forEach(t => {
      storage.notifications.create({
        userId: t._id,
        title: 'Homework Submitted',
        message: `${student ? student.fullName : 'A student'} submitted: ${hw.title}`,
        type: 'homework'
      });
    });

    res.json({ success: true, message: 'Homework submitted successfully', data: submission });
  } catch (err) {
    next(err);
  }
};

const reviewSubmission = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { marksObtained, feedback = '' } = req.body;

    if (marksObtained === undefined) {
      return res.status(400).json({ success: false, message: 'Marks obtained is required' });
    }

    const updated = storage.homeworkSubmissions.findByIdAndUpdate(id, {
      marksObtained: Number(marksObtained),
      feedback,
      status: 'reviewed',
      reviewedAt: new Date().toISOString()
    });

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Submission not found' });
    }

    // Notify student
    const studentUser = storage.users.findOne({ studentProfileId: updated.studentId });
    if (studentUser) {
      const hw = storage.homework.findById(updated.homeworkId);
      storage.notifications.create({
        userId: studentUser._id,
        title: 'Homework Reviewed',
        message: `Your submission for "${hw ? hw.title : 'homework'}" received ${marksObtained} marks.`,
        type: 'homework'
      });
    }

    res.json({ success: true, message: 'Submission reviewed', data: updated });
  } catch (err) {
    next(err);
  }
};

const getHomeworkSubmissions = async (req, res, next) => {
  try {
    const { homeworkId } = req.params;
    const hw = storage.homework.findById(homeworkId);
    if (!hw) {
      return res.status(404).json({ success: false, message: 'Homework not found' });
    }

    const enrolledStudents = storage.students.find({ status: 'active' }).filter(s =>
      s.enrolledClasses && s.enrolledClasses.includes(hw.classId)
    );

    const submissions = storage.homeworkSubmissions.find({ homeworkId });
    const subMap = new Map();
    submissions.forEach(s => subMap.set(s.studentId, s));

    const roster = enrolledStudents.map(student => {
      const sub = subMap.get(student._id);
      return {
        studentId: student._id,
        studentCode: student.studentId,
        fullName: student.fullName,
        photo: student.photo,
        submitted: !!sub,
        submissionId: sub ? sub._id : null,
        status: sub ? sub.status : (new Date(hw.deadline) < new Date() ? 'missing' : 'not_started'),
        submissionDate: sub ? sub.submissionDate : null,
        content: sub ? sub.content : '',
        attachments: sub ? sub.attachments : [],
        marksObtained: sub ? sub.marksObtained : null,
        feedback: sub ? sub.feedback : ''
      };
    });

    res.json({ success: true, homework: hw, data: roster });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getHomework,
  getStudentHomework,
  createHomework,
  submitHomework,
  reviewSubmission,
  getHomeworkSubmissions
};
