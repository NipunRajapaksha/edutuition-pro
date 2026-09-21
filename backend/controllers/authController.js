const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const storage = require('../services/storage');
const { JWT_SECRET } = require('../middleware/auth');

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const user = storage.users.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    // Generate JWT
    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        role: user.role,
        name: user.name,
        studentProfileId: user.studentProfileId,
        linkedStudentId: user.linkedStudentId
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Fetch student profile or linked student details if applicable
    let studentProfile = null;
    let linkedStudent = null;

    if (user.role === 'student' && user.studentProfileId) {
      studentProfile = storage.students.findById(user.studentProfileId);
    } else if (user.role === 'parent' && user.linkedStudentId) {
      linkedStudent = storage.students.findById(user.linkedStudentId);
    }

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        avatar: user.avatar,
        studentProfile,
        linkedStudent
      }
    });
  } catch (err) {
    next(err);
  }
};

const register = async (req, res, next) => {
  try {
    const { name, email, password, role = 'student', phone = '', linkedStudentId = null } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password required' });
    }

    const existing = storage.users.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.status(400).json({ success: false, message: 'User with this email already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = storage.users.create({
      name,
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role,
      phone,
      linkedStudentId
    });

    const token = jwt.sign(
      { id: newUser._id, email: newUser.email, role: newUser.role, name: newUser.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role
      }
    });
  } catch (err) {
    next(err);
  }
};

const getMe = async (req, res, next) => {
  try {
    const user = storage.users.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    let studentProfile = null;
    let linkedStudent = null;

    if (user.role === 'student' && user.studentProfileId) {
      studentProfile = storage.students.findById(user.studentProfileId);
    } else if (user.role === 'parent' && user.linkedStudentId) {
      linkedStudent = storage.students.findById(user.linkedStudentId);
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        bio: user.bio,
        subjects: user.subjects,
        avatar: user.avatar,
        studentProfile,
        linkedStudent
      }
    });
  } catch (err) {
    next(err);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const { name, phone, bio, subjects } = req.body;
    const user = storage.users.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const updated = storage.users.findByIdAndUpdate(req.user.id, {
      name: name?.trim() || user.name,
      phone: phone !== undefined ? phone.trim() : user.phone,
      bio: bio !== undefined ? bio.trim() : user.bio,
      subjects: subjects !== undefined ? subjects : user.subjects,
      updatedAt: new Date().toISOString()
    });

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: updated._id,
        name: updated.name,
        email: updated.email,
        role: updated.role,
        phone: updated.phone,
        bio: updated.bio,
        subjects: updated.subjects
      }
    });
  } catch (err) {
    next(err);
  }
};

const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Current and new password required' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }

    const user = storage.users.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    storage.users.findByIdAndUpdate(req.user.id, {
      password: hashedPassword,
      updatedAt: new Date().toISOString()
    });

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { login, register, getMe, updateProfile, changePassword };
