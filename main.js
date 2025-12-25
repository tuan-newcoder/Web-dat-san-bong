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

        // 4. Lấy 'role'
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
        // Thiết lập ngày mặc định là hôm nay cho input date
        const dateInput = document.getElementById('dateSelect');
        if (dateInput) {
            dateInput.min = new Date().toISOString().split("T")[0];
        }
    },

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
        document.getElementById('searchButton')?.addEventListener('click', () => this.handleFilter());

        const typeButtons = document.querySelectorAll('.calendar-type-button');
        typeButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const currentBtn = e.currentTarget;
                const wasActive = currentBtn.classList.contains('active');
                typeButtons.forEach(b => b.classList.remove('active'));
                if (!wasActive) currentBtn.classList.add('active');
                // Lưu ý: handleFilter giờ là async nên ta gọi bình thường
                this.handleFilter();
            });
        });
    },

    // 2. Logic Lọc kết hợp API Search
    async handleFilter() {
        // --- A. LẤY GIÁ TRỊ TỪ UI ---
        const activeBtn = document.querySelector('.calendar-type-button.active');
        const selectedType = activeBtn ? activeBtn.innerText.trim() : "";

        const wardSelect = document.getElementById('phuongSelect');
        const wardValue = wardSelect ? wardSelect.value : "-- Tất cả --";
        const normalizedWard = wardValue.trim().toLowerCase();

        const dateVal = document.getElementById('dateSelect').value;
        const caSelect = document.getElementById('caSelect');
        const caVal = caSelect ? caSelect.value : "-- Chọn ca --";
        
        const caNumber = caVal.match(/\d+/) ? caVal.match(/\d+/)[0] : "";

        let baseData = [];

        // --- B. XỬ LÝ GỌI API SEARCH NẾU CÓ NGÀY VÀ CA ---
        if (dateVal && caNumber) {
            try {
                const response = await apiRequest(`${API_URL}/fields/search?Ngay=${dateVal}&Ca=${caNumber}`, {
                    method: 'GET'
                });
                baseData = response.data || response;
            } catch (error) {
                console.error("Lỗi khi tìm kiếm theo ca/ngày:", error);
                alert("Không thể tải dữ liệu theo ca đã chọn.");
                baseData = []; 
            }
        } else {
            // Nếu không chọn đủ Ngày/Ca, dùng dữ liệu gốc ban đầu
            baseData = [...this.allData];
        }

        // --- C. TIẾP TỤC LỌC CỤC BỘ THEO LOẠI SÂN VÀ PHƯỜNG ---
        this.filteredData = baseData.filter(s => {
            const matchesType = !selectedType || s.LoaiSan.trim() === selectedType;
            
            const matchesWard = (wardValue === "-- Tất cả --") || 
                                (s.Phuong && s.Phuong.toLowerCase().trim() === normalizedWard);

            const isActive = s.TrangThai === 'hoatdong' || s.TrangThai === 'baotri';

            return matchesType && matchesWard && isActive;
        });

        this.renderPage(1);
        console.log("Kết quả lọc:", this.filteredData.length);
    },

    // 3. Hiển thị
renderPage(page) {
    this.currentPage = page;
    const listContainer = document.getElementById('stadiumList');
    const countContainer = document.getElementById('stadiumCount');
    if (!listContainer) return;

    if (countContainer) countContainer.innerText = `(${this.filteredData.length})`;

    if (this.filteredData.length === 0) {
        listContainer.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 50px;">
            <p style="font-size: 18px; color: #555;">Không có kết quả phù hợp.</p>
        </div>`;
        if (document.getElementById('pagination')) document.getElementById('pagination').innerHTML = "";
        return;
    }

    // 1. Lấy thông tin người dùng hiện tại
    const user = Auth.getUserData(); //
    const role = user.role; //
    const token = localStorage.getItem('userToken'); //

    const start = (page - 1) * this.itemsPerPage;
    const items = this.filteredData.slice(start, start + this.itemsPerPage);

    // 2. Render danh sách sân
    listContainer.innerHTML = items.map(s => {
        let detailUrl = '';

        // Kiểm tra xem có token (đã đăng nhập) hay không
        if (token) {
            if (role === 'chusan') {
                detailUrl = '../chi-tiet-san/san-A-owner.html'; 
            } else {
                detailUrl = '../chi-tiet-san/san-A.html';
            }
        } else {
            // Nếu chưa đăng nhập 
            detailUrl = '../chi-tiet-san/san-A-guest.html'; 
        }

        return `
            <a href="${detailUrl}?id=${s.MaSan}" class="stadium-card">
                <img src="/images/sanA.png" alt="${s.TenSan}">
                <div class="stadium-info">
                    <h3>${s.TenSan}</h3>
                    <p><strong>Loại:</strong> ${s.LoaiSan}</p>
                    <p><strong>Địa chỉ:</strong> ${s.DiaChi}, ${s.Phuong}</p>
                    <p><strong>Giá:</strong> ${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(s.Gia)}</p>
                </div>
            </a>
        `;
    }).join('');

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

window.StadiumApp = StadiumApp;
document.addEventListener('DOMContentLoaded', () => StadiumApp.init());

/* Script cho Đăng ký sân */

document.addEventListener('DOMContentLoaded', () => {
    const ownerForm = document.getElementById('ownerForm');
    const priceInput = document.getElementById('price');

    // 1. Kiểm soát nhập liệu cho ô Mức giá (chỉ cho phép nhập số)
    if (priceInput) {
        priceInput.addEventListener('input', function() {
            // Loại bỏ tất cả ký tự không phải số
            this.value = this.value.replace(/[^0-9]/g, '');
        });
    }

    // 2. Xử lý gửi Form đăng ký sân
    if (ownerForm) {
        ownerForm.addEventListener('submit', async (e) => {
            e.preventDefault(); // Ngăn trang web tải lại

            // Lấy giá trị từ các ô input
            const stadiumName = document.getElementById('stadiumName').value;
            const stadiumType = document.getElementById('stadiumType').value;
            const address = document.getElementById('address').value;
            const ward = document.getElementById('ward').value;
            const priceValue = parseInt(priceInput.value);

            // 3. Kiểm tra logic mức giá chia hết cho 1000
            if (isNaN(priceValue) || priceValue % 1000 !== 0 || priceValue <= 0) {
                alert("Mức giá không hợp lệ! Vui lòng nhập số tiền chia hết cho 1000 (Ví dụ: 200000, 350000).");
                priceInput.focus();
                return;
            }

            // 4. Chuẩn bị dữ liệu theo đúng yêu cầu của API
            const stadiumData = {
                TenSan: stadiumName,
                LoaiSan: stadiumType,
                DiaChi: address,
                Phuong: ward,
                Gia: priceValue
            };

            try {
                // Hiển thị trạng thái đang xử lý trên nút bấm
                const submitBtn = ownerForm.querySelector('button[type="submit"]');
                const originalText = submitBtn.innerText;
                submitBtn.innerText = "Đang gửi đăng ký...";
                submitBtn.disabled = true;

                // 5. Gọi API POST /api/fields
                const response = await apiRequest(`${API_URL}/owner/fields`, {
                    method: 'POST',
                    body: JSON.stringify(stadiumData)
                });

                // Xử lý thành công
                alert("Đăng ký sân thành công! Sân của bạn đang chờ được duyệt.");
                ownerForm.reset(); // Xóa sạch form sau khi gửi thành công
                
                window.location.href = "quan-ly-san.html";

            } catch (error) {
                console.error("Lỗi đăng ký sân:", error.message);
                alert("Có lỗi xảy ra: " + error.message);
            } finally {
                // Khôi phục trạng thái nút bấm
                const submitBtn = ownerForm.querySelector('button[type="submit"]');
                submitBtn.innerText = "Gửi đăng ký";
                submitBtn.disabled = false;
            }
        });
    }
});

/* Script cho admin-dashboard */



/* Script cho quản lý người dùng */

async function handleRoleChange(selectElement, userId) {
    const newRole = selectElement.value;
    const oldRole = selectElement.getAttribute('data-old-role');

    // 1. THÔNG BÁO XÁC NHẬN (Đây là phần bạn đang thiếu)
    const isConfirmed = confirm(`Xác nhận thay đổi quyền của người dùng #${userId} từ '${oldRole}' thành '${newRole}'?`);

    if (!isConfirmed) {
        selectElement.value = oldRole; // Trả lại giá trị cũ nếu nhấn Hủy
        return;
    }

    try {
        // 2. Gọi API PUT
        await apiRequest(`${API_URL}/admin/users/${userId}`, {
            method: 'PUT',
            body: JSON.stringify({ quyen: newRole })
        });

        alert("Cập nhật quyền thành công!");
        selectElement.setAttribute('data-old-role', newRole); // Cập nhật trạng thái cũ thành mới

    } catch (error) {
        alert("Lỗi cập nhật: " + error.message);
        selectElement.value = oldRole; // Trả lại giá trị cũ nếu lỗi API
    }
}

// Gán vào window để HTML gọi được
window.handleRoleChange = handleRoleChange;

const UserAdminApp = {
    allUsers: [],      // Lưu trữ toàn bộ dữ liệu từ API
    currentPage: 1,    // Trang hiện tại
    itemsPerPage: 20,  // Số lượng người dùng mỗi trang

    init() {
        this.fetchUsers();
    },

    /**
     * Lấy toàn bộ danh sách từ API
     */
    async fetchUsers() {
        const tableBody = document.getElementById('user-management-table');
        if (!tableBody) return;

        try {
            tableBody.innerHTML = `<tr><td colspan="9" style="text-align:center;">Đang tải dữ liệu...</td></tr>`;
            
            const response = await apiRequest(`${API_URL}/admin/users`, {
                method: 'GET'
            });

            // Lưu dữ liệu vào biến toàn cục của đối tượng
            this.allUsers = response.data || [];
            this.renderPage(1); 

        } catch (error) {
            console.error("Lỗi tải bảng người dùng:", error.message);
            tableBody.innerHTML = `<tr><td colspan="9" style="text-align:center; color:red;">Lỗi: ${error.message}</td></tr>`;
        }
    },

    /**
     * Hiển thị dữ liệu của một trang cụ thể
     */
    renderPage(page) {
        this.currentPage = page;
        const tableBody = document.getElementById('user-management-table');
        if (!tableBody) return;

        if (this.allUsers.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="9" style="text-align:center;">Không có dữ liệu người dùng.</td></tr>`;
            document.getElementById('user-pagination').innerHTML = "";
            return;
        }

        // Tính toán vị trí cắt mảng dữ liệu
        const startIndex = (page - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        const paginatedUsers = this.allUsers.slice(startIndex, endIndex);

        tableBody.innerHTML = paginatedUsers.map((user, index) => {
            const roles = [
                { id: 'admin', text: 'Admin' },
                { id: 'chusan', text: 'Chủ sân' },
                { id: 'khachhang', text: 'Khách hàng' }
            ];

            const roleOptions = roles.map(r => 
                `<option value="${r.id}" ${user.quyen === r.id ? 'selected' : ''}>${r.text}</option>`
            ).join('');

            // STT phải tính theo trang để không bị lặp lại từ 1
            const stt = startIndex + index + 1;

            return `
                <tr data-user-id="${user.MaNguoiDung}">
                    <td>${stt}</td>
                    <td>#${user.MaNguoiDung}</td>
                    <td><strong>${user.username}</strong></td>
                    <td>${user.HoTen}</td>
                    <td>${user.email}</td>
                    <td>${user.sdt || "N/A"}</td>
                    <td>${user.bank || "<i>-</i>"}</td>
                    <td style="color: red;">${user.stk || "<i>-</i>"}</td>
                    <td>
                        <select class="role-select" 
                                data-old-role="${user.quyen}" 
                                onchange="handleRoleChange(this, ${user.MaNguoiDung})">
                            ${roleOptions}
                        </select>
                    </td>
                </tr>
            `;
        }).join('');

        this.renderPagination();
    },

    /**
     * Tạo các nút bấm phân trang
     */
    renderPagination() {
        const totalPages = Math.ceil(this.allUsers.length / this.itemsPerPage);
        const container = document.getElementById('user-pagination');
        if (!container || totalPages <= 1) {
            if (container) container.innerHTML = "";
            return;
        }

        let html = "";
        for (let i = 1; i <= totalPages; i++) {
            html += `
                <button class="page-btn ${i === this.currentPage ? 'active' : ''}" 
                        onclick="UserAdminApp.renderPage(${i})">
                    ${i}
                </button>
            `;
        }
        container.innerHTML = html;
    }
};

// Khởi tạo ứng dụng quản trị
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('user-management-table')) {
        UserAdminApp.init();
    }
});
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

/* Script for chi tiết sân */

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
        const response = await apiRequest(`${API_URL}/slots/fields/${currentMaSan}`);
        bookedSlots = response.data || [];
    } catch (e) { 
        console.warn("Lỗi tải lịch:", e.message); 
    }

    const today = new Date();
    tbody.innerHTML = Array.from({ length: 7 }, (_, i) => {
        const date = new Date(today);
        date.setDate(today.getDate() + i);

        // --- CÁCH ĐỊNH DẠNG YYYY-MM-DD CHUẨN GIỜ ĐỊA PHƯƠNG ---
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0'); 
        const day = String(date.getDate()).padStart(2, '0');
        const isoDate = `${year}-${month}-${day}`; 
        // ------------------------------------------------------

        const displayDate = date.toLocaleDateString('vi-VN');
        let cells = `<td style="font-weight:bold; background:#f4f4f4;">${i === 0 ? displayDate + ' (Hôm nay)' : displayDate}</td>`;

        for (let ca = 1; ca <= 12; ca++) {
            // So khớp dữ liệu: Ép kiểu ca về số để tránh lỗi so sánh string/number
            const slotData = bookedSlots.find(s => s.Ngay === isoDate && Number(s.Ca) === ca);
            
            let isUnavailable = false;
            if (slotData && slotData.TrangThai) {
                // Chuẩn hóa chuỗi TrangThai để so sánh (xóa khoảng trắng, viết thường)
                const status = slotData.TrangThai.toLowerCase().trim();
                if (status === 'daxacnhan' || status === 'chuaxacnhan') {
                    isUnavailable = true;
                }
            }

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

    // 1. Lấy thông tin user
    const userId = Auth.getUserId();

    if (!userId) {
        alert("Vui lòng đăng nhập để đặt sân!");
        if (typeof openModal === 'function') openModal();
        return;
    }

    // 2. Chuẩn bị dữ liệu gửi lên Backend
    const bookingData = {
        maNguoiDung: userId,
        maSan: parseInt(currentMaSan),
        ngay: selected.dataset.date, 
        ca: parseInt(selected.dataset.ca) 
    };

    try {
        // Gọi API đặt sân - API này bây giờ trả về toàn bộ PaymentInfo
        const response = await apiRequest(`${API_URL}/bookings`, {
            method: 'POST',
            body: JSON.stringify(bookingData)
        });

        // BƯỚC 3: Xử lý phản hồi và hiển thị Modal Thanh toán
        // Cấu trúc mới: response.paymentInfo
        if (response && response.paymentInfo) {
            const pay = response.paymentInfo;
            
            // Tắt modal lịch
            closeScheduleModal();

            // Đổ dữ liệu ngân hàng vào Modal
            document.getElementById('bankName').innerText = pay.nganHang || "N/A";
            document.getElementById('bankSTK').innerText = pay.soTaiKhoan || "N/A";
            document.getElementById('bankOwner').innerText = pay.chuTaiKhoan || "N/A";
            
            // Cập nhật thêm các trường mới có trong JSON (nếu HTML của bạn có ID tương ứng)
            const amountEl = document.getElementById('bankAmount');
            if (amountEl) {
                amountEl.innerText = new Intl.NumberFormat('vi-VN').format(pay.tongTien) + " VNĐ";
            }

            const noteEl = document.getElementById('bankTransferNote');
            if (noteEl) {
                noteEl.innerText = pay.noiDungChuyenKhoan;
            }

            // Reset hiển thị Modal về bước 1 (Thông tin chuyển khoản)
            document.getElementById('paymentStep1').style.display = 'block';
            document.getElementById('paymentStep2').style.display = 'none';
            document.getElementById('paymentModal').style.display = 'flex';

            console.log(response.message); // 
        }
    } catch (error) {
        alert("Lỗi khi đặt sân: " + error.message);
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

            // 3. Đổ dữ liệu vào các ID tương ứng trong HTML 
            document.getElementById('profileUsername').value = userData.username || "";
            document.getElementById('profileFullName').value = userData.HoTen || "";
            document.getElementById('profileEmail').value = userData.email || "";
            document.getElementById('profilePhone').value = userData.sdt || "";
            document.getElementById('profileBank').value = userData.bank || "";
            document.getElementById('profileBankId').value = userData.stk || "";
            
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
        document.getElementById('profilePhone'),
        document.getElementById('profileBank'),
        document.getElementById('profileBankId'),
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
        mainBtn.style.backgroundColor = "#16a34a";
    } else {
        // --- CHẾ ĐỘ LƯU DỮ LIỆU ---
        const userId = Auth.getUserId();
        const userLocal = Auth.getUserData();

        const updatedData = {
            HoTen: document.getElementById('profileFullName').value,
            email: document.getElementById('profileEmail').value,
            sdt: document.getElementById('profilePhone').value,
            bank: document.getElementById('profileBank').value,
            stk: document.getElementById('profileBankId').value
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

/* Script cho lịch sử đặt sân */

const statusConfig = {
    "chuaxacnhan": { text: "Chờ xác nhận", class: "upcoming" },
    "daxacnhan": { text: "Đã xác nhận", class: "completed" },
    "dahuy": { text: "Đã hủy", class: "cancelled" }
};

const HistoryApp = {
    allData: [],
    currentPage: 1,
    itemsPerPage: 10,

    init() {
        this.fetchHistory();
    },

    async fetchHistory() {
        const userId = Auth.getUserId();
        if (!userId) return;

        try {
            const response = await apiRequest(`${API_URL}/bookings/users/${userId}`, {
                method: 'GET'
            });
            this.allData = response.data || [];
            this.renderPage(1);
        } catch (error) {
            console.error("Lỗi:", error.message);
        }
    },

    renderPage(page) {
        this.currentPage = page;
        const tbody = document.getElementById('bookingHistoryBody');
        if (!tbody) return;

        // Phân trang: Lấy 10 phần tử cho trang hiện tại
        const start = (page - 1) * this.itemsPerPage;
        const items = this.allData.slice(start, start + this.itemsPerPage);

        if (items.length === 0) {
            tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:20px;">Không có lịch sử đặt sân.</td></tr>`;
            return;
        }

        tbody.innerHTML = items.map(item => {
            const formattedDate = new Date(item.Ngay).toLocaleDateString('vi-VN');
            const formattedPrice = new Intl.NumberFormat('vi-VN').format(item.Gia) + " VNĐ";
            const status = statusConfig[item.TrangThai] || { text: item.TrangThai, class: "" };

            return `
                <tr class="status-${status.class}">
                    <td data-label="Mã Đơn" style="width:15%">#${item.MaDatSan}</td>
                    <td data-label="Tên Sân" style="width:36%">
                        <strong>${item.TenSan}</strong><br>
                        <small style="color: #666;">${item.DiaChi}</small>
                    </td>
                    <td data-label="Ngày" style="width:10%">${formattedDate}</td>
                    <td data-label="Ca" style="width:7%">Ca ${item.Ca}</td>
                    <td data-label="Tổng Tiền" style="width:15%"><strong>${formattedPrice}</strong></td>
                    <td data-label="Trạng Thái">
                        <span class="status-badge ${status.class}">${status.text}</span>
                    </td>
                    <td data-label="Hành Động">
                        ${item.TrangThai === 'chuaxacnhan' 
                            ? `<button class="cancel-btn" onclick="HistoryApp.cancelBooking(${item.MaDatSan})">Hủy</button>` 
                            : ''
                        }
                    </td>
                </tr>
            `;
        }).join('');

        this.renderPagination();
    },

    renderPagination() {
        const pages = Math.ceil(this.allData.length / this.itemsPerPage);
        const container = document.getElementById('pagination');
        if (!container || pages <= 1) {
            if (container) container.innerHTML = "";
            return;
        }

        container.innerHTML = Array.from({ length: pages }, (_, i) => i + 1)
            .map(p => `
                <button class="page-btn ${p === this.currentPage ? 'active' : ''}" 
                        onclick="HistoryApp.renderPage(${p})">${p}</button>
            `).join('');
    },

    /**
     * Hàm hủy sân sử dụng PUT 
     */
    async cancelBooking(id) {
        if (!confirm("Bạn có chắc chắn muốn hủy yêu cầu đặt sân này?")) return;

        try {
            // Sử dụng PUT để đổi trạng thái về dahuy
            await apiRequest(`${API_URL}/bookings/${id}`, {
                method: 'PUT',
                body: JSON.stringify({ TrangThai: 'dahuy' })
            });

            alert("Đã hủy đặt sân thành công.");
            this.fetchHistory(); 
        } catch (error) {
            alert("Lỗi khi hủy: " + error.message);
        }
    }
};

// Khởi tạo
window.HistoryApp = HistoryApp;
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('bookingHistoryBody')) {
        HistoryApp.init();
    }
});

/* === QUẢN LÝ DANH SÁCH SÂN (DÀNH CHO CHỦ SÂN) === */

const OwnerPitchApp = {
    allData: [],
    currentPage: 1,
    itemsPerPage: 4, // Số lượng sân trên mỗi trang

    init() {
        this.fetchOwnerFields();
    },

    /**
     * Gọi API lấy danh sách sân của chủ sân hiện tại
     */
    async fetchOwnerFields() {
        const userId = Auth.getUserId();
        const token = localStorage.getItem('userToken');

        if (!userId || !token) {
            alert("Bạn cần đăng nhập để xem danh sách sân.");
            window.location.href = "/index.html";
            return;
        }

        try {
            // API: GET /api/owner/fields (Backend sẽ dựa vào Token/UserID để lọc)
            const response = await apiRequest(`${API_URL}/owner/fields`, {
                method: 'GET'
            });

            this.allData = response.data || response;
            this.renderPage(1);

        } catch (error) {
            console.error("Lỗi tải danh sách sân chủ sân:", error);
            document.getElementById('ownerStadiumList').innerHTML = 
                `<p style="color: red; text-align: center; width: 100%;">Lỗi: ${error.message}</p>`;
        }
    },

    /**
     * Hiển thị danh sách sân theo trang
     */
renderPage(page) {
        this.currentPage = page;
        const listContainer = document.getElementById('ownerStadiumList');
        if (!listContainer) return;

        if (this.allData.length === 0) {
            listContainer.innerHTML = `<p style="text-align: center; width: 100%;">Bạn chưa đăng ký sân bóng nào.</p>`;
            document.getElementById('ownerPagination').innerHTML = "";
            return;
        }

        const start = (page - 1) * this.itemsPerPage;
        const end = start + this.itemsPerPage;
        const items = this.allData.slice(start, end);

        listContainer.innerHTML = items.map(s => {
            // --- LOGIC XỬ LÝ TRẠNG THÁI MỚI ---
            let statusText = "";
            let statusClass = "";

            if (s.TrangThai === 'baotri') {
                statusText = "Bảo trì";
                statusClass = "inactive";
            } else if (s.TrangThai === 'ngunghoatdong') {
                statusText = "Ngừng hoạt động";
                statusClass = "stopped";  
            } else {
                statusText = "Đang hoạt động";
                statusClass = "active";  
            }
            // ----------------------------------

            return `
                <a href="chi-tiet-san-chu-san.html?id=${s.MaSan}" class="manage-card-link" data-stadium-id="${s.MaSan}">
                    <img src="${s.HinhAnh || '../../images/sanA.png'}" alt="${s.TenSan}">
                    <div class="manage-info">
                        <h3>${s.TenSan}</h3>
                        <p class="status ${statusClass}">Trạng thái: ${statusText}</p>
                        <p><small>${s.DiaChi}, ${s.Phuong}</small></p>
                    </div>
                </a>
            `;
        }).join('');

        this.renderPagination();
    },

    /**
     * Vẽ nút phân trang
     */
    renderPagination() {
        const pages = Math.ceil(this.allData.length / this.itemsPerPage);
        const container = document.getElementById('ownerPagination');
        if (!container || pages <= 1) {
            if (container) container.innerHTML = "";
            return;
        }

        let paginationHTML = `<a href="#" onclick="OwnerPitchApp.goToPage(${this.currentPage - 1})">&laquo; Trước</a>`;

        for (let i = 1; i <= pages; i++) {
            paginationHTML += `
                <a href="#" class="page-link ${i === this.currentPage ? 'active' : ''}" 
                   onclick="OwnerPitchApp.goToPage(${i})">${i}</a>
            `;
        }

        paginationHTML += `<a href="#" onclick="OwnerPitchApp.goToPage(${this.currentPage + 1})">Sau &raquo;</a>`;
        container.innerHTML = paginationHTML;
    },

    goToPage(p) {
        const totalPages = Math.ceil(this.allData.length / this.itemsPerPage);
        if (p < 1 || p > totalPages) return;
        this.renderPage(p);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
};

// Khởi chạy khi tài liệu sẵn sàng
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('ownerStadiumList')) {
        OwnerPitchApp.init();
    }
});

/* Script cho chi tiết sân chủ sân */

const pitchUrlParams = new URLSearchParams(window.location.search);
const pitchId = pitchUrlParams.get('id');

/**
 * Tải thông tin sân và đổ vào Form
 */
async function loadPitchDetailsForEdit() {
    if (!pitchId) return;

    try {
        const stadium = await apiRequest(`${API_URL}/fields/${pitchId}`, { method: 'GET' });
        if (stadium) {
            document.getElementById('name').value = stadium.TenSan || "";
            document.getElementById('type').value = stadium.LoaiSan || "";
            document.getElementById('address').value = stadium.DiaChi || "";
            document.getElementById('ward').value = stadium.Phuong || "";
            // Đổ giá vào ô text
            document.getElementById('price').value = stadium.Gia || "";
            
            const statusField = document.getElementById('status');
            if (statusField) statusField.value = stadium.TrangThai || "hoatdong";
        }
    } catch (error) {
        console.error("Lỗi tải thông tin sân:", error.message);
    }
}

/**
 * Hàm lưu thay đổi - PUT /api/fields/:id
 */
async function savePitchInfo() {
    const priceInput = document.getElementById('price');
    // Loại bỏ mọi ký tự không phải số trước khi tính toán
    const rawPrice = priceInput.value.replace(/[^0-9]/g, '');
    const priceVal = parseInt(rawPrice);

    // 1. Kiểm tra logic giá thuê (Số và chia hết cho 1000)
    if (isNaN(priceVal) || priceVal % 1000 !== 0 || priceVal <= 0) {
        alert("Mức giá không hợp lệ! Vui lòng nhập số tiền chia hết cho 1000 (Ví dụ: 300000).");
        priceInput.focus();
        return;
    }

    const updatedData = {
        TenSan: document.getElementById('name').value,
        LoaiSan: document.getElementById('type').value,
        DiaChi: document.getElementById('address').value,
        Phuong: document.getElementById('ward').value,
        Gia: priceVal,
        TrangThai: document.getElementById('status').value 
    };

    if (!updatedData.TenSan) return alert("Vui lòng nhập tên sân!");

    try {
        const btn = document.querySelector('.actions button');
        btn.innerText = "Đang lưu...";
        btn.disabled = true;

        await apiRequest(`${API_URL}/fields/${pitchId}`, {
            method: 'PUT',
            body: JSON.stringify(updatedData)
        });

        alert("Sân đã cập nhật thành công!");
        window.location.href = "/assets/owner/quan-ly-san.html";

    } catch (error) {
        alert("Lỗi khi cập nhật: " + error.message);
    } finally {
        const btn = document.querySelector('.actions button');
        btn.innerText = "Lưu thay đổi";
        btn.disabled = false;
    }
}
// Khởi tạo
document.addEventListener('DOMContentLoaded', () => {
    // 1. Tự động ngăn nhập chữ vào ô giá
    const priceInput = document.getElementById('price');
    if (priceInput) {
        priceInput.addEventListener('input', function() {
            this.value = this.value.replace(/[^0-9]/g, '');
        });
    }

    if (document.getElementById('name')) loadPitchDetailsForEdit();
});

/* Script cho nút dành cho chủ sân */

async function checkBank(event, targetUrl) {

    event.preventDefault(); 

    const userId = Auth.getUserId();
    if (!userId) {
        alert("Vui lòng thêm ngân hàng và số tài khoản để thực hiện hành động này!");
        if (typeof openModal === 'function') openModal();
        return;
    }

    try {

        const response = await apiRequest(`${API_URL}/users/${userId}`, {
            method: 'GET'
        });

        if (response && response.data) {
            const userData = response.data;
            const nbank = userData.bank; 
            const nstk = userData.stk;   

            if (!nbank || !nstk) {
                alert("Bạn cần thêm thông tin Ngân hàng và Số tài khoản để sử dụng chức năng này!");

                window.location.href = '/assets/after-login/profile.html';
            } else {

                window.location.href = targetUrl;
            }
        } else {
            throw new Error("Không thể truy xuất dữ liệu người dùng.");
        }

    } catch (error) {
        console.error("Lỗi khi kiểm tra ngân hàng:", error.message);
        alert("Có lỗi xảy ra khi xác thực thông tin: " + error.message);
    }
}
