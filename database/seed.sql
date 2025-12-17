-- ============================
--  DATA GENERATION SCRIPT
--  Database: qlsanbong
-- ============================
USE qlsanbong;

-- Tắt kiểm tra khóa ngoại để làm sạch dữ liệu cũ (nếu có) và reset ID về 1
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE HoaDon;
TRUNCATE TABLE LichDatSan;
TRUNCATE TABLE CaThueSan;
TRUNCATE TABLE CaCoDinh;
TRUNCATE TABLE SanBong;
TRUNCATE TABLE UpRole;
TRUNCATE TABLE User;
SET FOREIGN_KEY_CHECKS = 1;

-- ============================
--  1. INSERT USER (Mật khẩu mặc định là '123456' cho dễ test)
-- ============================
-- Admin (ID: 1)
INSERT INTO User (HoTen, username, password, email, sdt, quyen) VALUES 
('Quản Trị Viên', 'admin', '123456', 'admin@qlsanbong.com', '0900000000', 'admin');

-- Chủ sân (ID: 2, 3, 4)
INSERT INTO User (HoTen, username, password, email, sdt, quyen) VALUES 
('Nguyễn Văn Chủ', 'chusan1', '123456', 'chusan1@gmail.com', '0912345678', 'chusan'),
('Trần Thị Sân', 'chusan2', '123456', 'chusan2@gmail.com', '0912345679', 'chusan'),
('Lê Hoàng Long', 'chusan3', '123456', 'chusan3@gmail.com', '0912345680', 'chusan');

-- Khách hàng (ID: 5 -> 15)
INSERT INTO User (HoTen, username, password, email, sdt, quyen) VALUES 
('Phạm Văn Nam', 'nampham', '123456', 'nampham@email.com', '0987654321', 'khachhang'),
('Lê Thị Bích', 'bichle', '123456', 'bichle@email.com', '0987654322', 'khachhang'),
('Hoàng Văn Tuấn', 'tuanhoang', '123456', 'tuanhoang@email.com', '0987654323', 'khachhang'),
('Đặng Tiểu Bình', 'binhdang', '123456', 'binhdang@email.com', '0987654324', 'khachhang'),
('Võ Tấn Phát', 'phatvo', '123456', 'phatvo@email.com', '0987654325', 'khachhang'),
('Ngô Kiến Huy', 'huyngo', '123456', 'huyngo@email.com', '0987654326', 'khachhang'),
('Trấn Thành', 'tranthanh', '123456', 'tranthanh@email.com', '0987654327', 'khachhang'),
('Trường Giang', 'truonggiang', '123456', 'truonggiang@email.com', '0987654328', 'khachhang'),
('Sơn Tùng', 'sontung', '123456', 'sontung@email.com', '0987654329', 'khachhang'),
('Đen Vâu', 'denvau', '123456', 'denvau@email.com', '0987654330', 'khachhang'),
('Khách Vãng Lai', 'khachvanglai', '123456', 'guest@email.com', '0987654999', 'khachhang');

-- ============================
--  2. INSERT UPROLE (Yêu cầu nâng cấp tài khoản)
-- ============================
INSERT INTO UpRole (MaNguoiDung, HoTen, Email, SDT, TrangThai) VALUES
(5, 'Phạm Văn Nam', 'nampham@email.com', '0987654321', 'dangxuly'),
(6, 'Lê Thị Bích', 'bichle@email.com', '0987654322', 'tuchoi'),
(10, 'Đen Vâu', 'denvau@email.com', '0987654330', 'chapnhan');

-- ============================
--  3. INSERT SANBONG (Sân bóng thuộc về các User ID 2, 3, 4)
-- ============================
INSERT INTO SanBong (MaNguoiDung, TenSan, LoaiSan, DiaChi, TrangThai) VALUES
-- Sân của chủ sân 1 (ID 2)
(2, 'Sân Bóng Chuyên Việt', 'Sân 7', '123 Nguyễn Văn Cừ, Q.5, TP.HCM', 'hoatdong'),
(2, 'Sân Cỏ Nhân Tạo A', 'Sân 5', '123 Nguyễn Văn Cừ, Q.5, TP.HCM', 'hoatdong'),
-- Sân của chủ sân 2 (ID 3)
(3, 'Sân Vận Động Mini', 'Sân 11', '456 Lê Lợi, Q.1, TP.HCM', 'hoatdong'),
(3, 'Sân Mini B', 'Sân 5', '456 Lê Lợi, Q.1, TP.HCM', 'baotri'),
-- Sân của chủ sân 3 (ID 4)
(4, 'Sân Bóng Đại Học X', 'Sân 7', '789 Nguyễn Trãi, Thanh Xuân, Hà Nội', 'hoatdong'),
(4, 'Sân Tập Luyện Y', 'Sân 5', '789 Nguyễn Trãi, Thanh Xuân, Hà Nội', 'hoatdong');

-- ============================
--  4. INSERT CACODINH (Các khung giờ cố định)
-- ============================
INSERT INTO CaCoDinh (GioBD, GioKT) VALUES
('06:00:00', '07:30:00'), -- Ca 1: Sáng sớm
('07:30:00', '09:00:00'), -- Ca 2
('16:00:00', '17:30:00'), -- Ca 3: Chiều
('17:30:00', '19:00:00'), -- Ca 4: Giờ vàng 1
('19:00:00', '20:30:00'), -- Ca 5: Giờ vàng 2
('20:30:00', '22:00:00'); -- Ca 6: Đêm

-- ============================
--  5. INSERT CATHUESAN (Lịch sân cho Hôm nay và Ngày mai)
--  Logic: Tạo lịch cho các sân (ID 1, 2, 3, 5, 6). Sân 4 đang bảo trì nên không tạo.
-- ============================

-- --- NGÀY HÔM NAY (CURRENT_DATE) ---

-- Sân 1 (Sân 7 người - Giá cao)
INSERT INTO CaThueSan (MaSan, MaCD, Ngay, TrangThai, Gia) VALUES
(1, 1, CURRENT_DATE(), 'controng', 300000),
(1, 3, CURRENT_DATE(), 'controng', 400000),
(1, 4, CURRENT_DATE(), 'dadat', 600000),    -- Đã đặt
(1, 5, CURRENT_DATE(), 'dadat', 600000),    -- Đã đặt
(1, 6, CURRENT_DATE(), 'controng', 500000);

-- Sân 2 (Sân 5 người - Giá thấp hơn)
INSERT INTO CaThueSan (MaSan, MaCD, Ngay, TrangThai, Gia) VALUES
(2, 3, CURRENT_DATE(), 'controng', 200000),
(2, 4, CURRENT_DATE(), 'dadat', 350000),    -- Đã đặt
(2, 5, CURRENT_DATE(), 'controng', 350000);

-- Sân 3 (Sân 11 người - Giá rất cao)
INSERT INTO CaThueSan (MaSan, MaCD, Ngay, TrangThai, Gia) VALUES
(3, 3, CURRENT_DATE(), 'controng', 800000),
(3, 4, CURRENT_DATE(), 'controng', 1000000);

-- Sân 5 (Hà Nội)
INSERT INTO CaThueSan (MaSan, MaCD, Ngay, TrangThai, Gia) VALUES
(5, 4, CURRENT_DATE(), 'dadat', 500000),    -- Đã đặt
(5, 5, CURRENT_DATE(), 'dadat', 500000);    -- Đã đặt

-- --- NGÀY MAI (DATE_ADD 1 DAY) ---

-- Sân 1
INSERT INTO CaThueSan (MaSan, MaCD, Ngay, TrangThai, Gia) VALUES
(1, 4, DATE_ADD(CURRENT_DATE(), INTERVAL 1 DAY), 'dadat', 600000), -- Đã đặt trước
(1, 5, DATE_ADD(CURRENT_DATE(), INTERVAL 1 DAY), 'controng', 600000);

-- Sân 2
INSERT INTO CaThueSan (MaSan, MaCD, Ngay, TrangThai, Gia) VALUES
(2, 4, DATE_ADD(CURRENT_DATE(), INTERVAL 1 DAY), 'controng', 350000),
(2, 5, DATE_ADD(CURRENT_DATE(), INTERVAL 1 DAY), 'controng', 350000);

-- ============================
--  6. INSERT LICHDATSAN (Tạo booking cho các slot 'dadat' ở trên)
--  Lưu ý: Các ID của CaThueSan sẽ tự tăng từ 1. 
--  Dựa vào thứ tự insert ở trên:
--  ID 3 (Sân 1, Ca 4, Hôm nay): Đã đặt
--  ID 4 (Sân 1, Ca 5, Hôm nay): Đã đặt
--  ID 7 (Sân 2, Ca 4, Hôm nay): Đã đặt
--  ID 11 (Sân 5, Ca 4, Hôm nay): Đã đặt
--  ID 12 (Sân 5, Ca 5, Hôm nay): Đã đặt
--  ID 13 (Sân 1, Ca 4, Ngày mai): Đã đặt
-- ============================

INSERT INTO LichDatSan (MaNguoiDung, MaCaThue, TrangThai) VALUES
-- Booking thành công và đã thanh toán
(5, 3, 'daxacnhan'),  -- User 5 đặt Sân 1
(6, 4, 'daxacnhan'),  -- User 6 đặt Sân 1
(7, 7, 'daxacnhan'),  -- User 7 đặt Sân 2

-- Booking chưa xác nhận (Mới đặt)
(8, 11, 'chuaxacnhan'), -- User 8 đặt Sân 5

-- Booking đã hủy (Ví dụ lịch sử cũ hoặc hủy phút chót)
(9, 12, 'dahuy'),       -- User 9 đặt Sân 5 nhưng hủy

-- Booking cho ngày mai
(5, 13, 'daxacnhan');   -- User 5 đặt tiếp ngày mai

-- ============================
--  7. INSERT HOADON (Chỉ tạo cho các LichDatSan có trạng thái 'daxacnhan')
--  Map ID LichDatSan với giá tiền tương ứng trong CaThueSan
-- ============================

INSERT INTO HoaDon (MaDatSan, TongTien, TrangThai) VALUES
(1, 600000, 'dathanhtoan'),  -- Hóa đơn cho booking ID 1 (Sân 1, 600k)
(2, 600000, 'chuathanhtoan'),-- Hóa đơn cho booking ID 2 (Sân 1, 600k) - Mới cọc
(3, 350000, 'dathanhtoan'),  -- Hóa đơn cho booking ID 3 (Sân 2, 350k)
(6, 600000, 'chuathanhtoan');-- Hóa đơn cho booking ID 6 (Sân 1 ngày mai)

-- Kết thúc script
SELECT 'Data generated successfully!' AS Status;