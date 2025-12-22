// backend/routes/bookingRoutes.js
const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const { authenticateToken } = require('../middleware/authMiddleware');

// API 1: Người dùng đặt sân (POST /api/bookings)
router.post('/', bookingController.createBooking);

// API 2: Xem lịch đặt của User (GET /api/bookings/user/:id)
router.get('/users/:id', bookingController.getUserBookings);

// API 3: Lấy thông tin thanh toán (GET /api/bookings/bank)
router.get('/bank', bookingController.getPaymentInfo);

module.exports = router;