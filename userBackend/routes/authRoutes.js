// backend/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Đăng ký tài khoản mới (POST /api/auth/register)
router.post('/register', authController.register);

// Đăng nhập (POST /api/auth/login)
router.post('/login', authController.login);

// Gửi mã Reset mật khẩu (POST /api/auth/send-verification)
router.post('/send-verification', authController.sendVerification);

// Đổi password (POST /api/auth/rese-password)
router.post('/reset-password', authController.resetPassword);

module.exports = router;