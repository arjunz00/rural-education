import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Icon } from '../components/Icons';

export const Login = ({ initialRole = 'teacher', onLoginSuccess }) => {
  const { login, isLoading, authError } = useAuth();

  const [activeRoleTab, setActiveRoleTab] = useState(initialRole || 'teacher');
  const [username, setUsername] = useState('teacher');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [showHelpdesk, setShowHelpdesk] = useState(false);
  const [localError, setLocalError] = useState(null);

  // Sync role tab if route changes (e.g. /login/headmaster)
  useEffect(() => {
    if (initialRole) {
      setActiveRoleTab(initialRole);
      switchRoleDemo(initialRole);
    }
  }, [initialRole]);

  // Demo account preset mappings for 1-Click Fast Sign In
  const demoAccounts = {
    teacher: {
      role: 'teacher',
      label: 'Class Teacher',
      badge: '👨‍🏫 Teacher',
      tagline: 'Classroom Roll Call & CCE Grading',
      themeColor: '#4f46e5',
      username: 'teacher',
      password: 'password123',
      name: 'S. Deshmukh',
      school: 'Zilla Parishad High School, Dahiwadi'
    },
    headmaster: {
      role: 'headmaster',
      label: 'Headmaster / Principal',
      badge: '🏫 Headmaster',
      tagline: 'School Analytics & Dropout Forecasting',
      themeColor: '#7c3aed',
      username: 'headmaster',
      password: 'password123',
      name: 'Dr. K. Patil',
      school: 'Zilla Parishad High School, Dahiwadi'
    },
    admin: {
      role: 'admin',
      label: 'Block Education Officer',
      badge: '🏛️ District Admin',
      tagline: 'Cluster Oversight & RTE Compliance',
      themeColor: '#059669',
      username: 'admin',
      password: 'password123',
      name: 'B. Shinde',
      school: 'Dahiwadi Block Education Circle'
    },
    parent: {
      role: 'parent',
      label: 'Parent / Guardian',
      badge: '👨‍👩‍👧 Parent',
      tagline: 'Child Attendance Alerts & Marksheet',
      themeColor: '#d97706',
      username: 'parent',
      password: 'password123',
      name: 'Savita Jadhav (Asha Jadhav #1)',
      school: 'Zilla Parishad High School, Dahiwadi'
    },
    student: {
      role: 'student',
      label: 'Learner / Student',
      badge: '🎓 Student',
      tagline: 'Daily Streak Tracker & Audio Lessons',
      themeColor: '#0284c7',
      username: 'student',
      password: 'password123',
      name: 'Asha Jadhav (Class 8, #1)',
      school: 'Zilla Parishad High School, Dahiwadi'
    }
  };

  const switchRoleDemo = (roleKey) => {
    setActiveRoleTab(roleKey);
    const demo = demoAccounts[roleKey];
    if (demo) {
      setUsername(demo.username);
      setPassword(demo.password);
      setLocalError(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError(null);

    if (!username.trim() || !password) {
      setLocalError('Please enter both username and password.');
      return;
    }

    try {
      const user = await login(username.trim(), password);
      if (onLoginSuccess) {
        onLoginSuccess(user);
      }
    } catch (err) {
      setLocalError(err.message || 'Login failed. Please verify credentials.');
    }
  };

  const activeDemo = demoAccounts[activeRoleTab] || demoAccounts.teacher;

  return (
    <div className="login-page-wrapper">
      {/* Top Banner / District Badge */}
      <div className="login-top-bar">
        <div className="flex items-center gap-2">
          <span className="text-xl">🌾</span>
          <span className="font-bold">GramShiksha Remote Monitoring System</span>
          <span className="text-muted text-xs">• Zilla Parishad Satara / RTE Cell</span>
        </div>
        <button
          className="btn-link text-xs flex items-center gap-1"
          onClick={() => setShowHelpdesk(true)}
        >
          <Icon name="phone" size={12} /> District Helpdesk
        </button>
      </div>

      <div className="login-main-card">
        {/* Role Selector Tabs */}
        <div className="role-tab-selector">
          {Object.keys(demoAccounts).map((key) => {
            const item = demoAccounts[key];
            const isSelected = activeRoleTab === key;
            return (
              <button
                key={key}
                type="button"
                className={`role-tab-btn ${isSelected ? 'active' : ''}`}
                onClick={() => {
                  window.location.hash = `#/login/${key}`;
                  switchRoleDemo(key);
                }}
              >
                <span className="role-tab-badge">{item.badge}</span>
                <span className="role-tab-name">{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Dynamic Hero Section */}
        <div className="login-hero-section" style={{ borderLeftColor: activeDemo.themeColor }}>
          <div className="hero-text">
            <h2>{activeDemo.label} Portal</h2>
            <p className="hero-tagline">{activeDemo.tagline}</p>
            <p className="hero-school text-xs text-muted">
              <Icon name="school" size={13} /> {activeDemo.school}
            </p>
          </div>
          <div className="quick-fill-chip" onClick={() => switchRoleDemo(activeRoleTab)}>
            <Icon name="zap" size={14} color="#f59e0b" />
            <span>1-Click Fast Sign In ⚡ ({activeDemo.username})</span>
          </div>
        </div>

        {/* Error Alert */}
        {(localError || authError) && (
          <div className="login-error-alert">
            <Icon name="alert-triangle" size={16} />
            <span>{localError || authError}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="username">Username or Official Email</label>
            <div className="input-with-icon">
              <input
                id="username"
                type="text"
                className="form-control"
                placeholder="e.g. teacher, parent, student"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <div className="flex justify-between items-center mb-1">
              <label htmlFor="password">Password</label>
              <button
                type="button"
                className="btn-link text-xs flex items-center gap-1"
                onClick={() => setShowPassword(!showPassword)}
              >
                <Icon name={showPassword ? 'eye-off' : 'eye'} size={12} />
                <span>{showPassword ? 'Hide' : 'Show'}</span>
              </button>
            </div>
            <div className="input-with-icon">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                className="form-control"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
            </div>
          </div>

          <div className="form-row-check">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <span>Keep session active on this device</span>
            </label>
            <span className="text-xs text-muted">2G/3G Low-Data Ready</span>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-block btn-lg"
            disabled={isLoading}
          >
            {isLoading ? 'Authenticating...' : `Sign In as ${activeDemo.label}`}
          </button>
        </form>

        {/* 1-Click Persona Quick Bar */}
        <div className="persona-quick-switcher">
          <span className="quick-switch-label">Test Persona Shortcuts:</span>
          <div className="quick-switch-buttons">
            {Object.keys(demoAccounts).map((key) => (
              <button
                key={key}
                type="button"
                className={`btn-chip ${activeRoleTab === key ? 'chip-active' : ''}`}
                onClick={() => {
                  window.location.hash = `#/login/${key}`;
                  switchRoleDemo(key);
                }}
              >
                {demoAccounts[key].badge}
              </button>
            ))}
          </div>
        </div>

        {/* Low-Bandwidth Network Guarantee Footer */}
        <div className="login-footer-guarantee">
          <div className="flex items-center gap-2 text-xs text-muted">
            <Icon name="wifi" size={14} color="#059669" />
            <span>Low-Bandwidth Optimized: Compressed payloads under 50 KB for patchy rural coverage.</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted mt-1">
            <Icon name="lock" size={14} color="#4f46e5" />
            <span>Strict Privacy: Parent & Student accounts are cryptographically restricted to their child only.</span>
          </div>
        </div>
      </div>

      {/* District Helpdesk Drawer Modal */}
      {showHelpdesk && (
        <div className="modal-backdrop" onClick={() => setShowHelpdesk(false)}>
          <div className="modal-content helpdesk-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="flex items-center gap-2">
                <Icon name="phone" size={18} color="#059669" />
                <h3 className="font-bold">Satara District Rural EdTech Helpdesk</h3>
              </div>
              <button className="btn-icon" onClick={() => setShowHelpdesk(false)}>
                <Icon name="x-circle" size={18} />
              </button>
            </div>
            <div className="modal-body">
              <p className="text-sm mb-3">
                If you are a teacher, parent, or student in Dahiwadi Block encountering connectivity delays or authentication issues:
              </p>
              <div className="helpdesk-contact-list">
                <div className="contact-card">
                  <strong>Block Education Officer (BEO) Toll-Free:</strong>
                  <p className="contact-val">1800-233-4567 (9:00 AM - 5:30 PM)</p>
                </div>
                <div className="contact-card">
                  <strong>SMS / WhatsApp Attendance Support:</strong>
                  <p className="contact-val">+91 94220 12345 (Send school roll call code)</p>
                </div>
                <div className="contact-card">
                  <strong>Default Demo Password:</strong>
                  <p className="contact-val font-mono">password123</p>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowHelpdesk(false)}>
                Close Helpdesk
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
