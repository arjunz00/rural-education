import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useLowBandwidth } from '../context/LowBandwidthContext';
import { Icon } from './Icons';

export const Navbar = ({ currentPath, onNavigate }) => {
  const { currentUser, role, logout } = useAuth();
  const { isLowBandwidth, toggleLowBandwidth, formattedDataUsage } = useLowBandwidth();

  const getRoleBadgeClass = (r) => {
    switch (r) {
      case 'teacher': return 'role-teacher';
      case 'headmaster': return 'role-headmaster';
      case 'admin': return 'role-admin';
      case 'parent': return 'role-parent';
      case 'student': return 'role-student';
      default: return 'role-default';
    }
  };

  const getRoleDisplayName = (r) => {
    switch (r) {
      case 'teacher': return '👨‍🏫 Class Teacher';
      case 'headmaster': return '🏫 Headmaster';
      case 'admin': return '🏛️ Block Officer (BEO)';
      case 'parent': return '👨‍👩‍👧 Parent / Guardian';
      case 'student': return '🎓 Learner / Student';
      default: return r;
    }
  };

  return (
    <header className="navbar-root">
      <div className="navbar-left">
        <div className="brand-logo" onClick={() => onNavigate('/')}>
          <span className="brand-emblem">🌾</span>
          <div className="brand-text">
            <span className="brand-title">GramShiksha</span>
            <span className="brand-subtitle">Rural Education Monitoring & Early Intervention</span>
          </div>
        </div>

        <div className="school-pill">
          <Icon name="school" size={14} />
          <span>{currentUser?.schoolName || 'Zilla Parishad High School, Dahiwadi'}</span>
        </div>
      </div>

      <div className="navbar-right">
        {/* Low-Bandwidth Data Saver Toggle */}
        <button
          className={`data-saver-btn ${isLowBandwidth ? 'active' : ''}`}
          onClick={toggleLowBandwidth}
          title="Toggle 2G/3G Low-Bandwidth Optimization Mode"
        >
          <Icon name="wifi" size={14} />
          <span>
            {isLowBandwidth ? '2G/3G Data Saver: ON' : 'High Speed Mode'}
          </span>
          <span className="bandwidth-counter">({formattedDataUsage})</span>
        </button>

        {/* User Persona Profile */}
        <div className="user-profile-badge">
          <div className={`role-tag ${getRoleBadgeClass(role)}`}>
            {getRoleDisplayName(role)}
          </div>
          <div className="user-meta">
            <span className="user-name">{currentUser?.fullName}</span>
            {currentUser?.studentId && (
              <span className="user-sub text-xs">
                Linked Student: #{currentUser.studentId}
              </span>
            )}
          </div>
        </div>

        {/* Sign Out Button */}
        <button
          className="btn btn-outline btn-sm logout-btn"
          onClick={logout}
          title="Sign out of system"
        >
          <Icon name="lock" size={14} />
          <span>Sign Out</span>
        </button>
      </div>
    </header>
  );
};
