import React, { useState, useEffect } from 'react';
import { studentsAPI, attendanceAPI, riskAPI, interventionsAPI } from '../services/api';
import { Icon } from '../components/Icons';

export const TeacherDashboard = () => {
  const [students, setStudents] = useState([]);
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

  useEffect(() => {
    loadDashboardData();
  }, [attendanceDate]);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const [stuRes, attRes, riskRes] = await Promise.all([
        studentsAPI.getStudents({ className: '8' }),
        attendanceAPI.getRecords({ date: attendanceDate }),
        riskAPI.getAssessments()
      ]);

      const stuList = stuRes.data || [];
      setStudents(stuList);

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
          <h2>👨‍🏫 Class 8 Roll Call & Daily Monitoring</h2>
          <p className="text-sm text-muted">
            Zilla Parishad High School, Dahiwadi • Class Teacher: S. Deshmukh
          </p>
        </div>

        <div className="date-picker-wrap">
          <label htmlFor="rollDate" className="text-xs font-semibold mr-2">Instructional Date:</label>
          <input
            id="rollDate"
            type="date"
            className="form-control date-input"
            value={attendanceDate}
            onChange={(e) => setAttendanceDate(e.target.value)}
          />
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

      {/* Daily Roll Call Matrix */}
      <div className="portal-section-card">
        <div className="section-card-header">
          <div className="flex items-center gap-2">
            <Icon name="calendar" size={18} color="#059669" />
            <h3>Daily Attendance Roll Call Matrix ({attendanceDate})</h3>
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
            <p>Fetching student records...</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="portal-table roll-call-table">
              <thead>
                <tr>
                  <th>Roll #</th>
                  <th>Student Name</th>
                  <th>Attendance Status Toggle</th>
                  <th>Risk Status & Alerts</th>
                  <th>Daily Note / Reason</th>
                  <th>Proactive Action</th>
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

                      {/* Action */}
                      <td>
                        <button
                          type="button"
                          className="btn btn-outline btn-sm"
                          onClick={() => handleOpenInterventionModal(stu)}
                          title="Record Parent Call or Home Visit"
                        >
                          <Icon name="teacher" size={13} /> Intervene
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

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
