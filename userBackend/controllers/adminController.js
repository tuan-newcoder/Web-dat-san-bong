const db = require('../db');
const moment = require('moment');

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

exports.getDashboardStats = async (req, res) => {
    const userId = req.user.id;

    try {
        // --- CHUẨN BỊ CÁC CÂU QUERY (Chạy song song bằng Promise.all) ---

        // 1. Query Thống kê tổng quan (4 cái thẻ trên cùng)
        // Logic: Lấy dữ liệu của Tháng này và Ngày hôm nay
        const overviewSql = `
            SELECT 
                -- Doanh thu hôm nay (Chỉ tính đơn đã xác nhận)
                COALESCE(SUM(CASE 
                    WHEN DATE(l.Ngay) = CURDATE() AND l.TrangThai = 'daxacnhan' THEN l.TongTien 
                    ELSE 0 END), 0) as DoanhThuHomNay,
                
                -- Tổng lượt đặt trong tháng này (Tất cả trạng thái)
                COUNT(CASE 
                    WHEN MONTH(l.Ngay) = MONTH(CURDATE()) AND YEAR(l.Ngay) = YEAR(CURDATE()) THEN 1 
                    END) as TongLuotDatThang,

                -- Lợi nhuận (Doanh thu) tháng này (Chỉ tính đơn đã xác nhận)
                COALESCE(SUM(CASE 
                    WHEN MONTH(l.Ngay) = MONTH(CURDATE()) AND YEAR(l.Ngay) = YEAR(CURDATE()) AND l.TrangThai = 'daxacnhan' THEN l.TongTien 
                    ELSE 0 END), 0) as LoiNhuanThang,

                -- Số lượt hủy trong tháng (Để tính %)
                COUNT(CASE 
                    WHEN MONTH(l.Ngay) = MONTH(CURDATE()) AND YEAR(l.Ngay) = YEAR(CURDATE()) AND l.TrangThai = 'dahuy' THEN 1 
                    END) as SoLuotHuyThang
            FROM LichDatSan l
            JOIN SanBong s ON l.MaSan = s.MaSan
            WHERE s.MaNguoiDung = ?
        `;

        // 2. Query Biểu đồ tròn (Tỷ trọng loại sân)
        // Giả sử bảng SanBong có cột 'LoaiSan' (Ví dụ: 'Sân 5', 'Sân 7')
        const pieChartSql = `
            SELECT s.LoaiSan, COUNT(l.MaDatSan) as SoLuot
            FROM LichDatSan l
            JOIN SanBong s ON l.MaSan = s.MaSan
            WHERE s.MaNguoiDung = ? AND l.TrangThai = 'daxacnhan'
            GROUP BY s.LoaiSan
        `;

        // 3. Query Biểu đồ Doanh thu 7 ngày (Dùng lại logic cũ)
        const lineChartSql = `
            SELECT DATE_FORMAT(l.Ngay, '%Y-%m-%d') as NgayStr, SUM(l.TongTien) as TongTien
            FROM LichDatSan l
            JOIN SanBong s ON l.MaSan = s.MaSan
            WHERE s.MaNguoiDung = ? 
            AND l.TrangThai = 'daxacnhan'
            AND l.Ngay >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)
            GROUP BY NgayStr ORDER BY NgayStr ASC
        `;

        // --- THỰC THI QUERY (Promise.all để tối ưu tốc độ) ---
        const [
            [overviewRows],
            [pieRows],
            [lineRows]
        ] = await Promise.all([
            db.query(overviewSql, [userId]),
            db.query(pieChartSql, [userId]),
            db.query(lineChartSql, [userId])
        ]);

        const stats = overviewRows[0]; // Kết quả query 1 chỉ có 1 dòng

        // --- XỬ LÝ SỐ LIỆU (Tính toán logic JS) ---

        // A. Xử lý Tỷ lệ hủy sân (%)
        // Công thức: (Số lượt hủy / Tổng lượt đặt) * 100
        let tyleHuy = 0;
        if (stats.TongLuotDatThang > 0) {
            tyleHuy = (stats.SoLuotHuyThang / stats.TongLuotDatThang) * 100;
        }

        // B. Xử lý Biểu đồ 7 ngày (Lấp đầy ngày trống - Zero filling)
        const revenueChartData = [];
        for (let i = 6; i >= 0; i--) {
            const d = moment().subtract(i, 'days');
            const dateKey = d.format('YYYY-MM-DD');
            const label = d.format('dddd'); // Thứ 2, Thứ 3... (Cần config locale vi nếu muốn tiếng Việt)
            
            const found = lineRows.find(row => row.NgayStr === dateKey);
            
            revenueChartData.push({
                date: dateKey,
                dayName: convertDayToVN(d.day()), // Hàm tự viết để ra Thứ 2, CN
                revenue: found ? Number(found.TongTien) : 0
            });
        }

        // C. Xử lý Biểu đồ tròn (Format data cho đẹp)
        const typeChartData = pieRows.map(row => ({
            name: row.LoaiSan || "Khác", // Sân 5, Sân 7...
            value: row.SoLuot
        }));

        // --- TRẢ VỀ KẾT QUẢ CUỐI CÙNG ---
        res.status(200).json({
            message: "Lấy dữ liệu Dashboard thành công",
            data: {
                cards: {
                    doanhThuHomNay: Number(stats.DoanhThuHomNay),
                    tongLuotDatThang: Number(stats.TongLuotDatThang),
                    loiNhuanThang: Number(stats.LoiNhuanThang),
                    tyLeHuy: parseFloat(tyleHuy.toFixed(1)) // Làm tròn 1 số thập phân (VD: 3.5)
                },
                revenueChart: revenueChartData,
                typeChart: typeChartData
            }
        });

    } catch (err) {
        console.error("Dashboard Error:", err);
        res.status(500).json({ message: "Lỗi Server khi lấy thống kê" });
    }
};

// Hàm phụ trợ chuyển đổi thứ sang Tiếng Việt (đỡ phải config locale moment)
function convertDayToVN(dayIndex) {
    const days = ['CN', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
    return days[dayIndex];
}