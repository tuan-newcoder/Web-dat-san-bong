const FieldModel = require('../models/FieldModel');

// 1. Tạo sân mới
exports.createField = async (req, res) => {
    try {
        const ownerId = req.user.id; 
        // Bỏ 'phuong' vì DB không có
        const { tenSan, loaiSan, diaChi } = req.body;

        // Validate dữ liệu
        if (!tenSan || !loaiSan || !diaChi) {
            return res.status(400).json({ message: 'Vui lòng điền đủ: Tên sân, Loại sân, Địa chỉ' });
        }

        const [result] = await FieldModel.create({ ownerId, tenSan, loaiSan, diaChi });
        
        res.status(201).json({ 
            message: 'Tạo sân thành công!', 
            fieldId: result.insertId 
        });
    } catch (error) {
        console.error("Lỗi tạo sân:", error);
        res.status(500).json({ message: 'Lỗi server khi tạo sân', error });
    }
};

// ... Các hàm getMyFields, getFieldDetail, deleteField giữ nguyên logic ...

// 4. Cập nhật sân (Sửa lại input cho khớp DB)
exports.updateField = async (req, res) => {
    try {
        const fieldId = req.params.id;
        const ownerId = req.user.id;
        const { tenSan, loaiSan, diaChi, trangThai } = req.body;

        const [result] = await FieldModel.update(fieldId, ownerId, { 
            tenSan, loaiSan, diaChi, trangThai 
        });

        if (result.affectedRows === 0) {
            return res.status(403).json({ message: 'Cập nhật thất bại (Không tìm thấy hoặc không có quyền)' });
        }

        res.status(200).json({ message: 'Cập nhật sân thành công' });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi cập nhật sân', error });
    }
};

// Các hàm khác giữ nguyên như file cũ
exports.getMyFields = async (req, res) => { /* Giữ nguyên code cũ */ };
exports.getFieldDetail = async (req, res) => { /* Giữ nguyên code cũ */ };
exports.deleteField = async (req, res) => { /* Giữ nguyên code cũ */ };