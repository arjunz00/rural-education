import React, { useState, useEffect } from 'react';
import { studentsAPI, attendanceAPI, riskAPI, interventionsAPI, communicationsAPI, teacherAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Icon } from '../components/Icons';

export const TeacherDashboard = () => {
  const { currentUser } = useAuth();
  const defaultClass = currentUser?.assignedClass ? String(currentUser.assignedClass) : '8';

  const [selectedClass, setSelectedClass] = useState(defaultClass);
  const [students, setStudents] = useState([]);
  const [pendingStudents, setPendingStudents] = useState([]);
  const [enrollmentActionMsg, setEnrollmentActionMsg] = useState(null);
  const [attendanceDate, setAttendanceDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [rollCall, setRollCall] = useState({}); // { [studentId]: { status: 'present', notes: '' } }
  const [riskMap, setRiskMap] = useState({}); // { [studentId]: riskObj }
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Intervention modal
  const [showInterventionModal, setShowInterventionModal] = useState(false);
  const [targetStudentForIntervention, setTargetStudentForIntervention] = useState(null);
  const [interventionForm, setInterventionForm] = useState({
    concern: '',
    actionTaken: '',
    interventionType: 'parent_contact',
    followUpDate: ''
  });

  // Direct Communication Modal
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [targetStudentForMessage, setTargetStudentForMessage] = useState(null);
  const [messageForm, setMessageForm] = useState({
    title: '',
    messageText: '',
    category: 'attendance_alert',
    isUrgent: false
  });
  const [isSendingMessage, setIsSendingMessage] = useState(false);

  // Class Broadcast Modal
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [broadcastForm, setBroadcastForm] = useState({
    title: '',
    messageText: '',
    category: 'general_notice',
    isUrgent: false
  });
  const [isSendingBroadcast, setIsSendingBroadcast] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, [attendanceDate, selectedClass]);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const [stuRes, attRes, riskRes, pendingRes] = await Promise.all([
        studentsAPI.getStudents({ className: selectedClass }),
        attendanceAPI.getRecords({ date: attendanceDate }),
        riskAPI.getAssessments(),
        teacherAPI.getPendingStudents().catch(() => ({ data: [] }))
      ]);

      // Filter out unverified pending students from daily roll call
      const stuList = (stuRes.data || []).filter(s => s.enrollmentStatus !== 'pending' && s.enrollmentStatus !== 'rejected');
      setStudents(stuList);

      // Scoped pending students for this class
      const classPending = (pendingRes.data || []).filter(s => String(s.className) === String(selectedClass));
      setPendingStudents(classPending);

      // Build rollCall map from existing records or default to 'present'
      const existingAtt = attRes.data || [];
      const newRollCall = {};
      stuList.forEach(s => {
        const found = existingAtt.find(a => a.studentId === s.numericId);
        newRollCall[s.numericId] = {
          status: found ? found.status : 'present',
          notes: found ? found.notes : ''
        };
      });
      setRollCall(newRollCall);

      // Build risk map
      const rMap = {};
      (riskRes.assessments || []).forEach(a => {
        rMap[a.studentId] = a;
      });
      setRiskMap(rMap);
    } catch (err) {
      console.error('Failed to load teacher dashboard:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproveStudent = async (studentId) => {
    try {
      const res = await teacherAPI.approveStudent(studentId);
      setPendingStudents(prev => prev.filter(s => s._id !== studentId && s.numericId !== studentId));
      setEnrollmentActionMsg({ type: 'success', text: res.message || 'Student enrolled in class roll!' });
      setTimeout(() => setEnrollmentActionMsg(null), 5000);
      loadDashboardData();
    } catch (err) {
      setEnrollmentActionMsg({ type: 'error', text: err.message || 'Failed to enroll student.' });
    }
  };

  const handleRejectStudent = async (studentId) => {
    const reason = window.prompt('Please enter rejection reason (optional):', 'Address outside school catchment area');
    if (reason === null) return;
    try {
      const res = await teacherAPI.rejectStudent(studentId, reason);
      setPendingStudents(prev => prev.filter(s => s._id !== studentId && s.numericId !== studentId));
      setEnrollmentActionMsg({ type: 'success', text: res.message || 'Student registration rejected.' });
      setTimeout(() => setEnrollmentActionMsg(null), 5000);
    } catch (err) {
      setEnrollmentActionMsg({ type: 'error', text: err.message || 'Failed to reject student.' });
    }
  };

  const handleStatusChange = (studentId, status) => {
    setRollCall(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        status
      }
    }));
  };

  const handleNotesChange = (studentId, notes) => {
    setRollCall(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        notes
      }
    }));
  };

  const handleSaveBulkRollCall = async () => {
    setIsSaving(true);
    setSaveMessage(null);

    const records = Object.keys(rollCall).map(id => ({
      studentId: Number(id),
      status: rollCall[id].status,
      notes: rollCall[id].notes || ''
    }));

    try {
      await attendanceAPI.bulkAttendance({
        attendanceDate,
        records
      });
      setSaveMessage({ type: 'success', text: `✓ Roll call saved successfully for ${records.length} students on ${attendanceDate}!` });
      setTimeout(() => setSaveMessage(null), 4000);
    } catch (err) {
      setSaveMessage({ type: 'error', text: err.message || 'Failed to save roll call.' });
    } finally {
      setIsSaving(false);
    }
  };

  // Open Direct Message Modal
  const handleOpenMessageModal = (student) => {
    setTargetStudentForMessage(student);
    const risk = riskMap[student.numericId];
    const isConsecutiveAlert = risk?.hasCriticalAlert;

    setMessageForm({
      title: isConsecutiveAlert
        ? `⚠️ Attendance Alert: ${student.fullName} Missed Consecutive Classes`
        : `Academic Update: ${student.fullName}`,
      messageText: isConsecutiveAlert
        ? `Namaste ${student.parentName} ji, ${student.fullName} has missed multiple morning roll calls this week. Please call or visit the school so we can prevent learning loss.`
        : `Namaste ${student.parentName} ji, please check this update regarding ${student.fullName}'s daily coursework and classroom participation.`,
      category: isConsecutiveAlert ? 'attendance_alert' : 'academic_feedback',
      isUrgent: Boolean(isConsecutiveAlert)
    });
    setShowMessageModal(true);
  };

  // Dispatch Direct Message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!targetStudentForMessage) return;

    setIsSendingMessage(true);
    try {
      await communicationsAPI.sendMessage({
        studentId: targetStudentForMessage.numericId,
        title: messageForm.title,
        messageText: messageForm.messageText,
        category: messageForm.category,
        isUrgent: messageForm.isUrgent
      });
      setShowMessageModal(false);
      setSaveMessage({
        type: 'success',
        text: `✓ Direct notice dispatched to ${targetStudentForMessage.parentName} (Parent of ${targetStudentForMessage.fullName})!`
      });
      setTimeout(() => setSaveMessage(null), 4000);
    } catch (err) {
      alert(`Failed to send communication: ${err.message}`);
    } finally {
      setIsSendingMessage(false);
    }
  };

  // Dispatch Broadcast Message
  const handleSendBroadcast = async (e) => {
    e.preventDefault();
    setIsSendingBroadcast(true);

    try {
      const res = await communicationsAPI.broadcastToClass({
        classLevel: selectedClass,
        title: broadcastForm.title,
        messageText: broadcastForm.messageText,
        category: broadcastForm.category,
        isUrgent: broadcastForm.isUrgent
      });
      setShowBroadcastModal(false);
      setSaveMessage({
        type: 'success',
        text: `✓ Class announcement delivered to all ${res.count || 'all'} parents of Class ${selectedClass}!`
      });
      setTimeout(() => setSaveMessage(null), 4000);
    } catch (err) {
      alert(`Failed to broadcast notice: ${err.message}`);
    } finally {
      setIsSendingBroadcast(false);
    }
  };

  const handleOpenInterventionModal = (student) => {
    setTargetStudentForIntervention(student);
    const risk = riskMap[student.numericId];
    setInterventionForm({
      concern: risk ? risk.reasons.join(', ') : 'Irregular attendance noticed during morning roll call.',
      actionTaken: '',
      interventionType: 'parent_contact',
      followUpDate: ''
    });
    setShowInterventionModal(true);
  };

  const handleCreateIntervention = async (e) => {
    e.preventDefault();
    if (!targetStudentForIntervention) return;

    try {
      await interventionsAPI.create({
        studentId: targetStudentForIntervention.numericId,
        interventionType: interventionForm.interventionType,
        concern: interventionForm.concern,
        actionTaken: interventionForm.actionTaken,
        followUpDate: interventionForm.followUpDate || null
      });
      setShowInterventionModal(false);
      alert(`Intervention recorded for ${targetStudentForIntervention.fullName}!`);
      loadDashboardData();
    } catch (err) {
      alert(`Failed to save intervention: ${err.message}`);
    }
  };

  // Quick Stats Calculation
  const total = students.length;
  let presentCount = 0;
  let absentCount = 0;
  let lateCount = 0;

  Object.values(rollCall).forEach(val => {
    if (val.status === 'present') presentCount++;
    else if (val.status === 'absent') absentCount++;
    else if (val.status === 'late') lateCount++;
  });

  const todayPct = total > 0 ? Math.round(((presentCount + lateCount * 0.5) / total) * 100) : 0;

  return (
    <div className="teacher-dashboard">
      {/* Page Header */}
      <div className="dashboard-top-header">
        <div>
          <h2>👨‍🏫 Class {selectedClass} Roll Call & Daily Monitoring</h2>
          <p className="text-sm text-muted">
            {currentUser?.schoolName || 'Zilla Parishad High School, Dahiwadi'} • Class Teacher: {currentUser?.fullName || 'S. Deshmukh'}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Class Selector Dropdown */}
          <div className="flex items-center gap-1">
            <span className="text-xs font-bold text-muted">Class:</span>
            <select
              className="form-control"
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              style={{ minWidth: '100px', fontWeight: 'bold' }}
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(c => (
                <option key={c} value={String(c)}>Class {c}</option>
              ))}
            </select>
          </div>

          <div className="date-picker-wrap">
            <label htmlFor="rollDate" className="text-xs font-semibold mr-1">Date:</label>
            <input
              id="rollDate"
              type="date"
              className="form-control date-input"
              value={attendanceDate}
              onChange={(e) => setAttendanceDate(e.target.value)}
            />
          </div>

          {/* Broadcast to Class Button */}
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={() => {
              setBroadcastForm({
                title: `Class ${selectedClass} Notice: `,
                messageText: '',
                category: 'general_notice',
                isUrgent: false
              });
              setShowBroadcastModal(true);
            }}
            title="Broadcast announcement to all parents of Class"
          >
            <Icon name="phone" size={14} /> Broadcast Notice
          </button>
        </div>
      </div>

      {/* Summary KPI Badges */}
      <div className="quick-kpi-grid">
        <div className="kpi-card">
          <span className="kpi-label">Class Attendance</span>
          <span className="kpi-value text-primary">{todayPct}%</span>
          <span className="kpi-sub">{presentCount} of {total} present today</span>
        </div>
        <div className="kpi-card">
          <span className="kpi-label">Present</span>
          <span className="kpi-value text-success">{presentCount}</span>
          <span className="kpi-sub">On-time attendees</span>
        </div>
        <div className="kpi-card">
          <span className="kpi-label">Absences</span>
          <span className="kpi-value text-danger">{absentCount}</span>
          <span className="kpi-sub">Requires follow-up</span>
        </div>
        <div className="kpi-card">
          <span className="kpi-label">Late Arrivals</span>
          <span className="kpi-value text-warning">{lateCount}</span>
          <span className="kpi-sub">Transport/commute delays</span>
        </div>
      </div>

      {saveMessage && (
        <div className={`alert-banner alert-${saveMessage.type}`}>
          <Icon name={saveMessage.type === 'success' ? 'check-circle' : 'alert-triangle'} size={16} />
          <span>{saveMessage.text}</span>
        </div>
      )}

      {/* Enrollment Action Message */}
      {enrollmentActionMsg && (
        <div
          className="login-error-alert mb-3"
          style={{
            backgroundColor: enrollmentActionMsg.type === 'success' ? '#ecfdf5' : '#fef2f2',
            borderColor: enrollmentActionMsg.type === 'success' ? '#a7f3d0' : '#fecaca',
            color: enrollmentActionMsg.type === 'success' ? '#047857' : '#b91c1c'
          }}
        >
          <Icon name={enrollmentActionMsg.type === 'success' ? 'check-circle' : 'alert-triangle'} size={16} />
          <span>{enrollmentActionMsg.text}</span>
        </div>
      )}

      {/* Tier 2: Student Enrollment & Verification Desk */}
      <div className="portal-section-card mb-4">
        <div className="section-card-header">
          <div className="flex items-center gap-2">
            <Icon name="user-check" size={18} color="#0284c7" />
            <h3>Class {selectedClass} Student Enrollment & Admission Desk</h3>
          </div>
          <div className="flex items-center gap-2">
            {pendingStudents.length > 0 ? (
              <span className="badge badge-warning" style={{ fontWeight: 'bold' }}>
                🔔 {pendingStudents.length} Admission{pendingStudents.length > 1 ? 's' : ''} Awaiting Verification
              </span>
            ) : (
              <span className="badge badge-success">✓ Roster Up-to-Date</span>
            )}
            <span className="badge badge-outline">Class Teacher Authority</span>
          </div>
        </div>

        {pendingStudents.length === 0 ? (
          <div className="empty-interventions-state py-3 text-center">
            <Icon name="check-circle" size={20} color="#059669" />
            <p className="font-semibold text-sm mt-1">No Pending Student Admissions</p>
            <span className="text-xs text-muted">
              All students registered for Class {selectedClass} are formally admitted into the official roll call.
            </span>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="portal-table">
              <thead>
                <tr>
                  <th>Applicant Student</th>
                  <th>Parent / Guardian</th>
                  <th>Contact Number</th>
                  <th>Hamlet / Wadi</th>
                  <th>Status</th>
                  <th>Class Teacher Decision</th>
                </tr>
              </thead>
              <tbody>
                {pendingStudents.map((st) => (
                  <tr key={st._id || st.numericId} style={{ backgroundColor: '#f0f9ff' }}>
                    <td>
                      <div className="font-semibold text-primary">{st.fullName}</div>
                      <span className="text-xs text-muted font-mono">Temp ID: #{st.numericId}</span>
                    </td>
                    <td>{st.parentName}</td>
                    <td className="text-sm font-mono">{st.parentContact || 'No phone'}</td>
                    <td className="text-xs text-muted">{st.hamletOrWadi || 'Catchment Area'}</td>
                    <td>
                      <span className="badge badge-warning" style={{ fontSize: '0.7rem', textTransform: 'uppercase' }}>
                        Pending Verification
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          className="btn btn-primary btn-sm"
                          style={{ padding: '0.25rem 0.6rem', fontSize: '0.8rem', backgroundColor: '#0284c7', borderColor: '#0284c7' }}
                          onClick={() => handleApproveStudent(st._id || st.numericId)}
                        >
                          Verify & Enroll in Class Roll ✓
                        </button>
                        <button
                          type="button"
                          className="btn btn-outline btn-sm"
                          style={{ padding: '0.25rem 0.6rem', fontSize: '0.8rem', color: '#dc2626', borderColor: '#fca5a5' }}
                          onClick={() => handleRejectStudent(st._id || st.numericId)}
                        >
                          Reject ✕
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Daily Roll Call Matrix */}
      <div className="portal-section-card">
        <div className="section-card-header">
          <div className="flex items-center gap-2">
            <Icon name="calendar" size={18} color="#059669" />
            <h3>Class {selectedClass} Roll Call Matrix ({attendanceDate})</h3>
          </div>
          <button
            className="btn btn-primary"
            onClick={handleSaveBulkRollCall}
            disabled={isSaving}
          >
            <Icon name="check-circle" size={16} />
            {isSaving ? 'Syncing...' : 'Save Roll Call (Bulk Sync)'}
          </button>
        </div>

        {isLoading ? (
          <div className="portal-loading-state">
            <div className="spinner"></div>
            <p>Fetching Class {selectedClass} students...</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="portal-table roll-call-table">
              <thead>
                <tr>
                  <th>Roll #</th>
                  <th>Student & Guardian</th>
                  <th>Attendance Status Toggle</th>
                  <th>Risk Status & Alerts</th>
                  <th>Daily Note / Reason</th>
                  <th>ERP Interaction</th>
                </tr>
              </thead>
              <tbody>
                {students.map((stu) => {
                  const entry = rollCall[stu.numericId] || { status: 'present', notes: '' };
                  const risk = riskMap[stu.numericId];
                  const hasCriticalAlert = risk?.hasCriticalAlert;

                  return (
                    <tr
                      key={stu.numericId}
                      className={hasCriticalAlert ? 'row-critical-alert' : entry.status === 'absent' ? 'row-absent' : ''}
                    >
                      <td className="font-mono font-bold">#{stu.numericId}</td>
                      <td>
                        <div className="student-cell-info">
                          <span className="font-semibold text-primary">{stu.fullName}</span>
                          <span className="text-xs text-muted">
                            Parent: {stu.parentName} ({stu.parentContact || 'No phone'})
                          </span>
                        </div>
                      </td>

                      {/* Status Toggle Buttons */}
                      <td>
                        <div className="status-toggle-group">
                          <button
                            type="button"
                            className={`toggle-btn btn-present ${entry.status === 'present' ? 'active' : ''}`}
                            onClick={() => handleStatusChange(stu.numericId, 'present')}
                          >
                            <Icon name="check-circle" size={13} /> Present
                          </button>
                          <button
                            type="button"
                            className={`toggle-btn btn-late ${entry.status === 'late' ? 'active' : ''}`}
                            onClick={() => handleStatusChange(stu.numericId, 'late')}
                          >
                            <Icon name="clock" size={13} /> Late
                          </button>
                          <button
                            type="button"
                            className={`toggle-btn btn-absent ${entry.status === 'absent' ? 'active' : ''}`}
                            onClick={() => handleStatusChange(stu.numericId, 'absent')}
                          >
                            <Icon name="x-circle" size={13} /> Absent
                          </button>
                        </div>
                      </td>

                      {/* Risk Alert Badge */}
                      <td>
                        {risk ? (
                          <div className="flex flex-col gap-1">
                            <span className={`risk-badge risk-${risk.riskLevel.toLowerCase()}`}>
                              {risk.riskLevel === 'High' && '⚠️ '}
                              {risk.riskLevel} Risk ({risk.attendancePct}%)
                            </span>
                            {hasCriticalAlert && (
                              <span className="critical-warning-pill">
                                🚨 {risk.consecutiveAbsent} Consec Absences!
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-muted">Awaiting sync</span>
                        )}
                      </td>

                      {/* Notes input */}
                      <td>
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          placeholder="e.g. Fever, harvest work, bus issue"
                          value={entry.notes || ''}
                          onChange={(e) => handleNotesChange(stu.numericId, e.target.value)}
                        />
                      </td>

                      {/* Proactive ERP Action Buttons */}
                      <td>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            className="btn btn-primary btn-sm"
                            onClick={() => handleOpenMessageModal(stu)}
                            title="Dispatch real-time notice to guardian"
                            style={{ padding: '0.3rem 0.55rem', fontSize: '0.78rem' }}
                          >
                            <Icon name="phone" size={12} /> Message
                          </button>
                          <button
                            type="button"
                            className="btn btn-outline btn-sm"
                            onClick={() => handleOpenInterventionModal(stu)}
                            title="Record formal intervention record"
                            style={{ padding: '0.3rem 0.55rem', fontSize: '0.78rem' }}
                          >
                            <Icon name="teacher" size={12} /> Log
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Direct Teacher-Parent Notice Modal */}
      {showMessageModal && targetStudentForMessage && (
        <div className="modal-backdrop" onClick={() => setShowMessageModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="flex items-center gap-2">
                <Icon name="phone" size={18} color="#4f46e5" />
                <h3 className="font-bold">
                  Dispatch Notice to {targetStudentForMessage.parentName} (Parent of {targetStudentForMessage.fullName})
                </h3>
              </div>
              <button className="btn-icon" onClick={() => setShowMessageModal(false)}>
                <Icon name="x-circle" size={18} />
              </button>
            </div>

            <form onSubmit={handleSendMessage}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Message Category</label>
                  <select
                    className="form-control"
                    value={messageForm.category}
                    onChange={(e) => setMessageForm({ ...messageForm, category: e.target.value })}
                  >
                    <option value="attendance_alert">⚠️ Attendance Warning & Consecutive Absence</option>
                    <option value="academic_feedback">🌟 Academic Feedback & CCE Marks</option>
                    <option value="homework">📚 Homework & Exam Revision Packet</option>
                    <option value="urgent_call">🚨 Urgent Parent Call Requested</option>
                    <option value="general_notice">ℹ️ General Classroom Notice</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Notice Subject</label>
                  <input
                    type="text"
                    className="form-control"
                    value={messageForm.title}
                    onChange={(e) => setMessageForm({ ...messageForm, title: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Message to Parent</label>
                  <textarea
                    className="form-control"
                    rows="4"
                    value={messageForm.messageText}
                    onChange={(e) => setMessageForm({ ...messageForm, messageText: e.target.value })}
                    required
                  ></textarea>
                </div>

                <div className="form-group flex items-center gap-2 mt-2">
                  <input
                    type="checkbox"
                    id="urgentNoticeCheck"
                    checked={messageForm.isUrgent}
                    onChange={(e) => setMessageForm({ ...messageForm, isUrgent: e.target.checked })}
                  />
                  <label htmlFor="urgentNoticeCheck" className="text-sm font-semibold" style={{ margin: 0, cursor: 'pointer' }}>
                    🚨 Highlight as Urgent Notice (Shows alert pill on Parent Portal)
                  </label>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowMessageModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isSendingMessage}
                >
                  {isSendingMessage ? 'Dispatching...' : 'Dispatch Notice to Parent'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Class Broadcast Announcement Modal */}
      {showBroadcastModal && (
        <div className="modal-backdrop" onClick={() => setShowBroadcastModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="flex items-center gap-2">
                <Icon name="phone" size={18} color="#059669" />
                <h3 className="font-bold">
                  Broadcast Notice to All Class {selectedClass} Parents
                </h3>
              </div>
              <button className="btn-icon" onClick={() => setShowBroadcastModal(false)}>
                <Icon name="x-circle" size={18} />
              </button>
            </div>

            <form onSubmit={handleSendBroadcast}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Notice Category</label>
                  <select
                    className="form-control"
                    value={broadcastForm.category}
                    onChange={(e) => setBroadcastForm({ ...broadcastForm, category: e.target.value })}
                  >
                    <option value="general_notice">ℹ️ General Classroom / School Notice</option>
                    <option value="homework">📚 Class-Wide Homework & Revision Packet</option>
                    <option value="attendance_alert">⚠️ Monsoon Weather / Route Alert</option>
                    <option value="academic_feedback">📝 Unit Test & Exam Announcement</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Announcement Title</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Unit Test 2 Schedule & Revision Packet"
                    value={broadcastForm.title}
                    onChange={(e) => setBroadcastForm({ ...broadcastForm, title: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Announcement Body</label>
                  <textarea
                    className="form-control"
                    rows="4"
                    placeholder="Type notice message here. It will be duplicated to every student's parent feed in Class..."
                    value={broadcastForm.messageText}
                    onChange={(e) => setBroadcastForm({ ...broadcastForm, messageText: e.target.value })}
                    required
                  ></textarea>
                </div>

                <div className="form-group flex items-center gap-2 mt-2">
                  <input
                    type="checkbox"
                    id="broadcastUrgentCheck"
                    checked={broadcastForm.isUrgent}
                    onChange={(e) => setBroadcastForm({ ...broadcastForm, isUrgent: e.target.checked })}
                  />
                  <label htmlFor="broadcastUrgentCheck" className="text-sm font-semibold" style={{ margin: 0, cursor: 'pointer' }}>
                    🚨 Mark as High-Priority Class Broadcast
                  </label>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowBroadcastModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isSendingBroadcast}
                >
                  {isSendingBroadcast ? 'Broadcasting...' : 'Broadcast to All Parents'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Intervention Recording Modal */}
      {showInterventionModal && targetStudentForIntervention && (
        <div className="modal-backdrop" onClick={() => setShowInterventionModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="flex items-center gap-2">
                <Icon name="teacher" size={18} color="#d97706" />
                <h3 className="font-bold">
                  Record Teacher Intervention: {targetStudentForIntervention.fullName}
                </h3>
              </div>
              <button className="btn-icon" onClick={() => setShowInterventionModal(false)}>
                <Icon name="x-circle" size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateIntervention}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Intervention Protocol Type</label>
                  <select
                    className="form-control"
                    value={interventionForm.interventionType}
                    onChange={(e) => setInterventionForm({ ...interventionForm, interventionType: e.target.value })}
                  >
                    <option value="parent_contact">Parent Phone Call</option>
                    <option value="student_meeting">One-on-One Counseling Meeting</option>
                    <option value="learning_support">Remedial Learning Packet & Buddy</option>
                    <option value="referral">Village Gram Panchayat / ASHA Referral</option>
                    <option value="other">Special Home Visit</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Identified Risk Concern</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    value={interventionForm.concern}
                    onChange={(e) => setInterventionForm({ ...interventionForm, concern: e.target.value })}
                    required
                  ></textarea>
                </div>

                <div className="form-group">
                  <label>Action Taken / Parent Commitment</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    placeholder="Describe conversation with guardian and agreed schedule..."
                    value={interventionForm.actionTaken}
                    onChange={(e) => setInterventionForm({ ...interventionForm, actionTaken: e.target.value })}
                    required
                  ></textarea>
                </div>

                <div className="form-group">
                  <label>Scheduled Follow-Up Date</label>
                  <input
                    type="date"
                    className="form-control"
                    value={interventionForm.followUpDate}
                    onChange={(e) => setInterventionForm({ ...interventionForm, followUpDate: e.target.value })}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowInterventionModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Intervention Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
