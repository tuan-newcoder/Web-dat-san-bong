const db = require('../db');

exports.createBooking = async (req, res) => {
    const { maNguoiDung, maSan, ngay, ca } = req.body;

    // 1. Validate dữ liệu
    if (!maNguoiDung || !maSan || !ngay || !ca ) {
        return res.status(400).json({ message: "Thiếu thông tin đặt sân!" });
    }

    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        /* // 2. KIỂM TRA TRÙNG LỊCH (Logic thay đổi ở đây)
        const checkSql = `
            SELECT * FROM lichdatsan 
            WHERE MaSan = ? AND Ngay = ? AND Ca = ? 
            AND TrangThai IN ('daxacnhan', 'chuaxacnhan')
            FOR UPDATE 
        `;
        
        const [existingBookings] = await connection.query(checkSql, [maSan, ngay, ca]);

        if (existingBookings.length > 0) {
            await connection.rollback();
            return res.status(409).json({ message: "Sân này vào ca đó đã có người đặt rồi!" });
        }
        */

        // 3. TẠO ĐƠN ĐẶT MỚI (Insert thẳng vào lichdatsan)
        const insertSql = `
            INSERT INTO lichdatsan (MaNguoiDung, MaSan, Ca, Ngay, TongTien, TrangThai) 
            SELECT ?, ?, ?, ?, Gia, 'chuaxacnhan'
            FROM sanbong
            WHERE MaSan = ?
        `;
        
        const [result] = await connection.query(insertSql, [maNguoiDung, maSan, ca, ngay, maSan]);

        await connection.commit();

        res.status(201).json({
            message: "Đặt sân thành công!",
            bookingId: result.insertId,
            data: { maNguoiDung, maSan, ngay, ca, status: 'chuaxacnhan' }
        });

    } catch (err) {
        await connection.rollback();
        console.error("Lỗi đặt sân:", err);
        res.status(500).json({ message: "Lỗi Server" });
    } finally {
        connection.release();
    }
};

exports.getUserBookings = async (req, res) => {
    const { id } = req.params; // Đây là UserID

    try {
        // Join bảng datsan với bảng sanbong để lấy tên sân cho đẹp
        const sql = `
            SELECT 
                l.MaDatSan,
                l.Ngay,
                l.Ca,
                l.TrangThai,
                s.TenSan,
                s.DiaChi,
                s.Gia
            FROM lichdatsan l
            JOIN sanbong s ON l.MaSan = s.MaSan
            WHERE l.MaNguoiDung = ?
            ORDER BY l.Ngay DESC, l.Ca DESC
        `;

        const [rows] = await db.query(sql, [id]);

        if (rows.length === 0) {
            return res.status(200).json({ message: "Bạn chưa có lịch đặt sân nào.", data: [] });
        }

        res.status(200).json({
            message: "Lấy danh sách lịch đặt thành công",
            data: rows
        });

    } catch (err) {
        console.error("Lỗi lấy lịch sử đặt:", err);
        res.status(500).json({ message: "Lỗi Server" });
    }
};

exports.getPaymentInfo = async (req, res) => {
    const { id } = req.params;

    if (!id) {
        return res.status(400).json({ message: "Vui lòng cung cấp mã đặt sân!" });
    }

    try {
        // SQL Join 3 bảng để tìm STK của chủ sân
        const sql = `
            SELECT 
                l.MaDatSan,
                l.TongTien,
                u.stk as SoTaiKhoan,
                u.HoTen as ChuTaiKhoan,
                u.bank as NganHang 
            FROM lichdatsan l
            JOIN sanbong s ON l.MaSan = s.MaSan
            JOIN user u ON s.MaNguoiDung = u.MaNguoiDung 
            WHERE l.MaDatSan = ?
        `;

        const [rows] = await db.query(sql, [id]);

        if (rows.length === 0) {
            return res.status(404).json({ message: "Không tìm thấy thông tin đơn hàng hoặc chủ sân!" });
        }

        const data = rows[0];

        const paymentData = {
            nganHang: data.NganHang,
            soTaiKhoan: data.SoTaiKhoan, 
            chuTaiKhoan: data.ChuTaiKhoan
        };

        res.status(200).json({
            message: "Lấy thông tin thanh toán thành công",
            data: paymentData
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Lỗi Server" });
    }
};

exports.putBookingStatus = async (req, res) => {
    const { id } = req.params;
    
    const { TrangThai } = req.body;

    if ( !TrangThai )
        return res.status(400).json({message: "Gửi sai biến FE ơi!"});

    const validStatus = ['daxacnhan', 'chuaxacnhan', 'dahuy'];
        if (!validStatus.includes(TrangThai)) {
            return res.status(400).json({ message: "Trạng thái không hợp lệ!" });
        }

    try {
        const sql = `UPDATE lichdatsan SET TrangThai = ? WHERE MaDatSan = ?`;

        const [result] = await db.query(sql, [TrangThai, id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ 
                message: "Không tìm thấy đơn đặt sân hoặc trạng thái không thay đổi!" 
            });
        }

        res.status(200).json({
            message: "Cập nhật trạng thái thành công!",
            id,
            TrangThai
        });
    } catch(err) {
        console.error(err);
        res.status(500).json({message: "Lỗi Server!"});
    }
}