const { db } = require('../config/index');

class FieldModel {
    // 1. Tạo sân mới
    static async create(fieldData) {
        // Lưu ý: Database mới không có cột 'Phuong'
        const sql = `
            INSERT INTO SanBong (MaNguoiDung, TenSan, LoaiSan, DiaChi, TrangThai) 
            VALUES (?, ?, ?, ?, 'hoatdong')
        `;
        const values = [
            fieldData.ownerId, // Map với MaNguoiDung
            fieldData.tenSan, 
            fieldData.loaiSan, 
            fieldData.diaChi
        ];
        return db.execute(sql, values);
    }

    // 2. Lấy danh sách sân của Owner
    static async getFieldsByOwner(ownerId) {
        const sql = 'SELECT * FROM SanBong WHERE MaNguoiDung = ?';
        return db.execute(sql, [ownerId]);
    }

    // 3. Xem chi tiết sân
    static async getFieldById(fieldId) {
        const sql = 'SELECT * FROM SanBong WHERE MaSan = ?';
        return db.execute(sql, [fieldId]);
    }

    // 4. Cập nhật sân
    static async update(fieldId, ownerId, updateData) {
        const sql = `
            UPDATE SanBong 
            SET TenSan = ?, LoaiSan = ?, DiaChi = ?, TrangThai = ?
            WHERE MaSan = ? AND MaNguoiDung = ?
        `;
        const values = [
            updateData.tenSan,
            updateData.loaiSan,
            updateData.diaChi,
            updateData.trangThai, // 'hoatdong' hoặc 'baotri'
            fieldId,
            ownerId
        ];
        return db.execute(sql, values);
    }

    // 5. Xóa sân
    static async delete(fieldId, ownerId) {
        const sql = 'DELETE FROM SanBong WHERE MaSan = ? AND MaNguoiDung = ?';
        return db.execute(sql, [fieldId, ownerId]);
    }
}

module.exports = FieldModel;