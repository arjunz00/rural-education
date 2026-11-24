import React, { useState, useEffect } from 'react';
import { interventionsAPI, studentsAPI } from '../services/api';
import { Icon } from '../components/Icons';

export const InterventionsView = () => {
  const [interventions, setInterventions] = useState([]);
  const [students, setStudents] = useState([]);
  const [statusFilter, setStatusFilter] = useState('All');
  const [isLoading, setIsLoading] = useState(true);

  // New intervention modal
  const [showNewModal, setShowNewModal] = useState(false);
  const [newForm, setNewForm] = useState({
    studentId: 1,
    interventionType: 'parent_contact',
    concern: '',
    actionTaken: '',
    followUpDate: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [intRes, stuRes] = await Promise.all([
        interventionsAPI.getAll(),
        studentsAPI.getStudents()
      ]);
      setInterventions(intRes.data || []);
      setStudents(stuRes.data || []);
    } catch (err) {
      console.error('Failed to load interventions:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResolveIntervention = async (inv) => {
    const confirmResolve = window.confirm(`Mark intervention for Student #${inv.studentId} as resolved? This will calculate post-intervention attendance outcome.`);
    if (!confirmResolve) return;

    try {
      await interventionsAPI.update(inv._id, {
        status: 'resolved',
        evaluateOutcome: true
      });
      alert('Intervention resolved and outcome evaluated!');
      loadData();
    } catch (err) {
      alert(`Error updating intervention: ${err.message}`);
    }
  };

  const handleCreateNew = async (e) => {
    e.preventDefault();
    try {
      await interventionsAPI.create(newForm);
      setShowNewModal(false);
      setNewForm({
        studentId: 1,
        interventionType: 'parent_contact',
        concern: '',
        actionTaken: '',
        followUpDate: ''
      });
      alert('New intervention logged successfully!');
      loadData();
    } catch (err) {
      alert(`Failed to create intervention: ${err.message}`);
    }
  };

  const filtered = interventions.filter(i => {
    if (statusFilter === 'All') return true;
    return i.status === statusFilter;
  });

  const studentMap = new Map();
  students.forEach(s => studentMap.set(s.numericId, s.fullName));

  return (
    <div className="interventions-page">
      <div className="dashboard-top-header">
        <div>
          <h2>👨‍🏫 Teacher-Parent Interventions & Home Outreach</h2>
          <p className="text-sm text-muted">
            Track proactive counseling, phone calls, home visits, and post-intervention attendance improvements
          </p>
        </div>

        <button className="btn btn-primary" onClick={() => setShowNewModal(true)}>
          <Icon name="zap" size={16} /> Log New Intervention
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="filter-pill-bar">
        {['All', 'open', 'in_progress', 'resolved'].map((tab) => (
          <button
            key={tab}
            className={`filter-pill-btn ${statusFilter === tab ? 'active' : ''}`}
            onClick={() => setStatusFilter(tab)}
          >
            {tab.replace('_', ' ').toUpperCase()} ({interventions.filter(i => tab === 'All' || i.status === tab).length})
          </button>
        ))}
      </div>

      {/* Interventions Table */}
      <div className="portal-section-card">
        {isLoading ? (
          <div className="portal-loading-state">
            <div className="spinner"></div>
            <p>Loading interventions ledger...</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="portal-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Student</th>
                  <th>Protocol Type</th>
                  <th>Risk Concern</th>
                  <th>Action Taken</th>
                  <th>Pre / Post Attendance</th>
                  <th>Efficacy Outcome</th>
                  <th>Status & Follow-up</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="text-center py-4 text-muted">
                      No interventions recorded under this status.
                    </td>
                  </tr>
                ) : (
                  filtered.map((inv) => (
                    <tr key={inv._id}>
                      <td className="font-mono text-xs">{inv.createdOn}</td>
                      <td>
                        <strong className="text-primary">{studentMap.get(inv.studentId) || `Student #${inv.studentId}`}</strong>
                        <div className="text-xs text-muted">Roll #{inv.studentId}</div>
                      </td>
                      <td>
                        <span className="badge badge-outline">
                          {inv.interventionType.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="text-sm max-w-xs">{inv.concern}</td>
                      <td className="text-sm max-w-xs text-muted">{inv.actionTaken}</td>
                      <td>
                        <div className="text-xs font-mono">
                          Pre: {inv.preAttendancePct !== null ? `${inv.preAttendancePct}%` : 'N/A'}
                          <br />
                          Post: {inv.postAttendancePct !== null ? `${inv.postAttendancePct}%` : 'Evaluating'}
                        </div>
                      </td>
                      <td>
                        {inv.attendanceOutcome && inv.attendanceOutcome !== 'insufficient_data' ? (
                          <span className={`status-pill outcome-${inv.attendanceOutcome}`}>
                            {inv.attendanceOutcome === 'improved' ? '▲ Improved' : inv.attendanceOutcome === 'declined' ? '▼ Declined' : '● Steady'}
                            {inv.deltaPct !== null && ` (${inv.deltaPct > 0 ? `+${inv.deltaPct}` : inv.deltaPct}%)`}
                          </span>
                        ) : (
                          <span className="text-xs text-muted">Gathering data</span>
                        )}
                      </td>
                      <td>
                        <span className={`status-pill status-${inv.status}`}>
                          {inv.status}
                        </span>
                        {inv.followUpDate && (
                          <div className="text-xs text-muted mt-1">Due: {inv.followUpDate}</div>
                        )}
                      </td>
                      <td>
                        {inv.status !== 'resolved' && (
                          <button
                            className="btn btn-outline btn-sm"
                            onClick={() => handleResolveIntervention(inv)}
                          >
                            <Icon name="check-circle" size={13} /> Resolve
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* New Intervention Modal */}
      {showNewModal && (
        <div className="modal-backdrop" onClick={() => setShowNewModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="flex items-center gap-2">
                <Icon name="teacher" size={18} color="#059669" />
                <h3 className="font-bold">Log New Proactive Teacher Intervention</h3>
              </div>
              <button className="btn-icon" onClick={() => setShowNewModal(false)}>
                <Icon name="x-circle" size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateNew}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Select Student</label>
                  <select
                    className="form-control"
                    value={newForm.studentId}
                    onChange={(e) => setNewForm({ ...newForm, studentId: Number(e.target.value) })}
                  >
                    {students.map(s => (
                      <option key={s.numericId} value={s.numericId}>
                        #{s.numericId} - {s.fullName} (Class {s.className})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Intervention Protocol Type</label>
                  <select
                    className="form-control"
                    value={newForm.interventionType}
                    onChange={(e) => setNewForm({ ...newForm, interventionType: e.target.value })}
                  >
                    <option value="parent_contact">Parent Phone Call</option>
                    <option value="student_meeting">Student One-on-One Counseling</option>
                    <option value="learning_support">Remedial Learning Packet & Buddy</option>
                    <option value="referral">Village Gram Panchayat / ASHA Referral</option>
                    <option value="other">Village Home Visit</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Early Warning Concern</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    placeholder="e.g. Consecutive absences, drop in marks, lack of homework submission..."
                    value={newForm.concern}
                    onChange={(e) => setNewForm({ ...newForm, concern: e.target.value })}
                    required
                  ></textarea>
                </div>

                <div className="form-group">
                  <label>Corrective Action Taken</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    placeholder="e.g. Spoke with mother, rescheduled farm duties, issued revision audio pack..."
                    value={newForm.actionTaken}
                    onChange={(e) => setNewForm({ ...newForm, actionTaken: e.target.value })}
                    required
                  ></textarea>
                </div>

                <div className="form-group">
                  <label>Follow-Up Inspection Date</label>
                  <input
                    type="date"
                    className="form-control"
                    value={newForm.followUpDate}
                    onChange={(e) => setNewForm({ ...newForm, followUpDate: e.target.value })}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowNewModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Intervention
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
