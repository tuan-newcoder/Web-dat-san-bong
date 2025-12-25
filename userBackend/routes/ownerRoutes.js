const express = require('express');
const router = express.Router();
const ownerController = require('../controllers/ownerController');
const { authenticateToken, requireOwner } = require('../middleware/authMiddleware');

router.use(authenticateToken, requireOwner);

// Tạo sân http://localhost:3000/api/owner/fields
router.post('/fields', ownerController.createField);

// Lấy danh sách sân của mình http://localhost:3000/api/owner/fields
router.get('/fields', ownerController.getMyFields);

router.get('/fields/day', ownerController.getRevenueByDay);   // Đặt trước route :id để tránh nhầm lẫn

router.get('/fields/month', ownerController.getRevenueByMonth); // Đặt trước route :id

// Dùng bản của fieldsController 
//router.get('/fields/:id', ownerController.getFieldDetail);

// Dùng bản của fieldsController
//router.put('/fields/:id', ownerController.updateField);

// Xóa sân http://localhost:3000/api/owner/fields/11
router.delete('/fields/:id', ownerController.deleteField);

// Xem tất cả lịch đặt sân của Owner
router.get('/bookings', ownerController.getAllBookings); 

// Bỏ
// router.get('/bookings/fields/:idsan', ownerController.getFieldBookings);  

// Chuyển trạng thái http://localhost:3000/api/owner/bookings/:id
router.put('/bookings/:id', ownerController.updateBookingStatus);

module.exports = router;