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
    // 1. Lấy dữ liệu từ query (GET) hoặc body (POST)
    // Thường tìm kiếm thì nên dùng req.query, nhưng req.body vẫn được nếu dùng POST
    const { Ca, Ngay } = req.query; 

    try {
        let params = [];
        
        // Câu lệnh SQL gốc: Lấy tất cả sân đang hoạt động
        let sql = `SELECT s.* FROM sanbong s WHERE s.TrangThai = 'hoatdong'`;

        // Nếu khách chọn Ngày và Ca, ta cần loại bỏ những sân ĐÃ CÓ người đặt
        if (Ngay && Ca) {
            sql += ` 
                AND NOT EXISTS (
                    SELECT 1 FROM lichdatsan l 
                    WHERE l.MaSan = s.MaSan 
                    AND l.Ngay = ? 
                    AND l.Ca = ? 
                    AND l.TrangThai IN ('daxacnhan', 'chuaxacnhan')
                )
            `;
            // Push tham số vào theo đúng thứ tự dấu ?
            params.push(Ngay);
            params.push(Ca);
        }

        // Thực thi query
        const [result] = await db.query(sql, params);

        return res.status(200).json({
            message: "Tìm kiếm thành công",
            count: result.length,
            data: result
        });

    } catch (err) {
        console.error("Lỗi tìm kiếm sân:", err);
        return res.status(500).json({
            message: "Lỗi server khi tìm kiếm sân"
        });
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

    /* Check dữ liệu gửi về, có thể không dùng
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
    */

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
    const { TenSan, LoaiSan, DiaChi, Phuong } = req.body;

    /* CHECK Dữ liệu gửi về, có thể không dùng
        if (!TenSan || !LoaiSan || !DiaChi || !Phuong || !TrangThai) {
        return res.status(400).json({
            message: 'Vui lòng nhập đầy đủ thông tin: Tên sân, Loại sân, Địa chỉ, Phường'
        });
    }

    const validLoaiSan = ['Sân 5', 'Sân 7', 'Sân 11'];
    if (!validLoaiSan.includes(String(LoaiSan))) {
         return res.status(400).json({ message: 'Loại sân không hợp lệ (chỉ chấp nhận Sân 5, Sân 7, Sân 11)' });
    }

    const validPhuong = ['Bách Khoa', 'Trung Hòa', 'Kim Giang', 'Phương Liệt', 'Thanh Xuân', 'Thanh Lương', 
                        'Trương Định', 'Hoàng Văn Thụ', 'Minh Khai', 'Mai Động', 'Hoàng Văn Thụ', 'Tương Mai', 'Yên Sở']; 
    if (!validPhuong.includes(String(Phuong))) {
         return res.status(400).json({ message: 'Phường không hợp lệ ' });
    }
    */

    try {
        // 2. Thực hiện câu lệnh INSERT
        // Lưu ý: Không cần truyền MaSan (id) vì trong DB thường để Auto Increment
        const [result] = await db.execute(
            `INSERT INTO sanbong (TenSan, LoaiSan, DiaChi, Phuong) VALUES (?, ?, ?, ?)`, 
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
                Phuong
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

    if (!id) return res.status(400).json({ message: "Thiếu ID sân!" });

    try {
        // --- THAY ĐỔI TỪ ĐÂY ---
        // Thay vì xóa, ta chuyển trạng thái sang 'ngunghoatdong'
        const sql = `UPDATE sanbong SET TrangThai = 'ngunghoatdong' WHERE MaSan = ?`;
        
        const [result] = await db.execute(sql, [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Không tìm thấy sân!'});
        }

        res.status(200).json({
            message: "Đã xóa sân thành công (Chuyển sang ngừng hoạt động)!",
            deletedId: id
        });
        // --- KẾT THÚC THAY ĐỔI ---

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Lỗi Server" });
    }
};

