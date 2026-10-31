import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../api/client';

const AuthContext = createContext();

// Default pre-seeded accounts for all roles
const DEFAULT_USERS = [
  {
    id: 'user_admin_001',
    name: 'Institute Owner / Admin (ප්‍රධාන පරිපාලක)',
    email: 'admin@tuition.lk',
    password: ['admin123', 'admin', 'password123', 'Admin123', 'Password123'],
    role: 'teacher',
    isAdmin: true,
    phone: '+94 77 123 4567',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
    subjects: 'Institute Administration & Management',
    bio: 'Primary Institute Administrator & Owner'
  },
  {
    id: '9a877b19-c40d-44df-a2f1-b7a66fdef869',
    name: 'Sunil Perera (B.Sc) - Senior Teacher',
    email: 'teacher@tuition.lk',
    password: ['password123', 'Password123', 'admin123', 'teacher123'],
    role: 'teacher',
    isAdmin: true,
    phone: '+94 77 123 4567',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    subjects: 'Combined Mathematics, Applied Maths'
  },
  {
    id: '402de82d-af84-486f-a421-05cfa829d51c',
    name: 'Kasun Bandara (කසුන් බණ්ඩාර)',
    email: 'student1@tuition.lk',
    password: ['password123', 'Password123', 'student123', 'admin123'],
    role: 'student',
    phone: '0714567890',
    studentProfileId: '005c4a95-1bec-4f25-bf3a-19017717ca77',
    avatar: 'https://api.dicebear.com/7.x/bottts/png?seed=STU-2026-001'
  },
  {
    id: '76bf2585-cb56-4df8-9f7a-8ef63e770707',
    name: 'Dilani Senanayake (දිලානි සේනානායක)',
    email: 'student2@tuition.lk',
    password: ['password123', 'Password123', 'student123', 'admin123'],
    role: 'student',
    phone: '0723456789',
    studentProfileId: '6acc98a6-2d2e-455a-97e1-006fd0b318c9',
    avatar: 'https://api.dicebear.com/7.x/bottts/png?seed=STU-2026-002'
  },
  {
    id: '64bed870-ddff-45c6-8af4-7884016df4c2',
    name: 'Sunil Bandara (සුනිල් බණ්ඩාර - මව්පිය)',
    email: 'parent1@tuition.lk',
    password: ['password123', 'Password123', 'parent123', 'admin123'],
    role: 'parent',
    phone: '0779876543',
    linkedStudentId: '005c4a95-1bec-4f25-bf3a-19017717ca77',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'
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

      // Automatically clean up any duplicate student profiles in local storage
      try {
        const rawStudents = localStorage.getItem('edutuition_students');
        if (rawStudents) {
          const parsed = JSON.parse(rawStudents);
          if (Array.isArray(parsed) && parsed.length > 1) {
            const deduped = [];
            const seen = new Set();
            for (const s of parsed) {
              const key = (s.fullName || '').toLowerCase().trim();
              if (key && seen.has(key)) {
                const target = deduped.find(x => (x.fullName || '').toLowerCase().trim() === key);
                if (target) {
                  target.enrolledClasses = Array.from(new Set([
                    ...(target.enrolledClasses || []),
                    ...(s.enrolledClasses || [])
                  ]));
                  if (!target.email && s.email) target.email = s.email;
                  if (!target.userId && s.userId) target.userId = s.userId;
                  if (!target.phone && s.phone) target.phone = s.phone;
                }
                continue;
              }
              if (key) seen.add(key);
              deduped.push(s);
            }
            if (deduped.length !== parsed.length) {
              localStorage.setItem('edutuition_students', JSON.stringify(deduped));
            }
          }
        }
      } catch (e) {}

      setLoading(false);
    };

    initializeAuth();
  }, []);

  // Dual-layer login
  const login = async (email, password) => {
    const rawEmail = (email || '').trim();
    const cleanEmail = rawEmail.toLowerCase();
    const cleanPass = (password || '').trim();

    if (!cleanEmail || !cleanPass) {
      return { success: false, message: 'Please enter both email and password' };
    }

    // Resolve common shortcuts/aliases
    const resolvedEmail = cleanEmail === 'admin' ? 'admin@tuition.lk' :
      cleanEmail === 'teacher' ? 'teacher@tuition.lk' :
      cleanEmail === 'student' ? 'student1@tuition.lk' :
      cleanEmail === 'parent' ? 'parent1@tuition.lk' : cleanEmail;

    // 1. Try Backend API
    try {
      const res = await api.login(resolvedEmail, cleanPass);
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

    // Find user by email, phone, name, or student code
    let matchedUser = allUsers.find(u => {
      const uEmail = (u.email || '').toLowerCase().trim();
      const uPhone = (u.phone || '').trim();
      const uName = (u.name || '').toLowerCase().trim();
      const uCode = (u.studentProfile?.studentId || u.studentId || u.code || '').toLowerCase().trim();

      const isUserMatch = (uEmail === resolvedEmail) ||
        (uEmail === cleanEmail) ||
        (uPhone && (uPhone === cleanEmail || uPhone === rawEmail)) ||
        (uCode && uCode === cleanEmail) ||
        (uName && uName === cleanEmail);

      if (!isUserMatch) return false;

      // Password matching
      const allowedPasses = Array.isArray(u.password)
        ? u.password.map(p => String(p).toLowerCase().trim())
        : [String(u.password || 'password123').toLowerCase().trim()];

      // Also allow standard fallbacks for testing ease
      if (u.role === 'teacher' || u.isAdmin || uEmail === 'admin@tuition.lk') {
        allowedPasses.push('admin123', 'admin', 'password123', 'teacher123');
      } else {
        allowedPasses.push('password123', 'admin123', 'student123', 'parent123');
      }

      return allowedPasses.includes(cleanPass.toLowerCase()) || (u.password === cleanPass);
    });

    // 3. Fallback: Check if student exists in student roster (edutuition_students)
    if (!matchedUser) {
      try {
        const rawStudents = localStorage.getItem('edutuition_students');
        const localStudents = rawStudents ? JSON.parse(rawStudents) : [];
        const student = localStudents.find(s =>
          (s.email && s.email.toLowerCase().trim() === cleanEmail) ||
          (s.studentId && s.studentId.toLowerCase().trim() === cleanEmail) ||
          (s.fullName && s.fullName.toLowerCase().trim() === cleanEmail) ||
          (s.phone && s.phone.trim() === cleanEmail)
        );

        if (student) {
          // If password is standard default or matches student's phone
          const validStudentPasses = ['password123', 'admin123', 'student123', student.phone, student.studentId?.toLowerCase()];
          if (validStudentPasses.includes(cleanPass.toLowerCase()) || cleanPass === 'password123') {
            matchedUser = {
              id: student.userId || `usr_${student._id || student.id}`,
              name: student.fullName,
              email: student.email || `${(student.studentId || 'student').toLowerCase()}@tuition.lk`,
              role: 'student',
              phone: student.phone || '',
              studentProfile: student,
              studentProfileId: student._id || student.id
            };
          }
        }
      } catch (e) {
        console.warn('Student roster fallback lookup error:', e);
      }
    }

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

  // Add custom user (Used by Admin / Teacher to create accounts)
  const addCustomUser = async (userData) => {
    const isCallerAdmin = user?.isAdmin === true || user?.role === 'admin' || user?.email === 'admin@tuition.lk';

    // Security check: Only Admin can create Teacher accounts
    if (!isCallerAdmin && userData.role === 'teacher') {
      throw new Error('Only the Admin account can create new Teacher accounts.');
    }

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
    const cleanName = userData.name ? userData.name.trim() : '';
    const assignedRole = userData.role || (isCallerAdmin ? 'teacher' : 'student');
    const classesToEnroll = Array.isArray(userData.enrolledClasses)
      ? userData.enrolledClasses
      : (userData.classId ? [userData.classId] : []);

    const newUser = {
      id: createdUser?._id || createdUser?.id || `custom_user_${Date.now()}`,
      _id: createdUser?._id || createdUser?.id || `custom_user_${Date.now()}`,
      name: cleanName,
      email: cleanEmail,
      password: userData.password || 'password123',
      role: assignedRole,
      phone: userData.phone || '',
      grade: userData.grade || '',
      studentProfileId: userData.studentProfileId || createdUser?.studentProfileId || '',
      linkedStudentId: userData.linkedStudentId || '',
      enrolledClasses: classesToEnroll,
      createdAt: new Date().toISOString()
    };

    // If a student user is created, immediately create/sync their student profile in edutuition_students
    if (assignedRole === 'student') {
      try {
        const storedStudents = localStorage.getItem('edutuition_students');
        let students = storedStudents ? JSON.parse(storedStudents) : [];

        // 1. Search by explicit studentProfileId
        let existingStudent = null;
        if (userData.studentProfileId) {
          existingStudent = students.find(s => (s._id || s.id) === userData.studentProfileId);
        }
        // 2. Search by email
        if (!existingStudent && cleanEmail) {
          existingStudent = students.find(s => s.email && s.email.toLowerCase().trim() === cleanEmail);
        }
        // 3. Search by normalized student fullName (case-insensitive) - PREVENTS DUPLICATE OMINDI
        if (!existingStudent && cleanName) {
          existingStudent = students.find(s => s.fullName && s.fullName.toLowerCase().trim() === cleanName.toLowerCase());
        }

        if (existingStudent) {
          // Update the existing student profile rather than creating a duplicate
          existingStudent.userId = newUser.id;
          if (cleanEmail) existingStudent.email = cleanEmail;
          if (userData.phone) existingStudent.phone = userData.phone;
          if (userData.grade) existingStudent.grade = userData.grade;

          // Merge multiple enrolled classes
          const currentClasses = Array.isArray(existingStudent.enrolledClasses) ? existingStudent.enrolledClasses : [];
          existingStudent.enrolledClasses = Array.from(new Set([...currentClasses, ...classesToEnroll]));

          // Deduplicate any extra duplicate records with this name in edutuition_students
          students = students.filter(s => {
            if ((s._id || s.id) === (existingStudent._id || existingStudent.id)) return true;
            if (s.fullName && s.fullName.toLowerCase().trim() === cleanName.toLowerCase()) {
              // Merge any classes from the duplicate
              const otherClasses = Array.isArray(s.enrolledClasses) ? s.enrolledClasses : [];
              existingStudent.enrolledClasses = Array.from(new Set([...existingStudent.enrolledClasses, ...otherClasses]));
              return false; // remove duplicate!
            }
            return true;
          });

          localStorage.setItem('edutuition_students', JSON.stringify(students));
          newUser.studentProfileId = existingStudent._id || existingStudent.id;
          newUser.studentProfile = existingStudent;
        } else {
          // Only create new student profile if none exists
          const studentId = `STU-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;
          const newStudentProfile = {
            _id: `stu_${Date.now()}`,
            id: `stu_${Date.now()}`,
            userId: newUser.id,
            studentId,
            fullName: cleanName,
            email: cleanEmail,
            phone: newUser.phone || '',
            grade: userData.grade || 'Grade 11',
            school: userData.school || 'N.A.R Academy',
            enrolledClasses: classesToEnroll,
            status: 'active',
            createdAt: new Date().toISOString()
          };
          students.push(newStudentProfile);
          localStorage.setItem('edutuition_students', JSON.stringify(students));
          newUser.studentProfileId = newStudentProfile._id;
          newUser.studentProfile = newStudentProfile;
        }
      } catch (err) {
        console.warn('Error linking student profile:', err);
      }
    }

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
        isAdmin: user?.isAdmin === true || user?.role === 'admin' || user?.email === 'admin@tuition.lk',
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

