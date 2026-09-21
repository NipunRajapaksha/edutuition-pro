const storage = require('../services/storage');

const calculateGrade = (percentage) => {
  if (percentage >= 75) return 'A';
  if (percentage >= 65) return 'B';
  if (percentage >= 50) return 'C';
  if (percentage >= 35) return 'S';
  return 'F';
};

const getExams = async (req, res, next) => {
  try {
    const { classId } = req.query;
    let exams = storage.exams.find();

    if (classId) {
      exams = exams.filter(e => e.classId === classId);
    }

    const enriched = exams.map(exam => {
      const cls = storage.classes.findById(exam.classId);
      const marks = storage.marks.find({ examId: exam._id });

      const marksList = marks.map(m => m.marksObtained);
      const highest = marksList.length > 0 ? Math.max(...marksList) : 0;
      const lowest = marksList.length > 0 ? Math.min(...marksList) : 0;
      const average = marksList.length > 0
        ? Math.round(marksList.reduce((a, b) => a + b, 0) / marksList.length)
        : 0;

      return {
        ...exam,
        className: cls ? cls.name : 'Class',
        gradedCount: marks.length,
        highestMark: highest,
        lowestMark: lowest,
        classAverage: average
      };
    });

    enriched.sort((a, b) => b.date.localeCompare(a.date));

    res.json({ success: true, count: enriched.length, data: enriched });
  } catch (err) {
    next(err);
  }
};

const createExam = async (req, res, next) => {
  try {
    const {
      name,
      type = 'monthly_test',
      classId,
      subject = '',
      date,
      totalMarks = 100,
      notes = ''
    } = req.body;

    if (!name || !classId || !date) {
      return res.status(400).json({ success: false, message: 'Name, classId, and date are required' });
    }

    const cls = storage.classes.findById(classId);

    const exam = storage.exams.create({
      name,
      type,
      classId,
      subject: subject || (cls ? cls.subject : 'Subject'),
      date,
      totalMarks: Number(totalMarks),
      status: 'scheduled',
      notes
    });

    // Calendar entry
    storage.calendarEvents.create({
      title: `Exam: ${name}`,
      type: 'exam',
      date,
      classId,
      color: '#EF4444',
      description: `Exam for ${cls ? cls.name : 'class'} - ${totalMarks} Marks`
    });

    // Notification to enrolled students
    const enrolledStudents = storage.students.find({ status: 'active' }).filter(s =>
      s.enrolledClasses && s.enrolledClasses.includes(classId)
    );

    enrolledStudents.forEach(st => {
      const studentUser = storage.users.findOne({ studentProfileId: st._id });
      if (studentUser) {
        storage.notifications.create({
          userId: studentUser._id,
          title: 'Upcoming Examination Scheduled',
          message: `${name} scheduled for ${date}. Total Marks: ${totalMarks}.`,
          type: 'exam'
        });
      }
    });

    res.status(201).json({ success: true, message: 'Exam created successfully', data: exam });
  } catch (err) {
    next(err);
  }
};

const enterMarksBulk = async (req, res, next) => {
  try {
    const { examId } = req.params;
    const { marks } = req.body; // array of { studentId, marksObtained, remarks }

    if (!examId || !Array.isArray(marks)) {
      return res.status(400).json({ success: false, message: 'examId and marks array required' });
    }

    const exam = storage.exams.findById(examId);
    if (!exam) {
      return res.status(404).json({ success: false, message: 'Exam not found' });
    }

    const totalMarks = exam.totalMarks || 100;

    // First, process each mark and compute percentage
    const processed = marks.map(item => {
      const obtained = Math.min(totalMarks, Math.max(0, Number(item.marksObtained)));
      const percentage = Math.round((obtained / totalMarks) * 100);
      const grade = calculateGrade(percentage);

      return {
        studentId: item.studentId,
        marksObtained: obtained,
        percentage,
        grade,
        remarks: item.remarks || ''
      };
    });

    // Sort descending by marks to calculate rank
    processed.sort((a, b) => b.marksObtained - a.marksObtained);

    let currentRank = 1;
    processed.forEach((item, index) => {
      if (index > 0 && item.marksObtained < processed[index - 1].marksObtained) {
        currentRank = index + 1;
      }
      item.rank = currentRank;
    });

    // Save or update each mark in storage
    processed.forEach(item => {
      const existing = storage.marks.findOne({ examId, studentId: item.studentId });
      if (existing) {
        storage.marks.findByIdAndUpdate(existing._id, {
          marksObtained: item.marksObtained,
          percentage: item.percentage,
          grade: item.grade,
          rank: item.rank,
          remarks: item.remarks
        });
      } else {
        storage.marks.create({
          examId,
          studentId: item.studentId,
          marksObtained: item.marksObtained,
          percentage: item.percentage,
          grade: item.grade,
          rank: item.rank,
          remarks: item.remarks
        });
      }

      // Notify student & parent
      const studentUser = storage.users.findOne({ studentProfileId: item.studentId });
      const parentUser = storage.users.findOne({ linkedStudentId: item.studentId });
      const student = storage.students.findById(item.studentId);

      if (studentUser) {
        storage.notifications.create({
          userId: studentUser._id,
          title: 'Exam Results Published',
          message: `${exam.name}: You scored ${item.marksObtained}/${totalMarks} (${item.percentage}%, Grade ${item.grade}, Rank ${item.rank}).`,
          type: 'exam'
        });
      }
      if (parentUser) {
        storage.notifications.create({
          userId: parentUser._id,
          title: 'Exam Results for ' + (student ? student.fullName : 'Child'),
          message: `${exam.name}: Marks ${item.marksObtained}/${totalMarks} (${item.percentage}%, Grade ${item.grade}).`,
          type: 'exam'
        });
      }
    });

    storage.exams.findByIdAndUpdate(examId, { status: 'graded' });

    res.json({ success: true, message: 'Marks recorded and ranks calculated successfully' });
  } catch (err) {
    next(err);
  }
};

const getExamMarks = async (req, res, next) => {
  try {
    const { examId } = req.params;
    const exam = storage.exams.findById(examId);
    if (!exam) {
      return res.status(404).json({ success: false, message: 'Exam not found' });
    }

    const enrolledStudents = storage.students.find({ status: 'active' }).filter(s =>
      s.enrolledClasses && s.enrolledClasses.includes(exam.classId)
    );

    const recordedMarks = storage.marks.find({ examId });
    const marksMap = new Map();
    recordedMarks.forEach(m => marksMap.set(m.studentId, m));

    const roster = enrolledStudents.map(student => {
      const record = marksMap.get(student._id);
      return {
        studentId: student._id,
        code: student.studentId,
        fullName: student.fullName,
        photo: student.photo,
        marksObtained: record ? record.marksObtained : null,
        percentage: record ? record.percentage : null,
        grade: record ? record.grade : null,
        rank: record ? record.rank : null,
        remarks: record ? record.remarks : ''
      };
    });

    const values = recordedMarks.map(m => m.marksObtained);
    const summary = {
      totalCandidates: enrolledStudents.length,
      gradedCount: recordedMarks.length,
      highestMark: values.length > 0 ? Math.max(...values) : 0,
      lowestMark: values.length > 0 ? Math.min(...values) : 0,
      classAverage: values.length > 0 ? Math.round(values.reduce((a, b) => a + b, 0) / values.length) : 0
    };

    res.json({ success: true, exam, summary, data: roster });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getExams,
  createExam,
  enterMarksBulk,
  getExamMarks
};
