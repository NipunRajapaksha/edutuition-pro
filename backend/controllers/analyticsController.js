const storage = require('../services/storage');

const getTeacherDashboardStats = async (req, res, next) => {
  try {
    const todayStr = new Date().toISOString().split('T')[0];
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const currentDay = days[new Date().getDay()];

    const students = storage.students.find().filter(s => !s.status || s.status === 'active');
    const classes = storage.classes.find().filter(c => !c.status || c.status === 'active');
    const todayClasses = classes.filter(c => c.dayOfWeek.toLowerCase() === currentDay.toLowerCase());

    // Today's attendance
    const todayAttendance = storage.attendance.find({ date: todayStr });
    const presentToday = todayAttendance.filter(a => a.status === 'present' || a.status === 'late').length;

    // Fees
    const currentYear = new Date().getFullYear();
    const fees = storage.fees.find({ year: currentYear });
    const pendingFees = fees.reduce((sum, f) => sum + (f.balance || 0), 0);
    const totalCollected = fees.reduce((sum, f) => sum + (f.amountPaid || 0), 0);

    // Homework pending review
    const submissions = storage.homeworkSubmissions.find();
    const homeworkPending = submissions.filter(s => s.status === 'submitted' || s.status === 'late').length;

    // Upcoming exams
    const exams = storage.exams.find().filter(e => e.date >= todayStr).sort((a, b) => a.date.localeCompare(b.date));

    // Recent payments (last 5)
    const recentPayments = fees
      .filter(f => f.amountPaid > 0)
      .sort((a, b) => b.paymentDate.localeCompare(a.paymentDate))
      .slice(0, 5)
      .map(f => {
        const student = storage.students.findById(f.studentId);
        const cls = storage.classes.findById(f.classId);
        return {
          id: f._id,
          receiptNumber: f.receiptNumber,
          studentName: student ? student.fullName : 'Student',
          className: cls ? cls.name : 'Class',
          amount: f.amountPaid,
          date: f.paymentDate,
          method: f.paymentMethod
        };
      });

    // Recent announcements (last 4)
    const recentAnnouncements = storage.announcements
      .find()
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, 4);

    // Attendance breakdown for last 7 days
    const attendanceTrends = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const ds = d.toISOString().split('T')[0];
      const dayRecords = storage.attendance.find({ date: ds });
      const pres = dayRecords.filter(r => r.status === 'present' || r.status === 'late').length;
      const abs = dayRecords.filter(r => r.status === 'absent').length;
      attendanceTrends.push({
        date: ds.slice(5), // MM-DD
        present: pres,
        absent: abs
      });
    }

    res.json({
      success: true,
      data: {
        metrics: {
          totalStudents: students.length,
          activeClasses: classes.length,
          todayClassesCount: todayClasses.length,
          presentToday,
          pendingFees,
          totalCollected,
          homeworkPending,
          upcomingExamsCount: exams.length
        },
        todayClasses: todayClasses.map(c => ({
          id: c._id,
          name: c.name,
          subject: c.subject,
          grade: c.grade,
          time: `${c.startTime} - ${c.endTime}`,
          location: c.location
        })),
        upcomingExams: exams.slice(0, 3).map(e => ({
          id: e._id,
          name: e.name,
          subject: e.subject,
          date: e.date,
          totalMarks: e.totalMarks
        })),
        recentPayments,
        recentAnnouncements,
        attendanceTrends
      }
    });
  } catch (err) {
    next(err);
  }
};

const getStudentPerformance = async (req, res, next) => {
  try {
    const studentId = req.params.studentId || (req.user && req.user.studentProfileId);
    if (!studentId) {
      return res.status(400).json({ success: false, message: 'studentId required' });
    }

    const student = storage.students.findById(studentId);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    // 1. Attendance percentage
    const attendances = storage.attendance.find({ studentId });
    const totalAtt = attendances.length;
    const presentAtt = attendances.filter(a => a.status === 'present' || a.status === 'late').length;
    const attendanceRate = totalAtt > 0 ? Math.round((presentAtt / totalAtt) * 100) : 100;

    // 2. Homework completion rate
    const enrolledClasses = student.enrolledClasses || [];
    const classHomework = storage.homework.find().filter(h => enrolledClasses.includes(h.classId));
    const submissions = storage.homeworkSubmissions.find({ studentId });
    const hwRate = classHomework.length > 0
      ? Math.round((submissions.length / classHomework.length) * 100)
      : 100;

    // 3. Exam marks over time
    const marks = storage.marks.find({ studentId });
    const enrichedMarks = marks.map(m => {
      const exam = storage.exams.findById(m.examId);
      return {
        examId: m.examId,
        examName: exam ? exam.name : 'Exam',
        subject: exam ? exam.subject : 'Subject',
        date: exam ? exam.date : '',
        marksObtained: m.marksObtained,
        totalMarks: exam ? exam.totalMarks : 100,
        percentage: m.percentage,
        grade: m.grade,
        rank: m.rank
      };
    }).sort((a, b) => a.date.localeCompare(b.date));

    // Average mark
    const averageMark = enrichedMarks.length > 0
      ? Math.round(enrichedMarks.reduce((acc, m) => acc + m.percentage, 0) / enrichedMarks.length)
      : 0;

    // Latest rank
    const latestRank = enrichedMarks.length > 0 ? enrichedMarks[enrichedMarks.length - 1].rank : 1;

    // Fee status
    const fees = storage.fees.find({ studentId });
    const totalFeeDue = fees.reduce((sum, f) => sum + (f.amountDue || 0), 0);
    const totalFeePaid = fees.reduce((sum, f) => sum + (f.amountPaid || 0), 0);
    const feeStatus = totalFeePaid >= totalFeeDue ? 'Fully Paid' : (totalFeePaid > 0 ? 'Partially Paid' : 'Overdue/Pending');

    // Strengths and weak areas analysis
    const subjectAverages = {};
    enrichedMarks.forEach(m => {
      if (!subjectAverages[m.subject]) subjectAverages[m.subject] = [];
      subjectAverages[m.subject].push(m.percentage);
    });

    const strengths = [];
    const weakAreas = [];

    Object.entries(subjectAverages).forEach(([subj, scores]) => {
      const avg = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
      if (avg >= 70) {
        strengths.push({ subject: subj, score: avg, label: `Consistently strong performance (${avg}%)` });
      } else if (avg < 55) {
        weakAreas.push({ subject: subj, score: avg, label: `Needs focused practice & revision (${avg}%)` });
      }
    });

    if (strengths.length === 0) {
      strengths.push({ subject: 'General Academic', score: averageMark, label: 'Steady regular efforts' });
    }
    if (weakAreas.length === 0 && averageMark >= 75) {
      weakAreas.push({ subject: 'Advanced Mastery', score: 90, label: 'Challenge with olympiad/model questions' });
    }

    res.json({
      success: true,
      data: {
        student: {
          id: student._id,
          studentId: student.studentId,
          fullName: student.fullName,
          grade: student.grade,
          photo: student.photo
        },
        metrics: {
          attendanceRate,
          hwCompletionRate: hwRate,
          averageMark,
          latestRank,
          feeStatus,
          pendingFeeBalance: totalFeeDue - totalFeePaid,
          examsTaken: enrichedMarks.length
        },
        examProgression: enrichedMarks,
        strengths,
        weakAreas
      }
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getTeacherDashboardStats,
  getStudentPerformance
};
