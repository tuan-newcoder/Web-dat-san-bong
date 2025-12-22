-- ============================
--  DATA GENERATION FOR NEW SCHEMA
-- ============================
USE qlsanbong;

-- Tắt kiểm tra khóa ngoại để tránh lỗi thứ tự insert và xóa dữ liệu cũ
SET FOREIGN_KEY_CHECKS = 0;

-- Xóa dữ liệu cũ để reset
TRUNCATE TABLE password_resets;
TRUNCATE TABLE LichDatSan;
TRUNCATE TABLE SanBong;
TRUNCATE TABLE UpRole;
TRUNCATE TABLE User;

-- ============================
--  1. INSERT USER
--  (Thêm STK và Bank cho Chủ sân để phù hợp schema mới)
-- ============================
INSERT INTO User (MaNguoiDung, HoTen, username, password, email, sdt, stk, bank, quyen) VALUES
-- Admin
(1, 'Admin Hệ Thống', 'admin', '123456', 'admin@qlsanbong.com', '0900000001', NULL, NULL, 'admin'),

-- Chủ Sân (IDs: 2-5) - Có thông tin ngân hàng
(2, 'Nguyễn Văn A', 'chusan1', '123456', 'nguyenvana@gmail.com', '0912345678', '190333444555', 'Techcombank', 'chusan'),
(3, 'Trần Thị B', 'chusan2', '123456', 'tranthib@gmail.com', '0912345679', '001122334455', 'Vietcombank', 'chusan'),
(4, 'Lê Văn C', 'chusan3', '123456', 'levanc@gmail.com', '0912345680', '666688889999', 'MBBank', 'chusan'),
(5, 'Phạm Hùng D', 'chusan4', '123456', 'phamhungd@gmail.com', '0912345681', '888899990000', 'VPBank', 'chusan'),

-- Khách Hàng (IDs: 6-15) - Thường không cần STK trừ khi được hoàn tiền (để NULL hoặc điền bừa)
(6, 'Hoàng Văn Nam', 'namhoang', '123456', 'namhoang@gmail.com', '0987654321', NULL, NULL, 'khachhang'),
(7, 'Đỗ Thị Minh', 'minhdo', '123456', 'minhdo@gmail.com', '0987654322', NULL, NULL, 'khachhang'),
(8, 'Bùi Tiến Dũng', 'tiendung', '123456', 'dungbui@gmail.com', '0987654323', NULL, NULL, 'khachhang'),
(9, 'Nguyễn Quang Hải', 'quanghai', '123456', 'haiquang@gmail.com', '0987654324', NULL, NULL, 'khachhang'),
(10, 'Đặng Văn Lâm', 'vanlam', '123456', 'lamdang@gmail.com', '0987654325', NULL, NULL, 'khachhang'),
(11, 'Phan Văn Đức', 'vanduc', '123456', 'ducphan@gmail.com', '0987654326', NULL, NULL, 'khachhang'),
(12, 'Lương Xuân Trường', 'xuantruong', '123456', 'truongluong@gmail.com', '0987654327', NULL, NULL, 'khachhang'),
(13, 'Nguyễn Công Phượng', 'congphuong', '123456', 'phuongnguyen@gmail.com', '0987654328', NULL, NULL, 'khachhang'),
(14, 'Đỗ Hùng Dũng', 'hungdung', '123456', 'dunghung@gmail.com', '0987654329', NULL, NULL, 'khachhang'),
(15, 'User Muốn Làm Chủ', 'wannabe', '123456', 'wannabe@gmail.com', '0999999999', '123456789', 'TPBank', 'khachhang');

-- ============================
--  2. INSERT UPROLE 
-- ============================
INSERT INTO UpRole (MaNguoiDung, HoTen, Email, Sdt, Stk, Bank, AnhGiayPhep, TrangThai) VALUES
-- User 15 đang chờ duyệt, điền thông tin ngân hàng
(15, 'User Muốn Làm Chủ', 'wannabe@gmail.com', '0999999999', '123456789', 'TPBank', NULL, 'dangxuly'),

-- User 14 bị từ chối
(14, 'Đỗ Hùng Dũng', 'dunghung@gmail.com', '0987654329', '987654321', 'Vietinbank', NULL, 'tuchoi'),

-- User 2 đã được chấp nhận (Thông tin khớp với bảng User)
(2, 'Nguyễn Văn A', 'nguyenvana@gmail.com', '0912345678', '190333444555', 'Techcombank', NULL, 'chapnhan');

-- ============================
--  3. INSERT SANBONG
-- ============================
INSERT INTO SanBong (MaSan, MaNguoiDung, TenSan, LoaiSan, DiaChi, Phuong, Gia, TrangThai) VALUES
(1, 2, 'Sân Bóng Bách Khoa 1', 'Sân 7', 'Số 1 Đại Cồ Việt', 'Bách Khoa', 300000, 'hoatdong'),
(2, 2, 'Sân Cỏ Nhân Tạo A1', 'Sân 5', 'Số 1 Đại Cồ Việt', 'Bách Khoa', 200000, 'hoatdong'),
(3, 3, 'Sân Bóng Chảo Lửa', 'Sân 7', '30 Phan Đình Giót', 'Phương Liệt', 350000, 'hoatdong'),
(4, 3, 'Sân Viettel Pro', 'Sân 11', 'Ngõ 155 Trường Chinh', 'Thanh Xuân', 800000, 'baotri'),
(5, 4, 'Sân Thành Phát 1', 'Sân 5', '2 Hoàng Minh Giám', 'Trung Hòa', 250000, 'hoatdong'),
(6, 4, 'Sân Thành Phát 2', 'Sân 5', '2 Hoàng Minh Giám', 'Trung Hòa', 250000, 'hoatdong'),
(7, 5, 'Sân Bộ Công An', 'Sân 7', 'Đường Nguyễn Xiển', 'Kim Giang', 400000, 'hoatdong'),
(8, 5, 'Sân Khương Đình', 'Sân 5', 'Ngõ 211 Khương Trung', 'Khương Đình', 180000, 'hoatdong');

-- ============================
--  4. INSERT LICHDATSAN
--  (Logic mới: Insert trực tiếp Ca và Ngay vào bảng này)
-- ============================

-- Thiết lập biến ngày tháng để dữ liệu luôn mới
SET @today = CURRENT_DATE();
SET @yesterday = DATE_SUB(CURRENT_DATE(), INTERVAL 1 DAY);
SET @tomorrow = DATE_ADD(CURRENT_DATE(), INTERVAL 1 DAY);
SET @dayafter = DATE_ADD(CURRENT_DATE(), INTERVAL 2 DAY);

INSERT INTO LichDatSan (MaNguoiDung, MaSan, Ca, Ngay, TongTien, TrangThai) VALUES
-- === Dữ liệu quá khứ (Hôm qua) ===
(6, 1, 10, @yesterday, 300000, 'daxacnhan'), -- Khách 6 đá sân 1 hôm qua
(7, 1, 9, @yesterday, 300000, 'daxacnhan'),
(8, 2, 9, @yesterday, 200000, 'dahuy'),     -- Đã hủy

-- === Dữ liệu Hôm nay (@today) ===
-- Sân 1: Full buổi tối
(9, 1, 7, @today, 300000, 'daxacnhan'),
(10, 1, 8, @today, 300000, 'daxacnhan'),
(11, 1, 9, @today, 300000, 'chuaxacnhan'), -- Mới đặt, chưa cọc/duyệt

-- Sân 2: Có người đặt
(12, 2, 7, @today, 200000, 'daxacnhan'),
(6, 2, 8, @today, 200000, 'daxacnhan'),

-- Sân 3:
(13, 3, 8, @today, 350000, 'daxacnhan'),

-- === Dữ liệu Ngày mai (@tomorrow) ===
(14, 1, 7, @tomorrow, 300000, 'chuaxacnhan'),
(8, 5, 8, @tomorrow, 250000, 'daxacnhan'),
(9, 5, 9, @tomorrow, 250000, 'daxacnhan'),
(10, 6, 7, @tomorrow, 250000, 'daxacnhan'),

-- === Dữ liệu Ngày kia (@dayafter) ===
(11, 7, 9, @dayafter, 400000, 'chuaxacnhan'), -- Sân Bộ Công An
(12, 7, 10, @dayafter, 400000, 'daxacnhan');

-- ============================
--  5. INSERT PASSWORD RESETS
--  (Dữ liệu mẫu cho chức năng quên mật khẩu)
-- ============================
INSERT INTO password_resets (email, otp_code, expires_at) VALUES
('namhoang@gmail.com', '123456', DATE_ADD(NOW(), INTERVAL 15 MINUTE));

-- Bật lại kiểm tra khóa ngoại
SET FOREIGN_KEY_CHECKS = 1;

-- ============================
--  THÔNG BÁO
-- ============================
SELECT 'Data generated successfully for new schema!' AS Status;