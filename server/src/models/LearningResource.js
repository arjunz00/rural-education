import mongoose from 'mongoose';
import { RESOURCE_TYPES } from '../config/constants.js';

export const VALID_SUBJECTS = ['Mathematics', 'Science', 'English', 'EVS', 'Social Science', 'Marathi'];

const learningResourceSchema = new mongoose.Schema(
  {
    title: {
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
    className: {
      type: String,
      default: function () {
        return String(this.classLevel);
      }
    },
    subject: {
      type: String,
      required: true,
      trim: true,
      enum: VALID_SUBJECTS
    },
    resourceType: {
      type: String,
      required: true,
      enum: RESOURCE_TYPES,
      default: 'text'
    },
    description: {
      type: String,
      required: true,
      trim: true
    },
    content: {
      type: String,
      required: true,
      default: ''
    },
    downloadSize: {
      type: String,
      default: '25 KB'
    },
    duration: {
      type: String,
      default: '—'
    },
    durationSeconds: {
      type: Number,
      default: 180
    },
    audioUrl: {
      type: String
    },
    downloadUrl: {
      type: String
    },
    fileUrl: {
      type: String,
      default: ''
    },
    authorOrBoard: {
      type: String,
      default: 'Maharashtra State Bureau of Textbook Production (Balbharati)'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

learningResourceSchema.index({ classLevel: 1, subject: 1, resourceType: 1 });

export const LearningResource = mongoose.model('LearningResource', learningResourceSchema);
