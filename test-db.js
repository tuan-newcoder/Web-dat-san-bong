// Cài thư viện trước nếu chưa có: npm install mysql2
const mysql = require('mysql2');

// 1. Tạo kết nối
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  database: 'qlsanbong',
  password: '123456' 
});

// 2. Dữ liệu giả định để test (khớp với bảng User ông đưa)
const dummyUser = {
  HoTen: 'Trinh Minh Tuan',
  username: 'tmt',
  password: '1hai3bon', // Sau này nhớ mã hóa
  email: 'admin1@test.com',
  sdt: '0987654312',
  quyen: 'admin'
};

// 3. Thực hiện truy vấn INSERT
const sql = `
  INSERT INTO User (HoTen, username, password, email, sdt, quyen)
  VALUES (?, ?, ?, ?, ?, ?)
`;

connection.query(
  sql,
  [dummyUser.HoTen, dummyUser.username, dummyUser.password, dummyUser.email, dummyUser.sdt, dummyUser.quyen],
  function(err, results) {
    if (err) {
      console.error('❌ Lỗi rồi ông giáo ạ:', err.message);
    } else {
      console.log('✅ Ngon! Đã thêm user thành công.');
      console.log('Insert ID:', results.insertId);
    }
    // Đóng kết nối
    connection.end();
  }
);