require('dotenv').config(); // Load biến môi trường từ file .env
const express = require('express');
const cors = require('cors');
const rootRouter = require('./routes/index'); // File gom routes (xem phần 2)
const db = require('./config/database'); // Import kết nối DB để test

const app = express();
const PORT = process.env.PORT || 3000;

// --- 1. MIDDLEWARE CƠ BẢN ---

// Cho phép Frontend (React/Vue...) gọi API mà không bị lỗi CORS
// Ở môi trường Dev: cho phép tất cả (*). Production nên giới hạn domain cụ thể.
app.use(cors());

// Parse dữ liệu JSON từ body request (quan trọng cho method POST/PUT)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- 2. KIỂM TRA KẾT NỐI DATABASE ---
// (Optional: Giúp bạn biết ngay khi server chạy là DB có ngon không)
db.getConnection()
    .then(connection => {
        console.log('✅ Database connected successfully');
        connection.release();
    })
    .catch(err => {
        console.error('❌ Database connection failed:', err.message);
    });

// --- 3. ĐỊNH TUYẾN (ROUTING) ---
// Gom tất cả API vào prefix /api/v1
// Ví dụ: http://localhost:3000/api/v1/owner/fields
app.use('/api/v1', rootRouter);

// --- 4. XỬ LÝ LỖI (ERROR HANDLING) ---

// 4.1. Handle 404 (Route không tồn tại)
app.use((req, res, next) => {
    res.status(404).json({
        success: false,
        message: `Route không tồn tại: ${req.originalUrl}`
    });
});

// 4.2. Handle 500 (Lỗi Server nội bộ)
// Bất kỳ lỗi nào trong code (throw new Error) sẽ nhảy vào đây
app.use((err, req, res, next) => {
    console.error('❌ Server Error:', err.stack);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Lỗi Server Nội Bộ (Internal Server Error)'
    });
});

// --- 5. KHỞI CHẠY SERVER ---
app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
    console.log(`📡 API endpoint: http://localhost:${PORT}/api/v1`);
});