import React, { useState, useEffect } from 'react';
import { quizzesAPI } from '../services/api';
import { Icon } from '../components/Icons';

export const RemedialQuizSection = ({ studentId, classLevel }) => {
  const [quizzes, setQuizzes] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [quizResult, setQuizResult] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [speakingIndex, setSpeakingIndex] = useState(null);

  useEffect(() => {
    if (studentId) {
      loadQuizData();
    }
  }, [studentId, classLevel]);

  const loadQuizData = async () => {
    setIsLoading(true);
    try {
      const [quizRes, subRes] = await Promise.all([
        quizzesAPI.getQuizzes({ studentId, classLevel }),
        quizzesAPI.getSubmissions(studentId)
      ]);
      if (quizRes.success) setQuizzes(quizRes.data || []);
      if (subRes.success) setSubmissions(subRes.data || []);
    } catch (err) {
      console.error('Failed to load remedial quizzes:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const startQuiz = (quiz) => {
    setActiveQuiz(quiz);
    setSelectedAnswers({});
    setQuizResult(null);
  };

  const handleSelectOption = (questionIndex, optionIndex) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionIndex]: optionIndex
    }));
  };

  const handleReadAloud = (text, qIdx) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setSpeakingIndex(qIdx);
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.onend = () => setSpeakingIndex(null);
      utterance.onerror = () => setSpeakingIndex(null);
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!activeQuiz) return;

    setIsSubmitting(true);
    try {
      const answersArray = activeQuiz.questions.map((q, idx) => ({
        questionIndex: idx,
        selectedOptionIndex: selectedAnswers[idx] !== undefined ? selectedAnswers[idx] : -1
      }));

      const res = await quizzesAPI.submitQuiz(activeQuiz._id, {
        studentId,
        answers: answersArray
      });

      if (res.success) {
        setQuizResult(res);
        // Refresh submissions
        const subRes = await quizzesAPI.getSubmissions(studentId);
        if (subRes.success) setSubmissions(subRes.data || []);
      }
    } catch (err) {
      alert(err.message || 'Failed to submit quiz attempt.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="portal-section-card">
      <div className="section-card-header">
        <div className="flex items-center gap-2">
          <Icon name="check-circle" size={18} color="#4f46e5" />
          <h3>🎯 Remedial Practice Quizzes & Micro-Assessments</h3>
        </div>
        <span className="badge badge-accent">Targeted Catch-Up Support</span>
      </div>

      {isLoading ? (
        <div className="text-center py-4 text-muted text-sm">
          Loading assigned practice quizzes...
        </div>
      ) : activeQuiz ? (
        /* Active Quiz Taking View */
        <div className="active-quiz-container" style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
          <div className="flex justify-between items-center mb-3">
            <div>
              <span className="badge badge-primary">{activeQuiz.subject}</span>
              <span className="text-xs text-muted ml-2">Class {activeQuiz.classLevel} Remedial Practice</span>
              <h4 className="font-bold text-lg mt-1">{activeQuiz.title}</h4>
            </div>
            <button
              className="btn btn-outline btn-sm"
              onClick={() => setActiveQuiz(null)}
            >
              Cancel
            </button>
          </div>

          {!quizResult ? (
            <form onSubmit={handleSubmit}>
              <div className="quiz-questions-list" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {activeQuiz.questions.map((q, qIdx) => (
                  <div key={qIdx} className="quiz-question-card" style={{ background: '#ffffff', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-bold text-sm">
                        Q{qIdx + 1}. {q.questionText}
                      </span>
                      <button
                        type="button"
                        className="btn-icon"
                        onClick={() => handleReadAloud(q.questionText, qIdx)}
                        title="Voice Read-Aloud for low-literacy or audio assistance"
                        style={{ color: speakingIndex === qIdx ? '#059669' : 'var(--text-muted)' }}
                      >
                        <Icon name="volume" size={16} />
                      </button>
                    </div>

                    <div className="quiz-options-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginTop: '0.5rem' }}>
                      {q.options.map((opt, optIdx) => (
                        <label
                          key={optIdx}
                          className="quiz-option-label"
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.5rem 0.75rem',
                            borderRadius: 'var(--radius-sm)',
                            border: '1px solid',
                            borderColor: selectedAnswers[qIdx] === optIdx ? 'var(--primary)' : 'var(--border-color)',
                            backgroundColor: selectedAnswers[qIdx] === optIdx ? 'var(--primary-light)' : '#ffffff',
                            cursor: 'pointer',
                            fontSize: '0.875rem'
                          }}
                        >
                          <input
                            type="radio"
                            name={`q_${qIdx}`}
                            checked={selectedAnswers[qIdx] === optIdx}
                            onChange={() => handleSelectOption(qIdx, optIdx)}
                          />
                          <span>{opt}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center mt-4">
                <span className="text-xs text-muted">
                  Answer all questions carefully. Immediate explanations will be provided!
                </span>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Evaluating...' : 'Submit Answers & View Score'}
                </button>
              </div>
            </form>
          ) : (
            /* Instant Quiz Result View */
            <div className="quiz-result-view">
              <div
                className="quiz-result-banner"
                style={{
                  padding: '1rem 1.25rem',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: quizResult.percentage >= 60 ? '#ecfdf5' : '#fffbeb',
                  border: `1px solid ${quizResult.percentage >= 60 ? '#a7f3d0' : '#fde68a'}`,
                  marginBottom: '1rem'
                }}
              >
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-lg" style={{ color: quizResult.percentage >= 60 ? '#047857' : '#b45309' }}>
                    Score: {quizResult.score} / {quizResult.totalQuestions} ({quizResult.percentage}%)
                  </h4>
                  <span className={`badge ${quizResult.status === 'passed' ? 'badge-success' : 'badge-warning'}`}>
                    {quizResult.status === 'passed' ? 'PASSED' : 'NEEDS PRACTICE'}
                  </span>
                </div>
                <p className="text-sm mt-1">{quizResult.feedback}</p>
              </div>

              {/* Explanations List */}
              <div className="quiz-explanations-list" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <h5 className="font-bold text-sm">Review & Teacher Explanations:</h5>
                {quizResult.details?.map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: '0.75rem',
                      borderRadius: 'var(--radius-sm)',
                      background: '#ffffff',
                      border: '1px solid var(--border-color)',
                      borderLeft: `4px solid ${item.isCorrect ? '#059669' : '#dc2626'}`
                    }}
                  >
                    <p className="font-bold text-sm mb-1">
                      {idx + 1}. {item.questionText}
                    </p>
                    <p className="text-xs text-muted">
                      Your Answer: <strong>{item.selectedOptionIndex >= 0 ? activeQuiz.questions[idx].options[item.selectedOptionIndex] : 'Not answered'}</strong> • {item.isCorrect ? '✅ Correct' : '❌ Incorrect'}
                    </p>
                    {!item.isCorrect && (
                      <p className="text-xs text-success font-semibold">
                        Correct Answer: {activeQuiz.questions[idx].options[item.correctOptionIndex]}
                      </p>
                    )}
                    {item.explanation && (
                      <p className="text-xs text-muted mt-1" style={{ background: '#f8fafc', padding: '0.35rem 0.5rem', borderRadius: '4px' }}>
                        💡 <strong>Concept Note:</strong> {item.explanation}
                      </p>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center mt-4">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => startQuiz(activeQuiz)}
                >
                  <Icon name="refresh" size={14} /> Retake Quiz
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => {
                    setActiveQuiz(null);
                    setQuizResult(null);
                  }}
                >
                  Done & Back to Portal
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Quizzes List & Past Performance View */
        <div>
          {quizzes.length === 0 ? (
            <div className="empty-interventions-state">
              <Icon name="check-circle" size={28} color="#059669" />
              <p className="font-semibold mt-1">No Active Remedial Quizzes Assigned</p>
              <span className="text-xs text-muted">
                Student academic performance is in the safe zone. Routine monitoring continues.
              </span>
            </div>
          ) : (
            <div className="quiz-cards-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '0.75rem', marginBottom: '1.25rem' }}>
              {quizzes.map((q) => {
                const latestSub = submissions.find(s => s.quizId?._id === q._id || s.quizId === q._id);
                return (
                  <div key={q._id} className="resource-portal-card" style={{ borderLeft: '3px solid #4f46e5' }}>
                    <div className="resource-card-top">
                      <span className="badge badge-primary">{q.subject}</span>
                      <span className="text-xs text-muted font-mono">{q.questions?.length || 3} Questions</span>
                    </div>

                    <h4 className="resource-title" style={{ fontSize: '0.9rem', margin: '0.35rem 0' }}>{q.title}</h4>
                    <p className="resource-desc text-xs text-muted">
                      Targeted micro-quiz assigned by {q.createdBy}. High-impact practice for key foundational concepts.
                    </p>

                    {latestSub && (
                      <div className="mt-2 text-xs" style={{ background: '#f8fafc', padding: '0.3rem 0.5rem', borderRadius: '4px' }}>
                        <span>Latest Score: <strong>{latestSub.score}/{latestSub.totalQuestions}</strong> ({latestSub.status})</span>
                      </div>
                    )}

                    <div className="resource-card-footer mt-3">
                      <span className="text-xs text-muted">Estimated: 3 mins</span>
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => startQuiz(q)}
                      >
                        <Icon name="zap" size={14} /> {latestSub ? 'Retake Quiz' : 'Start Practice Quiz'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Past Submissions History Table */}
          {submissions.length > 0 && (
            <div className="mt-3">
              <h5 className="font-bold text-xs text-muted uppercase tracking-wider mb-2">Quiz History & Remedial Progress:</h5>
              <div className="table-responsive">
                <table className="portal-table">
                  <thead>
                    <tr>
                      <th>Quiz Name</th>
                      <th>Subject</th>
                      <th>Score</th>
                      <th>Result</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {submissions.map((sub, idx) => (
                      <tr key={sub._id || idx}>
                        <td className="font-semibold">{sub.quizId?.title || 'Practice Quiz'}</td>
                        <td>{sub.quizId?.subject || 'Mathematics'}</td>
                        <td><span className="font-mono font-bold">{sub.score} / {sub.totalQuestions}</span></td>
                        <td>
                          <span className={`badge ${sub.status === 'passed' ? 'badge-success' : 'badge-warning'}`}>
                            {sub.status ? sub.status.toUpperCase() : 'COMPLETED'}
                          </span>
                        </td>
                        <td className="text-muted text-xs">
                          {new Date(sub.submittedAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
