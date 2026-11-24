import bcrypt from 'bcryptjs';

export const getSeedUsers = async () => {
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash('password123', salt);

  const users = [
    // 1. Staff Accounts (Dedicated Class Teachers & Administrators)
    {
      username: 'teacher_class1',
      email: 'teacher.class1@zp-dahiwadi.edu.in',
      passwordHash,
      passwordSalt: salt,
      fullName: 'Sunita Gaikwad',
      role: 'teacher',
      assignedClass: '1',
      isClassTeacher: true,
      schoolName: 'Zilla Parishad Primary School, Circle 4',
      studentId: null,
      isActive: true
    },
    {
      username: 'teacher_primary',
      email: 'teacher.primary@zp-dahiwadi.edu.in',
      passwordHash,
      passwordSalt: salt,
      fullName: 'Sunita Gaikwad',
      role: 'teacher',
      assignedClass: '1',
      isClassTeacher: true,
      schoolName: 'Zilla Parishad Primary School, Circle 4',
      studentId: null,
      isActive: true
    },
    {
      username: 'teacher_class3',
      email: 'teacher.class3@zp-dahiwadi.edu.in',
      passwordHash,
      passwordSalt: salt,
      fullName: 'Ramesh Patil',
      role: 'teacher',
      assignedClass: '3',
      isClassTeacher: true,
      schoolName: 'Zilla Parishad Primary School, Circle 4',
      studentId: null,
      isActive: true
    },
    {
      username: 'teacher_class5',
      email: 'teacher.class5@zp-dahiwadi.edu.in',
      passwordHash,
      passwordSalt: salt,
      fullName: 'Vandana Shinde',
      role: 'teacher',
      assignedClass: '5',
      isClassTeacher: true,
      schoolName: 'Zilla Parishad High School, Dahiwadi',
      studentId: null,
      isActive: true
    },
    {
      username: 'teacher',
      email: 'teacher@zp-dahiwadi.edu.in',
      passwordHash,
      passwordSalt: salt,
      fullName: 'S. Deshmukh',
      role: 'teacher',
      assignedClass: '8',
      isClassTeacher: true,
      schoolName: 'Zilla Parishad High School, Dahiwadi',
      studentId: null,
      isActive: true
    },
    {
      username: 'teacher_class8',
      email: 'teacher.class8@zp-dahiwadi.edu.in',
      passwordHash,
      passwordSalt: salt,
      fullName: 'S. Deshmukh',
      role: 'teacher',
      assignedClass: '8',
      isClassTeacher: true,
      schoolName: 'Zilla Parishad High School, Dahiwadi',
      studentId: null,
      isActive: true
    },
    {
      username: 'teacher_class10',
      email: 'teacher.class10@zp-dahiwadi.edu.in',
      passwordHash,
      passwordSalt: salt,
      fullName: 'Anand Kulkarni',
      role: 'teacher',
      assignedClass: '10',
      isClassTeacher: true,
      schoolName: 'Zilla Parishad High School, Dahiwadi',
      studentId: null,
      isActive: true
    },
    {
      username: 'teacher_secondary',
      email: 'teacher.secondary@zp-dahiwadi.edu.in',
      passwordHash,
      passwordSalt: salt,
      fullName: 'Anand Kulkarni',
      role: 'teacher',
      assignedClass: '10',
      isClassTeacher: true,
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
      assignedClass: null,
      isClassTeacher: false,
      schoolName: 'Zilla Parishad School & Jr College, Dahiwadi',
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
      assignedClass: null,
      isClassTeacher: false,
      schoolName: 'Circle 4 Block Education Office',
      studentId: null,
      isActive: true
    }
  ];

  // 2. Individual Parent and Student Accounts for All 25 Cohort Students
  seedStudents.forEach((st) => {
    // Unique Parent User
    users.push({
      username: `parent_${st.numericId}`,
      email: `parent${st.numericId}@circle4.gov.in`,
      passwordHash,
      passwordSalt: salt,
      fullName: st.parentName,
      role: 'parent',
      assignedClass: st.className,
      schoolName: st.schoolName,
      studentId: st.numericId,
      parentContact: st.parentContact,
      isActive: true
    });

    // Unique Student User
    users.push({
      username: `student_${st.numericId}`,
      email: `student${st.numericId}@student.zp.in`,
      passwordHash,
      passwordSalt: salt,
      fullName: st.fullName,
      role: 'student',
      assignedClass: st.className,
      schoolName: st.schoolName,
      studentId: st.numericId,
      isActive: true
    });
  });

  // 3. User Aliases for Seamless Fast Login & Backwards Compatibility
  const aliases = [
    { username: 'parent_asha', aliasTo: 801, fullName: 'Savita Santosh Jadhav', role: 'parent', cls: '8' },
    { username: 'parent', aliasTo: 801, fullName: 'Savita Santosh Jadhav', role: 'parent', cls: '8' },
    { username: 'student_asha', aliasTo: 801, fullName: 'Asha Santosh Jadhav', role: 'student', cls: '8' },
    { username: 'student', aliasTo: 801, fullName: 'Asha Santosh Jadhav', role: 'student', cls: '8' },
    { username: 'parent_rahul', aliasTo: 501, fullName: 'Surekha Suresh Pawar', role: 'parent', cls: '5' },
    { username: 'student_rahul', aliasTo: 501, fullName: 'Rahul Suresh Pawar', role: 'student', cls: '5' },
    { username: 'parent_rohan', aliasTo: 701, fullName: 'Suresh Ramchandra Pawar', role: 'parent', cls: '7' },
    { username: 'student_rohan', aliasTo: 701, fullName: 'Rohan Suresh Pawar', role: 'student', cls: '7' },
    { username: 'parent_aarav', aliasTo: 101, fullName: 'Sunita Ganesh Patil', role: 'parent', cls: '1' },
    { username: 'student_aarav', aliasTo: 101, fullName: 'Aarav Ganesh Patil', role: 'student', cls: '1' },
    { username: 'parent_sachin', aliasTo: 1001, fullName: 'Ramesh Vithal Kadam', role: 'parent', cls: '10' },
    { username: 'student_sachin', aliasTo: 1001, fullName: 'Sachin Ramesh Kadam', role: 'student', cls: '10' },
    { username: 'parent_meena', aliasTo: 901, fullName: 'Kavita Dattatray Shinde', role: 'parent', cls: '9' },
    { username: 'student_meena', aliasTo: 901, fullName: 'Meena Dattatray Shinde', role: 'student', cls: '9' }
  ];

  aliases.forEach(a => {
    users.push({
      username: a.username,
      email: `${a.username}@circle4.gov.in`,
      passwordHash,
      passwordSalt: salt,
      fullName: a.fullName,
      role: a.role,
      assignedClass: a.cls,
      schoolName: 'Zilla Parishad High School, Dahiwadi',
      studentId: a.aliasTo,
      isActive: true
    });
  });

  return users;
};

// 25 Authentic Students Distributed Across Classes 1 to 10
export const seedStudents = [
  // Class 1
  {
    numericId: 101,
    fullName: 'Aarav Ganesh Patil',
    gender: 'M',
    className: '1',
    schoolName: 'Zilla Parishad Primary School, Circle 4',
    parentName: 'Sunita Ganesh Patil',
    parentContact: '+91 98221 44101',
    village: 'Patil Wasti'
  },
  {
    numericId: 102,
    fullName: 'Gauri Tanaji More',
    gender: 'F',
    className: '1',
    schoolName: 'Zilla Parishad Primary School, Circle 4',
    parentName: 'Tanaji Bhiku More',
    parentContact: '+91 98221 44102',
    village: 'Malwadi'
  },

  // Class 2
  {
    numericId: 201,
    fullName: 'Sai Santosh Gaikwad',
    gender: 'M',
    className: '2',
    schoolName: 'Zilla Parishad Primary School, Circle 4',
    parentName: 'Vandana Santosh Gaikwad',
    parentContact: '+91 98221 44201',
    village: 'Gaikwad Wasti'
  },
  {
    numericId: 202,
    fullName: 'Pallavi Dattatray Shinde',
    gender: 'F',
    className: '2',
    schoolName: 'Zilla Parishad Primary School, Circle 4',
    parentName: 'Dattatray Bapu Shinde',
    parentContact: '+91 98221 44202',
    village: 'ZP School Colony'
  },

  // Class 3
  {
    numericId: 301,
    fullName: 'Ananya Suresh Gavit',
    gender: 'F',
    className: '3',
    schoolName: 'Zilla Parishad Primary School, Circle 4',
    parentName: 'Suresh Soma Gavit',
    parentContact: '+91 98221 44301',
    village: 'Dongarwadi (Hilly)'
  },
  {
    numericId: 302,
    fullName: 'Omkar Vilas Chavan',
    gender: 'M',
    className: '3',
    schoolName: 'Zilla Parishad Primary School, Circle 4',
    parentName: 'Sunanda Vilas Chavan',
    parentContact: '+91 98221 44302',
    village: 'Main Village Bazaar'
  },

  // Class 4
  {
    numericId: 401,
    fullName: 'Pranav Ashok Kadam',
    gender: 'M',
    className: '4',
    schoolName: 'Zilla Parishad Primary School, Circle 4',
    parentName: 'Anita Ashok Kadam',
    parentContact: '+91 98221 44401',
    village: 'Kadam Mala'
  },
  {
    numericId: 402,
    fullName: 'Samruddhi Namdev Pawar',
    gender: 'F',
    className: '4',
    schoolName: 'Zilla Parishad Primary School, Circle 4',
    parentName: 'Namdev Ramchandra Pawar',
    parentContact: '+91 98221 44402',
    village: 'Nimbalkar Wasti'
  },

  // Class 5
  {
    numericId: 501,
    fullName: 'Rahul Suresh Pawar',
    gender: 'M',
    className: '5',
    schoolName: 'Zilla Parishad High School, Dahiwadi',
    parentName: 'Surekha Suresh Pawar',
    parentContact: '+91 98502 44501',
    village: 'Pawar Wasti'
  },
  {
    numericId: 502,
    fullName: 'Tanvi Dilip Sonawane',
    gender: 'F',
    className: '5',
    schoolName: 'Zilla Parishad High School, Dahiwadi',
    parentName: 'Dilip Shankar Sonawane',
    parentContact: '+91 98502 44502',
    village: 'Sonawane Galli'
  },
  {
    numericId: 503,
    fullName: 'Aditya Ramesh Jadhav',
    gender: 'M',
    className: '5',
    schoolName: 'Zilla Parishad High School, Dahiwadi',
    parentName: 'Ramesh Kisan Jadhav',
    parentContact: '+91 98502 44503',
    village: 'ZP Primary Cross'
  },

  // Class 6
  {
    numericId: 601,
    fullName: 'Vaibhav Sanjay Bhosale',
    gender: 'M',
    className: '6',
    schoolName: 'Zilla Parishad High School, Dahiwadi',
    parentName: 'Shobha Sanjay Bhosale',
    parentContact: '+91 98502 44601',
    village: 'Bhosale Wasti'
  },
  {
    numericId: 602,
    fullName: 'Snehal Pandurang Raut',
    gender: 'F',
    className: '6',
    schoolName: 'Zilla Parishad High School, Dahiwadi',
    parentName: 'Pandurang Mahadu Raut',
    parentContact: '+91 98502 44602',
    village: 'Riverbank Tola'
  },

  // Class 7
  {
    numericId: 701,
    fullName: 'Rohan Suresh Pawar',
    gender: 'M',
    className: '7',
    schoolName: 'Zilla Parishad High School, Dahiwadi',
    parentName: 'Suresh Ramchandra Pawar',
    parentContact: '+91 98502 44701',
    village: 'Pawar Mala'
  },
  {
    numericId: 702,
    fullName: 'Pooja Chandrakant Thorat',
    gender: 'F',
    className: '7',
    schoolName: 'Zilla Parishad High School, Dahiwadi',
    parentName: 'Rekha Chandrakant Thorat',
    parentContact: '+91 98502 44702',
    village: 'Thorat Wasti'
  },
  {
    numericId: 703,
    fullName: 'Nikhil Baban Kamble',
    gender: 'M',
    className: '7',
    schoolName: 'Zilla Parishad High School, Dahiwadi',
    parentName: 'Baban Tukaram Kamble',
    parentContact: '+91 98502 44703',
    village: 'Samata Nagar'
  },

  // Class 8
  {
    numericId: 801,
    fullName: 'Asha Santosh Jadhav',
    gender: 'F',
    className: '8',
    schoolName: 'Zilla Parishad High School, Dahiwadi',
    parentName: 'Savita Santosh Jadhav',
    parentContact: '+91 98221 44801',
    village: 'Jadhav Wasti'
  },
  {
    numericId: 802,
    fullName: 'Kiran Bhagwan Waghmare',
    gender: 'M',
    className: '8',
    schoolName: 'Zilla Parishad High School, Dahiwadi',
    parentName: 'Bhagwan Sonu Waghmare',
    parentContact: '+91 98221 44802',
    village: 'Waghmare Wasti'
  },
  {
    numericId: 803,
    fullName: 'Shruti Eknath Deshmukh',
    gender: 'F',
    className: '8',
    schoolName: 'Zilla Parishad High School, Dahiwadi',
    parentName: 'Meena Eknath Deshmukh',
    parentContact: '+91 98221 44803',
    village: 'Deshmukh Galli'
  },

  // Class 9
  {
    numericId: 901,
    fullName: 'Meena Dattatray Shinde',
    gender: 'F',
    className: '9',
    schoolName: 'Zilla Parishad High School, Dahiwadi',
    parentName: 'Kavita Dattatray Shinde',
    parentContact: '+91 98221 44901',
    village: 'Shinde Mala'
  },
  {
    numericId: 902,
    fullName: 'Rohit Jaywant Salunkhe',
    gender: 'M',
    className: '9',
    schoolName: 'Zilla Parishad High School, Dahiwadi',
    parentName: 'Jaywant Narayan Salunkhe',
    parentContact: '+91 98221 44902',
    village: 'Salunkhe Wasti'
  },
  {
    numericId: 903,
    fullName: 'Dipali Ashok Jagtap',
    gender: 'F',
    className: '9',
    schoolName: 'Zilla Parishad High School, Dahiwadi',
    parentName: 'Kalpana Ashok Jagtap',
    parentContact: '+91 98221 44903',
    village: 'Station Road'
  },

  // Class 10
  {
    numericId: 1001,
    fullName: 'Sachin Ramesh Kadam',
    gender: 'M',
    className: '10',
    schoolName: 'Zilla Parishad High School, Dahiwadi',
    parentName: 'Ramesh Vithal Kadam',
    parentContact: '+91 98221 41001',
    village: 'Main Temple Road'
  },
  {
    numericId: 1002,
    fullName: 'Rutuja Sunil Shingade',
    gender: 'F',
    className: '10',
    schoolName: 'Zilla Parishad High School, Dahiwadi',
    parentName: 'Sunita Sunil Shingade',
    parentContact: '+91 98221 41002',
    village: 'Shingade Mala'
  },
  {
    numericId: 1003,
    fullName: 'Vishal Hanmant Mane',
    gender: 'M',
    className: '10',
    schoolName: 'Zilla Parishad High School, Dahiwadi',
    parentName: 'Hanmant Laxman Mane',
    parentContact: '+91 98221 41003',
    village: 'Canal Road'
  }
];

// Historical Attendance Generation (18 Official School Days)
export const getSeedAttendance = () => {
  const dates = [
    '2026-10-30', '2026-11-02', '2026-11-03', '2026-11-04', '2026-11-05', '2026-11-06',
    '2026-11-09', '2026-11-10', '2026-11-11', '2026-11-12', '2026-11-13',
    '2026-11-16', '2026-11-17', '2026-11-18', '2026-11-19', '2026-11-20', '2026-11-21', '2026-11-23'
  ];

  // Specific Attendance Patterns (18 values each)
  // 'present', 'absent', 'late'
  const profiles = {
    // Regular High Attendance (>90%)
    regularHigh: [
      'present', 'present', 'present', 'present', 'present', 'late',
      'present', 'present', 'present', 'present', 'present',
      'present', 'present', 'present', 'present', 'present', 'present', 'present'
    ],
    // Good Regular (85-90%)
    goodRegular: [
      'present', 'present', 'present', 'absent', 'present', 'present',
      'present', 'present', 'present', 'present', 'late',
      'present', 'present', 'present', 'present', 'present', 'present', 'present'
    ],
    // Average Steady (75-80%)
    steadyAverage: [
      'present', 'present', 'absent', 'present', 'present', 'present',
      'present', 'absent', 'present', 'late', 'present',
      'present', 'absent', 'present', 'present', 'present', 'late', 'present'
    ],
    // Borderline (65-74%)
    borderline: [
      'present', 'absent', 'present', 'present', 'absent', 'present',
      'present', 'present', 'absent', 'present', 'late',
      'present', 'absent', 'present', 'absent', 'present', 'present', 'present'
    ],
    // At-Risk: Ananya Gavit #301 (58% Transport)
    atRisk301: [
      'present', 'absent', 'absent', 'present', 'late', 'present',
      'absent', 'present', 'absent', 'present', 'absent',
      'present', 'present', 'absent', 'present', 'absent', 'present', 'absent'
    ],
    // High-Risk: Rahul Pawar #501 (44% with 4 consecutive unexcused absences at end)
    highRisk501: [
      'present', 'absent', 'present', 'absent', 'present', 'present',
      'absent', 'present', 'absent', 'present', 'absent',
      'present', 'absent', 'present', 'absent', 'absent', 'absent', 'absent'
    ],
    // High-Risk: Asha Jadhav #801 (44% with 5 consecutive unexcused absences at end)
    highRisk801: [
      'present', 'absent', 'present', 'present', 'absent', 'present',
      'absent', 'present', 'absent', 'present', 'absent',
      'present', 'present', 'absent', 'absent', 'absent', 'absent', 'absent'
    ],
    // High-Risk: Rohit Salunkhe #902 (55% with harvest absences)
    highRisk902: [
      'present', 'absent', 'present', 'present', 'absent', 'absent',
      'present', 'present', 'absent', 'present', 'present',
      'present', 'absent', 'present', 'present', 'absent', 'absent', 'absent'
    ],
    // Declining: Samruddhi Pawar #402 (62%)
    declining402: [
      'present', 'present', 'absent', 'present', 'present', 'absent',
      'present', 'present', 'absent', 'present', 'present',
      'absent', 'present', 'absent', 'present', 'absent', 'present', 'present'
    ],
    // Seasonal Harvest: Nikhil Kamble #703 (61%)
    seasonal703: [
      'present', 'present', 'present', 'present', 'absent', 'absent',
      'absent', 'present', 'present', 'present', 'present',
      'absent', 'absent', 'absent', 'present', 'present', 'present', 'present'
    ]
  };

  const records = [];

  seedStudents.forEach((student) => {
    let pattern = profiles.goodRegular;

    if ([101, 302, 502, 803, 1001, 1002].includes(student.numericId)) {
      pattern = profiles.regularHigh;
    } else if (student.numericId === 301) {
      pattern = profiles.atRisk301;
    } else if (student.numericId === 402) {
      pattern = profiles.declining402;
    } else if (student.numericId === 501) {
      pattern = profiles.highRisk501;
    } else if (student.numericId === 703) {
      pattern = profiles.seasonal703;
    } else if (student.numericId === 801) {
      pattern = profiles.highRisk801;
    } else if (student.numericId === 902) {
      pattern = profiles.highRisk902;
    } else if ([202, 401, 702].includes(student.numericId)) {
      pattern = profiles.steadyAverage;
    } else if ([601, 1003].includes(student.numericId)) {
      pattern = profiles.borderline;
    }

    dates.forEach((d, idx) => {
      const status = pattern[idx] || 'present';
      let notes = '';
      if (status === 'absent') {
        notes = (student.numericId === 501 || student.numericId === 801)
          ? 'Family reported agricultural harvesting duties'
          : student.numericId === 301
          ? 'Rainy road overflow from Dongarwadi'
          : 'Reported family health concern';
      } else if (status === 'late') {
        notes = 'Walked from remote hamlet';
      }

      records.push({
        studentId: student.numericId,
        attendanceDate: d,
        status,
        notes
      });
    });
  });

  return records;
};

// CCE Academic Exam Ledger Records (75+ marks across all 25 students)
export const seedAcademicRecords = [
  // Class 1 (English, Mathematics, EVS)
  { studentId: 101, subject: 'English', examName: 'Unit Test 1', marksObtained: 46, maxMarks: 50, examDate: '2026-11-05', remarks: 'Exceptional letter phonics and animal sound recognition.' },
  { studentId: 101, subject: 'Mathematics', examName: 'Unit Test 1', marksObtained: 48, maxMarks: 50, examDate: '2026-11-06', remarks: 'Accurate single-digit counting with seeds and matchsticks.' },
  { studentId: 101, subject: 'EVS', examName: 'Unit Test 1', marksObtained: 45, maxMarks: 50, examDate: '2026-11-07', remarks: 'Identifies village water and plant parts clearly.' },

  { studentId: 102, subject: 'English', examName: 'Unit Test 1', marksObtained: 42, maxMarks: 50, examDate: '2026-11-05', remarks: 'Good alphabet recognition; practice writing letter curves.' },
  { studentId: 102, subject: 'Mathematics', examName: 'Unit Test 1', marksObtained: 44, maxMarks: 50, examDate: '2026-11-06', remarks: 'Counts up to 20 effortlessly.' },
  { studentId: 102, subject: 'EVS', examName: 'Unit Test 1', marksObtained: 43, maxMarks: 50, examDate: '2026-11-07', remarks: 'Understands basic personal hygiene habits.' },

  // Class 2
  { studentId: 201, subject: 'Mathematics', examName: 'Unit Test 1', marksObtained: 45, maxMarks: 50, examDate: '2026-11-05', remarks: 'Quick mental addition using ten-bundles.' },
  { studentId: 201, subject: 'English', examName: 'Unit Test 1', marksObtained: 40, maxMarks: 50, examDate: '2026-11-06', remarks: 'Recites rhyming poems with good rhythm.' },
  { studentId: 201, subject: 'EVS', examName: 'Unit Test 1', marksObtained: 44, maxMarks: 50, examDate: '2026-11-07', remarks: 'Active knowledge of community helpers.' },

  { studentId: 202, subject: 'Mathematics', examName: 'Unit Test 1', marksObtained: 36, maxMarks: 50, examDate: '2026-11-05', remarks: 'Practice two-digit regrouping.' },
  { studentId: 202, subject: 'English', examName: 'Unit Test 1', marksObtained: 35, maxMarks: 50, examDate: '2026-11-06', remarks: 'Provide picture flashcards for vocabulary building.' },
  { studentId: 202, subject: 'EVS', examName: 'Unit Test 1', marksObtained: 38, maxMarks: 50, examDate: '2026-11-07', remarks: 'Good grasp of domestic animals.' },

  // Class 3
  { studentId: 301, subject: 'Mathematics', examName: 'Unit Test 1', marksObtained: 34, maxMarks: 100, examDate: '2026-11-05', remarks: 'Struggles with carrying in 2-digit subtraction. Assigned remedial support.' },
  { studentId: 301, subject: 'EVS', examName: 'Unit Test 1', marksObtained: 52, maxMarks: 100, examDate: '2026-11-06', remarks: 'Understands clean water sources; needs help writing answers.' },
  { studentId: 301, subject: 'English', examName: 'Unit Test 1', marksObtained: 48, maxMarks: 100, examDate: '2026-11-07', remarks: 'Needs daily spoken pronunciation support.' },

  { studentId: 302, subject: 'Mathematics', examName: 'Unit Test 1', marksObtained: 94, maxMarks: 100, examDate: '2026-11-05', remarks: 'Flawless mental arithmetic calculations.' },
  { studentId: 302, subject: 'EVS', examName: 'Unit Test 1', marksObtained: 90, maxMarks: 100, examDate: '2026-11-06', remarks: 'Excellent understanding of village ecosystem.' },
  { studentId: 302, subject: 'English', examName: 'Unit Test 1', marksObtained: 85, maxMarks: 100, examDate: '2026-11-07', remarks: 'Reads short stories fluently.' },

  // Class 4
  { studentId: 401, subject: 'Mathematics', examName: 'Unit Test 1', marksObtained: 78, maxMarks: 100, examDate: '2026-11-05', remarks: 'Good multiplication accuracy up to table of 8.' },
  { studentId: 401, subject: 'EVS', examName: 'Unit Test 1', marksObtained: 82, maxMarks: 100, examDate: '2026-11-06', remarks: 'Accurate compass direction drawing.' },
  { studentId: 401, subject: 'English', examName: 'Unit Test 1', marksObtained: 75, maxMarks: 100, examDate: '2026-11-07', remarks: 'Neat handwriting; continues steady improvement.' },

  { studentId: 402, subject: 'Mathematics', examName: 'Unit Test 1', marksObtained: 52, maxMarks: 100, examDate: '2026-11-05', remarks: 'Struggles with 2-digit multiplication. Needs rhythmic table drills.' },
  { studentId: 402, subject: 'EVS', examName: 'Unit Test 1', marksObtained: 65, maxMarks: 100, examDate: '2026-11-06', remarks: 'Good oral responses; encourage written revision.' },
  { studentId: 402, subject: 'English', examName: 'Unit Test 1', marksObtained: 58, maxMarks: 100, examDate: '2026-11-07', remarks: 'Needs sentence formation practice.' },

  // Class 5 (English, Mathematics, General Science, Marathi)
  { studentId: 501, subject: 'Mathematics', examName: 'Unit Test 1', marksObtained: 30, maxMarks: 100, examDate: '2026-11-05', remarks: 'Severe difficulty in basic fractions and division. Assigned Remedial Math Quiz.' },
  { studentId: 501, subject: 'Science', examName: 'Unit Test 1', marksObtained: 42, maxMarks: 100, examDate: '2026-11-06', remarks: 'Basic knowledge of plant parts; struggled with photosynthesis.' },
  { studentId: 501, subject: 'English', examName: 'Unit Test 1', marksObtained: 50, maxMarks: 100, examDate: '2026-11-07', remarks: 'Improving word vocabulary.' },
  { studentId: 501, subject: 'Marathi', examName: 'Unit Test 1', marksObtained: 56, maxMarks: 100, examDate: '2026-11-08', remarks: 'Adequate handwriting and grammar.' },

  { studentId: 502, subject: 'Mathematics', examName: 'Unit Test 1', marksObtained: 96, maxMarks: 100, examDate: '2026-11-05', remarks: 'Outstanding problem-solving logic.' },
  { studentId: 502, subject: 'Science', examName: 'Unit Test 1', marksObtained: 94, maxMarks: 100, examDate: '2026-11-06', remarks: 'Detailed seed germination diagrams and explanations.' },
  { studentId: 502, subject: 'English', examName: 'Unit Test 1', marksObtained: 90, maxMarks: 100, examDate: '2026-11-07', remarks: 'Clear and fluent active storytelling.' },
  { studentId: 502, subject: 'Marathi', examName: 'Unit Test 1', marksObtained: 92, maxMarks: 100, examDate: '2026-11-08', remarks: 'Excellent creative writing.' },

  { studentId: 503, subject: 'Mathematics', examName: 'Unit Test 1', marksObtained: 84, maxMarks: 100, examDate: '2026-11-05', remarks: 'Consistent accuracy across word problems.' },
  { studentId: 503, subject: 'Science', examName: 'Unit Test 1', marksObtained: 80, maxMarks: 100, examDate: '2026-11-06', remarks: 'Good scientific curiosity.' },
  { studentId: 503, subject: 'English', examName: 'Unit Test 1', marksObtained: 78, maxMarks: 100, examDate: '2026-11-07', remarks: 'Solid reading comprehension.' },
  { studentId: 503, subject: 'Marathi', examName: 'Unit Test 1', marksObtained: 82, maxMarks: 100, examDate: '2026-11-08', remarks: 'Good poem appreciation.' },

  // Class 6
  { studentId: 601, subject: 'Mathematics', examName: 'Unit Test 1', marksObtained: 54, maxMarks: 100, examDate: '2026-11-05', remarks: 'Needs remedial practice on fractions and decimals.' },
  { studentId: 601, subject: 'Science', examName: 'Unit Test 1', marksObtained: 68, maxMarks: 100, examDate: '2026-11-06', remarks: 'Fair grasp of planetary rotations.' },
  { studentId: 601, subject: 'English', examName: 'Unit Test 1', marksObtained: 62, maxMarks: 100, examDate: '2026-11-07', remarks: 'Work on past tense verbs.' },
  { studentId: 601, subject: 'Marathi', examName: 'Unit Test 1', marksObtained: 72, maxMarks: 100, examDate: '2026-11-08', remarks: 'Good essay on village water harvesting.' },

  { studentId: 602, subject: 'Mathematics', examName: 'Unit Test 1', marksObtained: 86, maxMarks: 100, examDate: '2026-11-05', remarks: 'Good arithmetic speed.' },
  { studentId: 602, subject: 'Science', examName: 'Unit Test 1', marksObtained: 88, maxMarks: 100, examDate: '2026-11-06', remarks: 'Strong astronomy grasp.' },
  { studentId: 602, subject: 'English', examName: 'Unit Test 1', marksObtained: 84, maxMarks: 100, examDate: '2026-11-07', remarks: 'Fluent reading.' },
  { studentId: 602, subject: 'Marathi', examName: 'Unit Test 1', marksObtained: 90, maxMarks: 100, examDate: '2026-11-08', remarks: 'Exceptional Marathi essay writing.' },

  // Class 7
  { studentId: 701, subject: 'Mathematics', examName: 'Unit Test 1', marksObtained: 90, maxMarks: 100, examDate: '2026-11-05', remarks: 'Strong arithmetic and fraction computation.' },
  { studentId: 701, subject: 'Science', examName: 'Unit Test 1', marksObtained: 88, maxMarks: 100, examDate: '2026-11-06', remarks: 'Good knowledge of autotrophic nutrition.' },
  { studentId: 701, subject: 'English', examName: 'Unit Test 1', marksObtained: 82, maxMarks: 100, examDate: '2026-11-07', remarks: 'Clear oral recitation.' },
  { studentId: 701, subject: 'Marathi', examName: 'Unit Test 1', marksObtained: 86, maxMarks: 100, examDate: '2026-11-08', remarks: 'Accurate spelling.' },

  { studentId: 702, subject: 'Mathematics', examName: 'Unit Test 1', marksObtained: 76, maxMarks: 100, examDate: '2026-11-05', remarks: 'Steady work in integer addition.' },
  { studentId: 702, subject: 'Science', examName: 'Unit Test 1', marksObtained: 80, maxMarks: 100, examDate: '2026-11-06', remarks: 'Good lab notebook maintenance.' },
  { studentId: 702, subject: 'English', examName: 'Unit Test 1', marksObtained: 74, maxMarks: 100, examDate: '2026-11-07', remarks: 'Grammar exercises completed.' },
  { studentId: 702, subject: 'Marathi', examName: 'Unit Test 1', marksObtained: 82, maxMarks: 100, examDate: '2026-11-08', remarks: 'Good prose analysis.' },

  { studentId: 703, subject: 'Mathematics', examName: 'Unit Test 1', marksObtained: 55, maxMarks: 100, examDate: '2026-11-05', remarks: 'Needs revision in algebraic variables.' },
  { studentId: 703, subject: 'Science', examName: 'Unit Test 1', marksObtained: 58, maxMarks: 100, examDate: '2026-11-06', remarks: 'Review heat conduction principles.' },
  { studentId: 703, subject: 'English', examName: 'Unit Test 1', marksObtained: 52, maxMarks: 100, examDate: '2026-11-07', remarks: 'Needs support in English verb conjugation.' },
  { studentId: 703, subject: 'Marathi', examName: 'Unit Test 1', marksObtained: 68, maxMarks: 100, examDate: '2026-11-08', remarks: 'Expressive oral answers.' },

  // Class 8 (Mathematics, Science, English, Social Science, Marathi)
  { studentId: 801, subject: 'Mathematics', examName: 'Unit Test 1', marksObtained: 32, maxMarks: 100, examDate: '2026-11-05', remarks: 'Transposition errors in linear equations. Assigned Remedial Linear Equations Practice Quiz.' },
  { studentId: 801, subject: 'Science', examName: 'Unit Test 1', marksObtained: 66, maxMarks: 100, examDate: '2026-11-06', remarks: 'Good biological diagramming; needs work on force calculations.' },
  { studentId: 801, subject: 'English', examName: 'Unit Test 1', marksObtained: 70, maxMarks: 100, examDate: '2026-11-07', remarks: 'Active classroom participator; practice narrative writing.' },
  { studentId: 801, subject: 'Social Science', examName: 'Unit Test 1', marksObtained: 74, maxMarks: 100, examDate: '2026-11-08', remarks: 'Good understanding of local history.' },
  { studentId: 801, subject: 'Marathi', examName: 'Unit Test 1', marksObtained: 78, maxMarks: 100, examDate: '2026-11-09', remarks: 'Thoughtful comprehension answers.' },

  { studentId: 802, subject: 'Mathematics', examName: 'Unit Test 1', marksObtained: 85, maxMarks: 100, examDate: '2026-11-05', remarks: 'Solves algebraic equations with high accuracy.' },
  { studentId: 802, subject: 'Science', examName: 'Unit Test 1', marksObtained: 82, maxMarks: 100, examDate: '2026-11-06', remarks: 'Clear understanding of force and pressure.' },
  { studentId: 802, subject: 'English', examName: 'Unit Test 1', marksObtained: 80, maxMarks: 100, examDate: '2026-11-07', remarks: 'Fluent reading and comprehension.' },
  { studentId: 802, subject: 'Social Science', examName: 'Unit Test 1', marksObtained: 86, maxMarks: 100, examDate: '2026-11-08', remarks: 'Detailed civics answers.' },
  { studentId: 802, subject: 'Marathi', examName: 'Unit Test 1', marksObtained: 88, maxMarks: 100, examDate: '2026-11-09', remarks: 'Well-structured essays.' },

  { studentId: 803, subject: 'Mathematics', examName: 'Unit Test 1', marksObtained: 94, maxMarks: 100, examDate: '2026-11-05', remarks: 'Distinction performance; excels in geometry proofs.' },
  { studentId: 803, subject: 'Science', examName: 'Unit Test 1', marksObtained: 91, maxMarks: 100, examDate: '2026-11-06', remarks: 'Outstanding scientific analysis.' },
  { studentId: 803, subject: 'English', examName: 'Unit Test 1', marksObtained: 88, maxMarks: 100, examDate: '2026-11-07', remarks: 'Rich vocabulary and grammar.' },
  { studentId: 803, subject: 'Social Science', examName: 'Unit Test 1', marksObtained: 92, maxMarks: 100, examDate: '2026-11-08', remarks: 'Deep insight into constitutional values.' },
  { studentId: 803, subject: 'Marathi', examName: 'Unit Test 1', marksObtained: 95, maxMarks: 100, examDate: '2026-11-09', remarks: 'Exemplary essay and poetry interpretation.' },

  // Class 9
  { studentId: 901, subject: 'Mathematics', examName: 'Unit Test 1', marksObtained: 82, maxMarks: 100, examDate: '2026-11-05', remarks: 'Consistent performance in polynomials.' },
  { studentId: 901, subject: 'Science', examName: 'Unit Test 1', marksObtained: 85, maxMarks: 100, examDate: '2026-11-06', remarks: 'Strong grasp of Newton\'s laws of motion.' },
  { studentId: 901, subject: 'English', examName: 'Unit Test 1', marksObtained: 80, maxMarks: 100, examDate: '2026-11-07', remarks: 'Clear essay structuring.' },
  { studentId: 901, subject: 'Social Science', examName: 'Unit Test 1', marksObtained: 88, maxMarks: 100, examDate: '2026-11-08', remarks: 'Detailed explanation of Gram Panchayat powers.' },
  { studentId: 901, subject: 'Marathi', examName: 'Unit Test 1', marksObtained: 86, maxMarks: 100, examDate: '2026-11-09', remarks: 'High accuracy in grammar.' },

  { studentId: 902, subject: 'Mathematics', examName: 'Unit Test 1', marksObtained: 36, maxMarks: 100, examDate: '2026-11-05', remarks: 'Needs remedial practice in linear equations and algebra. Attendance drop affecting performance.' },
  { studentId: 902, subject: 'Science', examName: 'Unit Test 1', marksObtained: 58, maxMarks: 100, examDate: '2026-11-06', remarks: 'Fair practical knowledge; review formulas.' },
  { studentId: 902, subject: 'English', examName: 'Unit Test 1', marksObtained: 60, maxMarks: 100, examDate: '2026-11-07', remarks: 'Improve punctuation and tenses.' },
  { studentId: 902, subject: 'Social Science', examName: 'Unit Test 1', marksObtained: 65, maxMarks: 100, examDate: '2026-11-08', remarks: 'Good oral participation.' },
  { studentId: 902, subject: 'Marathi', examName: 'Unit Test 1', marksObtained: 68, maxMarks: 100, examDate: '2026-11-09', remarks: 'Understands literary themes.' },

  { studentId: 903, subject: 'Mathematics', examName: 'Unit Test 1', marksObtained: 88, maxMarks: 100, examDate: '2026-11-05', remarks: 'Good problem-solving speed.' },
  { studentId: 903, subject: 'Science', examName: 'Unit Test 1', marksObtained: 86, maxMarks: 100, examDate: '2026-11-06', remarks: 'Accurate gravitation formulas.' },
  { studentId: 903, subject: 'English', examName: 'Unit Test 1', marksObtained: 84, maxMarks: 100, examDate: '2026-11-07', remarks: 'Strong reading comprehension.' },
  { studentId: 903, subject: 'Social Science', examName: 'Unit Test 1', marksObtained: 90, maxMarks: 100, examDate: '2026-11-08', remarks: 'Top scores in civics.' },
  { studentId: 903, subject: 'Marathi', examName: 'Unit Test 1', marksObtained: 89, maxMarks: 100, examDate: '2026-11-09', remarks: 'Fluent written expression.' },

  // Class 10
  { studentId: 1001, subject: 'Mathematics', examName: 'Unit Test 1', marksObtained: 88, maxMarks: 100, examDate: '2026-11-05', remarks: 'Accurate quadratic discriminant calculations.' },
  { studentId: 1001, subject: 'Science', examName: 'Unit Test 1', marksObtained: 84, maxMarks: 100, examDate: '2026-11-06', remarks: 'Solid chemistry balancing; practice physics ray diagrams.' },
  { studentId: 1001, subject: 'English', examName: 'Unit Test 1', marksObtained: 80, maxMarks: 100, examDate: '2026-11-07', remarks: 'Clear understanding of active/passive transformations.' },
  { studentId: 1001, subject: 'Social Science', examName: 'Unit Test 1', marksObtained: 86, maxMarks: 100, examDate: '2026-11-08', remarks: 'Well-prepared for board exam formats.' },
  { studentId: 1001, subject: 'Marathi', examName: 'Unit Test 1', marksObtained: 85, maxMarks: 100, examDate: '2026-11-09', remarks: 'Neat presentation and syntax.' },

  { studentId: 1002, subject: 'Mathematics', examName: 'Unit Test 1', marksObtained: 96, maxMarks: 100, examDate: '2026-11-05', remarks: 'Class board ranker; perfect precision in AP and quadratics.' },
  { studentId: 1002, subject: 'Science', examName: 'Unit Test 1', marksObtained: 94, maxMarks: 100, examDate: '2026-11-06', remarks: 'Outstanding answers in redox chemistry and genetics.' },
  { studentId: 1002, subject: 'English', examName: 'Unit Test 1', marksObtained: 90, maxMarks: 100, examDate: '2026-11-07', remarks: 'High literary analysis quality.' },
  { studentId: 1002, subject: 'Social Science', examName: 'Unit Test 1', marksObtained: 93, maxMarks: 100, examDate: '2026-11-08', remarks: 'Thorough knowledge of freedom struggle history.' },
  { studentId: 1002, subject: 'Marathi', examName: 'Unit Test 1', marksObtained: 95, maxMarks: 100, examDate: '2026-11-09', remarks: 'Model board paper answers.' },

  { studentId: 1003, subject: 'Mathematics', examName: 'Unit Test 1', marksObtained: 60, maxMarks: 100, examDate: '2026-11-05', remarks: 'Board risk: missed algebra review sessions. Provide formula cards.' },
  { studentId: 1003, subject: 'Science', examName: 'Unit Test 1', marksObtained: 64, maxMarks: 100, examDate: '2026-11-06', remarks: 'Missed practical lab sessions; needs catch-up demonstration.' },
  { studentId: 1003, subject: 'English', examName: 'Unit Test 1', marksObtained: 62, maxMarks: 100, examDate: '2026-11-07', remarks: 'Work on formal letter writing.' },
  { studentId: 1003, subject: 'Social Science', examName: 'Unit Test 1', marksObtained: 70, maxMarks: 100, examDate: '2026-11-08', remarks: 'Good historical recollection.' },
  { studentId: 1003, subject: 'Marathi', examName: 'Unit Test 1', marksObtained: 72, maxMarks: 100, examDate: '2026-11-09', remarks: 'Solid effort shown.' }
];

// Documented Teacher Interventions & Home Outreach Logs (5+ records)
export const seedInterventions = [
  {
    studentId: 801, // Asha Jadhav (Class 8)
    interventionType: 'parent_contact',
    concern: 'Missed 4 consecutive days; family involved in brick-kiln seasonal labor.',
    actionTaken: 'Class Teacher S. Deshmukh conducted home visit to Jadhav Wasti. Guardian Savita Jadhav agreed to prioritize morning attendance; provided offline study packet.',
    createdOn: '2026-11-16',
    followUpDate: '2026-11-25',
    status: 'in_progress',
    preAttendancePct: 50,
    postAttendancePct: null,
    attendanceOutcome: 'insufficient_data',
    deltaPct: null
  },
  {
    studentId: 501, // Rahul Pawar (Class 5)
    interventionType: 'parent_contact',
    concern: 'Severe difficulty in arithmetic multiplication and fractions; consecutive morning absences.',
    actionTaken: 'Parent meeting held with Surekha Pawar; student assigned to 4:00 PM remedial peer group and given audio multiplication table capsule.',
    createdOn: '2026-11-18',
    followUpDate: '2026-11-26',
    status: 'open',
    preAttendancePct: 52,
    postAttendancePct: null,
    attendanceOutcome: 'insufficient_data',
    deltaPct: null
  },
  {
    studentId: 301, // Ananya Gavit (Class 3)
    interventionType: 'learning_support',
    concern: 'Long walking distance from Dongarwadi during rainy mornings causing chronic tardiness.',
    actionTaken: 'Connected guardian Suresh Gavit with village shared bicycle/van initiative organized by School Management Committee (SMC).',
    createdOn: '2026-11-10',
    followUpDate: '2026-11-20',
    status: 'resolved',
    preAttendancePct: 58,
    postAttendancePct: 76,
    attendanceOutcome: 'improved',
    deltaPct: 18
  },
  {
    studentId: 902, // Rohit Salunkhe (Class 9)
    interventionType: 'student_meeting',
    concern: 'Drop in attendance to 55% during village weekly market days and weak algebra scores.',
    actionTaken: 'Teacher Anand Kulkarni conducted counseling on SSC board eligibility requirements and arranged after-school math tutoring.',
    createdOn: '2026-11-15',
    followUpDate: '2026-11-28',
    status: 'in_progress',
    preAttendancePct: 55,
    postAttendancePct: null,
    attendanceOutcome: 'insufficient_data',
    deltaPct: null
  },
  {
    studentId: 402, // Samruddhi Pawar (Class 4)
    interventionType: 'parent_contact',
    concern: 'Missed school to assist with younger toddler care at home during kharif pulse harvest.',
    actionTaken: 'Met mother Anita Kadam and village Anganwadi worker to enroll younger sibling in day care, freeing Samruddhi for full school hours.',
    createdOn: '2026-11-12',
    followUpDate: '2026-11-22',
    status: 'resolved',
    preAttendancePct: 62,
    postAttendancePct: 80,
    attendanceOutcome: 'improved',
    deltaPct: 18
  }
];

// Class-Isolated Curricular Learning Resources (Class 1 to 10)
export const seedLearningResources = [
  // Class 1 Resources
  {
    title: 'Alphabet Phonics & Village Animal Sounds',
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
    title: 'Counting 1 to 20 with Matchsticks',
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
    title: 'Simple Addition Stories',
    subject: 'Mathematics',
    classLevel: 2,
    className: '2',
    resourceType: 'text',
    description: 'Place value basics using matchstick bundle diagrams.',
    content: 'Place Value Concept: 10 loose matchsticks = 1 bundle of ten. 2 bundles = 20. 5 bundles and 4 loose sticks = 54. Practice counting tens and units with village examples.',
    downloadSize: '20 KB',
    duration: '8 min'
  },
  {
    title: 'Clean Habits Rhymes',
    subject: 'English',
    classLevel: 2,
    className: '2',
    resourceType: 'audio',
    description: 'Rhythmic village nursery rhymes with pronunciation clarity.',
    content: 'Audio Rhyme: "Rain on the green grass, rain on the sugarcane field, rain on the school rooftop, but not upon me!" Repeat with cadence.',
    downloadSize: '50 KB',
    duration: '3 min'
  },

  // Class 3 Resources
  {
    title: 'Our Water Sources & Safe Drinking Water',
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
    title: 'Community Helpers in Village Life',
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
    title: 'Multiplication Rhythmic Tables 2 to 10',
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
    title: 'Plant Parts & How Seeds Sprout',
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
    title: 'Fractions & Decimals in the Village Market',
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
    title: 'Nutrition in Plants & Soil Health',
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
    title: 'English Reading Fluency Folk Tale',
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
    title: 'Motion, Force & Bullock Cart Mechanics',
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
    title: 'Gram Panchayat & Village Governance',
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
    title: 'Quadratic Equations Formula Cheat Sheet',
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
    title: 'Acids, Bases & pH Scale in Agriculture',
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
  },

  // 📖 Official Balbharati Digital E-Textbooks (Classes 1 to 10)
  {
    title: 'Balbharati English Reader - Unit 1: Welcome to School & Alphabet',
    subject: 'English',
    classLevel: 1,
    className: '1',
    resourceType: 'textbook',
    authorOrBoard: 'Maharashtra State Bureau of Textbook Production (Balbharati)',
    description: 'Unit 1 digital chapter: Illustrated picture vocabulary, letter traces, and village school welcome.',
    content: 'Unit 1: Welcome to School & Alphabet Fundamentals\n\n1. Look, Listen and Say: Sun, Tree, School, Teacher, Friend, Village Well.\n2. Letter tracing exercises for A, B, C, D with village animal sounds and phonetic rhymes.\n3. Activity: Draw your favourite school game and trace simple animal footprints.\n\nChapter E-Book features high-contrast illustrated reading aids optimized for mobile screens.',
    downloadSize: '145 KB',
    duration: '15 min read',
    fileUrl: '/public/audio/class1_phonics_alphabet.mp3'
  },
  {
    title: 'Our Friends: Animals and Plants - Chapter 4 (EVS)',
    subject: 'EVS',
    classLevel: 3,
    className: '3',
    resourceType: 'textbook',
    authorOrBoard: 'Maharashtra State Bureau of Textbook Production (Balbharati)',
    description: 'EVS Chapter 4: Domestic animals, farm crops, soil care, and clean water wells in rural communities.',
    content: 'Chapter 4: Our Living Environment\n\n1. Farm Animals & Helpers: Bullocks for tilling, cows and buffaloes for nutritious milk, and earthworms that aerate fertile black soil.\n2. Water in the Village: Safe boiling methods, protecting percolation tanks, and avoiding waste dump near drinking borewells.\n3. Conservation Exercise: Plant 1 native neem or banyan sapling during the monsoon season.\n4. Questions: Why should we never wash cattle directly inside drinking water ponds?',
    downloadSize: '160 KB',
    duration: '20 min read'
  },
  {
    title: 'Fractions & Geometrical Shapes - Chapter 6 (Mathematics)',
    subject: 'Mathematics',
    classLevel: 5,
    className: '5',
    resourceType: 'textbook',
    authorOrBoard: 'Maharashtra State Bureau of Textbook Production (Balbharati)',
    description: 'State Board Mathematics Chapter 6: Like/unlike fractions, practical market division, angles, and circles.',
    content: 'Chapter 6: Fractions and Geometry\n\n1. Part of a Whole: If 1 bhakri or chapati is shared equally between 4 children, each receives 1/4.\n2. Equivalent Fractions: 1/2 = 2/4 = 4/8.\n3. Basic Geometric Shapes: Acute, Right, and Obtuse angles using a village clock tower or bullock cart axle.\n4. Practice Problems: Adding fractions with equal denominators (3/7 + 2/7 = 5/7).\n5. Everyday Arithmetic: Calculating half-kilogram and quarter-kilogram jowar prices in the weekly village haat.',
    downloadSize: '185 KB',
    duration: '25 min read'
  },
  {
    title: 'Linear Equations in One Variable - Chapter 2 (Mathematics)',
    subject: 'Mathematics',
    classLevel: 8,
    className: '8',
    resourceType: 'textbook',
    authorOrBoard: 'Maharashtra State Bureau of Textbook Production (Balbharati)',
    description: 'Balbharati Class 8 Chapter 2: Solving linear algebraic equations with real-world village market examples.',
    content: 'Chapter 2: Linear Equations in One Variable\n\n1. Standard Form: ax + b = c (where a ≠ 0).\n2. Transposition Method: Adding or subtracting constants across the equals sign changes their sign.\n3. Word Problem Model: The perimeter of a rectangular farm plot is 54 meters. If the length is 3m more than the breadth, find dimensions.\n4. Step-by-Step Solution: Let breadth = b. Length = b + 3. 2(b + b + 3) = 54 => 4b + 6 = 54 => 4b = 48 => b = 12m, length = 15m.\n5. Summary: Practice checking solutions by substituting values back into original equations.',
    downloadSize: '210 KB',
    duration: '30 min read'
  },
  {
    title: 'Pollution of Air and Water - Chapter 18 (General Science)',
    subject: 'Science',
    classLevel: 8,
    className: '8',
    resourceType: 'textbook',
    authorOrBoard: 'Maharashtra State Bureau of Textbook Production (Balbharati)',
    description: 'Science Chapter 18: Rural air pollutants, crop residue burning alternatives, and safe potable water.',
    content: 'Chapter 18: Environmental Conservation & Pollution\n\n1. Atmospheric Composition and Green House Gases.\n2. Agricultural Residue: Converting sugarcane and cotton stubble into microbial compost instead of open field burning.\n3. Potable Water Purification: Decantation, sand-carbon filter beds, and chlorination tablets for Gram Panchayat water tanks.\n4. Field Project: Test water samples from village handpumps for turbidity and excess hardness.',
    downloadSize: '195 KB',
    duration: '25 min read'
  },
  {
    title: 'Quadratic Equations & Arithmetic Progressions - Chapter 3 & 5',
    subject: 'Mathematics',
    classLevel: 10,
    className: '10',
    resourceType: 'textbook',
    authorOrBoard: 'Maharashtra State Bureau of Textbook Production (Balbharati)',
    description: 'Class 10 SSC Board Chapter 3 & 5: Factorisation method, discriminant formula, and nth term of AP.',
    content: 'Chapters 3 & 5: Board Exam Revision Module\n\n1. Quadratic Equation Standard Form: ax² + bx + c = 0.\n2. Discriminant (Δ = b² - 4ac): If Δ > 0, roots are real and unequal. If Δ = 0, roots are real and equal. If Δ < 0, roots are not real.\n3. Quadratic Formula: x = (-b ± √Δ) / 2a.\n4. Arithmetic Progression: nth term a_n = a + (n - 1)d; Sum S_n = n/2 [2a + (n - 1)d].\n5. Maharashtra State Board High-Yield Practice Problems Included.',
    downloadSize: '240 KB',
    duration: '40 min read'
  },
  {
    title: 'Chemical Reactions & Periodic Classification - Chapter 1 & 5',
    subject: 'Science',
    classLevel: 10,
    className: '10',
    resourceType: 'textbook',
    authorOrBoard: 'Maharashtra State Bureau of Textbook Production (Balbharati)',
    description: 'Class 10 SSC Science Chapter 1 & 5: Balancing chemical equations, redox reactions, and Modern Periodic Table.',
    content: 'Chapters 1 & 5: Core Chemistry Foundations\n\n1. Types of Chemical Reactions: Combination, Decomposition, Displacement, and Double Displacement.\n2. Balancing Equations: Law of Conservation of Mass requires equal atoms on reactant and product sides.\n3. Modern Periodic Law: Properties of elements are periodic functions of their atomic numbers (Henry Moseley).\n4. Trends in Groups & Periods: Atomic radius decreases across a period and increases down a group.\n5. Agricultural Applications: Understanding soil liming and fertilizer chemical reactions.',
    downloadSize: '230 KB',
    duration: '35 min read'
  }
];

// Targeted Remedial Practice Quizzes for Struggling Students
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
    title: 'Remedial Practice: Linear Equations & Negative Numbers Practice',
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
    title: 'Clean Water & Village Sanitation',
    classLevel: 3,
    subject: 'EVS',
    targetCategory: 'remedial_support',
    assignedStudentIds: [301],
    questions: [
      {
        questionText: 'What should we do before drinking water collected from an open village well during the rainy season?',
        options: ['Add sugar', 'Boil and filter the water', 'Leave it in the sun', 'Mix with pond water'],
        correctOptionIndex: 1,
        explanation: 'Boiling water kills disease-causing germs and bacteria, making it safe for drinking.'
      },
      {
        questionText: 'Where should garbage and animal waste be dumped in a rural community?',
        options: ['Near the handpump', 'In a covered compost pit', 'On the open road', 'In the river'],
        correctOptionIndex: 1,
        explanation: 'Covered compost pits turn organic waste into agricultural manure without spreading disease.'
      },
      {
        questionText: 'Why must we wash hands with soap before eating mid-day meals?',
        options: ['To remove invisible germs and dirt', 'To make hands smell sweet', 'To cool our hands', 'Because water is hot'],
        correctOptionIndex: 0,
        explanation: 'Soap removes germs from dirty farm work and playground surfaces, preventing stomach infections.'
      }
    ],
    createdBy: 'Teacher Sunita Gaikwad'
  }
];

// Real-Time Teacher-Parent Communication Feed & Institutional Notices
export const getSeedCommunications = (teacherUserMap = {}) => {
  const teacherDeshmukhId = teacherUserMap['teacher']?._id || teacherUserMap['teacher_class8']?._id;
  const teacherShindeId = teacherUserMap['teacher_class5']?._id;
  const teacherPatilId = teacherUserMap['teacher_class3']?._id;
  const teacherGaikwadId = teacherUserMap['teacher_class1']?._id || teacherUserMap['teacher_primary']?._id;

  return [
    {
      studentId: 801,
      senderTeacherId: teacherDeshmukhId,
      senderTeacherName: 'S. Deshmukh (Class 8 Teacher)',
      classLevel: 8,
      title: '⚠️ 3-Day Attendance Warning & Upcoming Unit Test',
      messageText: 'Namaste Savita ji, Asha has missed 3 morning roll calls this week. Please call me or visit the school tomorrow so we can ensure she does not miss the upcoming Unit Test.',
      category: 'attendance_alert',
      isUrgent: true,
      readStatus: false,
      readAt: null,
      createdAt: new Date('2026-11-23T10:15:00Z')
    },
    {
      studentId: 801,
      senderTeacherId: teacherDeshmukhId,
      senderTeacherName: 'S. Deshmukh (Class 8 Teacher)',
      classLevel: 8,
      title: '🌟 Great Improvement in Folk Tale Pronunciation',
      messageText: 'Asha read the Sahyadri farmer folk tale aloud with great fluency and tone today. Keep encouraging her reading at home!',
      category: 'academic_feedback',
      isUrgent: false,
      readStatus: true,
      readAt: new Date('2026-11-21T16:30:00Z'),
      createdAt: new Date('2026-11-21T15:00:00Z')
    },
    {
      studentId: 501,
      senderTeacherId: teacherShindeId,
      senderTeacherName: 'Vandana Shinde (Class 5 Teacher)',
      classLevel: 5,
      title: '📚 Remedial Math Packet: Basic Fractions & Bhakri Division',
      messageText: 'Surekha ji, please help Rahul complete the 4 bhakri division problems tonight before morning class.',
      category: 'homework',
      isUrgent: false,
      readStatus: false,
      readAt: null,
      createdAt: new Date('2026-11-22T14:20:00Z')
    },
    {
      studentId: 301,
      senderTeacherId: teacherPatilId,
      senderTeacherName: 'Ramesh Patil (Class 3 Teacher)',
      classLevel: 3,
      title: '⚠️ Rainy Stream Warning for Dongarwadi Route',
      messageText: 'School van will wait near the lower bridge today due to overflowing rain stream. Please escort children to the bridge safely.',
      category: 'general_notice',
      isUrgent: true,
      readStatus: false,
      readAt: null,
      createdAt: new Date('2026-11-23T07:45:00Z')
    },
    {
      studentId: 101,
      senderTeacherId: teacherGaikwadId,
      senderTeacherName: 'Sunita Gaikwad (Class 1 Teacher)',
      classLevel: 1,
      title: '🌟 Outstanding Alphabet Letter Recitation',
      messageText: 'Sunita ji, Aarav recited the English phonics sounds beautifully in morning assembly today. Very proud of his dedication!',
      category: 'academic_feedback',
      isUrgent: false,
      readStatus: true,
      readAt: new Date('2026-11-22T12:00:00Z'),
      createdAt: new Date('2026-11-22T11:30:00Z')
    }
  ];
};
