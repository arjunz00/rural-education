import { Attendance } from '../models/Attendance.js';
import { Student } from '../models/Student.js';
import { ATTENDANCE_STATUS, FAMILY_ROLES } from '../config/constants.js';

export const getAttendance = async (req, res, next) => {
  try {
    const filter = {};

    // Privacy scope enforcement
    if (req.scopedStudentId) {
      filter.studentId = req.scopedStudentId;
    }

    if (req.query.date) {
      filter.attendanceDate = req.query.date;
    } else if (req.query.startDate && req.query.endDate) {
      filter.attendanceDate = {
        $gte: req.query.startDate,
        $lte: req.query.endDate
      };
    }

    if (req.query.status) {
      filter.status = req.query.status;
    }

    const records = await Attendance.find(filter).sort({ attendanceDate: -1, studentId: 1 });

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

export const getAttendanceSummary = async (req, res, next) => {
  try {
    // School-wide aggregation pipeline (Staff only)
    const pipeline = [
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ];

    const stats = await Attendance.aggregate(pipeline);
    let totalPresent = 0;
    let totalAbsent = 0;
    let totalLate = 0;

    stats.forEach(item => {
      if (item._id === ATTENDANCE_STATUS.PRESENT) totalPresent = item.count;
      if (item._id === ATTENDANCE_STATUS.ABSENT) totalAbsent = item.count;
      if (item._id === ATTENDANCE_STATUS.LATE) totalLate = item.count;
    });

    const totalDays = totalPresent + totalAbsent + totalLate;
    // Calculate percentage: late counts as present for RTE standard or half
    const attendancePct = totalDays > 0
      ? Math.round(((totalPresent + totalLate * 0.5) / totalDays) * 100)
      : 0;

    // Class-wise summary
    const students = await Student.find().select('numericId className fullName');
    const studentClassMap = new Map();
    students.forEach(s => studentClassMap.set(s.numericId, s.className));

    const allRecords = await Attendance.find().select('studentId status attendanceDate');
    const classStats = {};

    allRecords.forEach(r => {
      const cls = studentClassMap.get(r.studentId) || 'Unassigned';
      if (!classStats[cls]) {
        classStats[cls] = { total: 0, present: 0, absent: 0, late: 0 };
      }
      classStats[cls].total++;
      if (r.status === ATTENDANCE_STATUS.PRESENT) classStats[cls].present++;
      else if (r.status === ATTENDANCE_STATUS.ABSENT) classStats[cls].absent++;
      else if (r.status === ATTENDANCE_STATUS.LATE) classStats[cls].late++;
    });

    const classBreakdown = Object.keys(classStats).map(cls => {
      const item = classStats[cls];
      const pct = item.total > 0 ? Math.round(((item.present + item.late * 0.5) / item.total) * 100) : 0;
      return {
        className: cls,
        ...item,
        attendancePct: pct
      };
    });

    return res.status(200).json({
      success: true,
      summary: {
        totalRecords: totalDays,
        totalPresent,
        totalAbsent,
        totalLate,
        overallAttendancePct: attendancePct,
        classBreakdown
      }
    });
  } catch (err) {
    next(err);
  }
};

export const getAttendanceAnalytics = async (req, res, next) => {
  try {
    const targetStudentId = req.scopedStudentId;
    const filter = {};

    if (targetStudentId) {
      filter.studentId = targetStudentId;
    }

    if (req.query.startDate && req.query.endDate) {
      filter.attendanceDate = {
        $gte: req.query.startDate,
        $lte: req.query.endDate
      };
    }

    // Daily trends
    const records = await Attendance.find(filter).sort({ attendanceDate: 1 });

    const dateMap = {};
    records.forEach(r => {
      if (!dateMap[r.attendanceDate]) {
        dateMap[r.attendanceDate] = { date: r.attendanceDate, present: 0, absent: 0, late: 0, total: 0 };
      }
      dateMap[r.attendanceDate].total++;
      if (r.status === ATTENDANCE_STATUS.PRESENT) dateMap[r.attendanceDate].present++;
      else if (r.status === ATTENDANCE_STATUS.ABSENT) dateMap[r.attendanceDate].absent++;
      else if (r.status === ATTENDANCE_STATUS.LATE) dateMap[r.attendanceDate].late++;
    });

    const dailyTrends = Object.values(dateMap).map(d => ({
      ...d,
      pct: d.total > 0 ? Math.round(((d.present + d.late * 0.5) / d.total) * 100) : 0
    }));

    // Calculate current streak if scoped to single student
    let currentStreak = 0;
    if (targetStudentId) {
      const sortedDesc = [...records].sort((a, b) => b.attendanceDate.localeCompare(a.attendanceDate));
      for (const rec of sortedDesc) {
        if (rec.status === ATTENDANCE_STATUS.PRESENT) {
          currentStreak++;
        } else {
          break;
        }
      }
    }

    return res.status(200).json({
      success: true,
      analytics: {
        dailyTrends,
        currentStreak,
        scopedStudentId: targetStudentId || null
      }
    });
  } catch (err) {
    next(err);
  }
};

export const recordAttendance = async (req, res, next) => {
  try {
    const { studentId, attendanceDate, status, notes } = req.body;

    if (!studentId || !attendanceDate || !status) {
      return res.status(400).json({
        success: false,
        error: 'Please provide studentId, attendanceDate (YYYY-MM-DD), and status.'
      });
    }

    // Upsert record
    const record = await Attendance.findOneAndUpdate(
      { studentId: Number(studentId), attendanceDate },
      {
        $set: {
          studentId: Number(studentId),
          attendanceDate,
          status,
          notes: notes || ''
        }
      },
      { upsert: true, new: true, runValidators: true }
    );

    return res.status(200).json({
      success: true,
      message: 'Attendance recorded successfully',
      data: record
    });
  } catch (err) {
    next(err);
  }
};

export const bulkAttendance = async (req, res, next) => {
  try {
    const { attendanceDate, records } = req.body;

    if (!attendanceDate || !Array.isArray(records) || records.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Please provide attendanceDate and an array of student records.'
      });
    }

    const bulkOps = records.map(item => ({
      updateOne: {
        filter: { studentId: Number(item.studentId), attendanceDate },
        update: {
          $set: {
            studentId: Number(item.studentId),
            attendanceDate,
            status: item.status || ATTENDANCE_STATUS.PRESENT,
            notes: item.notes || ''
          }
        },
        upsert: true
      }
    }));

    const result = await Attendance.bulkWrite(bulkOps);

    return res.status(200).json({
      success: true,
      message: `Successfully processed bulk attendance for ${records.length} students.`,
      matchedCount: result.matchedCount,
      upsertedCount: result.upsertedCount,
      modifiedCount: result.modifiedCount
    });
  } catch (err) {
    next(err);
  }
};

export const getStudentAttendance = async (req, res, next) => {
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

    const records = await Attendance.find({ studentId: targetId }).sort({ attendanceDate: -1 });

    const totalDays = records.length;
    let presentDays = 0;
    let absentDays = 0;
    let lateDays = 0;

    records.forEach(r => {
      if (r.status === ATTENDANCE_STATUS.PRESENT) presentDays++;
      else if (r.status === ATTENDANCE_STATUS.ABSENT) absentDays++;
      else if (r.status === ATTENDANCE_STATUS.LATE) lateDays++;
    });

    const attendancePct = totalDays > 0
      ? Math.round(((presentDays + lateDays * 0.5) / totalDays) * 100)
      : 0;

    // Consecutive present streak from most recent date
    let streak = 0;
    for (const r of records) {
      if (r.status === ATTENDANCE_STATUS.PRESENT) {
        streak++;
      } else {
        break;
      }
    }

    return res.status(200).json({
      success: true,
      studentId: targetId,
      summary: {
        totalDays,
        presentDays,
        absentDays,
        lateDays,
        attendancePct,
        streak
      },
      records
    });
  } catch (err) {
    next(err);
  }
};
