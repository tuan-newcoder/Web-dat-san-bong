const db = require('../db');

// 1. Tạo sân mới
exports.createField = async (req, res) => {
    const ownerId = req.user.id; 
    const { TenSan, LoaiSan, DiaChi, Phuong, Gia } = req.body;

    if (!TenSan || !Gia || !DiaChi) return res.status(400).json({ message: "Vui lòng điền đầy đủ Tên sân, Địa chỉ và Giá!" });

    if (isNaN(Gia) || Number(Gia) <= 0) {
        return res.status(400).json({ message: "Giá sân không hợp lệ!" });
    }

    const validLoaiSan = ['Sân 5', 'Sân 7', 'Sân 11']; // Ví dụ danh sách loại sân
    if (!validLoaiSan.includes(String(LoaiSan))) {
         return res.status(400).json({ message: 'Loại sân không hợp lệ (chỉ chấp nhận "Sân 5", "Sân 7", "Sân 11")' });
    }

    const validPhuong = ['Bách Khoa', 'Trung Hòa', 'Kim Giang', 'Phương Liệt', 'Thanh Xuân', 'Thanh Lương', 
                        'Trương Định', 'Hoàng Văn Thụ', 'Minh Khai', 'Mai Động', 'Hoàng Văn Thụ', 'Tương Mai', 'Yên Sở']; 
    if (!validPhuong.includes(String(Phuong))) {
         return res.status(400).json({ message: 'Phường không hợp lệ ' });
    }

    try {
        const sql = `INSERT INTO SanBong (MaNguoiDung, TenSan, LoaiSan, DiaChi, Phuong, Gia, TrangThai) 
                    VALUES (?, ?, ?, ?, ?, ?, 'hoatdong')`;

        await db.query(sql, [ownerId, TenSan, LoaiSan, DiaChi, Phuong, Gia]);

        res.status(201).json({ 
            message: "Tạo sân thành công",
            data: {
                id: result.insertId, // Rất quan trọng cho Frontend
                TenSan,
                Gia
            }
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};

// 2. Xem danh sách sân của mình
exports.getMyFields = async (req, res) => {
    // Dùng optional chaining để an toàn hơn
    const userId = req.user?.id;

    try {
        // 1. Thêm ORDER BY để sân mới nhất lên đầu (giả sử MaSan là tự tăng)
        // 2. Nếu bảng có quá nhiều cột, hãy liệt kê cụ thể các cột cần lấy thay vì *
        const sql = `
            SELECT MaSan, TenSan, LoaiSan, DiaChi, Gia, TrangThai 
            FROM SanBong 
            WHERE MaNguoiDung = ? 
            ORDER BY MaSan DESC
        `;
        
        const [fields] = await db.query(sql, [userId]);

        // 3. Trả về format chuẩn, kèm số lượng
        res.status(200).json({
            message: "Lấy danh sách sân thành công",
            count: fields.length, // Tiện cho Frontend hiển thị số lượng
            data: fields
        });

    } catch (err) {
        console.error("Lỗi lấy danh sách sân:", err);
        res.status(500).json({ message: "Lỗi Server khi lấy danh sách sân" });
    }
};


// 3. Xem chi tiết 1 sân (Dùng bản của fieldsController)
exports.getFieldDetail = async (req, res) => {
    try {
        const sql = `SELECT * FROM SanBong WHERE MaSan = ? AND MaNguoiDung = ?`;

        const [rows] = await db.query(sql, [req.params.id, req.user.id]);

        if (rows.length === 0) return res.status(404).json({ message: "Không tìm thấy sân" });

        res.status(200).json({ data: rows[0] });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Lỗi Server" });
    }
};


// 4. Cập nhật sân (Hàm thiếu, dùng bản fieldsController)
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

// 5. Xóa sân (Chuyển trạng thái sang ngunghoatdong hoặc xóa hẳn tùy logic, ở đây tôi dùng DELETE theo bảng mô tả) (chưa dùng)
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
    // Không cần check req.params.idnguoidung nữa
    // Tin tưởng tuyệt đối vào req.user.id từ Token

    try {
        // Thêm điều kiện lọc để tối ưu (Ví dụ: Frontend có thể gửi query ?status=choxacnhan)
        const { status, date } = req.query; 

        let sql = `
            SELECT 
                l.MaLich, l.Ngay, l.Ca, l.TrangThai, l.GiaTien,
                s.TenSan, 
                u.HoTen as TenKhach, u.sdt 
            FROM LichDatSan l 
            JOIN SanBong s ON l.MaSan = s.MaSan 
            JOIN User u ON l.MaNguoiDung = u.MaNguoiDung
            WHERE s.MaNguoiDung = ?
        `;

        const params = [req.user.id];

        // Nếu Frontend muốn lọc theo trạng thái (ví dụ chỉ xem đơn chờ duyệt)
        if (status) {
            sql += ` AND l.TrangThai = ?`;
            params.push(status);
        }

        // Nếu Frontend muốn xem lịch ngày cụ thể
        if (date) {
            sql += ` AND l.Ngay = ?`;
            params.push(date);
        }

        sql += ` ORDER BY l.Ngay DESC, l.Ca DESC`;

        const [bookings] = await db.query(sql, params);
        
        res.status(200).json({ 
            message: "Lấy danh sách đặt sân thành công",
            count: bookings.length,
            data: bookings 
        });

    } catch (err) {
        console.error(err); // Log lỗi ra console để debug
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
        console.error(err);
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