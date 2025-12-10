const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  database: 'qlsanbong',
  password: '123456' 
});

const sql = `SELECT * FROM sanbong`;

connection.query(sql,
    function(err, results) {
    if (err) {
      console.error('❌ Lỗi :', err.message);
    } else {
      console.log('✅ Ngon!');
      if (results.length > 0) {
        results.forEach((san, index) => {
            console.log(`${index + 1}. Tên: ${san.TenSan} - Loại: ${san.LoaiSan}`);
        });
      } else {
          console.log("Chưa có sân bóng nào trong database.");
      }
    }
    // Đóng kết nối
    connection.end();
  }
);