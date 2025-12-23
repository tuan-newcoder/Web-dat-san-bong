/* Cấu hình API URL */
const API_URL = 'http://localhost:3000/api';
const token = localStorage.getItem('userToken');

/* Cấu hình localStorage */

const Auth = {
    saveSession(token, userData) {
        localStorage.setItem('userToken', token);
        localStorage.setItem('user', JSON.stringify(userData));
    },

    getUserId() {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        // Trả về MaNguoiDung hoặc id tùy theo BE của bạn
        return user.MaNguoiDung || user.id; 
    },

    getUserData() {
        return JSON.parse(localStorage.getItem('user') || '{}');
    },

    // Xóa sạch khi đăng xuất
    clearSession() {
        localStorage.removeItem('userToken');
        localStorage.removeItem('user');
        sessionStorage.clear(); 
    }
};

/* === Quản lý Modal Boxes === */
var loginModal = document.getElementById("loginModal");
var registerModal = document.getElementById("registerModal");
var forgotPasswordModal = document.getElementById("forgotPasswordModal");

function openModal() { if (loginModal) loginModal.style.display = "flex"; }
function closeModal() { if (loginModal) loginModal.style.display = "none"; }
function openRegisterModal() { if (registerModal) registerModal.style.display = "flex"; }
function closeRegisterModal() { if (registerModal) registerModal.style.display = "none"; }
function openForgotPasswordModal() {
    closeModal();
    if (forgotPasswordModal) {
        forgotPasswordModal.style.display = "flex";
        const forgotEmailInput = document.getElementById('forgotEmail');
        const verificationSection = document.getElementById('verificationSection');
        if (forgotEmailInput) forgotEmailInput.value = '';
        if (verificationSection) verificationSection.style.display = 'none';
    }
}
function closeForgotPasswordModal() { if (forgotPasswordModal) forgotPasswordModal.style.display = "none"; }

// Gán các hàm quản lý modal vào phạm vi toàn cục (window) để html có thể gọi
window.openModal = openModal;
window.closeModal = closeModal;
window.openRegisterModal = openRegisterModal;
window.closeRegisterModal = closeRegisterModal;
window.openForgotPasswordModal = openForgotPasswordModal;
window.closeForgotPasswordModal = closeForgotPasswordModal;
window.sendVerificationCode = sendVerificationCode;
window.verifyCode = verifyCode;

/* === KẾT NỐI BACKEND (API Integration) === */

async function apiRequest(url, options = {}) {
    try {
        const token = localStorage.getItem('userToken');
        const headers = { 'Content-Type': 'application/json', ...options.headers };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const response = await fetch(url, { ...options, headers });
        
        // Kiểm tra nếu response rỗng hoặc không phải JSON
        const contentType = response.headers.get("content-type");
        let data = (contentType && contentType.includes("application/json")) 
            ? await response.json() 
            : await response.text();

        if (!response.ok) {
            // Lấy message lỗi từ JSON hoặc dùng text thuần
            const errMsg = (data && data.message) ? data.message : (typeof data === 'string' ? data : "Lỗi Server!");
            throw new Error(errMsg);
        }
        return data;
    } catch (error) {
        console.error('Lỗi chi tiết tại apiRequest:', error.message);
        throw error;
    }
}
// 1. Xử lý Đăng nhập (Đã có BE)

async function handleLogin(username, password) {
    try {
        // 1. Gọi API và nhận kết quả (đặt tên biến là 'result' để tránh nhầm lẫn)
        const result = await apiRequest(`${API_URL}/auth/login`, {
            method: 'POST',
            body: JSON.stringify({ username, password }),
        });

        // 2. Kiểm tra xem Backend trả về dữ liệu ở đâu? 
        // Nếu BE gửi { token: "...", data: { role: "admin", ... } }
        const userData = result.data || result.user; 

        if (!userData) {
            throw new Error("Không tìm thấy thông tin người dùng trong phản hồi từ Server.");
        }

        // 3. Lưu Session (Token và Thông tin user)
        Auth.saveSession(result.token, userData);

        // 4. Lấy 'role' an toàn 
        const role = userData.role;


        alert(`Đăng nhập thành công! Chào mừng ${userData.HoTen || username}`);
        closeModal();

        // 5. Chuyển hướng dựa trên role
        if (role === 'admin') {
            window.location.href = '/assets/admin/admin-dashboard.html';
        } else if (role === 'khachhang') {
            window.location.href = '/assets/after-login/after-login.html';
        } else if (role === 'chusan') {
            window.location.href = '/assets/owner/chu-san.html';
        } else {
            console.warn("Role không hợp lệ:", role);
            window.location.href = '/index.html';
        }

    } catch (error) { 
        console.error("Login Error Details:", error);
        alert("Lỗi đăng nhập: " + error.message);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const loginFormButton = document.querySelector('#loginModal button[type="submit"]');

    if (loginFormButton) {
        loginFormButton.addEventListener('click', (e) => {
            e.preventDefault();
            const username = document.getElementById('loginUsername').value;
            const password = document.getElementById('loginPassword').value;

            handleLogin(username, password);
        });
    }
});

// 2. Xử lý Đăng ký (Đã có BE)
async function handleRegister() {
    const HoTen = document.getElementById('registerFullName').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('registerConfirmPassword').value;
    const username = document.getElementById('registerUsername').value;
    const sdt = document.getElementById('registerPhone').value;

    if (password !== confirmPassword) {
        alert("Mật khẩu xác nhận không khớp!");
        return;
    }

    if (!HoTen || !email || !password || !username || !sdt) {
        alert("Vui lòng điền đầy đủ tất cả các trường bắt buộc.");
        return;
    }

    try {
        const data = await apiRequest(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ HoTen, email, password, username, sdt }),
        });

        alert("Đăng ký thành công! Bạn có thể đăng nhập ngay bây giờ.");
        closeRegisterModal();
        openModal();

    } catch (error) {
        alert(error.message);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const registerFormButton = document.querySelector('#registerModal button[type="submit"]');
    if (registerFormButton) {
        registerFormButton.addEventListener('click', (e) => {
            e.preventDefault();
            handleRegister();
        });
    }
});


// 3. Xử lý Quên mật khẩu (Gửi mã) (Đã có BE)
async function sendVerificationCode() {
    const sendVerificationUrl = `${API_URL}/auth/send-verification`;
    const email = document.getElementById('forgotEmail').value;

    if (!email) {
        alert("Vui lòng nhập email.");
        return;
    }

    try {
        const btn = document.getElementById('sendCodeBtn');
        btn.innerText = "Đang gửi...";
        btn.disabled = true;

        await apiRequest(sendVerificationUrl, {
            method: 'POST',
            body: JSON.stringify({ email }),
            headers: { 'Content-Type': 'application/json' },
        });

        alert("Mã xác minh đã được gửi đến email của bạn.");

        // Hiện phần nhập mật khẩu mới và mã code
        const verificationSection = document.getElementById('verificationSection');
        if (verificationSection) verificationSection.style.display = 'block';

        btn.innerText = "Gửi lại mã";
        btn.disabled = false;
    } catch (error) {
        alert(error.message);
        document.getElementById('sendCodeBtn').disabled = false;
    }
}
// 4. Xử lý Quên mật khẩu (Xác nhận mã và đổi mật khẩu) (Đã có BE)
async function verifyCode() {
    const verifyUrl = `${API_URL}/auth/reset-password`;
    const email = document.getElementById('forgotEmail').value;
    const code = document.getElementById('verificationCode').value;
    const newPassword = document.getElementById('newPassword').value;

    // Kiểm tra tính hợp lệ cơ bản
    if (!email || !code || !newPassword) {
        alert("Vui lòng điền đầy đủ Email, Mật khẩu mới và Mã xác minh.");
        return;
    }

    if (newPassword.length < 6) {
        alert("Mật khẩu mới phải có ít nhất 6 ký tự.");
        return;
    }

    try {
        await apiRequest(verifyUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: email,
                otp: code,
                newPassword: newPassword
            }),
        });

        alert("Mật khẩu đã được đặt lại thành công! Vui lòng đăng nhập lại.");

        document.getElementById('newPassword').value = '';
        document.getElementById('verificationCode').value = '';
        closeForgotPasswordModal();
        openModal(); // Mở lại modal đăng nhập

    } catch (error) {
        alert("Lỗi: " + error.message);
    }
}
// 5. Xử lý Đổi mật khẩu Profile 
const changePasswordModal = document.getElementById("changePasswordModal");

window.openChangePasswordModal = () => {
    if (changePasswordModal) changePasswordModal.style.display = "flex";
};

window.closeChangePasswordModal = () => {
    if (changePasswordModal) {
        changePasswordModal.style.display = "none";
        // Reset form khi đóng
        document.getElementById('changePasswordForm').reset();
    }
};

/**
 * Xử lý gọi API Đổi mật khẩu
 */
async function handleChangePassword() {
    // 1. Lấy giá trị từ các ô input
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPass').value;
    const confirmPassword = document.getElementById('confirmNewPass').value;

    // 2. Kiểm tra tính hợp lệ cơ bản
    if (!currentPassword || !newPassword || !confirmPassword) {
        return alert("Vui lòng điền đầy đủ tất cả các ô.");
    }

    if (newPassword !== confirmPassword) {
        return alert("Mật khẩu mới và mật khẩu xác nhận không khớp!");
    }

    if (currentPassword === newPassword) {
        return alert("Mật khẩu mới không được trùng với mật khẩu hiện tại.");
    }

    try {
        const token = localStorage.getItem('userToken');
        if (!token) throw new Error("Phiên làm việc hết hạn, vui lòng đăng nhập lại.");

        // 3. Gọi API gửi lên Backend
        await apiRequest(`${API_URL}/auth/change-password`, {
            method: 'PUT', 
            body: JSON.stringify({
                password: currentPassword, 
                newPassword: newPassword
            }),
        });

        // 4. Xử lý thành công
        alert("Đổi mật khẩu thành công!");
        
        // Reset form để xóa mật khẩu đã gõ
        document.getElementById('changePasswordForm').reset();
        closeChangePasswordModal();

    } catch (error) {
        alert("Lỗi: " + error.message);
    }
}
// Hàm đăng xuất 
function handleLogout() {
    if (confirm("Bạn có chắc chắn muốn đăng xuất?")) {
        Auth.clearSession(); // Xóa sạch token và user ID
        alert("Đăng xuất thành công!");
        window.location.href = "/index.html";
    }
}
// Toggle dropdown cha
function toggleDropdown(event) {
    event.preventDefault();
    event.stopPropagation();

    const btn = event.currentTarget;
    const dropdownId = btn.dataset.target;
    const target = document.getElementById(dropdownId);
    if (!target) return;

    // Đóng các dropdown khác 
    document.querySelectorAll('.owner-dropdown-content.show, .dropdown-content.show')
        .forEach(el => { if (el !== target) el.classList.remove('show'); });

    target.classList.toggle('show');
}

// Toggle submenu 
function toggleSubmenu(event) {
    event.preventDefault();
    event.stopPropagation();

    const btn = event.currentTarget;
    const submenuId = btn.dataset.target;
    const submenu = document.getElementById(submenuId);
    if (!submenu) return;

    // Đóng các submenu khác trong cùng dropdown
    const parent = btn.closest('.owner-dropdown-content') || btn.closest('.dropdown-content') || document;
    parent.querySelectorAll('.submenu-content')
        .forEach(el => { if (el !== submenu) el.classList.remove('show'); });

    submenu.classList.toggle('show');
}

// Đóng tất cả
function closeAllDropdowns() {
    document.querySelectorAll('.owner-dropdown-content.show, .dropdown-content.show, .submenu-content.show')
        .forEach(el => el.classList.remove('show'));
}

// DOM ready
document.addEventListener('DOMContentLoaded', () => {
    // Buttons
    const ownerBtn = document.getElementById('ownerDropdownButton');
    const userBtn = document.getElementById('dropdownButton');
    if (ownerBtn) ownerBtn.addEventListener('click', toggleDropdown);
    if (userBtn) userBtn.addEventListener('click', toggleDropdown);

    // Submenu buttons 
    const manageBtn = document.getElementById('managePitchesBtn');
    const revenueBtn = document.getElementById('revenueBtn');
    if (manageBtn) manageBtn.addEventListener('click', toggleSubmenu);
    if (revenueBtn) revenueBtn.addEventListener('click', toggleSubmenu);

    // Logout example
    const logoutLink = document.getElementById('logoutLink');
    if (logoutLink) logoutLink.addEventListener('click', (e) => {
        e.preventDefault();
        // Gọi hàm logout nếu có, hoặc chuyển trang
        if (typeof handleLogout === 'function') handleLogout();
        else alert('Đăng xuất');
    });
});

// Đóng dropdown nếu người dùng nhấp ra ngoài cửa sổ
window.addEventListener('click', (e) => {

    //  Đóng modal nếu click nền mờ
    if (loginModal && e.target === loginModal) closeModal();
    if (registerModal && e.target === registerModal) closeRegisterModal();
    if (forgotPasswordModal && e.target === forgotPasswordModal) closeForgotPasswordModal();

    //  Đóng dropdown nếu click ngoài dropdown
    if (!e.target.closest('.dropdown') && !e.target.closest('.owner-dropdown-content')) {
        closeAllDropdowns();
    }
});

/* --Detail script-- */

/* === LOGIC TÌM KIẾM, LỌC & PHÂN TRANG TỐI ƯU === */
// **** === (Cần thêm dữ liệu về ca của BE) === **** //

const StadiumApp = {
    allData: [],
    filteredData: [],
    currentPage: 1,
    itemsPerPage: 4,

    init() {
        this.fetchData();
        this.bindEvents();
    },

    // 1. Lấy dữ liệu từ Backend
    async fetchData() {
        try {
            const res = await fetch(`${API_URL}/fields`);
            this.allData = await res.json();
            this.filteredData = [...this.allData];
            this.renderPage(1);
        } catch (err) {
            console.error("Lỗi:", err);
            document.getElementById('stadiumList').innerHTML = "<p>Lỗi kết nối máy chủ.</p>";
        }
    },

    bindEvents() {
        // 1. Xử lý nút Tìm kiếm
        document.getElementById('searchButton')?.addEventListener('click', () => this.handleFilter());

        // 2. Xử lý nút Loại sân (Sân 5, 7, 11)
        const typeButtons = document.querySelectorAll('.calendar-type-button');

        typeButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const currentBtn = e.currentTarget;
                const wasActive = currentBtn.classList.contains('active');

                // Xóa class 'active' khỏi tất cả các nút trước
                typeButtons.forEach(b => b.classList.remove('active'));

                if (!wasActive) {
                    currentBtn.classList.add('active');
                }

                this.handleFilter();
            });
        });
    },

    // 2. Logic Lọc chính xác
    handleFilter() {
        const selectedType = document.querySelector('.calendar-type-button.active')?.innerText.trim() || "";
        const wardValue = document.getElementById('phuongSelect')?.value || "-- Chọn phường --";

        const normalizedWard = wardValue.trim().toLowerCase();

        this.filteredData = this.allData.filter(s => {
            // Lọc theo Loại Sân
            const matchesType = s.LoaiSan.includes(selectedType);

            // Lọc theo Phường
            const matchesWard = (wardValue === "-- Chọn phường --") ||
                (s.Phuong.toLowerCase().trim() === normalizedWard);

            // Chỉ lấy sân đang hoạt động
            const isActive = s.TrangThai === 'hoatdong';

            return matchesType && matchesWard && isActive;
        });

        this.renderPage(1); // Luôn về trang 1 sau khi lọc

    },

    // 3. Hiển thị dữ liệu và đếm số lượng
    renderPage(page) {
        this.currentPage = page;
        const listContainer = document.getElementById('stadiumList');
        const countContainer = document.getElementById('stadiumCount');
        if (!listContainer) return;

        // Cập nhật tổng số lượng
        if (countContainer) {
            countContainer.innerText = `(${this.filteredData.length})`;
        }

        // Xử lý khi không có kết quả
        if (this.filteredData.length === 0) {
            listContainer.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 50px;">
                    <p style="font-size: 18px; color: #555;">Không có kết quả tìm kiếm phù hợp.</p>
                </div>`;
            document.getElementById('pagination').innerHTML = "";
            return;
        }

        // Phân trang
        const start = (page - 1) * this.itemsPerPage;
        const end = start + this.itemsPerPage;
        const items = this.filteredData.slice(start, end);

        if (token) {
            listContainer.innerHTML = items.map(s => `
            <a href="../chi-tiet-san/san-A.html?id=${s.MaSan}" class="stadium-card">
                <img src="/images/sanA.png" alt="${s.TenSan}">
                <div class="stadium-info">
                    <h3>${s.TenSan}</h3>
                    <p><strong>Loại:</strong> ${s.LoaiSan}</p>
                    <p><strong>Địa chỉ:</strong> ${s.DiaChi}, ${s.Phuong}</p>
                    <p><strong>Giá:</strong> ${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(s.Gia)}</p>
                </div>
            </a>
        `).join('');
        } else {
            listContainer.innerHTML = items.map(s => `
            <a href="../chi-tiet-san/san-A-guest.html?id=${s.MaSan}" class="stadium-card">
                <img src="/images/sanA.png" alt="${s.TenSan}">
                <div class="stadium-info">
                    <h3>${s.TenSan}</h3>
                    <p><strong>Loại:</strong> ${s.LoaiSan}</p>
                    <p><strong>Địa chỉ:</strong> ${s.DiaChi}, ${s.Phuong}</p>
                    <p><strong>Giá:</strong> ${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(s.Gia)}</p>
                </div>
            </a>
        `).join('');
        }
        this.renderPagination();
    },

    // 4. Vẽ nút phân trang
    renderPagination() {
        const pages = Math.ceil(this.filteredData.length / this.itemsPerPage);
        const container = document.getElementById('pagination');
        if (!container || pages <= 1) {
            if (container) container.innerHTML = "";
            return;
        }

        container.innerHTML = Array.from({ length: pages }, (_, i) => i + 1)
            .map(p => `<button class="page-btn ${p === this.currentPage ? 'active' : ''}" onclick="StadiumApp.goToPage(${p})">${p}</button>`)
            .join('');
    },

    goToPage(p) {
        this.renderPage(p);
        document.getElementById('related-stadiums-section')?.scrollIntoView({ behavior: 'smooth' });
    }
};

// Xuất hàm ra phạm vi toàn cục
window.StadiumApp = StadiumApp;

document.addEventListener('DOMContentLoaded', () => StadiumApp.init());

/* Chi tiết sân cho chủ sân */

function calculateRevenue(bookings) {
    let total = 0;
    bookings.forEach(b => {
        total += b.hours * b.price;
    });
    return total;
}

// DỮ LIỆU GIẢ để test
const demoBookings = [
    { hours: 2, price: 300000 },
    { hours: 1.5, price: 300000 },
    { hours: 3, price: 300000 }
];

// Hiển thị doanh thu
const revenueValue = calculateRevenue(demoBookings);
const revenueElement = document.getElementById('revenue');
if (revenueElement) {
    const revenueValue = calculateRevenue(demoBookings);
    revenueElement.innerText = revenueValue.toLocaleString('vi-VN') + " VNĐ";
}

function savePitchInfo() {
    const data = {
        address: document.getElementById('address').value,
        price: document.getElementById('price').value,
        timeRange: document.getElementById('timeRange').value
    };

    console.log("Dữ liệu gửi backend:", data);
    alert("Đã lưu thông tin sân");
}

// Hàm lấy thông tin user từ Token và điền vào form (Chưa có BE)
// 1. Hàm tự động lấy thông tin (Chỉ chạy nếu có Token và không ép đăng nhập)
async function fetchUserInfo() {
    const userId = Auth.getUserId(); // Lấy ID từ localStorage
    if (!userId) return;

    try {
        const response = await apiRequest(`${API_URL}/users/${userId}`, {
            method: 'GET'
        });

        // Backend trả về dữ liệu nằm trong trường .data
        if (response && response.data) {
            const userData = response.data;
            const nameField = document.getElementById('fullName');
            const emailField = document.getElementById('email');
            const phoneField = document.getElementById('phone');

            if (nameField) nameField.value = userData.HoTen || '';
            if (emailField) emailField.value = userData.email || '';
            if (phoneField) phoneField.value = userData.sdt || '';
        }
    } catch (err) {
        console.warn("Endpoint /users/" + userId + " không tồn tại hoặc lỗi.");
    }
}

// 2. Xử lý Submit Form Đăng ký chủ sân
const ownerForm = document.getElementById('ownerForm');
if (ownerForm) {
    ownerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('userToken');

        const formData = new FormData(ownerForm);

        try {
            const submitBtn = ownerForm.querySelector('button[type="submit"]');
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.textContent = "Đang xử lý...";
            }

            const res = await fetch(`${API_URL}/owner-register`, {
                method: 'POST',
                headers: { 'Authorization': 'Bearer ' + token },
                body: formData
            });

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                throw new Error(errorData.message || 'Gửi yêu cầu thất bại.');
            }

            alert('Đăng ký chủ sân thành công! Chúng tôi sẽ phản hồi sớm qua Email.');
            ownerForm.reset();
            if (document.getElementById('file-name-display')) {
                document.getElementById('file-name-display').textContent = "";
            }

        } catch (err) {
            alert("Lỗi: " + err.message);
        } finally {
            const submitBtn = ownerForm.querySelector('button[type="submit"]');
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = "Gửi đăng ký";
            }
        }
    });
}

// 3. Khởi tạo khi trang tải xong
document.addEventListener('DOMContentLoaded', () => {
    // Tự động điền nếu đã có token
    fetchUserInfo();

    // Khởi tạo hiển thị tên file
    initFileDisplay();

    // Tải dữ liệu bảng nếu đang ở trang Admin
    if (document.getElementById('bookingTableBody')) fetchBookings();
    if (document.getElementById('user-management-table')) loadUserTable();
});

/* === XỬ LÝ HIỂN THỊ TÊN FILE CHỨNG NHẬN === */
function initFileDisplay() {
    const fileInput = document.getElementById('businessCert');
    const fileNameDisplay = document.getElementById('file-name-display');

    if (fileInput && fileNameDisplay) {
        fileInput.addEventListener('change', function () {
            if (this.files && this.files.length > 0) {
                fileNameDisplay.textContent = this.files[0].name;
                fileNameDisplay.style.color = "#040308ff";
                fileNameDisplay.style.fontWeight = "bold";
            } else {
                fileNameDisplay.textContent = "";
            }
        });
    }
}
// Đảm bảo hàm này được gọi
document.addEventListener('DOMContentLoaded', initFileDisplay);


document.addEventListener('DOMContentLoaded', () => {
    const ownerForm = document.getElementById('ownerForm');
    const loginModal = document.getElementById('loginModal');
    const loginBtn = document.getElementById('loginBtn');
    const closeLogin = document.getElementById('closeLogin');

    if (!localStorage.getItem('userToken')) localStorage.setItem('userToken', '');

    // Mở modal đăng nhập
    function openLoginModal() { loginModal.style.display = 'flex'; }
    function closeLoginModal() { loginModal.style.display = 'none'; }

    if (closeLogin) closeLogin.addEventListener('click', closeLoginModal);

    if (loginBtn) {
        loginBtn.addEventListener('click', () => {
            const username = document.getElementById('loginUsername').value;
            const password = document.getElementById('loginPassword').value;
            if (username && password) {
                localStorage.setItem('userToken', 'demo-token'); 
                alert("Đăng nhập thành công!");
                closeLoginModal();
            } else {
                alert("Vui lòng nhập đầy đủ thông tin đăng nhập!");
            }
        });
    }

    if (ownerForm) {
        ownerForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            const token = localStorage.getItem('userToken');

            const formData = new FormData(ownerForm);
            try {
                console.log("Dữ liệu gửi:", {
                    stadiumName: formData.get('fullName'),
                    type: formData.get('type'),
                    address: formData.get('address'),
                    price: parseInt(formData.get('price')),
                    startTime: formData.get('startTime'),
                    endTime: formData.get('endTime'),
                    imageFile: formData.get('businessCert')
                });

                alert("Đăng ký sân thành công!");
                ownerForm.reset();

            } catch (error) {
                alert("Có lỗi xảy ra: " + error.message);
            }
        });
    }

    // Đóng modal khi click ngoài
    window.addEventListener('click', (e) => {
        if (e.target === loginModal) closeLoginModal();
    });
});

/* Scripts cho dat-san.html */

/* === LOGIC TRANG ĐẶT SÂN: ĐIỀN THÔNG TIN USER & LỊCH ĐẶT === */

document.addEventListener('DOMContentLoaded', async () => {
    const bookingForm = document.getElementById('bookingForm');
    if (!bookingForm) return;

    // 1. Lấy dữ liệu tạm từ sessionStorage (Lịch đặt sân)
    const pendingBooking = JSON.parse(sessionStorage.getItem('pendingBooking'));

    if (pendingBooking && pendingBooking.length > 0) {
        const maSan = pendingBooking[0].maSan;
        
        // Điền Ngày và Ca vào form
        const dateInput = document.getElementById('date');
        const caInput = document.getElementById('number');
        if (dateInput) dateInput.value = pendingBooking[0].date;
        if (caInput) caInput.value = pendingBooking.map(item => item.ca).join(', ');

        // Tải QR Code và Thông tin người dùng song song để tối ưu tốc độ
        await Promise.all([
            loadOwnerQR(maSan),
            fillLoggedUserInfo() // Hàm mới để lấy thông tin Tên & SĐT
        ]);
    } else {
        alert("Bạn chưa chọn ca đặt sân nào!");
        window.location.href = "detail-login.html";
    }
});

/**
 * Hàm lấy thông tin người dùng đang đăng nhập từ BE và điền vào form
 */
async function fillLoggedUserInfo() {
    const token = localStorage.getItem('userToken');
    if (!token) return;

    try {
        // Gọi API lấy thông tin profile của user đang log
        const userData = await apiRequest(`${API_URL}/users/${userId}`, {
            method: 'GET',
            headers: { 'Authorization': 'Bearer ' + token }
        });

        if (userData) {
            const nameInput = document.getElementById('name');
            const sdt = document.getElementById('phone');

            // Điền thông tin vào các ô input nếu chúng tồn tại
            // 'HoTen' và 'phone' là các trường giả định từ JSON của bạn
            if (nameInput) nameInput.value = userData.HoTen || "";
            if (sdt) sdt.value = userData.sdt || "";
            
        }
    } catch (error) {
        console.warn("Không thể tự động lấy thông tin người dùng:", error.message);
        
        const savedUser = JSON.parse(localStorage.getItem('user'));
        if (savedUser) {
            if (document.getElementById('name')) document.getElementById('name').value = savedUser.username || "";

        }
    }
}

/**
 * Hàm tải mã QR của chủ sân (Giữ nguyên logic cũ)
 */
async function loadOwnerQR(maSan) {
    try {
        const stadium = await apiRequest(`${API_URL}/fields/${maSan}`);
        if (stadium && stadium.QrChuSan) {
            const qrContainer = document.getElementById('qrContainer');
            const qrImage = document.getElementById('qrOwnerImage');
            if (qrContainer && qrImage) {
                qrImage.src = stadium.QrChuSan;
                qrContainer.style.display = 'block';
            }
        }
    } catch (e) {
        console.error("Lỗi tải QR chủ sân:", e);
    }
}
/* Script cho thu hồi sân */
document.addEventListener('DOMContentLoaded', () => {

    const revokeForm = document.getElementById('revokeForm');

    if (revokeForm) {
        revokeForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            // KIỂM TRA QUYỀN TRUY CẬP TẠI ĐÂY
            const token = localStorage.getItem('userToken');
            if (!token) {
                alert("Bạn cần Đăng nhập với tư cách Chủ sân để thực hiện thao tác này.");
                // Mở modal đăng nhập nếu có
                if (typeof openModal === 'function') openModal();
                return; // Chặn việc gửi form
            }

            const stadiumId = document.getElementById('stadiumSelect').value;
            const reason = document.getElementById('reason').value;
            const startDate = document.getElementById('startDate').value;

            if (!stadiumId || !reason || !startDate) {
                alert("Vui lòng điền đầy đủ thông tin.");
                return;
            }

            // Dữ liệu gửi đi
            const formData = {
                stadiumId: stadiumId,
                reason: reason,
                effectiveDate: startDate
            };

            console.log("Dữ liệu Yêu cầu Thu Hồi Sân:", formData);

            // Xử lý gửi API 
            try {

                const response = await fetch(`${API_URL}/auth/`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(formData)
                });

                if (!response.ok) {
                    const errText = await response.text();
                    throw new Error(errText || 'Gửi yêu cầu thất bại');
                }

                alert(`Yêu cầu thu hồi sân ${stadiumId} đã được gửi thành công! Hệ thống sẽ xử lý từ ngày ${startDate}.`);
                revokeForm.reset();

            } catch (error) {
                alert(error.message || "Có lỗi xảy ra trong quá trình gửi yêu cầu.");
            }
        });
    }
});

/* Script cho admin-dashboard */
// Dữ liệu giả lập cho bảng người dùng 
const userData = [
    { stt: 1, user_id: '#9A2D', username: 'Wibuchua', fullname: 'Nguyễn Duy V', phone: '0901xxxxxx', registerDate: '2025-10-01', role: 'Chủ sân' },
    { stt: 2, user_id: '#F3E1', username: 'user_b', fullname: 'Trần Thị H', phone: '0912xxxxxx', registerDate: '2025-11-15', role: 'Người dùng' },
    { stt: 3, user_id: '#B6C5', username: 'user_c', fullname: 'Lê Văn T', phone: '0987xxxxxx', registerDate: '2025-12-01', role: 'Người dùng' },
    { stt: 4, user_id: '#1G4H', username: 'admin_d', fullname: 'Phạm Q', phone: '0977xxxxxx', registerDate: '2025-09-01', role: 'Admin' },
];


function createUserRowHTML(user) {
    const roles = ['Người dùng', 'Chủ sân', 'Admin'];

    // Tạo dropdown phân cấp
    const roleOptions = roles.map(role =>
        `<option value="${role}" ${user.role === role ? 'selected' : ''}>${role}</option>`
    ).join('');

    return `
        <tr data-user-id="${user.user_id}">
            <td>${user.stt}</td>
            <td>${user.user_id}</td> <td>${user.username}</td>
            <td>${user.fullname}</td>
            <td>${user.phone.substring(0, 4)}...</td>
            <td>${user.registerDate}</td>
            <td>
                <select class="role-select" onchange="handleRoleChange(this, '${user.user_id}')">
                    ${roleOptions}
                </select>
            </td>
        </tr>
    `;
}

/**
 * Tải dữ liệu người dùng vào bảng.
 */
function loadUserTable() {
    const tableBody = document.getElementById('user-management-table');
    if (tableBody) {
        const rowsHTML = userData.map(createUserRowHTML).join('');
        tableBody.innerHTML = rowsHTML;
    }
}

/** Xử lý khi phân cấp người dùng bị thay đổi. */
function handleRoleChange(selectElement, userId) {
    const newRole = selectElement.value;
    const oldRole = selectElement.getAttribute('data-old-role');

    // Lưu vai trò cũ trước khi xác nhận
    if (!oldRole) selectElement.setAttribute('data-old-role', userData.find(u => u.user_id === userId).role);

    if (confirm(`Xác nhận thay đổi phân cấp của người dùng ID ${userId} thành "${newRole}"?`)) {
        console.log(`Đang gửi yêu cầu cập nhật vai trò: User ID ${userId}, Role: ${newRole}`);

        alert(`Đã cập nhật vai trò của người dùng ID ${userId} thành: ${newRole} (Demo thành công)`);
        selectElement.setAttribute('data-old-role', newRole); // Cập nhật vai trò cũ thành mới

    } else {
        // Nếu hủy bỏ, quay lại giá trị cũ
        selectElement.value = oldRole || userData.find(u => u.user_id === userId).role;
    }
}

// Gán hàm vào window để HTML có thể gọi
window.handleRoleChange = handleRoleChange;

document.addEventListener('DOMContentLoaded', loadUserTable);

/* Script check access */
// document.addEventListener("DOMContentLoaded", function () {

//     const loginSubmitBtn = document.querySelector("#loginModal button[type='submit']");
//     if (loginSubmitBtn) {
//         loginSubmitBtn.addEventListener("click", handleLogin);
//     }
// });

// Hàm kiểm tra trạng thái đăng nhập
function checkAccess(event, targetUrl) {
    event.preventDefault(); // Chặn chuyển hướng ngay lập tức
    const token = localStorage.getItem("userToken");

    if (token) {
        window.location.href = targetUrl;
    } else {
        alert("Bạn cần đăng nhập để thực hiện hành động này!");
        openModal(); // Mở modal đăng nhập cho khách
    }
}

async function fetchBookings() {
    const tableBody = document.getElementById('bookingTableBody');
    if (!tableBody) return;

    const status = document.getElementById('statusFilter')?.value || 'all';

    try {
        const response = await apiRequest(`${API_URL}/lichdatsan/owner?status=${status}`, {
            method: 'GET'
        });

        tableBody.innerHTML = response.map(order => `
            <tr>
                <td>#${order.id}</td>
                <td><strong>${order.customerName}</strong><br><small>${order.phone}</small></td>
                <td>${order.pitchName}</td>
                <td>${order.date}<br><small>${order.startTime} - ${order.endTime}</small></td>
                <td>${formatCurrency(order.totalPrice)}</td>
                <td><span class="status-badge ${getStatusClass(order.status)}">${getStatusText(order.status)}</span></td>
                <td>
                    ${order.status === 'pending' ? `
                        <button class="action-button btn-success" onclick="updateBookingStatus(${order.id}, 'confirmed')">Duyệt</button>
                        <button class="action-button btn-danger" onclick="updateBookingStatus(${order.id}, 'cancelled')">Từ chối</button>
                    ` : `<button class="action-button btn-info" onclick="viewDetail(${order.id})">Chi tiết</button>`}
                </td>
            </tr>
        `).join('');
    } catch (error) {
        tableBody.innerHTML = `<tr><td colspan="7" style="text-align: center;">Không có dữ liệu đơn đặt.</td></tr>`;
    }
}

// Đăng ký tự động chạy khi vào trang
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('bookingTableBody')) fetchBookings();
});

const urlParams = new URLSearchParams(window.location.search);
const currentMaSan = urlParams.get('id');

// --- Quản lý Modal ---
window.openScheduleModal = () => {
    document.getElementById('scheduleModal').style.display = 'flex';
    renderPitchSchedule(); 
};

window.closeScheduleModal = () => {
    document.getElementById('scheduleModal').style.display = 'none';
};

window.closePaymentModal = () => {
    document.getElementById('paymentModal').style.display = 'none';
    renderPitchSchedule(); // Cập nhật lại lịch để thấy ca vừa đặt chuyển màu
};

/**
 * Render lịch đặt sân 7 ngày
 */
async function renderPitchSchedule() {
    const tbody = document.getElementById('schedule-body');
    if (!tbody || !currentMaSan) return;

    let bookedSlots = [];
    try {
        const response = await apiRequest(`${API_URL}/slots/fields/${currentMaSan}`, {
            method: 'GET'
        });
        bookedSlots = response.data || [];
    } catch (e) { 
        console.warn("Lỗi tải lịch từ Backend:", e.message); 
    }

    const today = new Date();
    tbody.innerHTML = Array.from({ length: 7 }, (_, i) => {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        const isoDate = date.toISOString().split('T')[0]; 
        const displayDate = date.toLocaleDateString('vi-VN');

        let cells = `<td style="font-weight:bold; background:#f4f4f4;">${i === 0 ? displayDate + ' (Hôm nay)' : displayDate}</td>`;

        for (let ca = 1; ca <= 12; ca++) {
            const slotData = bookedSlots.find(s => s.ngay === isoDate && s.ca == ca);
            
            // Logic: Daxacnhan hoặc chuaxacnhan thì hiện "Hết"
            const isUnavailable = slotData && (slotData.TrangThai === 'daxacnhan' || slotData.TrangThai === 'chua xac nhan');

            const statusClass = isUnavailable ? 'booked' : 'available';
            const statusText = isUnavailable ? 'Hết' : '';

            cells += `
                <td class="slot-cell ${statusClass}" 
                    data-date="${isoDate}" data-ca="${ca}" 
                    onclick="toggleSelectSlot(this)">
                    ${statusText}
                </td>`;
        }
        return `<tr>${cells}</tr>`;
    }).join('');
}

/**
 * Logic chọn ca (Duy nhất 1 ô)
 */
window.toggleSelectSlot = (el) => {
    if (el.classList.contains('booked')) return;
    const previousSelected = document.querySelector('.slot-cell.selected');
    if (previousSelected && previousSelected !== el) {
        previousSelected.classList.remove('selected');
    }
    el.classList.toggle('selected');
};

/**
 * BƯỚC QUAN TRỌNG: Đặt sân & Hiện thông tin chuyển khoản
 */
window.proceedToBooking = async () => {
    const selected = document.querySelector('.slot-cell.selected');
    if (!selected) return alert("Vui lòng chọn 1 ca còn trống trên lịch!");

    // 1. Lấy thông tin user (Dùng hàm Auth.getUserId() đã viết ở bước trước)
    const userId = Auth.getUserId();

    if (!userId) {
        alert("Vui lòng đăng nhập để đặt sân!");
        if (typeof openModal === 'function') openModal();
        return;
    }

    // 2. Chuẩn bị dữ liệu gửi lên Backend (Khớp với cấu trúc JSON bạn yêu cầu)
    const bookingData = {
        maNguoiDung: userId,
        maSan: parseInt(currentMaSan),
        ngay: selected.dataset.date, 
        ca: parseInt(selected.dataset.ca) 
    };

    try {
        // Tắt modal lịch trước khi hiện modal thanh toán
        closeScheduleModal();

        // BƯỚC 1: POST /bookings (Theo sơ đồ)
        const bookingResponse = await apiRequest(`${API_URL}/bookings`, {
            method: 'POST',
            body: JSON.stringify(bookingData)
        });

        // BƯỚC 2: GET /lichdatsan/bank
        const bankInfo = await apiRequest(`${API_URL}/lichdatsan/bank?maSan=${currentMaSan}`, {
            method: 'GET'
        });

        // BƯỚC 3: Hiển thị Modal Thanh toán và đổ dữ liệu
        if (bankInfo && bankInfo.data) {
            const data = bankInfo.data;
            document.getElementById('bankName').innerText = data.tenNganHang || "N/A";
            document.getElementById('bankSTK').innerText = data.stk || "N/A";
            document.getElementById('bankOwner').innerText = data.tenChuTK || "N/A";
            
            // Nội dung chuyển khoản: DS + ID đơn hàng vừa tạo
            const bookingId = bookingResponse.data?.id || bookingResponse.id || "";
            document.getElementById('paymentContent').innerText = `DS${bookingId}`;
            
            // Reset hiển thị Modal về bước 1
            document.getElementById('paymentStep1').style.display = 'block';
            document.getElementById('paymentStep2').style.display = 'none';
            document.getElementById('paymentModal').style.display = 'flex';
        }
    } catch (error) {
        alert("Lỗi khi đặt sân: " + error.message);
        // Nếu lỗi, mở lại lịch để user chọn lại
        openScheduleModal();
    }
};

/**
 * Load thông tin chi tiết sân
 */
async function loadPitchDetails() {
    if (!currentMaSan) return;
    try {
        const stadium = await apiRequest(`${API_URL}/fields/${currentMaSan}`);
        if (stadium) {
            document.getElementById('displayTenSan').innerText = stadium.TenSan;
            document.getElementById('displayChuSan').innerText = stadium.TenChuSan || "N/A";
            document.getElementById('displaySDT').innerText = stadium.SoDienThoai || "N/A";
            document.getElementById('displayLoaiSan').innerText = stadium.LoaiSan;
            document.getElementById('displayDiaChi').innerText = `${stadium.DiaChi}, ${stadium.Phuong}`;
            document.getElementById('displayGia').innerText = new Intl.NumberFormat('vi-VN').format(stadium.Gia);
        }
    } catch (err) {
        console.error("Lỗi khi tải chi tiết sân:", err);
    }
}

/* === KHỞI TẠO === */
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('displayTenSan')) loadPitchDetails();

    // Lắng nghe nút "Tôi đã thanh toán"
    const confirmBtn = document.getElementById('confirmPaidBtn');
    if (confirmBtn) {
        confirmBtn.addEventListener('click', () => {
            document.getElementById('paymentStep1').style.display = 'none';
            document.getElementById('paymentStep2').style.display = 'block';
        });
    }
});
/* === Script cho Profile === */

/* === QUẢN LÝ MODAL ĐỔI MẬT KHẨU === */
window.openChangePasswordModal = () => {
    const modal = document.getElementById("changePasswordModal");
    if (modal) modal.style.display = "flex";
};

window.closeChangePasswordModal = () => {
    const modal = document.getElementById("changePasswordModal");
    if (modal) {
        modal.style.display = "none";
        document.getElementById('changePasswordForm')?.reset();
    }
};

/* === TẢI THÔNG TIN PROFILE === */
async function loadUserProfile() {
    // Lấy ID từ bộ nhớ LocalStorage thông qua hàm tiện ích Auth
    const userId = Auth.getUserId();

    if (!userId) {
        console.error("Không tìm thấy ID người dùng. Vui lòng đăng nhập lại.");
        return;
    }

    try {
        // 1. Gọi API lấy thông tin
        const response = await apiRequest(`${API_URL}/users/${userId}`, { method: 'GET' });

        // 2. Kiểm tra dữ liệu (Backend bọc trong lớp .data)
        if (response && response.data) {
            const userData = response.data;

            // 3. Đổ dữ liệu vào các ID tương ứng trong HTML của bạn
            document.getElementById('profileUsername').value = userData.username || "";
            document.getElementById('profileFullName').value = userData.HoTen || "";
            document.getElementById('profileEmail').value = userData.email || "";
            document.getElementById('profilePhone').value = userData.sdt || userData.phone || "";
            
            console.log("Tải hồ sơ thành công cho ID:", userId);
        }
    } catch (error) {
        console.error("Lỗi khi tải Profile:", error.message);
    }
}

/* === CHỈNH SỬA & LƯU THÔNG TIN === */
async function handleEditSave() {
    const mainBtn = document.getElementById('mainBtn');
    const inputs = [
        document.getElementById('profileFullName'),
        document.getElementById('profileEmail'),
        document.getElementById('profilePhone')
    ];

    if (!mainBtn) return;

    if (mainBtn.innerText === "Chỉnh sửa thông tin") {
        // --- CHẾ ĐỘ CHỈNH SỬA ---
        inputs.forEach(input => {
            if (input) {
                input.removeAttribute('readonly');
                input.style.backgroundColor = "#fff";
                input.style.border = "1px solid #2563eb";
            }
        });
        mainBtn.innerText = "Lưu thông tin";
        mainBtn.style.backgroundColor = "#16a34a"; // Đổi sang màu xanh lá
    } else {
        // --- CHẾ ĐỘ LƯU DỮ LIỆU ---
        const userId = Auth.getUserId();
        const userLocal = Auth.getUserData();

        const updatedData = {
            HoTen: document.getElementById('profileFullName').value,
            email: document.getElementById('profileEmail').value,
            sdt: document.getElementById('profilePhone').value // Gửi 'sdt' khớp với BE
        };

        try {
            mainBtn.innerText = "Đang lưu...";
            mainBtn.disabled = true;

            await apiRequest(`${API_URL}/users/${userId}`, {
                method: 'PUT',
                body: JSON.stringify(updatedData)
            });

            alert("Cập nhật thông tin thành công!");

            // Cập nhật lại LocalStorage để đồng bộ tên trên Navbar ngay lập tức
            const newUser = { ...userLocal, ...updatedData };
            localStorage.setItem('user', JSON.stringify(newUser));

            // Khóa lại các ô input
            location.reload(); 
        } catch (error) {
            alert("Lỗi khi lưu: " + error.message);
            mainBtn.innerText = "Lưu thông tin";
            mainBtn.disabled = false;
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {

    if (document.getElementById('profileUsername')) {
        loadUserProfile();
    }

    // 2. Gán sự kiện click cho nút Chỉnh sửa/Lưu
    const mainBtn = document.getElementById('mainBtn');
    if (mainBtn) {
        mainBtn.addEventListener('click', handleEditSave);
    }
});