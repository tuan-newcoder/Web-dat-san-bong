// backend/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const  { authenticateToken } = require('../middleware/authMiddleware');
const authController = require('../controllers/authController');

// Đăng ký tài khoản mới (POST /api/auth/register)
router.post('/register', authController.register);

// Đăng nhập (POST /api/auth/login)
router.post('/login', authController.login);

// Gửi mã Reset mật khẩu (POST /api/auth/send-verification)
router.post('/send-verification', authController.sendVerification);

// Đổi password (POST /api/auth/reset-password)
router.post('/reset-password', authController.resetPassword);

// Đổi password (PUT /api/auth/change-password)
router.put('/change-password', authenticateToken ,authController.putNewPassword);

module.exports = router;