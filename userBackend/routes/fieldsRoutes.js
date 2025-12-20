const express = require('express');
const router = express.Router();
const fieldController = require('../controllers/fieldsController');

// Lấy danh sách sân (GET /api/fields)
router.get('/', fieldController.getFields);

// Thêm sân (POST /api/fields/:id)
router.post('/', fieldController.createField);

// Tìm sân (GET /api/fields/search)
router.get('/search', fieldController.getFieldSearch);

// Lấy chi tiết sân (GET /api/fields/:id)
router.get('/:id', fieldController.getFieldDetails);

// Cập nhật thông tin sân (PUT /api/fields/:id)
router.put('/:id', fieldController.putFieldsDetails);

// Xóa sân (Delete /api/fields/:id)
router.delete('/:id', fieldController.deleteField);

module.exports = router;