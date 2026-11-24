import mongoose from 'mongoose';

const quizQuestionSchema = new mongoose.Schema(
  {
    questionText: { type: String, required: true },
    options: [{ type: String, required: true }],
    correctOptionIndex: { type: Number, required: true },
    explanation: { type: String, default: '' },
    audioPromptUrl: { type: String, default: '' }
  },
  { _id: false }
);

const quizSchema = new mongoose.Schema(
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
    subject: {
      type: String,
      required: true,
      trim: true
    },
    targetCategory: {
      type: String,
      enum: ['all', 'remedial_support'],
      default: 'remedial_support',
      index: true
    },
    assignedStudentIds: [{
      type: Number,
      index: true
    }],
    questions: [quizQuestionSchema],
    createdBy: {
      type: String,
      default: 'Teacher S. Deshmukh'
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

quizSchema.index({ classLevel: 1, targetCategory: 1 });

export const Quiz = mongoose.model('Quiz', quizSchema);
