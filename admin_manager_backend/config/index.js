// config/index.js
const mysql = require('mysql2');
const path = require('path');
require('dotenv').config({path: path.resolve(__dirname, '../../env') });

// 1. Cấu hình chung 
const config = {
    port: process.env.PORT || 3000,
    secretKey: process.env.SECRET_KEY || "DA_BONG_VUI_VE_SECRET", 
    db: {
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'qlsanbong',
    }
};

// 2. Khởi tạo kết nối Database (Connection Pool)
const pool = mysql.createPool({
    host: config.db.host,
    user: config.db.user,
    password: config.db.password,
    database: config.db.database,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Test kết nối ngay khi chạy server để biết lỗi sớm
pool.getConnection((err, connection) => {
    if (err) {
        console.error('❌ Kết nối Database thất bại:', err.code);
    } else {
        console.log('✅ Đã kết nối Database thành công!');
        connection.release();
    }
});

// Export cả config (để lấy secretKey) và db (để query)
module.exports = {
    config,
    db: pool.promise() // Export dạng Promise để dùng await
};