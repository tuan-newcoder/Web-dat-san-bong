const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Cập nhật thông tin cá nhân (PUT /api/users/:id)
router.put('/:id', userController.putUserProfile);

// Lấy thông tin cá nhân (GET /api/users/:id)
router.get('/:id', userController.getUserById);

module.exports = router;