const db = require('../db'); 

exports.putUserProfile = async (req, res) => {
    const { id } = req.params;
    // Đổi tên biến nhận vào từ body
    const { HoTen, email, sdt, bank, stk } = req.body;

    // 1. Validate cơ bản
    if (!HoTen || !email || !sdt) {
        return res.status(400).json({
            message: "Vui lòng điền đầy đủ thông tin: Họ tên, Email và SĐT"
        });
    }

    try {
        // 2. Check Role user hiện tại
        const [users] = await db.query(`SELECT quyen FROM User WHERE MaNguoiDung = ?`, [id]);

        if (users.length === 0) {
            return res.status(404).json({ message: "Không tìm thấy người dùng!" });
        }

        const currentUser = users[0];
        const isOwner = currentUser.quyen === 'chusan'; 

        // 3. Validate riêng cho Owner
        if (isOwner) {
            if (!bank || !stk) {
                return res.status(400).json({
                    message: "Chủ sân vui lòng điền đầy đủ Tên ngân hàng và Số tài khoản!"
                });
            }
        }

        // 4. Chuẩn bị câu SQL động
        let sql = `UPDATE User SET HoTen = ?, email = ?, sdt = ?`;
        let params = [HoTen, email, sdt];

        // Nếu là Owner thì update thêm bank và stk
        if (isOwner) {
            // Giả định tên cột trong DB cũng là 'bank' và 'stk'
            sql += `, bank = ?, stk = ?`; 
            params.push(bank, stk);
        }

        sql += ` WHERE MaNguoiDung = ?`;
        params.push(id);

        // 5. Thực thi
        await db.execute(sql, params);

        // Chuẩn bị data trả về
        let updatedInfo = { id, HoTen, email, sdt };
        if (isOwner) {
            updatedInfo.bank = bank;
            updatedInfo.stk = stk;
        }

        res.status(200).json({
            message: "Cập nhật thông tin thành công!",
            role: currentUser.VaiTro,
            updatedInfo: updatedInfo
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
            SELECT MaNguoiDung, username, HoTen, email, sdt, quyen 
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