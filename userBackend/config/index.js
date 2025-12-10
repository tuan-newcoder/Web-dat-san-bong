const dotenv = require('dotenv');
const path = require('path');

// Load file .env từ thư mục gốc (Root)
// Vì file này nằm trong thư mục 'backend/config', ta cần trỏ ra ngoài 2 cấp (../..)
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const config = {
    // 1. Cấu hình Server
    PORT: process.env.PORT || 3000,

    // 2. Cấu hình Bảo mật (JWT & Bcrypt)
    // Nếu không tìm thấy trong .env, nó sẽ dùng chuỗi mặc định sau dấu ||
    SECRET_KEY: process.env.SECRET_KEY || "DA_BONG_VUI_VE_SECRET", 
    SALT_ROUNDS: 10, // Độ khó khi mã hóa mật khẩu (thường là 10)
    
    // 3. Cấu hình Database (Để tham khảo hoặc dùng nếu cần)
    // Lưu ý: File db.js của bạn đang đọc trực tiếp process.env, 
    // nhưng khai báo ở đây giúp code rõ ràng hơn.
    DB: {
        HOST: process.env.DB_HOST || 'localhost',
        USER: process.env.DB_USER || 'root',
        PASSWORD: process.env.DB_PASSWORD || '',
        NAME: process.env.DB_NAME || 'qlsanbong'
    }
};

module.exports = config;