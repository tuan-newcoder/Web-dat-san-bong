// backend/routes/bookingRoutes.js
const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const { authenticateToken } = require('../middleware/authMiddleware');

// API 1: Người dùng đặt sân (POST /api/bookings)
router.post('/', bookingController.createBookingAndGetPayment);

// API 2: Xem lịch đặt của User (GET /api/bookings/user/:id)
router.get('/users/:id', bookingController.getUserBookings);

/*
// API 3: Lấy thông tin thanh toán (GET /api/bookings/bank/:id)
router.get('/bank/:id', bookingController.getPaymentInfo);
*/

//API 4: Thay đổi trạng thái trong lịch đặt sân (PUT /api/bookings/:id)
router.put('/:id', bookingController.putBookingStatus);

module.exports = router;