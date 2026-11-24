import bcrypt from 'bcryptjs';

export const getSeedUsers = async () => {
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash('password123', salt);

  return [
    {
      username: 'teacher',
      email: 'teacher@zp-dahiwadi.edu.in',
      passwordHash,
      passwordSalt: salt,
      fullName: 'S. Deshmukh',
      role: 'teacher',
      schoolName: 'Zilla Parishad High School, Dahiwadi',
      studentId: null,
      isActive: true
    },
    {
      username: 'headmaster',
      email: 'headmaster@zp-dahiwadi.edu.in',
      passwordHash,
      passwordSalt: salt,
      fullName: 'Dr. K. Patil',
      role: 'headmaster',
      schoolName: 'Zilla Parishad High School, Dahiwadi',
      studentId: null,
      isActive: true
    },
    {
      username: 'admin',
      email: 'admin@education.satara.gov.in',
      passwordHash,
      passwordSalt: salt,
      fullName: 'B. Shinde',
      role: 'admin',
      schoolName: 'Dahiwadi Block Education Office',
      studentId: null,
      isActive: true
    },
    {
      username: 'parent',
      email: 'parent.jadhav@grampanchayat.in',
      passwordHash,
      passwordSalt: salt,
      fullName: 'Savita Jadhav',
      role: 'parent',
      schoolName: 'Zilla Parishad High School, Dahiwadi',
      studentId: 1, // Asha Jadhav
      isActive: true
    },
    {
      username: 'student',
      email: 'asha.jadhav@student.zp.in',
      passwordHash,
      passwordSalt: salt,
      fullName: 'Asha Jadhav',
      role: 'student',
      schoolName: 'Zilla Parishad High School, Dahiwadi',
      studentId: 1, // Asha Jadhav
      isActive: true
    }
  ];
};

export const seedStudents = [
  {
    numericId: 1,
    fullName: 'Asha Jadhav',
    className: '8',
    schoolName: 'Zilla Parishad High School, Dahiwadi',
    parentName: 'Savita Jadhav',
    parentContact: '+91 98221 44521'
  },
  {
    numericId: 2,
    fullName: 'Rohan Pawar',
    className: '8',
    schoolName: 'Zilla Parishad High School, Dahiwadi',
    parentName: 'Suresh Pawar',
    parentContact: '+91 98502 33119'
  },
  {
    numericId: 3,
    fullName: 'Meena Shinde',
    className: '8',
    schoolName: 'Zilla Parishad High School, Dahiwadi',
    parentName: 'Anand Shinde',
    parentContact: '+91 94235 77812'
  },
  {
    numericId: 4,
    fullName: 'Sachin Kamble',
    className: '8',
    schoolName: 'Zilla Parishad High School, Dahiwadi',
    parentName: 'Nitin Kamble',
    parentContact: '+91 97631 88924'
  },
  {
    numericId: 5,
    fullName: 'Pooja Gaikwad',
    className: '8',
    schoolName: 'Zilla Parishad High School, Dahiwadi',
    parentName: 'Ramesh Gaikwad',
    parentContact: '+91 99210 66345'
  }
];

// Helper to generate dates for past 10 instructional days (excluding weekends)
export const getTenInstructionalDates = () => {
  return [
    '2026-11-10',
    '2026-11-11',
    '2026-11-12',
    '2026-11-13',
    '2026-11-14',
    '2026-11-17',
    '2026-11-18',
    '2026-11-19',
    '2026-11-20',
    '2026-11-21'
  ];
};

export const getSeedAttendance = () => {
  const dates = getTenInstructionalDates();
  const records = [];

  // 1. Asha Jadhav (id: 1) - High attendance (9 present, 1 late = 95%)
  const ashaStatus = [
    'present', 'present', 'present', 'present', 'late',
    'present', 'present', 'present', 'present', 'present'
  ];
  dates.forEach((d, idx) => {
    records.push({
      studentId: 1,
      attendanceDate: d,
      status: ashaStatus[idx],
      notes: ashaStatus[idx] === 'late' ? 'Bus delayed due to village road maintenance' : ''
    });
  });

  // 2. Rohan Pawar (id: 2) - High Risk / Critical Alert (4 consecutive absences at the end)
  const rohanStatus = [
    'present', 'present', 'present', 'absent', 'present',
    'present', 'absent', 'absent', 'absent', 'absent'
  ];
  dates.forEach((d, idx) => {
    records.push({
      studentId: 2,
      attendanceDate: d,
      status: rohanStatus[idx],
      notes: rohanStatus[idx] === 'absent' ? 'Family reported harvest season assistance' : ''
    });
  });

  // 3. Meena Shinde (id: 3) - Medium Risk (7 present, 3 absent = 70%)
  const meenaStatus = [
    'absent', 'present', 'present', 'absent', 'present',
    'present', 'present', 'absent', 'present', 'present'
  ];
  dates.forEach((d, idx) => {
    records.push({
      studentId: 3,
      attendanceDate: d,
      status: meenaStatus[idx],
      notes: meenaStatus[idx] === 'absent' ? 'Taking care of younger sibling at home' : ''
    });
  });

  // 4. Sachin Kamble (id: 4) - Regular / Low Risk (9 present, 1 late)
  const sachinStatus = [
    'present', 'present', 'present', 'present', 'present',
    'present', 'late', 'present', 'present', 'present'
  ];
  dates.forEach((d, idx) => {
    records.push({
      studentId: 4,
      attendanceDate: d,
      status: sachinStatus[idx],
      notes: ''
    });
  });

  // 5. Pooja Gaikwad (id: 5) - High Risk (5 present, 5 absent = 50%)
  const poojaStatus = [
    'present', 'absent', 'present', 'absent', 'absent',
    'present', 'absent', 'present', 'absent', 'present'
  ];
  dates.forEach((d, idx) => {
    records.push({
      studentId: 5,
      attendanceDate: d,
      status: poojaStatus[idx],
      notes: 'Frequent travel with seasonal brick kiln labor'
    });
  });

  return records;
};

export const seedAcademicRecords = [
  // Asha Jadhav (id: 1)
  { studentId: 1, subject: 'Mathematics', examName: 'Unit Test 1', marksObtained: 78, maxMarks: 100, examDate: '2026-11-05', remarks: 'Good grasp of linear equations; needs revision in geometry theorems.' },
  { studentId: 1, subject: 'Science', examName: 'Unit Test 1', marksObtained: 82, maxMarks: 100, examDate: '2026-11-06', remarks: 'Exceptional performance in photosynthesis experiment diagrams.' },
  { studentId: 1, subject: 'English', examName: 'Unit Test 1', marksObtained: 74, maxMarks: 100, examDate: '2026-11-07', remarks: 'Active classroom participator; practice essay paragraph structuring.' },

  // Rohan Pawar (id: 2)
  { studentId: 2, subject: 'Mathematics', examName: 'Unit Test 1', marksObtained: 32, maxMarks: 100, examDate: '2026-11-05', remarks: 'Needs remedial practice on basic algebraic fractions.' },
  { studentId: 2, subject: 'Science', examName: 'Unit Test 1', marksObtained: 41, maxMarks: 100, examDate: '2026-11-06', remarks: 'Attempted all questions; requires additional lab demonstrations.' },
  { studentId: 2, subject: 'English', examName: 'Unit Test 1', marksObtained: 38, maxMarks: 100, examDate: '2026-11-07', remarks: 'Provide bilingual Marathi-English vocabulary glossary.' },

  // Meena Shinde (id: 3)
  { studentId: 3, subject: 'Mathematics', examName: 'Unit Test 1', marksObtained: 56, maxMarks: 100, examDate: '2026-11-05', remarks: 'Steady effort shown; encourage group problem solving.' },
  { studentId: 3, subject: 'Science', examName: 'Unit Test 1', marksObtained: 62, maxMarks: 100, examDate: '2026-11-06', remarks: 'Good understanding of environmental topics.' },
  { studentId: 3, subject: 'English', examName: 'Unit Test 1', marksObtained: 58, maxMarks: 100, examDate: '2026-11-07', remarks: 'Improving reading fluency week over week.' },

  // Sachin Kamble (id: 4)
  { studentId: 4, subject: 'Mathematics', examName: 'Unit Test 1', marksObtained: 88, maxMarks: 100, examDate: '2026-11-05', remarks: 'Outstanding analytical skills.' },
  { studentId: 4, subject: 'Science', examName: 'Unit Test 1', marksObtained: 90, maxMarks: 100, examDate: '2026-11-06', remarks: 'Top scorer in practical observations.' },
  { studentId: 4, subject: 'English', examName: 'Unit Test 1', marksObtained: 85, maxMarks: 100, examDate: '2026-11-07', remarks: 'Fluent comprehension and creative storytelling.' },

  // Pooja Gaikwad (id: 5)
  { studentId: 5, subject: 'Mathematics', examName: 'Unit Test 1', marksObtained: 35, maxMarks: 100, examDate: '2026-11-05', remarks: 'Requires fundamental arithmetic bridging module.' },
  { studentId: 5, subject: 'Science', examName: 'Unit Test 1', marksObtained: 39, maxMarks: 100, examDate: '2026-11-06', remarks: 'Missed hands-on plant biology lessons due to absence.' },
  { studentId: 5, subject: 'English', examName: 'Unit Test 1', marksObtained: 42, maxMarks: 100, examDate: '2026-11-07', remarks: 'Listening comprehension is strong; working on spelling.' }
];

export const seedInterventions = [
  {
    studentId: 2, // Rohan Pawar
    interventionType: 'parent_contact',
    concern: 'Critical unexcused absence for 4 consecutive school days during harvest season.',
    actionTaken: 'Called father (Suresh Pawar). Explained danger of chronic learning gaps. Agreed on morning study hours before field duties.',
    createdOn: '2026-11-19',
    followUpDate: '2026-11-25',
    status: 'open',
    preAttendancePct: 50,
    postAttendancePct: null,
    attendanceOutcome: 'insufficient_data',
    deltaPct: null
  },
  {
    studentId: 3, // Meena Shinde
    interventionType: 'student_meeting',
    concern: 'Intermittent absences on market days (haat) to manage household chores.',
    actionTaken: 'Held counseling session with student and paired with study buddy Asha Jadhav for shared notes.',
    createdOn: '2026-11-12',
    followUpDate: '2026-11-20',
    status: 'resolved',
    preAttendancePct: 60,
    postAttendancePct: 80,
    attendanceOutcome: 'improved',
    deltaPct: 20
  },
  {
    studentId: 5, // Pooja Gaikwad
    interventionType: 'learning_support',
    concern: 'Low attendance (50%) and struggle with mathematics multiplication tables.',
    actionTaken: 'Issued offline print worksheet booklet and audio flashcard lessons for self-paced study.',
    createdOn: '2026-11-15',
    followUpDate: '2026-11-28',
    status: 'in_progress',
    preAttendancePct: 50,
    postAttendancePct: null,
    attendanceOutcome: 'insufficient_data',
    deltaPct: null
  }
];

export const seedLearningResources = [
  {
    title: 'Mathematics: Class 8 Rational Numbers & Linear Equations',
    subject: 'Mathematics',
    resourceType: 'text',
    description: 'Concise 2-page formula cheat sheet and step-by-step solved examples optimized for offline reading.',
    content: '1. Rational Numbers: Expressible in p/q form (q ≠ 0).\n2. Properties: Closure, Commutativity, Associativity, Distributivity.\n3. Linear Equations: ax + b = c. Transposition method: change signs when crossing the equals sign.',
    downloadSize: '32 KB',
    duration: '15 mins read',
    className: '8'
  },
  {
    title: 'Science Audio Capsule: Cell Structure & Microorganisms (Marathi & English)',
    subject: 'Science',
    resourceType: 'audio',
    description: 'Spoken audio revision explaining plant cell vs animal cell differences with mnemonic analogies.',
    content: 'Audio Lecture: "Namaskar vidyarthi mitranno. Today we explore cell organelles. The cell wall gives rigid shape to plant cells, like stone compound walls in village houses. Chloroplasts are the solar kitchens preparing food using sunlight..."',
    downloadSize: '1.8 MB',
    duration: '4:30 mins',
    className: '8'
  },
  {
    title: 'English Daily Conversation: Village Community & School Dialogues',
    subject: 'English',
    resourceType: 'text',
    description: 'High-frequency English phrases for everyday rural contexts: asking for directions, bus schedules, and greetings.',
    content: 'Dialogue 1: "Excuse me, what time does the bus to Dahiwadi arrive?" -> "It departs at 8:30 AM daily."\nDialogue 2: "May I borrow the science notebook for revision?" -> "Sure, please return it tomorrow morning."',
    downloadSize: '24 KB',
    duration: '10 mins read',
    className: '8'
  },
  {
    title: 'Social Science: Environmental Conservation & Watershed Management',
    subject: 'Social Science',
    resourceType: 'audio',
    description: 'Practical guide to check dams, drip irrigation, and groundwater recharging in semi-arid blocks.',
    content: 'Audio Lecture: "In drought-prone regions, percolation tanks and contour trenches slow rainwater runoff, raising the water table for surrounding wells and borewells..."',
    downloadSize: '2.1 MB',
    duration: '5:15 mins',
    className: '8'
  }
];
