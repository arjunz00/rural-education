import React, { useState, useEffect } from 'react';
import { studentsAPI } from '../services/api';
import { Icon } from '../components/Icons';

export const StudentsDirectory = () => {
  const [students, setStudents] = useState([]);
  const [selectedClass, setSelectedClass] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Detail view modal
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentDetails, setStudentDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  useEffect(() => {
    fetchStudents();
  }, [selectedClass]);

  const fetchStudents = async () => {
    setIsLoading(true);
    try {
      const params = {};
      if (selectedClass !== 'All') params.className = selectedClass;
      const res = await studentsAPI.getStudents(params);
      setStudents(res.data || []);
    } catch (err) {
      console.error('Failed to load students:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenStudent = async (student) => {
    setSelectedStudent(student);
    setLoadingDetails(true);
    try {
      const [attRes, acadRes, intRes] = await Promise.all([
        studentsAPI.getStudentAttendance(student.numericId),
        studentsAPI.getStudentAcademic(student.numericId),
        studentsAPI.getStudentInterventions(student.numericId)
      ]);
      setStudentDetails({
        attendance: attRes,
        academic: acadRes,
        interventions: intRes.data || []
      });
    } catch (err) {
      console.error('Failed to load student details:', err);
    } finally {
      setLoadingDetails(false);
    }
  };

  const filteredStudents = students.filter(s => {
    const matchesSearch = s.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          s.parentName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="students-directory-page">
      <div className="dashboard-top-header">
        <div>
          <h2>👥 Institutional Students Directory</h2>
          <p className="text-sm text-muted">
            Official Roster • Zilla Parishad High School, Dahiwadi
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Class Filter */}
          <select
            className="form-control"
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
          >
            <option value="All">All Classes (6-10)</option>
            <option value="7">Class 7</option>
            <option value="8">Class 8</option>
            <option value="9">Class 9</option>
          </select>

          {/* Search Box */}
          <div className="search-input-wrap">
            <input
              type="text"
              className="form-control"
              placeholder="Search student or parent name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="portal-section-card">
        {isLoading ? (
          <div className="portal-loading-state">
            <div className="spinner"></div>
            <p>Loading student directory...</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="portal-table">
              <thead>
                <tr>
                  <th>Roll #</th>
                  <th>Student Full Name</th>
                  <th>Class / Standard</th>
                  <th>Guardian / Parent Name</th>
                  <th>Contact Number</th>
                  <th>School Institution</th>
                  <th>Profile Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-4 text-muted">
                      No matching student records found.
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((s) => (
                    <tr key={s.numericId}>
                      <td className="font-mono font-bold">#{s.numericId}</td>
                      <td className="font-semibold text-primary">{s.fullName}</td>
                      <td>Class {s.className}</td>
                      <td>{s.parentName}</td>
                      <td className="font-mono text-sm">{s.parentContact || 'Not recorded'}</td>
                      <td className="text-xs text-muted">{s.schoolName}</td>
                      <td>
                        <button
                          className="btn btn-outline btn-sm"
                          onClick={() => handleOpenStudent(s)}
                        >
                          <Icon name="eye" size={13} /> View File
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

      {/* Student Comprehensive Record Modal */}
      {selectedStudent && (
        <div className="modal-backdrop" onClick={() => setSelectedStudent(null)}>
          <div className="modal-content student-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="flex items-center gap-2">
                <Icon name="student" size={20} color="#0284c7" />
                <h3 className="font-bold">
                  Learner Dossier: {selectedStudent.fullName} (Roll #{selectedStudent.numericId})
                </h3>
              </div>
              <button className="btn-icon" onClick={() => setSelectedStudent(null)}>
                <Icon name="x-circle" size={18} />
              </button>
            </div>

            <div className="modal-body">
              {loadingDetails ? (
                <div className="portal-loading-state">
                  <div className="spinner"></div>
                  <p>Loading records...</p>
                </div>
              ) : (
                <div className="student-dossier-grid">
                  <div className="dossier-section">
                    <h4 className="font-bold text-sm mb-2 flex items-center gap-1">
                      <Icon name="calendar" size={14} /> Attendance History & Streak
                    </h4>
                    <div className="quick-metric-row">
                      <span>Rate: <strong>{studentDetails?.attendance?.summary?.attendancePct}%</strong></span>
                      <span>Streak: <strong>{studentDetails?.attendance?.summary?.streak} days</strong></span>
                      <span>Absent: <strong className="text-danger">{studentDetails?.attendance?.summary?.absentDays}</strong></span>
                    </div>
                  </div>

                  <div className="dossier-section">
                    <h4 className="font-bold text-sm mb-2 flex items-center gap-1">
                      <Icon name="file-text" size={14} /> Academic Performance (CCE)
                    </h4>
                    <div className="quick-metric-row">
                      <span>Aggregate: <strong>{studentDetails?.academic?.summary?.overallPercentage}%</strong></span>
                      <span>Grade: <strong>{studentDetails?.academic?.summary?.overallGrade}</strong></span>
                      <span>Subjects: <strong>{studentDetails?.academic?.allRecords?.length}</strong></span>
                    </div>
                  </div>

                  <div className="dossier-section full-width">
                    <h4 className="font-bold text-sm mb-2 flex items-center gap-1">
                      <Icon name="teacher" size={14} /> Documented Interventions ({studentDetails?.interventions?.length})
                    </h4>
                    {studentDetails?.interventions?.length === 0 ? (
                      <p className="text-xs text-muted">No interventions logged.</p>
                    ) : (
                      <ul className="mini-inv-bullet-list">
                        {studentDetails?.interventions?.map((inv, idx) => (
                          <li key={idx} className="text-xs">
                            <strong>{inv.createdOn} ({inv.interventionType}):</strong> {inv.concern} - <em>Action: {inv.actionTaken}</em>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setSelectedStudent(null)}>
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
