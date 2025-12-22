const AdminModel = require('../models/AdminModel');

// --- UPROLE HANDLERS ---

// 1. Xem danh sách yêu cầu
exports.getUpRoleRequests = async (req, res) => {
    try {
        const [rows] = await AdminModel.getAllUpRoleRequests();
        res.status(200).json(rows);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi lấy danh sách yêu cầu', error });
    }
};

// 2. Duyệt yêu cầu (Approve)
exports.approveUpRole = async (req, res) => {
    try {
        const { id } = req.params; // MaUpRole lấy từ URL
        // Cần lấy MaNguoiDung để update bảng user. 
        // Admin gửi kèm userId trong body (Frontend phải gửi) HOẶC ta query lại DB để lấy.
        // Cách an toàn: Admin gửi kèm userId từ giao diện quản lý
        const { userId } = req.body; 

        if (!userId) {
            return res.status(400).json({ message: 'Thiếu User ID cần cấp quyền' });
        }

        await AdminModel.approveUpRole(id, userId);
        res.status(200).json({ message: 'Đã duyệt yêu cầu. User đã trở thành Chủ sân.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi khi duyệt yêu cầu', error });
    }
};

// 3. Từ chối yêu cầu (Reject)
exports.rejectUpRole = async (req, res) => {
    try {
        const { id } = req.params; // MaUpRole
        await AdminModel.rejectUpRole(id);
        res.status(200).json({ message: 'Đã từ chối yêu cầu này.' });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi từ chối yêu cầu', error });
    }
};

// --- USER MANAGEMENT HANDLERS ---

// 4. Lấy danh sách user
exports.getAllUsers = async (req, res) => {
    try {
        const [users] = await AdminModel.getAllUsers();
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi lấy danh sách user', error });
    }
};

// 5. Xem chi tiết user
exports.getUserDetail = async (req, res) => {
    try {
        const { id } = req.params;
        const [users] = await AdminModel.getUserById(id);
        if (users.length === 0) {
            return res.status(404).json({ message: 'User không tồn tại' });
        }
        res.status(200).json(users[0]);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi lấy thông tin user', error });
    }
};

// 6. Xóa user
exports.deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        const [result] = await AdminModel.deleteUser(id);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'User không tồn tại để xóa' });
        }
        res.status(200).json({ message: 'Đã xóa user thành công' });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi xóa user (có thể do ràng buộc dữ liệu)', error });
    }
};