const FieldOwnerModel = require('../models/FieldOwnerModel');

// --- 1. TẠO SÂN MỚI ---
exports.createField = async (req, res) => {
    try {
        const ownerId = req.user.id; // Lấy ID từ Token
        const { tenSan, loaiSan, diaChi, phuong, gia, trangThai } = req.body;

        // 1. Validate dữ liệu bắt buộc
        if (!tenSan || !loaiSan || !diaChi || !phuong || !gia) {
            return res.status(400).json({ message: 'Vui lòng điền đủ: Tên, Loại, Địa chỉ, Phường, Giá' });
        }

        // 2. Validate Loại sân (Chỉ chấp nhận 'Sân 5', 'Sân 7', 'Sân 11')
        // Lưu ý: Tùy frontend gửi lên là số hay chuỗi, ở đây giả sử gửi chuỗi
        const validTypes = ['Sân 5', 'Sân 7', 'Sân 11', 'San 5', 'San 7', 'San 11']; 
        if (!validTypes.includes(loaiSan)) {
            return res.status(400).json({ message: 'Loại sân không hợp lệ (Phải là Sân 5, Sân 7 hoặc Sân 11)' });
        }

        // 3. Validate Trạng thái (Nếu có gửi lên)
        const validStatus = ['hoatdong', 'baotri', 'ngunghoatdong'];
        if (trangThai && !validStatus.includes(trangThai)) {
            return res.status(400).json({ message: 'Trạng thái không hợp lệ' });
        }

        // 4. Gọi Model tạo sân
        const [result] = await FieldOwnerModel.create({ 
            ownerId, tenSan, loaiSan, diaChi, phuong, gia, trangThai 
        });
        
        res.status(201).json({ 
            message: 'Tạo sân thành công!', 
            fieldId: result.insertId 
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi server khi tạo sân', error });
    }
};

// --- 2. XEM DANH SÁCH SÂN CỦA MÌNH ---
exports.getMyFields = async (req, res) => {
    try {
        const ownerId = req.user.id;
        const [rows] = await FieldOwnerModel.getFieldsByOwner(ownerId);
        res.status(200).json(rows);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi lấy danh sách sân', error });
    }
};

// --- 3. XEM CHI TIẾT SÂN ---
exports.getFieldDetail = async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await FieldOwnerModel.getFieldById(id);

        if (rows.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy sân' });
        }
        res.status(200).json(rows[0]);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi xem chi tiết', error });
    }
};

// --- 4. CẬP NHẬT SÂN ---
exports.updateField = async (req, res) => {
    try {
        const fieldId = req.params.id;
        const ownerId = req.user.id;
        const { tenSan, loaiSan, diaChi, phuong, gia, trangThai } = req.body;

        // Validate cơ bản (nếu cần thiết có thể copy logic validate từ createField)
        
        const [result] = await FieldOwnerModel.update(fieldId, ownerId, { 
            tenSan, loaiSan, diaChi, phuong, gia, trangThai 
        });

        // Nếu affectedRows = 0 nghĩa là ID sân không tồn tại HOẶC sân đó không phải của Owner này
        if (result.affectedRows === 0) {
            return res.status(403).json({ message: 'Cập nhật thất bại (Không tìm thấy sân hoặc bạn không có quyền)' });
        }

        res.status(200).json({ message: 'Cập nhật thông tin sân thành công' });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi cập nhật sân', error });
    }
};

// --- 5. XÓA SÂN ---
exports.deleteField = async (req, res) => {
    try {
        const fieldId = req.params.id;
        const ownerId = req.user.id;

        const [result] = await FieldOwnerModel.delete(fieldId, ownerId);

        if (result.affectedRows === 0) {
            return res.status(403).json({ message: 'Xóa thất bại (Sân không tồn tại hoặc không thuộc về bạn)' });
        }

        res.status(200).json({ message: 'Đã xóa sân thành công' });
    } catch (error) {
        // Lỗi này thường xảy ra nếu sân đã có Lịch đặt (LichDatSan) liên kết khóa ngoại
        if (error.code === 'ER_ROW_IS_REFERENCED_2') {
            return res.status(400).json({ message: 'Không thể xóa sân này vì đã có lịch đặt. Hãy chuyển trạng thái sang "Ngưng hoạt động".' });
        }
        res.status(500).json({ message: 'Lỗi xóa sân', error });
    }
};