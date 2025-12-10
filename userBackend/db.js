// userBackend/db.js
const mysql = require('mysql2');
const path = require('path');
const dotenv = require('dotenv');

// 1. Cấu hình đọc file .env chuẩn xác
// __dirname là vị trí file db.js hiện tại, '../.env' là lùi ra 1 cấp để lấy file môi trường
dotenv.config({ path: path.resolve(__dirname, '../.env') }); 

// 2. Tạo kết nối (có giá trị mặc định nếu .env lỗi)
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root', 
    password: process.env.DB_PASSWORD || '123456', // Mặc định là 123456 như bạn yêu cầu
    database: process.env.DB_NAME || 'qlsanbong',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

const promisePool = pool.promise();

// 3. Log ra để kiểm tra (Chỉ log khi chạy dev, production nên tắt)
console.log("🛠️  DB Config đang dùng:", {
    host: process.env.DB_HOST || 'localhost (default)',
    user: process.env.DB_USER || 'root (default)',
    database: process.env.DB_NAME || 'qlsanbong (default)'
});

// 4. Test kết nối ngay khi file này được gọi
promisePool.getConnection()
    .then(conn => {
        console.log(`✅ Đã kết nối thành công tới Database: ${process.env.DB_NAME || 'qlsanbong'}`);
        conn.release();
    })
    .catch(err => {
        console.error("❌ Lỗi kết nối Database:", err.message);
        // Gợi ý lỗi thường gặp
        if (err.code === 'ER_ACCESS_DENIED_ERROR') {
            console.error("-> Sai Username hoặc Password (kiểm tra file .env hoặc MySQL Workbench)");
        } else if (err.code === 'ECONNREFUSED') {
            console.error("-> Không tìm thấy Database server (đã bật XAMPP/MySQL chưa?)");
        }
    });

module.exports = promisePool;