// backend/routes/bookingRoutes.js
const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const { authenticateToken } = require('../middleware/authMiddleware');

// Lấy danh sách ca (GET /api/bookings/fields/:id)
router.get('/fields/:id', bookingController.getBookedSlots);


module.exports = router;