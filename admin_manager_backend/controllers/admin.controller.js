const db = require('../config/database');

// --- QUẢN LÝ NGƯỜI DÙNG (USER MANAGEMENT) ---

// 1. Lấy danh sách tất cả người dùng
// Nghiệp vụ: Hiển thị danh sách người dùng với bộ lọc [cite: 249]
const getAllUsers = async (req, res) => {
    try {
        // Có thể lọc theo quyền (VD: xem danh sách chủ sân)
        const { role } = req.query; 
        
        let query = 'SELECT MaNguoiDung, HoTen, username, email, sdt, quyen FROM user';
        const params = [];

        if (role) {
            query += ' WHERE quyen = ?';
            params.push(role);
        }

        const [users] = await db.execute(query, params);

        return res.status(200).json({
            success: true,
            count: users.length,
            data: users
        });

    } catch (error) {
        console.error('Error getAllUsers:', error);
        return res.status(500).json({ message: 'Lỗi server khi lấy danh sách user' });
    }
};

// 2. Tạo người dùng mới (Dành cho Admin tạo hộ tài khoản Chủ sân/Admin khác)
// Input: Email, mật khẩu, họ tên, sđt, vai trò [cite: 244, 245]
const createUser = async (req, res) => {
    try {
        const { hoTen, username, password, email, sdt, quyen } = req.body;

        // Validate cơ bản
        if (!username || !password || !hoTen || !email) {
            return res.status(400).json({ message: 'Vui lòng điền đủ thông tin bắt buộc' });
        }

        // Validate Role (chỉ chấp nhận các giá trị ENUM trong DB)
        const validRoles = ['admin', 'chusan', 'khachhang'];
        const userRole = validRoles.includes(quyen) ? quyen : 'khachhang'; // Mặc định là khách hàng 

        // *Lưu ý bảo mật: Trong thực tế, password cần được hash (bcrypt) trước khi lưu*
        const query = `
            INSERT INTO user (HoTen, username, password, email, sdt, quyen)
            VALUES (?, ?, ?, ?, ?, ?)
        `;

        const [result] = await db.execute(query, [hoTen, username, password, email, sdt, userRole]);

        return res.status(201).json({
            success: true,
            message: 'Tạo người dùng thành công',
            userId: result.insertId
        });

    } catch (error) {
        console.error('Error createUser:', error);
        // Check lỗi trùng lặp (Duplicate entry) cho username/email
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: 'Username hoặc Email đã tồn tại' });
        }
        return res.status(500).json({ message: 'Lỗi server khi tạo user' });
    }
};

// 3. Cập nhật thông tin User & Phân quyền
// Nghiệp vụ: Chỉnh sửa người dùng, gán vai trò & quyền [cite: 246, 260]
const updateUser = async (req, res) => {
    try {
        const { id } = req.params; // MaNguoiDung cần sửa
        const { hoTen, sdt, quyen } = req.body;

        // Kiểm tra user có tồn tại không
        const [check] = await db.execute('SELECT MaNguoiDung FROM user WHERE MaNguoiDung = ?', [id]);
        if (check.length === 0) {
            return res.status(404).json({ message: 'Người dùng không tồn tại' });
        }

        // Chỉ cập nhật các trường được gửi lên
        // Logic Update động đơn giản:
        let updateFields = [];
        let params = [];

        if (hoTen) { updateFields.push('HoTen = ?'); params.push(hoTen); }
        if (sdt) { updateFields.push('sdt = ?'); params.push(sdt); }
        
        // Admin có quyền đổi role của user khác [cite: 246]
        if (quyen) { 
            const validRoles = ['admin', 'chusan', 'khachhang'];
            if (validRoles.includes(quyen)) {
                updateFields.push('quyen = ?'); 
                params.push(quyen); 
            }
        }

        if (updateFields.length === 0) {
            return res.status(400).json({ message: 'Không có dữ liệu nào để cập nhật' });
        }

        const query = `UPDATE user SET ${updateFields.join(', ')} WHERE MaNguoiDung = ?`;
        params.push(id);

        await db.execute(query, params);

        return res.status(200).json({
            success: true,
            message: 'Cập nhật thông tin thành công'
        });

    } catch (error) {
        console.error('Error updateUser:', error);
        return res.status(500).json({ message: 'Lỗi server khi sửa user' });
    }
};

// 4. Xóa người dùng (Thay cho khóa tài khoản vì DB thiếu cột Status)
// Nghiệp vụ: Xử lý các tài khoản vi phạm
const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        // Lưu ý: Nếu User này đã có dữ liệu ràng buộc (đã đặt sân, đã tạo sân), 
        // lệnh DELETE sẽ lỗi do Foreign Key Constraint. 
        // Cần xử lý logic xóa các dữ liệu liên quan trước hoặc báo lỗi.
        
        const query = 'DELETE FROM user WHERE MaNguoiDung = ?';
        const [result] = await db.execute(query, [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Người dùng không tồn tại' });
        }

        return res.status(200).json({
            success: true,
            message: 'Đã xóa người dùng thành công'
        });

    } catch (error) {
        console.error('Error deleteUser:', error);
        // Mã lỗi ràng buộc khóa ngoại thường là 1451
        if (error.errno === 1451) {
            return res.status(400).json({ 
                message: 'Không thể xóa user này vì họ đã có dữ liệu giao dịch (đặt sân hoặc sở hữu sân).' 
            });
        }
        return res.status(500).json({ message: 'Lỗi server khi xóa user' });
    }
};

module.exports = {
    getAllUsers,
    createUser,
    updateUser,
    deleteUser
};