import mongoose from 'mongoose';
import { RESOURCE_TYPES } from '../config/constants.js';

export const VALID_CLASS_LEVELS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'all'];

const learningResourceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    subject: {
      type: String,
      required: true,
      trim: true
    },
    resourceType: {
      type: String,
      required: true,
      enum: RESOURCE_TYPES,
      default: 'text'
    },
    classLevel: {
      type: String,
      required: true,
      enum: VALID_CLASS_LEVELS,
      default: 'all',
      index: true
    },
    className: {
      type: String,
      default: function () {
        return this.classLevel || 'all';
      }
    },
    description: {
      type: String,
      required: true,
      trim: true
    },
    content: {
      type: String,
      default: ''
    },
    downloadSize: {
      type: String,
      default: '50 KB'
    },
    duration: {
      type: String,
      default: '—'
    }
  },
  {
    timestamps: true
  }
);

learningResourceSchema.index({ classLevel: 1, subject: 1, resourceType: 1 });

export const LearningResource = mongoose.model('LearningResource', learningResourceSchema);
