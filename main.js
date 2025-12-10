/* Cấu hình API URL */
const API_URL = '';

/* === Search box === */
var input = document.getElementById("searchInput");
var button = document.getElementById("searchButton");

function handleSearch() {
    var searchQuery = input.value;
    window.location.href = "assets/search.html?q=" + encodeURIComponent(searchQuery);
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


// --- Đóng Modal khi nhấn ra ngoài nền mờ ---
window.onclick = function (event) {
    if (event.target == loginModal) { closeModal(); }
    if (event.target == registerModal) { closeRegisterModal(); }
    if (event.target == forgotPasswordModal) { closeForgotPasswordModal(); }
}


/* === KẾT NỐI BACKEND (API Integration) === */

async function apiRequest(url, options) {
    try {
        const response = await fetch('${API_URL}/auth/login', {
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
        // Ví dụ: localStorage.setItem('userToken', data.token);
        closeModal();

    } catch (error) {
        alert(error.message);
    }
}

// 2. Xử lý Đăng ký 
// URL mẫu cho các chức năng khác (BẠN CẦN CẬP NHẬT CHÚNG NẾU CẦN)
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
    const sendVerificationUrl = `${API_URL}/api/send-verification`; // Cập nhật URL này nếu cần
    const email = document.getElementById('forgotEmail').value;
    // ... (phần còn lại của hàm sendVerificationCode giống như trước) ...

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

function toggleDropdown() {
    document.getElementById("userDropdown").classList.toggle("show");
}

// Gắn các sự kiện (event listeners) sau khi DOM đã tải xong
document.addEventListener('DOMContentLoaded', (event) => {
    // 1. Gắn sự kiện cho nút/icon mở dropdown
    const dropdownButton = document.getElementById('dropdownButton');
    if (dropdownButton) {
        dropdownButton.addEventListener('click', toggleDropdown);
    }

    // 2. Gắn sự kiện cho link Đăng xuất
    const logoutLink = document.getElementById('logoutLink');
    if (logoutLink) {
        logoutLink.addEventListener('click', (e) => {
            e.preventDefault(); // Ngăn chuyển hướng mặc định của thẻ <a>
            handleLogout();
        });
    }
});

// 3. Đóng dropdown nếu người dùng nhấp ra ngoài cửa sổ
window.onclick = function(event) {
    // Kiểm tra xem click có phải vào nút dropdown hoặc bên trong nút đó không
    if (!event.target.matches('.dropbtn, .dropbtn *')) {
        var dropdowns = document.getElementsByClassName("dropdown-content");
        for (var i = 0; i < dropdowns.length; i++) {
            var openDropdown = dropdowns[i];
            // Nếu dropdown đang mở, đóng nó lại
            if (openDropdown.classList.contains('show')) {
                openDropdown.classList.remove('show');
            }
        }
    }
}
