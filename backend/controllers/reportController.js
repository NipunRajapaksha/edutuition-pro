const storage = require('../services/storage');

/**
 * Helper to convert array of objects to CSV
 */
const toCsv = (headers, rows) => {
  const headerLine = headers.map(h => `"${h}"`).join(',');
  const rowLines = rows.map(row =>
    row.map(val => `"${String(val ?? '').replace(/"/g, '""')}"`).join(',')
  );
  return [headerLine, ...rowLines].join('\n');
};

const getStudentReport = async (req, res, next) => {
  try {
    const { studentId } = req.params;
    const { format = 'json' } = req.query;

    const student = storage.students.findById(studentId);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    const attendances = storage.attendance.find({ studentId });
    const fees = storage.fees.find({ studentId });
    const marks = storage.marks.find({ studentId });
    const submissions = storage.homeworkSubmissions.find({ studentId });
    const classes = (student.enrolledClasses || []).map(id => storage.classes.findById(id)).filter(Boolean);

    const enrichedMarks = marks.map(m => {
      const exam = storage.exams.findById(m.examId);
      return {
        examName: exam ? exam.name : 'Exam',
        subject: exam ? exam.subject : '',
        date: exam ? exam.date : '',
        marksObtained: m.marksObtained,
        totalMarks: exam ? exam.totalMarks : 100,
        percentage: m.percentage,
        grade: m.grade,
        rank: m.rank
      };
    });

    const totalAtt = attendances.length;
    const presentAtt = attendances.filter(a => a.status === 'present' || a.status === 'late').length;
    const attendancePercentage = totalAtt > 0 ? Math.round((presentAtt / totalAtt) * 100) : 100;

    const totalDue = fees.reduce((sum, f) => sum + (f.amountDue || 0), 0);
    const totalPaid = fees.reduce((sum, f) => sum + (f.amountPaid || 0), 0);
    const feeBalance = totalDue - totalPaid;

    if (format === 'csv') {
      const headers = ['Metric / Subject', 'Score / Value', 'Status / Grade', 'Date / Details'];
      const rows = [
        ['Student ID', student.studentId, '', ''],
        ['Full Name', student.fullName, '', ''],
        ['Grade & School', `${student.grade} - ${student.school}`, '', ''],
        ['Attendance Rate', `${attendancePercentage}%`, `${presentAtt}/${totalAtt} Days`, ''],
        ['Fee Collection', `Rs. ${totalPaid.toLocaleString()}`, `Due: Rs. ${totalDue.toLocaleString()}`, `Balance: Rs. ${feeBalance.toLocaleString()}`],
        ...enrichedMarks.map(m => [m.subject, `${m.marksObtained}/${m.totalMarks} (${m.percentage}%)`, `Grade: ${m.grade}, Rank: ${m.rank}`, m.date])
      ];
      const csv = toCsv(headers, rows);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="student-report-${student.studentId}.csv"`);
      return res.send(csv);
    }

    res.json({
      success: true,
      report: {
        institute: storage.getSettings().instituteName,
        generatedAt: new Date().toISOString(),
        student,
        classes,
        summary: {
          attendancePercentage,
          totalDue,
          totalPaid,
          feeBalance,
          averageExamMark: enrichedMarks.length > 0 ? Math.round(enrichedMarks.reduce((a, b) => a + b.percentage, 0) / enrichedMarks.length) : 0
        },
        attendance: attendances,
        fees,
        exams: enrichedMarks,
        homework: submissions
      }
    });
  } catch (err) {
    next(err);
  }
};

const getClassReport = async (req, res, next) => {
  try {
    const { classId } = req.params;
    const { format = 'json' } = req.query;

    const cls = storage.classes.findById(classId);
    if (!cls) {
      return res.status(404).json({ success: false, message: 'Class not found' });
    }

    const students = storage.students.find({ status: 'active' }).filter(s =>
      s.enrolledClasses && s.enrolledClasses.includes(classId)
    );

    const attendances = storage.attendance.find({ classId });
    const fees = storage.fees.find({ classId });
    const exams = storage.exams.find({ classId });

    const totalCollected = fees.reduce((sum, f) => sum + (f.amountPaid || 0), 0);
    const totalPending = fees.reduce((sum, f) => sum + (f.balance || 0), 0);

    if (format === 'csv') {
      const headers = ['Student ID', 'Full Name', 'Phone', 'School', 'Fee Status'];
      const rows = students.map(s => {
        const sFees = fees.filter(f => f.studentId === s._id);
        const sPending = sFees.reduce((sum, f) => sum + (f.balance || 0), 0);
        return [s.studentId, s.fullName, s.phone, s.school, sPending > 0 ? `Pending Rs. ${sPending}` : 'Paid'];
      });
      const csv = toCsv(headers, rows);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="class-report-${cls.name.replace(/\s+/g, '_')}.csv"`);
      return res.send(csv);
    }

    res.json({
      success: true,
      report: {
        class: cls,
        studentCount: students.length,
        totalCollected,
        totalPending,
        totalExams: exams.length,
        students: students.map(s => ({
          id: s._id,
          code: s.studentId,
          name: s.fullName,
          phone: s.phone
        }))
      }
    });
  } catch (err) {
    next(err);
  }
};

const getFinancialReport = async (req, res, next) => {
  try {
    const { year = new Date().getFullYear(), format = 'json' } = req.query;
    const fees = storage.fees.find({ year: Number(year) });

    let totalExpected = 0;
    let totalCollected = 0;
    let totalPending = 0;

    fees.forEach(f => {
      totalExpected += (f.amountDue || 0);
      totalCollected += (f.amountPaid || 0);
      totalPending += (f.balance || 0);
    });

    const enriched = fees.map(f => {
      const student = storage.students.findById(f.studentId);
      const cls = storage.classes.findById(f.classId);
      return {
        receiptNumber: f.receiptNumber,
        date: f.paymentDate,
        student: student ? student.fullName : 'Student',
        studentId: student ? student.studentId : '',
        class: cls ? cls.name : 'Class',
        month: f.month,
        amountDue: f.amountDue,
        amountPaid: f.amountPaid,
        balance: f.balance,
        status: f.status,
        method: f.paymentMethod
      };
    });

    if (format === 'csv') {
      const headers = ['Receipt No', 'Date', 'Student ID', 'Student Name', 'Class', 'Period', 'Amount Due', 'Amount Paid', 'Balance', 'Status', 'Method'];
      const rows = enriched.map(e => [
        e.receiptNumber, e.date, e.studentId, e.student, e.class, e.month, e.amountDue, e.amountPaid, e.balance, e.status, e.method
      ]);
      const csv = toCsv(headers, rows);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="financial-report-${year}.csv"`);
      return res.send(csv);
    }

    res.json({
      success: true,
      data: {
        year,
        summary: { totalExpected, totalCollected, totalPending },
        transactions: enriched
      }
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getStudentReport,
  getClassReport,
  getFinancialReport
};
