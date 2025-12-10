const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');
const { SECRET_KEY, SALT_ROUNDS} = require('../config');

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