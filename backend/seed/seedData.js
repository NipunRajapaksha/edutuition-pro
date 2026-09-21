const bcrypt = require('bcryptjs');
const storage = require('../services/storage');

async function seedDatabase() {
  console.log('🌱 Seeding Tuition Class Management Database...');
  storage.clearAll();

  const defaultPassword = await bcrypt.hash('password123', 10);

  // 1. Settings
  storage.updateSettings({
    instituteName: 'Apex Tuition Academy (ශිල්ප කලා උසස් අධ්‍යාපන ආයතනය)',
    currency: 'Rs.',
    phone: '+94 11 280 9900 / +94 77 123 4567',
    email: 'contact@apextuition.lk',
    address: 'No. 142, High Level Road, Nugegoda, Sri Lanka',
    minAttendanceAlertPercent: 75,
    enableAiAssistant: true
  });

  // 2. Classes
  const class1 = storage.classes.create({
    name: 'Grade 10 Mathematics (දසවන ශ්‍රේණිය ගණිතය)',
    subject: 'Mathematics',
    grade: 'Grade 10',
    teacherName: 'Master N. Perera (නයනජිත් පෙරේරා)',
    location: 'Auditorium Hall 1',
    dayOfWeek: 'Saturday',
    startTime: '08:00',
    endTime: '10:00',
    monthlyFee: 2500,
    maxStudents: 60,
    status: 'active',
    color: '#3B82F6'
  });

  const class2 = storage.classes.create({
    name: 'Grade 11 Science (එකොළොස්වන ශ්‍රේණිය විද්‍යාව)',
    subject: 'Science',
    grade: 'Grade 11',
    teacherName: 'Dr. S. Alwis (ආචාර්ය එස්. අල්විස්)',
    location: 'Lab Building 2',
    dayOfWeek: 'Saturday',
    startTime: '10:30',
    endTime: '12:30',
    monthlyFee: 2800,
    maxStudents: 50,
    status: 'active',
    color: '#10B981'
  });

  const class3 = storage.classes.create({
    name: 'A/L Combined Mathematics (උසස් පෙළ සංයුක්ත ගණිතය)',
    subject: 'Combined Mathematics',
    grade: 'A/L',
    teacherName: 'Eng. K. Dissanayake (ඉංජිනේරු කේ. දිසානායක)',
    location: 'Senior Hall A',
    dayOfWeek: 'Sunday',
    startTime: '08:00',
    endTime: '12:00',
    monthlyFee: 4000,
    maxStudents: 80,
    status: 'active',
    color: '#8B5CF6'
  });

  const class4 = storage.classes.create({
    name: 'A/L Physics (උසස් පෙළ භෞතික විද්‍යාව)',
    subject: 'Physics',
    grade: 'A/L',
    teacherName: 'Prof. Ananda Silva (මහාචාර්ය ආනන්ද සිල්වා)',
    location: 'Senior Hall B',
    dayOfWeek: 'Sunday',
    startTime: '13:00',
    endTime: '17:00',
    monthlyFee: 4000,
    maxStudents: 80,
    status: 'active',
    color: '#F59E0B'
  });

  const class5 = storage.classes.create({
    name: 'Grade 9 English & Grammar (නවවන ශ්‍රේණිය ඉංග්‍රීසි)',
    subject: 'English',
    grade: 'Grade 9',
    teacherName: 'Mrs. R. Wickramasinghe (ආර්. වික්‍රමසිංහ මිය)',
    location: 'Room 104',
    dayOfWeek: 'Wednesday',
    startTime: '16:00',
    endTime: '18:00',
    monthlyFee: 2200,
    maxStudents: 40,
    status: 'active',
    color: '#EC4899'
  });

  // 3. Students
  const rawStudents = [
    {
      studentId: 'STU-2026-001',
      fullName: 'Kasun Bandara (කසුන් බණ්ඩාර)',
      dob: '2010-04-12',
      gender: 'male',
      phone: '0714567890',
      email: 'kasun.b@gmail.com',
      address: '25/A Temple Road, Maharagama',
      parentName: 'Sunil Bandara (සුනිල් බණ්ඩාර)',
      parentPhone: '0779876543',
      school: 'Ananda College, Colombo',
      grade: 'Grade 10',
      enrolledClasses: [class1._id, class2._id],
      notes: 'Excels in Algebra. Very punctual.'
    },
    {
      studentId: 'STU-2026-002',
      fullName: 'Dilani Senanayake (දිලානි සේනානායක)',
      dob: '2010-08-20',
      gender: 'female',
      phone: '0723456789',
      email: 'dilani.s@gmail.com',
      address: '44 Station Road, Nugegoda',
      parentName: 'Gamini Senanayake',
      parentPhone: '0711122334',
      school: 'Visakha Vidyalaya, Colombo',
      grade: 'Grade 10',
      enrolledClasses: [class1._id],
      notes: 'Strong in geometry.'
    },
    {
      studentId: 'STU-2026-003',
      fullName: 'Chamindu Jayasinghe (චමිඳු ජයසිංහ)',
      dob: '2009-02-15',
      gender: 'male',
      phone: '0778901234',
      email: 'chamindu.j@gmail.com',
      address: '88 Kandy Road, Kiribathgoda',
      parentName: 'Priyantha Jayasinghe',
      parentPhone: '0785566778',
      school: 'Nalanda College, Colombo',
      grade: 'Grade 11',
      enrolledClasses: [class2._id],
      notes: 'Science practical leader.'
    },
    {
      studentId: 'STU-2026-004',
      fullName: 'Oshani Wickramasinghe (ඔශානි වික්‍රමසිංහ)',
      dob: '2009-11-05',
      gender: 'female',
      phone: '0756789012',
      email: 'oshani.w@gmail.com',
      address: '12 School Lane, Dehiwala',
      parentName: 'Nimali Wickramasinghe',
      parentPhone: '0772233445',
      school: 'Devi Balika Vidyalaya',
      grade: 'Grade 11',
      enrolledClasses: [class2._id],
      notes: 'Consistently high test scores.'
    },
    {
      studentId: 'STU-2026-005',
      fullName: 'Kavindu Nirmal (කවිඳු නිර්මාල්)',
      dob: '2007-06-18',
      gender: 'male',
      phone: '0761234567',
      email: 'kavindu.n@gmail.com',
      address: '19 Park Street, Colombo 05',
      parentName: 'Chandrasiri Nirmal',
      parentPhone: '0773344556',
      school: 'Royal College, Colombo',
      grade: 'A/L',
      enrolledClasses: [class3._id, class4._id],
      notes: 'Aspiring for Engineering faculty.'
    },
    {
      studentId: 'STU-2026-006',
      fullName: 'Sanduni Fernando (සඳුනි ප්‍රනාන්දු)',
      dob: '2007-09-24',
      gender: 'female',
      phone: '0782345678',
      email: 'sanduni.f@gmail.com',
      address: '102 Galle Road, Moratuwa',
      parentName: 'Rohan Fernando',
      parentPhone: '0714455667',
      school: 'Sirimavo Bandaranaike Vidyalaya',
      grade: 'A/L',
      enrolledClasses: [class3._id, class4._id],
      notes: 'Physics Olympiad participant.'
    },
    {
      studentId: 'STU-2026-007',
      fullName: 'Dineth Silva (දිනෙත් සිල්වා)',
      dob: '2011-03-30',
      gender: 'male',
      phone: '0713456781',
      email: 'dineth.s@gmail.com',
      address: '55 Lake Road, Boralesgamuwa',
      parentName: 'Asoka Silva',
      parentPhone: '0775566779',
      school: 'Thurstan College, Colombo',
      grade: 'Grade 9',
      enrolledClasses: [class5._id],
      notes: 'Enthusiastic in grammar lessons.'
    },
    {
      studentId: 'STU-2026-008',
      fullName: 'Maleesha Gamage (මලීෂ ගමගේ)',
      dob: '2010-07-14',
      gender: 'male',
      phone: '0724567891',
      email: 'maleesha.g@gmail.com',
      address: '32 Hospital Road, Homagama',
      parentName: 'Kamal Gamage',
      parentPhone: '0766677889',
      school: 'D.S. Senanayake College',
      grade: 'Grade 10',
      enrolledClasses: [class1._id],
      notes: 'Needs additional attention in trigonometry.'
    }
  ];

  const students = rawStudents.map(s => {
    return storage.students.create({
      ...s,
      photo: `https://api.dicebear.com/7.x/bottts/png?seed=${encodeURIComponent(s.studentId)}`,
      enrollmentDate: '2026-01-05',
      status: 'active'
    });
  });

  const student1 = students[0]; // Kasun Bandara
  const student2 = students[1]; // Dilani Senanayake
  const student5 = students[4]; // Kavindu Nirmal
  const student8 = students[7]; // Maleesha Gamage

  // 4. Users (Authentication Accounts)
  // Teacher / Admin Account
  storage.users.create({
    name: 'Master Nayanajith Perera (ගුරුතුමා)',
    email: 'teacher@tuition.lk',
    password: defaultPassword,
    role: 'teacher',
    phone: '+94 77 123 4567',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
  });

  // Student Account (Kasun)
  storage.users.create({
    name: student1.fullName,
    email: 'student1@tuition.lk',
    password: defaultPassword,
    role: 'student',
    phone: student1.phone,
    studentProfileId: student1._id,
    avatar: student1.photo
  });

  // Student Account (Dilani)
  storage.users.create({
    name: student2.fullName,
    email: 'student2@tuition.lk',
    password: defaultPassword,
    role: 'student',
    phone: student2.phone,
    studentProfileId: student2._id,
    avatar: student2.photo
  });

  // Parent Account (Parent of Kasun)
  storage.users.create({
    name: student1.parentName,
    email: 'parent1@tuition.lk',
    password: defaultPassword,
    role: 'parent',
    phone: student1.parentPhone,
    linkedStudentId: student1._id,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'
  });

  // 5. Attendance Records
  const attendanceDates = [
    '2026-08-22',
    '2026-08-29',
    '2026-09-05',
    '2026-09-12',
    '2026-09-19'
  ];

  attendanceDates.forEach(date => {
    // Class 1 (Grade 10 Maths)
    storage.attendance.create({
      classId: class1._id,
      studentId: student1._id,
      date,
      status: 'present',
      markedVia: 'qr',
      time: '07:54 AM'
    });

    storage.attendance.create({
      classId: class1._id,
      studentId: student2._id,
      date,
      status: date === '2026-09-12' ? 'late' : 'present',
      markedVia: 'manual',
      time: '08:12 AM'
    });

    storage.attendance.create({
      classId: class1._id,
      studentId: student8._id,
      date,
      status: date === '2026-09-19' ? 'absent' : 'present',
      markedVia: 'manual',
      time: '08:00 AM'
    });
  });

  // 6. Fees & Receipts
  // Kasun Bandara (Paid for Jan, Feb, March, pending April)
  storage.fees.create({
    receiptNumber: 'REC-2026-0001',
    studentId: student1._id,
    classId: class1._id,
    month: 'January',
    year: 2026,
    amountDue: 2500,
    amountPaid: 2500,
    balance: 0,
    status: 'paid',
    paymentMethod: 'cash',
    paymentDate: '2026-01-10',
    transactionId: 'TXN-CASH-9812'
  });

  storage.fees.create({
    receiptNumber: 'REC-2026-0002',
    studentId: student1._id,
    classId: class1._id,
    month: 'February',
    year: 2026,
    amountDue: 2500,
    amountPaid: 2500,
    balance: 0,
    status: 'paid',
    paymentMethod: 'bank_transfer',
    paymentDate: '2026-02-08',
    transactionId: 'BOC-FT-8831920'
  });

  storage.fees.create({
    receiptNumber: 'REC-2026-0003',
    studentId: student1._id,
    classId: class1._id,
    month: 'March',
    year: 2026,
    amountDue: 2500,
    amountPaid: 2500,
    balance: 0,
    status: 'paid',
    paymentMethod: 'online',
    paymentDate: '2026-03-05',
    transactionId: 'PAY-ONL-44910'
  });

  storage.fees.create({
    receiptNumber: 'REC-2026-0004',
    studentId: student1._id,
    classId: class1._id,
    month: 'April',
    year: 2026,
    amountDue: 2500,
    amountPaid: 1000,
    balance: 1500,
    status: 'partially_paid',
    paymentMethod: 'cash',
    paymentDate: '2026-04-12',
    notes: 'Remaining Rs. 1500 to be paid next week'
  });

  // Dilani Senanayake
  storage.fees.create({
    receiptNumber: 'REC-2026-0005',
    studentId: student2._id,
    classId: class1._id,
    month: 'April',
    year: 2026,
    amountDue: 2500,
    amountPaid: 2500,
    balance: 0,
    status: 'paid',
    paymentMethod: 'bank_transfer',
    paymentDate: '2026-04-06',
    transactionId: 'COMM-TXN-55201'
  });

  // Kavindu Nirmal (A/L)
  storage.fees.create({
    receiptNumber: 'REC-2026-0006',
    studentId: student5._id,
    classId: class3._id,
    month: 'April',
    year: 2026,
    amountDue: 4000,
    amountPaid: 4000,
    balance: 0,
    status: 'paid',
    paymentMethod: 'online',
    paymentDate: '2026-04-02',
    transactionId: 'PAYHERE-AL-99321'
  });

  // Maleesha Gamage (Overdue fee)
  storage.fees.create({
    receiptNumber: 'REC-2026-0007',
    studentId: student8._id,
    classId: class1._id,
    month: 'April',
    year: 2026,
    amountDue: 2500,
    amountPaid: 0,
    balance: 2500,
    status: 'overdue',
    paymentMethod: 'cash',
    paymentDate: '2026-04-01'
  });

  // 7. Homework & Assignments
  const hw1 = storage.homework.create({
    classId: class1._id,
    title: 'Quadratic Equations Practice Set (ද්විපද සමීකරණ ගැටළු)',
    description: 'Solve questions 1 through 15 from exercise 14.2 on factoring and using the quadratic formula.',
    subject: 'Mathematics',
    attachments: [
      { name: 'Quadratic_Equations_Handout.pdf', url: 'https://example.com/handouts/quad_eq.pdf', type: 'pdf' }
    ],
    deadline: '2026-09-28',
    totalMarks: 100
  });

  const hw2 = storage.homework.create({
    classId: class1._id,
    title: 'Pythagoras Theorem Geometric Proofs (පයිතගරස් ප්‍රමේයය)',
    description: 'Write down formal proofs for geometric problems on page 42 and calculate hypotenuse vectors.',
    subject: 'Mathematics',
    attachments: [],
    deadline: '2026-09-25',
    totalMarks: 50
  });

  const hw3 = storage.homework.create({
    classId: class2._id,
    title: 'Atomic Structure & Periodic Table Trends (පරමාණුක ව්‍යුහය)',
    description: 'Diagram the first 20 elements with electron configurations and ionization energies.',
    subject: 'Science',
    attachments: [],
    deadline: '2026-09-30',
    totalMarks: 50
  });

  // Submissions
  storage.homeworkSubmissions.create({
    homeworkId: hw1._id,
    studentId: student1._id,
    content: 'Completed all 15 questions with step-by-step factorization and verification.',
    attachments: [{ name: 'Kasun_Quadratic_Solutions.pdf', url: 'https://example.com/submissions/kasun_hw1.pdf' }],
    status: 'reviewed',
    marksObtained: 95,
    feedback: 'Excellent work, Kasun! High precision on root signs and fractions.',
    reviewedAt: '2026-09-22T10:00:00Z'
  });

  storage.homeworkSubmissions.create({
    homeworkId: hw1._id,
    studentId: student2._id,
    content: 'Finished exercises on quadratic equations.',
    attachments: [],
    status: 'submitted'
  });

  // 8. Exams & Marks
  const exam1 = storage.exams.create({
    name: 'Mid-Term Evaluation Test (අර්ධවාර්ෂික ඇගයීම් පරීක්ෂණය)',
    type: 'term_test',
    classId: class1._id,
    subject: 'Mathematics',
    date: '2026-08-15',
    totalMarks: 100,
    status: 'graded'
  });

  const exam2 = storage.exams.create({
    name: 'Monthly Speed Test 01 - Algebra (මාසික පරීක්ෂණය)',
    type: 'monthly_test',
    classId: class1._id,
    subject: 'Mathematics',
    date: '2026-09-10',
    totalMarks: 100,
    status: 'graded'
  });

  const exam3 = storage.exams.create({
    name: 'Upcoming Model Paper Examination (ආදර්ශ ප්‍රශ්න පත්‍රය)',
    type: 'model_paper',
    classId: class1._id,
    subject: 'Mathematics',
    date: '2026-10-04',
    totalMarks: 100,
    status: 'scheduled'
  });

  // Marks for Exam 1
  storage.marks.create({
    examId: exam1._id,
    studentId: student1._id,
    marksObtained: 88,
    percentage: 88,
    grade: 'A',
    rank: 1,
    remarks: 'Outstanding logical progression and neat geometry diagrams.'
  });

  storage.marks.create({
    examId: exam1._id,
    studentId: student2._id,
    marksObtained: 79,
    percentage: 79,
    grade: 'A',
    rank: 2,
    remarks: 'Very good score. Small algebra error on question 4.'
  });

  storage.marks.create({
    examId: exam1._id,
    studentId: student8._id,
    marksObtained: 46,
    percentage: 46,
    grade: 'S',
    rank: 3,
    remarks: 'Needs urgent practice in algebraic equations.'
  });

  // Marks for Exam 2
  storage.marks.create({
    examId: exam2._id,
    studentId: student1._id,
    marksObtained: 94,
    percentage: 94,
    grade: 'A',
    rank: 1,
    remarks: 'Top score in class!'
  });

  storage.marks.create({
    examId: exam2._id,
    studentId: student2._id,
    marksObtained: 85,
    percentage: 85,
    grade: 'A',
    rank: 2,
    remarks: 'Great improvement in problem solving speed.'
  });

  // 9. Study Materials
  storage.studyMaterials.create({
    classId: class1._id,
    subject: 'Mathematics',
    topic: 'Quadratic Equations (ද්විපද සමීකරණ)',
    title: 'Grade 10 Quadratic Equations Complete Revision Notes',
    description: 'Comprehensive theory explanations, standard formula derivations, and 30 solved past paper questions.',
    fileUrl: 'https://example.com/materials/g10_quadratics_complete.pdf',
    fileType: 'pdf',
    fileSize: '3.4 MB',
    uploadedBy: 'Master N. Perera'
  });

  storage.studyMaterials.create({
    classId: class1._id,
    subject: 'Mathematics',
    topic: 'Geometry & Angles (ජ්‍යාමිතිය)',
    title: 'Circle Theorems & Angle Deductions Summary Sheet',
    description: 'Quick reference sheet containing all 8 core circle theorems with diagrams and proofs.',
    fileUrl: 'https://example.com/materials/circle_theorems_quick_ref.pdf',
    fileType: 'pdf',
    fileSize: '1.9 MB',
    uploadedBy: 'Master N. Perera'
  });

  storage.studyMaterials.create({
    classId: class2._id,
    subject: 'Science',
    topic: 'Chemical Bonding (රසායනික බන්ධන)',
    title: 'Chemical Reactions and Electronegativity Illustrated Guide',
    description: 'High-resolution color illustrations showing covalent, ionic, and metallic lattices.',
    fileUrl: 'https://example.com/materials/chemical_bonding_guide.pdf',
    fileType: 'pdf',
    fileSize: '4.2 MB',
    uploadedBy: 'Dr. S. Alwis'
  });

  storage.studyMaterials.create({
    classId: class3._id,
    subject: 'Combined Mathematics',
    topic: 'Calculus (කලනය)',
    title: 'Differentiation & Integration 10-Year Past Paper Compendium',
    description: 'All A/L Combined Maths calculus problems from 2014 to 2025 with model marking schemes.',
    fileUrl: 'https://example.com/materials/al_calculus_10years.pdf',
    fileType: 'pdf',
    fileSize: '8.5 MB',
    uploadedBy: 'Eng. K. Dissanayake'
  });

  // 10. Announcements
  storage.announcements.create({
    title: 'Special Extra Revision Session this Saturday (විශේෂ අමතර පන්තිය)',
    content: 'Grade 10 Mathematics class will start at 7:30 AM this Saturday (September 26) to cover challenging exam problems. Please bring past paper booklets.',
    targetType: 'all',
    priority: 'high',
    authorName: 'Master N. Perera'
  });

  storage.announcements.create({
    title: 'Model Paper Examination Registrations Now Open (ආදර්ශ විභාගය)',
    content: 'Registrations for the October All-Island Model Examination are now open. Registered students will receive computerized rank evaluation cards.',
    targetType: 'all',
    priority: 'normal',
    authorName: 'Administration'
  });

  storage.announcements.create({
    title: 'Fee Payment Deadline Notice for October 2026 (ඔක්තෝබර් මාසික ගාස්තු)',
    content: 'Parents and students are kindly reminded that October monthly tuition fees should be settled on or before October 10 to receive attendance barcode renewal.',
    targetType: 'parents',
    priority: 'urgent',
    authorName: 'Finance Department'
  });

  // 11. Calendar Events
  storage.calendarEvents.create({
    title: 'Grade 10 Mathematics Regular Class',
    type: 'class',
    date: '2026-09-26',
    startTime: '08:00',
    endTime: '10:00',
    classId: class1._id,
    color: '#3B82F6',
    description: 'Algebra factorization and formulas'
  });

  storage.calendarEvents.create({
    title: 'G.C.E. A/L Combined Maths Class',
    type: 'class',
    date: '2026-09-27',
    startTime: '08:00',
    endTime: '12:00',
    classId: class3._id,
    color: '#8B5CF6',
    description: 'Calculus and integration techniques'
  });

  storage.calendarEvents.create({
    title: 'Monthly Model Paper Exam 01',
    type: 'exam',
    date: '2026-10-04',
    startTime: '08:30',
    endTime: '11:00',
    classId: class1._id,
    color: '#EF4444',
    description: '100 Marks - Comprehensive Evaluation'
  });

  storage.calendarEvents.create({
    title: 'Vap Full Moon Poya Day Holiday (වප් පුන් පොහෝ දින නිවාඩුව)',
    type: 'holiday',
    date: '2026-10-25',
    startTime: '00:00',
    endTime: '23:59',
    color: '#10B981',
    description: 'Tuition institute closed for Poya religious observance'
  });

  console.log('✅ Seed completed successfully! Test credentials:');
  console.log('  👨‍🏫 Teacher: teacher@tuition.lk / password123');
  console.log('  👨‍🎓 Student 1: student1@tuition.lk / password123 (Kasun Bandara)');
  console.log('  👩‍🎓 Student 2: student2@tuition.lk / password123 (Dilani Senanayake)');
  console.log('  👪 Parent:    parent1@tuition.lk / password123 (Sunil Bandara)');
}

if (require.main === module) {
  seedDatabase().then(() => process.exit(0)).catch(err => {
    console.error('Seed error:', err);
    process.exit(1);
  });
}

module.exports = seedDatabase;
