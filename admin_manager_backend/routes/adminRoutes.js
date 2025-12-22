const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { verifyAdmin } = require('../middleware/authMiddleware'); // Middleware check quyền Admin

// TẤT CẢ CÁC ROUTES DƯỚI ĐÂY ĐỀU CẦN QUYỀN ADMIN
// Ta có thể dùng router.use(verifyAdmin) để áp dụng cho toàn bộ file này cho gọn
router.use(verifyAdmin);

// --- NHÓM 1: QUẢN LÝ UPROLE (YÊU CẦU LÊN CHỦ SÂN) ---

// GET /api/admin/uprole - Xem danh sách yêu cầu 
router.get('/uprole', adminController.getUpRoleRequests);

// PUT /api/admin/uprole/:id/approve - Duyệt yêu cầu [cite: 6]
// Body cần gửi kèm: { "userId": 123 }
router.put('/uprole/:id/approve', adminController.approveUpRole);

// PUT /api/admin/uprole/:id/reject - Từ chối yêu cầu [cite: 8]
router.put('/uprole/:id/reject', adminController.rejectUpRole);


// --- NHÓM 2: QUẢN LÝ USER ---

// GET /api/admin/users - Xem danh sách user 
// Lưu ý: Trong ảnh API của bạn endpoint là /api/users nhưng vì file này gom nhóm Admin
// nên mình khuyến nghị để prefix /admin/users hoặc sửa server.js
router.get('/users', adminController.getAllUsers);

// GET /api/admin/users/:id - Xem chi tiết user 
router.get('/users/:id', adminController.getUserDetail);

// DELETE /api/admin/users/:id - Xóa user 
router.delete('/users/:id', adminController.deleteUser);

module.exports = router;