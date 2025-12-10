/* Cấu hình API URL */
const API_URL = 'https://localhost:3000/api';

/* === Search box === */
var input = document.getElementById("searchInput");
var button = document.getElementById("searchButton");

function handleSearch() {
    var searchQuery = input.value;
    window.location.href = "../assets/search.html?q=" + encodeURIComponent(searchQuery);
}

if (input && button) {
    input.addEventListener("keyup", function (event) {
        if (event.keyCode === 13) {
            event.preventDefault();
            handleSearch();
        }
    });

    button.addEventListener("click", function (event) {
        event.preventDefault();
        handleSearch();
    });
}


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

// Gán các hàm quản lý modal vào phạm vi toàn cục (window) để index.html có thể gọi
window.openModal = openModal;
window.closeModal = closeModal;
window.openRegisterModal = openRegisterModal;
window.closeRegisterModal = closeRegisterModal;
window.openForgotPasswordModal = openForgotPasswordModal;
window.closeForgotPasswordModal = closeForgotPasswordModal;
window.sendVerificationCode = sendVerificationCode;
window.verifyCode = verifyCode;

/* === KẾT NỐI BACKEND (API Integration) === */

async function apiRequest(url, options) {
    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username: usernameInput, password: passwordInput }),
        });

        if (!response.ok) {
            let errorData = { message: 'Lỗi máy chủ không xác định.' };
            try {
                errorData = await response.json();
            } catch (e) {
                errorData.message = `Lỗi HTTP: ${response.status} ${response.statusText}`;
            }
            throw new Error(errorData.message);
        }

        return await response.json();

    } catch (error) {
        console.error('Lỗi API Request:', error.message);
        throw new Error("Có lỗi xảy ra khi kết nối đến máy chủ. Vui lòng kiểm tra URL API và kết nối mạng.");
    }
}


// 1. Xử lý Đăng nhập
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


async function handleLogin(username, password) {
    // SỬ DỤNG URL MỚI THEO YÊU CẦU CỦA BẠN: ${API_URL}/auth/login
    const loginUrl = `${API_URL}/auth/login`;

    try {
        const data = await apiRequest(loginUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username: username,
                password: password
            }),
        });

        // Đăng nhập thành công
        alert("Đăng nhập thành công! Chào mừng " + (data.user || username));
        localStorage.setItem('userToken', data.token);
        closeModal();

    } catch (error) {
        alert(error.message);
    }
}

// 2. Xử lý Đăng ký 
// URL mẫu cho các chức năng khác
async function handleRegister() {
    const registerUrl = `${API_URL}/api/register`; // Cập nhật URL này nếu cần
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('registerConfirmPassword').value;
    const username = document.getElementById('registerUsername').value;
    const phone = document.getElementById('registerPhone').value;

    if (password !== confirmPassword) {
        alert("Mật khẩu xác nhận không khớp!");
        return;
    }

    // ... (phần còn lại của hàm handleRegister giống như trước) ...
    if (!email || !password || !username || !phone) {
        alert("Vui lòng điền đầy đủ tất cả các trường bắt buộc.");
        return;
    }

    try {
        const data = await apiRequest(registerUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password, username, phone }),
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


// 3. Xử lý Quên mật khẩu (Gửi mã)
async function sendVerificationCode() {
    const sendVerificationUrl = `${API_URL}/api/send-verification`; // Cập nhật URL
    const email = document.getElementById('forgotEmail').value;

    if (!email) { alert("Vui lòng nhập email."); return; }
    try {
        await apiRequest(sendVerificationUrl, {
            method: 'POST', body: JSON.stringify({ email }), headers: { 'Content-Type': 'application/json', },
        });
        alert("Mã xác minh đã được gửi đến email của bạn.");
        const verificationSection = document.getElementById('verificationSection');
        if (verificationSection) verificationSection.style.display = 'block';
    } catch (error) { alert(error.message); }
}

// 4. Xử lý Quên mật khẩu (Xác nhận mã và đổi mật khẩu)
async function verifyCode() {
    const verifyUrl = `${API_URL}/api/reset-password`; // Cập nhật URL này nếu cần
    const email = document.getElementById('forgotEmail').value;
    const code = document.getElementById('verificationCode').value;

    if (!email || !code) { alert("Vui lòng điền đầy đủ thông tin."); return; }

    try {
        await apiRequest(verifyUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', },
            body: JSON.stringify({ email, code }),
        });
        alert("Mã xác minh chính xác! Mật khẩu đã được đặt lại.");
        closeForgotPasswordModal();
        openModal();
    } catch (error) { alert(error.message); }
}

// Hàm đăng xuất 
function handleLogout() {
    alert("Đăng xuất thành công!");
    // Xóa token hoặc session từ localStorage/cookie nếu có
    localStorage.removeItem('userToken');
    // Chuyển hướng về trang chủ
    window.location.href = "../index.html";
}

// Toggle dropdown cha
function toggleDropdown(event) {
    event.preventDefault();
    event.stopPropagation();

    const btn = event.currentTarget;
    const dropdownId = btn.dataset.target;
    const target = document.getElementById(dropdownId);
    if (!target) return;

    // Đóng các dropdown khác (nhưng không chạm submenu của target)
    document.querySelectorAll('.owner-dropdown-content.show, .dropdown-content.show')
        .forEach(el => { if (el !== target) el.classList.remove('show'); });

    target.classList.toggle('show');
}

// Toggle submenu (không đóng dropdown cha)
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

    // Submenu buttons (they're <a> but we preventDefault in handler)
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
        else alert('Đăng xuất (demo)');
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

document.addEventListener('DOMContentLoaded', () => {
    // Xử lý các nút Loại lịch (tabs)
    const buttons = document.querySelectorAll('.calendar-type-button');

    buttons.forEach(button => {
        button.addEventListener('click', () => {
            // Xóa class 'active' khỏi tất cả các nút
            buttons.forEach(btn => btn.classList.remove('active'));
            // Thêm class 'active' vào nút vừa được click
            button.classList.add('active');

            const selectedType = button.getAttribute('data-type');
            console.log(`Loại lịch đã chọn: ${selectedType}`);
        });
    });

    // Ví dụ lấy giá trị ngày và giờ khi có sự thay đổi (để chuẩn bị cho việc gửi API)
    const selectDate = document.getElementById('selectDate');
    if (selectDate) {
        selectDate.addEventListener('change', (e) => {
            console.log('Ngày đã chọn:', e.target.value);
        });
    }
});

/* Chi tiết sân cho chủ sân */

/*
    ⚠️ Sau này backend trả về ví dụ:
    bookings = [
        { hours: 2, price: 300000 },
        { hours: 1.5, price: 300000 }
    ]
*/

function calculateRevenue(bookings) {
    let total = 0;
    bookings.forEach(b => {
        total += b.hours * b.price;
    });
    return total;
}

// DỮ LIỆU GIẢ để test (sau này thay bằng response backend)
const demoBookings = [
    { hours: 2, price: 300000 },
    { hours: 1.5, price: 300000 },
    { hours: 3, price: 300000 }
];

// Hiển thị doanh thu
const revenueValue = calculateRevenue(demoBookings);
document.getElementById('revenue').innerText =
    revenueValue.toLocaleString('vi-VN') + " VNĐ";

function savePitchInfo() {
    const data = {
        address: document.getElementById('address').value,
        price: document.getElementById('price').value,
        timeRange: document.getElementById('timeRange').value
    };

    console.log("Dữ liệu gửi backend:", data);
    alert("Đã lưu thông tin sân (demo)");
}

/* === JS cho trang danh-cho-chu-san.html === */
const ownerForm = document.getElementById('ownerForm');
const closeLogin = document.getElementById('closeLogin');
const loginBtn = document.getElementById('loginBtn');

const token = localStorage.getItem('userToken');

// Lấy thông tin user nếu đã đăng nhập
async function fetchUserInfo() {
    try {
        const res = await fetch(`${API_URL}/user-info`, {
            headers: { 'Authorization': 'Bearer ' + token }
        });
        if (!res.ok) throw new Error('Không lấy được thông tin người dùng');
        const data = await res.json();
        document.getElementById('fullName').value = data.fullName || '';
        document.getElementById('email').value = data.email || '';
        document.getElementById('phone').value = data.phone || '';
    } catch (err) {
        console.error(err);
        loginModal.style.display = 'flex';
    }
}

// Modal login
closeLogin.onclick = () => loginModal.style.display = 'none';
window.onclick = (event) => { if (event.target == loginModal) loginModal.style.display = 'none'; };

// Login
loginBtn.onclick = async () => {
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;
    if (!username || !password) return alert('Vui lòng nhập đầy đủ');

    try {
        const res = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        if (!res.ok) throw new Error('Đăng nhập thất bại');
        const data = await res.json();
        localStorage.setItem('userToken', data.token);
        loginModal.style.display = 'none';
        await fetchUserInfo();
    } catch (err) {
        alert(err.message);
    }
}

// Nếu đã có token thì lấy thông tin ngay
if (token) fetchUserInfo();

// Submit form đăng ký chủ sân
ownerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('fullName', document.getElementById('fullName').value);
    formData.append('email', document.getElementById('email').value);
    formData.append('phone', document.getElementById('phone').value);
    formData.append('businessCert', document.getElementById('businessCert').files[0]);

    try {
        const res = await fetch(`${API_URL}/owner-register`, {
            method: 'POST',
            headers: { 'Authorization': 'Bearer ' + localStorage.getItem('userToken') },
            body: formData
        });
        if (!res.ok) throw new Error('Đăng ký thất bại');
        alert('Đăng ký chủ sân thành công!');
        ownerForm.reset();
    } catch (err) {
        alert(err.message);
    }
});


document.addEventListener('DOMContentLoaded', () => {

    const ownerForm = document.getElementById('ownerForm');

    // Kiểm tra xem người dùng đã đăng nhập chưa
    function isLoggedIn() {
        return !!localStorage.getItem('userToken');
    }

    // Nếu chưa đăng nhập, mở modal login
    if (!isLoggedIn()) {
        const loginModal = document.getElementById('loginModal');
        if (loginModal) loginModal.style.display = "flex";
    } else {
        // TODO: nếu cần, fetch thông tin người dùng từ backend để điền trước
    }

    // Xử lý submit form
    ownerForm.addEventListener('submit', (e) => {
        e.preventDefault();

        if (!isLoggedIn()) {
            alert("Vui lòng đăng nhập trước khi đăng ký sân!");
            return;
        }

        const formData = new FormData(ownerForm);

        // Demo: hiển thị dữ liệu đã nhập
        console.log("Dữ liệu đăng ký sân:", Object.fromEntries(formData.entries()));
        alert("Đăng ký sân thành công! (demo)");

        // TODO: gửi formData lên backend qua fetch
        //fetch(`${API_URL}/register-stadium`, { method: 'POST', body: formData })
    });

});

document.addEventListener('DOMContentLoaded', () => {
    const ownerForm = document.getElementById('ownerForm');
    const loginModal = document.getElementById('loginModal');
    const loginBtn = document.getElementById('loginBtn');
    const closeLogin = document.getElementById('closeLogin');

    // Demo: gán token giả để thử
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
                localStorage.setItem('userToken', 'demo-token'); // lưu token demo
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
            if (!token) {
                alert("Vui lòng đăng nhập trước khi đăng ký sân.");
                openLoginModal();
                return;
            }

            const formData = new FormData(ownerForm);
            try {
                // Demo: giả lập gửi lên backend
                console.log("Dữ liệu gửi:", {
                    stadiumName: formData.get('fullName'),
                    type: formData.get('type'),
                    address: formData.get('address'),
                    price: parseInt(formData.get('price')),
                    startTime: formData.get('startTime'),
                    endTime: formData.get('endTime'),
                    imageFile: formData.get('businessCert')
                });

                // Demo thành công
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

