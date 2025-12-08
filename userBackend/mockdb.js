let users = [
    {
        id: 1, 
        username: "admin", 
        passwordHash: "$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxwKc.6qKzJzW...", 
        fullName: "Quản Trị Viên", 
        email: "admin@soccer.vn", 
        phoneNumber: "0909000111", 
        role: "admin",
    },
    { 
        id: 2, 
        username: "nguoidung1", 
        passwordHash: "$2b$10$AbCzFaVk2... (giả định là hash của '123456')", 
        fullName: "Nguyễn Văn A", 
        email: "vana@gmail.com", 
        phoneNumber: "0987654321", 
        role: "customer",
    },
    { 
        id: 3, 
        username: "chu_san_tu", 
        passwordHash: "...", 
        fullName: "Trần Văn Tú", 
        email: "tu.owner@gmail.com", 
        phoneNumber: "0999888777", 
        role: "owner",
    }
];

let fields = [
    { 
    id: 1, 
    ownerId: 3, 
    name: "Sân Bóng Đại Học Bách Khoa", 
    type: "San7", 
    address: "Số 1 Đại Cồ Việt, Hai Bà Trưng, Hà Nội", 
    description: "Sân cỏ nhân tạo tiêu chuẩn FIFA, có canteen.",
    rating: 4.8,
    totalReviews: 125, 
    status: "active", 
    image: "https://example.com/san-bk.jpg" 
  },
  { 
    id: 2, 
    ownerId: 3, 
    name: "Sân Cỏ Nhân Tạo Thành Đồng", 
    type: "San5", 
    address: "Ngõ 102 Trường Chinh, Đống Đa, Hà Nội", 
    description: "Sân thoáng mát, giá rẻ cho sinh viên.",
    rating: 4.2, 
    totalReviews: 89,
    status: "maintenance", 
    image: "https://example.com/san-td.jpg" 
  }
];

let shifts = [
  { id: 1, name: "Ca Sáng (7:00 - 8:30)", startTime: "07:00", endTime: "08:30", priceBase: 200000 },
  { id: 2, name: "Ca Sáng (8:30 - 10:00)", startTime: "08:30", endTime: "10:00", priceBase: 200000 },
  { id: 3, name: "Ca Chiều (16:00 - 17:30)", startTime: "16:00", endTime: "17:30", priceBase: 250000 }, 
  { id: 4, name: "Ca Tối (17:30 - 19:00)", startTime: "17:30", endTime: "19:00", priceBase: 300000 }
];

let bookings = [
  { 
    id: 101, 
    userId: 2, // Link tới users[1]
    fieldId: 1, // Link tới fields[0]
    shiftId: 3, // Link tới shifts[2] (16:00 - 17:30)
    bookingDate: "2023-12-05", // Format chuẩn YYYY-MM-DD
    totalPrice: 250000,
    status: "confirmed", // pending, confirmed, cancelled, completed
    paymentStatus: "paid", // unpaid, paid
    createdAt: "2023-12-01T08:30:00Z"
  }
];

let invoices = []; // Chứa hóa đơn (HoaDon)
let reviews = [];  // Chứa đánh giá (DanhGia)

module.exports = {users, fields, shifts, bookings, invoices, reviews};