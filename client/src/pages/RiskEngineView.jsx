import React, { useState, useEffect } from 'react';
import { riskAPI, interventionsAPI } from '../services/api';
import { Icon } from '../components/Icons';

export const RiskEngineView = () => {
  const [assessments, setAssessments] = useState([]);
  const [summary, setSummary] = useState(null);
  const [riskFilter, setRiskFilter] = useState('All');
  const [isLoading, setIsLoading] = useState(true);

  // Intervention modal
  const [showInterventionModal, setShowInterventionModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [interventionForm, setInterventionForm] = useState({
    interventionType: 'parent_contact',
    concern: '',
    actionTaken: '',
    followUpDate: ''
  });

  useEffect(() => {
    fetchAssessments();
  }, []);

  const fetchAssessments = async () => {
    setIsLoading(true);
    try {
      const res = await riskAPI.getAssessments();
      if (res.success) {
        setAssessments(res.assessments || []);
        setSummary(res.summary);
      }
    } catch (err) {
      console.error('Failed to load risk assessments:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenIntervention = (student) => {
    setSelectedStudent(student);
    setInterventionForm({
      interventionType: student.hasCriticalAlert ? 'parent_contact' : 'student_meeting',
      concern: student.reasons.join('; '),
      actionTaken: '',
      followUpDate: ''
    });
    setShowInterventionModal(true);
  };

  const handleSaveIntervention = async (e) => {
    e.preventDefault();
    if (!selectedStudent) return;

    try {
      await interventionsAPI.create({
        studentId: selectedStudent.studentId,
        interventionType: interventionForm.interventionType,
        concern: interventionForm.concern,
        actionTaken: interventionForm.actionTaken,
        followUpDate: interventionForm.followUpDate || null
      });
      alert(`Intervention saved for ${selectedStudent.studentName}!`);
      setShowInterventionModal(false);
      fetchAssessments();
    } catch (err) {
      alert(`Failed to save intervention: ${err.message}`);
    }
  };

  const filteredAssessments = assessments.filter(a => {
    if (riskFilter === 'All') return true;
    if (riskFilter === 'High') return a.riskLevel === 'High';
    if (riskFilter === 'Medium') return a.riskLevel === 'Medium';
    if (riskFilter === 'Low') return a.riskLevel === 'Low';
    if (riskFilter === 'Critical') return a.hasCriticalAlert;
    return true;
  });

  return (
    <div className="risk-engine-page">
      <div className="dashboard-top-header">
        <div>
          <h2>⚠️ Predictive Early Warning & Dropout Risk Engine</h2>
          <p className="text-sm text-muted">
            Algorithmic attendance anomaly detection, streak deterioration analysis & proactive intervention triggers
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button className="btn btn-outline" onClick={fetchAssessments}>
            <Icon name="refresh" size={14} /> Refresh Radar
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="quick-kpi-grid">
        <div className="kpi-card">
          <span className="kpi-label">Assessed Learners</span>
          <span className="kpi-value text-primary">{summary?.totalAssessed || 0}</span>
          <span className="kpi-sub">Observed &gt;= 10 school days</span>
        </div>
        <div className="kpi-card">
          <span className="kpi-label">High Dropout Risk</span>
          <span className="kpi-value text-danger">{summary?.highRisk || 0}</span>
          <span className="kpi-sub">&lt; 60% attendance rate</span>
        </div>
        <div className="kpi-card">
          <span className="kpi-label">Medium Risk</span>
          <span className="kpi-value text-warning">{summary?.mediumRisk || 0}</span>
          <span className="kpi-sub">60% - 74% attendance rate</span>
        </div>
        <div className="kpi-card">
          <span className="kpi-label">Critical Consec. Absences</span>
          <span className="kpi-value text-danger">{summary?.criticalAlerts || 0}</span>
          <span className="kpi-sub">3+ days unexcused consecutive</span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="filter-pill-bar">
        {['All', 'Critical', 'High', 'Medium', 'Low'].map((tab) => (
          <button
            key={tab}
            className={`filter-pill-btn ${riskFilter === tab ? 'active' : ''}`}
            onClick={() => setRiskFilter(tab)}
          >
            {tab === 'Critical' ? '🚨 Critical Absence Alert' : `${tab} Risk`}
          </button>
        ))}
      </div>

      {/* Radar Table */}
      <div className="portal-section-card">
        {isLoading ? (
          <div className="portal-loading-state">
            <div className="spinner"></div>
            <p>Running risk engine algorithms...</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="portal-table">
              <thead>
                <tr>
                  <th>Roll #</th>
                  <th>Student Name</th>
                  <th>Risk Level</th>
                  <th>Attendance %</th>
                  <th>Consecutive Absences</th>
                  <th>Trend Detection</th>
                  <th>Risk Diagnostic Reasons</th>
                  <th>Institutional Recommendation</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredAssessments.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="text-center py-4 text-muted">
                      No students matching the selected risk tier.
                    </td>
                  </tr>
                ) : (
                  filteredAssessments.map((a) => (
                    <tr
                      key={a.studentId}
                      className={a.hasCriticalAlert ? 'row-critical-alert' : a.riskLevel === 'High' ? 'row-high-risk' : ''}
                    >
                      <td className="font-mono font-bold">#{a.studentId}</td>
                      <td>
                        <div className="font-semibold text-primary">{a.studentName}</div>
                        <div className="text-xs text-muted">Class {a.className} • Parent: {a.parentName}</div>
                      </td>
                      <td>
                        <span className={`risk-badge risk-${a.riskLevel.toLowerCase()}`}>
                          {a.riskLevel === 'High' && '⚠️ '}
                          {a.riskLevel} Risk
                        </span>
                      </td>
                      <td>
                        <span className="font-bold">{a.attendancePct}%</span>
                        <div className="text-xs text-muted">{a.presentDays}P / {a.absentDays}A</div>
                      </td>
                      <td>
                        {a.hasCriticalAlert ? (
                          <span className="critical-warning-pill">
                            🚨 {a.consecutiveAbsent} Consecutive!
                          </span>
                        ) : (
                          <span className="text-muted">{a.consecutiveAbsent} days</span>
                        )}
                      </td>
                      <td>
                        <span className={`trend-tag trend-${a.trend}`}>
                          {a.trend.replace('_', ' ').toUpperCase()}
                        </span>
                        {a.trend === 'sharp_drop' && (
                          <div className="text-xs text-danger font-mono mt-1">
                            {a.priorPeriodPct}% → {a.recentPeriodPct}%
                          </div>
                        )}
                      </td>
                      <td className="text-sm">
                        <ul className="reasons-list">
                          {(a.reasons || []).map((r, idx) => (
                            <li key={idx}>{r}</li>
                          ))}
                        </ul>
                      </td>
                      <td className="text-sm text-primary font-medium">
                        {a.recommendedAction}
                      </td>
                      <td>
                        <button
                          className="btn btn-outline btn-sm"
                          onClick={() => handleOpenIntervention(a)}
                        >
                          <Icon name="teacher" size={13} /> Intervene
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Intervention Modal */}
      {showInterventionModal && selectedStudent && (
        <div className="modal-backdrop" onClick={() => setShowInterventionModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="flex items-center gap-2">
                <Icon name="teacher" size={18} color="#d97706" />
                <h3 className="font-bold">
                  Deploy Early Intervention: {selectedStudent.studentName}
                </h3>
              </div>
              <button className="btn-icon" onClick={() => setShowInterventionModal(false)}>
                <Icon name="x-circle" size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveIntervention}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Intervention Protocol Type</label>
                  <select
                    className="form-control"
                    value={interventionForm.interventionType}
                    onChange={(e) => setInterventionForm({ ...interventionForm, interventionType: e.target.value })}
                  >
                    <option value="parent_contact">Parent Phone Call</option>
                    <option value="student_meeting">One-on-One Student Counseling</option>
                    <option value="learning_support">Remedial Learning Support & Peer Buddy</option>
                    <option value="referral">Village Gram Panchayat / ASHA Referral</option>
                    <option value="other">Village Home Visit</option>
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
                  <label>Immediate Action Taken / Guardian Dialogue</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    placeholder="Enter notes on discussion and corrective action..."
                    value={interventionForm.actionTaken}
                    onChange={(e) => setInterventionForm({ ...interventionForm, actionTaken: e.target.value })}
                    required
                  ></textarea>
                </div>

                <div className="form-group">
                  <label>Follow-Up Date</label>
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
                  Record Intervention
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
