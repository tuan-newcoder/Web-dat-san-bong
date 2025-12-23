const { db } = require('../config/index');

class FieldOwnerModel {
    // 1. Tạo sân mới
    static async create(data) {
        // QrChuSan tạm để NULL, xử lý sau
        const sql = `
            INSERT INTO SanBong (MaNguoiDung, TenSan, LoaiSan, DiaChi, Phuong, Gia, TrangThai) 
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        const values = [
            data.ownerId, 
            data.tenSan, 
            data.loaiSan, 
            data.diaChi,
            data.phuong,
            data.gia,
            data.trangThai || 'hoatdong' // Mặc định là hoatdong nếu không gửi
        ];
        return db.execute(sql, values);
    }

    // 2. Lấy danh sách sân của Owner (dựa trên MaNguoiDung)
    static async getFieldsByOwner(ownerId) {
        const sql = 'SELECT * FROM SanBong WHERE MaNguoiDung = ? ORDER BY MaSan DESC';
        return db.execute(sql, [ownerId]);
    }

    // 3. Xem chi tiết 1 sân
    static async getFieldById(fieldId) {
        const sql = 'SELECT * FROM SanBong WHERE MaSan = ?';
        return db.execute(sql, [fieldId]);
    }

    // 4. Cập nhật thông tin sân (Phải đúng Owner mới được sửa)
    static async update(fieldId, ownerId, data) {
        const sql = `
            UPDATE SanBong 
            SET TenSan = ?, LoaiSan = ?, DiaChi = ?, Phuong = ?, Gia = ?, TrangThai = ?
            WHERE MaSan = ? AND MaNguoiDung = ?
        `;
        const values = [
            data.tenSan,
            data.loaiSan,
            data.diaChi,
            data.phuong,
            data.gia,
            data.trangThai,
            fieldId,
            ownerId
        ];
        return db.execute(sql, values);
    }

    // 5. Xóa sân (Xóa cứng khỏi database)
    static async delete(fieldId, ownerId) {
        const sql = 'DELETE FROM SanBong WHERE MaSan = ? AND MaNguoiDung = ?';
        return db.execute(sql, [fieldId, ownerId]);
    }
}

module.exports = FieldOwnerModel;