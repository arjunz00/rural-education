import mongoose from 'mongoose';
import {
  INTERVENTION_TYPES,
  INTERVENTION_STATUSES,
  ATTENDANCE_OUTCOMES
} from '../config/constants.js';

const interventionSchema = new mongoose.Schema(
  {
    studentId: {
      type: Number,
      required: true,
      index: true
    },
    interventionType: {
      type: String,
      required: true,
      enum: INTERVENTION_TYPES,
      default: 'student_meeting'
    },
    concern: {
      type: String,
      required: true,
      minlength: 3,
      trim: true
    },
    actionTaken: {
      type: String,
      required: true,
      trim: true
    },
    createdOn: {
      type: String,
      required: true,
      match: /^\d{4}-\d{2}-\d{2}$/
    },
    followUpDate: {
      type: String,
      match: /^\d{4}-\d{2}-\d{2}$/,
      default: null
    },
    status: {
      type: String,
      enum: INTERVENTION_STATUSES,
      default: 'open'
    },
    preAttendancePct: {
      type: Number,
      min: 0,
      max: 100,
      default: null
    },
    postAttendancePct: {
      type: Number,
      min: 0,
      max: 100,
      default: null
    },
    attendanceOutcome: {
      type: String,
      enum: ATTENDANCE_OUTCOMES,
      default: 'insufficient_data'
    },
    deltaPct: {
      type: Number,
      default: null
    }
  },
  {
    timestamps: true
  }
);

interventionSchema.index({ studentId: 1, createdOn: -1 });

export const Intervention = mongoose.model('Intervention', interventionSchema);
