// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const { config } = require('../config/index'); // Import config từ file index.js vừa tạo

const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    
    if (!authHeader) {
        return res.status(401).json({ message: 'Không tìm thấy Token xác thực!' });
    }

    const token = authHeader.split(' ')[1]; // Bỏ chữ Bearer

    if (!token) {
        return res.status(401).json({ message: 'Token không đúng định dạng!' });
    }

    try {
        // Dùng config.secretKey để giải mã (giống hệt logic Vũ)
        const decoded = jwt.verify(token, config.secretKey);

        // --- QUAN TRỌNG: MAPPING DỮ LIỆU ---
        // Token của Vũ: { id: user.MaNguoiDung, role: user.quyen, name: user.HoTen }
        req.user = {
            id: decoded.id,       // Đây là MaNguoiDung (dùng để insert vào DB)
            role: decoded.role,   // Đây là quyen (dùng để check quyền)
            name: decoded.name    // Đây là HoTen (nếu cần hiển thị)
        };
        
        next();
    } catch (error) {
        return res.status(403).json({ message: 'Token không hợp lệ hoặc đã hết hạn!' });
    }
};

const verifyAdmin = (req, res, next) => {
    verifyToken(req, res, () => {
        // Vũ lưu role là 'admin' (hoặc check kỹ lại xem trong DB lưu là 'admin' hay 'quantri')
        // Dựa trên ảnh DB, user.quyen là ENUM, khả năng cao là chuỗi 'admin'
        if (req.user.role === 'admin') {
            next();
        } else {
            res.status(403).json({ message: 'Yêu cầu quyền Admin!' });
        }
    });
};

const verifyOwner = (req, res, next) => {
    verifyToken(req, res, () => {
        // Check quyền chủ sân
        if (req.user.role === 'chusan' || req.user.role === 'admin') {
            next();
        } else {
            res.status(403).json({ message: 'Yêu cầu quyền Chủ sân!' });
        }
    });
};

module.exports = { verifyToken, verifyAdmin, verifyOwner };