-- ============================
--  CREATE DATABASE
-- ============================
CREATE DATABASE qlsanbong;
USE qlsanbong;

-- ============================
--  TABLE: User
-- ============================
CREATE TABLE User (
    MaNguoiDung INT PRIMARY KEY AUTO_INCREMENT,
    HoTen VARCHAR(100) NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100) UNIQUE,
    sdt VARCHAR(15),
    stk VARCHAR(25),
    bank VARCHAR(50),
    quyen ENUM('admin', 'chusan', 'khachhang') DEFAULT 'khachhang'
);

-- ============================
--  TABLE: UpRole
-- ============================
CREATE TABLE UpRole (
    MaUpRole INT AUTO_INCREMENT PRIMARY KEY,
    MaNguoiDung INT,
    HoTen VARCHAR(100),
    Email VARCHAR(100),
    Sdt VARCHAR(15),
	Stk VARCHAR(25),
    Bank VARCHAR(50),
    AnhGiayPhep MEDIUMBLOB,
    TrangThai ENUM('dangxuly', 'chapnhan', 'tuchoi') DEFAULT 'dangxuly',
    FOREIGN KEY (MaNguoiDung) REFERENCES user(MaNguoiDung)
);


-- ============================
--  TABLE: SanBong
-- ============================
CREATE TABLE SanBong (
    MaSan INT PRIMARY KEY AUTO_INCREMENT,
    MaNguoiDung INT,
    TenSan VARCHAR(100) NOT NULL,
    LoaiSan VARCHAR(50),
    DiaChi VARCHAR(255),
    Phuong VARCHAR(255),
    Gia INT,
    TrangThai ENUM('hoatdong', 'baotri', 'ngunghoatdong') DEFAULT 'hoatdong',
	FOREIGN KEY (MaNguoiDung) REFERENCES User(MaNguoiDung)
);


-- ============================
--  TABLE: LichDatSan
-- ============================
CREATE TABLE LichDatSan (
    MaDatSan INT PRIMARY KEY AUTO_INCREMENT,
    MaNguoiDung INT NOT NULL,
    MaSan INT NOT NULL,
    Ca INT,
    Ngay DATE,
    TongTien DECIMAL(10,2) NOT NULL,
    TrangThai ENUM('chuaxacnhan','daxacnhan','dahuy') DEFAULT 'chuaxacnhan',
    FOREIGN KEY (MaNguoiDung) REFERENCES User(MaNguoiDung),
    FOREIGN KEY (MaSan) REFERENCES SanBong(MaSan)
);


-- ============================
--  TABLE: PASSWORD RESET
-- ============================
CREATE TABLE password_resets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    otp_code VARCHAR(10) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL, -- Thời điểm hết hạn
    INDEX (email)
);

