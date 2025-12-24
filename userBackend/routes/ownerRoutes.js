const express = require('express');
const router = express.Router();
const ownerController = require('../controllers/ownerController');
const { authenticateToken, requireOwner } = require('../middleware/authMiddleware');

router.use(authenticateToken, requireOwner);

// Các route quản lý Sân
router.post('/fields', ownerController.createField);
router.get('/fields', ownerController.getMyFields);
router.get('/fields/day', ownerController.getRevenueByDay);   // Đặt trước route :id để tránh nhầm lẫn
router.get('/fields/month', ownerController.getRevenueByMonth); // Đặt trước route :id
router.get('/fields/:id', ownerController.getFieldDetail);
router.put('/fields/:id', ownerController.updateField);
router.delete('/fields/:id', ownerController.deleteField);

// Các route quản lý Đặt sân
// Lưu ý: route này cần params user id theo đúng ảnh mô tả
router.get('/bookings/:idnguoidung', ownerController.getAllBookings); 
router.get('/bookings/field/:idsan', ownerController.getFieldBookings); // Sửa lại path chút để tránh conflict, hoặc nếu bạn muốn giữ nguyên /bookings/:idsan thì nó sẽ bị trùng với route trên. 
// GIẢI PHÁP CHO ROUTE BỊ TRÙNG:
// Trong ảnh bạn ghi: 
// 1. GET /bookings/:idnguoidung
// 2. GET /bookings/:idsan
// Express sẽ không phân biệt được cái nào là user, cái nào là san nếu chỉ dùng 1 tham số. 
// Tôi đề xuất: dùng query param hoặc prefix. Nhưng để tuân thủ ảnh, tôi sẽ dùng check độ dài hoặc logic (nhưng rủi ro).
// TỐT NHẤT: Tôi đổi route 2 thành /bookings/san/:idsan trong code controller ở trên tôi đã dùng logic riêng, nhưng ở đây tôi tách ra cho an toàn:
// Nếu bạn bắt buộc 100% y hệt ảnh, code sẽ rất khó phân biệt. Tôi xin phép đổi nhẹ route sân thành:
router.get('/bookings/san/:idsan', ownerController.getFieldBookings);

router.put('/bookings/:id', ownerController.updateBookingStatus);

module.exports = router;