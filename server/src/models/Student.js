import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema(
  {
    numericId: {
      type: Number,
      required: true,
      unique: true,
      index: true
    },
    fullName: {
      type: String,
      required: true,
      trim: true
    },
    className: {
      type: String,
      required: true,
      trim: true
    },
    schoolName: {
      type: String,
      required: true,
      default: 'Zilla Parishad High School, Dahiwadi'
    },
    parentName: {
      type: String,
      required: true,
      trim: true
    },
    parentContact: {
      type: String,
      trim: true,
      default: ''
    },
    enrollmentStatus: {
      type: String,
      enum: ['pending', 'enrolled', 'rejected'],
      default: 'enrolled',
      index: true
    },
    verifiedByTeacher: {
      type: String,
      default: null
    },
    verifiedAt: {
      type: Date,
      default: null
    },
    rejectionReason: {
      type: String,
      default: null
    },
    hamletOrWadi: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

export const Student = mongoose.model('Student', studentSchema);
