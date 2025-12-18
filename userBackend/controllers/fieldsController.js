const db = require('../db');

exports.getFields = async (req, res) => {
    try {
        let sql = "SELECT * FROM sanbong WHERE TrangThai = 'hoatdong' ";

        const [fields] = await db.query(sql);
        res.status(200).json(fields); 
    } catch (err) {
        console.error(err);
        res.status(500).json({message: "Lỗi lấy danh sách sân!"});
    }
};

exports.getFieldDetails = async (req, res) => {
    const { id } = req.params;

    try {
        const [rows] = await db.query('SELECT * FROM sanbong WHERE MaSan = ?', [id]);
        if (rows.length === 0) return res.status(404).json({message: "Không tìm thấy sân!"});
        res.status(200).json(rows[0]);
    } catch (err) {
        res.status(500).json({ message: "Lỗi server" });
    }
};

exports.getFieldSearch = async (req, res) => {
    const { LoaiSan, CaThue, DiaChi } = req.query;

    try {
        let sql = `SELECT DISTINCT s.* FROM sanbong s `;
        let params = [];
        let join = false;

        if (CaThue) {
            sql += ` JOIN cathuesan c ON s.MaSan = c.Masan`
            join = true;
        }

        sql += ` WHERE TrangThai = 'hoatdong'`;

        if (LoaiSan) {
            sql += ` AND LoaiSan = ? `;
            params.push(LoaiSan);
        }

        if (DiaChi) {
            sql += ` AND s.DiaChi LIKE ? `;
            params.push(`%${DiaChi}%`);
        }

        if (CaThue) {
            sql += `AND Cathue = ?`;
            params.push(CaThue);
        }

        const [result] = await db.query(sql, params);

        res.status(200).json({
            message: "Tìm kiếm thành công",
            count: result.length,
            data: result
        });

    } catch (err) {
        console.error("Lỗi tìm kiếm sân:", err);
        return res.status(500).json({message: "Lỗi server khi tìm kiếm sân"})
    }
};

exports.putFieldsDetails = async (req, res) => {
    const { id } = req.params;

    const { TenSan, LoaiSan, DiaChi, TrangThai } = req.body;

    if (!TenSan || !LoaiSan || !DiaChi || !TrangThai) {
        return res.status(400).json({
            message: 'Vui lòng nhập đầy đủ thông tin: Tên sân, Loại sân, Địa chỉ, Trạng thái'
        });
    }

    const validLoaiSan = ['Sân 5', 'Sân 7', 'Sân 11']; // Ví dụ danh sách loại sân
    if (!validLoaiSan.includes(String(LoaiSan))) {
         return res.status(400).json({ message: 'Loại sân không hợp lệ (chỉ chấp nhận 5, 7, 11)' });
    }

    const validTrangThai = ['hoatdong', 'baotri']; // Ví dụ trạng thái
    if (!validTrangThai.includes(TrangThai)) {
         return res.status(400).json({ message: 'Trạng thái không hợp lệ!' });
    }

    try {
        const [result] = await db.execute(
            `UPDATE sanbong SET TenSan = ?, LoaiSan = ?, DiaChi = ?, TrangThai = ? WHERE MaSan = ?`, 
            [TenSan, LoaiSan, DiaChi, TrangThai, id]    
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Không tìm thấy sân!'});
        }

        res.status(200).json({
            message: "Cập nhật thông tin sân thành công!",
            updatedInfo: {
                id,
                TenSan,
                LoaiSan,
                DiaChi,
                TrangThai
            }
        })
    } catch (err) {
        console.error("Lỗi Fields Controller: ", err);

        if (err.code === 'ER_DUP_ENTRY') {
             return res.status(409).json({ message: "Tên sân này đã tồn tại!" });
        }

        res.status(500).json({ message: "Lỗi Server nội bộ" });
    }
}

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