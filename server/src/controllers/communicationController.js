import { Communication } from '../models/Communication.js';
import { Student } from '../models/Student.js';
import { FAMILY_ROLES } from '../config/constants.js';

/**
 * Send a direct communication message to a specific student's guardian.
 * POST /api/communications
 */
export const sendMessage = async (req, res, next) => {
  try {
    const { studentId, title, messageText, category, isUrgent } = req.body;

    if (!studentId || !title || !messageText) {
      return res.status(400).json({
        success: false,
        error: 'Please provide studentId, title, and messageText.'
      });
    }

    const student = await Student.findOne({ numericId: Number(studentId) });
    if (!student) {
      return res.status(404).json({
        success: false,
        error: `Student with Roll ID #${studentId} not found.`
      });
    }

    const comm = await Communication.create({
      studentId: Number(studentId),
      senderTeacherId: req.user._id || req.user.id,
      senderTeacherName: req.user.fullName || 'Class Teacher',
      classLevel: Number(student.className) || 1,
      title: title.trim(),
      messageText: messageText.trim(),
      category: category || 'academic_feedback',
      isUrgent: Boolean(isUrgent),
      readStatus: false,
      readAt: null
    });

    return res.status(201).json({
      success: true,
      message: 'Notice dispatched successfully to parent portal.',
      data: comm
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Broadcast an announcement/notice to all parents of students in an entire class.
 * POST /api/communications/broadcast-class
 */
export const broadcastToClass = async (req, res, next) => {
  try {
    const { classLevel, title, messageText, category, isUrgent } = req.body;

    if (!classLevel || !title || !messageText) {
      return res.status(400).json({
        success: false,
        error: 'Please provide classLevel, title, and messageText.'
      });
    }

    const targetClass = String(classLevel).replace(/class\s*/i, '').trim();
    const students = await Student.find({ className: targetClass });

    if (students.length === 0) {
      return res.status(404).json({
        success: false,
        error: `No active students found in Class ${targetClass}.`
      });
    }

    const noticesToInsert = students.map(st => ({
      studentId: st.numericId,
      senderTeacherId: req.user._id || req.user.id,
      senderTeacherName: req.user.fullName || 'Class Teacher',
      classLevel: Number(targetClass),
      title: title.trim(),
      messageText: messageText.trim(),
      category: category || 'general_notice',
      isUrgent: Boolean(isUrgent),
      readStatus: false,
      readAt: null
    }));

    const inserted = await Communication.insertMany(noticesToInsert);

    return res.status(201).json({
      success: true,
      message: `Broadcast delivered to all ${inserted.length} parent portals of Class ${targetClass}.`,
      count: inserted.length,
      data: inserted
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get communications for a specific student with Zero-Trust Parent/Student privacy enforcement.
 * GET /api/communications/student/:studentId
 */
export const getStudentCommunications = async (req, res, next) => {
  try {
    const requestedStudentId = Number(req.params.studentId);

    // Strict 1-to-1 Privacy Check
    if (FAMILY_ROLES.includes(req.user.role)) {
      if (Number(req.user.studentId) !== requestedStudentId) {
        return res.status(403).json({
          success: false,
          error: 'STUDENT_DATA_PRIVACY_RESTRICTION: You may only view notices dispatched to your linked child.',
          code: 'FORBIDDEN_STUDENT_SCOPE'
        });
      }
    }

    const messages = await Communication.find({ studentId: requestedStudentId })
      .sort({ createdAt: -1 });

    const unreadCount = messages.filter(m => !m.readStatus).length;

    return res.status(200).json({
      success: true,
      count: messages.length,
      unreadCount,
      data: messages
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Mark a communication as read by the parent.
 * PATCH /api/communications/:id/read
 */
export const markAsRead = async (req, res, next) => {
  try {
    const comm = await Communication.findById(req.params.id);
    if (!comm) {
      return res.status(404).json({
        success: false,
        error: 'Communication notice not found.'
      });
    }

    // Privacy check: Parent can only mark their own linked child's messages
    if (FAMILY_ROLES.includes(req.user.role)) {
      if (Number(req.user.studentId) !== Number(comm.studentId)) {
        return res.status(403).json({
          success: false,
          error: 'STUDENT_DATA_PRIVACY_RESTRICTION: Cannot modify another student notice.'
        });
      }
    }

    comm.readStatus = true;
    comm.readAt = new Date();
    await comm.save();

    return res.status(200).json({
      success: true,
      message: 'Notice marked as read.',
      data: comm
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get quick unread count for parent navigation badge.
 * GET /api/communications/unread-count/:studentId
 */
export const getUnreadCount = async (req, res, next) => {
  try {
    const requestedStudentId = Number(req.params.studentId);

    if (FAMILY_ROLES.includes(req.user.role)) {
      if (Number(req.user.studentId) !== requestedStudentId) {
        return res.status(403).json({
          success: false,
          error: 'STUDENT_DATA_PRIVACY_RESTRICTION'
        });
      }
    }

    const count = await Communication.countDocuments({
      studentId: requestedStudentId,
      readStatus: false
    });

    return res.status(200).json({
      success: true,
      unreadCount: count
    });
  } catch (err) {
    next(err);
  }
};
