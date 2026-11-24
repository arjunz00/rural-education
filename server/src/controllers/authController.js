import { User } from '../models/User.js';
import { Student } from '../models/Student.js';
import { Attendance } from '../models/Attendance.js';
import { AcademicRecord } from '../models/AcademicRecord.js';
import { Intervention } from '../models/Intervention.js';
import { LearningResource } from '../models/LearningResource.js';
import { generateToken } from '../middleware/auth.js';
import { FAMILY_ROLES } from '../config/constants.js';
import {
  getSeedUsers,
  seedStudents,
  getSeedAttendance,
  seedAcademicRecords,
  seedInterventions,
  seedLearningResources
} from '../seed/seedData.js';

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
      { role: 'parent', username: 'parent', name: 'Savita Jadhav', designation: 'Parent (Asha Jadhav #1)' },
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
