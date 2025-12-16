const roleMiddleware = (allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: 'Chưa xác thực người dùng' });
        }
        
        if (!allowedRoles.includes(req.user.quyen)) {
            return res.status(403).json({ 
                message: 'Bạn không có quyền thực hiện hành động này' 
            });
        }
        
        next();
    };
};

module.exports = roleMiddleware;