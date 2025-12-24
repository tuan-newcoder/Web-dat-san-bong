const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticateToken, requireAdmin } = require('../middleware/authMiddleware');

router.use(authenticateToken, requireAdmin);

router.get('/users', adminController.getAllUsers);
router.put('/role/:id', adminController.updateUserRole); 

module.exports = router;