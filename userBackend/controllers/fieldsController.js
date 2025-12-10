const db = require('../db');

exports.getFields = async (req, res) => {
    const { Address } = req.query;
    try {
        let sql = "SELECT * FROM sanbong WHERE TrangThai = 'hoatdong' ";
        let params = [];

        if (Address) {
            sql += "AND DiaChi LIKE ?";
            params.push(`%${Address}%`);
        }

        const [fields] = await db.query(sql, params);
        res.json(fields); 
    } catch (err) {
        console.error(err);
        res.status(500).json({message: "Lỗi lấy danh sách sân!"});
    }
};

exports.getFieldDetails = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM sanbong WHERE MaSan = ?', [req.params.id]);
        if (rows.length === 0) return res.status(404).json({message: "Không tìm thấy sân!"});
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ message: "Lỗi server" });
    }
};

exports.getShiftByDate = async (req, res) => {
    const { fieldID, date } = req.query;

    if (!fieldID || !date) return res.status(400).json({message: "Thiếu mã sân"});

    try {
        const sql = `
            SELECT * FROM cathuesan
            WHERE MaSan = ? AND Ngay = ? AND TrangThai = 'controng'
        `;
        const [shifts] = await db.query(sql, [fieldID, date]);
        res.json(shifts);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Lỗi lấy danh sách ca" });
    }
};