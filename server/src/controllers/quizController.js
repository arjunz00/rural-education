import { Quiz } from '../models/Quiz.js';
import { QuizSubmission } from '../models/QuizSubmission.js';
import { Student } from '../models/Student.js';
import { FAMILY_ROLES } from '../config/constants.js';

export const getQuizzes = async (req, res, next) => {
  try {
    const { classLevel, studentId, subject } = req.query;
    const filter = {};

    if (classLevel) {
      filter.classLevel = Number(classLevel);
    }

    if (subject && subject !== 'All') {
      filter.subject = subject;
    }

    // Role-based privacy scoping for parent and student
    let effectiveStudentId = studentId ? Number(studentId) : null;
    if (FAMILY_ROLES.includes(req.user.role)) {
      if (effectiveStudentId && effectiveStudentId !== req.user.studentId) {
        return res.status(403).json({
          success: false,
          error: `Access Denied: You are only authorized to access quizzes for your linked learner (#${req.user.studentId}).`
        });
      }
      effectiveStudentId = req.user.studentId;
    }

    if (effectiveStudentId) {
      filter.$or = [
        { targetCategory: 'all' },
        { assignedStudentIds: effectiveStudentId }
      ];
    }

    const quizzes = await Quiz.find(filter).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: quizzes.length,
      data: quizzes
    });
  } catch (err) {
    next(err);
  }
};

export const getQuizById = async (req, res, next) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) {
      return res.status(404).json({
        success: false,
        error: 'Quiz not found.'
      });
    }

    // For students/parents taking the quiz, do not reveal correctOptionIndex upfront if requested as student
    return res.status(200).json({
      success: true,
      data: quiz
    });
  } catch (err) {
    next(err);
  }
};

export const createQuiz = async (req, res, next) => {
  try {
    const {
      title,
      classLevel,
      subject,
      targetCategory,
      assignedStudentIds,
      questions
    } = req.body;

    if (!title || !classLevel || !subject || !questions || !questions.length) {
      return res.status(400).json({
        success: false,
        error: 'Please provide title, classLevel, subject, and at least one question.'
      });
    }

    const quiz = await Quiz.create({
      title: title.trim(),
      classLevel: Number(classLevel),
      subject: subject.trim(),
      targetCategory: targetCategory || 'remedial_support',
      assignedStudentIds: Array.isArray(assignedStudentIds) ? assignedStudentIds.map(Number) : [],
      questions,
      createdBy: req.user.fullName || 'Teacher S. Deshmukh'
    });

    return res.status(201).json({
      success: true,
      message: 'Remedial quiz created and assigned successfully.',
      data: quiz
    });
  } catch (err) {
    next(err);
  }
};

export const submitQuiz = async (req, res, next) => {
  try {
    const quizId = req.params.id;
    const { studentId, answers } = req.body;

    const targetStudentId = Number(studentId);
    if (!targetStudentId) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a valid numeric studentId.'
      });
    }

    // Privacy check: Parent or Student cannot submit for another learner
    if (FAMILY_ROLES.includes(req.user.role) && targetStudentId !== req.user.studentId) {
      return res.status(403).json({
        success: false,
        error: `Access Denied: You cannot submit quiz attempts for student #${targetStudentId}.`
      });
    }

    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({
        success: false,
        error: 'Quiz not found.'
      });
    }

    if (!Array.isArray(answers)) {
      return res.status(400).json({
        success: false,
        error: 'Answers must be provided as an array.'
      });
    }

    let score = 0;
    const evaluatedAnswers = quiz.questions.map((q, idx) => {
      const submittedAns = answers.find(a => a.questionIndex === idx) || {};
      const selectedIndex = submittedAns.selectedOptionIndex !== undefined ? Number(submittedAns.selectedOptionIndex) : -1;
      const isCorrect = selectedIndex === q.correctOptionIndex;
      if (isCorrect) score++;

      return {
        questionIndex: idx,
        questionText: q.questionText,
        selectedOptionIndex: selectedIndex,
        correctOptionIndex: q.correctOptionIndex,
        isCorrect,
        explanation: q.explanation || ''
      };
    });

    const totalQuestions = quiz.questions.length;
    const percentage = totalQuestions > 0 ? (score / totalQuestions) * 100 : 0;
    const status = percentage >= 60 ? 'passed' : 'needs_practice';

    const submission = await QuizSubmission.create({
      quizId: quiz._id,
      studentId: targetStudentId,
      score,
      totalQuestions,
      answers: evaluatedAnswers.map(a => ({
        questionIndex: a.questionIndex,
        selectedOptionIndex: a.selectedOptionIndex,
        isCorrect: a.isCorrect
      })),
      status
    });

    return res.status(200).json({
      success: true,
      submissionId: submission._id,
      score,
      totalQuestions,
      percentage: Math.round(percentage),
      status,
      feedback: percentage >= 80
        ? '🎉 Outstanding mastery! Great job catching up.'
        : percentage >= 60
        ? '👍 Good progress! Review the explanations below.'
        : '💪 Needs more practice. Listen to the audio capsule and try again!',
      details: evaluatedAnswers
    });
  } catch (err) {
    next(err);
  }
};

export const getStudentSubmissions = async (req, res, next) => {
  try {
    const studentId = Number(req.params.studentId);
    if (!studentId) {
      return res.status(400).json({
        success: false,
        error: 'Invalid student ID parameter.'
      });
    }

    // Strict 1-to-1 Privacy check for parents and students
    if (FAMILY_ROLES.includes(req.user.role) && studentId !== req.user.studentId) {
      return res.status(403).json({
        success: false,
        error: `Access Denied: You are not authorized to view quiz results for student #${studentId}.`
      });
    }

    const submissions = await QuizSubmission.find({ studentId })
      .populate('quizId', 'title subject classLevel')
      .sort({ submittedAt: -1 });

    return res.status(200).json({
      success: true,
      count: submissions.length,
      data: submissions
    });
  } catch (err) {
    next(err);
  }
};
