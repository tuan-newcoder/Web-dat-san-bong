const jwt = require('jsonwebtoken');
const { SECRET_KEY } = require('../config');

// 1. Middleware xác thực: Kiểm tra Token hợp lệ (Authentication)
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    
    // Kiểm tra xem header có tồn tại và đúng định dạng "Bearer <token>" không
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: "Bạn chưa đăng nhập hoặc Token sai định dạng!" });
    }

    const token = authHeader.split(' ')[1];

    jwt.verify(token, SECRET_KEY, (err, decoded) => {
        if (err) {
            // Phân loại lỗi để Frontend dễ xử lý
            if (err.name === 'TokenExpiredError') {
                return res.status(401).json({ message: "Phiên đăng nhập hết hạn, vui lòng đăng nhập lại!" });
            }
            return res.status(403).json({ message: "Token không hợp lệ!" });
        }

        // Lưu thông tin user (id, role, name) vào request để dùng ở các bước sau
        // decoded chính là payload bạn đã sign bên file login controller
        req.user = decoded; 
        next();
    });
};

// 2. Middleware phân quyền: Chỉ dành cho Admin (Authorization)
// Lưu ý: Middleware này phải đặt SAU authenticateToken
const requireAdmin = (req, res, next) => {
    // Kiểm tra xem đã qua bước xác thực chưa
    if (!req.user) {
        return res.status(401).json({ message: "Yêu cầu đăng nhập!" });
    }

    // Kiểm tra role (dựa trên code register của bạn thì user thường là 'khachhang')
    // Bạn cần đảm bảo trong DB, admin có quyen = 'admin' (hoặc từ khóa tương tự bạn quy định)
    if (req.user.role === 'admin') {
        next();
    } else {
        return res.status(403).json({ message: "Truy cập bị từ chối! Bạn không phải Admin." });
    }
};

//-----------------NEW--------------------------------------------------------------------
// 3.Middleware riêng cho Chủ Sân (Owner)
const requireOwner = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ message: "Yêu cầu đăng nhập!" });
    }

    // Cho phép nếu là 'chusan'
    if (req.user.role === 'chusan') {
        next();
    } else {
        return res.status(403).json({ message: "Chức năng chỉ dành cho Chủ sân!" });
    }
};
//-----------------------------------------------------------------------------------------

// 4. Middleware phân quyền linh hoạt (Advanced)
// Dùng khi bạn muốn cho phép nhiều role cùng truy cập (ví dụ: cả 'admin' và 'staff')
const authorize = (allowedRoles = []) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: "Yêu cầu đăng nhập!" });
        }

        if (allowedRoles.includes(req.user.role)) {
            next();
        } else {
            return res.status(403).json({ message: "Bạn không có quyền truy cập chức năng này!" });
        }
    };
};

module.exports = {
    authenticateToken,
    requireAdmin,
    requireOwner,
    authorize
};