import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

const AuthContext = createContext(null);

const INACTIVITY_TIMEOUT = 15 * 60 * 1000; // 15 minutes

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('upahan_user');
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  });
  const [tenantInfo, setTenantInfo] = useState(() => {
    try {
      const saved = localStorage.getItem('upahan_tenant');
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  });
  const [loading, setLoading] = useState(false);
  const timerRef = useRef(null);
  const navigate = useNavigate();

  const logout = useCallback(() => {
    localStorage.removeItem('upahan_token');
    localStorage.removeItem('upahan_user');
    localStorage.removeItem('upahan_tenant');
    setUser(null);
    setTenantInfo(null);
    if (timerRef.current) clearTimeout(timerRef.current);
    navigate('/select-role');
  }, [navigate]);

  const resetTimer = useCallback(() => {
    if (!user) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      logout();
    }, INACTIVITY_TIMEOUT);
  }, [user, logout]);

  useEffect(() => {
    if (!user) return;
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    events.forEach(e => window.addEventListener(e, resetTimer, { passive: true }));
    resetTimer();
    return () => {
      events.forEach(e => window.removeEventListener(e, resetTimer));
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [user, resetTimer]);

  const login = async (email, password, role) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password, role });
      const { user: userData, token, tenantInfo: tInfo } = res.data.data;
      localStorage.setItem('upahan_token', token);
      localStorage.setItem('upahan_user', JSON.stringify(userData));
      if (tInfo) localStorage.setItem('upahan_tenant', JSON.stringify(tInfo));
      setUser(userData);
      setTenantInfo(tInfo);
      return { success: true, user: userData };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Login failed.' };
    } finally {
      setLoading(false);
    }
  };

  const register = async (data) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/register', data);
      const { user: userData, token } = res.data.data;
      localStorage.setItem('upahan_token', token);
      localStorage.setItem('upahan_user', JSON.stringify(userData));
      setUser(userData);
      return { success: true, user: userData };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Registration failed.' };
    } finally {
      setLoading(false);
    }
  };

  const updateUser = useCallback((updatedFields) => {
    setUser(prev => {
      const updated = { ...prev, ...updatedFields };
      localStorage.setItem('upahan_user', JSON.stringify(updated));
      return updated;
    });
  }, []);

  return (
    <AuthContext.Provider value={{ user, tenantInfo, loading, login, logout, register, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
