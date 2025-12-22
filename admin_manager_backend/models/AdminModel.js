const { db } = require('../config/index');

class AdminModel {
    // --- QUẢN LÝ USER ---
    // (Bảng tên là 'User' viết hoa chữ U)

    // 1. Lấy tất cả user
    static async getAllUsers() {
        const sql = "SELECT MaNguoiDung, HoTen, username, email, sdt, quyen FROM User";
        return db.execute(sql);
    }

    // 2. Xem chi tiết user
    static async getUserById(id) {
        const sql = "SELECT MaNguoiDung, HoTen, username, email, sdt, quyen FROM User WHERE MaNguoiDung = ?";
        return db.execute(sql, [id]);
    }

    // 3. Xóa User
    static async deleteUser(id) {
        const sql = "DELETE FROM User WHERE MaNguoiDung = ?";
        return db.execute(sql, [id]);
    }

    // --- TẠM ẨN PHẦN UPROLE VÌ DATABASE CHƯA CÓ BẢNG UPROLE ---
    /*
    static async getAllUpRoleRequests() { ... }
    static async approveUpRole(...) { ... }
    */
}

module.exports = AdminModel;