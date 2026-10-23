import React, { createContext, useContext, useState } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('sp_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('sp_token') || null);
  const [loading, setLoading] = useState(false);

  const login = async (emailOrUserId, password, role) => {
    setLoading(true);
    try {
      const response = await api.post('/auth/login', { emailOrUserId, password, role });
      const { token: newToken, user: userData } = response.data;

      localStorage.setItem('sp_token', newToken);
      localStorage.setItem('sp_user', JSON.stringify(userData));

      setToken(newToken);
      setUser(userData);
      return { success: true, role: userData.role };
    } catch (error) {
      const msg = error.response?.data?.message || (error.code === 'ERR_NETWORK' || !error.response ? 'Backend security server is offline or unreachable. Please verify backend is running on port 7000.' : 'Login failed. Please check credentials.');
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, email, phone, password, role, department, customUserId) => {
    setLoading(true);
    try {
      const response = await api.post('/auth/register', { name, email, phone, password, role, department, customUserId });
      const { token: newToken, user: userData } = response.data;

      localStorage.setItem('sp_token', newToken);
      localStorage.setItem('sp_user', JSON.stringify(userData));

      setToken(newToken);
      setUser(userData);
      return { success: true, role: userData.role };
    } catch (error) {
      const msg = error.response?.data?.message || (error.code === 'ERR_NETWORK' || !error.response ? 'Backend security server is offline or unreachable. Please verify backend is running on port 7000.' : 'Registration failed.');
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (emailOrUserId, newPassword) => {
    setLoading(true);
    try {
      const response = await api.post('/auth/reset-password', { emailOrUserId, newPassword });
      const { token: newToken, user: userData } = response.data;

      localStorage.setItem('sp_token', newToken);
      localStorage.setItem('sp_user', JSON.stringify(userData));

      setToken(newToken);
      setUser(userData);
      return { success: true, role: userData.role };
    } catch (error) {
      const msg = error.response?.data?.message || (error.code === 'ERR_NETWORK' || !error.response ? 'Backend security server is offline or unreachable. Please verify backend is running on port 7000.' : 'Password reset failed.');
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  };

  const updateUserProfile = async (name, avatar) => {
    try {
      const response = await api.put('/users/profile', { name, avatar });
      const updatedUser = response.data.user;

      localStorage.setItem('sp_user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      return { success: true };
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to update profile.';
      return { success: false, error: msg };
    }
  };

  const logout = () => {
    localStorage.removeItem('sp_token');
    localStorage.removeItem('sp_user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, resetPassword, updateUserProfile, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
