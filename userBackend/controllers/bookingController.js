const db = require('../db');

exports.createBooking = async (req, res) => {
    const { maCaThue } = req.body; 
    const maNguoiDung = req.user.id; 

    if (!maCaThue) return res.status(400).json({ message: "Thiếu mã ca thuê!" });

    const connection = await db.getConnection(); 

    try {
        await connection.beginTransaction();

        const [shifts] = await connection.query(
            "SELECT * FROM CaThueSan WHERE MaCaThue = ? AND TrangThai = 'controng' FOR UPDATE", 
            [maCaThue]
        );

        if (shifts.length === 0) {
            await connection.rollback();
            return res.status(409).json({ message: "Ca này không tồn tại hoặc đã bị đặt!" });
        }

        const caThue = shifts[0];

        const insertSql = `
            INSERT INTO LichDatSan (MaNguoiDung, MaCaThue, TrangThai)
            VALUES (?, ?, 'chuaxacnhan')
        `;
        const [result] = await connection.query(insertSql, [maNguoiDung, maCaThue]);
        const maDatSan = result.insertId;

        await connection.query("UPDATE CaThueSan SET TrangThai = 'dadat' WHERE MaCaThue = ?", [maCaThue]);
        
        const insertBillSql = `
            INSERT INTO HoaDon (MaDatSan, TongTien, TrangThai)
            VALUES (?, ?, 'chuathanhtoan')
        `;
        await connection.query(insertBillSql, [maDatSan, caThue.Gia]);

        await connection.commit();
        res.status(201).json({ message: "Đặt sân thành công!", maDatSan });

    } catch (err) {
        await connection.rollback();
        console.error(err);
        res.status(500).json({ message: "Lỗi đặt sân" });
    } finally {
        connection.release();
    }
};

exports.getUserBookings = async (req, res) => {
    const maNguoiDung = req.user.id; 
    try {
        const sql = `
            SELECT 
                l.MaDatSan, l.TrangThai as TrangThaiDat,
                c.Ngay, c.GioBD, c.GioKT, c.Gia,
                s.TenSan, s.DiaChi,
                h.MaHoaDon, h.TrangThai as TrangThaiThanhToan
            FROM LichDatSan l
            JOIN CaThueSan c ON l.MaCaThue = c.MaCaThue
            JOIN SanBong s ON c.MaSan = s.MaSan
            LEFT JOIN HoaDon h ON l.MaDatSan = h.MaDatSan
            WHERE l.MaNguoiDung = ?
            ORDER BY c.Ngay DESC
        `;
        const [rows] = await db.query(sql, [maNguoiDung]);
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Lỗi lấy lịch sử" });
    }
};

exports.processPayment = async (req, res) => {
    const { maHoaDon } = req.body;
    
    try {
        const [result] = await db.query(
            "UPDATE HoaDon SET TrangThai = 'dathanhtoan' WHERE MaHoaDon = ?", 
            [maHoaDon]
        );
        
        if (result.affectedRows === 0) return res.status(404).json({message: "Không tìm thấy hóa đơn"});

        const [bill] = await db.query("SELECT MaDatSan FROM HoaDon WHERE MaHoaDon = ?", [maHoaDon]);
        if(bill.length > 0) {
             await db.query("UPDATE LichDatSan SET TrangThai = 'daxacnhan' WHERE MaDatSan = ?", [bill[0].MaDatSan]);
        }

        res.json({ message: "Thanh toán thành công!" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Lỗi thanh toán" });
    }
};