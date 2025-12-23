const express = require('express');
const router = express.Router();

// 1. Import Controller xử lý logic
const fieldOwnerController = require('../controllers/fieldOwnerController');

// 2. Import Middleware bảo vệ (Chỉ chủ sân mới được vào)
const { verifyOwner } = require('../middleware/authMiddleware');

// ==================================================
// CẤU HÌNH ROUTES
// ==================================================

// Áp dụng middleware verifyOwner cho TOÀN BỘ các route bên dưới
// Nghĩa là: Phải có Token + Role là 'chusan' hoặc 'admin' mới gọi được các API này
router.use(verifyOwner);

// 1. Tạo sân mới
// Method: POST
// URL: http://localhost:3000/api/owner/fields
router.post('/', fieldOwnerController.createField);

// 2. Xem danh sách sân CỦA CHÍNH MÌNH
// Method: GET
// URL: http://localhost:3000/api/owner/fields
router.get('/', fieldOwnerController.getMyFields);

// 3. Xem chi tiết một sân cụ thể
// Method: GET
// URL: http://localhost:3000/api/owner/fields/:id
router.get('/:id', fieldOwnerController.getFieldDetail);

// 4. Cập nhật thông tin sân (Tên, giá, trạng thái...)
// Method: PUT
// URL: http://localhost:3000/api/owner/fields/:id
router.put('/:id', fieldOwnerController.updateField);

// 5. Xóa sân (Hoặc chuyển trạng thái ngừng hoạt động)
// Method: DELETE
// URL: http://localhost:3000/api/owner/fields/:id
router.delete('/:id', fieldOwnerController.deleteField);

module.exports = router;