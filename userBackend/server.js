const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

// 1. Load config (đảm bảo file config nằm ở userBackend/config/index.js)
// Nếu bạn chưa tách file config thì hardcode PORT = 3000 ở đây luôn cũng được
const PORT = 3000; 

// 2. Import Routes (Đảm bảo các file này nằm trong userBackend/routes/)
const authRoutes = require('./routes/authRoutes');
const fieldsRoutes = require('./routes/fieldsRoutes');
const bookingRoutes = require('./routes/bookingRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// 3. Kết nối các Route
app.use('/api/auth', authRoutes);
app.use('/api/fields', fieldsRoutes);
app.use('/api/bookings', bookingRoutes);

// ==========================================
// QUAN TRỌNG: LỆNH NÀY GIỮ SERVER KHÔNG BỊ "CLEAN EXIT"
// ==========================================
app.listen(PORT, () => {
    console.log(`Server đang chạy tại http://localhost:${PORT}`);
    console.log(`Đang sử dụng thư mục: userBackend`);
});