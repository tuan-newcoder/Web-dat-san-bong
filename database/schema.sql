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
    SDT VARCHAR(15),
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
    TrangThai ENUM('hoatdong', 'baotri') DEFAULT 'hoatdong',
	FOREIGN KEY (MaNguoiDung) REFERENCES User(MaNguoiDung)
);

-- ============================
--  TABLE: CaCoDinh
-- ============================
CREATE TABLE CaCoDinh (
    MaCD INT PRIMARY KEY AUTO_INCREMENT,
    GioBD TIME,
    GioKT TIME
);

-- ============================
--  TABLE: CaThueSan
-- ============================
CREATE TABLE CaThueSan (
    MaCaThue INT PRIMARY KEY AUTO_INCREMENT,
    MaSan INT NOT NULL,
    MaCD INT NOT NULL,
    Ngay DATE,
    TrangThai ENUM('dadat','controng') DEFAULT 'controng',
    Gia INT,
    FOREIGN KEY (MaSan) REFERENCES SanBong(MaSan),
    FOREIGN KEY (MaCD) REFERENCES CaCoDinh(MaCD)
);

-- ============================
--  TABLE: LichDatSan
-- ============================
CREATE TABLE LichDatSan (
    MaDatSan INT PRIMARY KEY AUTO_INCREMENT,
    MaNguoiDung INT NOT NULL,
    MaCaThue INT NOT NULL,
    TrangThai ENUM('chuaxacnhan','daxacnhan','dahuy') DEFAULT 'chuaxacnhan',
    FOREIGN KEY (MaNguoiDung) REFERENCES User(MaNguoiDung),
    FOREIGN KEY (MaCaThue) REFERENCES CaThueSan(MaCaThue)
);

-- ============================
--  TABLE: HoaDon
-- ============================
CREATE TABLE HoaDon (
    MaHoaDon INT PRIMARY KEY AUTO_INCREMENT,
    MaDatSan INT NOT NULL,
    TongTien DECIMAL(10,2) NOT NULL,
    TrangThai ENUM('chuathanhtoan','dathanhtoan') DEFAULT 'chuathanhtoan',
    FOREIGN KEY (MaDatSan) REFERENCES LichDatSan(MaDatSan)
);


