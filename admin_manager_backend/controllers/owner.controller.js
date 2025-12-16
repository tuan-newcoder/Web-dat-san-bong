const db = require('../config/database');

// --- PHẦN 1: QUẢN LÝ SÂN BÓNG ---

// 1. Thêm sân mới
// Input theo tài liệu: Tên sân, địa chỉ, loại sân 
const createField = async (req, res) => {
    try {
        const ownerId = req.user.MaNguoiDung;
        const { tenSan, loaiSan, diaChi } = req.body;

        // Validation dữ liệu đầu vào
        if (!tenSan || !loaiSan || !diaChi) {
            return res.status(400).json({ message: 'Thiếu thông tin: Tên sân, Loại sân hoặc Địa chỉ' });
        }

        // Validate Loại sân (chỉ chấp nhận sân 5, 7, 11 theo tài liệu)
        const validTypes = ['5', '7', '11', '5 người', '7 người', '11 người'];
        if (!validTypes.includes(loaiSan.toString())) {
             return res.status(400).json({ message: 'Loại sân không hợp lệ (Chỉ chấp nhận: 5, 7, 11)' });
        }

        const query = `
            INSERT INTO sanbong (MaNguoiDung, TenSan, LoaiSan, DiaChi, TrangThai)
            VALUES (?, ?, ?, ?, 'hoatdong')
        `;

        const [result] = await db.execute(query, [ownerId, tenSan, loaiSan, diaChi]);

        return res.status(201).json({
            success: true,
            message: 'Thêm sân thành công',
            newFieldId: result.insertId
        });

    } catch (error) {
        console.error('Error createField:', error);
        return res.status(500).json({ message: 'Lỗi server khi thêm sân' });
    }
};

// 2. Sửa thông tin sân
const updateField = async (req, res) => {
    try {
        const ownerId = req.user.MaNguoiDung;
        const { id } = req.params;
        const { tenSan, loaiSan, diaChi, trangThai } = req.body;

        // Check quyền sở hữu
        const checkQuery = 'SELECT MaSan FROM sanbong WHERE MaSan = ? AND MaNguoiDung = ?';
        const [checkRows] = await db.execute(checkQuery, [id, ownerId]);

        if (checkRows.length === 0) {
            return res.status(403).json({ message: 'Bạn không có quyền sửa sân này' });
        }

        const updateQuery = `
            UPDATE sanbong 
            SET TenSan = ?, LoaiSan = ?, DiaChi = ?, TrangThai = ?
            WHERE MaSan = ?
        `;
        
        await db.execute(updateQuery, [tenSan, loaiSan, diaChi, trangThai, id]);

        return res.status(200).json({
            success: true,
            message: 'Cập nhật sân thành công'
        });

    } catch (error) {
        console.error('Error updateField:', error);
        return res.status(500).json({ message: 'Lỗi server khi sửa sân' });
    }
};

// --- PHẦN 2: QUẢN LÝ ĐƠN ĐẶT (Booking Management) ---

// 3. Xem danh sách đặt sân (Có hỗ trợ Lọc theo Ngày & Trạng thái)
// Nghiệp vụ: "Lọc theo ngày/trạng thái -> Hiển thị danh sách đơn" 
const getOwnerBookings = async (req, res) => {
    try {
        const ownerId = req.user.MaNguoiDung;
        
        // Lấy tham số filter từ Query String (VD: ?date=2023-12-20&status=chuaxacnhan)
        const { date, status } = req.query;

        let sql = `
            SELECT 
                l.MaDatSan,
                l.TrangThai AS TrangThaiDon,
                c.Ngay,
                c.GioBD,
                c.GioKT,
                c.Gia,
                s.TenSan,
                u.HoTen AS TenKhachHang,
                u.sdt AS SDTKhachHang
            FROM lichdatsan l
            JOIN cathuesan c ON l.MaCaThue = c.MaCaThue
            JOIN sanbong s ON c.MaSan = s.MaSan
            JOIN user u ON l.MaNguoiDung = u.MaNguoiDung
            WHERE s.MaNguoiDung = ?
        `;

        const params = [ownerId];

        // Logic Filter động
        if (date) {
            sql += ` AND c.Ngay = ?`;
            params.push(date);
        }

        if (status) {
            sql += ` AND l.TrangThai = ?`;
            params.push(status);
        }

        sql += ` ORDER BY c.Ngay DESC, c.GioBD ASC`;

        const [rows] = await db.execute(sql, params);

        return res.status(200).json({
            success: true,
            count: rows.length,
            filters: { date, status },
            data: rows
        });

    } catch (error) {
        console.error('Error getOwnerBookings:', error);
        return res.status(500).json({ message: 'Lỗi server khi lấy danh sách đặt sân' });
    }
};

// 4. Duyệt hoặc Hủy đơn đặt (Nghiệp vụ: Thực hiện hành động)
const updateBookingStatus = async (req, res) => {
    try {
        const ownerId = req.user.MaNguoiDung;
        const { bookingId } = req.params; // MaDatSan
        const { newStatus } = req.body;   // 'daxacnhan' hoặc 'dahuy'

        // Validate trạng thái cho phép
        const validStatuses = ['daxacnhan', 'dahuy'];
        if (!validStatuses.includes(newStatus)) {
            return res.status(400).json({ message: 'Trạng thái không hợp lệ' });
        }

        // Check xem đơn đặt này có thuộc về sân của Owner không
        // Phải join nhiều bảng để xác thực quyền chủ sân với cái đơn này
        const checkQuery = `
            SELECT l.MaDatSan 
            FROM lichdatsan l
            JOIN cathuesan c ON l.MaCaThue = c.MaCaThue
            JOIN sanbong s ON c.MaSan = s.MaSan
            WHERE l.MaDatSan = ? AND s.MaNguoiDung = ?
        `;
        
        const [checkRows] = await db.execute(checkQuery, [bookingId, ownerId]);

        if (checkRows.length === 0) {
            return res.status(403).json({ message: 'Bạn không có quyền xử lý đơn này' });
        }

        // Cập nhật trạng thái
        await db.execute('UPDATE lichdatsan SET TrangThai = ? WHERE MaDatSan = ?', [newStatus, bookingId]);

        return res.status(200).json({
            success: true,
            message: `Đã cập nhật trạng thái đơn sang: ${newStatus}`
        });

    } catch (error) {
        console.error('Error updateBookingStatus:', error);
        return res.status(500).json({ message: 'Lỗi server' });
    }
}

module.exports = {
    createField,
    updateField,
    getOwnerBookings,
    updateBookingStatus
};