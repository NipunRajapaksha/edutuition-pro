const storage = require('../services/storage');

const generateReceiptNumber = () => {
  const year = new Date().getFullYear();
  const fees = storage.fees.find();
  const prefix = `REC-${year}-`;

  let maxSeq = 0;
  fees.forEach(f => {
    if (f.receiptNumber && f.receiptNumber.startsWith(prefix)) {
      const seqStr = f.receiptNumber.replace(prefix, '');
      const seq = parseInt(seqStr, 10);
      if (!isNaN(seq) && seq > maxSeq) {
        maxSeq = seq;
      }
    }
  });

  return `${prefix}${String(maxSeq + 1).padStart(4, '0')}`;
};

const getFees = async (req, res, next) => {
  try {
    const { month, year, classId, studentId, status, q } = req.query;
    let fees = storage.fees.find();

    if (month) fees = fees.filter(f => f.month.toLowerCase() === month.toLowerCase());
    if (year) fees = fees.filter(f => Number(f.year) === Number(year));
    if (classId) fees = fees.filter(f => f.classId === classId);
    if (studentId) fees = fees.filter(f => f.studentId === studentId);
    if (status) fees = fees.filter(f => f.status === status);

    let enriched = fees.map(f => {
      const student = storage.students.findById(f.studentId);
      const cls = storage.classes.findById(f.classId);
      return {
        ...f,
        studentName: student ? student.fullName : 'Unknown Student',
        studentCode: student ? student.studentId : '',
        studentPhone: student ? student.phone : '',
        className: cls ? cls.name : 'Unknown Class',
        classSubject: cls ? cls.subject : ''
      };
    });

    if (q) {
      const query = q.toLowerCase();
      enriched = enriched.filter(e =>
        e.studentName.toLowerCase().includes(query) ||
        e.studentCode.toLowerCase().includes(query) ||
        e.receiptNumber.toLowerCase().includes(query)
      );
    }

    // Sort by latest paymentDate
    enriched.sort((a, b) => b.createdAt.localeCompare(a.createdAt));

    res.json({ success: true, count: enriched.length, data: enriched });
  } catch (err) {
    next(err);
  }
};

const recordPayment = async (req, res, next) => {
  try {
    const {
      studentId,
      classId,
      month,
      year = new Date().getFullYear(),
      amountDue,
      amountPaid,
      paymentMethod = 'cash',
      transactionId = '',
      notes = ''
    } = req.body;

    if (!studentId || !classId || !month || amountDue === undefined || amountPaid === undefined) {
      return res.status(400).json({ success: false, message: 'Missing required fee fields' });
    }

    const due = Number(amountDue);
    const paid = Number(amountPaid);
    const balance = Math.max(0, due - paid);

    let status = 'pending';
    if (paid >= due) {
      status = 'paid';
    } else if (paid > 0) {
      status = 'partially_paid';
    }

    // Check if a record already exists for this student/class/month/year
    const existing = storage.fees.findOne({
      studentId,
      classId,
      month,
      year: Number(year)
    });

    let record;
    if (existing) {
      const totalPaid = (existing.amountPaid || 0) + paid;
      const newBalance = Math.max(0, due - totalPaid);
      let newStatus = 'pending';
      if (totalPaid >= due) newStatus = 'paid';
      else if (totalPaid > 0) newStatus = 'partially_paid';

      record = storage.fees.findByIdAndUpdate(existing._id, {
        amountDue: due,
        amountPaid: totalPaid,
        balance: newBalance,
        status: newStatus,
        paymentMethod,
        transactionId: transactionId || existing.transactionId,
        paymentDate: new Date().toISOString().split('T')[0],
        notes: notes || existing.notes
      });
    } else {
      const receiptNumber = generateReceiptNumber();
      record = storage.fees.create({
        receiptNumber,
        studentId,
        classId,
        month,
        year: Number(year),
        amountDue: due,
        amountPaid: paid,
        balance,
        status,
        paymentMethod,
        paymentDate: new Date().toISOString().split('T')[0],
        transactionId,
        notes
      });
    }

    // Create notification for student & parent
    const studentUser = storage.users.findOne({ studentProfileId: studentId });
    const parentUser = storage.users.findOne({ linkedStudentId: studentId });
    const student = storage.students.findById(studentId);

    const notifMsg = `Payment of Rs. ${paid.toLocaleString()} recorded for ${month} ${year}. Receipt #${record.receiptNumber}`;

    if (studentUser) {
      storage.notifications.create({
        userId: studentUser._id,
        title: 'Fee Payment Received',
        message: notifMsg,
        type: 'fee'
      });
    }
    if (parentUser) {
      storage.notifications.create({
        userId: parentUser._id,
        title: 'Fee Payment Confirmation',
        message: `Payment of Rs. ${paid.toLocaleString()} received for ${student ? student.fullName : 'your child'}.`,
        type: 'fee'
      });
    }

    res.status(201).json({ success: true, message: 'Payment recorded successfully', data: record });
  } catch (err) {
    next(err);
  }
};

const getReceipt = async (req, res, next) => {
  try {
    const { receiptNumber } = req.params;
    const fee = storage.fees.findOne({ receiptNumber });
    if (!fee) {
      return res.status(404).json({ success: false, message: 'Receipt not found' });
    }

    const student = storage.students.findById(fee.studentId);
    const cls = storage.classes.findById(fee.classId);
    const settings = storage.getSettings();

    const receiptData = {
      receiptNumber: fee.receiptNumber,
      paymentDate: fee.paymentDate,
      institute: {
        name: settings.instituteName,
        phone: settings.phone,
        email: settings.email,
        address: settings.address
      },
      student: {
        studentId: student ? student.studentId : '',
        fullName: student ? student.fullName : 'Student',
        phone: student ? student.phone : '',
        grade: student ? student.grade : ''
      },
      class: {
        name: cls ? cls.name : 'Class',
        subject: cls ? cls.subject : '',
        teacher: cls ? cls.teacherName : 'Teacher'
      },
      billing: {
        period: `${fee.month} ${fee.year}`,
        amountDue: fee.amountDue,
        amountPaid: fee.amountPaid,
        balance: fee.balance,
        status: fee.status,
        paymentMethod: fee.paymentMethod,
        transactionId: fee.transactionId,
        currency: 'Rs.'
      },
      verificationCode: Buffer.from(`${fee.receiptNumber}-${fee.paymentDate}-${fee.amountPaid}`).toString('base64')
    };

    res.json({ success: true, data: receiptData });
  } catch (err) {
    next(err);
  }
};

const getFinancialOverview = async (req, res, next) => {
  try {
    const currentYear = new Date().getFullYear();
    const fees = storage.fees.find({ year: currentYear });
    const classes = storage.classes.find({ status: 'active' });

    let totalExpected = 0;
    let totalCollected = 0;
    let totalPending = 0;

    fees.forEach(f => {
      totalExpected += (f.amountDue || 0);
      totalCollected += (f.amountPaid || 0);
      totalPending += (f.balance || 0);
    });

    // Revenue by class
    const revenueByClass = classes.map(cls => {
      const classFees = fees.filter(f => f.classId === cls._id);
      const collected = classFees.reduce((sum, f) => sum + (f.amountPaid || 0), 0);
      const pending = classFees.reduce((sum, f) => sum + (f.balance || 0), 0);
      return {
        classId: cls._id,
        className: cls.name,
        subject: cls.subject,
        grade: cls.grade,
        collected,
        pending
      };
    });

    // Payment methods breakdown
    const methodCounts = {
      cash: fees.filter(f => f.paymentMethod === 'cash').reduce((sum, f) => sum + f.amountPaid, 0),
      bank_transfer: fees.filter(f => f.paymentMethod === 'bank_transfer').reduce((sum, f) => sum + f.amountPaid, 0),
      online: fees.filter(f => f.paymentMethod === 'online').reduce((sum, f) => sum + f.amountPaid, 0),
      other: fees.filter(f => f.paymentMethod === 'other').reduce((sum, f) => sum + f.amountPaid, 0)
    };

    // Monthly breakdown (last 6 months)
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const currentMonthIndex = new Date().getMonth();
    const recentMonths = [];
    for (let i = Math.max(0, currentMonthIndex - 5); i <= currentMonthIndex; i++) {
      const m = months[i];
      const mFees = fees.filter(f => f.month.toLowerCase() === m.toLowerCase());
      recentMonths.push({
        month: m,
        collected: mFees.reduce((sum, f) => sum + f.amountPaid, 0),
        pending: mFees.reduce((sum, f) => sum + f.balance, 0)
      });
    }

    res.json({
      success: true,
      data: {
        summary: {
          totalExpected,
          totalCollected,
          totalPending,
          collectionRate: totalExpected > 0 ? Math.round((totalCollected / totalExpected) * 100) : 100
        },
        revenueByClass,
        paymentMethods: methodCounts,
        monthlyTrends: recentMonths
      }
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getFees,
  recordPayment,
  getReceipt,
  getFinancialOverview
};
