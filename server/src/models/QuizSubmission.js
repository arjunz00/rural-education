import mongoose from 'mongoose';

const quizAnswerSchema = new mongoose.Schema(
  {
    questionIndex: { type: Number, required: true },
    selectedOptionIndex: { type: Number, required: true },
    isCorrect: { type: Boolean, required: true }
  },
  { _id: false }
);

const quizSubmissionSchema = new mongoose.Schema(
  {
    quizId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Quiz',
      required: true,
      index: true
    },
    studentId: {
      type: Number,
      required: true,
      index: true
    },
    score: {
      type: Number,
      required: true
    },
    totalQuestions: {
      type: Number,
      required: true
    },
    answers: [quizAnswerSchema],
    status: {
      type: String,
      enum: ['passed', 'needs_practice'],
      default: 'passed'
    },
    submittedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

quizSubmissionSchema.index({ studentId: 1, quizId: 1 });

export const QuizSubmission = mongoose.model('QuizSubmission', quizSubmissionSchema);
