import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../api/client';

const AuthContext = createContext();

// Default pre-seeded Super Admin account
const DEFAULT_USERS = [
  {
    id: 'user_admin_001',
    name: 'Institute Owner / Admin (ප්‍රධාන පරිපාලක)',
    email: 'admin@tuition.lk',
    password: ['admin123', 'password123', 'admin'],
    role: 'teacher',
    isAdmin: true,
    phone: '+94 77 123 4567',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
    subjects: 'Institute Administration & Management',
    bio: 'Primary Institute Administrator & Owner'
  }
];


export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('edutuition_token'));
  const [loading, setLoading] = useState(true);

  // Helper to get all custom registered users stored locally
  const getCustomUsers = () => {
    try {
      const stored = localStorage.getItem('edutuition_custom_users');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('edutuition_token');
      const storedUserData = localStorage.getItem('edutuition_user_data');

      if (storedToken) {
        // First check if we have locally cached user data
        if (storedUserData) {
          try {
            const parsedUser = JSON.parse(storedUserData);
            setUser(parsedUser);
          } catch {
            // Ignore parse error
          }
        }

        // Also attempt to refresh from backend API
        try {
          const res = await api.getMe();
          if (res?.data?.success && res.data.user) {
            setUser(res.data.user);
            localStorage.setItem('edutuition_user_data', JSON.stringify(res.data.user));
          }
        } catch {
          // If offline or serverless cold start, keep user logged in if storedUserData existed
          if (!storedUserData) {
            logout();
          }
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  // Dual-layer login
  const login = async (email, password) => {
    const cleanEmail = email?.trim().toLowerCase();
    const cleanPass = password?.trim();

    // 1. Try Backend API
    try {
      const res = await api.login(cleanEmail, cleanPass);
      if (res?.data?.success) {
        const { token: authToken, user: authUser } = res.data;
        localStorage.setItem('edutuition_token', authToken);
        localStorage.setItem('edutuition_user_data', JSON.stringify(authUser));
        setToken(authToken);
        setUser(authUser);
        return { success: true };
      }
    } catch {
      // API call failed or timed out; smoothly fall back to local auth engine
      console.warn('Backend API login unavailable. Falling back to resilient local session.');
    }

    // 2. Resilient Local Authentication (Check pre-seeded users + custom users)
    const customUsers = getCustomUsers();
    const allUsers = [...DEFAULT_USERS, ...customUsers];

    const matchedUser = allUsers.find(u => {
      if (u.email?.toLowerCase() !== cleanEmail) return false;
      if (Array.isArray(u.password)) {
        return u.password.includes(cleanPass);
      }
      return u.password === cleanPass;
    });

    if (matchedUser) {
      const localToken = `local_token_${Date.now()}_${matchedUser.id}`;
      const sessionUser = {
        id: matchedUser.id || matchedUser._id,
        name: matchedUser.name,
        email: matchedUser.email,
        role: matchedUser.role,
        isAdmin: matchedUser.isAdmin || matchedUser.email === 'admin@tuition.lk',
        phone: matchedUser.phone || '',
        avatar: matchedUser.avatar || '',
        studentProfile: matchedUser.studentProfile || null,
        linkedStudent: matchedUser.linkedStudent || null
      };

      localStorage.setItem('edutuition_token', localToken);
      localStorage.setItem('edutuition_user_data', JSON.stringify(sessionUser));
      setToken(localToken);
      setUser(sessionUser);
      return { success: true };
    }

    return {
      success: false,
      message: 'Invalid email or password. Please check your credentials.'
    };
  };

  const quickLogin = async (roleType) => {
    if (roleType === 'admin') return await login('admin@tuition.lk', 'admin123');
    if (roleType === 'teacher') return await login('teacher@tuition.lk', 'password123');
    if (roleType === 'student') return await login('student1@tuition.lk', 'password123');
    if (roleType === 'student2') return await login('student2@tuition.lk', 'password123');
    if (roleType === 'parent') return await login('parent1@tuition.lk', 'password123');
    return await login('admin@tuition.lk', 'admin123');
  };

  // Add custom user (Used by Admin / Teacher to create new Teacher, Student, Parent accounts)
  const addCustomUser = async (userData) => {
    // 1. Try sending to backend
    try {
      await api.createUser(userData);
    } catch {
      console.warn('Backend user creation failed, saving locally.');
    }

    // 2. Always persist locally
    const customUsers = getCustomUsers();
    const newUser = {
      id: `custom_user_${Date.now()}`,
      name: userData.name,
      email: userData.email.toLowerCase().trim(),
      password: userData.password,
      role: userData.role,
      phone: userData.phone || '',
      createdAt: new Date().toISOString()
    };

    customUsers.push(newUser);
    localStorage.setItem('edutuition_custom_users', JSON.stringify(customUsers));
    return { success: true, user: newUser };
  };

  const updateUserData = (updatedData) => {
    setUser(prev => {
      const merged = { ...prev, ...updatedData };
      localStorage.setItem('edutuition_user_data', JSON.stringify(merged));
      return merged;
    });
  };

  const logout = () => {
    localStorage.removeItem('edutuition_token');
    localStorage.removeItem('edutuition_user_data');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        role: user?.role || null,
        isAdmin: user?.role === 'teacher' || user?.isAdmin === true || user?.email === 'admin@tuition.lk',
        loading,
        login,
        quickLogin,
        logout,
        addCustomUser,
        getCustomUsers,
        updateUserData,
        isAuthenticated: !!token && !!user
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};


export const useAuth = () => useContext(AuthContext);

