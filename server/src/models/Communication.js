import mongoose from 'mongoose';
import { COMMUNICATION_CATEGORIES } from '../config/constants.js';

const communicationSchema = new mongoose.Schema(
  {
    studentId: {
      type: Number,
      required: true,
      index: true
    },
    senderTeacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    senderTeacherName: {
      type: String,
      required: true,
      trim: true
    },
    classLevel: {
      type: Number,
      required: true,
      min: 1,
      max: 10,
      index: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    messageText: {
      type: String,
      required: true,
      trim: true
    },
    category: {
      type: String,
      enum: COMMUNICATION_CATEGORIES,
      default: 'academic_feedback'
    },
    isUrgent: {
      type: Boolean,
      default: false
    },
    readStatus: {
      type: Boolean,
      default: false,
      index: true
    },
    readAt: {
      type: Date,
      default: null
    },
    createdAt: {
      type: Date,
      default: Date.now,
      index: true
    }
  },
  {
    timestamps: true
  }
);

communicationSchema.index({ studentId: 1, readStatus: 1 });
communicationSchema.index({ classLevel: 1, createdAt: -1 });

export const Communication = mongoose.model('Communication', communicationSchema);
