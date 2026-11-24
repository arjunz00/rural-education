import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Icon } from './Icons';

export const Sidebar = ({ currentPath, onNavigate }) => {
  const { role, isParentOrStudent, isTeacher, isHeadmaster, isAdmin } = useAuth();

  // Navigation configuration adapted by role
  let navItems = [];

  if (isParentOrStudent) {
    // Strictly Scoped Family Navigation
    navItems = [
      { id: '/', label: 'My Safe Portal', icon: 'student', desc: 'Child Overview & Streak' },
      { id: '/portal/attendance', label: 'Attendance Calendar', icon: 'calendar', desc: 'Daily Logs & Absence Alerts' },
      { id: '/portal/academic', label: 'CCE Marksheet', icon: 'file-text', desc: 'Unit Test Results & Grades' },
      { id: '/portal/interventions', label: 'Teacher Outreach', icon: 'teacher', desc: 'Home Visits & Remarks' },
      { id: '/resources', label: 'Offline Study Packets', icon: 'book', desc: 'Audio Capsules & Notes' }
    ];
  } else if (isTeacher) {
    // Class Teacher Navigation
    navItems = [
      { id: '/', label: 'Daily Roll Call', icon: 'calendar', desc: 'Classroom Attendance Matrix' },
      { id: '/students', label: 'Students Directory', icon: 'users', desc: 'Class Roster & Profiles' },
      { id: '/risk', label: 'Early Warning Engine', icon: 'alert-triangle', desc: 'Dropout Detection & Alerts' },
      { id: '/academic', label: 'CCE Marks Ledger', icon: 'file-text', desc: 'Unit Test Grading' },
      { id: '/interventions', label: 'Interventions Log', icon: 'teacher', desc: 'Home Visits & Parent Calls' },
      { id: '/resources', label: 'Offline Study Packets', icon: 'book', desc: 'Learning Resources' }
    ];
  } else if (isHeadmaster) {
    // Headmaster Navigation
    navItems = [
      { id: '/', label: 'School Dashboard', icon: 'school', desc: 'Attendance & Trends' },
      { id: '/students', label: 'Students Directory', icon: 'users', desc: 'All Classes (6-10)' },
      { id: '/risk', label: 'Dropout Warning Radar', icon: 'alert-triangle', desc: 'Chronic Risk Forecaster' },
      { id: '/interventions', label: 'Teacher Interventions', icon: 'teacher', desc: 'Outreach Review & Efficacy' },
      { id: '/academic', label: 'Academic Standards', icon: 'chart', desc: 'Subject-wise Performance' },
      { id: '/reports', label: 'Audit Reports & CSV', icon: 'printer', desc: 'Official ZP Compliance' },
      { id: '/resources', label: 'Learning Resources', icon: 'book', desc: 'Curriculum Repository' }
    ];
  } else if (isAdmin) {
    // District / Block Education Officer Navigation
    navItems = [
      { id: '/', label: 'Cluster Oversight', icon: 'admin', desc: 'Village Schools Cluster' },
      { id: '/students', label: 'Students Directory', icon: 'users', desc: 'Block Learner Census' },
      { id: '/risk', label: 'Cluster Risk Radar', icon: 'alert-triangle', desc: 'Dropout Prevention Matrix' },
      { id: '/reports', label: 'RTE Compliance Audits', icon: 'printer', desc: 'Statutory Inspections' },
      { id: '/interventions', label: 'Interventions Supervision', icon: 'teacher', desc: 'Block Outreach Efficacy' },
      { id: '/resources', label: 'Cluster Study Packets', icon: 'book', desc: 'Digital Education Hub' }
    ];
  }

  return (
    <aside className="sidebar-root">
      <div className="sidebar-header">
        <span className="sidebar-category-label">
          {isParentOrStudent ? 'FAMILY SAFE ACCESS' : 'MANAGEMENT PORTAL'}
        </span>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const isActive = currentPath === item.id;
          return (
            <button
              key={item.id}
              className={`nav-item-btn ${isActive ? 'active' : ''}`}
              onClick={() => onNavigate(item.id)}
            >
              <div className="nav-item-icon">
                <Icon name={item.icon} size={18} />
              </div>
              <div className="nav-item-content">
                <span className="nav-item-title">{item.label}</span>
                <span className="nav-item-desc">{item.desc}</span>
              </div>
            </button>
          );
        })}
      </nav>

      {/* Safety & Privacy Notice Footer */}
      <div className="sidebar-privacy-card">
        <div className="flex items-center gap-2 mb-1">
          <Icon name="lock" size={14} color="#059669" />
          <span className="text-xs font-bold text-success">Privacy Protected</span>
        </div>
        <p className="text-xs text-muted">
          {isParentOrStudent
            ? 'Scoped exclusively to your linked child record.'
            : 'Institution-level encrypted role credentials active.'}
        </p>
      </div>
    </aside>
  );
};
