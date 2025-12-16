const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const authMiddleware = require('../middleware/auth.middleware');
const roleMiddleware = require('../middleware/role.middleware'); // Gợi ý thêm middleware check quyền

// 1. Áp dụng Auth Middleware (Xác thực đăng nhập)
router.use(authMiddleware);

// 2. (Optional) Áp dụng Role Middleware để đảm bảo chỉ 'admin' mới gọi được các API này
// router.use(roleMiddleware('admin')); 

// --- ROUTES QUẢN TRỊ ---

// Xem danh sách User: GET /api/admin/users
router.get('/users', adminController.getAllUsers);

// Tạo User mới: POST /api/admin/users
router.post('/users', adminController.createUser);

// Sửa User (Phân quyền): PUT /api/admin/users/:id
router.put('/users/:id', adminController.updateUser);

// Xóa User: DELETE /api/admin/users/:id
router.delete('/users/:id', adminController.deleteUser);

module.exports = router;