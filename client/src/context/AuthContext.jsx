import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi, userApi } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [preferences, setPreferences] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchCurrentUser = async () => {
    try {
      const token = localStorage.getItem('myschedule_token');
      if (!token) {
        setLoading(false);
        return;
      }
      const res = await authApi.getMe();
      if (res.data.success) {
        setUser(res.data.user);
        setPreferences(res.data.preferences);
      }
    } catch (err) {
      console.error('Auth verification failed:', err);
      localStorage.removeItem('myschedule_token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const login = async (email, password) => {
    const res = await authApi.login({ email, password });
    if (res.data.success) {
      localStorage.setItem('myschedule_token', res.data.token);
      await fetchCurrentUser();
      return res.data;
    }
    throw new Error(res.data.message || 'Login failed');
  };

  const register = async (name, email, password, timezone) => {
    const res = await authApi.register({ name, email, password, timezone });
    if (res.data.success) {
      localStorage.setItem('myschedule_token', res.data.token);
      await fetchCurrentUser();
      return res.data;
    }
    throw new Error(res.data.message || 'Registration failed');
  };

  const logout = () => {
    localStorage.removeItem('myschedule_token');
    setUser(null);
    setPreferences(null);
    window.location.href = '/login';
  };

  const updatePreferencesState = async (newPrefs) => {
    const res = await userApi.updatePreferences(newPrefs);
    if (res.data.success) {
      setPreferences(res.data.preferences);
    }
    return res.data;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        preferences,
        loading,
        login,
        register,
        logout,
        fetchCurrentUser,
        updatePreferencesState,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
