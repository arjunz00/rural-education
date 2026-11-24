import { User } from '../models/User.js';
import { Student } from '../models/Student.js';
import { Attendance } from '../models/Attendance.js';
import { AcademicRecord } from '../models/AcademicRecord.js';
import { Intervention } from '../models/Intervention.js';
import { LearningResource } from '../models/LearningResource.js';
import { generateToken } from '../middleware/auth.js';
import { ALL_ROLES, ROLES, FAMILY_ROLES } from '../config/constants.js';
import {
  getSeedUsers,
  seedStudents,
  getSeedAttendance,
  seedAcademicRecords,
  seedInterventions,
  seedLearningResources
} from '../seed/seedData.js';

export const register = async (req, res, next) => {
  try {
    const {
      role,
      fullName,
      username,
      email,
      password,
      schoolName,
      className,
      assignedClass,
      childName,
      parentContact,
      parentName,
      institutionalVerificationKey
    } = req.body;

    // 1. Role validation
    if (!role || !ALL_ROLES.includes(role)) {
      return res.status(400).json({
        success: false,
        error: `Invalid role specified. Must be one of: ${ALL_ROLES.join(', ')}`
      });
    }

    // 2. Common required fields
    if (!fullName || !fullName.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Please provide your full name.'
      });
    }

    if (!username || !username.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Please choose a username.'
      });
    }

    if (!email || !email.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a valid email address.'
      });
    }

    if (!password || password.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 6 characters long.'
      });
    }

    const cleanUsername = username.trim().toLowerCase();
    const cleanEmail = email.trim().toLowerCase();

    // 3. Check for existing username or email
    const existingUser = await User.findOne({
      $or: [{ username: cleanUsername }, { email: cleanEmail }]
    });

    if (existingUser) {
      if (existingUser.username === cleanUsername) {
        return res.status(400).json({
          success: false,
          error: 'Username already registered. Please choose another username.',
          field: 'username'
        });
      }
      return res.status(400).json({
        success: false,
        error: 'Email address already registered. Please use another email or log in.',
        field: 'email'
      });
    }

    const targetSchool = schoolName?.trim() || 'Zilla Parishad High School, Dahiwadi';
    let targetClass = (className || assignedClass || '').toString().replace(/class\s*/i, '').trim();

    // Class level validation helper
    const isValidClass = (cls) => {
      const num = parseInt(cls, 10);
      return !isNaN(num) && num >= 1 && num <= 10;
    };

    let studentId = null;
    let linkedStudent = null;

    // 4. Role-specific validation & Student record provisioning
    if (role === ROLES.TEACHER) {
      if (!targetClass || !isValidClass(targetClass)) {
        return res.status(400).json({
          success: false,
          error: 'Please select a valid assigned class between Class 1 and Class 10.'
        });
      }
    } else if (role === ROLES.PARENT) {
      if (!childName || !childName.trim()) {
        return res.status(400).json({
          success: false,
          error: "Please provide your child's full name."
        });
      }

      if (!targetClass || !isValidClass(targetClass)) {
        return res.status(400).json({
          success: false,
          error: "Please select your child's class between Class 1 and Class 10."
        });
      }

      // Check if student already exists or create new student record
      linkedStudent = await Student.findOne({
        fullName: { $regex: new RegExp(`^${childName.trim()}$`, 'i') },
        className: targetClass
      });

      if (!linkedStudent) {
        const highestStudent = await Student.findOne().sort({ numericId: -1 });
        const nextNumericId = highestStudent ? highestStudent.numericId + 1 : 1;

        linkedStudent = await Student.create({
          numericId: nextNumericId,
          fullName: childName.trim(),
          className: targetClass,
          schoolName: targetSchool,
          parentName: fullName.trim(),
          parentContact: parentContact?.trim() || ''
        });
      }

      studentId = linkedStudent.numericId;
    } else if (role === ROLES.STUDENT) {
      if (!targetClass || !isValidClass(targetClass)) {
        return res.status(400).json({
          success: false,
          error: 'Please select your class between Class 1 and Class 10.'
        });
      }

      const guardian = parentName?.trim() || 'Guardian';
      const highestStudent = await Student.findOne().sort({ numericId: -1 });
      const nextNumericId = highestStudent ? highestStudent.numericId + 1 : 1;

      linkedStudent = await Student.create({
        numericId: nextNumericId,
        fullName: fullName.trim(),
        className: targetClass,
        schoolName: targetSchool,
        parentName: guardian,
        parentContact: parentContact?.trim() || ''
      });

      studentId = linkedStudent.numericId;
    } else if (role === ROLES.HEADMASTER) {
      const expectedKey = process.env.HEADMASTER_VERIFICATION_KEY || 'ZP-EDU-VERIFIED-2026';
      if (institutionalVerificationKey && institutionalVerificationKey.trim() !== expectedKey) {
        return res.status(400).json({
          success: false,
          error: 'Invalid Institutional Verification Key for Headmaster registration. Contact district office.'
        });
      }
    }

    // 5. Hash password
    const { hash: passwordHash, salt: passwordSalt } = await User.hashPassword(password);

    // 6. Create User record
    const user = await User.create({
      username: cleanUsername,
      email: cleanEmail,
      passwordHash,
      passwordSalt,
      fullName: fullName.trim(),
      role,
      schoolName: targetSchool,
      assignedClass: targetClass || null,
      parentContact: parentContact?.trim() || '',
      institutionalVerificationKey: institutionalVerificationKey?.trim() || null,
      studentId: studentId,
      isActive: true
    });

    // 7. Generate JWT session token
    const token = generateToken(user);

    return res.status(201).json({
      success: true,
      message: 'Account registered successfully',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        fullName: user.fullName,
        schoolName: user.schoolName,
        assignedClass: user.assignedClass,
        studentId: user.studentId,
        linkedStudent
      }
    });
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        error: 'Please provide both username and password.'
      });
    }

    const cleanUsername = username.trim().toLowerCase();

    // Support logging in by username or email
    const user = await User.findOne({
      $or: [{ username: cleanUsername }, { email: cleanUsername }]
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid username or password.'
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        error: 'Account is deactivated. Contact district administration.'
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Invalid username or password.'
      });
    }

    const token = generateToken(user);

    // If parent or student, also fetch linked student info
    let linkedStudent = null;
    if (FAMILY_ROLES.includes(user.role) && user.studentId) {
      linkedStudent = await Student.findOne({ numericId: user.studentId });
    }

    return res.status(200).json({
      success: true,
      message: 'Authentication successful',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        fullName: user.fullName,
        schoolName: user.schoolName,
        assignedClass: user.assignedClass,
        studentId: user.studentId,
        linkedStudent
      }
    });
  } catch (err) {
    next(err);
  }
};

export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-passwordHash -passwordSalt');
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found.'
      });
    }

    let linkedStudent = null;
    if (FAMILY_ROLES.includes(user.role) && user.studentId) {
      linkedStudent = await Student.findOne({ numericId: user.studentId });
    }

    return res.status(200).json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        fullName: user.fullName,
        schoolName: user.schoolName,
        assignedClass: user.assignedClass,
        studentId: user.studentId,
        linkedStudent
      }
    });
  } catch (err) {
    next(err);
  }
};

export const logout = async (req, res) => {
  return res.status(200).json({
    success: true,
    message: 'Signed out successfully.'
  });
};

export const getDemoAccounts = async (req, res) => {
  return res.status(200).json({
    success: true,
    accounts: [
      { role: 'teacher', username: 'teacher', name: 'S. Deshmukh', designation: 'Class Teacher (Class 8)' },
      { role: 'headmaster', username: 'headmaster', name: 'Dr. K. Patil', designation: 'Headmaster / Principal' },
      { role: 'admin', username: 'admin', name: 'B. Shinde', designation: 'Block Education Officer' },
      { role: 'parent', username: 'parent', name: 'Savita Jadhav', designation: 'Parent (Asha Jadhav #1, Class 8)' },
      { role: 'student', username: 'student', name: 'Asha Jadhav', designation: 'Student (Class 8, #1)' }
    ]
  });
};

export const seedDemoDatabase = async (req, res, next) => {
  try {
    const userCount = await User.countDocuments();
    if (userCount > 0 && !req.query.force) {
      return res.status(200).json({
        success: true,
        message: `Database already seeded with ${userCount} users. Pass ?force=true to wipe and re-seed.`,
        userCount
      });
    }

    await Promise.all([
      User.deleteMany({}),
      Student.deleteMany({}),
      Attendance.deleteMany({}),
      AcademicRecord.deleteMany({}),
      Intervention.deleteMany({}),
      LearningResource.deleteMany({})
    ]);

    const usersData = await getSeedUsers();
    await User.insertMany(usersData);
    await Student.insertMany(seedStudents);
    await Attendance.insertMany(getSeedAttendance());
    await AcademicRecord.insertMany(seedAcademicRecords);
    await Intervention.insertMany(seedInterventions);
    await LearningResource.insertMany(seedLearningResources);

    return res.status(200).json({
      success: true,
      message: 'Demo accounts and datasets populated successfully!',
      users: ['teacher', 'headmaster', 'admin', 'parent', 'student'],
      defaultPassword: 'password123'
    });
  } catch (err) {
    next(err);
  }
};
