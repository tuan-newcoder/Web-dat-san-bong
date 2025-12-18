const db = require('../db'); 

exports.updateUserProfile = async (req, res) => {
    const { id } = req.params; 

    const { HoTen, email, sdt } = req.body;

    if (!HoTen || !email || !sdt) {
        return res.status(400).json({ 
            message: "Vui lòng điền đầy đủ thông tin: Họ tên, Email và SĐT" 
        });
    }

    try {
        const [result] = await db.execute(
            `UPDATE User SET HoTen = ?, email = ?, sdt = ? WHERE MaNguoiDung = ?`,
            [HoTen, email, sdt, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Không tìm thấy người dùng!" });
        }

        res.status(200).json({
            message: "Cập nhật thông tin thành công!",
            updatedInfo: {
                id: id,
                HoTen: HoTen,
                email: email,
                sdt: sdt
            }
        });

    } catch (err) {
        console.error("Lỗi User Controller:", err);

        if (err.code === 'ER_DUP_ENTRY') {
             return res.status(409).json({ message: "Email hoặc SĐT này đã được sử dụng bởi tài khoản khác!" });
        }

        res.status(500).json({ message: "Lỗi Server nội bộ" });
    }
};