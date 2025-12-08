const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const jwt = require('jsonwebtoken');

// Import dữ liệu giả từ file mockData.js (cùng thư mục)
const { users, fields, shifts, bookings, invoices, reviews } = require('./mockdb');

const app = express();

// --- MIDDLEWARE XÁC THỰC JWT ---
const authenticateToken = (req, res, next) => {
    // Lấy token từ header: "Authorization: Bearer <token>"
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Lấy phần token phía sau chữ Bearer

    if (!token) return res.status(401).json({ message: "Bạn chưa đăng nhập (Thiếu Token)!" });

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) return res.status(403).json({ message: "Token không hợp lệ hoặc đã hết hạn!" });

        // Nếu đúng, lưu thông tin user vào biến req để dùng ở bước sau
        req.user = user; 
        next(); // Cho phép đi tiếp
    });
};

const PORT = 3000;
const SECRET_KEY = "DA_BONG_VUI_VE_SECRET"; // Thực tế nên để trong file .env

// Middleware
app.use(cors()); // Cho phép Frontend gọi API
app.use(bodyParser.json());

// --- HELPER FUNCTION: Tạo ID tự tăng ---
const generateId = (array) => array.length > 0 ? Math.max(...array.map(item => item.id)) + 1 : 1;

// ==========================================
// 1. AUTHENTICATION (Đăng ký / Đăng nhập)
// ==========================================

// ĐĂNG KÝ
app.post('/api/auth/register', async (req, res) => {
    const { username, password, fullName, email, phoneNumber } = req.body;

    // Validate
    if (!username || !password || !email) {
        return res.status(400).json({ message: "Vui lòng nhập đủ thông tin!" });
    }

    // Check trùng username hoặc email
    const exists = users.find(u => u.username === username || u.email === email);
    if (exists) {
        return res.status(409).json({ message: "Tài khoản hoặc Email đã tồn tại!" });
    }

    try {
        // Salt là chuỗi ngẫu nhiên để tăng độ khó (10 là độ khó tiêu chuẩn)
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Tạo User mới
        const newUser = {
            id: generateId(users),
            username,
            passwordHash: hashedPassword, 
            fullName,
            email,
            phoneNumber,
            role: "customer", // Mặc định là khách
            createdAt: new Date().toISOString()
        };

        users.push(newUser);

        const { passwordHash, ...userInfo } = newUser;
        res.status(201).json({ message: "Đăng ký thành công!", user: userInfo });

    } catch (err) {
        res.status(500).json({ message: "Lỗi Server khi mã hóa mật khẩu" });
    }

});

// ĐĂNG NHẬP
app.post('/api/auth/login', async (req, res) => {
    const { username, password } = req.body;

    // Tìm user
    const user = users.find(u => u.username === username);
    
    if (!user) {
        return res.status(401).json({ message: "Sai tài khoản hoặc mật khẩu!" });
    }

    try {
        // --- ĐOẠN MỚI: SO SÁNH PASSWORD ---
        // So sánh password nhập vào (plain) với hash trong DB
        const isMatch = await bcrypt.compare(password, user.passwordHash);
        // ----------------------------------

        if (!isMatch) {
            return res.status(401).json({ message: "Sai tài khoản hoặc mật khẩu!" });
        }

        const token = jwt.sign(
            { id: user.id, role: user.role, name: user.fullName }, 
            SECRET_KEY, 
            { expiresIn: '24h' }
        );

        res.json({
            message: "Đăng nhập thành công",
            token,
            user: {
                id: user.id,
                username: user.username,
                fullName: user.fullName,
                role: user.role
            }
        });
    } catch (err) {
        res.status(500).json({ message: "Lỗi Server khi kiểm tra mật khẩu" });
    }
});

// ==========================================
// 2. QUẢN LÝ SÂN BÓNG (Public API)
// ==========================================

// LẤY DANH SÁCH SÂN (Có lọc theo Quận & Điểm đánh giá)
app.get('/api/fields', (req, res) => {
    const { district, minRating } = req.query;

    let result = fields.filter(f => f.status === 'active'); // Chỉ lấy sân đang hoạt động

    // Lọc theo địa chỉ (Ví dụ: district="Đống Đa")
    if (district) {
        result = result.filter(f => f.address && f.address.toLowerCase().includes(district.toLowerCase()));
    }

    // Lọc theo rating (Ví dụ: minRating=4.0)
    if (minRating) {
        result = result.filter(f => f.rating >= parseFloat(minRating));
    }

    res.json(result);
});

// LẤY CHI TIẾT 1 SÂN
app.get('/api/fields/:id', (req, res) => {
    const fieldId = parseInt(req.params.id);
    const field = fields.find(f => f.id === fieldId);

    if (!field) return res.status(404).json({ message: "Không tìm thấy sân!" });

    res.json(field);
});

// LẤY DANH SÁCH CA (SHIFTS) ĐỂ USER CHỌN
app.get('/api/shifts', (req, res) => {
    res.json(shifts);
});

// ==========================================
// 3. ĐẶT SÂN & CHECK TRÙNG (Core Feature)
// ==========================================

app.post('/api/bookings', authenticateToken, (req, res) => {
    const { fieldId, shiftId, date,} = req.body;
    const userId = req.user.id;

    if (!fieldId || !shiftId || !date || !userId) {
        return res.status(400).json({ message: "Thiếu thông tin đặt sân!" });
    }

    // --- LOGIC CHECK TRÙNG LỊCH ---
    const isConflict = bookings.some(b => 
        b.fieldId === fieldId &&
        b.shiftId === shiftId &&
        b.bookingDate === date &&
        b.status !== 'cancelled' // Không tính đơn đã hủy
    );

    if (isConflict) {
        return res.status(409).json({ message: "Rất tiếc! Ca này đã có người đặt rồi." });
    }

    // Tính tiền (Lấy giá từ shift hoặc field)
    const selectedShift = shifts.find(s => s.id === shiftId);
    const price = selectedShift ? selectedShift.priceBase : 0;

    // Tạo đơn mới
    const newBooking = {
        id: generateId(bookings),
        userId,
        fieldId,
        shiftId,
        bookingDate: date,
        totalPrice: price,
        status: 'pending', // Chờ thanh toán
        paymentStatus: 'unpaid',
        createdAt: new Date().toISOString()
    };

    bookings.push(newBooking);

    res.status(201).json({ message: "Đặt sân thành công!", booking: newBooking });
});

// ==========================================
// 4. QUẢN LÝ ĐƠN HÀNG (Lịch sử & Hủy)
// ==========================================

// XEM LỊCH SỬ ĐẶT CỦA 1 USER
app.get('/api/bookings/user/:userId', (req, res) => {
    const userId = parseInt(req.params.userId);
    
    // Join bảng để lấy tên sân và tên ca (Mô phỏng SQL JOIN)
    const userBookings = bookings
        .filter(b => b.userId === userId)
        .map(b => {
            const field = fields.find(f => f.id === b.fieldId);
            const shift = shifts.find(s => s.id === b.shiftId);
            return {
                ...b,
                fieldName: field ? field.name : "Unknown Field",
                fieldAddress: field ? field.address : "",
                shiftName: shift ? shift.name : "Unknown Shift",
                shiftTime: shift ? `${shift.startTime} - ${shift.endTime}` : ""
            };
        });

    res.json(userBookings);
});

// HỦY ĐƠN ĐẶT
app.put('/api/bookings/:id/cancel', (req, res) => {
    const bookingId = parseInt(req.params.id);
    const booking = bookings.find(b => b.id === bookingId);

    if (!booking) return res.status(404).json({ message: "Không tìm thấy đơn!" });

    if (booking.status === 'completed') {
        return res.status(400).json({ message: "Không thể hủy đơn đã hoàn thành đá!" });
    }

    booking.status = 'cancelled';
    res.json({ message: "Hủy sân thành công", bookingId });
});

// ==========================================
// 5. THANH TOÁN (Payments)
// ==========================================

app.post('/api/payments', authenticateToken, (req, res) => {
    const { bookingId, paymentMethod } = req.body; // paymentMethod: 'momo', 'vnpay', 'cash'

    // 1. Tìm đơn đặt
    const booking = bookings.find(b => b.id === bookingId);
    if (!booking) return res.status(404).json({ message: "Không tìm thấy đơn đặt sân!" });

    // 2. Check quyền (Chỉ người đặt mới được thanh toán đơn của mình)
    if (booking.userId !== req.user.id) {
        return res.status(403).json({ message: "Bạn không có quyền thanh toán đơn này!" });
    }

    // 3. Xử lý thanh toán
    if (booking.paymentStatus === 'paid') {
        return res.status(400).json({ message: "Đơn này đã thanh toán rồi!" });
    }

    // Tạo Hóa Đơn mới (Mapping với bảng HoaDon trong ERD)
    const newInvoice = {
        id: generateId(invoices), // MaHoaDon
        bookingId: booking.id,    // MaDatSan (Khóa ngoại)
        userId: req.user.id,      // MaNguoiDung (để tiện tra cứu)
        totalAmount: booking.totalPrice, // TongTien
        paymentMethod: paymentMethod, 
        status: 'completed',      // TrangThai
        createdAt: new Date().toISOString() // NgayTao
    };

    // Lưu vào DB (mock)
    invoices.push(newInvoice);

    // Update trạng thái
    booking.paymentStatus = 'paid';
    booking.status = 'confirmed'; // Chuyển từ pending sang confirmed
    
    // Giả lập lưu vào bảng Payments (nếu có bảng mock payments)
    // const newPayment = { id: ..., amount: booking.totalPrice, method: paymentMethod, date: new Date() }
    
    res.json({ 
        message: "Thanh toán thành công! Hóa đơn đã được tạo.", 
        invoice: newInvoice 
    });
});

// ==========================================
// 6. ĐÁNH GIÁ SÂN (Review - Theo ERD)
// ==========================================

// Gửi đánh giá
app.post('/api/reviews', authenticateToken, (req, res) => {
    const { fieldId, rating, content } = req.body; // Diem, NoiDung

    // Validate đầu vào
    if (!fieldId || !rating) return res.status(400).json({ message: "Thiếu thông tin đánh giá!" });

    // (Nâng cao) Logic kiểm tra: User phải đá xong mới được đánh giá
    // Bạn có thể bỏ qua bước này nếu muốn test nhanh
    const hasBooked = bookings.some(b => 
        b.userId === req.user.id && 
        b.fieldId === fieldId && 
        b.status === 'confirmed' // hoặc completed
    );

    if (!hasBooked) {
        return res.status(403).json({ message: "Bạn phải đặt và đá sân này mới được đánh giá!" });
    }

    const newReview = {
        id: generateId(reviews),
        userId: req.user.id,     // MaNguoiDung
        fieldId: fieldId,        // MaSan
        rating: parseInt(rating),// Diem
        content: content,        // NoiDung
        createdAt: new Date().toISOString() // NgayDanhGia
    };

    reviews.push(newReview);
    res.status(201).json({ message: "Cảm ơn bạn đã đánh giá!", review: newReview });
});

// Xem đánh giá của 1 sân
app.get('/api/fields/:id/reviews', (req, res) => {
    const fieldId = parseInt(req.params.id);
    const fieldReviews = reviews.filter(r => r.fieldId === fieldId);
    
    // Tính điểm trung bình (Optional)
    const avgRating = fieldReviews.length > 0 
        ? (fieldReviews.reduce((sum, r) => sum + r.rating, 0) / fieldReviews.length).toFixed(1)
        : 0;

    res.json({ 
        averageRating: avgRating, 
        totalReviews: fieldReviews.length, 
        reviews: fieldReviews 
    });
});

// ==========================================
// START SERVER
// ==========================================
app.listen(PORT, () => {
    console.log(`Server đang chạy tại http://localhost:${PORT}`);
    console.log(`Dữ liệu được lấy từ mockData.js`);
});