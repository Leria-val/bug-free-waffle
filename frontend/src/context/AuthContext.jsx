// src/context/Authcontext.js

import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api.js';


const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('jd_token');
    const saved = localStorage.getItem('jd_user');
    if (token && saved) {
      try { setUser(JSON.parse(saved)); }
      catch { localStorage.clear(); }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    if (!data.requiresMfa) {
      localStorage.setItem('jd_token', data.token);
      localStorage.setItem('jd_user', JSON.stringify(data.user));
      setUser(data.user);
    }
    return data;
  };

  const verifyMfa = async (tempToken, mfaCode) => {
    const { data } = await api.post('/auth/verify-mfa', { tempToken, mfaCode });
    localStorage.setItem('jd_token', data.token);
    localStorage.setItem('jd_user', JSON.stringify(data.user));
    setUser(data.user);
    return data;
  };

  const register = async (name, email, password) => {
    const { data } = await api.post('/auth/register', { name, email, password });
    localStorage.setItem('jd_token', data.token);
    localStorage.setItem('jd_user', JSON.stringify(data.user));
    setUser(data.user);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('jd_token');
    localStorage.removeItem('jd_user');
    setUser(null);
  };

  const isAdmin  = () => user?.role === 'ADMIN';
  const isLawyer = () => user?.role === 'LAWYER' || user?.role === 'ADMIN';
  const isClient = () => user?.role === 'CLIENT';
  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{ user, loading, login, verifyMfa, register, logout, isAdmin, isLawyer, isClient, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth deve ser usado dentro de <AuthProvider>');
  return ctx;
};