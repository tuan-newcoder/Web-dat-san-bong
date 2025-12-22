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

        sql += ` WHERE s.TrangThai = 'hoatdong'`;

        if (LoaiSan) {
            sql += ` AND LoaiSan = ? `;
            params.push(LoaiSan);
        }

        if (DiaChi) {
            sql += ` AND s.DiaChi LIKE ? `;
            params.push(`%${DiaChi}%`);
        }

        if (CaThue) {
            sql += `AND Ca = ? AND c.TrangThai = 'controng' `;
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

    const { TenSan, LoaiSan, DiaChi, Phuong, TrangThai } = req.body;

    if (!TenSan || !LoaiSan || !DiaChi || !Phuong || !TrangThai) {
        return res.status(400).json({
            message: 'Vui lòng nhập đầy đủ thông tin: Tên sân, Loại sân, Địa chỉ, Trạng thái'
        });
    }

    const validLoaiSan = ['Sân 5', 'Sân 7', 'Sân 11']; // Ví dụ danh sách loại sân
    if (!validLoaiSan.includes(String(LoaiSan))) {
         return res.status(400).json({ message: 'Loại sân không hợp lệ (chỉ chấp nhận 5, 7, 11)' });
    }

    const validPhuong = ['Bách Khoa', 'Trung Hòa', 'Kim Giang', 'Phương Liệt', 'Thanh Xuân', 'Thanh Lương', 
                        'Trương Định', 'Hoàng Văn Thụ', 'Minh Khai', 'Mai Động', 'Hoàng Văn Thụ', 'Tương Mai', 'Yên Sở']; 
    if (!validPhuong.includes(String(Phuong))) {
         return res.status(400).json({ message: 'Phường không hợp lệ ' });
    }

    const validTrangThai = ['hoatdong', 'baotri']; // Ví dụ trạng thái
    if (!validTrangThai.includes(TrangThai)) {
         return res.status(400).json({ message: 'Trạng thái không hợp lệ!' });
    }

    try {
        const [result] = await db.execute(
            `UPDATE sanbong SET TenSan = ?, LoaiSan = ?, DiaChi = ?, Phuong = ?, TrangThai = ? WHERE MaSan = ?`, 
            [TenSan, LoaiSan, DiaChi, Phuong, TrangThai, id]    
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
                Phuong,
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

exports.createField = async (req, res) => {
    const { TenSan, LoaiSan, DiaChi, Phuong, TrangThai } = req.body;

    // 1. Validate dữ liệu đầu vào (giống hệt hàm PUT)
    if (!TenSan || !LoaiSan || !DiaChi || !Phuong || !TrangThai) {
        return res.status(400).json({
            message: 'Vui lòng nhập đầy đủ thông tin: Tên sân, Loại sân, Địa chỉ, Phường, Trạng thái'
        });
    }

    const validLoaiSan = ['Sân 5', 'Sân 7', 'Sân 11'];
    if (!validLoaiSan.includes(String(LoaiSan))) {
         return res.status(400).json({ message: 'Loại sân không hợp lệ (chỉ chấp nhận Sân 5, Sân 7, Sân 11)' });
    }

    /*
    const validPhuong ---------------------------------------------------------------------------------------------------------
    */

    const validTrangThai = ['hoatdong', 'baotri'];
    if (!validTrangThai.includes(TrangThai)) {
         return res.status(400).json({ message: 'Trạng thái không hợp lệ!' });
    }

    try {
        // 2. Thực hiện câu lệnh INSERT
        // Lưu ý: Không cần truyền MaSan (id) vì trong DB thường để Auto Increment
        const [result] = await db.execute(
            `INSERT INTO sanbong (TenSan, LoaiSan, DiaChi, Phuong, TrangThai) VALUES (?, ?, ?, ?, ?)`, 
            [TenSan, LoaiSan, DiaChi, Phuong, TrangThai]    
        );

        // 3. Trả về kết quả thành công
        res.status(201).json({ // 201 Created
            message: "Thêm sân bóng thành công!",
            newField: {
                id: result.insertId, // Lấy ID vừa được database tự sinh ra
                TenSan,
                LoaiSan,
                DiaChi,
                Phuong,
                TrangThai
            }
        });

    } catch (err) {
        console.error("Lỗi Create Field: ", err);

        // Bắt lỗi trùng tên (nếu cột TenSan có ràng buộc UNIQUE)
        if (err.code === 'ER_DUP_ENTRY') {
             return res.status(409).json({ message: "Tên sân này đã tồn tại!" });
        }

        res.status(500).json({ message: "Lỗi Server nội bộ" });
    }
};

exports.deleteField = async (req, res) => {
    const { id } = req.params;

    if (!id) {
        return res.status(400).json({ message: "Vui lòng cung cấp ID sân cần xóa!" });
    }

    try {
        const [result] = await db.execute(
            `DELETE FROM sanbong WHERE MaSan = ?`, 
            [id]
        );

        // Kiểm tra xem có dòng nào bị xóa không
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Không tìm thấy sân để xóa!'});
        }

        res.status(200).json({
            message: "Đã xóa sân bóng thành công!",
            deletedId: id
        });

    } catch (err) {
        console.error("Lỗi Delete Field: ", err);

        // *** QUAN TRỌNG: Bắt lỗi ràng buộc khóa ngoại ***
        // Mã lỗi 1451 hoặc ER_ROW_IS_REFERENCED_2: Xảy ra khi sân này đã có lịch đặt (Bookings)
        // Không thể xóa sân cứng (Hard Delete) vì sẽ làm mất dữ liệu lịch sử đặt sân.
        if (err.code === 'ER_ROW_IS_REFERENCED_2' || err.code === 'ER_ROW_IS_REFERENCED') {
             return res.status(409).json({ 
                 message: "Không thể xóa sân này vì đã có lịch đặt sân liên quan. Hãy thử chuyển trạng thái sang 'Bảo trì' hoặc 'Ngừng hoạt động'." 
             });
        }

        res.status(500).json({ message: "Lỗi Server nội bộ" });
    }
};