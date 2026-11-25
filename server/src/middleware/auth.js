import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_key_rural_ed_2026_low_bandwidth';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      username: user.username,
      role: user.role,
      fullName: user.fullName,
      schoolName: user.schoolName,
      studentId: user.studentId ?? null
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
};

export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.startsWith('Bearer ')
      ? authHeader.split(' ')[1]
      : null;

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required. No authorization token provided.',
        code: 'AUTH_TOKEN_MISSING'
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);

    // Verify user still exists and is active
    const user = await User.findById(decoded.id).select('-passwordHash -passwordSalt');
    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        error: 'User account is invalid or deactivated.',
        code: 'USER_INACTIVE'
      });
    }

    if (user.role === 'teacher' && user.approvalStatus === 'pending') {
      return res.status(403).json({
        success: false,
        error: '⏳ Account Pending: Your teacher registration is awaiting verification by Principal Dr. K. Patil.',
        code: 'TEACHER_APPROVAL_PENDING',
        approvalStatus: 'pending'
      });
    }

    req.user = {
      id: user._id.toString(),
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      fullName: user.fullName,
      schoolName: user.schoolName,
      assignedClass: user.assignedClass,
      studentId: user.studentId,
      approvalStatus: user.approvalStatus
    };

    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: 'Session expired. Please log in again.',
        code: 'TOKEN_EXPIRED'
      });
    }
    return res.status(401).json({
      success: false,
      error: 'Invalid authorization token.',
      code: 'TOKEN_INVALID'
    });
  }
};
