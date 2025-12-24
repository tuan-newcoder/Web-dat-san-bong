const db = require('../db'); 

exports.putUserProfile = async (req, res) => {
    const { id } = req.params;
    // Nhận tất cả thông tin từ body, bao gồm bank và stk
    const { HoTen, email, sdt, bank, stk } = req.body;

    // 1. Validate các trường bắt buộc (Họ tên, Email, SĐT)
    if (!HoTen || !email || !sdt) {
        return res.status(400).json({
            message: "Vui lòng điền đầy đủ thông tin: Họ tên, Email và SĐT"
        });
    }

    try {
        const [users] = await db.query(`SELECT MaNguoiDung FROM User WHERE MaNguoiDung = ?`, [id]);

        if (users.length === 0) {
            return res.status(404).json({ message: "Không tìm thấy người dùng!" });
        }

        const sql = `UPDATE User SET HoTen = ?, email = ?, sdt = ?, bank = ?, stk = ? WHERE MaNguoiDung = ?`;
        
        const params = [HoTen, email, sdt, bank || null, stk || null, id];

        await db.execute(sql, params);

        res.status(200).json({
            message: "Cập nhật thông tin thành công!",
            updatedInfo: { 
                id, 
                HoTen, 
                email, 
                sdt, 
                bank, 
                stk 
            }
        });

    } catch (err) {
        console.error("Lỗi User Controller:", err);

        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: "Email hoặc SĐT đã tồn tại!" });
        }

        res.status(500).json({ message: "Lỗi Server nội bộ" });
    }
};

exports.getUserById = async (req, res) => {
    const { id } = req.params;

    if (!id) {
        return res.status(400).json({ message: "Thiếu ID người dùng!" });
    }

    try {
        const sql = `
            SELECT MaNguoiDung, username, HoTen, email, sdt, quyen, stk, bank 
            FROM user 
            WHERE MaNguoiDung = ?
        `;

        const [rows] = await db.query(sql, [id]);

        // Kiểm tra xem có tìm thấy user không
        if (rows.length === 0) {
            return res.status(404).json({ message: "Người dùng không tồn tại!" });
        }

        // Trả về kết quả
        res.status(200).json({
            message: "Lấy thông tin thành công",
            data: rows[0]
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Lỗi Server!" });
    }
};