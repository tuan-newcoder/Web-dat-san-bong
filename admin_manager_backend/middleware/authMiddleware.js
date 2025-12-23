const jwt = require('jsonwebtoken');
// Đảm bảo đường dẫn này trỏ đúng file config của bạn
const { config } = require('../config/index'); 

// 1. Middleware Xác thực Token (Kiểm tra xem đã đăng nhập chưa)
const verifyToken = (req, res, next) => {
    // Lấy token từ header "Authorization: Bearer <token>"
    const authHeader = req.headers['authorization'];
    
    if (!authHeader) {
        return res.status(401).json({ message: 'Không tìm thấy Token xác thực!' });
    }

    // Cắt bỏ chữ "Bearer " để lấy chuỗi token
    const token = authHeader.split(' ')[1]; 

    if (!token) {
        return res.status(401).json({ message: 'Token không đúng định dạng!' });
    }

    try {
        // Giải mã token bằng Secret Key (Lấy từ config chung với Vũ)
        const decoded = jwt.verify(token, config.secretKey);

        // Lưu thông tin user vào biến req để dùng ở các bước sau
        // Mapping theo đúng logic tạo token của Vũ: 
        // { id: user.MaNguoiDung, role: user.quyen, name: user.HoTen }
        req.user = {
            id: decoded.id,       
            role: decoded.role,   
            name: decoded.name    
        };
        
        next(); // Token hợp lệ -> Cho đi tiếp
    } catch (error) {
        console.error("Lỗi xác thực token:", error.message);
        return res.status(403).json({ message: 'Token không hợp lệ hoặc đã hết hạn!' });
    }
};

// 2. Middleware Kiểm tra quyền OWNER (Chủ sân)
const verifyOwner = (req, res, next) => {
    // Gọi verifyToken trước để đảm bảo đã đăng nhập và có req.user
    verifyToken(req, res, () => {
        // Logic: Chỉ cho phép nếu quyền là 'chusan' HOẶC 'admin'
        // (Admin thường có toàn quyền nên cũng cho qua)
        if (req.user.role === 'chusan' || req.user.role === 'admin') {
            next();
        } else {
            return res.status(403).json({ 
                message: 'Bạn không có quyền thực hiện thao tác này! Yêu cầu tài khoản Chủ sân.' 
            });
        }
    });
};

// 3. Middleware Kiểm tra quyền ADMIN
const verifyAdmin = (req, res, next) => {
    verifyToken(req, res, () => {
        if (req.user.role === 'admin') {
            next();
        } else {
            return res.status(403).json({ 
                message: 'Truy cập bị từ chối! Yêu cầu quyền Quản trị viên (Admin).' 
            });
        }
    });
};

module.exports = { verifyToken, verifyOwner, verifyAdmin };