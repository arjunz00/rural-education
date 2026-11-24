import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('rural_ed_token'));
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    const verifyToken = async () => {
      const storedToken = localStorage.getItem('rural_ed_token');
      if (!storedToken) {
        setIsLoading(false);
        return;
      }

      try {
        const res = await authAPI.getMe();
        if (res.success && res.user) {
          setCurrentUser(res.user);
        } else {
          localStorage.removeItem('rural_ed_token');
          setToken(null);
          setCurrentUser(null);
        }
      } catch (err) {
        console.warn('Session verification failed, logging out:', err.message);
        localStorage.removeItem('rural_ed_token');
        setToken(null);
        setCurrentUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    verifyToken();
  }, []);

  const login = async (username, password) => {
    setIsLoading(true);
    setAuthError(null);
    try {
      const res = await authAPI.login(username, password);
      if (res.success && res.token) {
        localStorage.setItem('rural_ed_token', res.token);
        setToken(res.token);
        setCurrentUser(res.user);
        return res.user;
      }
      throw new Error(res.error || 'Login failed');
    } catch (err) {
      setAuthError(err.message || 'Login failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout().catch(() => {});
    } finally {
      localStorage.removeItem('rural_ed_token');
      setToken(null);
      setCurrentUser(null);
      window.location.hash = '#/login';
    }
  };

  const role = currentUser?.role || null;
  const isStaff = ['teacher', 'headmaster', 'admin'].includes(role);
  const isParentOrStudent = ['parent', 'student'].includes(role);

  const value = {
    currentUser,
    token,
    isLoading,
    authError,
    login,
    logout,
    role,
    isStaff,
    isParentOrStudent,
    isTeacher: role === 'teacher',
    isHeadmaster: role === 'headmaster',
    isAdmin: role === 'admin',
    isParent: role === 'parent',
    isStudent: role === 'student'
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
