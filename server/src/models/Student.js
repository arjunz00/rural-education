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
    }
  },
  {
    timestamps: true
  }
);

export const Student = mongoose.model('Student', studentSchema);
