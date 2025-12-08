const mysql = require('mysql2/promise')

const db = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '123456',   // <--- Thay bằng pass của b
    database: 'qlsanbong' // <--- Cái tên b vừa tạo ở bước 1
})

// Thêm đoạn này để test luôn xem chạy được chưa
db.getConnection()
    .then(connection => {
        console.log("✅ Ngon! Kết nối thành công rồi.");
        connection.release();
    })
    .catch(err => {
        console.error("❌ Toang! Lỗi: ", err.message);
    });

async function testConnection() {
    try {
        // Thử xin 1 kết nối từ hồ
        const connection = await db.getConnection();
        console.log("✅ KẾT NỐI THÀNH CÔNG! (Database đã nhận lệnh)");
        
        // Trả kết nối về hồ
        connection.release();
        
        // Thoát chương trình (để nó không bị treo)
        process.exit();
    } catch (err) {
        console.error("❌ KẾT NỐI THẤT BẠI:", err.message);
    }
}

testConnection();

module.exports = db