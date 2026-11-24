import React, { useState, useEffect } from 'react';
import { attendanceAPI, riskAPI, studentsAPI } from '../services/api';
import { Icon } from '../components/Icons';

export const AdminClusterDashboard = () => {
  const [clusterStats, setClusterStats] = useState(null);
  const [riskAssessments, setRiskAssessments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Simulated cluster schools for Block Education Office
  const clusterSchools = [
    { name: 'Zilla Parishad High School, Dahiwadi', students: 184, attendanceRate: 79, riskCount: 2, ptr: '1:26', status: 'Compliant' },
    { name: 'Zilla Parishad Primary School, Pingali', students: 96, attendanceRate: 82, riskCount: 1, ptr: '1:24', status: 'Compliant' },
    { name: 'Zilla Parishad School, Mhaswad North', students: 142, attendanceRate: 71, riskCount: 5, ptr: '1:35', status: 'Notice Issued' },
    { name: 'Zilla Parishad Ashram Shala, Malawadi', students: 110, attendanceRate: 74, riskCount: 4, ptr: '1:28', status: 'Monitoring' }
  ];

  useEffect(() => {
    loadClusterData();
  }, []);

  const loadClusterData = async () => {
    setIsLoading(true);
    try {
      const [sumRes, riskRes] = await Promise.all([
        attendanceAPI.getSummary(),
        riskAPI.getAssessments()
      ]);
      if (sumRes.success) setClusterStats(sumRes.summary);
      if (riskRes.success) setRiskAssessments(riskRes.assessments || []);
    } catch (err) {
      console.error('Failed to load cluster data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrintAudit = () => {
    window.print();
  };

  return (
    <div className="admin-cluster-dashboard">
      <div className="dashboard-top-header">
        <div>
          <h2>🏛️ Block Education Office (BEO) Cluster Oversight</h2>
          <p className="text-sm text-muted">
            Dahiwadi Circle • Satara District Education Division • Officer: B. Shinde
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button className="btn btn-primary" onClick={handlePrintAudit}>
            <Icon name="printer" size={16} /> Print RTE Cluster Audit
          </button>
        </div>
      </div>

      {/* Cluster KPI Grid */}
      <div className="quick-kpi-grid">
        <div className="kpi-card">
          <span className="kpi-label">Cluster RTE Attendance</span>
          <span className="kpi-value text-primary">76.5%</span>
          <span className="kpi-sub">Across 4 village schools</span>
        </div>
        <div className="kpi-card">
          <span className="kpi-label">Total Block Enrolment</span>
          <span className="kpi-value text-success">532</span>
          <span className="kpi-sub">Census tracked learners</span>
        </div>
        <div className="kpi-card">
          <span className="kpi-label">Dropout Vulnerability</span>
          <span className="kpi-value text-danger">12</span>
          <span className="kpi-sub">Students flagged across block</span>
        </div>
        <div className="kpi-card">
          <span className="kpi-label">Average Pupil-Teacher Ratio</span>
          <span className="kpi-value text-warning">1:28</span>
          <span className="kpi-sub">RTE Mandate: &lt; 1:30</span>
        </div>
      </div>

      {/* Village Schools Comparison Table */}
      <div className="portal-section-card">
        <div className="section-card-header">
          <div className="flex items-center gap-2">
            <Icon name="school" size={18} color="#059669" />
            <h3>Village Schools Cluster Performance & Compliance Matrix</h3>
          </div>
          <span className="text-xs text-muted">Quarterly Statutory Evaluation</span>
        </div>

        <div className="table-responsive">
          <table className="portal-table">
            <thead>
              <tr>
                <th>Village School Institution</th>
                <th>Enrolled Learners</th>
                <th>Avg. Attendance Rate</th>
                <th>At-Risk Count</th>
                <th>Pupil-Teacher Ratio (PTR)</th>
                <th>RTE Compliance Status</th>
              </tr>
            </thead>
            <tbody>
              {clusterSchools.map((sch, idx) => (
                <tr key={idx}>
                  <td className="font-semibold text-primary">{sch.name}</td>
                  <td>{sch.students} Learners</td>
                  <td>
                    <span className={`font-bold ${sch.attendanceRate >= 75 ? 'text-success' : 'text-danger'}`}>
                      {sch.attendanceRate}%
                    </span>
                  </td>
                  <td>
                    <span className={`risk-badge risk-${sch.riskCount > 3 ? 'high' : 'medium'}`}>
                      {sch.riskCount} Students
                    </span>
                  </td>
                  <td>{sch.ptr}</td>
                  <td>
                    <span className={`status-pill ${sch.status === 'Compliant' ? 'status-resolved' : 'status-open'}`}>
                      {sch.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Dahiwadi Inspection Spotlight */}
      <div className="portal-section-card">
        <div className="section-card-header">
          <div className="flex items-center gap-2">
            <Icon name="alert-triangle" size={18} color="#4f46e5" />
            <h3>Active Field Inspections: Zilla Parishad High School, Dahiwadi</h3>
          </div>
          <span className="badge badge-primary">Model School Hub</span>
        </div>

        <div className="table-responsive">
          <table className="portal-table">
            <thead>
              <tr>
                <th>Student ID</th>
                <th>Name</th>
                <th>Attendance</th>
                <th>Consecutive Absences</th>
                <th>Compounding Risk Factor</th>
                <th>Mandated Administrative Action</th>
              </tr>
            </thead>
            <tbody>
              {riskAssessments.slice(0, 5).map((a) => (
                <tr key={a.studentId}>
                  <td className="font-mono">#{a.studentId}</td>
                  <td className="font-semibold">{a.studentName}</td>
                  <td>
                    <span className={`font-bold ${a.attendancePct < 60 ? 'text-danger' : a.attendancePct < 75 ? 'text-warning' : 'text-success'}`}>
                      {a.attendancePct}%
                    </span>
                  </td>
                  <td>
                    {a.hasCriticalAlert ? (
                      <span className="critical-warning-pill">🚨 {a.consecutiveAbsent} Consec</span>
                    ) : (
                      <span>{a.consecutiveAbsent} days</span>
                    )}
                  </td>
                  <td className="text-sm">{(a.reasons || []).join(', ')}</td>
                  <td className="text-sm font-medium text-primary">{a.recommendedAction}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
