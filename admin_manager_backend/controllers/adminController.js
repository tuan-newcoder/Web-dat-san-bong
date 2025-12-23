const AdminModel = require('../models/AdminModel');

// --- QUẢN LÝ USER ---

exports.getAllUsers = async (req, res) => {
    try {
        const [users] = await AdminModel.getAllUsers();
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server', error });
    }
};

exports.deleteUser = async (req, res) => {
    try {
        const { id } = req.params; // Lấy ID từ URL (ví dụ: /users/5)
        
        // Gọi model xóa
        const [result] = await AdminModel.deleteUser(id);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'User không tồn tại' });
        }

        res.status(200).json({ message: 'Đã xóa tài khoản thành công' });
    } catch (error) {
        // Check lỗi ràng buộc khóa ngoại (User đang có booking hoặc sân)
        if (error.code === 'ER_ROW_IS_REFERENCED_2') {
            return res.status(400).json({ message: 'Không thể xóa User này vì họ đang có dữ liệu liên quan (Sân bóng, Lịch đặt...)' });
        }
        res.status(500).json({ message: 'Lỗi xóa User', error });
    }
};

// --- QUẢN LÝ UPROLE (DUYỆT CHỦ SÂN) ---

exports.getUpRoleRequests = async (req, res) => {
    try {
        const [rows] = await AdminModel.getAllUpRoleRequests();
        res.status(200).json(rows);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi lấy danh sách yêu cầu', error });
    }
};

exports.approveUpRole = async (req, res) => {
    try {
        const { id } = req.params; // MaUpRole
        await AdminModel.approveUpRole(id);
        res.status(200).json({ message: 'Đã duyệt yêu cầu. User đã được nâng cấp lên Chủ sân!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi khi duyệt yêu cầu', error: error.message });
    }
};

exports.rejectUpRole = async (req, res) => {
    try {
        const { id } = req.params; // MaUpRole
        const [result] = await AdminModel.rejectUpRole(id);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Yêu cầu không tồn tại' });
        }
        
        res.status(200).json({ message: 'Đã từ chối yêu cầu.' });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi từ chối', error });
    }
};