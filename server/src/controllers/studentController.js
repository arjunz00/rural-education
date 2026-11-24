import { Student } from '../models/Student.js';
import { FAMILY_ROLES } from '../config/constants.js';

export const getStudents = async (req, res, next) => {
  try {
    const { role, studentId } = req.user;
    const { className, search } = req.query;

    // Strict Privacy: Parent and Student see ONLY their own linked record
    if (FAMILY_ROLES.includes(role)) {
      const student = await Student.findOne({ numericId: studentId });
      return res.status(200).json({
        success: true,
        count: student ? 1 : 0,
        data: student ? [student] : [],
        isScoped: true
      });
    }

    // Staff query
    const filter = {};
    if (className) {
      filter.className = className;
    }
    if (search) {
      filter.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { parentName: { $regex: search, $options: 'i' } }
      ];
    }

    const students = await Student.find(filter).sort({ numericId: 1 });

    return res.status(200).json({
      success: true,
      count: students.length,
      data: students,
      isScoped: false
    });
  } catch (err) {
    next(err);
  }
};

export const getStudentById = async (req, res, next) => {
  try {
    const requestedId = Number(req.params.id);

    // Strict Privacy enforcement
    if (FAMILY_ROLES.includes(req.user.role)) {
      if (requestedId !== Number(req.user.studentId)) {
        return res.status(403).json({
          success: false,
          error: 'Forbidden: You are strictly restricted to your own child\'s educational records.',
          code: 'STUDENT_DATA_PRIVACY_RESTRICTION',
          attemptedStudentId: requestedId
        });
      }
    }

    const student = await Student.findOne({ numericId: requestedId });
    if (!student) {
      return res.status(404).json({
        success: false,
        error: `Student with ID ${requestedId} not found.`
      });
    }

    return res.status(200).json({
      success: true,
      data: student
    });
  } catch (err) {
    next(err);
  }
};

export const createStudent = async (req, res, next) => {
  try {
    const { fullName, className, schoolName, parentName, parentContact, numericId } = req.body;

    if (!fullName || !className || !parentName) {
      return res.status(400).json({
        success: false,
        error: 'Please provide student fullName, className, and parentName.'
      });
    }

    let nextId = numericId;
    if (!nextId) {
      const highest = await Student.findOne().sort({ numericId: -1 });
      nextId = highest ? highest.numericId + 1 : 1;
    }

    const student = await Student.create({
      numericId: nextId,
      fullName,
      className,
      schoolName: schoolName || 'Zilla Parishad High School, Dahiwadi',
      parentName,
      parentContact: parentContact || ''
    });

    return res.status(201).json({
      success: true,
      data: student
    });
  } catch (err) {
    next(err);
  }
};

export const updateStudent = async (req, res, next) => {
  try {
    const requestedId = Number(req.params.id);
    const updates = req.body;

    const student = await Student.findOneAndUpdate(
      { numericId: requestedId },
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!student) {
      return res.status(404).json({
        success: false,
        error: `Student with ID ${requestedId} not found.`
      });
    }

    return res.status(200).json({
      success: true,
      data: student
    });
  } catch (err) {
    next(err);
  }
};
