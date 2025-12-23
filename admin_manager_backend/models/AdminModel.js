const { db } = require('../config/index');

class AdminModel {
    // =================================================
    // NHÓM 1: QUẢN LÝ USER
    // =================================================

    // 1. Lấy danh sách toàn bộ User
    static async getAllUsers() {
        const sql = "SELECT MaNguoiDung, HoTen, username, email, sdt, quyen FROM User";
        return db.execute(sql);
    }

    // 2. Xóa tài khoản User
    static async deleteUser(userId) {
        // Lưu ý: Nếu User đã có sân bóng hoặc lịch đặt, Database có thể chặn xóa (Foreign Key Constraint)
        // Nếu muốn xóa sạch, cần xóa dữ liệu liên quan trước (nhưng ở đây làm cơ bản trước)
        const sql = "DELETE FROM User WHERE MaNguoiDung = ?";
        return db.execute(sql, [userId]);
    }

    // =================================================
    // NHÓM 2: QUẢN LÝ YÊU CẦU LÊN CHỦ SÂN (UPROLE)
    // =================================================

    // 3. Lấy danh sách yêu cầu (Kèm thông tin username để dễ đối chiếu)
    static async getAllUpRoleRequests() {
        const sql = `
            SELECT u.*, us.username 
            FROM UpRole u
            JOIN User us ON u.MaNguoiDung = us.MaNguoiDung
            ORDER BY u.MaUpRole DESC
        `;
        return db.execute(sql);
    }

    // 4. DUYỆT YÊU CẦU (Quan trọng: Dùng Transaction)
    // Logic: Lấy thông tin UpRole -> Update bảng User (Quyền + Bank) -> Update bảng UpRole (Trạng thái)
    static async approveUpRole(maUpRole) {
        const connection = await db.getConnection(); // Lấy 1 kết nối riêng để chạy Transaction
        try {
            await connection.beginTransaction(); // Bắt đầu giao dịch

            // B1: Lấy thông tin chi tiết của yêu cầu này
            const [rows] = await connection.execute(
                "SELECT * FROM UpRole WHERE MaUpRole = ?", 
                [maUpRole]
            );

            if (rows.length === 0) {
                throw new Error("Yêu cầu không tồn tại!");
            }
            const requestData = rows[0];

            // B2: Cập nhật bảng User
            // - Nâng quyền lên 'chusan'
            // - Cập nhật luôn Số tài khoản và Ngân hàng từ đơn đăng ký vào hồ sơ User
            await connection.execute(
                "UPDATE User SET quyen = 'chusan', stk = ?, bank = ? WHERE MaNguoiDung = ?", 
                [requestData.Stk, requestData.Bank, requestData.MaNguoiDung]
            );

            // B3: Cập nhật trạng thái bảng UpRole thành 'chapnhan'
            await connection.execute(
                "UPDATE UpRole SET TrangThai = 'chapnhan' WHERE MaUpRole = ?", 
                [maUpRole]
            );

            await connection.commit(); // Lưu tất cả thay đổi
            return true;
        } catch (error) {
            await connection.rollback(); // Nếu lỗi thì hoàn tác tất cả
            throw error;
        } finally {
            connection.release(); // Trả kết nối về pool
        }
    }

    // 5. TỪ CHỐI YÊU CẦU
    static async rejectUpRole(maUpRole) {
        const sql = "UPDATE UpRole SET TrangThai = 'tuchoi' WHERE MaUpRole = ?";
        return db.execute(sql, [maUpRole]);
    }
}

module.exports = AdminModel;