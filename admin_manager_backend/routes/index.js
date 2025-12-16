const express = require('express');
const router = express.Router();

// Import các file route con
const adminRoutes = require('./admin.routes');
const ownerRoutes = require('./owner.routes');

// --- ĐỊNH NGHĨA CÁC NHÁNH API ---

// 1. Nhánh cho Admin (Quản trị viên hệ thống)
// URL: /api/v1/admin/...
router.use('/admin', adminRoutes);

// 2. Nhánh cho Owner (Chủ sân)
// URL: /api/v1/owner/...
router.use('/owner', ownerRoutes);

// 3. Test API (Để Frontend check server sống hay chết)
router.get('/health-check', (req, res) => {
    res.status(200).json({ 
        success: true, 
        message: 'Server is working fine!', 
        timestamp: new Date() 
    });
});

module.exports = router;