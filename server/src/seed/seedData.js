import bcrypt from 'bcryptjs';

export const getSeedUsers = async () => {
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash('password123', salt);

  return [
    // Staff: Class Teachers
    {
      username: 'teacher',
      email: 'teacher@zp-dahiwadi.edu.in',
      passwordHash,
      passwordSalt: salt,
      fullName: 'S. Deshmukh',
      role: 'teacher',
      assignedClass: '8',
      schoolName: 'Zilla Parishad High School, Dahiwadi',
      studentId: null,
      isActive: true
    },
    {
      username: 'teacher.c2',
      email: 'teacher.c2@zp-dahiwadi.edu.in',
      passwordHash,
      passwordSalt: salt,
      fullName: 'P. Shinde (Primary)',
      role: 'teacher',
      assignedClass: '2',
      schoolName: 'Zilla Parishad High School, Dahiwadi',
      studentId: null,
      isActive: true
    },
    {
      username: 'teacher.c5',
      email: 'teacher.c5@zp-dahiwadi.edu.in',
      passwordHash,
      passwordSalt: salt,
      fullName: 'M. Kulkarni (Primary Wing Head)',
      role: 'teacher',
      assignedClass: '5',
      schoolName: 'Zilla Parishad High School, Dahiwadi',
      studentId: null,
      isActive: true
    },
    {
      username: 'teacher.c10',
      email: 'teacher.c10@zp-dahiwadi.edu.in',
      passwordHash,
      passwordSalt: salt,
      fullName: 'V. Joshi (Secondary Coordinator)',
      role: 'teacher',
      assignedClass: '10',
      schoolName: 'Zilla Parishad High School, Dahiwadi',
      studentId: null,
      isActive: true
    },

    // Staff: Administration
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

    // Class 8 (Middle Wing): Asha Jadhav & Savita Jadhav
    {
      username: 'parent',
      email: 'parent.jadhav@grampanchayat.in',
      passwordHash,
      passwordSalt: salt,
      fullName: 'Savita Jadhav',
      role: 'parent',
      assignedClass: '8',
      schoolName: 'Zilla Parishad High School, Dahiwadi',
      studentId: 1, // Asha Jadhav (Class 8)
      isActive: true
    },
    {
      username: 'student',
      email: 'asha.jadhav@student.zp.in',
      passwordHash,
      passwordSalt: salt,
      fullName: 'Asha Jadhav',
      role: 'student',
      assignedClass: '8',
      schoolName: 'Zilla Parishad High School, Dahiwadi',
      studentId: 1, // Asha Jadhav (Class 8)
      isActive: true
    },

    // Class 2 (Primary Wing): Rahul Pawar & Suresh Pawar
    {
      username: 'parent.c2',
      email: 'suresh.pawar@farmer.in',
      passwordHash,
      passwordSalt: salt,
      fullName: 'Suresh Pawar',
      role: 'parent',
      assignedClass: '2',
      schoolName: 'Zilla Parishad High School, Dahiwadi',
      studentId: 2, // Rahul Pawar (Class 2)
      isActive: true
    },
    {
      username: 'student.c2',
      email: 'rahul.pawar@student.zp.in',
      passwordHash,
      passwordSalt: salt,
      fullName: 'Rahul Pawar',
      role: 'student',
      assignedClass: '2',
      schoolName: 'Zilla Parishad High School, Dahiwadi',
      studentId: 2, // Rahul Pawar (Class 2)
      isActive: true
    },

    // Class 5 (Primary Wing): Ananya More & Sunita More
    {
      username: 'parent.c5',
      email: 'sunita.more@village.in',
      passwordHash,
      passwordSalt: salt,
      fullName: 'Sunita More',
      role: 'parent',
      assignedClass: '5',
      schoolName: 'Zilla Parishad High School, Dahiwadi',
      studentId: 5, // Ananya More (Class 5)
      isActive: true
    },
    {
      username: 'student.c5',
      email: 'ananya.more@student.zp.in',
      passwordHash,
      passwordSalt: salt,
      fullName: 'Ananya More',
      role: 'student',
      assignedClass: '5',
      schoolName: 'Zilla Parishad High School, Dahiwadi',
      studentId: 5, // Ananya More (Class 5)
      isActive: true
    },

    // Class 10 (Secondary Wing): Sachin Kadam & Ramesh Kadam
    {
      username: 'parent.c10',
      email: 'ramesh.kadam@post.in',
      passwordHash,
      passwordSalt: salt,
      fullName: 'Ramesh Kadam',
      role: 'parent',
      assignedClass: '10',
      schoolName: 'Zilla Parishad High School, Dahiwadi',
      studentId: 6, // Sachin Kadam (Class 10)
      isActive: true
    },
    {
      username: 'student.c10',
      email: 'sachin.kadam@student.zp.in',
      passwordHash,
      passwordSalt: salt,
      fullName: 'Sachin Kadam',
      role: 'student',
      assignedClass: '10',
      schoolName: 'Zilla Parishad High School, Dahiwadi',
      studentId: 6, // Sachin Kadam (Class 10)
      isActive: true
    }
  ];
};

export const seedStudents = [
  // Class 8 - Middle Wing
  {
    numericId: 1,
    fullName: 'Asha Jadhav',
    className: '8',
    schoolName: 'Zilla Parishad High School, Dahiwadi',
    parentName: 'Savita Jadhav',
    parentContact: '+91 98221 44521'
  },
  // Class 2 - Primary Wing
  {
    numericId: 2,
    fullName: 'Rahul Pawar',
    className: '2',
    schoolName: 'Zilla Parishad High School, Dahiwadi',
    parentName: 'Suresh Pawar',
    parentContact: '+91 98502 33119'
  },
  // Class 8 - Middle Wing
  {
    numericId: 3,
    fullName: 'Meena Shinde',
    className: '8',
    schoolName: 'Zilla Parishad High School, Dahiwadi',
    parentName: 'Anand Shinde',
    parentContact: '+91 94235 77812'
  },
  // Class 8 - Middle Wing
  {
    numericId: 4,
    fullName: 'Sachin Kamble',
    className: '8',
    schoolName: 'Zilla Parishad High School, Dahiwadi',
    parentName: 'Nitin Kamble',
    parentContact: '+91 97631 88924'
  },
  // Class 5 - Primary Wing
  {
    numericId: 5,
    fullName: 'Ananya More',
    className: '5',
    schoolName: 'Zilla Parishad High School, Dahiwadi',
    parentName: 'Sunita More',
    parentContact: '+91 99210 66345'
  },
  // Class 10 - Secondary Wing
  {
    numericId: 6,
    fullName: 'Sachin Kadam',
    className: '10',
    schoolName: 'Zilla Parishad High School, Dahiwadi',
    parentName: 'Ramesh Kadam',
    parentContact: '+91 98901 22334'
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

  // 1. Asha Jadhav (id: 1, Class 8) - High attendance (9 present, 1 late = 95%)
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

  // 2. Rahul Pawar (id: 2, Class 2) - At-risk primary learner (50% attendance, 4 consecutive absences)
  const rahulStatus = [
    'present', 'present', 'present', 'absent', 'present',
    'present', 'absent', 'absent', 'absent', 'absent'
  ];
  dates.forEach((d, idx) => {
    records.push({
      studentId: 2,
      attendanceDate: d,
      status: rahulStatus[idx],
      notes: rahulStatus[idx] === 'absent' ? 'Family harvest season field assistance' : ''
    });
  });

  // 3. Meena Shinde (id: 3, Class 8) - Medium Risk (7 present, 3 absent = 70%)
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

  // 4. Sachin Kamble (id: 4, Class 8) - Regular / Low Risk
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

  // 5. Ananya More (id: 5, Class 5) - Excellent attendance (10/10)
  const ananyaStatus = [
    'present', 'present', 'present', 'present', 'present',
    'present', 'present', 'present', 'present', 'present'
  ];
  dates.forEach((d, idx) => {
    records.push({
      studentId: 5,
      attendanceDate: d,
      status: ananyaStatus[idx],
      notes: 'Active participant in morning bal sabha'
    });
  });

  // 6. Sachin Kadam (id: 6, Class 10) - High attendance (9 present, 1 absent = 90%)
  const sachin10Status = [
    'present', 'present', 'present', 'present', 'present',
    'present', 'present', 'absent', 'present', 'present'
  ];
  dates.forEach((d, idx) => {
    records.push({
      studentId: 6,
      attendanceDate: d,
      status: sachin10Status[idx],
      notes: sachin10Status[idx] === 'absent' ? 'Preparing for board science practicals' : ''
    });
  });

  return records;
};

export const seedAcademicRecords = [
  // Asha Jadhav (id: 1, Class 8)
  { studentId: 1, subject: 'Mathematics', examName: 'Unit Test 1', marksObtained: 78, maxMarks: 100, examDate: '2026-11-05', remarks: 'Good grasp of linear equations; needs revision in geometry theorems.' },
  { studentId: 1, subject: 'Science', examName: 'Unit Test 1', marksObtained: 82, maxMarks: 100, examDate: '2026-11-06', remarks: 'Exceptional performance in photosynthesis experiment diagrams.' },
  { studentId: 1, subject: 'English', examName: 'Unit Test 1', marksObtained: 74, maxMarks: 100, examDate: '2026-11-07', remarks: 'Active classroom participator; practice essay paragraph structuring.' },

  // Rahul Pawar (id: 2, Class 2)
  { studentId: 2, subject: 'Mathematics', examName: 'Unit Test 1', marksObtained: 45, maxMarks: 50, examDate: '2026-11-05', remarks: 'Can count and group matchstick bundles up to 100 effortlessly.' },
  { studentId: 2, subject: 'English', examName: 'Unit Test 1', marksObtained: 42, maxMarks: 50, examDate: '2026-11-06', remarks: 'Understands animal phonics sounds very well.' },

  // Meena Shinde (id: 3, Class 8)
  { studentId: 3, subject: 'Mathematics', examName: 'Unit Test 1', marksObtained: 56, maxMarks: 100, examDate: '2026-11-05', remarks: 'Steady effort shown; encourage group problem solving.' },
  { studentId: 3, subject: 'Science', examName: 'Unit Test 1', marksObtained: 62, maxMarks: 100, examDate: '2026-11-06', remarks: 'Good understanding of environmental topics.' },
  { studentId: 3, subject: 'English', examName: 'Unit Test 1', marksObtained: 58, maxMarks: 100, examDate: '2026-11-07', remarks: 'Improving reading fluency week over week.' },

  // Ananya More (id: 5, Class 5)
  { studentId: 5, subject: 'Science', examName: 'Unit Test 1', marksObtained: 88, maxMarks: 100, examDate: '2026-11-05', remarks: 'Clear understanding of plant parts and germination.' },
  { studentId: 5, subject: 'Mathematics', examName: 'Unit Test 1', marksObtained: 84, maxMarks: 100, examDate: '2026-11-06', remarks: 'Excellent calculation speed in long division.' },

  // Sachin Kadam (id: 6, Class 10)
  { studentId: 6, subject: 'Mathematics', examName: 'Unit Test 1', marksObtained: 91, maxMarks: 100, examDate: '2026-11-05', remarks: 'Solved quadratic equations with high precision.' },
  { studentId: 6, subject: 'Science', examName: 'Unit Test 1', marksObtained: 86, maxMarks: 100, examDate: '2026-11-06', remarks: 'Accurate balancing of chemical redox reactions.' },
  { studentId: 6, subject: 'English', examName: 'Unit Test 1', marksObtained: 80, maxMarks: 100, examDate: '2026-11-07', remarks: 'Clear mastery of active/passive voice transformation.' }
];

export const seedInterventions = [
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
    studentId: 1, // Asha Jadhav
    interventionType: 'learning_support',
    concern: 'Expressed interest in advanced math geometry Olympiad questions.',
    actionTaken: 'Provided additional state board enrichment worksheet and audio capsule.',
    createdOn: '2026-11-16',
    followUpDate: '2026-11-28',
    status: 'resolved',
    preAttendancePct: 90,
    postAttendancePct: 95,
    attendanceOutcome: 'steady',
    deltaPct: 5
  }
];

// Comprehensive Class 1 to 10 Curriculum-Aligned Learning Resources (14 Authentic Items)
export const seedLearningResources = [
  // 1. Primary - Class 1
  {
    title: 'Alphabet Phonics & Animal Sounds',
    subject: 'English',
    classLevel: '1',
    className: '1',
    resourceType: 'audio',
    description: 'Letter sounds A to Z with familiar village animal calls.',
    content: 'Audio Phonics: A is for Ant (chinti), B is for Bird (pakshi). Hear the cuckoo sing: Koo-koo! C is for Cow (gaay): Mooo! Let us practice letter sounds with our village animal friends.',
    downloadSize: '45 KB',
    duration: '3 min'
  },
  // 2. Primary - Class 2
  {
    title: 'Counting 1 to 100 with Bundles of Ten',
    subject: 'Mathematics',
    classLevel: '2',
    className: '2',
    resourceType: 'text',
    description: 'Place value basics using matchstick bundle diagrams.',
    content: 'Grouping in Tens: 10 loose matchsticks tied together make 1 Ten Bundle. 3 Bundles and 4 loose sticks = 30 + 4 = 34. Practicing place values (Units and Tens) helps in market counting.',
    downloadSize: '18 KB',
    duration: '—'
  },
  // 3. Primary - Class 3
  {
    title: 'Our Village Water Sources & Hygiene',
    subject: 'Environmental Studies',
    classLevel: '3',
    className: '3',
    resourceType: 'text',
    description: 'Wells, handpumps, boiled water safety, and cleanliness.',
    content: 'Clean Water Rules: 1. Keep surroundings of borewells and village handpumps free from stagnant puddles. 2. Always boil or filter drinking water during monsoon. 3. Wash hands before eating meals.',
    downloadSize: '22 KB',
    duration: '—'
  },
  // 4. Primary - Class 4
  {
    title: 'Multiplication Tables & Quick Mental Math',
    subject: 'Mathematics',
    classLevel: '4',
    className: '4',
    resourceType: 'audio',
    description: 'Rhythmic table recitation (2 to 10) with word problems.',
    content: 'Rhythmic Chanting: "Two ones are two, two twos are four..." Fast mental tricks: If one mango costs 4 rupees, how much for 6 mangoes? 4 times 6 is 24 rupees! Sing along every morning.',
    downloadSize: '68 KB',
    duration: '4 min'
  },
  // 5. Primary - Class 5
  {
    title: 'Parts of Plants & How Seeds Grow',
    subject: 'Science',
    classLevel: '5',
    className: '5',
    resourceType: 'text',
    description: 'Roots, stem, photosynthesis simplified, seed germination.',
    content: 'Plant Anatomy & Growth: Roots absorb water and minerals from soil. Stem transports sap to leaves. Leaves act as kitchens, creating green food with sunlight. Seeds need air, water, and soil warmth to germinate.',
    downloadSize: '25 KB',
    duration: '—'
  },
  // 6. Middle - Class 6
  {
    title: 'Fractions & Decimals in Daily Life',
    subject: 'Mathematics',
    classLevel: '6',
    className: '6',
    resourceType: 'text',
    description: 'Market calculation examples, half/quarter shares.',
    content: 'Everyday Fractions: Half bhakri is 1/2. Dividing 1 acre into 4 parts gives 1/4 acre each. Decimals: 50 paise is Rs 0.50. Adding 0.25 kg + 0.75 kg = 1.00 kg. Practical examples for village markets.',
    downloadSize: '28 KB',
    duration: '—'
  },
  // 7. Middle - Class 7
  {
    title: 'Nutrition in Plants & Animals',
    subject: 'Science',
    classLevel: '7',
    className: '7',
    resourceType: 'audio',
    description: 'Autotrophic vs heterotrophic nutrition audio walkthrough.',
    content: 'Audio Lecture: "Namaskar vidyarthi mitranno. Green plants prepare their own food via photosynthesis and are called autotrophs. Animals and humans depend on plants and other animals, hence called heterotrophs..."',
    downloadSize: '72 KB',
    duration: '5 min'
  },
  // 8. Middle - Class 8
  {
    title: 'Reading Fluency & Active Storytelling',
    subject: 'English',
    classLevel: '8',
    className: '8',
    resourceType: 'audio',
    description: 'Folk tale read-aloud with pronunciation cues.',
    content: 'Folk Tale: "Once upon a time in a drought-prone valley, a wise farmer decided to build a rainwater pit..." Listen closely to vowel pronunciations and pause punctuation for storytelling.',
    downloadSize: '85 KB',
    duration: '5 min'
  },
  // 9. Middle - Class 8
  {
    title: 'Linear Equations & Geometry Theorems',
    subject: 'Mathematics',
    classLevel: '8',
    className: '8',
    resourceType: 'text',
    description: 'Step-by-step solved equation templates.',
    content: 'Linear Equations: ax + b = c. Transposition Rule: When moving terms across the equal sign, addition becomes subtraction and multiplication becomes division. Solved Example: 3x + 12 = 27 => 3x = 15 => x = 5.',
    downloadSize: '32 KB',
    duration: '—'
  },
  // 10. Secondary - Class 9
  {
    title: 'Motion, Force & Laws of Gravitation',
    subject: 'Science',
    classLevel: '9',
    className: '9',
    resourceType: 'text',
    description: 'Newton\'s laws simplified with bullock cart examples.',
    content: 'Newtonian Physics Simplified: 1st Law (Inertia): A bullock cart remains stationary until bullocks apply force. 2nd Law (F = ma): Heavier loads require more pulling force. 3rd Law: Action and reaction are equal and opposite.',
    downloadSize: '35 KB',
    duration: '—'
  },
  // 11. Secondary - Class 9
  {
    title: 'Democracy & Village Panchayat Governance',
    subject: 'Social Science',
    classLevel: '9',
    className: '9',
    resourceType: 'audio',
    description: 'Gram Panchayat functions, Gram Sabha powers, citizen rights.',
    content: 'Civics Audio: "The Gram Sabha is the grassroots foundation of Indian democracy. Every registered adult villager is a member. The Gram Panchayat implements developmental schemes, water works, and village roads..."',
    downloadSize: '78 KB',
    duration: '4 min'
  },
  // 12. Secondary - Class 10
  {
    title: 'Quadratic Equations & Arithmetic Progressions',
    subject: 'Mathematics',
    classLevel: '10',
    className: '10',
    resourceType: 'text',
    description: 'Board exam formula sheet and standard step solutions.',
    content: 'Class 10 Board Formulas: Standard Quadratic form: ax^2 + bx + c = 0. Discriminant D = b^2 - 4ac. Roots: x = (-b ± √D) / 2a. Arithmetic Progression (AP): nth term Tn = a + (n-1)d. Sum Sn = n/2 [2a + (n-1)d].',
    downloadSize: '38 KB',
    duration: '—'
  },
  // 13. Secondary - Class 10
  {
    title: 'Chemical Reactions, Acids, Bases & Salts',
    subject: 'Science',
    classLevel: '10',
    className: '10',
    resourceType: 'text',
    description: 'Balancing chemical equations and pH scale in everyday life.',
    content: 'Chemical Equations: Conservation of Mass dictates balancing atoms on LHS and RHS. Acid + Base -> Salt + Water (Neutralization). pH Scale: 7 is neutral (pure water), < 7 is acidic (lemon juice, vinegar), > 7 is basic (limewater).',
    downloadSize: '40 KB',
    duration: '—'
  },
  // 14. Secondary - Class 10
  {
    title: 'Grammar Revision: Tenses & Voice Transformation',
    subject: 'English',
    classLevel: '10',
    className: '10',
    resourceType: 'audio',
    description: 'Conversational rules for active/passive voice with quiz.',
    content: 'Audio Lesson: Active: "The teacher graded the examination papers." Passive: "The examination papers were graded by the teacher." Remember the formula: Object + auxiliary be + past participle (V3) + by + Subject.',
    downloadSize: '90 KB',
    duration: '5 min'
  }
];
