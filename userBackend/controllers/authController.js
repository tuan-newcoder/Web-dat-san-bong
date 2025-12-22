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

