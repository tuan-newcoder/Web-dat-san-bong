const express = require('express');
const router = express.Router();
const ownerController = require('../controllers/owner.controller');
const authMiddleware = require('../middleware/auth.middleware');

router.use(authMiddleware);

// 1. Quản lý sân
router.post('/fields', ownerController.createField);
router.put('/fields/:id', ownerController.updateField);

// 2. Quản lý lịch đặt (Booking)
// GET /api/owner/bookings?date=2024-01-01&status=chuaxacnhan
router.get('/bookings', ownerController.getOwnerBookings);

// Duyệt đơn/Hủy đơn: PUT /api/owner/bookings/:bookingId
// Body: { "newStatus": "daxacnhan" }
router.put('/bookings/:bookingId', ownerController.updateBookingStatus);

module.exports = router;