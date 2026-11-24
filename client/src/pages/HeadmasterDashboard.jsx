import React, { useState, useEffect } from 'react';
import { attendanceAPI, riskAPI, interventionsAPI } from '../services/api';
import { Icon } from '../components/Icons';
import { AttendanceGauge } from '../components/AttendanceGauge';

export const HeadmasterDashboard = () => {
  const [summary, setSummary] = useState(null);
  const [riskList, setRiskList] = useState([]);
  const [interventions, setInterventions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [sumRes, riskRes, intRes] = await Promise.all([
        attendanceAPI.getSummary(),
        riskAPI.getAssessments(),
        interventionsAPI.getAll()
      ]);

      if (sumRes.success) setSummary(sumRes.summary);
      if (riskRes.success) setRiskList(riskRes.assessments || []);
      if (intRes.success) setInterventions(intRes.data || []);
    } catch (err) {
      console.error('Failed to load headmaster data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportCSV = () => {
    if (riskList.length === 0) return;

    const headers = ['RollNo', 'StudentName', 'Class', 'AttendancePct', 'ConsecutiveAbsent', 'RiskLevel', 'PrimaryReason', 'ActionRequired'];
    const rows = riskList.map(item => [
      item.studentId,
      `"${item.studentName}"`,
      `"Class ${item.className}"`,
      `${item.attendancePct}%`,
      item.consecutiveAbsent,
      item.riskLevel,
      `"${(item.reasons || []).join('; ')}"`,
      `"${item.recommendedAction}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `ZPHS_Dahiwadi_Early_Warning_Audit_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) {
    return (
      <div className="portal-loading-state">
        <div className="spinner"></div>
        <p>Compiling institutional attendance audit...</p>
      </div>
    );
  }

  const overallPct = summary?.overallAttendancePct || 0;
  const highRiskStudents = riskList.filter(s => s.riskLevel === 'High');
  const criticalAbsenceAlerts = riskList.filter(s => s.hasCriticalAlert);

  return (
    <div className="headmaster-dashboard">
      <div className="dashboard-top-header">
        <div>
          <h2>🏫 Institutional Overview & Dropout Forecasting</h2>
          <p className="text-sm text-muted">
            Zilla Parishad High School, Dahiwadi • Dr. K. Patil (Headmaster / Principal)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button className="btn btn-primary" onClick={handleExportCSV}>
            <Icon name="download" size={16} /> Export Audit CSV
          </button>
          <button className="btn btn-outline" onClick={() => window.print()}>
            <Icon name="printer" size={16} /> Print Report
          </button>
        </div>
      </div>

      {/* Top Level Metric Cards */}
      <div className="quick-kpi-grid">
        <div className="kpi-card">
          <span className="kpi-label">School Attendance Rate</span>
          <span className="kpi-value text-primary">{overallPct}%</span>
          <span className="kpi-sub">Target RTE Minimum: 75%</span>
        </div>
        <div className="kpi-card">
          <span className="kpi-label">Critical Absence Alerts</span>
          <span className="kpi-value text-danger">{criticalAbsenceAlerts.length}</span>
          <span className="kpi-sub">3+ days consecutive absent</span>
        </div>
        <div className="kpi-card">
          <span className="kpi-label">High Dropout Risk</span>
          <span className="kpi-value text-warning">{highRiskStudents.length}</span>
          <span className="kpi-sub">&lt;60% attendance rate</span>
        </div>
        <div className="kpi-card">
          <span className="kpi-label">Logged Interventions</span>
          <span className="kpi-value text-success">{interventions.length}</span>
          <span className="kpi-sub">Active teacher outreaches</span>
        </div>
      </div>

      {/* Chronic Dropout Warning Radar List */}
      <div className="portal-section-card">
        <div className="section-card-header">
          <div className="flex items-center gap-2">
            <Icon name="alert-triangle" size={18} color="#dc2626" />
            <h3>Chronic Dropout Early Warning Radar</h3>
          </div>
          <span className="badge badge-danger">{highRiskStudents.length} Students Requiring Administrative Intervention</span>
        </div>

        <div className="table-responsive">
          <table className="portal-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Class</th>
                <th>Attendance %</th>
                <th>Consecutive Absences</th>
                <th>Trend</th>
                <th>Early Warning Factor</th>
                <th>Institutional Action Plan</th>
              </tr>
            </thead>
            <tbody>
              {highRiskStudents.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-4 text-muted">
                    No students currently flagged in high dropout zone.
                  </td>
                </tr>
              ) : (
                highRiskStudents.map((stu) => (
                  <tr key={stu.studentId} className="row-high-risk">
                    <td>
                      <strong>{stu.studentName}</strong>
                      <div className="text-xs text-muted">Parent: {stu.parentName} ({stu.parentContact || 'N/A'})</div>
                    </td>
                    <td>Class {stu.className}</td>
                    <td>
                      <span className="font-bold text-danger">{stu.attendancePct}%</span>
                      <div className="text-xs text-muted">{stu.presentDays}P / {stu.absentDays}A</div>
                    </td>
                    <td>
                      {stu.hasCriticalAlert ? (
                        <span className="critical-warning-pill">
                          🚨 {stu.consecutiveAbsent} Consecutive!
                        </span>
                      ) : (
                        <span>{stu.consecutiveAbsent} days</span>
                      )}
                    </td>
                    <td>
                      <span className={`trend-tag trend-${stu.trend}`}>
                        {stu.trend.replace('_', ' ').toUpperCase()}
                      </span>
                    </td>
                    <td className="text-sm">
                      {(stu.reasons || []).join('; ')}
                    </td>
                    <td>
                      <span className="action-pill text-xs">{stu.recommendedAction}</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Class-wise Breakdown & Teacher Interventions */}
      <div className="portal-two-col-grid">
        <div className="portal-section-card">
          <div className="section-card-header">
            <div className="flex items-center gap-2">
              <Icon name="school" size={18} color="#4f46e5" />
              <h3>Class Attendance Breakdown</h3>
            </div>
          </div>

          <table className="portal-table">
            <thead>
              <tr>
                <th>Standard</th>
                <th>Present</th>
                <th>Absent</th>
                <th>Late</th>
                <th>Rate</th>
              </tr>
            </thead>
            <tbody>
              {(summary?.classBreakdown || []).map((cls, idx) => (
                <tr key={idx}>
                  <td className="font-semibold">Class {cls.className}</td>
                  <td className="text-success">{cls.present}</td>
                  <td className="text-danger">{cls.absent}</td>
                  <td className="text-warning">{cls.late}</td>
                  <td>
                    <span className="font-bold text-primary">{cls.attendancePct}%</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="portal-section-card">
          <div className="section-card-header">
            <div className="flex items-center gap-2">
              <Icon name="teacher" size={18} color="#059669" />
              <h3>Teacher Interventions Underway</h3>
            </div>
          </div>

          <div className="intervention-mini-list">
            {interventions.map((inv, idx) => (
              <div key={inv._id || idx} className="mini-inv-item">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-sm">
                    Student #{inv.studentId} • {inv.interventionType.replace('_', ' ').toUpperCase()}
                  </span>
                  <span className={`status-pill status-${inv.status}`}>{inv.status}</span>
                </div>
                <p className="text-xs text-muted mt-1">{inv.concern}</p>
                <div className="text-xs font-medium text-primary mt-1">
                  Action: {inv.actionTaken}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
