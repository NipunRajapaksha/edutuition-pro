const storage = require('../services/storage');

/**
 * 1. AI Student Performance Insights
 */
const generatePerformanceInsights = async (req, res, next) => {
  try {
    const { studentId } = req.body;
    if (!studentId) {
      return res.status(400).json({ success: false, message: 'studentId is required' });
    }

    const student = storage.students.findById(studentId);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    // Attendance
    const attendances = storage.attendance.find({ studentId });
    const totalAtt = attendances.length;
    const presentAtt = attendances.filter(a => a.status === 'present' || a.status === 'late').length;
    const attendanceRate = totalAtt > 0 ? Math.round((presentAtt / totalAtt) * 100) : 100;

    // Homework
    const enrolledClasses = student.enrolledClasses || [];
    const classHw = storage.homework.find().filter(h => enrolledClasses.includes(h.classId));
    const submissions = storage.homeworkSubmissions.find({ studentId });
    const hwRate = classHw.length > 0 ? Math.round((submissions.length / classHw.length) * 100) : 100;

    // Exams & Marks
    const marks = storage.marks.find({ studentId });
    const examPercentages = marks.map(m => m.percentage);
    const avgScore = examPercentages.length > 0
      ? Math.round(examPercentages.reduce((a, b) => a + b, 0) / examPercentages.length)
      : 75;

    // Calculate trajectory/trend
    let trendText = 'maintaining a steady pace';
    let trajectoryPercent = 0;
    if (examPercentages.length >= 2) {
      const recent = examPercentages.slice(-2);
      trajectoryPercent = recent[1] - recent[0];
      if (trajectoryPercent > 5) {
        trendText = `improving by ${trajectoryPercent}% in recent evaluations`;
      } else if (trajectoryPercent < -5) {
        trendText = `showing a slight drop of ${Math.abs(trajectoryPercent)}% recently`;
      }
    }

    const observations = [];
    const recommendations = [];

    // Observation generation
    if (attendanceRate >= 90) {
      observations.push(`Excellent discipline with ${attendanceRate}% attendance record.`);
    } else if (attendanceRate < 75) {
      observations.push(`Low attendance (${attendanceRate}%); student has missed vital classroom discussions.`);
      recommendations.push('Arrange a brief check-in with the parent regarding recent absences.');
    }

    if (hwRate >= 85) {
      observations.push(`Prompt submission habit with ${hwRate}% homework completion.`);
    } else {
      observations.push(`Pending assignments detected (${hwRate}% submission rate).`);
      recommendations.push('Encourage peer-study group or provide guided worksheet reminders.');
    }

    if (avgScore >= 75) {
      observations.push(`Strong academic grasp scoring an average of ${avgScore}% (Rank ${marks[marks.length - 1]?.rank || 1}).`);
      recommendations.push('Introduce advanced model paper challenge questions to foster top tier rankings.');
    } else if (avgScore >= 50) {
      observations.push(`Moderate mastery (${avgScore}%). Student grasps core theories but needs test-taking stamina.`);
      recommendations.push('Focus on step-by-step past paper problem solving and time-management practice.');
    } else {
      observations.push(`Critical support recommended (${avgScore}% average marks). Fundamental concepts require reinforcement.`);
      recommendations.push('Provide targeted remedial topical handouts and schedule 1-on-1 revision.');
    }

    const summary = `${student.fullName} is currently ${trendText}. With an overall attendance of ${attendanceRate}% and exam average of ${avgScore}%, performance trajectory is positive with target areas identified below.`;

    res.json({
      success: true,
      data: {
        student: { name: student.fullName, code: student.studentId, grade: student.grade },
        attendanceRate,
        hwRate,
        averageMark: avgScore,
        trajectoryPercent,
        summary,
        observations,
        recommendations,
        generatedAt: new Date().toISOString()
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * 2. AI Homework Generator
 */
const generateHomework = async (req, res, next) => {
  try {
    const { grade = 'Grade 10', subject = 'Mathematics', topic = 'Quadratic Equations', difficulty = 'Medium', numQuestions = 5 } = req.body;

    const homeworkBank = {
      'Quadratic Equations': [
        { q: 'Solve the quadratic equation x² - 7x + 12 = 0 by factorization.', marks: 5, difficulty: 'Easy' },
        { q: 'Use the quadratic formula x = (-b ± √(b² - 4ac)) / (2a) to solve 2x² + 5x - 3 = 0.', marks: 10, difficulty: 'Medium' },
        { q: 'The length of a rectangular garden is 4 meters more than its width. If the total area is 96 m², find the perimeter.', marks: 15, difficulty: 'Medium' },
        { q: 'Find the value of k for which the equation 4x² + kx + 9 = 0 has two equal real roots.', marks: 10, difficulty: 'Hard' },
        { q: 'If α and β are the roots of 3x² - 6x + 2 = 0, determine the value of (α/β + β/α).', marks: 15, difficulty: 'Hard' }
      ],
      'Newton Laws': [
        { q: 'State Newton\'s Second Law of Motion and derive the formula F = ma.', marks: 10, difficulty: 'Easy' },
        { q: 'A vehicle of mass 1200 kg traveling at 20 m/s is brought to rest over a distance of 40 m. Calculate the decelerating braking force.', marks: 15, difficulty: 'Medium' },
        { q: 'Explain why a passenger leans backwards when a stationary bus abruptly accelerates forwards.', marks: 5, difficulty: 'Easy' },
        { q: 'Two blocks connected by a light inextensible string rest on a frictionless surface. If pulled by 30 N, find the acceleration and rope tension.', marks: 15, difficulty: 'Hard' }
      ]
    };

    let questions = homeworkBank[topic] || [
      { q: `Explain the fundamental principles of ${topic} with a labeled diagram or formula.`, marks: 10, difficulty: 'Easy' },
      { q: `Calculate the unknown parameter given standard boundary conditions in ${topic}.`, marks: 15, difficulty: 'Medium' },
      { q: `Analyze a practical real-world scenario applying ${topic} to solve the problem systematically.`, marks: 15, difficulty: 'Medium' },
      { q: `Derive the governing equation for ${topic} and list three assumptions made during the derivation.`, marks: 15, difficulty: 'Hard' },
      { q: `Past Exam Style Problem: Solve the multi-part challenge on ${topic} showing all steps clearly.`, marks: 20, difficulty: 'Hard' }
    ];

    const selected = questions.slice(0, numQuestions);
    const totalMarks = selected.reduce((sum, item) => sum + item.marks, 0);

    res.json({
      success: true,
      data: {
        title: `${grade} ${subject} - ${topic} Practice Assignment`,
        subject,
        grade,
        topic,
        difficulty,
        totalMarks,
        questions: selected,
        markingGuide: 'Award full marks for clear intermediate calculation steps, correct SI units, and neat presentation.'
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * 3. AI Quiz Generator
 */
const generateQuiz = async (req, res, next) => {
  try {
    const { grade = 'Grade 11', subject = 'Science', topic = 'Chemical Bonding', count = 4 } = req.body;

    const sampleQuiz = [
      {
        id: 1,
        question: 'Which type of bond is formed by the mutual sharing of valence electrons between atoms?',
        options: ['Ionic Bond', 'Covalent Bond', 'Metallic Bond', 'Hydrogen Bond'],
        correctAnswer: 'Covalent Bond',
        explanation: 'Covalent bonds form when non-metal atoms share pairs of valence electrons to achieve noble gas stability.'
      },
      {
        id: 2,
        question: 'What is the characteristic geometry and bond angle of a methane (CH₄) molecule?',
        options: ['Linear, 180°', 'Trigonal Planar, 120°', 'Tetrahedral, 109.5°', 'Pyramidal, 107°'],
        correctAnswer: 'Tetrahedral, 109.5°',
        explanation: 'The four sp³ hybrid orbitals repel equally, producing a regular tetrahedral shape with bond angles of 109.5°.'
      },
      {
        id: 3,
        question: 'Why do ionic compounds conduct electricity in the molten or aqueous state but not as solid crystals?',
        options: [
          'Solid crystals have too many free electrons',
          'Ions are locked in rigid lattice positions in solids, becoming mobile only when melted or dissolved',
          'Aqueous solution decomposes the ions into neutral atoms',
          'Covalent bonds form when solids melt'
        ],
        correctAnswer: 'Ions are locked in rigid lattice positions in solids, becoming mobile only when melted or dissolved',
        explanation: 'Electrical conduction requires mobile charge carriers. In solids, ions are fixed; in molten/solution states, ions move freely.'
      },
      {
        id: 4,
        question: 'Which element among the following possesses the highest electronegativity value on the Pauling scale?',
        options: ['Oxygen', 'Chlorine', 'Fluorine', 'Nitrogen'],
        correctAnswer: 'Fluorine',
        explanation: 'Fluorine is the most electronegative element with a value of 3.98.'
      }
    ];

    res.json({
      success: true,
      data: {
        title: `${subject}: ${topic} Quick Assessment Quiz`,
        grade,
        topic,
        quizQuestions: sampleQuiz.slice(0, count)
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * 4. AI Question Paper Generator
 */
const generateQuestionPaper = async (req, res, next) => {
  try {
    const {
      grade = 'Grade 11',
      subject = 'Mathematics',
      term = 'Mid-Year Term Evaluation',
      difficulty = 'Standard',
      totalMarks = 100
    } = req.body;

    const paper = {
      header: {
        institute: 'APEX TUITION ACADEMY / ශිල්ප කලා ආයතනය',
        examination: `${grade} ${subject} - ${term}`,
        duration: '2 Hours 30 Minutes',
        totalMarks
      },
      instructions: [
        'Answer all questions in Part A and any 4 questions from Part B.',
        'Write your answers neatly and show intermediate steps clearly.',
        'Calculators are permitted where specified.'
      ],
      partA: {
        title: 'Part A - Short Answer Questions (40 Marks)',
        questions: [
          { num: 1, text: 'Evaluate: (2³ × 4²) / 8¹', marks: 4 },
          { num: 2, text: 'Find the solution set for the inequality: 3x - 5 ≤ 7', marks: 4 },
          { num: 3, text: 'If log₁₀(2) = 0.3010, calculate the value of log₁₀(20)', marks: 4 },
          { num: 4, text: 'Factorize completely: 4a² - 9b²', marks: 4 },
          { num: 5, text: 'Find the gradient of the straight line passing through points (2, 3) and (6, 11)', marks: 4 },
          { num: 6, text: 'A cylinder has radius 7 cm and height 10 cm. Find its curved surface area (Take π = 22/7)', marks: 4 },
          { num: 7, text: 'In a class of 40 students, 24 study French and 18 study German. If 6 study both, how many study neither?', marks: 5 },
          { num: 8, text: 'Find the sum of the first 10 terms of the arithmetic progression 3, 7, 11, 15...', marks: 5 }
        ]
      },
      partB: {
        title: 'Part B - Structured Essay Problems (60 Marks - Answer 4 Questions)',
        questions: [
          {
            num: 9,
            title: 'Quadratic Functions & Graphs',
            text: 'Draw the graph of y = x² - 4x + 3 for the domain -1 ≤ x ≤ 5 on standard millimeter grid paper. From your graph, find: (i) the coordinates of the turning point, (ii) the roots of x² - 4x + 3 = 0, (iii) the range of values of x for which y is negative.',
            marks: 15
          },
          {
            num: 10,
            title: 'Trigonometry & Heights/Distances',
            text: 'A surveyor standing at point A observes the top of a communication tower T at an angle of elevation of 30°. Moving 50 m closer along horizontal ground to point B, the angle of elevation becomes 60°. Calculate the height of the tower correct to 2 decimal places.',
            marks: 15
          },
          {
            num: 11,
            title: 'Commercial Mathematics & Depreciation',
            text: 'A tuition teacher purchases an interactive digital smartboard for Rs. 350,000. It depreciates at a constant reducing balance rate of 12% per annum. (a) Calculate the value of the board after 2 years. (b) If after 3 years it was sold for Rs. 220,000, determine the profit or loss compared to book value.',
            marks: 15
          },
          {
            num: 12,
            title: 'Geometric Theorems & Circles',
            text: 'Prove that the angle subtended by an arc at the center of a circle is double the angle subtended by it at any point on the remaining circumference. Use this theorem to deduce that angles in the same segment of a circle are equal.',
            marks: 15
          }
        ]
      }
    };

    res.json({ success: true, data: paper });
  } catch (err) {
    next(err);
  }
};

/**
 * 5. AI Student Risk Detection
 */
const detectStudentRisk = async (req, res, next) => {
  try {
    const students = storage.students.find({ status: 'active' });
    const settings = storage.getSettings();
    const minAttendanceThreshold = settings.minAttendanceAlertPercent || 75;

    const riskProfiles = [];

    students.forEach(student => {
      // 1. Attendance Check
      const attendances = storage.attendance.find({ studentId: student._id });
      const totalAtt = attendances.length;
      const presentAtt = attendances.filter(a => a.status === 'present' || a.status === 'late').length;
      const attRate = totalAtt > 0 ? Math.round((presentAtt / totalAtt) * 100) : 100;

      // 2. Exam Marks Check
      const marks = storage.marks.find({ studentId: student._id });
      const examPercentages = marks.map(m => m.percentage);
      const avgMark = examPercentages.length > 0
        ? Math.round(examPercentages.reduce((a, b) => a + b, 0) / examPercentages.length)
        : 70;

      // 3. Homework Completion
      const enrolledClasses = student.enrolledClasses || [];
      const classHw = storage.homework.find().filter(h => enrolledClasses.includes(h.classId));
      const submissions = storage.homeworkSubmissions.find({ studentId: student._id });
      const hwRate = classHw.length > 0 ? Math.round((submissions.length / classHw.length) * 100) : 100;

      // Risk score calculation
      let riskLevel = 'Low';
      const flags = [];
      const suggestions = [];

      if (attRate < minAttendanceThreshold) {
        flags.push(`Attendance below safe boundary (${attRate}% vs threshold ${minAttendanceThreshold}%)`);
        suggestions.push('Notify guardian and check for transport/health barriers.');
      }

      if (avgMark < 50) {
        flags.push(`Critical test average (${avgMark}%), risk of failing upcoming term test`);
        suggestions.push('Assign a tailored 2-week remedial problem-solving worksheet.');
      } else if (avgMark < 60) {
        flags.push(`Borderline test performance (${avgMark}%)`);
        suggestions.push('Review error patterns on recent test papers with student.');
      }

      if (hwRate < 60) {
        flags.push(`Persistent homework non-submission (${hwRate}% completion)`);
        suggestions.push('Issue homework submission deadline alert.');
      }

      if (flags.length >= 2 || (attRate < 65 && avgMark < 45)) {
        riskLevel = 'High';
      } else if (flags.length === 1) {
        riskLevel = 'Moderate';
      }

      if (riskLevel !== 'Low') {
        riskProfiles.push({
          studentId: student._id,
          code: student.studentId,
          fullName: student.fullName,
          phone: student.phone,
          parentPhone: student.parentPhone,
          grade: student.grade,
          photo: student.photo,
          attendanceRate: attRate,
          averageMark: avgMark,
          homeworkCompletionRate: hwRate,
          riskLevel,
          flags,
          suggestions
        });
      }
    });

    // Sort High risk first
    riskProfiles.sort((a, b) => (a.riskLevel === 'High' ? -1 : 1));

    res.json({
      success: true,
      count: riskProfiles.length,
      thresholds: { minAttendance: minAttendanceThreshold, passMark: 50 },
      data: riskProfiles
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  generatePerformanceInsights,
  generateHomework,
  generateQuiz,
  generateQuestionPaper,
  detectStudentRisk
};
