// backend/routes/bookingRoutes.js
const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const { authenticateToken } = require('../middleware/authMiddleware');

// --- CÁC ROUTE CẦN ĐĂNG NHẬP ---

// 1. Đặt sân (POST /api/bookings)
// Body cần gửi: { "maCaThue": 1 }
router.post('/', authenticateToken, bookingController.createBooking);

// 2. Xem lịch sử đặt sân của chính mình (GET /api/bookings/history)
// Token sẽ tự xác định là user nào
router.get('/history', authenticateToken, bookingController.getUserBookings);

// 3. Thanh toán hóa đơn (POST /api/bookings/payments)
// Body cần gửi: { "maHoaDon": 5 }
router.post('/payments', authenticateToken, bookingController.processPayment);

module.exports = router;