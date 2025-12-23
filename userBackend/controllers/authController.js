const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');
const {transporter} = require('../utils/email')
const { SECRET_KEY, SALT_ROUNDS} = require('../config');
const { configDotenv } = require('dotenv');

exports.register = async (req, res) => {
    const { username, password, HoTen, email, sdt } = req.body;

    if (!username || !password || !email) return res.status(400).json({Message: "Thiếu thông tin!"});

    try {
        const [rows] = await db.query('SELECT * FROM user WHERE username = ? OR email = ?', [username, email]);
        if (rows.length > 0) return res.status(409).json({message: "Tài khoản đã tồn tại!"});

        const hashPassword = await bcrypt.hash(password, SALT_ROUNDS);

        const sql = `INSERT INTO User (HoTen, username, password, email, sdt, quyen) VALUES (?, ?, ?, ?, ?, 'khachhang')`;

        await db.query(sql, [HoTen, username, hashPassword, email, sdt]);

        res.status(201).json({message: "Đăng ký thành công!"});
    } catch (err) {
        console.error(err);
        res.status(500).json({message: "Lỗi Server!"});
    }
};

exports.login = async (req, res) => {
    const { username, password } = req.body;

    try {
        const [rows] = await db.query('SELECT * FROM user WHERE username = ?', [username]);
        if (rows.length === 0) return res.status(401).json({message: "Sai tài khoản!"});

        const user = rows[0];

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({message: "Sai tài khoản hoặc mật khẩu!"});

        const token = jwt.sign(
            { id: user.MaNguoiDung, role: user.quyen, name: user.HoTen },
            SECRET_KEY,
            {expiresIn: '24h'}
        );

        res.json({
            message: "Đăng nhập thành công!",
            token,
            user: {
                id: user.MaNguoiDung,
                username: user.username,
                HoTen: user.HoTen,
                role: user.quyen
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({message: "Lỗi Server!"});
    }
};

exports.sendVerification = async (req, res) => {
    
    const { email } = req.body;
    
    if (!email) {
        return res.status(400).json({message: 'Vui lòng nhập Email'});
    }

    try {
        const [users] = await db.execute('SELECT * FROM user WHERE email = ?', [email]);
        if (users.length === 0 ) {
            return res.status(404).json({message: 'Email không tồn tại!'});
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        const ExpiresAt = new Date(Date.now() + 5 * 60 * 1000);

        await db.execute('DELETE FROM password_resets WHERE email = ?', [email]);

        await db.execute(
            'INSERT INTO password_resets (email, otp_code, expires_at) VALUES (?, ?, ?)', [email, otp, ExpiresAt]
        );

        const mailOptions = {
            from: 'WEB ĐẶT SÂN BÓNG',
            to: email,
            subject: 'Mã xác nhận đặt lại mật khẩu',
            html: `<h3>Mã xác nhận của bạn là: <b style="color:red; font-size: 20px;">${otp}</b></h3>
                   <p>Mã này sẽ hết hạn trong 5p!<p>`
        };

        await transporter.sendMail(mailOptions);

        return res.status(200).json({message: 'Đã gửi mã OTP'});

    } catch (error) {
        console.error(error);
        return res.status(500).json({message: 'Lỗi server khi gửi OTP'});
    }
};

exports.resetPassword = async (req, res) => {
    const {email, otp, newPassword} = req.body;

    if (!email || !otp || !newPassword) {
        return res.status(400).json({message: 'Vui lòng nhập đầy đủ thông tin!'});
    }

    try {
        const [otpRows] = await db.execute(
            'SELECT * FROM password_resets WHERE email = ? AND otp_code = ? AND expires_at > NOW()', [email, otp]
        );

        if (otpRows.length === 0) {
            return res.status(404).json({message: 'Mã OTP không đúng hoặc đã hết hạn'});
        }

        const hashPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);

        await db.execute('UPDATE user SET password = ? WHERE email = ?', [hashPassword, email]);
    
        await db.execute('DELETE FROM password_resets WHERE email = ?', [email]);
    
        res.status(200).json({message: 'Bạn đã đổi mật khẩu thành công!'});
    
    } catch (err) {
        console.error(err);
        res.status(500).json({message: 'Lỗi Server!'});
    }
};

exports.putNewPassword = async (req, res) => {
    // 1. Lấy ID từ Token (Middleware đã gán vào req.user)
    // Lưu ý: Lúc login bạn sign token là { id: user.MaNguoiDung ... } nên ở đây gọi .id
    const id = req.user.id; 

    // 2. Chỉ nhận password cũ và mới (KHÔNG cần email)
    const { password, newPassword } = req.body; 

    if (!password || !newPassword) {
        return res.status(400).json({message: "Vui lòng nhập mật khẩu cũ và mật khẩu mới"});
    }

    try {
        // 3. Tìm user trong DB bằng ID (Chắc chắn chính xác)
        const [rows] = await db.query('SELECT * FROM user WHERE MaNguoiDung = ?', [id]);
        
        if (rows.length === 0) return res.status(404).json({message: "Tài khoản không tồn tại!"});
        
        const user = rows[0];

        // 4. Kiểm tra mật khẩu cũ (Bắt buộc)
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({message: "Mật khẩu cũ không chính xác!"});
        }

        // 5. Hash mật khẩu mới
        const hashNewPassword = await bcrypt.hash(newPassword, SALT_ROUNDS); 

        // 6. Cập nhật vào DB
        await db.execute(`UPDATE user SET password = ? WHERE MaNguoiDung = ?`, [hashNewPassword, id]);
        
        res.status(200).json({message: "Đổi mật khẩu thành công!"});

    } catch (err) {
        console.error("Lỗi đổi pass:", err);
        res.status(500).json({message: "Lỗi Server!"});
    }
}

