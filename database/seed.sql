-- ============================
--  DATA GENERATION SCRIPT
-- ============================
USE qlsanbong;

-- Tắt kiểm tra khóa ngoại để tránh lỗi thứ tự insert
SET FOREIGN_KEY_CHECKS = 0;

-- Xóa dữ liệu cũ (nếu muốn reset sạch sẽ)
TRUNCATE TABLE LichDatSan;
TRUNCATE TABLE CaThueSan;
TRUNCATE TABLE SanBong;
TRUNCATE TABLE UpRole;
TRUNCATE TABLE User;

-- ============================
--  1. INSERT USER
--  (Pass mặc định là '123456' cho tất cả test user)
-- ============================
INSERT INTO User (MaNguoiDung, HoTen, username, password, email, sdt, quyen) VALUES
-- Admin
(1, 'Quản Trị Viên', 'admin', '123456', 'admin@qlsanbong.com', '0900000001', 'admin'),

-- Chủ Sân (IDs: 2-5)
(2, 'Nguyễn Văn A', 'chusan1', '123456', 'nguyenvana@gmail.com', '0912345678', 'chusan'),
(3, 'Trần Thị B', 'chusan2', '123456', 'tranthib@gmail.com', '0912345679', 'chusan'),
(4, 'Lê Văn C', 'chusan3', '123456', 'levanc@gmail.com', '0912345680', 'chusan'),
(5, 'Phạm Hùng D', 'chusan4', '123456', 'phamhungd@gmail.com', '0912345681', 'chusan'),

-- Khách Hàng (IDs: 6-15)
(6, 'Hoàng Văn Nam', 'namhoang', '123456', 'namhoang@gmail.com', '0987654321', 'khachhang'),
(7, 'Đỗ Thị Minh', 'minhdo', '123456', 'minhdo@gmail.com', '0987654322', 'khachhang'),
(8, 'Bùi Tiến Dũng', 'tiendung', '123456', 'dungbui@gmail.com', '0987654323', 'khachhang'),
(9, 'Nguyễn Quang Hải', 'quanghai', '123456', 'haiquang@gmail.com', '0987654324', 'khachhang'),
(10, 'Đặng Văn Lâm', 'vanlam', '123456', 'lamdang@gmail.com', '0987654325', 'khachhang'),
(11, 'Phan Văn Đức', 'vanduc', '123456', 'ducphan@gmail.com', '0987654326', 'khachhang'),
(12, 'Lương Xuân Trường', 'xuantruong', '123456', 'truongluong@gmail.com', '0987654327', 'khachhang'),
(13, 'Nguyễn Công Phượng', 'congphuong', '123456', 'phuongnguyen@gmail.com', '0987654328', 'khachhang'),
(14, 'Đỗ Hùng Dũng', 'hungdung', '123456', 'dunghung@gmail.com', '0987654329', 'khachhang'),
(15, 'User Muốn Làm Chủ', 'wannabe', '123456', 'wannabe@gmail.com', '0999999999', 'khachhang');

-- ============================
--  2. INSERT UPROLE
--  (Yêu cầu nâng cấp quyền)
-- ============================
INSERT INTO UpRole (MaNguoiDung, HoTen, Email, SDT, AnhGiayPhep, TrangThai) VALUES
(15, 'User Muốn Làm Chủ', 'wannabe@gmail.com', '0999999999', NULL, 'dangxuly'),
(14, 'Đỗ Hùng Dũng', 'dunghung@gmail.com', '0987654329', NULL, 'tuchoi'),
(2, 'Nguyễn Văn A', 'nguyenvana@gmail.com', '0912345678', NULL, 'chapnhan'); -- Đã được duyệt trước đó

-- ============================
--  3. INSERT SANBONG
--  (Các sân bóng thuộc về user 2, 3, 4, 5)
-- ============================
INSERT INTO SanBong (MaSan, MaNguoiDung, QrChuSan, TenSan, LoaiSan, DiaChi, CaBD, CaKT, Phuong, Gia, TrangThai) VALUES
(1, 2, NULL, 'Sân Bóng Bách Khoa', 'Sân 7', 'Số 1 Đại Cồ Việt', 'Bách Khoa', 300000, 'hoatdong'),
(2, 2, NULL, 'Sân Cỏ Nhân Tạo A1', 'Sân 5', 'Số 1 Đại Cồ Việt', 'Bách Khoa', 200000, 'hoatdong'),
(3, 3, NULL, 'Sân Bóng Chảo Lửa', 'Sân 7', '30 Phan Đình Giót', 'Phương Liệt', 350000, 'hoatdong'),
(4, 3, NULL, 'Sân Viettel 1', 'Sân 11', 'Ngõ 155 Trường Chinh', 'Thanh Xuân', 800000, 'baotri'), -- Đang bảo trì
(5, 4, NULL, 'Sân Thành Phát', 'Sân 5', '2 Hoàng Minh Giám', 'Trung Hòa', 250000, 'hoatdong'),
(6, 4, NULL, 'Sân Thành Phát 2', 'Sân 5', '2 Hoàng Minh Giám', 'Trung Hòa', 250000, 'hoatdong'),
(7, 5, NULL, 'Sân Bộ Công An', 'Sân 7', 'Nguyễn Xiển', 'Kim Giang', 400000, 'hoatdong');

-- ============================
--  4. INSERT CATHUESAN
--  (Tạo lịch cho 3 ngày: Hôm nay, Ngày mai, Ngày kia)
--  Mỗi ngày tạo các ca từ 17h - 20h (giờ cao điểm)
-- ============================
-- Lấy ngày hiện tại
SET @today = CURRENT_DATE();
SET @tomorrow = DATE_ADD(CURRENT_DATE(), INTERVAL 1 DAY);
SET @dayafter = DATE_ADD(CURRENT_DATE(), INTERVAL 2 DAY);

INSERT INTO CaThueSan (MaSan, Ca, Ngay, TrangThai) VALUES
-- Sân 1 (Bách Khoa - Sân 7)
(1, 17, @today, 'dadat'),    -- Ca 17h hôm nay đã đặt
(1, 18, @today, 'controng'),
(1, 19, @today, 'controng'),
(1, 20, @today, 'controng'),
(1, 17, @tomorrow, 'controng'),
(1, 18, @tomorrow, 'dadat'), -- Ca 18h mai đã đặt
(1, 19, @tomorrow, 'controng'),

-- Sân 2 (Bách Khoa - Sân 5)
(2, 17, @today, 'dadat'),
(2, 18, @today, 'dadat'),
(2, 19, @today, 'controng'),
(2, 17, @tomorrow, 'controng'),
(2, 18, @tomorrow, 'controng'),

-- Sân 3 (Chảo Lửa)
(3, 18, @today, 'dadat'),
(3, 19, @today, 'dadat'),
(3, 20, @today, 'controng'),
(3, 18, @tomorrow, 'dadat'),
(3, 19, @tomorrow, 'controng'),

-- Sân 5 (Thành Phát)
(5, 17, @today, 'controng'),
(5, 18, @today, 'controng'),
(5, 17, @tomorrow, 'controng'),
(5, 18, @tomorrow, 'controng'),

-- Sân 7 (Bộ Công An)
(7, 19, @dayafter, 'dadat'), -- Đặt trước ngày kia
(7, 20, @dayafter, 'controng');

-- ============================
--  5. INSERT LICHDATSAN
--  (Tương ứng với các ca có trạng thái 'dadat' ở trên)
-- ============================
INSERT INTO LichDatSan (MaNguoiDung, MaCaThue, TongTien, TrangThai) VALUES
-- User 6 đặt Sân 1 hôm nay lúc 17h
(6, (SELECT MaCaThue FROM CaThueSan WHERE MaSan = 1 AND Ca = 17 AND Ngay = @today), 300000, 'daxacnhan'),

-- User 7 đặt Sân 1 mai lúc 18h
(7, (SELECT MaCaThue FROM CaThueSan WHERE MaSan = 1 AND Ca = 18 AND Ngay = @tomorrow), 300000, 'chuaxacnhan'),

-- User 8 đặt Sân 2 hôm nay lúc 17h
(8, (SELECT MaCaThue FROM CaThueSan WHERE MaSan = 2 AND Ca = 17 AND Ngay = @today), 200000, 'dahuy'), -- Đã hủy nhưng ca vẫn tính là đã đặt (logic tùy nghiệp vụ, ở đây giả sử hủy rồi thì update lại CaThueSan sau)

-- User 9 đặt Sân 2 hôm nay lúc 18h
(9, (SELECT MaCaThue FROM CaThueSan WHERE MaSan = 2 AND Ca = 18 AND Ngay = @today), 200000, 'daxacnhan'),

-- User 10 đặt Sân 3 hôm nay lúc 18h
(10, (SELECT MaCaThue FROM CaThueSan WHERE MaSan = 3 AND Ca = 18 AND Ngay = @today), 350000, 'daxacnhan'),

-- User 11 đặt Sân 3 hôm nay lúc 19h
(11, (SELECT MaCaThue FROM CaThueSan WHERE MaSan = 3 AND Ca = 19 AND Ngay = @today), 350000, 'chuaxacnhan'),

-- User 12 đặt Sân 3 mai lúc 18h
(12, (SELECT MaCaThue FROM CaThueSan WHERE MaSan = 3 AND Ca = 18 AND Ngay = @tomorrow), 350000, 'daxacnhan'),

-- User 13 đặt Sân 7 ngày kia lúc 19h
(13, (SELECT MaCaThue FROM CaThueSan WHERE MaSan = 7 AND Ca = 19 AND Ngay = @dayafter), 400000, 'daxacnhan');

-- Cập nhật lại trạng thái CaThueSan cho đúng logic (Nếu đơn hàng đã hủy thì trả lại slot trống)
-- Giả sử ID 8 hủy vé, ta update lại slot đó thành 'controng'
UPDATE CaThueSan 
SET TrangThai = 'controng' 
WHERE MaCaThue IN (SELECT MaCaThue FROM LichDatSan WHERE TrangThai = 'dahuy');

-- Bật lại kiểm tra khóa ngoại
SET FOREIGN_KEY_CHECKS = 1;

-- ============================
--  THÔNG BÁO HOÀN TẤT
-- ============================
SELECT 'Database generated successfully with sample data!' AS Status;