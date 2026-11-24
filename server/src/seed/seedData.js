import bcrypt from 'bcryptjs';

export const getSeedUsers = async () => {
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash('password123', salt);

  return [
    // Staff: Class Teacher
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
      schoolName: 'Dahiwadi Block Education Circle',
      studentId: null,
      isActive: true
    },

    // 1. Class 1: Aarav Patil (Roll #101) & Sunita Patil
    {
      username: 'parent_aarav',
      email: 'sunita.patil@grampanchayat.in',
      passwordHash,
      passwordSalt: salt,
      fullName: 'Sunita Patil',
      role: 'parent',
      assignedClass: '1',
      schoolName: 'Zilla Parishad High School, Dahiwadi',
      studentId: 101,
      isActive: true
    },
    {
      username: 'student_aarav',
      email: 'aarav.patil@student.zp.in',
      passwordHash,
      passwordSalt: salt,
      fullName: 'Aarav Patil',
      role: 'student',
      assignedClass: '1',
      schoolName: 'Zilla Parishad High School, Dahiwadi',
      studentId: 101,
      isActive: true
    },

    // 2. Class 3: Ananya Gavit (Roll #301) & Suman Gavit
    {
      username: 'parent_ananya',
      email: 'suman.gavit@grampanchayat.in',
      passwordHash,
      passwordSalt: salt,
      fullName: 'Suman Gavit',
      role: 'parent',
      assignedClass: '3',
      schoolName: 'Zilla Parishad High School, Dahiwadi',
      studentId: 301,
      isActive: true
    },
    {
      username: 'student_ananya',
      email: 'ananya.gavit@student.zp.in',
      passwordHash,
      passwordSalt: salt,
      fullName: 'Ananya Gavit',
      role: 'student',
      assignedClass: '3',
      schoolName: 'Zilla Parishad High School, Dahiwadi',
      studentId: 301,
      isActive: true
    },

    // 3. Class 5: Rahul Pawar (Roll #501) & Suresh Pawar (Struggling Math, Assigned Quiz)
    {
      username: 'parent_rahul',
      email: 'suresh.pawar5@farmer.in',
      passwordHash,
      passwordSalt: salt,
      fullName: 'Suresh Pawar',
      role: 'parent',
      assignedClass: '5',
      schoolName: 'Zilla Parishad High School, Dahiwadi',
      studentId: 501,
      isActive: true
    },
    {
      username: 'student_rahul',
      email: 'rahul.pawar@student.zp.in',
      passwordHash,
      passwordSalt: salt,
      fullName: 'Rahul Pawar',
      role: 'student',
      assignedClass: '5',
      schoolName: 'Zilla Parishad High School, Dahiwadi',
      studentId: 501,
      isActive: true
    },

    // 4. Class 7: Rohan Pawar (Roll #701) & Suresh Pawar (High Risk, Consecutive Absences)
    {
      username: 'parent_rohan',
      email: 'suresh.pawar7@farmer.in',
      passwordHash,
      passwordSalt: salt,
      fullName: 'Suresh Pawar',
      role: 'parent',
      assignedClass: '7',
      schoolName: 'Zilla Parishad High School, Dahiwadi',
      studentId: 701,
      isActive: true
    },
    {
      username: 'student_rohan',
      email: 'rohan.pawar@student.zp.in',
      passwordHash,
      passwordSalt: salt,
      fullName: 'Rohan Pawar',
      role: 'student',
      assignedClass: '7',
      schoolName: 'Zilla Parishad High School, Dahiwadi',
      studentId: 701,
      isActive: true
    },

    // 5. Class 8: Asha Jadhav (Roll #801) & Savita Jadhav (Remedial Linear Equations Assigned)
    {
      username: 'parent_asha',
      email: 'savita.jadhav@grampanchayat.in',
      passwordHash,
      passwordSalt: salt,
      fullName: 'Savita Jadhav',
      role: 'parent',
      assignedClass: '8',
      schoolName: 'Zilla Parishad High School, Dahiwadi',
      studentId: 801,
      isActive: true
    },
    {
      username: 'student_asha',
      email: 'asha.jadhav@student.zp.in',
      passwordHash,
      passwordSalt: salt,
      fullName: 'Asha Jadhav',
      role: 'student',
      assignedClass: '8',
      schoolName: 'Zilla Parishad High School, Dahiwadi',
      studentId: 801,
      isActive: true
    },
    // Aliases for instant fast sign in and test compatibility
    {
      username: 'parent',
      email: 'parent@circle4.gov.in',
      passwordHash,
      passwordSalt: salt,
      fullName: 'Savita Jadhav',
      role: 'parent',
      assignedClass: '8',
      schoolName: 'Zilla Parishad High School, Dahiwadi',
      studentId: 801,
      isActive: true
    },
    {
      username: 'student',
      email: 'student@circle4.gov.in',
      passwordHash,
      passwordSalt: salt,
      fullName: 'Asha Jadhav',
      role: 'student',
      assignedClass: '8',
      schoolName: 'Zilla Parishad High School, Dahiwadi',
      studentId: 801,
      isActive: true
    },

    // 6. Class 9: Meena Shinde (Roll #901) & Kavita Shinde
    {
      username: 'parent_meena',
      email: 'kavita.shinde@village.in',
      passwordHash,
      passwordSalt: salt,
      fullName: 'Kavita Shinde',
      role: 'parent',
      assignedClass: '9',
      schoolName: 'Zilla Parishad High School, Dahiwadi',
      studentId: 901,
      isActive: true
    },
    {
      username: 'student_meena',
      email: 'meena.shinde@student.zp.in',
      passwordHash,
      passwordSalt: salt,
      fullName: 'Meena Shinde',
      role: 'student',
      assignedClass: '9',
      schoolName: 'Zilla Parishad High School, Dahiwadi',
      studentId: 901,
      isActive: true
    },

    // 7. Class 10: Sachin Kadam (Roll #1001) & Ramesh Kadam
    {
      username: 'parent_sachin',
      email: 'ramesh.kadam@post.in',
      passwordHash,
      passwordSalt: salt,
      fullName: 'Ramesh Kadam',
      role: 'parent',
      assignedClass: '10',
      schoolName: 'Zilla Parishad High School, Dahiwadi',
      studentId: 1001,
      isActive: true
    },
    {
      username: 'student_sachin',
      email: 'sachin.kadam@student.zp.in',
      passwordHash,
      passwordSalt: salt,
      fullName: 'Sachin Kadam',
      role: 'student',
      assignedClass: '10',
      schoolName: 'Zilla Parishad High School, Dahiwadi',
      studentId: 1001,
      isActive: true
    }
  ];
};

export const seedStudents = [
  {
    numericId: 101,
    fullName: 'Aarav Patil',
    className: '1',
    schoolName: 'Zilla Parishad High School, Dahiwadi',
    parentName: 'Sunita Patil',
    parentContact: '+91 98221 11001'
  },
  {
    numericId: 301,
    fullName: 'Ananya Gavit',
    className: '3',
    schoolName: 'Zilla Parishad High School, Dahiwadi',
    parentName: 'Suman Gavit',
    parentContact: '+91 98221 33001'
  },
  {
    numericId: 501,
    fullName: 'Rahul Pawar',
    className: '5',
    schoolName: 'Zilla Parishad High School, Dahiwadi',
    parentName: 'Suresh Pawar',
    parentContact: '+91 98502 55001'
  },
  {
    numericId: 701,
    fullName: 'Rohan Pawar',
    className: '7',
    schoolName: 'Zilla Parishad High School, Dahiwadi',
    parentName: 'Suresh Pawar',
    parentContact: '+91 98502 77001'
  },
  {
    numericId: 801,
    fullName: 'Asha Jadhav',
    className: '8',
    schoolName: 'Zilla Parishad High School, Dahiwadi',
    parentName: 'Savita Jadhav',
    parentContact: '+91 98221 88001'
  },
  {
    numericId: 901,
    fullName: 'Meena Shinde',
    className: '9',
    schoolName: 'Zilla Parishad High School, Dahiwadi',
    parentName: 'Kavita Shinde',
    parentContact: '+91 98221 99001'
  },
  {
    numericId: 1001,
    fullName: 'Sachin Kadam',
    className: '10',
    schoolName: 'Zilla Parishad High School, Dahiwadi',
    parentName: 'Ramesh Kadam',
    parentContact: '+91 98221 10001'
  }
];

export const getSeedAttendance = () => {
  const dates = [
    '2026-11-10', '2026-11-11', '2026-11-12', '2026-11-13', '2026-11-14',
    '2026-11-17', '2026-11-18', '2026-11-19', '2026-11-20', '2026-11-21'
  ];

  const records = [];

  // 1. Aarav Patil (Roll #101, Class 1) - 90% attendance
  const aaravStatus = ['present', 'present', 'present', 'present', 'late', 'present', 'present', 'present', 'present', 'present'];
  dates.forEach((d, idx) => {
    records.push({
      studentId: 101,
      attendanceDate: d,
      status: aaravStatus[idx],
      notes: aaravStatus[idx] === 'late' ? 'Walked from wadi with elder sibling' : ''
    });
  });

  // 2. Ananya Gavit (Roll #301, Class 3) - 85% attendance
  const ananyaStatus = ['present', 'present', 'present', 'present', 'present', 'present', 'absent', 'present', 'present', 'present'];
  dates.forEach((d, idx) => {
    records.push({
      studentId: 301,
      attendanceDate: d,
      status: ananyaStatus[idx],
      notes: ananyaStatus[idx] === 'absent' ? 'Mild seasonal fever' : ''
    });
  });

  // 3. Rahul Pawar (Roll #501, Class 5) - Struggling math (70% attendance)
  const rahulStatus = ['present', 'present', 'absent', 'present', 'present', 'absent', 'present', 'present', 'absent', 'present'];
  dates.forEach((d, idx) => {
    records.push({
      studentId: 501,
      attendanceDate: d,
      status: rahulStatus[idx],
      notes: rahulStatus[idx] === 'absent' ? 'Family market day errand' : ''
    });
  });

  // 4. Rohan Pawar (Roll #701, Class 7) - High Risk / Critical Alert (4 consecutive absences at end: 50%)
  const rohanStatus = ['present', 'present', 'present', 'absent', 'present', 'present', 'absent', 'absent', 'absent', 'absent'];
  dates.forEach((d, idx) => {
    records.push({
      studentId: 701,
      attendanceDate: d,
      status: rohanStatus[idx],
      notes: rohanStatus[idx] === 'absent' ? 'Family harvest season field assistance' : ''
    });
  });

  // 5. Asha Jadhav (Roll #801, Class 8) - Dropping trend (50% attendance)
  const ashaStatus = ['present', 'present', 'present', 'present', 'absent', 'absent', 'present', 'absent', 'absent', 'absent'];
  dates.forEach((d, idx) => {
    records.push({
      studentId: 801,
      attendanceDate: d,
      status: ashaStatus[idx],
      notes: ashaStatus[idx] === 'absent' ? 'Bus missed due to village road repair' : ''
    });
  });

  // 6. Meena Shinde (Roll #901, Class 9) - 90% attendance
  const meenaStatus = ['present', 'present', 'present', 'present', 'present', 'late', 'present', 'present', 'present', 'present'];
  dates.forEach((d, idx) => {
    records.push({
      studentId: 901,
      attendanceDate: d,
      status: meenaStatus[idx],
      notes: ''
    });
  });

  // 7. Sachin Kadam (Roll #1001, Class 10) - 100% attendance
  dates.forEach((d) => {
    records.push({
      studentId: 1001,
      attendanceDate: d,
      status: 'present',
      notes: 'Dedicated board preparation attendee'
    });
  });

  return records;
};

export const seedAcademicRecords = [
  // Aarav Patil (Roll #101, Class 1)
  { studentId: 101, subject: 'English', examName: 'Unit Test 1', marksObtained: 46, maxMarks: 50, examDate: '2026-11-05', remarks: 'Understands animal phonics sounds.' },
  { studentId: 101, subject: 'Mathematics', examName: 'Unit Test 1', marksObtained: 44, maxMarks: 50, examDate: '2026-11-06', remarks: 'Good object counting.' },

  // Ananya Gavit (Roll #301, Class 3)
  { studentId: 301, subject: 'EVS', examName: 'Unit Test 1', marksObtained: 82, maxMarks: 100, examDate: '2026-11-05', remarks: 'Clear understanding of water cleanliness.' },
  { studentId: 301, subject: 'Mathematics', examName: 'Unit Test 1', marksObtained: 76, maxMarks: 100, examDate: '2026-11-06', remarks: 'Addition and subtraction fluent.' },

  // Rahul Pawar (Roll #501, Class 5) - Struggling in fractions
  { studentId: 501, subject: 'Mathematics', examName: 'Unit Test 1', marksObtained: 32, maxMarks: 100, examDate: '2026-11-05', remarks: 'Struggling with fractions & division. Remedial quiz assigned.' },
  { studentId: 501, subject: 'Science', examName: 'Unit Test 1', marksObtained: 42, maxMarks: 100, examDate: '2026-11-06', remarks: 'Needs revision of photosynthesis and plant structures.' },

  // Rohan Pawar (Roll #701, Class 7) - Critical risk
  { studentId: 701, subject: 'Mathematics', examName: 'Unit Test 1', marksObtained: 34, maxMarks: 100, examDate: '2026-11-05', remarks: 'Needs remedial assistance in algebraic variables.' },
  { studentId: 701, subject: 'Science', examName: 'Unit Test 1', marksObtained: 38, maxMarks: 100, examDate: '2026-11-06', remarks: 'Struggling with plant nutrition terms. Assigned remedial quiz.' },

  // Asha Jadhav (Roll #801, Class 8) - Dropping trend
  { studentId: 801, subject: 'Mathematics', examName: 'Unit Test 1', marksObtained: 35, maxMarks: 100, examDate: '2026-11-05', remarks: 'Linear equations transposition confusion. Assigned practice quiz.' },
  { studentId: 801, subject: 'Science', examName: 'Unit Test 1', marksObtained: 68, maxMarks: 100, examDate: '2026-11-06', remarks: 'Good scientific diagramming.' },
  { studentId: 801, subject: 'English', examName: 'Unit Test 1', marksObtained: 72, maxMarks: 100, examDate: '2026-11-07', remarks: 'Active reader; improving spelling.' },

  // Meena Shinde (Roll #901, Class 9)
  { studentId: 901, subject: 'Science', examName: 'Unit Test 1', marksObtained: 81, maxMarks: 100, examDate: '2026-11-05', remarks: 'Good physics conceptual grasp.' },
  { studentId: 901, subject: 'Social Science', examName: 'Unit Test 1', marksObtained: 85, maxMarks: 100, examDate: '2026-11-06', remarks: 'Excellent understanding of Gram Panchayat governance.' },

  // Sachin Kadam (Roll #1001, Class 10)
  { studentId: 1001, subject: 'Mathematics', examName: 'Unit Test 1', marksObtained: 92, maxMarks: 100, examDate: '2026-11-05', remarks: 'Solves quadratic formulas accurately.' },
  { studentId: 1001, subject: 'Science', examName: 'Unit Test 1', marksObtained: 88, maxMarks: 100, examDate: '2026-11-06', remarks: 'Solid chemistry balancing skills.' }
];

export const seedInterventions = [
  {
    studentId: 701, // Rohan Pawar
    interventionType: 'parent_contact',
    concern: 'Critical unexcused absence for 4 consecutive school days during harvest season.',
    actionTaken: 'Called father Suresh Pawar. Agreed on morning study hours before field duties.',
    createdOn: '2026-11-19',
    followUpDate: '2026-11-25',
    status: 'open',
    preAttendancePct: 50,
    postAttendancePct: null,
    attendanceOutcome: 'insufficient_data',
    deltaPct: null
  },
  {
    studentId: 801, // Asha Jadhav
    interventionType: 'learning_support',
    concern: 'Struggling with linear equations & missed buses leading to 50% attendance.',
    actionTaken: 'Assigned Remedial Linear Equations Practice Quiz & connected with peer buddy.',
    createdOn: '2026-11-18',
    followUpDate: '2026-11-26',
    status: 'in_progress',
    preAttendancePct: 50,
    postAttendancePct: null,
    attendanceOutcome: 'insufficient_data',
    deltaPct: null
  }
];

export const seedLearningResources = [
  // Class 1 Resources
  {
    title: 'Alphabet Phonics & Animal Sounds',
    subject: 'English',
    classLevel: 1,
    className: '1',
    resourceType: 'audio',
    description: 'Letter sounds A to Z with familiar village animal calls.',
    content: 'Phonics Guide: Letter A sounds like ant, letter B sounds like bullock, letter C sounds like calf. Listen carefully to the audio pronunciation cues and repeat three times.',
    downloadSize: '45 KB',
    duration: '3 min'
  },
  {
    title: 'Counting 1 to 20 with Village Objects',
    subject: 'Mathematics',
    classLevel: 1,
    className: '1',
    resourceType: 'text',
    description: 'Number recognition using mangoes, neem leaves, and pebbles.',
    content: 'Counting Guide: Count 1 neem leaf, 2 stones, 5 mangoes, 10 seeds, and group them into pairs to learn fundamental counting from 1 to 20.',
    downloadSize: '18 KB',
    duration: '5 min'
  },

  // Class 2 Resources
  {
    title: 'Counting 1 to 100 with Bundles of Ten',
    subject: 'Mathematics',
    classLevel: 2,
    className: '2',
    resourceType: 'text',
    description: 'Place value basics using matchstick bundle diagrams.',
    content: 'Place Value Concept: 10 loose matchsticks = 1 bundle of ten. 2 bundles = 20. 5 bundles and 4 loose sticks = 54. Practice counting tens and units.',
    downloadSize: '20 KB',
    duration: '8 min'
  },
  {
    title: 'Basic Rhymes & Picture Reading',
    subject: 'English',
    classLevel: 2,
    className: '2',
    resourceType: 'audio',
    description: 'Rhythmic village nursery rhymes with pronunciation clarity.',
    content: 'Audio Rhyme: "Rain on the green grass, rain on the sugarcane field, rain on the school rooftop, but not upon me!" Repeat with cadence.',
    downloadSize: '48 KB',
    duration: '3 min'
  },

  // Class 3 Resources
  {
    title: 'Our Village Water Sources & Hygiene',
    subject: 'EVS',
    classLevel: 3,
    className: '3',
    resourceType: 'text',
    description: 'Wells, handpumps, boiled water safety, and cleanliness.',
    content: 'Hygiene Packet: Always boil open well water before drinking during monsoon. Wash hands with soap before mid-day meals. Never litter near village community handpumps.',
    downloadSize: '22 KB',
    duration: '6 min'
  },
  {
    title: 'Community Helpers & Village Crafts',
    subject: 'EVS',
    classLevel: 3,
    className: '3',
    resourceType: 'text',
    description: 'Farmers, potters, blacksmiths, and postmen in village life.',
    content: 'Social Studies Summary: Learn how potters shape earthen clay water pitchers (matkas), blacksmiths sharpen plough blades, and postmen deliver village letters.',
    downloadSize: '24 KB',
    duration: '8 min'
  },

  // Class 4 Resources
  {
    title: 'Multiplication Tables & Quick Mental Math',
    subject: 'Mathematics',
    classLevel: 4,
    className: '4',
    resourceType: 'audio',
    description: 'Rhythmic table recitation (2 to 10) with word problems.',
    content: 'Audio Lecture: "2 times 6 is 12, 3 times 7 is 21, 4 times 8 is 32..." Practice doubling and tripling market grocery bills in your head.',
    downloadSize: '68 KB',
    duration: '4 min'
  },
  {
    title: 'Maps, Directions & Village Landmarks',
    subject: 'EVS',
    classLevel: 4,
    className: '4',
    resourceType: 'text',
    description: 'Cardinal directions using sunrise over the eastern hills.',
    content: 'Geography Primer: Face the morning sunrise to locate East. Your back faces West, your left hand points North toward the temple, right hand points South toward the river.',
    downloadSize: '26 KB',
    duration: '8 min'
  },

  // Class 5 Resources
  {
    title: 'Plant Parts & Seed Growth',
    subject: 'Science',
    classLevel: 5,
    className: '5',
    resourceType: 'text',
    description: 'Roots, stem, photosynthesis simplified, seed germination.',
    content: 'Biology Summary: Tap roots vs fibrous roots. Stems conduct water from soil to foliage. Chlorophyll uses sunlight to manufacture plant nutrients. Germination requires air, warmth, and moisture.',
    downloadSize: '25 KB',
    duration: '8 min'
  },
  {
    title: 'Multiplication & Division Word Problems',
    subject: 'Mathematics',
    classLevel: 5,
    className: '5',
    resourceType: 'text',
    description: 'Solving agricultural harvest yields and fair market splits.',
    content: 'Arithmetic Guide: If 1 crate contains 24 pomegranates, how many in 15 crates? 24 x 15 = 360. If 480 seeds are divided equally among 8 crop furrows, 480 / 8 = 60 seeds per furrow.',
    downloadSize: '30 KB',
    duration: '10 min'
  },

  // Class 6 Resources
  {
    title: 'Fractions & Decimals in Daily Life',
    subject: 'Mathematics',
    classLevel: 6,
    className: '6',
    resourceType: 'text',
    description: 'Market calculation examples, half/quarter shares.',
    content: 'Fraction Fundamentals: Proper fractions (3/4), Improper fractions (7/5), and Mixed numbers (1 1/2). Converting 1/4 kg jaggery to decimal gives 0.25 kg. Adding fractions with unlike denominators.',
    downloadSize: '28 KB',
    duration: '10 min'
  },
  {
    title: 'Earth & Solar System Basics',
    subject: 'Science',
    classLevel: 6,
    className: '6',
    resourceType: 'audio',
    description: 'Planetary orbits, day-night cycle, and seasons explained.',
    content: 'Astronomy Audio: "Earth rotates on its axis every 24 hours giving us day and night, and revolves around the Sun in 365.25 days causing the changing seasons..."',
    downloadSize: '65 KB',
    duration: '4 min'
  },

  // Class 7 Resources
  {
    title: 'Nutrition in Plants & Animals',
    subject: 'Science',
    classLevel: 7,
    className: '7',
    resourceType: 'audio',
    description: 'Autotrophic vs heterotrophic nutrition audio walkthrough.',
    content: 'Biology Audio Capsule: "Autotrophs like green jowar crops synthesize food using carbon dioxide, water, and chlorophyll. Animals and humans are heterotrophs depending on plants..."',
    downloadSize: '72 KB',
    duration: '5 min'
  },
  {
    title: 'Heat, Temperature & Village Climate',
    subject: 'Science',
    classLevel: 7,
    className: '7',
    resourceType: 'text',
    description: 'Conduction, convection, radiation, and thermometer usage.',
    content: 'Physics Summary: Heat flows from hotter to cooler bodies. Conduction occurs in metal spoons, convection occurs when boiling river water, radiation occurs from the burning midday sun.',
    downloadSize: '30 KB',
    duration: '8 min'
  },

  // Class 8 Resources
  {
    title: 'Fractions & Linear Equations',
    subject: 'Mathematics',
    classLevel: 8,
    className: '8',
    resourceType: 'text',
    description: 'Step-by-step solved linear equation templates and algebraic terms.',
    content: 'Algebra Guide: ax + b = c. Transposition rule: terms change signs when crossing the equals sign. Example: 3x + 12 = 27 => 3x = 15 => x = 5. Verify by back-substitution.',
    downloadSize: '32 KB',
    duration: '12 min'
  },
  {
    title: 'English Reading Fluency Story',
    subject: 'English',
    classLevel: 8,
    className: '8',
    resourceType: 'audio',
    description: 'Folk tale read-aloud with pronunciation cues and tone pauses.',
    content: 'Audio Folk Tale: "In a drought-prone valley near the Sahyadri hills, an elderly farmer taught the village children how to conserve rainwater..." Listen to vowel enunciation and expressive commas.',
    downloadSize: '85 KB',
    duration: '5 min'
  },

  // Class 9 Resources
  {
    title: 'Motion, Force & Laws of Gravitation',
    subject: 'Science',
    classLevel: 9,
    className: '9',
    resourceType: 'text',
    description: 'Newton\'s three laws simplified with bullock cart examples.',
    content: 'Newtonian Physics: 1st Law (Inertia): A stationary cart requires external force to move. 2nd Law (F = ma): Force is proportional to acceleration. 3rd Law: For every action, an equal and opposite reaction.',
    downloadSize: '35 KB',
    duration: '12 min'
  },
  {
    title: 'Democracy & Village Panchayat Governance',
    subject: 'Social Science',
    classLevel: 9,
    className: '9',
    resourceType: 'audio',
    description: 'Gram Panchayat functions, Gram Sabha powers, citizen rights.',
    content: 'Civics Audio: "The Gram Sabha is the democratic parliament of the village. Every registered voter participates in electing the Sarpanch and approving annual rural development budgets..."',
    downloadSize: '78 KB',
    duration: '4 min'
  },

  // Class 10 Resources
  {
    title: 'Quadratic Equations Formula Sheet',
    subject: 'Mathematics',
    classLevel: 10,
    className: '10',
    resourceType: 'text',
    description: 'Board exam quadratic standard formula and discriminant guide.',
    content: 'Board Exam Formulas: Standard form ax^2 + bx + c = 0. Discriminant D = b^2 - 4ac. If D > 0, two distinct real roots x = (-b ± √D) / 2a. Arithmetic Progression: nth term Tn = a + (n-1)d.',
    downloadSize: '38 KB',
    duration: '15 min'
  },
  {
    title: 'Acids, Bases & Salts Revision',
    subject: 'Science',
    classLevel: 10,
    className: '10',
    resourceType: 'text',
    description: 'Balancing chemical equations and pH scale in everyday life.',
    content: 'Chemistry Revision: Acids turn blue litmus red; bases turn red litmus blue. Neutralization: Acid + Base -> Salt + Water (HCl + NaOH -> NaCl + H2O). Soil pH testing for optimal crop fertility.',
    downloadSize: '40 KB',
    duration: '12 min'
  },
  {
    title: 'English Active & Passive Voice Review',
    subject: 'English',
    classLevel: 10,
    className: '10',
    resourceType: 'audio',
    description: 'Rules for converting active sentences to passive voice with examples.',
    content: 'Grammar Capsule: Active: "The teacher graded the examination papers." Passive: "The examination papers were graded by the teacher." Remember to use past participle form (V3).',
    downloadSize: '90 KB',
    duration: '5 min'
  }
];

export const seedQuizzes = [
  {
    title: 'Remedial Practice: Basic Fractions & Daily Math',
    classLevel: 5,
    subject: 'Mathematics',
    targetCategory: 'remedial_support',
    assignedStudentIds: [501],
    questions: [
      {
        questionText: 'If a bhakri is divided equally among 4 children, what fraction does each child receive?',
        options: ['1/2', '1/4', '3/4', '1/3'],
        correctOptionIndex: 1,
        explanation: 'Dividing 1 whole object into 4 equal shares yields the fraction 1/4 (one-fourth) per child.'
      },
      {
        questionText: 'Which fraction is equivalent to half (1/2) a litre of milk?',
        options: ['2/4 litre', '1/3 litre', '3/8 litre', '2/6 litre'],
        correctOptionIndex: 0,
        explanation: '2/4 simplifies to 1/2 when dividing both numerator and denominator by 2.'
      },
      {
        questionText: 'A farmer spent ₹15 out of ₹60 saved for tractor diesel. What fraction did he spend?',
        options: ['1/5', '1/4', '1/2', '3/10'],
        correctOptionIndex: 1,
        explanation: '15/60 simplifies to 1/4. He spent one-fourth of his diesel savings.'
      }
    ],
    createdBy: 'Teacher S. Deshmukh'
  },
  {
    title: 'Remedial Practice: Solving Linear Equations Step-by-Step',
    classLevel: 8,
    subject: 'Mathematics',
    targetCategory: 'remedial_support',
    assignedStudentIds: [801],
    questions: [
      {
        questionText: 'Solve for x: 3x + 12 = 27',
        options: ['x = 3', 'x = 5', 'x = 7', 'x = 9'],
        correctOptionIndex: 1,
        explanation: 'Subtract 12 from both sides: 3x = 15. Then divide by 3: x = 5.'
      },
      {
        questionText: 'In the equation 5y - 7 = 18, what is the value of y?',
        options: ['y = 4', 'y = 5', 'y = 6', 'y = 3'],
        correctOptionIndex: 1,
        explanation: 'Add 7 to both sides: 5y = 25. Divide by 5: y = 5.'
      },
      {
        questionText: 'If 2x = 16, what is the value of (x + 3)?',
        options: ['8', '11', '14', '19'],
        correctOptionIndex: 1,
        explanation: '2x = 16 gives x = 8. Adding 3 yields 8 + 3 = 11.'
      }
    ],
    createdBy: 'Teacher S. Deshmukh'
  },
  {
    title: 'Remedial Practice: Plant Nutrition & Photosynthesis',
    classLevel: 7,
    subject: 'Science',
    targetCategory: 'remedial_support',
    assignedStudentIds: [701],
    questions: [
      {
        questionText: 'Which green pigment in leaves absorbs solar energy for photosynthesis?',
        options: ['Hemoglobin', 'Chlorophyll', 'Carotene', 'Anthocyanin'],
        correctOptionIndex: 1,
        explanation: 'Chlorophyll is the green pigment in chloroplasts that traps light energy.'
      },
      {
        questionText: 'What gas do crop leaves absorb from the atmosphere during daytime photosynthesis?',
        options: ['Oxygen', 'Carbon Dioxide', 'Nitrogen', 'Methane'],
        correctOptionIndex: 1,
        explanation: 'Leaves absorb Carbon Dioxide (CO2) through stomata to manufacture sugars.'
      },
      {
        questionText: 'What are the main outputs of the photosynthesis chemical reaction?',
        options: ['Glucose and Oxygen', 'Nitrogen and Carbon', 'Water and Salt', 'Lactic Acid'],
        correctOptionIndex: 0,
        explanation: 'Photosynthesis synthesizes glucose energy storage and releases oxygen gas.'
      }
    ],
    createdBy: 'Teacher S. Deshmukh'
  }
];
