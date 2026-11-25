import { Student } from '../models/Student.js';
import { Attendance } from '../models/Attendance.js';
import { AcademicRecord } from '../models/AcademicRecord.js';
import { WhatsAppLog } from '../models/WhatsAppLog.js';
import {
  formatTemplateMessage,
  generateClickToChatUrl,
  dispatchWhatsAppMessage,
  sanitizeIndianPhoneNumber
} from '../services/whatsappService.js';
import { FAMILY_ROLES } from '../config/constants.js';

/**
 * Evaluates a student's real-time attendance trajectory, consecutive absence count, and risk zone
 */
export const evaluateStudentAttendanceRisk = async (studentId, targetDate) => {
  const records = await Attendance.find({ studentId: Number(studentId) }).sort({ attendanceDate: 1 });
  const totalDays = records.length;

  let presentDays = 0;
  let absentDays = 0;
  let lateDays = 0;

  records.forEach(r => {
    if (r.status === 'present') presentDays++;
    else if (r.status === 'absent') absentDays++;
    else if (r.status === 'late') lateDays++;
  });

  const attendancePct = totalDays > 0
    ? Math.round(((presentDays + lateDays * 0.5) / totalDays) * 100)
    : 100;

  let consecutiveAbsent = 0;
  for (let i = records.length - 1; i >= 0; i--) {
    if (records[i].status === 'absent') {
      consecutiveAbsent++;
    } else {
      break;
    }
  }

  // Find status on targetDate (if given) or latest record
  const targetRecord = targetDate ? records.find(r => r.attendanceDate === targetDate) : records[records.length - 1];
  const statusToday = targetRecord ? targetRecord.status : 'present';

  const isHighRisk = attendancePct < 60 || consecutiveAbsent >= 3;
  const isCritical = consecutiveAbsent >= 3;

  return {
    totalDays,
    presentDays,
    absentDays,
    consecutiveAbsent,
    attendancePct,
    statusToday,
    isHighRisk,
    isCritical
  };
};

/**
 * POST /api/whatsapp/send
 * Dispatches a single templated or custom WhatsApp alert to a student's guardian
 */
export const sendWhatsAppNotification = async (req, res, next) => {
  try {
    const { studentId, templateType = 'daily_absence', customNotes, title, consecutiveDays, date } = req.body;

    if (!studentId) {
      return res.status(400).json({
        success: false,
        error: 'Please specify a studentId for WhatsApp dispatch.'
      });
    }

    const student = await Student.findOne({ numericId: Number(studentId) });
    if (!student) {
      return res.status(404).json({
        success: false,
        error: `Student #${studentId} not found.`
      });
    }

    const cleanPhone = sanitizeIndianPhoneNumber(student.parentContact);
    if (!cleanPhone) {
      return res.status(400).json({
        success: false,
        error: `Student ${student.fullName} (#${student.numericId}) does not have a valid parent mobile number registered.`
      });
    }

    // Evaluate student's live attendance & risk status
    const riskInfo = await evaluateStudentAttendanceRisk(student.numericId, date);
    let effectiveTemplate = templateType;

    if (templateType === 'auto') {
      if (riskInfo.statusToday === 'present') {
        effectiveTemplate = 'attendance_appreciation';
      } else if (riskInfo.isHighRisk || riskInfo.consecutiveAbsent >= 3) {
        effectiveTemplate = 'consecutive_absence_alert';
      } else {
        effectiveTemplate = 'daily_absence';
      }
    } else if (templateType === 'daily_absence' && (riskInfo.isHighRisk || riskInfo.consecutiveAbsent >= 3)) {
      // Escalate high-risk students to urgent dropout warning
      effectiveTemplate = 'consecutive_absence_alert';
    } else if ((templateType === 'daily_absence' || templateType === 'consecutive_absence_alert') && riskInfo.statusToday === 'present') {
      // Present students do NOT get absence alerts; convert to appreciation notice
      effectiveTemplate = 'attendance_appreciation';
    }

    const effectiveConsecutive = consecutiveDays || (riskInfo.consecutiveAbsent > 0 ? riskInfo.consecutiveAbsent : 3);

    // Optional marksheet lookup if template is marksheet_summary
    let marksList = 'Mathematics: 82/100, Science: 78/100, English: 74/100';
    let totalPct = 78;
    let grade = 'A';

    if (effectiveTemplate === 'marksheet_summary') {
      const acads = await AcademicRecord.find({ studentId: student.numericId });
      if (acads.length > 0) {
        marksList = acads.map(a => `${a.subject}: ${a.marksObtained}/${a.maxMarks}`).join(', ');
        const totalObtained = acads.reduce((acc, curr) => acc + curr.marksObtained, 0);
        const totalMax = acads.reduce((acc, curr) => acc + curr.maxMarks, 0);
        totalPct = Math.round((totalObtained / totalMax) * 100);
        grade = totalPct >= 80 ? 'A+' : totalPct >= 70 ? 'A' : totalPct >= 55 ? 'B' : 'C';
      }
    }

    const messageBody = formatTemplateMessage(effectiveTemplate, {
      parentName: student.parentName,
      studentName: student.fullName,
      classLevel: student.className,
      date: date || new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
      schoolName: student.schoolName,
      teacherName: req.user?.fullName || 'Class Teacher',
      consecutiveDays: effectiveConsecutive,
      marksList,
      totalPct,
      grade,
      title: title || 'School Update',
      messageText: customNotes || 'Please check your child\'s learning progress.'
    });

    const dispatchResult = await dispatchWhatsAppMessage({
      toPhone: cleanPhone,
      messageBody,
      studentId: student.numericId,
      templateType: effectiveTemplate
    });

    const log = await WhatsAppLog.create({
      studentId: student.numericId,
      studentName: student.fullName,
      classLevel: Number(student.className) || 8,
      parentName: student.parentName,
      parentPhone: cleanPhone,
      templateType: effectiveTemplate,
      messageBody,
      deliveryStatus: dispatchResult.deliveryStatus,
      triggeredBy: req.user?.fullName || 'Staff Administrator',
      providerMessageId: dispatchResult.providerMessageId,
      sentAt: new Date()
    });

    const clickToChatUrl = generateClickToChatUrl(cleanPhone, messageBody);

    return res.status(200).json({
      success: true,
      message: `WhatsApp alert successfully dispatched to ${student.parentName} (+${cleanPhone}).`,
      data: log,
      effectiveTemplate,
      riskLevel: riskInfo.isHighRisk ? 'High' : 'Normal',
      clickToChatUrl
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/whatsapp/bulk-absence-alerts
 * Scans today's roll call and dispatches WhatsApp alerts to all absent students' parents
 */
export const sendBulkAbsenceAlerts = async (req, res, next) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const { date = today, classLevel } = req.body;

    const attFilter = { attendanceDate: date, status: 'absent' };
    const absences = await Attendance.find(attFilter);

    if (absences.length === 0) {
      return res.status(200).json({
        success: true,
        message: `No unexcused absences recorded on ${date}. Zero alerts dispatched.`,
        dispatchedCount: 0,
        failedCount: 0,
        summary: {
          sentCount: 0,
          skippedCount: 0
        },
        results: [],
        data: []
      });
    }

    const absentStudentIds = absences.map(a => a.studentId);
    const stuFilter = { numericId: { $in: absentStudentIds } };
    if (classLevel) {
      stuFilter.className = String(classLevel);
    }

    const students = await Student.find(stuFilter);
    const logs = [];
    let failedCount = 0;
    let highRiskAlertsCount = 0;
    let standardAbsenceNotesCount = 0;

    for (const student of students) {
      const cleanPhone = sanitizeIndianPhoneNumber(student.parentContact);
      if (!cleanPhone) {
        failedCount++;
        continue;
      }

      // Attendance & Risk Heuristic: High Risk students get Urgent Alert; single-day absent get gentle notice
      const riskInfo = await evaluateStudentAttendanceRisk(student.numericId, date);
      let targetTemplate = 'daily_absence';

      if (riskInfo.isHighRisk || riskInfo.consecutiveAbsent >= 3) {
        targetTemplate = 'consecutive_absence_alert';
        highRiskAlertsCount++;
      } else {
        targetTemplate = 'daily_absence';
        standardAbsenceNotesCount++;
      }

      const messageBody = formatTemplateMessage(targetTemplate, {
        parentName: student.parentName,
        studentName: student.fullName,
        classLevel: student.className,
        date: date,
        consecutiveDays: riskInfo.consecutiveAbsent > 0 ? riskInfo.consecutiveAbsent : 3,
        schoolName: student.schoolName,
        teacherName: req.user?.fullName || 'Class Teacher'
      });

      try {
        const dispatchResult = await dispatchWhatsAppMessage({
          toPhone: cleanPhone,
          messageBody,
          studentId: student.numericId,
          templateType: targetTemplate
        });

        const log = await WhatsAppLog.create({
          studentId: student.numericId,
          studentName: student.fullName,
          classLevel: Number(student.className) || 8,
          parentName: student.parentName,
          parentPhone: cleanPhone,
          templateType: targetTemplate,
          messageBody,
          deliveryStatus: dispatchResult.deliveryStatus,
          triggeredBy: req.user?.fullName || 'Attendance-Aware Alert Dispatcher',
          providerMessageId: dispatchResult.providerMessageId,
          sentAt: new Date()
        });

        logs.push(log);
      } catch (e) {
        failedCount++;
      }
    }

    return res.status(200).json({
      success: true,
      message: `Attendance-based WhatsApp dispatches complete: ${highRiskAlertsCount} urgent warnings sent to at-risk parents, ${standardAbsenceNotesCount} standard daily absence notes.`,
      dispatchedCount: logs.length,
      failedCount,
      summary: {
        sentCount: logs.length,
        highRiskAlertsCount,
        standardAbsenceNotesCount,
        skippedCount: failedCount
      },
      results: logs,
      data: logs
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/whatsapp/logs
 * Fetches outbound WhatsApp communication records with Zero-Trust Parent Privacy
 */
export const getWhatsAppLogs = async (req, res, next) => {
  try {
    const { role, studentId: userStudentId } = req.user;
    const queryStudentId = req.query.studentId ? Number(req.query.studentId) : null;

    // Strict 1-to-1 Parent/Student privacy boundary
    if (FAMILY_ROLES.includes(role)) {
      if (queryStudentId && queryStudentId !== Number(userStudentId)) {
        return res.status(403).json({
          success: false,
          error: 'Unauthorized student data access: You can only view WhatsApp communication logs for your own child.',
          message: 'Unauthorized student data access: You can only view WhatsApp communication logs for your own child.',
          code: 'FORBIDDEN_STUDENT_SCOPE'
        });
      }
    }

    const filter = {};
    if (FAMILY_ROLES.includes(role)) {
      filter.studentId = Number(userStudentId);
    } else if (queryStudentId) {
      filter.studentId = queryStudentId;
    }

    if (req.query.templateType) {
      filter.templateType = req.query.templateType;
    }

    const logs = await WhatsAppLog.find(filter).sort({ sentAt: -1 }).limit(100);

    return res.status(200).json({
      success: true,
      count: logs.length,
      data: logs,
      logs
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/whatsapp/logs/summary
 * Administrative delivery summary across school
 */
export const getWhatsAppSummary = async (req, res, next) => {
  try {
    const totalSent = await WhatsAppLog.countDocuments({ deliveryStatus: 'sent' });
    const totalDelivered = await WhatsAppLog.countDocuments({ deliveryStatus: 'delivered' });
    const totalFailed = await WhatsAppLog.countDocuments({ deliveryStatus: 'failed' });

    const recentLogs = await WhatsAppLog.find().sort({ sentAt: -1 }).limit(10);

    return res.status(200).json({
      success: true,
      summary: {
        totalSent,
        totalDelivered,
        totalFailed,
        recentLogs,
        recentAlerts: recentLogs
      },
      recentAlerts: recentLogs
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/whatsapp/link
 * Generates instant click-to-chat wa.me link
 */
export const getClickToChatLink = async (req, res, next) => {
  try {
    const { studentId, templateType = 'daily_absence', customNotes } = req.query;

    if (!studentId) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a studentId.'
      });
    }

    const student = await Student.findOne({ numericId: Number(studentId) });
    if (!student) {
      return res.status(404).json({
        success: false,
        error: 'Student not found.'
      });
    }

    const cleanPhone = sanitizeIndianPhoneNumber(student.parentContact);
    if (!cleanPhone) {
      return res.status(400).json({
        success: false,
        error: 'Parent phone number is not available or invalid.'
      });
    }

    // Dynamic Risk & Attendance evaluation for Click-to-Chat URL
    const riskInfo = await evaluateStudentAttendanceRisk(student.numericId);
    let effectiveTemplate = templateType;

    if (templateType === 'auto') {
      if (riskInfo.statusToday === 'present') {
        effectiveTemplate = 'attendance_appreciation';
      } else if (riskInfo.isHighRisk || riskInfo.consecutiveAbsent >= 3) {
        effectiveTemplate = 'consecutive_absence_alert';
      } else {
        effectiveTemplate = 'daily_absence';
      }
    } else if (templateType === 'daily_absence' && (riskInfo.isHighRisk || riskInfo.consecutiveAbsent >= 3)) {
      effectiveTemplate = 'consecutive_absence_alert';
    } else if ((templateType === 'daily_absence' || templateType === 'consecutive_absence_alert') && riskInfo.statusToday === 'present') {
      effectiveTemplate = 'attendance_appreciation';
    }

    const messageText = formatTemplateMessage(effectiveTemplate, {
      parentName: student.parentName,
      studentName: student.fullName,
      classLevel: student.className,
      date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
      schoolName: student.schoolName,
      teacherName: req.user?.fullName || 'Class Teacher',
      consecutiveDays: riskInfo.consecutiveAbsent > 0 ? riskInfo.consecutiveAbsent : 3,
      messageText: customNotes || ''
    });

    const url = generateClickToChatUrl(cleanPhone, messageText);

    return res.status(200).json({
      success: true,
      url,
      clickToChatUrl: url,
      effectiveTemplate,
      isHighRisk: riskInfo.isHighRisk,
      consecutiveAbsent: riskInfo.consecutiveAbsent,
      statusToday: riskInfo.statusToday,
      messageText,
      parentContact: cleanPhone,
      recipientPhone: cleanPhone
    });
  } catch (err) {
    next(err);
  }
};
