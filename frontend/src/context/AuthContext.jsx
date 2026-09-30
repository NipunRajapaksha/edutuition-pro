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
      const storedCustom = localStorage.getItem('edutuition_custom_users');
      const storedUsers = localStorage.getItem('edutuition_users');
      const list1 = storedCustom ? JSON.parse(storedCustom) : [];
      const list2 = storedUsers ? JSON.parse(storedUsers) : [];
      const map = new Map();
      (Array.isArray(list2) ? list2 : []).forEach(u => {
        if (u && u.email) map.set(u.email.toLowerCase().trim(), u);
      });
      (Array.isArray(list1) ? list1 : []).forEach(u => {
        if (u && u.email) map.set(u.email.toLowerCase().trim(), u);
      });
      return Array.from(map.values());
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
      if (u.email?.toLowerCase().trim() !== cleanEmail) return false;
      if (Array.isArray(u.password)) {
        return u.password.includes(cleanPass);
      }
      return (u.password || 'password123') === cleanPass;
    });

    if (matchedUser) {
      const localToken = `local_token_${Date.now()}_${matchedUser.id || matchedUser._id}`;
      const sessionUser = {
        id: matchedUser.id || matchedUser._id,
        name: matchedUser.name,
        email: matchedUser.email,
        role: matchedUser.role || 'teacher',
        isAdmin: matchedUser.isAdmin || matchedUser.role === 'admin' || matchedUser.email === 'admin@tuition.lk',
        phone: matchedUser.phone || '',
        avatar: matchedUser.avatar || '',
        studentProfile: matchedUser.studentProfile || null,
        studentProfileId: matchedUser.studentProfileId || (matchedUser.studentProfile?._id || matchedUser.studentProfile?.id) || null,
        linkedStudent: matchedUser.linkedStudent || null
      };

      if (sessionUser.role === 'student') {
        try {
          const rawStudents = localStorage.getItem('edutuition_students');
          const localStudents = rawStudents ? JSON.parse(rawStudents) : [];
          let foundStudent = localStudents.find(s =>
            (s.email && s.email.toLowerCase().trim() === cleanEmail) ||
            (s.fullName && s.fullName.toLowerCase().trim() === (sessionUser.name || '').toLowerCase().trim()) ||
            (s._id && s._id === sessionUser.id) ||
            (s.studentId && s.studentId === sessionUser.id)
          );
          if (!foundStudent && localStudents.length > 0) {
            foundStudent = localStudents[0];
          }
          if (!foundStudent) {
            foundStudent = {
              _id: `stu_${Date.now()}`,
              studentId: `STU-2026-${Math.floor(100 + Math.random() * 900)}`,
              fullName: sessionUser.name,
              grade: 'Grade 10',
              email: sessionUser.email,
              phone: sessionUser.phone || '',
              status: 'active',
              enrolledClasses: []
            };
            localStudents.push(foundStudent);
            localStorage.setItem('edutuition_students', JSON.stringify(localStudents));
          }
          sessionUser.studentProfile = foundStudent;
          sessionUser.studentProfileId = foundStudent._id || foundStudent.id;
        } catch (e) {
          console.warn('Error linking student profile:', e);
        }
      }

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
    let createdUser = null;
    try {
      const res = await api.createUser(userData);
      if (res?.data?.success && res.data.data) {
        createdUser = res.data.data;
      }
    } catch (e) {
      console.warn('Backend user creation error:', e);
    }

    const cleanEmail = userData.email ? userData.email.toLowerCase().trim() : '';
    const newUser = {
      id: createdUser?._id || createdUser?.id || `custom_user_${Date.now()}`,
      _id: createdUser?._id || createdUser?.id || `custom_user_${Date.now()}`,
      name: userData.name,
      email: cleanEmail,
      password: userData.password || 'password123',
      role: userData.role || 'teacher',
      phone: userData.phone || '',
      createdAt: new Date().toISOString()
    };

    const customUsers = getCustomUsers().filter(u => u.email?.toLowerCase().trim() !== cleanEmail);
    customUsers.push(newUser);
    localStorage.setItem('edutuition_custom_users', JSON.stringify(customUsers));
    localStorage.setItem('edutuition_users', JSON.stringify(customUsers));

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

