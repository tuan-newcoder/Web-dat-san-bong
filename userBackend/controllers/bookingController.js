const db = require('../db');

/*
exports.createBooking = async (req, res) => {
    const { maNguoiDung, maSan, ngay, ca } = req.body;

    // 1. Validate dữ liệu
    if (!maNguoiDung || !maSan || !ngay || !ca ) {
        return res.status(400).json({ message: "Thiếu thông tin đặt sân!" });
    }

    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

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
*/

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

/*
exports.getPaymentInfo = async (req, res) => {
    const { id } = req.params;

    if (!id) {
        return res.status(400).json({ message: "Vui lòng cung cấp mã sân!" });
    }

    try {
        // SQL Join 3 bảng để tìm STK của chủ sân
        const sql = `
            SELECT 
                l.MaDatSan,
                l.TongTien,
                u.stk as SoTaiKhoan,
                u.HoTen as ChuTaiKhoan,
                u.bank as NganHang,
                s.Gia as TongTien
            FROM lichdatsan l
            JOIN sanbong s ON l.MaSan = s.MaSan
            JOIN user u ON s.MaNguoiDung = u.MaNguoiDung 
            WHERE l.MaSan = ?
        `;

        const [rows] = await db.query(sql, [id]);

        if (rows.length === 0) {
            return res.status(404).json({ message: "Không tìm thấy thông tin đơn hàng hoặc chủ sân!" });
        }

        const data = rows[0];

        const paymentData = {
            nganHang: data.NganHang,
            soTaiKhoan: data.SoTaiKhoan, 
            chuTaiKhoan: data.ChuTaiKhoan,
            tongTien: data.TongTien
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
*/

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

exports.createBookingAndGetPayment = async (req, res) => {
    const { maNguoiDung, maSan, ngay, ca } = req.body;

    // 1. Validate cơ bản
    if (!maNguoiDung || !maSan || !ngay || !ca) {
        return res.status(400).json({ message: "Thiếu thông tin đặt sân!" });
    }

    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        // BƯỚC 1: Lấy thông tin giá và chủ sân TRƯỚC (để lấy STK trả về sau này)
        // Chúng ta lấy luôn từ bảng sanbong và user, không cần chờ bảng lichdatsan
        const infoSql = `
            SELECT 
                s.Gia, 
                u.stk as SoTaiKhoan, 
                u.HoTen as ChuTaiKhoan, 
                u.bank as NganHang
            FROM sanbong s
            JOIN user u ON s.MaNguoiDung = u.MaNguoiDung
            WHERE s.MaSan = ?
        `;
        const [infoRows] = await connection.query(infoSql, [maSan]);

        if (infoRows.length === 0) {
            throw new Error("Sân không tồn tại hoặc lỗi dữ liệu chủ sân");
        }
        
        const sanInfo = infoRows[0]; // Chứa Giá, STK, Ngân hàng

        // BƯỚC 2: Insert vào lịch đặt sân
        const insertSql = `
            INSERT INTO lichdatsan (MaNguoiDung, MaSan, Ca, Ngay, TongTien, TrangThai) 
            VALUES (?, ?, ?, ?, ?, 'chuaxacnhan')
        `;
        
        const [result] = await connection.query(insertSql, [
            maNguoiDung, 
            maSan, 
            ca, 
            ngay, 
            sanInfo.Gia // Dùng giá vừa lấy được ở bước 1
        ]);

        await connection.commit();

        // BƯỚC 3: Trả về kết quả GỘP (Booking ID + Payment Info)
        const responseData = {
            message: "Đặt sân thành công!",
            bookingId: result.insertId,
            bookingDetails: {
                maNguoiDung,
                maSan,
                ngay,
                ca,
                status: 'chuaxacnhan'
            },
            paymentInfo: {
                nganHang: sanInfo.NganHang,
                soTaiKhoan: sanInfo.SoTaiKhoan,
                chuTaiKhoan: sanInfo.ChuTaiKhoan,
                tongTien: sanInfo.Gia,
                noiDungChuyenKhoan: `DAT SAN ${result.insertId}` 
            }
        };

        res.status(201).json(responseData);

    } catch (err) {
        await connection.rollback();
        console.error("Lỗi đặt sân:", err);
        res.status(500).json({ message: err.message || "Lỗi Server" });
    } finally {
        connection.release();
    }
};