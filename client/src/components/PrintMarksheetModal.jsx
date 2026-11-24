import React from 'react';
import { Icon } from './Icons';

export const PrintMarksheetModal = ({ student, academicSummary, onClose }) => {
  if (!student) return null;

  const handlePrint = () => {
    window.print();
  };

  const records = academicSummary?.allRecords || [];
  const summary = academicSummary?.summary || { totalMarks: 0, totalMax: 0, overallPercentage: 0, overallGrade: '-' };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content marksheet-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header no-print">
          <div className="flex items-center gap-2">
            <span className="badge badge-success">
              <Icon name="printer" size={14} /> Official CCE Marksheet
            </span>
            <span className="text-xs text-muted">Govt. of Maharashtra / Zilla Parishad</span>
          </div>
          <div className="flex items-center gap-2">
            <button className="btn btn-primary btn-sm" onClick={handlePrint}>
              <Icon name="printer" size={14} /> Print / Save PDF
            </button>
            <button className="btn-icon" onClick={onClose}>
              <Icon name="x-circle" size={20} />
            </button>
          </div>
        </div>

        {/* Printable Marksheet Container */}
        <div className="printable-sheet">
          <div className="sheet-header">
            <div className="sheet-emblem">🌾</div>
            <div className="sheet-titles">
              <h2>ZILLA PARISHAD HIGH SCHOOL, DAHIWADI</h2>
              <p className="sheet-sub">Department of School Education • Satara District</p>
              <h3>CONTINUOUS & COMPREHENSIVE EVALUATION (CCE) - UNIT TEST 1</h3>
              <p className="text-xs">Academic Session 2026-27 • Low-Bandwidth Verified Ledger</p>
            </div>
          </div>

          <div className="student-info-grid">
            <div className="info-item">
              <span className="label">Student Full Name:</span>
              <span className="value">{student.fullName}</span>
            </div>
            <div className="info-item">
              <span className="label">Roll No / Student ID:</span>
              <span className="value">#{student.numericId}</span>
            </div>
            <div className="info-item">
              <span className="label">Standard / Class:</span>
              <span className="value">Class {student.className}</span>
            </div>
            <div className="info-item">
              <span className="label">Parent / Guardian:</span>
              <span className="value">{student.parentName}</span>
            </div>
            <div className="info-item">
              <span className="label">School Institution:</span>
              <span className="value">{student.schoolName}</span>
            </div>
            <div className="info-item">
              <span className="label">Issue Date:</span>
              <span className="value">{new Date().toISOString().split('T')[0]}</span>
            </div>
          </div>

          <table className="sheet-table">
            <thead>
              <tr>
                <th>Sr.</th>
                <th>Subject Name</th>
                <th>Evaluation</th>
                <th>Max Marks</th>
                <th>Marks Obtained</th>
                <th>Percentage</th>
                <th>Grade</th>
                <th>Teacher Remarks</th>
              </tr>
            </thead>
            <tbody>
              {records.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-4">No examination records logged yet.</td>
                </tr>
              ) : (
                records.map((rec, index) => {
                  const pct = Math.round((rec.marksObtained / rec.maxMarks) * 100);
                  let grade = 'D';
                  if (pct >= 85) grade = 'A+';
                  else if (pct >= 70) grade = 'A';
                  else if (pct >= 55) grade = 'B';
                  else if (pct >= 40) grade = 'C';

                  return (
                    <tr key={rec._id || index}>
                      <td>{index + 1}</td>
                      <td className="font-semibold">{rec.subject}</td>
                      <td>{rec.examName}</td>
                      <td>{rec.maxMarks}</td>
                      <td className="font-bold">{rec.marksObtained}</td>
                      <td>{pct}%</td>
                      <td>
                        <span className={`grade-tag grade-${grade.toLowerCase().replace('+', 'plus')}`}>
                          {grade}
                        </span>
                      </td>
                      <td className="text-sm">{rec.remarks || 'Satisfactory progress.'}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan="3" className="font-bold text-right">Aggregate Total:</td>
                <td className="font-bold">{summary.totalMax}</td>
                <td className="font-bold">{summary.totalMarks}</td>
                <td className="font-bold text-primary">{summary.overallPercentage}%</td>
                <td className="font-bold">
                  <span className="grade-tag grade-a">{summary.overallGrade}</span>
                </td>
                <td className="font-bold text-success">
                  {summary.overallPercentage >= 40 ? 'PROMOTED / PASSED' : 'REMEDIAL REQUIRED'}
                </td>
              </tr>
            </tfoot>
          </table>

          <div className="sheet-signatures">
            <div className="sig-block">
              <div className="sig-line"></div>
              <span>Class Teacher's Signature</span>
              <small>(S. Deshmukh)</small>
            </div>
            <div className="sig-block">
              <div className="sig-line"></div>
              <span>Parent / Guardian's Signature</span>
              <small>({student.parentName})</small>
            </div>
            <div className="sig-block">
              <div className="sig-line"></div>
              <span>Headmaster Seal & Signature</span>
              <small>(Dr. K. Patil)</small>
            </div>
          </div>
        </div>

        <div className="modal-footer no-print">
          <button className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
          <button className="btn btn-primary" onClick={handlePrint}>
            <Icon name="printer" size={16} /> Print Marksheet
          </button>
        </div>
      </div>
    </div>
  );
};
