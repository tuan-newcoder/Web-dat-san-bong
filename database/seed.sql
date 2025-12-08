INSERT INTO User (HoTen, username, password, email, sdt, quyen) VALUES
('Nguyen Van A', 'userA', 'passA', 'a@gmail.com', '0901111111', 'khachhang'),
('Tran Van B', 'chusan1', 'passB', 'b@gmail.com', '0902222222', 'chusan'),
('Admin', 'admin', 'admin123', 'admin@gmail.com', '0988888888', 'admin');
INSERT INTO SanBong (MaNguoiDung, TenSan, LoaiSan, DiaChi, TrangThai) VALUES
(2, 'Sân HUST 7 người', '7 nguoi', 'Hà Nội – Đại Cồ Việt', 'hoatdong'),
(2, 'Sân HUST 11 người', '11 nguoi', 'Hà Nội – Cầu Giấy', 'hoatdong');
INSERT INTO CaThueSan (MaSan, GioBD, GioKT, Ngay, TrangThai, Gia) VALUES
(1, '07:00', '09:00', CURDATE(), 'controng', 300000),
(1, '09:00', '11:00', CURDATE(), 'controng', 300000),
(1, '19:00', '21:00', CURDATE(), 'dadat',   350000),

(2, '18:00', '20:00', CURDATE(), 'controng', 400000),
(2, '20:00', '22:00', CURDATE(), 'dadat',    450000);
INSERT INTO LichDatSan (MaNguoiDung, MaCaThue, TrangThai) VALUES
(1, 3, 'daxacnhan'),
(1, 5, 'chuaxacnhan');
INSERT INTO HoaDon (MaDatSan, TongTien, TrangThai) VALUES
(1, 350000, 'chuathanhtoan');
