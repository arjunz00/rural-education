import { AcademicRecord } from '../models/AcademicRecord.js';
import { Student } from '../models/Student.js';
import { FAMILY_ROLES } from '../config/constants.js';

// Letter grade helper
export const calculateGrade = (pct) => {
  if (pct >= 85) return 'A+';
  if (pct >= 70) return 'A';
  if (pct >= 55) return 'B';
  if (pct >= 40) return 'C';
  return 'D';
};

export const getRecords = async (req, res, next) => {
  try {
    const filter = {};

    if (req.scopedStudentId) {
      filter.studentId = req.scopedStudentId;
    }

    if (req.query.subject) {
      filter.subject = req.query.subject;
    }

    if (req.query.examName) {
      filter.examName = req.query.examName;
    }

    const records = await AcademicRecord.find(filter).sort({ examDate: -1, studentId: 1 });

    return res.status(200).json({
      success: true,
      count: records.length,
      data: records,
      scopedStudentId: req.scopedStudentId || null
    });
  } catch (err) {
    next(err);
  }
};

export const getStudentAcademic = async (req, res, next) => {
  try {
    const targetId = Number(req.params.id);

    // Strict Privacy enforcement
    if (FAMILY_ROLES.includes(req.user.role)) {
      if (targetId !== Number(req.user.studentId)) {
        return res.status(403).json({
          success: false,
          error: 'Forbidden: You are strictly restricted to your own child\'s educational records.',
          code: 'STUDENT_DATA_PRIVACY_RESTRICTION'
        });
      }
    }

    const student = await Student.findOne({ numericId: targetId });
    if (!student) {
      return res.status(404).json({
        success: false,
        error: `Student with ID ${targetId} not found.`
      });
    }

    const records = await AcademicRecord.find({ studentId: targetId }).sort({ examDate: -1 });

    let totalMarks = 0;
    let totalMax = 0;

    const subjectMap = {};
    records.forEach(r => {
      totalMarks += r.marksObtained;
      totalMax += r.maxMarks;

      if (!subjectMap[r.subject]) {
        subjectMap[r.subject] = [];
      }
      const pct = Math.round((r.marksObtained / r.maxMarks) * 100);
      subjectMap[r.subject].push({
        examName: r.examName,
        marksObtained: r.marksObtained,
        maxMarks: r.maxMarks,
        percentage: pct,
        grade: calculateGrade(pct),
        examDate: r.examDate,
        remarks: r.remarks
      });
    });

    const overallPct = totalMax > 0 ? Math.round((totalMarks / totalMax) * 100) : 0;
    const overallGrade = calculateGrade(overallPct);

    return res.status(200).json({
      success: true,
      studentId: targetId,
      studentName: student.fullName,
      className: student.className,
      schoolName: student.schoolName,
      summary: {
        totalExams: records.length,
        totalMarks,
        totalMax,
        overallPercentage: overallPct,
        overallGrade
      },
      subjectRecords: subjectMap,
      allRecords: records
    });
  } catch (err) {
    next(err);
  }
};

export const createRecord = async (req, res, next) => {
  try {
    const { studentId, subject, examName, marksObtained, maxMarks, examDate, remarks } = req.body;

    if (!studentId || !subject || !examName || marksObtained === undefined || !examDate) {
      return res.status(400).json({
        success: false,
        error: 'Please provide studentId, subject, examName, marksObtained, and examDate.'
      });
    }

    const record = await AcademicRecord.create({
      studentId: Number(studentId),
      subject,
      examName,
      marksObtained: Number(marksObtained),
      maxMarks: Number(maxMarks) || 100,
      examDate,
      remarks: remarks || ''
    });

    return res.status(201).json({
      success: true,
      data: record
    });
  } catch (err) {
    next(err);
  }
};

export const updateRecord = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const record = await AcademicRecord.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!record) {
      return res.status(404).json({
        success: false,
        error: 'Academic record not found.'
      });
    }

    return res.status(200).json({
      success: true,
      data: record
    });
  } catch (err) {
    next(err);
  }
};

export const deleteRecord = async (req, res, next) => {
  try {
    const { id } = req.params;
    const record = await AcademicRecord.findByIdAndDelete(id);

    if (!record) {
      return res.status(404).json({
        success: false,
        error: 'Academic record not found.'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Record deleted successfully.'
    });
  } catch (err) {
    next(err);
  }
};

export const getAcademicSummary = async (req, res, next) => {
  try {
    const records = await AcademicRecord.find();
    const students = await Student.find().select('numericId className');
    const studentClassMap = new Map();
    students.forEach(s => studentClassMap.set(s.numericId, s.className));

    // Aggregate by subject
    const subjectStats = {};
    records.forEach(r => {
      if (!subjectStats[r.subject]) {
        subjectStats[r.subject] = { totalMarks: 0, totalMax: 0, count: 0 };
      }
      subjectStats[r.subject].totalMarks += r.marksObtained;
      subjectStats[r.subject].totalMax += r.maxMarks;
      subjectStats[r.subject].count++;
    });

    const subjectAverages = Object.keys(subjectStats).map(subj => {
      const item = subjectStats[subj];
      const avg = item.totalMax > 0 ? Math.round((item.totalMarks / item.totalMax) * 100) : 0;
      return {
        subject: subj,
        count: item.count,
        averagePercentage: avg,
        grade: calculateGrade(avg)
      };
    });

    return res.status(200).json({
      success: true,
      summary: {
        totalRecords: records.length,
        subjectAverages
      }
    });
  } catch (err) {
    next(err);
  }
};
