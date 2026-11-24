import React, { useState, useEffect } from 'react';
import { attendanceAPI, academicAPI, riskAPI } from '../services/api';
import { Icon } from '../components/Icons';

export const ReportsView = () => {
  const [attendanceSummary, setAttendanceSummary] = useState(null);
  const [academicSummary, setAcademicSummary] = useState(null);
  const [riskList, setRiskList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadReportsData();
  }, []);

  const loadReportsData = async () => {
    setIsLoading(true);
    try {
      const [attRes, acadRes, riskRes] = await Promise.all([
        attendanceAPI.getSummary(),
        academicAPI.getSummary(),
        riskAPI.getAssessments()
      ]);
      if (attRes.success) setAttendanceSummary(attRes.summary);
      if (acadRes.success) setAcademicSummary(acadRes.summary);
      if (riskRes.success) setRiskList(riskRes.assessments || []);
    } catch (err) {
      console.error('Failed to load reports data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportFullCSV = () => {
    const headers = ['StudentID', 'StudentName', 'Class', 'AttendancePct', 'PresentDays', 'AbsentDays', 'LateDays', 'RiskLevel', 'CriticalAlert'];
    const rows = riskList.map(item => [
      item.studentId,
      `"${item.studentName}"`,
      `"Class ${item.className}"`,
      `${item.attendancePct}%`,
      item.presentDays,
      item.absentDays,
      item.lateDays,
      item.riskLevel,
      item.hasCriticalAlert ? 'YES' : 'NO'
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `RTE_Comprehensive_Audit_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="reports-view-page">
      <div className="dashboard-top-header">
        <div>
          <h2>📊 Institutional Audit Reports & Compliance Documentation</h2>
          <p className="text-sm text-muted">
            Official Zilla Parishad & Right to Education (RTE) statutory reporting documents
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button className="btn btn-primary" onClick={handleExportFullCSV}>
            <Icon name="download" size={16} /> Export Full Audit CSV
          </button>
          <button className="btn btn-outline" onClick={() => window.print()}>
            <Icon name="printer" size={16} /> Print Statutory Audit
          </button>
        </div>
      </div>

      {/* RTE Compliance Certificate Banner */}
      <div className="rte-compliance-banner">
        <div className="flex items-center gap-3">
          <div className="rte-seal">⚖️</div>
          <div>
            <h3 className="font-bold text-lg">Right to Education (RTE) Compliance Ledger</h3>
            <p className="text-sm">
              Section 16 & 24 Compliance Audit • School Institution: ZP High School, Dahiwadi (Satara)
            </p>
          </div>
        </div>
        <div className="rte-status-badge">
          <Icon name="shield" size={14} color="#059669" />
          <span>Statutorily Monitored</span>
        </div>
      </div>

      {/* Grid: Attendance Summary & Subject Averages */}
      <div className="portal-two-col-grid">
        <div className="portal-section-card">
          <div className="section-card-header">
            <div className="flex items-center gap-2">
              <Icon name="calendar" size={18} color="#059669" />
              <h3>Attendance Compliance Overview</h3>
            </div>
            <span className="badge badge-primary">
              Overall: {attendanceSummary?.overallAttendancePct || 0}%
            </span>
          </div>

          <div className="report-stat-list">
            <div className="report-stat-item">
              <span>Total Recorded Instructional Instances:</span>
              <strong>{attendanceSummary?.totalRecords || 0}</strong>
            </div>
            <div className="report-stat-item">
              <span>Total Present Marks:</span>
              <strong className="text-success">{attendanceSummary?.totalPresent || 0}</strong>
            </div>
            <div className="report-stat-item">
              <span>Total Unexcused Absences:</span>
              <strong className="text-danger">{attendanceSummary?.totalAbsent || 0}</strong>
            </div>
            <div className="report-stat-item">
              <span>Late Arrival Records:</span>
              <strong className="text-warning">{attendanceSummary?.totalLate || 0}</strong>
            </div>
          </div>
        </div>

        <div className="portal-section-card">
          <div className="section-card-header">
            <div className="flex items-center gap-2">
              <Icon name="chart" size={18} color="#4f46e5" />
              <h3>CCE Academic Standards</h3>
            </div>
          </div>

          <table className="portal-table">
            <thead>
              <tr>
                <th>Subject</th>
                <th>Evaluations</th>
                <th>Class Average</th>
                <th>Standard Grade</th>
              </tr>
            </thead>
            <tbody>
              {(academicSummary?.subjectAverages || []).map((subj, idx) => (
                <tr key={idx}>
                  <td className="font-semibold">{subj.subject}</td>
                  <td>{subj.count} Students</td>
                  <td className="font-bold text-primary">{subj.averagePercentage}%</td>
                  <td>
                    <span className="grade-tag grade-a">{subj.grade}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
