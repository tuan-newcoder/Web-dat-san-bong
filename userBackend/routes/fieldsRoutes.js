const express = require('express');
const router = express.Router();
const fieldController = require('../controllers/fieldsController');

router.get('/shift/search', fieldController.getShiftByDate);

// Lấy danh sách sân (GET /api/fields)
router.get('/', fieldController.getFields);

// Tìm sân (GET /api/fields/search)
router.get('/search', fieldController.getFieldSearch);

// Lấy chi tiết sân (GET /api/fields/:id)
router.get('/:id', fieldController.getFieldDetails);

// Cập nhật thông tin sân (PUT /api/fields/:id)
router.put('/:id', fieldController.putFieldsDetails);

module.exports = router;