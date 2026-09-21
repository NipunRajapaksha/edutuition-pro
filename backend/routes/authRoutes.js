const express = require('express');
const router = express.Router();
const { login, register, getMe, updateProfile, changePassword, getUsers, createUser, deleteUser } = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');

router.post('/login', login);
router.post('/register', register);
router.get('/me', authenticateToken, getMe);
router.put('/profile', authenticateToken, updateProfile);
router.put('/change-password', authenticateToken, changePassword);

// User Management (Admin / Teacher)
router.get('/users', authenticateToken, getUsers);
router.post('/users', authenticateToken, createUser);
router.delete('/users/:id', authenticateToken, deleteUser);

module.exports = router;

