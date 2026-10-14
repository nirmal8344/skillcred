import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../api/client';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('skillcred_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      const storedToken = localStorage.getItem('skillcred_token');
      if (storedToken) {
        try {
          const userData = await api.get('/auth/me');
          setUser(userData);
        } catch (err) {
          console.error('Session expired or invalid:', err);
          logout();
        }
      }
      setLoading(false);
    };

    fetchCurrentUser();
  }, []);

  const login = async (email, password) => {
    const data = await api.post('/auth/login', { email, password });
    localStorage.setItem('skillcred_token', data.token);
    setToken(data.token);
    setUser({
      id: data.id,
      fullName: data.fullName,
      email: data.email,
      role: data.role,
      certificateDisplayName: data.certificateDisplayName,
    });
    return data;
  };

  const adminLogin = async (email, password) => {
    const data = await api.post('/auth/admin-login', { email, password });
    localStorage.setItem('skillcred_token', data.token);
    setToken(data.token);
    setUser({
      id: data.id,
      fullName: data.fullName,
      email: data.email,
      role: data.role,
      certificateDisplayName: data.certificateDisplayName,
    });
    return data;
  };

  const register = async (registrationData) => {
    const data = await api.post('/auth/register', {
      ...registrationData,
      certificateDisplayName: registrationData.certificateDisplayName || registrationData.fullName,
    });
    localStorage.setItem('skillcred_token', data.token);
    setToken(data.token);
    setUser({
      id: data.id,
      fullName: data.fullName,
      email: data.email,
      role: data.role,
      certificateDisplayName: data.certificateDisplayName,
      learnerCategory: data.learnerCategory,
    });
    return data;
  };

  const updateProfile = async (profileData) => {
    const updated = await api.put('/auth/profile', profileData);
    setUser(updated);
    return updated;
  };

  const logout = () => {
    localStorage.removeItem('skillcred_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'ADMIN',
        login,
        adminLogin,
        register,
        updateProfile,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    return {
      user: null,
      token: localStorage.getItem('skillcred_token'),
      loading: false,
      isAuthenticated: false,
      isAdmin: false,
      login: async () => {},
      adminLogin: async () => {},
      register: async () => {},
      updateProfile: async () => {},
      logout: () => {},
    };
  }
  return context;
};
