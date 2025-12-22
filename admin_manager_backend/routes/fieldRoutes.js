const express = require('express');
const router = express.Router();
const fieldController = require('../controllers/fieldController');
const { verifyToken, verifyOwner } = require('../middleware/authMiddleware');

// Tất cả các API dưới đây đều yêu cầu phải là CHỦ SÂN (Owner)
// Middleware verifyOwner đã bao gồm verifyToken bên trong rồi

// POST /api/fields - Tạo sân mới
router.post('/', verifyOwner, fieldController.createField);

// GET /api/fields - Xem danh sách sân của chính mình
router.get('/', verifyOwner, fieldController.getMyFields);

// GET /api/fields/:id - Xem chi tiết 1 sân
router.get('/:id', verifyOwner, fieldController.getFieldDetail);

// PUT /api/fields/:id - Cập nhật sân
router.put('/:id', verifyOwner, fieldController.updateField);

// DELETE /api/fields/:id - Xóa sân
router.delete('/:id', verifyOwner, fieldController.deleteField);

module.exports = router;