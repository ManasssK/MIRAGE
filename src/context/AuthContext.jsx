import { createContext, useState, useEffect } from 'react';
import axios from 'axios';

// Create context
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize API URL from environment variable or default
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  // Set auth token in headers
  const setAuthToken = (token) => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      localStorage.setItem('token', token);
    } else {
      delete axios.defaults.headers.common['Authorization'];
      localStorage.removeItem('token');
    }
  };

  // Register user
  const register = async (userData) => {
    try {
      setLoading(true);
      setError(null);
      const res = await axios.post(`${API_URL}/auth/register`, userData);

      if (res.data.token) {
        setAuthToken(res.data.token);
        setUser(res.data.user);
      }

      setLoading(false);
      return res.data;
    } catch (err) {
      setLoading(false);
      setError(
        err.response?.data?.message ||
        'Registration failed. Please try again.'
      );
      throw err;
    }
  };

  // Login user
  const login = async (userData) => {
    try {
      setLoading(true);
      setError(null);
      const res = await axios.post(`${API_URL}/auth/login`, userData);

      if (res.data.token) {
        setAuthToken(res.data.token);
        setUser(res.data.user);
      }

      setLoading(false);
      return res.data;
    } catch (err) {
      setLoading(false);
      setError(
        err.response?.data?.message ||
        'Login failed. Please check your credentials.'
      );
      throw err;
    }
  };

  // Logout user
  const logout = async () => {
    try {
      await axios.get(`${API_URL}/auth/logout`);
      setAuthToken(null);
      setUser(null);
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  // Load user
  const loadUser = async () => {
    const token = localStorage.getItem('token');

    if (token) {
      setAuthToken(token);

      try {
        setLoading(true);
        const res = await axios.get(`${API_URL}/auth/me`);
        setUser(res.data.data);
        setLoading(false);
      } catch (err) {
        setAuthToken(null);
        setUser(null);
        setLoading(false);
        console.error('Load user error:', err);
      }
    } else {
      setAuthToken(null);
      setUser(null);
      setLoading(false);
    }
  };

  // Update user profile
  const updateProfile = async (userData) => {
    try {
      setLoading(true);
      setError(null);
      const res = await axios.put(`${API_URL}/users/profile`, userData);
      setUser(res.data.data);
      setLoading(false);
      return res.data;
    } catch (err) {
      setLoading(false);
      setError(
        err.response?.data?.message ||
        'Profile update failed. Please try again.'
      );
      throw err;
    }
  };

  // Upload avatar
  const uploadAvatar = async (formData) => {
    try {
      setLoading(true);
      setError(null);

      const config = {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      };

      const res = await axios.put(
        `${API_URL}/users/avatar`,
        formData,
        config
      );

      setUser(res.data.data);
      setLoading(false);
      return res.data;
    } catch (err) {
      setLoading(false);
      setError(
        err.response?.data?.message ||
        'Avatar upload failed. Please try again.'
      );
      throw err;
    }
  };

  // Load user on mount
  useEffect(() => {
    loadUser();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        register,
        login,
        logout,
        updateProfile,
        uploadAvatar,
        loadUser,
        isAuthenticated: !!user
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
