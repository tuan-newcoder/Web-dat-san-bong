const db = require('../db');

exports.getBookedSlots = async (req, res) => {
    const { id } = req.params;

    try {
        // Truy vấn lấy danh sách các ca ĐÃ ĐẶT (TrangThai = 'dadat' hoặc tương tự)
        // Lưu ý: Dùng DATE_FORMAT để frontend dễ xử lý chuỗi ngày
        const sql = `
            SELECT 
                DATE_FORMAT(Ngay, '%Y-%m-%d') as Ngay, 
                Ca 
            FROM cathuesan
            WHERE MaSan = ? 
              AND Ngay BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 7 DAY)
              AND TrangThai = 'dadat' 
        `;

        const [bookedSlots] = await db.query(sql, [id]);

        // Kết quả trả về sẽ dạng mảng:
        // [{ Ngay: '2025-12-22', Ca: 1 }, { Ngay: '2025-12-22', Ca: 3 }, ...]
        res.status(200).json({
            message: "Lấy dữ liệu thành công",
            data: bookedSlots
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Lỗi server" });
    }
};



