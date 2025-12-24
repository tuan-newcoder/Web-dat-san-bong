const express = require('express');
const cors = require('cors');

// 1. Import Config (Kết nối Database & Lấy biến môi trường)
// Đảm bảo file config/index.js của bạn đã trỏ đúng file .env ở root
const { config } = require('./config/index');

// 2. Import Routes của Huy
const fieldOwnerRoutes = require('./routes/fieldOwnerRoutes'); // Quản lý sân
const adminRoutes = require('./routes/adminRoutes');           // Quản lý duyệt & User

const app = express();

// 3. Middleware cơ bản
app.use(cors()); // Cho phép gọi API từ bên ngoài
app.use(express.json()); // Đọc dữ liệu JSON từ body request
app.use(express.urlencoded({ extended: true })); // Đọc dữ liệu form

// 4. Đăng ký Routes
// Lưu ý: Mình đặt prefix rõ ràng để dễ test

// --- API CHỦ SÂN (OWNER) ---
// Test: POST http://localhost:3000/api/owner/fields
app.use('/api/owner/fields', fieldOwnerRoutes);

// --- API QUẢN TRỊ (ADMIN) ---
// Test: PUT http://localhost:3000/api/admin/uprole/1/approve
app.use('/api/admin', adminRoutes);

// 5. Route mặc định để kiểm tra server sống hay chết
app.get('/', (req, res) => {
    res.send('✅ Server riêng của Huy (Admin & Owner) đang chạy ngon lành!');
});

// 6. Xử lý lỗi 404 (Không tìm thấy API)
app.use((req, res, next) => {
    res.status(404).json({
        message: 'API không tồn tại trong server của Huy!',
        path: req.originalUrl
    });
});

// 7. Khởi chạy Server
// Lưu ý: Nếu muốn tránh trùng Port với Vũ (3000), bạn có thể sửa thành 3001 ở đây
const PORT = config.PORT || 3000; 

app.listen(PORT, () => {
    console.log(`=================================================`);
    console.log(`🛠️  Server TEST của Huy đang chạy tại: http://localhost:${PORT}`);
    console.log(`🔌  Database Host: ${config.db.host}`);
    console.log(`📝  API Owner: http://localhost:${PORT}/api/owner/fields`);
    console.log(`🛡️  API Admin: http://localhost:${PORT}/api/admin`);
    console.log(`=================================================`);
});