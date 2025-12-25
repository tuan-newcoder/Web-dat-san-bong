const express = require('express');
const router = express.Router();
const ownerController = require('../controllers/ownerController');
const { authenticateToken, requireOwner } = require('../middleware/authMiddleware');

router.use(authenticateToken, requireOwner);

// Các route quản lý Sân 
// Tạo sân http://localhost:3000/api/owner/fields
router.post('/fields', ownerController.createField);

//Lấy danh sách sân của mình http://localhost:3000/api/owner/fields
router.get('/fields', ownerController.getMyFields);

router.get('/fields/day', ownerController.getRevenueByDay);   // Đặt trước route :id để tránh nhầm lẫn

router.get('/fields/month', ownerController.getRevenueByMonth); // Đặt trước route :id

// Dùng bản của fieldsController 
router.get('/fields/:id', ownerController.getFieldDetail);

// Dùng bản của fieldsController
router.put('/fields/:id', ownerController.updateField);

// Chưa dùng
router.delete('/fields/:id', ownerController.deleteField);

// Các route quản lý Đặt sân
// Lưu ý: route này cần params user id theo đúng ảnh mô tả
router.get('/bookings/:idnguoidung', ownerController.getAllBookings); 

router.get('/bookings/field/:idsan', ownerController.getFieldBookings); // Sửa lại path chút để tránh conflict, hoặc nếu bạn muốn giữ nguyên /bookings/:idsan thì nó sẽ bị trùng với route trên. 

router.get('/bookings/san/:idsan', ownerController.getFieldBookings);

router.put('/bookings/:id', ownerController.updateBookingStatus);

module.exports = router;