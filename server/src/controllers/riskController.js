import { Attendance } from '../models/Attendance.js';
import { Student } from '../models/Student.js';
import { AcademicRecord } from '../models/AcademicRecord.js';
import { Intervention } from '../models/Intervention.js';
import {
  ATTENDANCE_STATUS,
  RISK_THRESHOLDS,
  FAMILY_ROLES
} from '../config/constants.js';

export const getRiskAssessments = async (req, res, next) => {
  try {
    const { role, studentId } = req.user;

    // Determine target students
    let targetStudents = [];
    if (FAMILY_ROLES.includes(role)) {
      // STRICT PRIVACY: Parent & Student see ONLY their linked child
      const student = await Student.findOne({ numericId: studentId });
      if (student) targetStudents = [student];
    } else {
      // Staff see all school students or filter by className
      const filter = {};
      if (req.query.className) {
        filter.className = req.query.className;
      }
      targetStudents = await Student.find(filter).sort({ numericId: 1 });
    }

    if (targetStudents.length === 0) {
      return res.status(200).json({
        success: true,
        summary: { totalAssessed: 0, highRisk: 0, mediumRisk: 0, lowRisk: 0, criticalAlerts: 0 },
        assessments: [],
        isScoped: FAMILY_ROLES.includes(role)
      });
    }

    const studentIds = targetStudents.map(s => s.numericId);

    // Fetch all attendance for target students sorted by date ascending
    const allAttendance = await Attendance.find({ studentId: { $in: studentIds } }).sort({ attendanceDate: 1 });

    // Fetch academic records for correlation
    const allAcademic = await AcademicRecord.find({ studentId: { $in: studentIds } });

    // Fetch active interventions
    const allInterventions = await Intervention.find({
      studentId: { $in: studentIds },
      status: { $in: ['open', 'in_progress'] }
    });

    // Group by student
    const attendanceByStudent = new Map();
    allAttendance.forEach(att => {
      if (!attendanceByStudent.has(att.studentId)) {
        attendanceByStudent.set(att.studentId, []);
      }
      attendanceByStudent.get(att.studentId).push(att);
    });

    const academicByStudent = new Map();
    allAcademic.forEach(ac => {
      if (!academicByStudent.has(ac.studentId)) {
        academicByStudent.set(ac.studentId, []);
      }
      academicByStudent.get(ac.studentId).push(ac);
    });

    const interventionsByStudent = new Map();
    allInterventions.forEach(inv => {
      if (!interventionsByStudent.has(inv.studentId)) {
        interventionsByStudent.set(inv.studentId, []);
      }
      interventionsByStudent.get(inv.studentId).push(inv);
    });

    const assessments = [];
    let highRiskCount = 0;
    let mediumRiskCount = 0;
    let lowRiskCount = 0;
    let criticalAlertCount = 0;

    for (const student of targetStudents) {
      const records = attendanceByStudent.get(student.numericId) || [];
      const totalDays = records.length;

      let presentCount = 0;
      let absentCount = 0;
      let lateCount = 0;

      records.forEach(r => {
        if (r.status === ATTENDANCE_STATUS.PRESENT) presentCount++;
        else if (r.status === ATTENDANCE_STATUS.ABSENT) absentCount++;
        else if (r.status === ATTENDANCE_STATUS.LATE) lateCount++;
      });

      const attendancePct = totalDays > 0
        ? Math.round(((presentCount + lateCount * 0.5) / totalDays) * 100)
        : 0;

      // Consecutive absences check from most recent records (records are sorted ascending, so reverse to examine most recent)
      let consecutiveAbsent = 0;
      for (let i = records.length - 1; i >= 0; i--) {
        if (records[i].status === ATTENDANCE_STATUS.ABSENT) {
          consecutiveAbsent++;
        } else {
          break;
        }
      }

      const hasCriticalConsecutiveAbsentAlert = consecutiveAbsent >= RISK_THRESHOLDS.CRITICAL_CONSECUTIVE_ABSENT_DAYS;

      // Trend Detection: Compare first half vs second half
      let trend = 'steady';
      let recentPct = attendancePct;
      let priorPct = attendancePct;

      if (totalDays >= 6) {
        const mid = Math.floor(totalDays / 2);
        const priorSlice = records.slice(0, mid);
        const recentSlice = records.slice(mid);

        const priorPres = priorSlice.filter(r => r.status === ATTENDANCE_STATUS.PRESENT || r.status === ATTENDANCE_STATUS.LATE).length;
        const recentPres = recentSlice.filter(r => r.status === ATTENDANCE_STATUS.PRESENT || r.status === ATTENDANCE_STATUS.LATE).length;

        priorPct = Math.round((priorPres / priorSlice.length) * 100);
        recentPct = Math.round((recentPres / recentSlice.length) * 100);

        const diff = recentPct - priorPct;
        if (diff <= -15) {
          trend = 'sharp_drop';
        } else if (diff >= 15) {
          trend = 'improving';
        } else {
          trend = 'steady';
        }
      }

      // Academic performance check
      const academics = academicByStudent.get(student.numericId) || [];
      let academicAvg = null;
      let failedSubjects = 0;
      if (academics.length > 0) {
        const totalMarks = academics.reduce((sum, item) => sum + item.marksObtained, 0);
        const totalMax = academics.reduce((sum, item) => sum + item.maxMarks, 0);
        academicAvg = totalMax > 0 ? Math.round((totalMarks / totalMax) * 100) : 0;
        failedSubjects = academics.filter(item => (item.marksObtained / item.maxMarks) < 0.35).length;
      }

      // Determine Risk Level
      let riskLevel = 'Low';
      let riskScore = 10; // 0-100 scale
      const reasons = [];

      // Minimum observation window warning
      const meetsMinObservation = totalDays >= RISK_THRESHOLDS.MIN_OBSERVATION_DAYS;
      if (!meetsMinObservation) {
        reasons.push(`Preliminary data (${totalDays}/${RISK_THRESHOLDS.MIN_OBSERVATION_DAYS} days observed)`);
      }

      if (attendancePct < RISK_THRESHOLDS.HIGH_RISK_ATTENDANCE_PCT) {
        riskLevel = 'High';
        riskScore = 85;
        reasons.push(`Severe attendance deficit: ${attendancePct}% (Threshold: <60%)`);
      } else if (attendancePct < RISK_THRESHOLDS.MEDIUM_RISK_ATTENDANCE_PCT) {
        riskLevel = 'Medium';
        riskScore = 55;
        reasons.push(`Sub-optimal attendance: ${attendancePct}% (Threshold: <75%)`);
      } else {
        riskScore = Math.max(10, 100 - attendancePct);
      }

      // Elevate risk if consecutive absences alert triggers
      if (hasCriticalConsecutiveAbsentAlert) {
        riskLevel = 'High';
        riskScore = Math.max(riskScore, 90);
        reasons.push(`CRITICAL: ${consecutiveAbsent} consecutive unexcused absences recorded!`);
        criticalAlertCount++;
      }

      // Elevate risk if sharp drop
      if (trend === 'sharp_drop') {
        if (riskLevel === 'Low') riskLevel = 'Medium';
        riskScore += 15;
        reasons.push(`Sharp drop in attendance trend (${priorPct}% → ${recentPct}%)`);
      }

      // Academic compounding factor
      if (academicAvg !== null && academicAvg < 40) {
        if (riskLevel === 'Low') riskLevel = 'Medium';
        riskScore += 10;
        reasons.push(`Academic struggle: average CCE score ${academicAvg}%`);
      }

      // Clamp riskScore
      riskScore = Math.min(100, Math.max(5, riskScore));

      if (riskLevel === 'High') highRiskCount++;
      else if (riskLevel === 'Medium') mediumRiskCount++;
      else lowRiskCount++;

      // Active interventions for this student
      const activeInterventions = interventionsByStudent.get(student.numericId) || [];

      // Recommended Action
      let recommendedAction = 'Routine monitoring and positive reinforcement.';
      if (hasCriticalConsecutiveAbsentAlert) {
        recommendedAction = 'URGENT: Initiate village home visit or direct parent phone call today.';
      } else if (riskLevel === 'High') {
        recommendedAction = 'Schedule structured parent-teacher conference & assign remedial peer buddy.';
      } else if (riskLevel === 'Medium') {
        recommendedAction = 'Counsel student regarding attendance consistency and review homework packets.';
      }

      assessments.push({
        studentId: student.numericId,
        studentName: student.fullName,
        className: student.className,
        schoolName: student.schoolName,
        parentName: student.parentName,
        parentContact: student.parentContact,
        totalDaysRecorded: totalDays,
        presentDays: presentCount,
        absentDays: absentCount,
        lateDays: lateCount,
        attendancePct,
        consecutiveAbsent,
        hasCriticalAlert: hasCriticalConsecutiveAbsentAlert,
        trend,
        priorPeriodPct: priorPct,
        recentPeriodPct: recentPct,
        academicAverage: academicAvg,
        failedSubjects,
        riskLevel,
        riskScore,
        reasons,
        recommendedAction,
        activeInterventionsCount: activeInterventions.length,
        hasOpenIntervention: activeInterventions.length > 0
      });
    }

    // Sort assessments: High risk first, then Medium, then Low
    const riskPriority = { High: 3, Medium: 2, Low: 1 };
    assessments.sort((a, b) => {
      if (riskPriority[b.riskLevel] !== riskPriority[a.riskLevel]) {
        return riskPriority[b.riskLevel] - riskPriority[a.riskLevel];
      }
      return b.riskScore - a.riskScore;
    });

    return res.status(200).json({
      success: true,
      summary: {
        totalAssessed: targetStudents.length,
        highRisk: highRiskCount,
        mediumRisk: mediumRiskCount,
        lowRisk: lowRiskCount,
        criticalAlerts: criticalAlertCount
      },
      assessments,
      isScoped: FAMILY_ROLES.includes(role)
    });
  } catch (err) {
    next(err);
  }
};
