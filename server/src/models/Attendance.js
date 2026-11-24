import mongoose from 'mongoose';
import { ATTENDANCE_STATUS } from '../config/constants.js';

const attendanceSchema = new mongoose.Schema(
  {
    studentId: {
      type: Number,
      required: true,
      index: true
    },
    attendanceDate: {
      type: String, // ISO YYYY-MM-DD
      required: true,
      index: true,
      match: /^\d{4}-\d{2}-\d{2}$/
    },
    status: {
      type: String,
      required: true,
      enum: Object.values(ATTENDANCE_STATUS),
      default: ATTENDANCE_STATUS.PRESENT
    },
    notes: {
      type: String,
      trim: true,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

// Compound Unique Index: prevents duplicate roll calls for same student on the same date
attendanceSchema.index({ studentId: 1, attendanceDate: 1 }, { unique: true });

export const Attendance = mongoose.model('Attendance', attendanceSchema);
