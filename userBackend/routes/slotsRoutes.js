const express = require('express');
const router = express.Router();
const slotsController = require('../controllers/slotsController');
const { authenticateToken } = require('../middleware/authMiddleware');

// Lấy danh sách ca (GET /api/slots/fields/:id)
router.get('/fields/:id', slotsController.getBookedSlots);


module.exports = router;
