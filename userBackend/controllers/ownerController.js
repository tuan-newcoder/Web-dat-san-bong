const db = require('../db');
const moment = require('moment');

// 1. Tạo sân mới
exports.createField = async (req, res) => {
    const ownerId = req.user.id; 
    const { TenSan, LoaiSan, DiaChi, Phuong, Gia } = req.body;

    // --- 1. VALIDATION ĐẦU VÀO (Giữ nguyên) ---
    if (!TenSan || !Gia || !DiaChi) {
        return res.status(400).json({ message: "Vui lòng điền đầy đủ Tên sân, Địa chỉ và Giá!" });
    }
    if (isNaN(Gia) || Number(Gia) <= 0) {
        return res.status(400).json({ message: "Giá sân không hợp lệ!" });
    }
    
    // Validate LoaiSan và Phuong (Giữ nguyên code cũ của bạn)
    const validLoaiSan = ['Sân 5', 'Sân 7', 'Sân 11'];
    if (!validLoaiSan.includes(String(LoaiSan))) return res.status(400).json({ message: 'Loại sân không hợp lệ' });

    const validPhuong = ['Bách Khoa', 'Trung Hòa', 'Kim Giang', 'Phương Liệt', 'Thanh Xuân', 
                         'Thanh Lương', 'Trương Định', 'Hoàng Văn Thụ', 'Minh Khai', 
                         'Mai Động', 'Tương Mai', 'Yên Sở']; 
    if (!validPhuong.includes(String(Phuong))) return res.status(400).json({ message: 'Phường không hợp lệ' });


    try {
        // --- 2. MỚI: CHECK TRÙNG TÊN TRONG DATABASE ---
        // Query xem tên sân đã có chưa (LIMIT 1 để tối ưu hiệu năng)
        const checkSql = `SELECT MaSan FROM SanBong WHERE TenSan = ? LIMIT 1`;
        const [existingFields] = await db.query(checkSql, [TenSan]);

        if (existingFields.length > 0) {
            // Trả về lỗi 409 (Conflict) - Xung đột dữ liệu
            return res.status(409).json({ message: "Tên sân này đã tồn tại, vui lòng chọn tên khác!" });
        }

        // --- 3. INSERT DỮ LIỆU (Nếu không trùng) ---
        const sql = `INSERT INTO SanBong (MaNguoiDung, TenSan, LoaiSan, DiaChi, Phuong, Gia, TrangThai) 
                     VALUES (?, ?, ?, ?, ?, ?, 'hoatdong')`;

        const [result] = await db.query(sql, [ownerId, TenSan, LoaiSan, DiaChi, Phuong, Gia]);

        res.status(201).json({ 
            message: "Tạo sân thành công",
            data: {
                id: result.insertId,
                TenSan,
                LoaiSan,
                Gia
            }
        });

    } catch (err) {
        console.error("Lỗi tạo sân:", err);
        res.status(500).json({ message: "Lỗi Server", error: err.message });
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
            SELECT MaSan, TenSan, LoaiSan, DiaChi, Gia, TrangThai, Phuong 
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


/*
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
*/

// 5. Xóa sân (Chuyển trạng thái sang ngunghoatdong hoặc xóa hẳn tùy logic, ở đây tôi dùng DELETE theo bảng mô tả) (chưa dùng)
exports.deleteField = async (req, res) => {
    try {
        const maSan = req.params.id;
        const maChuSan = req.user.id;

        // 1. Kiểm tra xem sân có lịch đặt "sắp tới" (chưa diễn ra) không?
        const checkBookingSql = `
            SELECT COUNT(*) as count FROM LichDatSan 
            WHERE MaSan = ? 
            AND (TrangThai = 'daxacnhan' OR TrangThai = 'chuaxacnhan')
            AND Ngay >= CURDATE()`; 
        
        const [bookingCheck] = await db.query(checkBookingSql, [maSan]);
        
        if (bookingCheck[0].count > 0) {
            return res.status(400).json({ 
                message: "Không thể xóa sân vì đang có lịch đặt sắp tới. Hãy hủy lịch trước." 
            });
        }

        // 2. Thực hiện Xóa mềm (Chuyển trạng thái sang ngưng hoạt động/đã xóa)
        const sql = `UPDATE SanBong SET TrangThai = 'ngunghoatdong' WHERE MaSan = ? AND MaNguoiDung = ?`;
        
        const [result] = await db.query(sql, [maSan, maChuSan]);

        // 3. Kiểm tra xem có xóa (update) được dòng nào không
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Sân không tồn tại hoặc bạn không có quyền xóa" });
        }

        res.status(200).json({ message: "Đã xóa sân thành công (Sân đã ngừng hoạt động)" });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Lỗi Server" });
    }
};

// 6. Xem lịch đặt sân của tất cả các sân của Owner
exports.getAllBookings = async (req, res) => {
    const ownerId = req.user.id;

    try {

        const sql = `
            SELECT 
                l.MaDatSan, l.Ngay, l.Ca, l.TrangThai, l.TongTien,
                s.TenSan, 
                u.HoTen as TenKhachHang, u.sdt as SoDienThoai
            FROM LichDatSan l 
            JOIN SanBong s ON l.MaSan = s.MaSan 
            JOIN User u ON l.MaNguoiDung = u.MaNguoiDung
            WHERE s.MaNguoiDung = ?
            ORDER BY l.Ngay DESC, l.Ca DESC
        `;

        // Chỉ cần truyền 1 tham số duy nhất là ID chủ sân
        const [bookings] = await db.query(sql, [ownerId]);
        
        res.status(200).json({ 
            message: "Lấy danh sách đặt sân thành công",
            count: bookings.length,
            data: bookings 
        });

    } catch (err) {
        console.error("Lỗi lấy danh sách đặt sân:", err);
        res.status(500).json({ message: "Lỗi Server" });
    }
};

/*
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
*/

// 8. Cập nhật trạng thái lịch (Xác nhận/Hủy)
exports.updateBookingStatus = async (req, res) => {
    const maDatSan = req.params.id;
    const { TrangThai } = req.body;

    // 1. Validate dữ liệu đầu vào (Quan trọng)
    // Chỉ cho phép các trạng thái cụ thể
    const allowedStatuses = ['daxacnhan', 'dahuy', 'chuaxacnhan']; 
    if (!allowedStatuses.includes(TrangThai)) {
        return res.status(400).json({ 
            message: "Trạng thái không hợp lệ. Chỉ chấp nhận: " + allowedStatuses.join(', ') 
        });
    }

    try {
        // 2. Validate chủ sân & Lấy trạng thái hiện tại
        const checkOwnerSql = `
            SELECT l.MaDatSan, l.TrangThai 
            FROM LichDatSan l 
            JOIN SanBong s ON l.MaSan = s.MaSan 
            WHERE l.MaDatSan = ? AND s.MaNguoiDung = ?`;
        
        const [rows] = await db.query(checkOwnerSql, [maDatSan, req.user.id]);
        
        if (rows.length === 0) {
            return res.status(404).json({ message: "Không tìm thấy lịch đặt hoặc bạn không có quyền chỉnh sửa" });
        }

        const currentStatus = rows[0].TrangThai;

        if (currentStatus === TrangThai) {
            return res.status(200).json({ message: "Trạng thái đã được cập nhật trước đó" });
        }

        // 4. Thực hiện Update
        await db.query(`UPDATE LichDatSan SET TrangThai = ? WHERE MaDatSan = ?`, [TrangThai, maDatSan]);
        
        res.status(200).json({ 
            message: "Cập nhật trạng thái thành công",
            data: { maDatSan, trangThaiMoi: TrangThai }
        });

    } catch (err) {
        // 5. Log lỗi để debug
        console.error("Error updating booking status:", err);
        res.status(500).json({ message: "Lỗi Server nội bộ" });
    }
};

// 9. Doanh thu theo ngày (7 ngày gần nhất)

exports.getRevenueByDay = async (req, res) => {
    try {
        const maSan = req.query.maSan; 
        const userId = req.user.id;

        // --- BƯỚC 1: Query Database ---
        let sql = `
            SELECT 
                DATE_FORMAT(l.Ngay, '%Y-%m-%d') as NgayStr, 
                SUM(l.TongTien) as TongTien, 
                COUNT(l.MaDatSan) as SoDonThanhCong
            FROM LichDatSan l
            JOIN SanBong s ON l.MaSan = s.MaSan
            WHERE s.MaNguoiDung = ? 
            AND l.TrangThai = 'daxacnhan' 
            AND l.Ngay >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)
        `;
        
        const params = [userId];

        if (maSan) {
            sql += ` AND s.MaSan = ?`;
            params.push(maSan);
        }
        
        sql += ` GROUP BY NgayStr ORDER BY NgayStr ASC`;

        const [rows] = await db.query(sql, params);

        // --- BƯỚC 2: Xử lý Zero-filling ---
        const fullStats = [];
        
        for (let i = 6; i >= 0; i--) {
            const dayObj = moment().subtract(i, 'days');
            const dateKey = dayObj.format('YYYY-MM-DD');

            const found = rows.find(row => row.NgayStr === dateKey);

            fullStats.push({
                Ngay: dateKey,
                NgayHienThi: dayObj.format('DD/MM'), // Thêm cái này để Frontend hiển thị cho đẹp
                
                // SỬA LỖI Ở ĐÂY:
                // Nếu tìm thấy thì ép kiểu Number, nếu không thì gán bằng 0
                TongTien: found ? Number(found.TongTien) : 0,
                SoDonThanhCong: found ? Number(found.SoDonThanhCong) : 0 
            });
        }

        // --- BƯỚC 3: Trả về kết quả ---
        res.status(200).json({ 
            message: "Lấy thống kê thành công",
            data: fullStats 
        });

    } catch (err) {
        console.error("Lỗi API getRevenueByDay:", err);
        res.status(500).json({ message: "Lỗi Server nội bộ" });
    }
};
// 10. Doanh thu theo tháng (6 tháng gần nhất)
exports.getRevenueByMonth = async (req, res) => {
    try {
        const maSan = req.query.maSan;
        const userId = req.user.id;

        // 1. Tính toán ngày bắt đầu (6 tháng gần nhất)
        const startDate = moment().subtract(5, 'months').startOf('month').format('YYYY-MM-DD');

        // 2. Query Database
        // CHÚ Ý: Viết câu SQL cơ bản đầy đủ cột trước
        let sql = `
            SELECT 
                DATE_FORMAT(l.Ngay, '%Y-%m') as ThangStr, 
                SUM(l.TongTien) as TongTien, 
                COUNT(l.MaDatSan) as SoDonThanhCong
            FROM LichDatSan l
            JOIN SanBong s ON l.MaSan = s.MaSan
            WHERE s.MaNguoiDung = ? 
            AND l.TrangThai = 'daxacnhan' 
            AND l.Ngay >= ? 
        `;
        
        const params = [userId, startDate];

        // Nếu có maSan, ta chỉ nối thêm chuỗi (+=) thay vì viết lại từ đầu
        // Cách này an toàn hơn, tránh việc quên cột này cột kia
        if (maSan) {
            sql += ` AND s.MaSan = ?`;
            params.push(maSan);
        }

        sql += ` GROUP BY ThangStr ORDER BY ThangStr ASC`;

        const [rows] = await db.query(sql, params);

        // 3. LOGIC Lấp đầy tháng trống (Zero-filling)
        const fullStats = [];

        for (let i = 5; i >= 0; i--) {
            const monthObj = moment().subtract(i, 'months');
            const monthKey = monthObj.format('YYYY-MM'); // VD: 2025-12

            // Tìm trong kết quả SQL
            const found = rows.find(row => row.ThangStr === monthKey);

            fullStats.push({
                Thang: monthKey,
                ThangHienThi: monthObj.format('MM/YYYY'), // VD: 12/2025
                
                // SỬA LỖI Ở ĐÂY: Lấy giá trị từ 'found'
                TongTien: found ? Number(found.TongTien) : 0,
                SoDonThanhCong: found ? Number(found.SoDonThanhCong) : 0
            });
        }

        // 4. Trả về kết quả
        res.status(200).json({ 
            message: "Lấy thống kê tháng thành công",
            data: fullStats 
        });

    } catch (err) {
        console.error("Lỗi API getRevenueByMonth:", err);
        res.status(500).json({ message: "Lỗi Server nội bộ" });
    }
};