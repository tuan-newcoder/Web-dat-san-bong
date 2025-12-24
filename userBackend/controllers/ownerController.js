const db = require('../db');

// 1. Tạo sân mới
exports.createField = async (req, res) => {
    const ownerId = req.user.id; 
    const { TenSan, LoaiSan, DiaChi, Phuong, Gia } = req.body;

    if (!TenSan || !Gia || !DiaChi) return res.status(400).json({ message: "Thiếu thông tin!" });

    try {
        const sql = `INSERT INTO SanBong (MaNguoiDung, TenSan, LoaiSan, DiaChi, Phuong, Gia, TrangThai) VALUES (?, ?, ?, ?, ?, ?, 'hoatdong')`;
        await db.query(sql, [ownerId, TenSan, LoaiSan, DiaChi, Phuong, Gia]);
        res.status(201).json({ message: "Tạo sân thành công" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 2. Xem danh sách sân của mình
exports.getMyFields = async (req, res) => {
    try {
        const sql = `SELECT * FROM SanBong WHERE MaNguoiDung = ?`;
        const [fields] = await db.query(sql, [req.user.id]);
        res.status(200).json({ data: fields });
    } catch (err) {
        res.status(500).json({ message: "Lỗi Server" });
    }
};

// 3. Xem chi tiết 1 sân
exports.getFieldDetail = async (req, res) => {
    try {
        const sql = `SELECT * FROM SanBong WHERE MaSan = ? AND MaNguoiDung = ?`;
        const [rows] = await db.query(sql, [req.params.id, req.user.id]);
        if (rows.length === 0) return res.status(404).json({ message: "Không tìm thấy sân" });
        res.status(200).json({ data: rows[0] });
    } catch (err) {
        res.status(500).json({ message: "Lỗi Server" });
    }
};

// 4. Cập nhật sân
exports.updateField = async (req, res) => {
    const { TenSan, LoaiSan, DiaChi, Phuong, TrangThai, Gia } = req.body;
    try {
        const sql = `UPDATE SanBong SET TenSan=?, LoaiSan=?, DiaChi=?, Phuong=?, TrangThai=?, Gia=? WHERE MaSan=? AND MaNguoiDung=?`;
        await db.query(sql, [TenSan, LoaiSan, DiaChi, Phuong, TrangThai, Gia, req.params.id, req.user.id]);
        res.status(200).json({ message: "Cập nhật thành công" });
    } catch (err) {
        res.status(500).json({ message: "Lỗi Server" });
    }
};

// 5. Xóa sân (Chuyển trạng thái sang ngunghoatdong hoặc xóa hẳn tùy logic, ở đây tôi dùng DELETE theo bảng mô tả)
exports.deleteField = async (req, res) => {
    try {
        // Kiểm tra xem có lịch đặt chưa xong không trước khi xóa (Optional)
        const sql = `DELETE FROM SanBong WHERE MaSan = ? AND MaNguoiDung = ?`;
        await db.query(sql, [req.params.id, req.user.id]);
        res.status(200).json({ message: "Đã xóa sân" });
    } catch (err) {
        res.status(500).json({ message: "Lỗi Server (có thể do ràng buộc khóa ngoại)" });
    }
};

// 6. Xem lịch đặt sân của tất cả các sân của Owner
exports.getAllBookings = async (req, res) => {
    // Lưu ý: Endpoint là /bookings/:idnguoidung
    // Để bảo mật, ta nên so sánh idnguoidung trên URL với req.user.id
    if (parseInt(req.params.idnguoidung) !== req.user.id) {
        return res.status(403).json({ message: "Bạn không có quyền xem lịch của người khác" });
    }

    try {
        const sql = `
            SELECT l.*, s.TenSan, u.HoTen as TenKhach, u.sdt 
            FROM LichDatSan l 
            JOIN SanBong s ON l.MaSan = s.MaSan 
            JOIN User u ON l.MaNguoiDung = u.MaNguoiDung
            WHERE s.MaNguoiDung = ? 
            ORDER BY l.Ngay DESC, l.Ca DESC`;
        const [bookings] = await db.query(sql, [req.user.id]);
        res.status(200).json({ data: bookings });
    } catch (err) {
        res.status(500).json({ message: "Lỗi Server" });
    }
};

// 7. Xem lịch đặt của 1 sân cụ thể
exports.getFieldBookings = async (req, res) => {
    const maSan = req.params.idsan;
    try {
        // Kiểm tra sân này có phải của chủ không đã
        const [check] = await db.query('SELECT * FROM SanBong WHERE MaSan = ? AND MaNguoiDung = ?', [maSan, req.user.id]);
        if (check.length === 0) return res.status(403).json({ message: "Sân không thuộc quyền quản lý của bạn" });

        const sql = `
            SELECT l.*, u.HoTen as TenKhach 
            FROM LichDatSan l 
            JOIN User u ON l.MaNguoiDung = u.MaNguoiDung
            WHERE l.MaSan = ?
            ORDER BY l.Ngay DESC`;
        const [bookings] = await db.query(sql, [maSan]);
        res.status(200).json({ data: bookings });
    } catch (err) {
        res.status(500).json({ message: "Lỗi Server" });
    }
};

// 8. Cập nhật trạng thái lịch (Xác nhận/Hủy)
exports.updateBookingStatus = async (req, res) => {
    const maDatSan = req.params.id;
    const { TrangThai } = req.body; // 'daxacnhan' hoặc 'dahuy'

    try {
        // Validate chủ sân
        const checkOwnerSql = `
            SELECT l.MaDatSan FROM LichDatSan l 
            JOIN SanBong s ON l.MaSan = s.MaSan 
            WHERE l.MaDatSan = ? AND s.MaNguoiDung = ?`;
        const [check] = await db.query(checkOwnerSql, [maDatSan, req.user.id]);
        
        if (check.length === 0) return res.status(403).json({ message: "Không tìm thấy lịch hoặc không có quyền" });

        await db.query(`UPDATE LichDatSan SET TrangThai = ? WHERE MaDatSan = ?`, [TrangThai, maDatSan]);
        res.status(200).json({ message: "Cập nhật trạng thái thành công" });
    } catch (err) {
        res.status(500).json({ message: "Lỗi Server" });
    }
};

// 9. Doanh thu theo ngày (7 ngày gần nhất)
// Input: maSan (Lấy từ query param ?maSan=... hoặc tính tổng hết)
exports.getRevenueByDay = async (req, res) => {
    const maSan = req.query.maSan; 
    let sql = `
        SELECT DATE_FORMAT(l.Ngay, '%Y-%m-%d') as Ngay, SUM(l.TongTien) as TongTien
        FROM LichDatSan l
        JOIN SanBong s ON l.MaSan = s.MaSan
        WHERE s.MaNguoiDung = ? AND l.TrangThai = 'daxacnhan' 
        AND l.Ngay >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
    `;
    
    const params = [req.user.id];

    if (maSan) {
        sql += ` AND s.MaSan = ?`;
        params.push(maSan);
    }
    
    sql += ` GROUP BY Ngay ORDER BY Ngay ASC`;

    try {
        const [stats] = await db.query(sql, params);
        res.status(200).json({ data: stats });
    } catch (err) {
        res.status(500).json({ message: "Lỗi Server" });
    }
};

// 10. Doanh thu theo tháng (6 tháng gần nhất)
exports.getRevenueByMonth = async (req, res) => {
    const maSan = req.query.maSan;
    let sql = `
        SELECT DATE_FORMAT(l.Ngay, '%Y-%m') as Thang, SUM(l.TongTien) as TongTien
        FROM LichDatSan l
        JOIN SanBong s ON l.MaSan = s.MaSan
        WHERE s.MaNguoiDung = ? AND l.TrangThai = 'daxacnhan'
        AND l.Ngay >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
    `;
    
    const params = [req.user.id];

    if (maSan) {
        sql += ` AND s.MaSan = ?`;
        params.push(maSan);
    }

    sql += ` GROUP BY Thang ORDER BY Thang ASC`;

    try {
        const [stats] = await db.query(sql, params);
        res.status(200).json({ data: stats });
    } catch (err) {
        res.status(500).json({ message: "Lỗi Server" });
    }
};