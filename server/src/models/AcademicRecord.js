import mongoose from 'mongoose';

const academicRecordSchema = new mongoose.Schema(
  {
    studentId: {
      type: Number,
      required: true,
      index: true
    },
    subject: {
      type: String,
      required: true,
      trim: true
    },
    examName: {
      type: String,
      required: true,
      trim: true
    },
    marksObtained: {
      type: Number,
      required: true,
      min: 0
    },
    maxMarks: {
      type: Number,
      required: true,
      default: 100,
      min: 1
    },
    examDate: {
      type: String, // ISO YYYY-MM-DD
      required: true,
      match: /^\d{4}-\d{2}-\d{2}$/
    },
    remarks: {
      type: String,
      trim: true,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

// Helpful compound index for queries
academicRecordSchema.index({ studentId: 1, examName: 1 });

export const AcademicRecord = mongoose.model('AcademicRecord', academicRecordSchema);
