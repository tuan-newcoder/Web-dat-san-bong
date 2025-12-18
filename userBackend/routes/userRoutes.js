const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Cập nhật thông tin cá nhân (POST /api/users/:id)
router.put('/:id', userController.updateProfile);

module.exports = router;