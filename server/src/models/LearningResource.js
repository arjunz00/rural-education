import mongoose from 'mongoose';
import { RESOURCE_TYPES } from '../config/constants.js';

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
      default: '4 mins'
    },
    className: {
      type: String,
      default: 'All'
    }
  },
  {
    timestamps: true
  }
);

learningResourceSchema.index({ subject: 1, resourceType: 1 });

export const LearningResource = mongoose.model('LearningResource', learningResourceSchema);
