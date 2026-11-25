import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Icon } from '../components/Icons';

export const Login = ({ initialRole = 'teacher', onLoginSuccess }) => {
  const { login, register, isLoading, authError } = useAuth();

  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register'
  const [activeRoleTab, setActiveRoleTab] = useState(initialRole || 'teacher');

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
  const [regClass, setRegClass] = useState('8');
  const [regChildName, setRegChildName] = useState('');
  const [regParentContact, setRegParentContact] = useState('');
  const [regParentName, setRegParentName] = useState('');
  const [regVerificationKey, setRegVerificationKey] = useState('');

  // Primary Role Persona Definitions
  const roleCards = {
    teacher: {
      role: 'teacher',
      label: 'Class Teacher',
      badge: '👨‍🏫 Teacher',
      tagline: 'Classroom Roll Call, CCE Grading & Remedial Quizzes',
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
      tagline: 'School Analytics, Attendance Health & Dropout Forecasting',
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
      tagline: 'Cluster Oversight, RTE Compliance & District Grants',
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
      tagline: 'Real-Time Child Attendance, CCE Marks & Remedial Quizzes',
      themeColor: '#d97706',
      username: 'parent_asha',
      password: 'password123',
      name: 'Savita Jadhav',
      school: 'Zilla Parishad High School, Dahiwadi',
      childInfo: 'Asha Jadhav (Class 8, Roll #801)'
    },
    student: {
      role: 'student',
      label: 'Learner / Student',
      badge: '🎓 Student',
      tagline: 'Daily Streak, Audio Capsules & Remedial Practice Quizzes',
      themeColor: '#0284c7',
      username: 'student_asha',
      password: 'password123',
      name: 'Asha Jadhav',
      school: 'Zilla Parishad High School, Dahiwadi',
      childInfo: 'Class 8 (Roll #801)'
    }
  };

  // Distinct Parent Personas (1-to-1 Privacy)
  const parentDemos = [
    { username: 'parent_asha', label: 'Savita Jadhav', child: 'Asha Jadhav (Class 8, #801)', tag: 'Class 8' },
    { username: 'parent_rahul', label: 'Suresh Pawar', child: 'Rahul Pawar (Class 5, #501)', tag: 'Class 5 • Remedial Math' },
    { username: 'parent_rohan', label: 'Suresh Pawar', child: 'Rohan Pawar (Class 7, #701)', tag: 'Class 7 • High Risk' },
    { username: 'parent_aarav', label: 'Sunita Patil', child: 'Aarav Patil (Class 1, #101)', tag: 'Class 1' },
    { username: 'parent_sachin', label: 'Ramesh Kadam', child: 'Sachin Kadam (Class 10, #1001)', tag: 'Class 10' }
  ];

  // Distinct Student Personas
  const studentDemos = [
    { username: 'student_asha', label: 'Asha Jadhav (Class 8)', tag: 'Class 8 • Roll #801' },
    { username: 'student_rahul', label: 'Rahul Pawar (Class 5)', tag: 'Class 5 • Roll #501 • Remedial Quiz' },
    { username: 'student_rohan', label: 'Rohan Pawar (Class 7)', tag: 'Class 7 • Roll #701 • Remedial Quiz' },
    { username: 'student_aarav', label: 'Aarav Patil (Class 1)', tag: 'Class 1 • Roll #101' },
    { username: 'student_sachin', label: 'Sachin Kadam (Class 10)', tag: 'Class 10 • Roll #1001' }
  ];

  useEffect(() => {
    if (initialRole && roleCards[initialRole]) {
      setActiveRoleTab(initialRole);
      switchRoleDemo(initialRole);
    }
  }, [initialRole]);

  const switchRoleDemo = (roleKey) => {
    setActiveRoleTab(roleKey);
    const demo = roleCards[roleKey];
    if (demo) {
      setUsername(demo.username);
      setPassword(demo.password);
      setLocalError(null);
    }
  };

  const selectSpecificDemo = (demoUsername) => {
    setUsername(demoUsername);
    setPassword('password123');
    setLocalError(null);
  };

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
      if (err.code === 'TEACHER_APPROVAL_PENDING' || (err.message && err.message.includes('awaiting verification'))) {
        setLocalError('⏳ Verification In Progress: Your teacher credentials have been registered and are pending approval by Principal Dr. K. Patil. Please contact the school office.');
      } else {
        setLocalError(err.message || 'Login failed. Please verify credentials.');
      }
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setLocalError(null);

    if (!regFullName.trim() || !regUsername.trim() || !regEmail.trim() || !regPassword) {
      setLocalError('Please fill in all required fields.');
      return;
    }

    const payload = {
      role: activeRoleTab,
      fullName: regFullName.trim(),
      username: regUsername.trim(),
      email: regEmail.trim(),
      password: regPassword,
      schoolName: regSchool.trim(),
      className: regClass
    };

    if (activeRoleTab === 'teacher') {
      payload.assignedClass = regClass;
    } else if (activeRoleTab === 'parent') {
      if (!regChildName.trim()) {
        setLocalError("Please enter your child's full name.");
        return;
      }
      payload.childName = regChildName.trim();
      payload.parentContact = regParentContact.trim();
    } else if (activeRoleTab === 'student') {
      payload.parentName = regParentName.trim() || 'Parent/Guardian';
      payload.parentContact = regParentContact.trim();
    } else if (activeRoleTab === 'headmaster' || activeRoleTab === 'admin') {
      payload.institutionalVerificationKey = regVerificationKey.trim();
    }

    try {
      const res = await register(payload);
      if (activeRoleTab === 'teacher') {
        setRegSuccessMsg('✅ Registration Submitted! Your teacher credentials have been registered and are awaiting verification by Principal Dr. K. Patil. You can sign in once verified.');
        setAuthMode('login');
      } else {
        setRegSuccessMsg('Account registered successfully! Redirecting to portal...');
        setTimeout(() => {
          if (onLoginSuccess) {
            onLoginSuccess(res?.user || res);
          }
        }, 500);
      }
    } catch (err) {
      setLocalError(err.message || 'Registration failed. Please review fields.');
    }
  };

  const activeDemo = roleCards[activeRoleTab] || roleCards.teacher;

  return (
    <div className="login-page-wrapper">
      {/* Top Banner / District Badge */}
      <div className="login-top-bar">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xl">🌾</span>
          <span className="font-bold">GramShiksha Digital Campus ERP</span>
          <span className="text-muted text-xs">• Govt. of Maharashtra & ZP Satara Education Wing</span>
          <span className="badge badge-outline" style={{ fontSize: '0.7rem', padding: '1px 6px' }}>AY 2026–2027</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted flex items-center gap-1">
            <Icon name="wifi" size={12} color="#059669" /> 2G/3G Ready
          </span>
          <button
            className="btn-link text-xs flex items-center gap-1"
            onClick={() => setShowHelpdesk(true)}
          >
            <Icon name="phone" size={12} /> District Helpdesk
          </button>
        </div>
      </div>

      <div className="login-main-card">
        {/* Unified 5-Role Selector Tabs */}
        <div className="role-tab-selector">
          {Object.keys(roleCards).map((key) => {
            const item = roleCards[key];
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
        </div>

        {/* Distinct Class Teacher Presets (Shown in Teacher Tab) */}
        {authMode === 'login' && activeRoleTab === 'teacher' && (
          <div className="persona-quick-switcher" style={{ marginTop: 0, marginBottom: '1.25rem', borderTop: 'none', background: '#f8fafc', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
            <span className="quick-switch-label">Select Dedicated Class Teacher:</span>
            <div className="quick-switch-buttons">
              {[
                { username: 'teacher_class1', label: 'Sunita Gaikwad', tag: 'Class 1' },
                { username: 'teacher_class3', label: 'Ramesh Patil', tag: 'Class 3' },
                { username: 'teacher_class5', label: 'Vandana Shinde', tag: 'Class 5' },
                { username: 'teacher', label: 'S. Deshmukh', tag: 'Class 8 (Default)' },
                { username: 'teacher_class10', label: 'Anand Kulkarni', tag: 'Class 10' }
              ].map((t) => {
                const isSelected = username === t.username;
                return (
                  <button
                    key={t.username}
                    type="button"
                    className={`btn-chip ${isSelected ? 'chip-active' : ''}`}
                    onClick={() => selectSpecificDemo(t.username)}
                  >
                    <span>👨‍🏫 {t.label} ({t.tag})</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Distinct 1-to-1 Parent Selector Presets (Shown in Parent Tab) */}
        {authMode === 'login' && activeRoleTab === 'parent' && (
          <div className="persona-quick-switcher" style={{ marginTop: 0, marginBottom: '1.25rem', borderTop: 'none', background: '#f8fafc', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
            <span className="quick-switch-label">Select Student's Guardian Account (1-to-1 Privacy):</span>
            <div className="quick-switch-buttons">
              {parentDemos.map((p) => {
                const isSelected = username === p.username;
                return (
                  <button
                    key={p.username}
                    type="button"
                    className={`btn-chip ${isSelected ? 'chip-active' : ''}`}
                    onClick={() => selectSpecificDemo(p.username)}
                    title={p.child}
                  >
                    <span>{p.label} ({p.tag})</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Distinct Student Selector Presets (Shown in Student Tab) */}
        {authMode === 'login' && activeRoleTab === 'student' && (
          <div className="persona-quick-switcher" style={{ marginTop: 0, marginBottom: '1.25rem', borderTop: 'none', background: '#f8fafc', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
            <span className="quick-switch-label">Select Student Account:</span>
            <div className="quick-switch-buttons">
              {studentDemos.map((s) => {
                const isSelected = username === s.username;
                return (
                  <button
                    key={s.username}
                    type="button"
                    className={`btn-chip ${isSelected ? 'chip-active' : ''}`}
                    onClick={() => selectSpecificDemo(s.username)}
                  >
                    <span>{s.label}</span>
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

        {/* Alerts */}
        {regSuccessMsg && (
          <div className="login-error-alert" style={{ backgroundColor: '#ecfdf5', borderColor: '#a7f3d0', color: '#047857' }}>
            <Icon name="check-circle" size={16} />
            <span>{regSuccessMsg}</span>
          </div>
        )}

        {(localError || authError) && (
          <div className="login-error-alert" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '0.5rem' }}>
            <div className="flex items-center gap-2">
              <Icon name="alert-triangle" size={16} />
              <span>{localError || authError}</span>
            </div>
            {String(localError || authError).includes('Invalid username or password') && (
              <div className="text-xs" style={{ color: '#991b1b', lineHeight: 1.4, width: '100%' }}>
                <strong>💡 Quick Tip:</strong> The password for all accounts is <code style={{ background: '#fee2e2', padding: '1px 5px', borderRadius: '3px', fontWeight: 'bold' }}>password123</code>.
                If this is a fresh cloud database on Render/Atlas,{' '}
                <button
                  type="button"
                  style={{ textDecoration: 'underline', background: 'none', border: 'none', color: '#b91c1c', fontWeight: 'bold', cursor: 'pointer', padding: 0 }}
                  onClick={async () => {
                    try {
                      setLocalError('Initializing demo database on cloud server...');
                      await authAPI.seedDemo();
                      setRegSuccessMsg('✅ Demo cloud database successfully initialized! You can now sign in with password: password123');
                      setLocalError(null);
                    } catch (e) {
                      setLocalError('Database initialization notice: ' + (e.message || 'Check backend status'));
                    }
                  }}
                >
                  ⚡ Click here to seed/reset demo cloud database
                </button>.
              </div>
            )}
            {String(localError || authError).includes('404') && (
              <div className="text-xs" style={{ color: '#991b1b', lineHeight: 1.4 }}>
                <strong>💡 Tip (404 Error):</strong> Frontend cannot reach the backend API. Please make sure <code>VITE_API_URL</code> is saved in Vercel Project Settings ➔ Environment Variables, and then trigger a <strong>Redeploy</strong> from the Deployments tab.
              </div>
            )}
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
                  placeholder="e.g. teacher, parent_asha, student_asha"
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
                  placeholder="e.g. Savita Jadhav"
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
                  placeholder="e.g. parent_asha"
                  value={regUsername}
                  onChange={(e) => setRegUsername(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-row-2col">
              <div className="form-group">
                <label htmlFor="regEmail">Email Address</label>
                <input
                  id="regEmail"
                  type="email"
                  className="form-control"
                  placeholder="name@example.com"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="regPassword">Password (min. 6 chars)</label>
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

            {/* Role Specific Fields */}
            {activeRoleTab === 'parent' && (
              <div className="form-row-2col">
                <div className="form-group">
                  <label htmlFor="regChildName">Child's Full Name</label>
                  <input
                    id="regChildName"
                    type="text"
                    className="form-control"
                    placeholder="e.g. Asha Jadhav"
                    value={regChildName}
                    onChange={(e) => setRegChildName(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="regClass">Child's Class</label>
                  <select
                    id="regClass"
                    className="form-control"
                    value={regClass}
                    onChange={(e) => setRegClass(e.target.value)}
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(c => (
                      <option key={c} value={String(c)}>Class {c}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {activeRoleTab === 'student' && (
              <div className="form-row-2col">
                <div className="form-group">
                  <label htmlFor="regClass">Enrolled Class</label>
                  <select
                    id="regClass"
                    className="form-control"
                    value={regClass}
                    onChange={(e) => setRegClass(e.target.value)}
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(c => (
                      <option key={c} value={String(c)}>Class {c}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="regParentName">Parent / Guardian Name</label>
                  <input
                    id="regParentName"
                    type="text"
                    className="form-control"
                    placeholder="e.g. Savita Jadhav"
                    value={regParentName}
                    onChange={(e) => setRegParentName(e.target.value)}
                  />
                </div>
              </div>
            )}

            {activeRoleTab === 'teacher' && (
              <div className="form-row-2col">
                <div className="form-group">
                  <label htmlFor="regClass">Assigned Primary Class</label>
                  <select
                    id="regClass"
                    className="form-control"
                    value={regClass}
                    onChange={(e) => setRegClass(e.target.value)}
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(c => (
                      <option key={c} value={String(c)}>Class {c}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="regSchool">Assigned School</label>
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
              {isLoading ? 'Creating Account...' : `Register as ${activeDemo.label}`}
            </button>
          </form>
        )}

        {/* 1-Click Role Quick Bar */}
        <div className="persona-quick-switcher">
          <div className="flex justify-between items-center mb-1">
            <span className="quick-switch-label">Instant Test Persona Quick Switcher:</span>
            <button
              type="button"
              className="btn-link text-xs"
              style={{ fontSize: '0.75rem', color: 'var(--primary)' }}
              onClick={async () => {
                try {
                  setLocalError('Initializing demo database on cloud server...');
                  await authAPI.seedDemo();
                  setRegSuccessMsg('✅ Demo cloud database successfully initialized! All personas ready.');
                  setLocalError(null);
                } catch (e) {
                  setLocalError('Database initialization notice: ' + (e.message || 'Check backend status'));
                }
              }}
            >
              ⚡ Re-seed Cloud DB
            </button>
          </div>
          <div className="quick-switch-buttons" style={{ flexWrap: 'wrap', gap: '0.4rem' }}>
            <button
              type="button"
              className={`btn-chip ${username === 'teacher' ? 'chip-active' : ''}`}
              onClick={() => {
                setActiveRoleTab('teacher');
                selectSpecificDemo('teacher');
              }}
            >
              👨‍🏫 Class 8 Teacher (S. Deshmukh)
            </button>
            <button
              type="button"
              className={`btn-chip ${username === 'teacher_class1' ? 'chip-active' : ''}`}
              onClick={() => {
                setActiveRoleTab('teacher');
                selectSpecificDemo('teacher_class1');
              }}
            >
              👨‍🏫 Class 1 Teacher (S. Gaikwad)
            </button>
            <button
              type="button"
              className={`btn-chip ${username === 'parent_asha' ? 'chip-active' : ''}`}
              onClick={() => {
                setActiveRoleTab('parent');
                selectSpecificDemo('parent_asha');
              }}
            >
              👨‍👩‍👧 Asha's Parent (Class 8)
            </button>
            <button
              type="button"
              className={`btn-chip ${username === 'parent_aarav' ? 'chip-active' : ''}`}
              onClick={() => {
                setActiveRoleTab('parent');
                selectSpecificDemo('parent_aarav');
              }}
            >
              👨‍👩‍👧 Aarav's Parent (Class 1)
            </button>
            <button
              type="button"
              className={`btn-chip ${username === 'headmaster' ? 'chip-active' : ''}`}
              onClick={() => {
                setActiveRoleTab('headmaster');
                selectSpecificDemo('headmaster');
              }}
            >
              🏫 Headmaster (Dr. K. Patil)
            </button>
            <button
              type="button"
              className={`btn-chip ${username === 'admin' ? 'chip-active' : ''}`}
              onClick={() => {
                setActiveRoleTab('admin');
                selectSpecificDemo('admin');
              }}
            >
              🏛️ District BEO (B. Shinde)
            </button>
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
