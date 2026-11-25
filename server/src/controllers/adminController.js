import { User } from '../models/User.js';

/**
 * GET /api/admin/pending-teachers
 * Fetch all teacher accounts awaiting institutional approval (Headmaster / Principal only)
 */
export const getPendingTeachers = async (req, res, next) => {
  try {
    const pendingTeachers = await User.find({
      role: 'teacher',
      approvalStatus: 'pending'
    })
      .select('-passwordHash -passwordSalt')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: pendingTeachers.length,
      data: pendingTeachers
    });
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/admin/teachers/:id/approve
 * Principal / Headmaster verifies and activates teacher account
 */
export const approveTeacher = async (req, res, next) => {
  try {
    const teacherId = req.params.id;
    const teacher = await User.findOne({ _id: teacherId, role: 'teacher' });

    if (!teacher) {
      return res.status(404).json({
        success: false,
        error: 'Teacher account not found.'
      });
    }

    teacher.approvalStatus = 'approved';
    teacher.approvedBy = req.user.fullName || 'Principal Dr. K. Patil';
    teacher.approvedAt = new Date();
    teacher.rejectionReason = null;
    await teacher.save();

    return res.status(200).json({
      success: true,
      message: `Teacher ${teacher.fullName} approved & activated for Class ${teacher.assignedClass}.`,
      data: {
        id: teacher._id,
        username: teacher.username,
        fullName: teacher.fullName,
        email: teacher.email,
        assignedClass: teacher.assignedClass,
        approvalStatus: teacher.approvalStatus,
        approvedBy: teacher.approvedBy,
        approvedAt: teacher.approvedAt
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/admin/teachers/:id/reject
 * Principal / Headmaster rejects teacher registration
 */
export const rejectTeacher = async (req, res, next) => {
  try {
    const teacherId = req.params.id;
    const { reason } = req.body;
    const teacher = await User.findOne({ _id: teacherId, role: 'teacher' });

    if (!teacher) {
      return res.status(404).json({
        success: false,
        error: 'Teacher account not found.'
      });
    }

    teacher.approvalStatus = 'rejected';
    teacher.rejectionReason = reason || 'Institutional verification requirements not met.';
    await teacher.save();

    return res.status(200).json({
      success: true,
      message: `Teacher ${teacher.fullName} registration rejected.`,
      data: {
        id: teacher._id,
        username: teacher.username,
        fullName: teacher.fullName,
        email: teacher.email,
        approvalStatus: teacher.approvalStatus,
        rejectionReason: teacher.rejectionReason
      }
    });
  } catch (err) {
    next(err);
  }
};
