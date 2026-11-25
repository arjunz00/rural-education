import mongoose from 'mongoose';
import { Student } from '../models/Student.js';

/**
 * GET /api/teacher/pending-students
 * Fetch pending student registrations scoped to teacher's assigned grade
 */
export const getPendingStudents = async (req, res, next) => {
  try {
    const filter = { enrollmentStatus: 'pending' };

    // If teacher has a designated class, strictly scope to that class
    if (req.user?.role === 'teacher' && req.user?.assignedClass) {
      filter.className = String(req.user.assignedClass);
    }

    const pendingStudents = await Student.find(filter).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: pendingStudents.length,
      classLevel: req.user?.assignedClass || 'All',
      data: pendingStudents
    });
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/teacher/students/:id/approve
 * Class Teacher verifies student identity and formally enrolls child into the class roll call
 */
export const approveStudent = async (req, res, next) => {
  try {
    const studentIdParam = req.params.id;
    let query = {};

    if (mongoose.Types.ObjectId.isValid(studentIdParam)) {
      query = { _id: studentIdParam };
    } else {
      query = { numericId: Number(studentIdParam) };
    }

    const student = await Student.findOne(query);

    if (!student) {
      return res.status(404).json({
        success: false,
        error: 'Student record not found.'
      });
    }

    // Strict Class-Scope Enforcement for Teachers
    if (req.user?.role === 'teacher' && req.user?.assignedClass) {
      const teacherClass = String(req.user.assignedClass);
      if (student.className !== teacherClass) {
        return res.status(403).json({
          success: false,
          error: `Forbidden: As Class ${teacherClass} Teacher, you cannot verify students for Class ${student.className}.`,
          code: 'TEACHER_CLASS_MISMATCH'
        });
      }
    }

    student.enrollmentStatus = 'enrolled';
    student.verifiedByTeacher = req.user.fullName || 'Class Teacher';
    student.verifiedAt = new Date();
    student.rejectionReason = null;
    await student.save();

    return res.status(200).json({
      success: true,
      message: `Student ${student.fullName} (Roll #${student.numericId}) successfully verified & enrolled in Class ${student.className}.`,
      data: student
    });
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/teacher/students/:id/reject
 * Class Teacher rejects invalid student enrollment with reason
 */
export const rejectStudent = async (req, res, next) => {
  try {
    const studentIdParam = req.params.id;
    const { reason } = req.body;
    let query = {};

    if (mongoose.Types.ObjectId.isValid(studentIdParam)) {
      query = { _id: studentIdParam };
    } else {
      query = { numericId: Number(studentIdParam) };
    }

    const student = await Student.findOne(query);

    if (!student) {
      return res.status(404).json({
        success: false,
        error: 'Student record not found.'
      });
    }

    // Strict Class-Scope Enforcement for Teachers
    if (req.user?.role === 'teacher' && req.user?.assignedClass) {
      const teacherClass = String(req.user.assignedClass);
      if (student.className !== teacherClass) {
        return res.status(403).json({
          success: false,
          error: `Forbidden: As Class ${teacherClass} Teacher, you cannot reject students for Class ${student.className}.`,
          code: 'TEACHER_CLASS_MISMATCH'
        });
      }
    }

    student.enrollmentStatus = 'rejected';
    student.rejectionReason = reason || 'Residential/Identity verification unsuccessful.';
    await student.save();

    return res.status(200).json({
      success: true,
      message: `Student ${student.fullName} enrollment marked as rejected.`,
      data: student
    });
  } catch (err) {
    next(err);
  }
};
