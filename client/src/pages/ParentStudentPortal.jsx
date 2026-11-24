import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  studentsAPI,
  attendanceAPI,
  academicAPI,
  interventionsAPI,
  resourcesAPI
} from '../services/api';
import { Icon } from '../components/Icons';
import { AttendanceGauge } from '../components/AttendanceGauge';
import { PrintMarksheetModal } from '../components/PrintMarksheetModal';
import { AudioPlayerModal } from '../components/AudioPlayerModal';
import { RemedialQuizSection } from '../components/RemedialQuizSection';

export const ParentStudentPortal = ({ subTab = 'all' }) => {
  const { currentUser, role } = useAuth();
  const linkedStudentId = currentUser?.studentId;

  const [student, setStudent] = useState(null);
  const [attendanceData, setAttendanceData] = useState(null);
  const [academicData, setAcademicData] = useState(null);
  const [interventions, setInterventions] = useState([]);
  const [communications, setCommunications] = useState([]);
  const [resources, setResources] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modals state
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [selectedAudioResource, setSelectedAudioResource] = useState(null);

  const handleDirectDownload = (res) => {
    const downloadUrl = res.downloadUrl || resourcesAPI.getDownloadUrl(res._id);
    const safeTitle = (res.title || 'Lesson').replace(/[^a-zA-Z0-9]/g, '_');
    const filename = `GramShiksha_Class${res.classLevel || 8}_${res.subject}_${safeTitle}.mp3`;
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleMarkNoticeRead = async (noticeId) => {
    try {
      await communicationsAPI.markAsRead(noticeId);
      setCommunications(prev =>
        prev.map(c => (c._id === noticeId ? { ...c, readStatus: true, readAt: new Date() } : c))
      );
    } catch (err) {
      console.warn('Failed to mark notice read:', err);
    }
  };

  useEffect(() => {
    const fetchPortalData = async () => {
      if (!linkedStudentId) {
        setError('No student record is linked with this persona account.');
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        // Fetch all scoped endpoints in parallel
        const [studentRes, attRes, acadRes, intRes, resRes, commRes] = await Promise.all([
          studentsAPI.getStudentById(linkedStudentId),
          studentsAPI.getStudentAttendance(linkedStudentId),
          studentsAPI.getStudentAcademic(linkedStudentId),
          studentsAPI.getStudentInterventions(linkedStudentId),
          resourcesAPI.getAll(),
          communicationsAPI.getStudentCommunications(linkedStudentId).catch(() => ({ data: [] }))
        ]);

        if (studentRes.success) setStudent(studentRes.data);
        if (attRes.success) setAttendanceData(attRes);
        if (acadRes.success) setAcademicData(acadRes);
        if (intRes.success) setInterventions(intRes.data || []);
        if (resRes.success) setResources(resRes.data || []);
        if (commRes.data) setCommunications(commRes.data || []);
      } catch (err) {
        console.error('Failed to load child portal data:', err);
        setError(err.message || 'Error fetching child records.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPortalData();
  }, [linkedStudentId]);

  if (isLoading) {
    return (
      <div className="portal-loading-state">
        <div className="spinner"></div>
        <p>Loading your child's secure educational profile...</p>
        <span className="text-xs text-muted">Transmitting lightweight rural data packets</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="portal-error-card">
        <Icon name="alert-triangle" size={32} color="#dc2626" />
        <h3>Data Access Restriction</h3>
        <p>{error}</p>
        <button className="btn btn-primary mt-3" onClick={() => window.location.reload()}>
          <Icon name="refresh" size={14} /> Retry Sync
        </button>
      </div>
    );
  }

  const attSummary = attendanceData?.summary || {
    attendancePct: 0,
    totalDays: 0,
    presentDays: 0,
    absentDays: 0,
    lateDays: 0,
    streak: 0
  };

  const acadSummary = academicData?.summary || {
    overallPercentage: 0,
    overallGrade: '-',
    totalExams: 0
  };

  const acadRecords = academicData?.allRecords || [];

  return (
    <div className="parent-student-portal">
      {/* 1. Student Identity Card */}
      <div className="student-identity-card">
        <div className="student-avatar-badge">
          <Icon name="student" size={36} color="#0284c7" />
        </div>

        <div className="student-primary-info">
          <div className="flex items-center gap-2">
            <h2>{student?.fullName || 'Asha Jadhav'}</h2>
            <span className="badge badge-primary">Class {student?.className || '8'}</span>
            <span className="badge badge-outline">Roll No. #{student?.numericId || '1'}</span>
          </div>
          <p className="school-affiliation">
            <Icon name="school" size={14} /> {student?.schoolName || 'Zilla Parishad High School, Dahiwadi'}
          </p>
          <p className="parent-affiliation text-sm text-muted">
            <Icon name="parent" size={14} /> Guardian / Parent: <strong>{student?.parentName || 'Savita Jadhav'}</strong> • Contact: {student?.parentContact || '+91 98221 44521'}
          </p>
        </div>

        <div className="identity-actions">
          <button
            className="btn btn-primary"
            onClick={() => setShowPrintModal(true)}
            title="Download or Print Official CCE Marksheet"
          >
            <Icon name="printer" size={16} />
            <span>Print Marksheet</span>
          </button>
          <div className="privacy-pill">
            <Icon name="shield" size={12} color="#059669" />
            <span>Encrypted Learner Vault</span>
          </div>
        </div>
      </div>

      {/* 2. Key Metrics Overview Row */}
      <div className="portal-metrics-grid">
        {/* Attendance Widget */}
        <div className="portal-metric-card">
          <div className="card-header-clean">
            <div className="flex items-center gap-2">
              <Icon name="calendar" size={18} color="#059669" />
              <h3>Attendance Health</h3>
            </div>
            {attSummary.streak > 0 && (
              <span className="streak-badge">
                🔥 {attSummary.streak}-Day Streak
              </span>
            )}
          </div>

          <div className="gauge-row">
            <AttendanceGauge percentage={attSummary.attendancePct} size={110} strokeWidth={9} />
            <div className="attendance-counts-list">
              <div className="count-row text-success">
                <span className="dot dot-success"></span>
                <span>Present Days:</span>
                <strong>{attSummary.presentDays}</strong>
              </div>
              <div className="count-row text-danger">
                <span className="dot dot-danger"></span>
                <span>Absences:</span>
                <strong>{attSummary.absentDays}</strong>
              </div>
              <div className="count-row text-warning">
                <span className="dot dot-warning"></span>
                <span>Late Arrivals:</span>
                <strong>{attSummary.lateDays}</strong>
              </div>
              <div className="count-row text-muted text-xs pt-1 border-t">
                <span>Total School Days:</span>
                <strong>{attSummary.totalDays}</strong>
              </div>
            </div>
          </div>

          {attSummary.absentDays > 0 ? (
            <div className="absence-notice-box">
              <Icon name="alert-triangle" size={14} color="#d97706" />
              <span>
                {attSummary.absentDays} absence(s) noted. Maintaining &gt;75% attendance ensures eligibility for annual exams under RTE.
              </span>
            </div>
          ) : (
            <div className="absence-notice-box success">
              <Icon name="check-circle" size={14} color="#059669" />
              <span>Flawless attendance record! Keep up the daily learning consistency.</span>
            </div>
          )}
        </div>

        {/* Academic Aggregate Card */}
        <div className="portal-metric-card">
          <div className="card-header-clean">
            <div className="flex items-center gap-2">
              <Icon name="file-text" size={18} color="#4f46e5" />
              <h3>CCE Unit Test 1 Aggregate</h3>
            </div>
            <span className="badge badge-accent">Grade {acadSummary.overallGrade}</span>
          </div>

          <div className="academic-score-display">
            <div className="score-big">
              <span className="score-num">{acadSummary.overallPercentage}%</span>
              <span className="score-label">Class Average: 64%</span>
            </div>
            <div className="score-summary-tags">
              <div className="score-tag">
                <span className="label">Evaluation:</span>
                <span className="val">Unit Test 1 (CCE)</span>
              </div>
              <div className="score-tag">
                <span className="label">Subjects Evaluated:</span>
                <span className="val">{acadRecords.length} Subjects</span>
              </div>
              <div className="score-tag">
                <span className="label">RTE Learning Status:</span>
                <span className="val text-success">Proficient / Passed</span>
              </div>
            </div>
          </div>

          <p className="academic-praise text-sm">
            "{student?.fullName} demonstrates steady analytical aptitude, particularly in diagrams and science experiments."
          </p>
        </div>
      </div>

      {/* 3. Detailed Academic Marksheet Table */}
      {(subTab === 'all' || subTab === 'academic') && (
        <div className="portal-section-card">
          <div className="section-card-header">
            <div className="flex items-center gap-2">
              <Icon name="book" size={18} color="#0284c7" />
              <h3>Subject-Wise Performance & Teacher Guidance</h3>
            </div>
            <span className="text-xs text-muted">Continuous and Comprehensive Evaluation Ledger</span>
          </div>

          <div className="table-responsive">
            <table className="portal-table">
              <thead>
                <tr>
                  <th>Subject</th>
                  <th>Evaluation Exam</th>
                  <th>Marks Obtained</th>
                  <th>Percentage</th>
                  <th>Grade</th>
                  <th>Teacher's Learning Advice</th>
                </tr>
              </thead>
              <tbody>
                {acadRecords.map((item, idx) => {
                  const pct = Math.round((item.marksObtained / item.maxMarks) * 100);
                  let grade = 'D';
                  if (pct >= 85) grade = 'A+';
                  else if (pct >= 70) grade = 'A';
                  else if (pct >= 55) grade = 'B';
                  else if (pct >= 40) grade = 'C';

                  return (
                    <tr key={item._id || idx}>
                      <td className="font-semibold text-primary">{item.subject}</td>
                      <td>{item.examName}</td>
                      <td>
                        <span className="font-bold">{item.marksObtained}</span> / {item.maxMarks}
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          <div className="mini-progress-bar">
                            <div
                              className="mini-progress-fill"
                              style={{
                                width: `${pct}%`,
                                backgroundColor: pct >= 75 ? '#10b981' : pct >= 60 ? '#f59e0b' : '#ef4444'
                              }}
                            ></div>
                          </div>
                          <span className="font-mono text-xs">{pct}%</span>
                        </div>
                      </td>
                      <td>
                        <span className={`grade-tag grade-${grade.toLowerCase().replace('+', 'plus')}`}>
                          {grade}
                        </span>
                      </td>
                      <td className="text-sm text-muted">{item.remarks || 'Regular revision recommended.'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. Remedial Practice Quizzes & Micro-Assessments */}
      {(subTab === 'all' || subTab === 'quizzes' || subTab === 'academic') && (
        <RemedialQuizSection studentId={linkedStudentId} classLevel={student?.className} />
      )}

      {/* 5. Real-Time Teacher Notice & Communication Desk (ERP Feed) */}
      {(subTab === 'all' || subTab === 'notices' || subTab === 'interventions') && (
        <div className="portal-section-card">
          <div className="section-card-header">
            <div className="flex items-center gap-2">
              <Icon name="message-square" size={18} color="#4f46e5" />
              <h3>Teacher Notice & Direct Communication Desk</h3>
            </div>
            <div className="flex items-center gap-2">
              {communications.filter(c => !c.readStatus).length > 0 && (
                <span className="badge badge-warning" style={{ fontWeight: 'bold' }}>
                  🔔 {communications.filter(c => !c.readStatus).length} Unread Notice{communications.filter(c => !c.readStatus).length > 1 ? 's' : ''}
                </span>
              )}
              <span className="badge badge-outline">Live ERP Feed</span>
            </div>
          </div>

          {communications.length === 0 ? (
            <div className="empty-interventions-state">
              <Icon name="check-circle" size={28} color="#059669" />
              <p className="font-semibold mt-1">No Active Teacher Notices</p>
              <span className="text-xs text-muted">
                Your child's class teacher has not posted any pending attendance warnings or academic notices.
              </span>
            </div>
          ) : (
            <div className="intervention-timeline">
              {communications.map((comm, idx) => {
                const isUrgent = comm.isUrgent || comm.category === 'attendance_alert' || comm.category === 'urgent_call';
                const createdDate = comm.createdAt ? new Date(comm.createdAt).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric'
                }) : 'Today';

                return (
                  <div
                    key={comm._id || idx}
                    className={`timeline-entry ${isUrgent ? 'open' : 'resolved'}`}
                    style={{
                      borderLeft: isUrgent ? '4px solid #ef4444' : '4px solid #4f46e5',
                      backgroundColor: comm.readStatus ? 'transparent' : '#f8fafc',
                      padding: '1rem',
                      marginBottom: '0.75rem',
                      borderRadius: 'var(--radius-sm)',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                    }}
                  >
                    <div className="flex justify-between items-start flex-wrap gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`badge ${isUrgent ? 'badge-danger' : 'badge-primary'}`}
                          style={{ fontSize: '0.75rem', textTransform: 'uppercase' }}
                        >
                          {comm.category ? comm.category.replace('_', ' ') : 'NOTICE'}
                        </span>
                        {isUrgent && (
                          <span className="badge badge-danger" style={{ fontWeight: 'bold' }}>
                            🚨 Urgent
                          </span>
                        )}
                        <h4 className="font-bold text-base" style={{ margin: 0 }}>{comm.title}</h4>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted">
                          <Icon name="clock" size={12} /> {createdDate}
                        </span>
                        {comm.readStatus ? (
                          <span className="status-pill status-resolved" style={{ fontSize: '0.75rem' }}>
                            ✓ Seen
                          </span>
                        ) : (
                          <button
                            type="button"
                            className="btn btn-outline btn-sm"
                            style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}
                            onClick={() => handleMarkNoticeRead(comm._id)}
                          >
                            Mark as Read
                          </button>
                        )}
                      </div>
                    </div>

                    <p className="mt-2 text-sm" style={{ color: 'var(--text-main)', lineHeight: 1.5 }}>
                      {comm.messageText}
                    </p>

                    <div className="mt-2 pt-2 border-t flex justify-between items-center text-xs text-muted">
                      <span>
                        Sent by: <strong>{comm.senderTeacherName || 'Class Teacher'}</strong> (Class {comm.classLevel || student?.className})
                      </span>
                      {comm.readStatus && comm.readAt && (
                        <span>
                          Acknowledged: {new Date(comm.readAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 6. Teacher Outreach & Proactive Interventions History */}
      {(subTab === 'all' || subTab === 'interventions') && (
        <div className="portal-section-card">
          <div className="section-card-header">
            <div className="flex items-center gap-2">
              <Icon name="teacher" size={18} color="#d97706" />
              <h3>Teacher-Parent Communication & Outreach History</h3>
            </div>
            <span className="badge badge-outline">Documented Interventions</span>
          </div>

          {interventions.length === 0 ? (
            <div className="empty-interventions-state">
              <Icon name="check-circle" size={28} color="#059669" />
              <p className="font-semibold mt-1">No Active Disciplinary or Attendance Concerns</p>
              <span className="text-xs text-muted">
                Your child is attending school consistently. No special remedial home visits are pending.
              </span>
            </div>
          ) : (
            <div className="intervention-timeline">
              {interventions.map((inv, idx) => (
                <div key={inv._id || idx} className={`timeline-entry ${inv.status}`}>
                  <div className="timeline-badge">
                    <Icon name={inv.interventionType === 'parent_contact' ? 'phone' : 'teacher'} size={14} />
                  </div>
                  <div className="timeline-content">
                    <div className="flex justify-between items-center">
                      <h4 className="font-bold">
                        {inv.interventionType.replace('_', ' ').toUpperCase()} • {inv.createdOn}
                      </h4>
                      <span className={`status-pill status-${inv.status}`}>
                        {inv.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                    <p className="timeline-concern">
                      <strong>Concern Discussed:</strong> {inv.concern}
                    </p>
                    <p className="timeline-action">
                      <strong>Action / Advice:</strong> {inv.actionTaken}
                    </p>
                    {inv.followUpDate && (
                      <p className="timeline-followup text-xs text-muted">
                        <Icon name="clock" size={12} /> Scheduled Follow-up: {inv.followUpDate}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 5. Offline Learning Resources & Audio Lessons */}
      {(subTab === 'all' || subTab === 'resources') && (
        <div className="portal-section-card">
          <div className="section-card-header">
            <div className="flex items-center gap-2">
              <Icon name="book" size={18} color="#059669" />
              <h3>Offline Revision Lessons & Audio Capsules</h3>
            </div>
            <span className="text-xs text-muted">Designed for patchy 2G/3G networks</span>
          </div>

          <div className="resources-card-grid">
            {resources.map((res, index) => (
              <div key={res._id || index} className="resource-portal-card">
                <div className="resource-card-top">
                  <span className={`badge ${res.resourceType === 'audio' ? 'badge-audio' : 'badge-text'}`}>
                    <Icon name={res.resourceType === 'audio' ? 'volume' : 'file-text'} size={12} />
                    {res.resourceType.toUpperCase()}
                  </span>
                  <span className="text-xs text-muted font-mono">{res.downloadSize}</span>
                </div>

                <h4 className="resource-title">{res.title}</h4>
                <p className="resource-desc text-xs text-muted">{res.description}</p>

                <div className="resource-card-footer">
                  <span className="text-xs font-semibold text-primary">{res.subject}</span>
                  {res.resourceType === 'audio' ? (
                    <div className="flex items-center gap-2">
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => setSelectedAudioResource(res)}
                      >
                        <Icon name="volume" size={14} /> ▶ Listen Lesson
                      </button>
                      <button
                        className="btn btn-outline btn-sm"
                        onClick={() => handleDirectDownload(res)}
                        title="Download audio file for offline village study"
                      >
                        <Icon name="download" size={14} /> ⬇ Download
                      </button>
                    </div>
                  ) : (
                    <button
                      className="btn btn-outline btn-sm"
                      onClick={() => {
                        alert(`Offline text summary saved! File size: ${res.downloadSize}. Content:\n\n${res.content}`);
                      }}
                    >
                      <Icon name="download" size={14} /> Save Text ({res.duration})
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Printable Marksheet Modal */}
      {showPrintModal && (
        <PrintMarksheetModal
          student={student}
          academicSummary={academicData}
          onClose={() => setShowPrintModal(false)}
        />
      )}

      {/* Audio Capsule Modal */}
      {selectedAudioResource && (
        <AudioPlayerModal
          resource={selectedAudioResource}
          onClose={() => setSelectedAudioResource(null)}
        />
      )}
    </div>
  );
};
