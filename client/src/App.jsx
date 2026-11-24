import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { PrivacyGuard } from './components/PrivacyGuard';

import { Login } from './pages/Login';
import { ParentStudentPortal } from './pages/ParentStudentPortal';
import { TeacherDashboard } from './pages/TeacherDashboard';
import { HeadmasterDashboard } from './pages/HeadmasterDashboard';
import { AdminClusterDashboard } from './pages/AdminClusterDashboard';
import { StudentsDirectory } from './pages/StudentsDirectory';
import { RiskEngineView } from './pages/RiskEngineView';
import { InterventionsView } from './pages/InterventionsView';
import { ReportsView } from './pages/ReportsView';
import { LearningResourcesView } from './pages/LearningResourcesView';

export function App() {
  const { currentUser, role, isStaff, isParentOrStudent, isLoading } = useAuth();

  // Hash-based router state for seamless zero-config SPA routing
  const [currentPath, setCurrentPath] = useState(() => {
    return window.location.hash ? window.location.hash.replace('#', '') : '/';
  });

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash ? window.location.hash.replace('#', '') : '/';
      setCurrentPath(hash);
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigateTo = (path) => {
    window.location.hash = `#${path}`;
    setCurrentPath(path);
  };

  if (isLoading) {
    return (
      <div className="app-loading-screen">
        <div className="spinner"></div>
        <h2>🌾 GramShiksha Monitoring System</h2>
        <p className="text-muted text-sm">Checking secure session & credentials...</p>
      </div>
    );
  }

  // If unauthenticated or navigating explicitly to /login
  if (!currentUser || currentPath.startsWith('/login')) {
    const [pathPart, queryPart] = currentPath.split('?');
    const match = pathPart.match(/^\/login\/?([a-zA-Z0-9_-]+)?$/);
    const initialRole = match && match[1] ? match[1] : 'teacher';
    const searchParams = new URLSearchParams(queryPart || '');
    const initialClass = searchParams.get('class');

    return (
      <Login
        initialRole={initialRole}
        initialClass={initialClass}
        onLoginSuccess={() => navigateTo('/')}
      />
    );
  }

  // Determine what view to render based on Role and Path
  const renderMainView = () => {
    // --- A. Strict Privacy Boundary Checks for Parent & Student ---
    if (isParentOrStudent) {
      // Forbidden paths for Parent & Student
      const restrictedStaffPaths = ['/students', '/risk', '/reports', '/academic'];
      const isRestricted = restrictedStaffPaths.some(p => currentPath === p || currentPath.startsWith(`${p}/`));

      if (isRestricted) {
        return (
          <PrivacyGuard
            title="🔒 Student Data Privacy Protection"
            message="Under institutional student data privacy guidelines, individual student risk assessments, full directories, and other children's academic records are restricted. You are only authorized to view records for your linked student."
            onReturn={() => navigateTo('/')}
          />
        );
      }

      // Check specific student ID access: e.g. /students/:id
      const studentIdMatch = currentPath.match(/^\/students\/(\d+)$/);
      if (studentIdMatch) {
        const reqId = Number(studentIdMatch[1]);
        if (reqId !== Number(currentUser.studentId)) {
          return (
            <PrivacyGuard
              title="🔒 Unauthorized Learner File Access Blocked"
              message={`You attempted to inspect student #${reqId}. Access is strictly locked to your child's record (#${currentUser.studentId}).`}
              onReturn={() => navigateTo('/')}
            />
          );
        }
      }

      // Allowed Parent & Student sub-views
      if (currentPath === '/portal/attendance') {
        return <ParentStudentPortal subTab="attendance" />;
      }
      if (currentPath === '/portal/academic') {
        return <ParentStudentPortal subTab="academic" />;
      }
      if (currentPath === '/portal/quizzes') {
        return <ParentStudentPortal subTab="quizzes" />;
      }
      if (currentPath === '/portal/interventions') {
        return <ParentStudentPortal subTab="interventions" />;
      }
      if (currentPath === '/resources') {
        return <LearningResourcesView />;
      }

      // Default home for Parent & Student
      return <ParentStudentPortal subTab="all" />;
    }

    // --- B. Staff Views (Teacher, Headmaster, Admin) ---
    if (currentPath === '/students') {
      return <StudentsDirectory />;
    }
    if (currentPath === '/risk') {
      return <RiskEngineView />;
    }
    if (currentPath === '/interventions') {
      return <InterventionsView />;
    }
    if (currentPath === '/reports') {
      return <ReportsView />;
    }
    if (currentPath === '/academic') {
      return <ReportsView />;
    }
    if (currentPath === '/resources') {
      return <LearningResourcesView />;
    }

    // Default home dashboards by specific staff role
    if (role === 'teacher') {
      return <TeacherDashboard />;
    }
    if (role === 'headmaster') {
      return <HeadmasterDashboard />;
    }
    if (role === 'admin') {
      return <AdminClusterDashboard />;
    }

    return <TeacherDashboard />;
  };

  return (
    <div className="app-layout">
      <Navbar currentPath={currentPath} onNavigate={navigateTo} />
      <div className="app-body">
        <Sidebar currentPath={currentPath} onNavigate={navigateTo} />
        <main className="app-main-content">
          {renderMainView()}
        </main>
      </div>
    </div>
  );
}

export default App;
