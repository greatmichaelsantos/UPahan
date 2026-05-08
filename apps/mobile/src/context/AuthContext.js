import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '@upahan/shared';
import api from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [tenantInfo, setTenantInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [savedUser, savedTenant] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.USER),
          AsyncStorage.getItem(STORAGE_KEYS.TENANT),
        ]);
        if (savedUser) setUser(JSON.parse(savedUser));
        if (savedTenant) setTenantInfo(JSON.parse(savedTenant));
      } catch {}
      setLoading(false);
    })();
  }, []);

  const login = async (email, password, role) => {
    try {
      const res = await api.post('/auth/login', { email, password, role });
      const { user: userData, token, tenantInfo: tInfo } = res.data.data;
      await AsyncStorage.setItem(STORAGE_KEYS.TOKEN, token);
      await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userData));
      if (tInfo) await AsyncStorage.setItem(STORAGE_KEYS.TENANT, JSON.stringify(tInfo));
      setUser(userData);
      setTenantInfo(tInfo || null);
      return { success: true, user: userData };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Login failed.' };
    }
  };

  const register = async (data) => {
    try {
      const res = await api.post('/auth/register', data);
      const { user: userData, token } = res.data.data;
      await AsyncStorage.setItem(STORAGE_KEYS.TOKEN, token);
      await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userData));
      setUser(userData);
      return { success: true, user: userData };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Registration failed.' };
    }
  };

  const logout = async () => {
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.TOKEN,
      STORAGE_KEYS.USER,
      STORAGE_KEYS.TENANT,
    ]);
    setUser(null);
    setTenantInfo(null);
  };

  const updateUser = async (updatedFields) => {
    const updated = { ...user, ...updatedFields };
    await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updated));
    setUser(updated);
  };

  return (
    <AuthContext.Provider value={{ user, tenantInfo, loading, login, logout, register, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
