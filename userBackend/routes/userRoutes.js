const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Cập nhật thông tin cá nhân (PUT /api/users/:id)
router.put('/:id', userController.putUserProfile);

module.exports = router;