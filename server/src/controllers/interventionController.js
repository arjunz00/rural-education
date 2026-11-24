import { Intervention } from '../models/Intervention.js';
import { Attendance } from '../models/Attendance.js';
import { ATTENDANCE_STATUS, FAMILY_ROLES } from '../config/constants.js';

export const getInterventions = async (req, res, next) => {
  try {
    const filter = {};

    if (req.scopedStudentId) {
      filter.studentId = req.scopedStudentId;
    }

    if (req.query.status) {
      filter.status = req.query.status;
    }

    if (req.query.type) {
      filter.interventionType = req.query.type;
    }

    const interventions = await Intervention.find(filter).sort({ createdOn: -1 });

    return res.status(200).json({
      success: true,
      count: interventions.length,
      data: interventions,
      scopedStudentId: req.scopedStudentId || null
    });
  } catch (err) {
    next(err);
  }
};

export const getStudentInterventions = async (req, res, next) => {
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

    const interventions = await Intervention.find({ studentId: targetId }).sort({ createdOn: -1 });

    return res.status(200).json({
      success: true,
      studentId: targetId,
      count: interventions.length,
      data: interventions
    });
  } catch (err) {
    next(err);
  }
};

export const createIntervention = async (req, res, next) => {
  try {
    const { studentId, interventionType, concern, actionTaken, createdOn, followUpDate } = req.body;

    if (!studentId || !concern || !actionTaken) {
      return res.status(400).json({
        success: false,
        error: 'Please provide studentId, concern, and actionTaken.'
      });
    }

    const effectiveDate = createdOn || new Date().toISOString().split('T')[0];

    // Compute baseline pre-intervention attendance percentage (up to 10 days before or overall)
    const priorRecords = await Attendance.find({
      studentId: Number(studentId),
      attendanceDate: { $lte: effectiveDate }
    }).sort({ attendanceDate: -1 }).limit(10);

    let preAttendancePct = null;
    if (priorRecords.length > 0) {
      const pres = priorRecords.filter(r => r.status === ATTENDANCE_STATUS.PRESENT || r.status === ATTENDANCE_STATUS.LATE).length;
      preAttendancePct = Math.round((pres / priorRecords.length) * 100);
    }

    const intervention = await Intervention.create({
      studentId: Number(studentId),
      interventionType: interventionType || 'student_meeting',
      concern,
      actionTaken,
      createdOn: effectiveDate,
      followUpDate: followUpDate || null,
      status: 'open',
      preAttendancePct,
      postAttendancePct: null,
      attendanceOutcome: 'insufficient_data',
      deltaPct: null
    });

    return res.status(201).json({
      success: true,
      message: 'Intervention logged successfully',
      data: intervention
    });
  } catch (err) {
    next(err);
  }
};

export const updateIntervention = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const existing = await Intervention.findById(id);
    if (!existing) {
      return res.status(404).json({
        success: false,
        error: 'Intervention not found.'
      });
    }

    // If resolving, calculate post attendance and outcome delta
    if (updates.status === 'resolved' || updates.evaluateOutcome) {
      const postRecords = await Attendance.find({
        studentId: existing.studentId,
        attendanceDate: { $gt: existing.createdOn }
      }).sort({ attendanceDate: 1 }).limit(10);

      if (postRecords.length >= 3) {
        const pres = postRecords.filter(r => r.status === ATTENDANCE_STATUS.PRESENT || r.status === ATTENDANCE_STATUS.LATE).length;
        const postPct = Math.round((pres / postRecords.length) * 100);
        updates.postAttendancePct = postPct;

        if (existing.preAttendancePct !== null) {
          const delta = postPct - existing.preAttendancePct;
          updates.deltaPct = delta;
          if (delta > 5) updates.attendanceOutcome = 'improved';
          else if (delta < -5) updates.attendanceOutcome = 'declined';
          else updates.attendanceOutcome = 'steady';
        }
      }
    }

    const updated = await Intervention.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    return res.status(200).json({
      success: true,
      data: updated
    });
  } catch (err) {
    next(err);
  }
};
