const express = require('express');
const cors = require('cors');
const path = require('path');
const { config } = require('./config/index'); // Import cấu hình từ file index.js

// --- Import các Route ---
// 1. Route của Huy (Owner & Admin)
const fieldRoutes = require('./routes/fieldRoutes'); 
const adminRoutes = require('./routes/adminRoutes'); 
// const slotRoutes = require('./routes/slotRoutes');   // Quản lý ca thuê (Sẽ code)

// 2. Route của Vũ (Auth & User) - Để sẵn đây chờ Vũ gửi code
// const authRoutes = require('./routes/authRoutes'); 

// --- Khởi tạo App ---
const app = express();

// --- Middleware (Cấu hình chung) ---
app.use(cors()); // Cho phép Frontend gọi API (tránh lỗi CORS)
app.use(express.json()); // Để server đọc được JSON từ body request
app.use(express.urlencoded({ extended: true })); // Để đọc dữ liệu form

// --- Định tuyến (API Endpoint) ---

// 1. Endpoint cho Sân bóng (Phần của Huy)
// Đường dẫn: http://localhost:3000/api/fields
app.use('/api/fields', fieldRoutes);

// 2. Endpoint cho Admin (Phần của Huy - Uncomment khi có file route)
app.use('/api/admin', adminRoutes);

// 3. Endpoint cho Ca thuê/Slots (Phần của Huy - Uncomment khi có file route)
// app.use('/api/slots', slotRoutes);

// 4. Endpoint cho Auth (Phần của Vũ - Uncomment khi ghép code)
// app.use('/api/auth', authRoutes);


// --- Route Mặc định (Check server sống hay chết) ---
app.get('/', (req, res) => {
    res.send('⚽ Server Quản Lý Sân Bóng đang chạy ngon lành! ⚽');
});

// --- Xử lý lỗi 404 (Không tìm thấy đường dẫn) ---
app.use((req, res, next) => {
    res.status(404).json({
        message: 'Đường dẫn API này không tồn tại!',
        path: req.originalUrl
    });
});

// --- Xử lý lỗi toàn cục (Global Error Handler) ---
app.use((err, req, res, next) => {
    console.error('❌ Lỗi hệ thống:', err.stack);
    res.status(500).json({
        message: 'Đã xảy ra lỗi server nội bộ',
        error: process.env.NODE_ENV === 'development' ? err.message : {}
    });
});

// --- Khởi chạy Server ---
const PORT = config.port || 3000;
app.listen(PORT, () => {
    console.log(`=============================================`);
    console.log(`🚀 Server đang chạy tại: http://localhost:${PORT}`);
    console.log(`📡 Môi trường: ${process.env.NODE_ENV || 'development'}`);
    console.log(`=============================================`);
});