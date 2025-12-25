const db = require('../db');

// GET  /api/admin/users                                                                                                                                                                                                                                                                                                                                                                                                                                                               
exports.getAllUsers = async (req, res) => {
    try {
        const sql = `SELECT MaNguoiDung, HoTen, username, email, sdt, quyen, bank, stk FROM User`;
        const [users] = await db.query(sql);
        res.status(200).json({ data: users });
    } catch (err) {
        res.status(500).json({ message: "Lỗi Server" });
    }
};

// PUT /api/admin/role/:id
exports.updateUserRole = async (req, res) => {
    const userId = req.params.id; 
    
    // Theo yêu cầu: Input chỉ có userId trên URL, logic cố định role = 'chusan'
    // Tuy nhiên, nếu bạn muốn linh hoạt, tôi sẽ để mặc định là 'chusan'
    const newRole = 'chusan'; 

    try {
        const sql = `UPDATE User SET quyen = ? WHERE MaNguoiDung = ?`;
        const [result] = await db.query(sql, [newRole, userId]);

        if (result.affectedRows === 0) return res.status(404).json({ message: "Không tìm thấy User" });

        res.status(200).json({ message: `Đã cập nhật User ${userId} lên quyền Chủ sân` });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Lỗi Server" });
    }
};