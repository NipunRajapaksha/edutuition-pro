import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../api/client';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('edutuition_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('edutuition_token');
      if (storedToken) {
        try {
          const res = await api.getMe();
          if (res.data.success) {
            setUser(res.data.user);
          } else {
            logout();
          }
        } catch {
          logout();
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await api.login(email, password);
      if (res.data.success) {
        const { token: authToken, user: authUser } = res.data;
        localStorage.setItem('edutuition_token', authToken);
        setToken(authToken);
        setUser(authUser);
        return { success: true };
      }
      return { success: false, message: res.data.message };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || 'Login failed. Please check credentials.'
      };
    }
  };

  const quickLogin = async (roleType) => {
    let email = 'teacher@tuition.lk';
    if (roleType === 'student') email = 'student1@tuition.lk';
    if (roleType === 'student2') email = 'student2@tuition.lk';
    if (roleType === 'parent') email = 'parent1@tuition.lk';

    return await login(email, 'password123');
  };

  const logout = () => {
    localStorage.removeItem('edutuition_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        role: user?.role || null,
        loading,
        login,
        quickLogin,
        logout,
        isAuthenticated: !!token && !!user
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
