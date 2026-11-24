import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Icon } from '../components/Icons';

export const Login = ({ initialRole = 'teacher', initialClass = null, onLoginSuccess }) => {
  const { login, register, isLoading, authError } = useAuth();

  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register'
  const [activeRoleTab, setActiveRoleTab] = useState(initialRole || 'teacher');
  const [selectedClass, setSelectedClass] = useState(initialClass || '8');
  
  // Sign In inputs
  const [username, setUsername] = useState('teacher');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [showHelpdesk, setShowHelpdesk] = useState(false);
  const [localError, setLocalError] = useState(null);
  const [regSuccessMsg, setRegSuccessMsg] = useState(null);

  // Registration inputs
  const [regFullName, setRegFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regSchool, setRegSchool] = useState('Zilla Parishad High School, Dahiwadi');
  const [regChildName, setRegChildName] = useState('');
  const [regParentContact, setRegParentContact] = useState('');
  const [regParentName, setRegParentName] = useState('');
  const [regVerificationKey, setRegVerificationKey] = useState('');

  // Sync role tab & class when URL changes
  useEffect(() => {
    if (initialRole) {
      setActiveRoleTab(initialRole);
    }
    if (initialClass) {
      setSelectedClass(String(initialClass));
    }
  }, [initialRole, initialClass]);

  // Determine active grade wing based on selected class
  const getGradeWing = (cls) => {
    const num = Number(cls);
    if (num >= 1 && num <= 5) return { name: 'Primary Wing', badge: '🟢 Primary (1–5)', color: '#047857', bg: '#ecfdf5', cls: 'wing-primary' };
    if (num >= 6 && num <= 8) return { name: 'Middle Wing', badge: '🔵 Middle (6–8)', color: '#1d4ed8', bg: '#eff6ff', cls: 'wing-middle' };
    return { name: 'Secondary Wing', badge: '🟣 Secondary (9–10)', color: '#7e22ce', bg: '#faf5ff', cls: 'wing-secondary' };
  };

  // Dynamic demo persona resolver based on activeRoleTab and selectedClass
  const getDemoPersona = (roleKey, classLevel) => {
    const strCls = String(classLevel);
    
    if (roleKey === 'teacher') {
      if (strCls === '2') {
        return {
          username: 'teacher.c2',
          password: 'password123',
          name: 'P. Shinde (Primary)',
          label: 'Class 2 Teacher',
          tagline: 'Primary Wing • Early Numeracy & Phonics Roll Call',
          school: 'Zilla Parishad High School, Dahiwadi',
          themeColor: '#059669'
        };
      }
      if (strCls === '5') {
        return {
          username: 'teacher.c5',
          password: 'password123',
          name: 'M. Kulkarni (Primary Wing Head)',
          label: 'Class 5 Teacher',
          tagline: 'Primary Wing • General Science & Multiplication Review',
          school: 'Zilla Parishad High School, Dahiwadi',
          themeColor: '#059669'
        };
      }
      if (strCls === '10') {
        return {
          username: 'teacher.c10',
          password: 'password123',
          name: 'V. Joshi (Secondary Coordinator)',
          label: 'Class 10 Teacher',
          tagline: 'Secondary Wing • Board Exam Prep & CCE Analytics',
          school: 'Zilla Parishad High School, Dahiwadi',
          themeColor: '#7c3aed'
        };
      }
      return {
        username: 'teacher',
        password: 'password123',
        name: 'S. Deshmukh',
        label: `Class ${strCls} Teacher`,
        tagline: `Class ${strCls} Roll Call & CCE Grading`,
        school: 'Zilla Parishad High School, Dahiwadi',
        themeColor: '#4f46e5'
      };
    }

    if (roleKey === 'parent') {
      if (strCls === '2') {
        return {
          username: 'parent.c2',
          password: 'password123',
          name: 'Suresh Pawar (Rahul Pawar #2)',
          label: 'Class 2 Parent / Guardian',
          tagline: 'Child Attendance Alerts & Primary Marksheet',
          school: 'Zilla Parishad High School, Dahiwadi',
          themeColor: '#d97706'
        };
      }
      if (strCls === '5') {
        return {
          username: 'parent.c5',
          password: 'password123',
          name: 'Sunita More (Ananya More #5)',
          label: 'Class 5 Parent / Guardian',
          tagline: 'Child Attendance Alerts & Primary Marksheet',
          school: 'Zilla Parishad High School, Dahiwadi',
          themeColor: '#d97706'
        };
      }
      if (strCls === '10') {
        return {
          username: 'parent.c10',
          password: 'password123',
          name: 'Ramesh Kadam (Sachin Kadam #6)',
          label: 'Class 10 Parent / Guardian',
          tagline: 'Secondary Board Exam Tracking & Attendance Alerts',
          school: 'Zilla Parishad High School, Dahiwadi',
          themeColor: '#d97706'
        };
      }
      return {
        username: 'parent',
        password: 'password123',
        name: 'Savita Jadhav (Asha Jadhav #1)',
        label: `Class ${strCls} Parent / Guardian`,
        tagline: 'Child Attendance Alerts & Marksheet',
        school: 'Zilla Parishad High School, Dahiwadi',
        themeColor: '#d97706'
      };
    }

    if (roleKey === 'student') {
      if (strCls === '2') {
        return {
          username: 'student.c2',
          password: 'password123',
          name: 'Rahul Pawar (Class 2, #2)',
          label: 'Class 2 Learner / Student',
          tagline: 'Daily Attendance Streak & Audio Lessons',
          school: 'Zilla Parishad High School, Dahiwadi',
          themeColor: '#0284c7'
        };
      }
      if (strCls === '5') {
        return {
          username: 'student.c5',
          password: 'password123',
          name: 'Ananya More (Class 5, #5)',
          label: 'Class 5 Learner / Student',
          tagline: 'Daily Attendance Streak & Science Revision',
          school: 'Zilla Parishad High School, Dahiwadi',
          themeColor: '#0284c7'
        };
      }
      if (strCls === '10') {
        return {
          username: 'student.c10',
          password: 'password123',
          name: 'Sachin Kadam (Class 10, #6)',
          label: 'Class 10 Learner / Student',
          tagline: 'Board Examination Formulas & Audio Lectures',
          school: 'Zilla Parishad High School, Dahiwadi',
          themeColor: '#0284c7'
        };
      }
      return {
        username: 'student',
        password: 'password123',
        name: 'Asha Jadhav (Class 8, #1)',
        label: `Class ${strCls} Learner / Student`,
        tagline: 'Daily Streak Tracker & Audio Lessons',
        school: 'Zilla Parishad High School, Dahiwadi',
        themeColor: '#0284c7'
      };
    }

    if (roleKey === 'headmaster') {
      return {
        username: 'headmaster',
        password: 'password123',
        name: 'Dr. K. Patil',
        label: 'Headmaster / Principal',
        tagline: 'School Analytics & Dropout Forecasting',
        school: 'Zilla Parishad High School, Dahiwadi',
        themeColor: '#7c3aed'
      };
    }

    // Default: admin
    return {
      username: 'admin',
      password: 'password123',
      name: 'B. Shinde',
      label: 'Block Education Officer',
      tagline: 'Cluster Oversight & RTE Compliance',
      school: 'Dahiwadi Block Education Circle',
      themeColor: '#059669'
    };
  };

  // Base role definitions
  const roleTabs = {
    teacher: { key: 'teacher', label: 'Class Teacher', badge: '👨‍🏫 Teacher' },
    headmaster: { key: 'headmaster', label: 'Headmaster', badge: '🏫 Headmaster' },
    admin: { key: 'admin', label: 'District Admin', badge: '🏛️ Admin' },
    parent: { key: 'parent', label: 'Parent / Guardian', badge: '👨‍👩‍👧 Parent' },
    student: { key: 'student', label: 'Student / Learner', badge: '🎓 Student' }
  };

  const currentPersona = getDemoPersona(activeRoleTab, selectedClass);
  const currentWing = getGradeWing(selectedClass);
  const isClassScopedRole = ['teacher', 'parent', 'student'].includes(activeRoleTab);

  // Switch demo account
  const handleSelectRole = (roleKey) => {
    setActiveRoleTab(roleKey);
    window.location.hash = `#/login/${roleKey}${isClassScopedRole ? `?class=${selectedClass}` : ''}`;
    const persona = getDemoPersona(roleKey, selectedClass);
    setUsername(persona.username);
    setPassword(persona.password);
    setLocalError(null);
  };

  const handleSelectClass = (cls) => {
    setSelectedClass(cls);
    window.location.hash = `#/login/${activeRoleTab}?class=${cls}`;
    const persona = getDemoPersona(activeRoleTab, cls);
    setUsername(persona.username);
    setPassword(persona.password);
    setLocalError(null);
  };

  // Handle Login submission
  const handleLoginSubmit = async (e) => {
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

  // Handle Registration submission
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setLocalError(null);

    if (!regFullName.trim()) {
      setLocalError('Please enter your full name.');
      return;
    }
    if (!regUsername.trim()) {
      setLocalError('Please choose a username.');
      return;
    }
    if (!regEmail.trim()) {
      setLocalError('Please provide a valid email address.');
      return;
    }
    if (!regPassword || regPassword.length < 6) {
      setLocalError('Password must be at least 6 characters.');
      return;
    }

    const payload = {
      role: activeRoleTab,
      fullName: regFullName.trim(),
      username: regUsername.trim(),
      email: regEmail.trim(),
      password: regPassword,
      schoolName: regSchool.trim()
    };

    if (activeRoleTab === 'teacher') {
      payload.assignedClass = selectedClass;
      payload.className = selectedClass;
    } else if (activeRoleTab === 'parent') {
      if (!regChildName.trim()) {
        setLocalError("Please enter your child's full name.");
        return;
      }
      payload.childName = regChildName.trim();
      payload.className = selectedClass;
      payload.parentContact = regParentContact.trim();
    } else if (activeRoleTab === 'student') {
      payload.className = selectedClass;
      payload.parentName = regParentName.trim() || 'Parent/Guardian';
      payload.parentContact = regParentContact.trim();
    } else if (activeRoleTab === 'headmaster' || activeRoleTab === 'admin') {
      payload.institutionalVerificationKey = regVerificationKey.trim();
    }

    try {
      const user = await register(payload);
      setRegSuccessMsg('Account registered successfully! Redirecting...');
      setTimeout(() => {
        if (onLoginSuccess) {
          onLoginSuccess(user);
        }
      }, 500);
    } catch (err) {
      setLocalError(err.message || 'Registration failed. Please check inputs.');
    }
  };

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
          {Object.keys(roleTabs).map((key) => {
            const item = roleTabs[key];
            const isSelected = activeRoleTab === key;
            return (
              <button
                key={key}
                type="button"
                className={`role-tab-btn ${isSelected ? 'active' : ''}`}
                onClick={() => handleSelectRole(key)}
              >
                <span className="role-tab-badge">{item.badge}</span>
                <span className="role-tab-name">{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Dynamic Hero Section */}
        <div className="login-hero-section" style={{ borderLeftColor: currentPersona.themeColor }}>
          <div className="hero-text">
            <div className="flex items-center gap-2 mb-1">
              <h2 style={{ margin: 0 }}>{currentPersona.label} Portal</h2>
              {isClassScopedRole && (
                <span className={`wing-indicator ${currentWing.cls}`}>
                  {currentWing.badge}
                </span>
              )}
            </div>
            <p className="hero-tagline">{currentPersona.tagline}</p>
            <p className="hero-school text-xs text-muted">
              <Icon name="school" size={13} /> {currentPersona.school}
            </p>
          </div>
          {authMode === 'login' && (
            <div
              className="quick-fill-chip"
              onClick={() => {
                setUsername(currentPersona.username);
                setPassword(currentPersona.password);
                setLocalError(null);
              }}
            >
              <Icon name="zap" size={14} color="#f59e0b" />
              <span>1-Click Fast Sign In ⚡ ({currentPersona.username})</span>
            </div>
          )}
        </div>

        {/* Class-Wise Grade Wings & Selector Bar (Shown for Teacher, Parent, Student) */}
        {isClassScopedRole && (
          <div className="grade-wings-container">
            <div className="grade-wings-header">
              <span className="grade-wings-title">
                Select Class Level ({currentWing.name}):
              </span>
              <span className="text-xs text-muted font-mono">
                Class {selectedClass} Active
              </span>
            </div>
            <div className="grade-wings-pills">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'].map((clsNum) => {
                const isSelected = selectedClass === clsNum;
                const wing = getGradeWing(clsNum);
                return (
                  <button
                    key={clsNum}
                    type="button"
                    className={`class-pill-btn ${isSelected ? 'active' : ''}`}
                    onClick={() => handleSelectClass(clsNum)}
                    title={`${wing.name} - Class ${clsNum}`}
                  >
                    Class {clsNum}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Sign In vs Register Segmented Toggle */}
        <div className="auth-mode-toggle">
          <button
            type="button"
            className={`auth-mode-btn ${authMode === 'login' ? 'active' : ''}`}
            onClick={() => {
              setAuthMode('login');
              setLocalError(null);
            }}
          >
            Sign In
          </button>
          <button
            type="button"
            className={`auth-mode-btn ${authMode === 'register' ? 'active' : ''}`}
            onClick={() => {
              setAuthMode('register');
              setLocalError(null);
            }}
          >
            Register New Account
          </button>
        </div>

        {/* Success or Error Alerts */}
        {regSuccessMsg && (
          <div className="login-error-alert" style={{ backgroundColor: '#ecfdf5', borderColor: '#a7f3d0', color: '#047857' }}>
            <Icon name="check-circle" size={16} />
            <span>{regSuccessMsg}</span>
          </div>
        )}

        {(localError || authError) && (
          <div className="login-error-alert">
            <Icon name="alert-triangle" size={16} />
            <span>{localError || authError}</span>
          </div>
        )}

        {/* Mode A: Sign In Form */}
        {authMode === 'login' ? (
          <form onSubmit={handleLoginSubmit} className="login-form">
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
              {isLoading ? 'Authenticating...' : `Sign In as ${currentPersona.label}`}
            </button>
          </form>
        ) : (
          /* Mode B: Multi-Role Registration Form */
          <form onSubmit={handleRegisterSubmit} className="login-form">
            <div className="form-row-2col">
              <div className="form-group">
                <label htmlFor="regFullName">
                  {activeRoleTab === 'parent' ? 'Guardian / Parent Full Name' : activeRoleTab === 'student' ? 'Student Full Name' : 'Full Name'}
                </label>
                <input
                  id="regFullName"
                  type="text"
                  className="form-control"
                  placeholder="e.g. Ramesh Kadam"
                  value={regFullName}
                  onChange={(e) => setRegFullName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="regUsername">Desired Username</label>
                <input
                  id="regUsername"
                  type="text"
                  className="form-control"
                  placeholder="e.g. ramesh.kadam"
                  value={regUsername}
                  onChange={(e) => setRegUsername(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-row-2col">
              <div className="form-group">
                <label htmlFor="regEmail">
                  {activeRoleTab === 'headmaster' || activeRoleTab === 'teacher' ? 'Official / Gov Email' : 'Email Address'}
                </label>
                <input
                  id="regEmail"
                  type="email"
                  className="form-control"
                  placeholder="name@school.edu.in"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="regPassword">
                  {activeRoleTab === 'student' ? 'Password or 6-digit PIN' : 'Password (min. 6 chars)'}
                </label>
                <input
                  id="regPassword"
                  type="password"
                  className="form-control"
                  placeholder="••••••••"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>
            </div>

            {/* Role-Specific Fields */}
            {activeRoleTab === 'teacher' && (
              <div className="form-row-2col">
                <div className="form-group">
                  <label htmlFor="assignedClass">Assigned Primary Class</label>
                  <select
                    id="assignedClass"
                    className="form-control"
                    value={selectedClass}
                    onChange={(e) => setSelectedClass(e.target.value)}
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(c => (
                      <option key={c} value={String(c)}>Class {c} ({getGradeWing(c).name})</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="regSchool">Assigned School Name</label>
                  <input
                    id="regSchool"
                    type="text"
                    className="form-control"
                    value={regSchool}
                    onChange={(e) => setRegSchool(e.target.value)}
                    required
                  />
                </div>
              </div>
            )}

            {activeRoleTab === 'parent' && (
              <>
                <div className="form-row-2col">
                  <div className="form-group">
                    <label htmlFor="regChildName">Child / Student Full Name</label>
                    <input
                      id="regChildName"
                      type="text"
                      className="form-control"
                      placeholder="e.g. Sachin Kadam"
                      value={regChildName}
                      onChange={(e) => setRegChildName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="parentChildClass">Child's Class</label>
                    <select
                      id="parentChildClass"
                      className="form-control"
                      value={selectedClass}
                      onChange={(e) => setSelectedClass(e.target.value)}
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(c => (
                        <option key={c} value={String(c)}>Class {c} ({getGradeWing(c).name})</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-row-2col">
                  <div className="form-group">
                    <label htmlFor="regParentContact">Mobile / Phone Number</label>
                    <input
                      id="regParentContact"
                      type="text"
                      className="form-control"
                      placeholder="+91 98765 43210"
                      value={regParentContact}
                      onChange={(e) => setRegParentContact(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="regSchool">Child's School</label>
                    <input
                      id="regSchool"
                      type="text"
                      className="form-control"
                      value={regSchool}
                      onChange={(e) => setRegSchool(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </>
            )}

            {activeRoleTab === 'student' && (
              <div className="form-row-2col">
                <div className="form-group">
                  <label htmlFor="studentClass">Enrolled Class</label>
                  <select
                    id="studentClass"
                    className="form-control"
                    value={selectedClass}
                    onChange={(e) => setSelectedClass(e.target.value)}
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(c => (
                      <option key={c} value={String(c)}>Class {c} ({getGradeWing(c).name})</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="regParentName">Parent / Guardian Name</label>
                  <input
                    id="regParentName"
                    type="text"
                    className="form-control"
                    placeholder="e.g. Ramesh Kadam"
                    value={regParentName}
                    onChange={(e) => setRegParentName(e.target.value)}
                  />
                </div>
              </div>
            )}

            {(activeRoleTab === 'headmaster' || activeRoleTab === 'admin') && (
              <div className="form-group">
                <div className="flex justify-between items-center mb-1">
                  <label htmlFor="regVerificationKey">Institutional Verification Key</label>
                  <span className="text-xs text-muted font-mono">Demo: ZP-EDU-VERIFIED-2026</span>
                </div>
                <input
                  id="regVerificationKey"
                  type="text"
                  className="form-control font-mono"
                  placeholder="ZP-EDU-VERIFIED-2026"
                  value={regVerificationKey}
                  onChange={(e) => setRegVerificationKey(e.target.value)}
                  required
                />
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary btn-block btn-lg"
              disabled={isLoading}
            >
              {isLoading ? 'Creating Account...' : `Register as ${currentPersona.label}`}
            </button>
          </form>
        )}

        {/* 1-Click Persona Quick Bar */}
        <div className="persona-quick-switcher">
          <span className="quick-switch-label">Test Persona Shortcuts:</span>
          <div className="quick-switch-buttons">
            {Object.keys(roleTabs).map((key) => (
              <button
                key={key}
                type="button"
                className={`btn-chip ${activeRoleTab === key ? 'chip-active' : ''}`}
                onClick={() => handleSelectRole(key)}
              >
                {roleTabs[key].badge}
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
