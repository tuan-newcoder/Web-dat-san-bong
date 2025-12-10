const jwt = require('jsonwebtoken');
const { SECRET_KEY } = require('../config');

//Lấy Token từ header có dạng: Authorization: Bearer <token>
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({message: "Bạn chưa đăng nhập (Thiếu Token)!"});

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if(err) {
            return res.status(403).json({message: "Token không hợp lệ hoặc đã hết hạn!"});
        }

        req.user = user;
        next();
    });
};

module.exports = {
    authenticateToken
};
