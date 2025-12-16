const db = require('../config/database'); // Đảm bảo đường dẫn trỏ đúng về file config DB của bạn

const authMiddleware = async (req, res, next) => {
    try {
        // 1. Lấy User ID từ Header (Giả lập token)
        const userId = req.headers['x-user-id'];

        // Nếu không có header -> Chặn luôn
        if (!userId) {
            return res.status(401).json({ 
                success: false,
                message: 'Chưa đăng nhập: Vui lòng gửi kèm header x-user-id' 
            });
        }

        // 2. Query Database để lấy thông tin User
        // Chúng ta cần lấy 'quyen' để check role ở các bước sau
        const query = 'SELECT MaNguoiDung, HoTen, email, sdt, quyen FROM user WHERE MaNguoiDung = ?';
        
        const [rows] = await db.execute(query, [userId]);

        // 3. Kiểm tra user có tồn tại không
        if (rows.length === 0) {
            return res.status(401).json({ 
                success: false,
                message: 'Tài khoản không tồn tại trong hệ thống' 
            });
        }

        // 4. Gán thông tin User vào biến req
        // Các controller (Admin/Owner) sẽ gọi req.user.MaNguoiDung hoặc req.user.quyen từ đây
        req.user = rows[0];

        // 5. Cho phép đi tiếp
        next();

    } catch (error) {
        console.error('Auth Middleware Error:', error);
        return res.status(500).json({ 
            success: false, 
            message: 'Lỗi server trong quá trình xác thực' 
        });
    }
};

module.exports = authMiddleware;