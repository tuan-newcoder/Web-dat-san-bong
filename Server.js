const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

// 1. Load config (đảm bảo file config nằm ở userBackend/config/index.js)
// Nếu bạn chưa tách file config thì hardcode PORT = 3000 ở đây luôn cũng được
const PORT = 3000; 

// 2. Import Routes (Đảm bảo các file này nằm trong userBackend/routes/)
const authRoutes = require('./userBackend/routes/authRoutes');
const fieldsRoutes = require('./userBackend/routes/fieldsRoutes');
const bookingRoutes = require('./userBackend/routes/bookingRoutes');
const usersRoutes = require('./userBackend/routes/userRoutes');
const slotsRoutes = require('./userBackend/routes/slotsRoutes');

// --- NEW: Import Routes của Huy (Admin & Owner) ---------------
const adminRoutes = require('./userBackend/routes/adminRoutes');
const ownerRoutes = require('./userBackend/routes/ownerRoutes');
// --------------------------------------------------------------

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.json());

// 3. Kết nối các Route
app.use('/api/auth', authRoutes);
app.use('/api/fields', fieldsRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/slots', slotsRoutes);

// --- NEW: Kết nối Route của Huy --------
// Admin sẽ quản lý user: /api/admin/...
app.use('/api/admin', adminRoutes); 
// Owner sẽ quản lý sân: /api/owner/...
app.use('/api/owner', ownerRoutes);
//----------------------------------------


// ==========================================
// QUAN TRỌNG: LỆNH NÀY GIỮ SERVER KHÔNG BỊ "CLEAN EXIT"
// ==========================================
app.listen(PORT, () => {
    console.log(`Server đang chạy tại http://localhost:${PORT}`);
    console.log(`Đang sử dụng thư mục: userBackend`);
});