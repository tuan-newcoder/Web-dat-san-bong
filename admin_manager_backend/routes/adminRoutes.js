const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { verifyAdmin } = require('../middleware/authMiddleware');

// ÁP DỤNG MIDDLEWARE ADMIN CHO TOÀN BỘ FILE NÀY
// Bất cứ ai gọi API này đều phải có Token và Role = 'admin'
router.use(verifyAdmin);

// ==========================================
// 1. QUẢN LÝ USER
// ==========================================

// Lấy danh sách toàn bộ user
// GET http://localhost:3000/api/admin/users
router.get('/users', adminController.getAllUsers);

// Xóa user theo ID
// DELETE http://localhost:3000/api/admin/users/:id
router.delete('/users/:id', adminController.deleteUser);


// ==========================================
// 2. QUẢN LÝ DUYỆT CHỦ SÂN (UPROLE)
// ==========================================

// Xem danh sách yêu cầu
// GET http://localhost:3000/api/admin/uprole
router.get('/uprole', adminController.getUpRoleRequests);

// Duyệt yêu cầu (Chấp nhận)
// PUT http://localhost:3000/api/admin/uprole/:id/approve
router.put('/uprole/:id/approve', adminController.approveUpRole);

// Từ chối yêu cầu
// PUT http://localhost:3000/api/admin/uprole/:id/reject
router.put('/uprole/:id/reject', adminController.rejectUpRole);

module.exports = router;