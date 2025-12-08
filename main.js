/* Search box */
var input = document.getElementById("searchInput");
var button = document.getElementById("searchButton");

function handleSearch() {
    var searchQuery = input.value;
    window.location.href = "assets/search.html";
}

// Bắt sự kiện nhấn phím Enter trên ô input
input.addEventListener("keyup", function (event) {
    if (event.keyCode === 13) {
        event.preventDefault();
        handleSearch();
    }
});

// Bắt sự kiện nhấn chuột vào nút tìm kiếm
button.addEventListener("click", function (event) {
    event.preventDefault();
    handleSearch();
});

/* Login */
var modal = document.getElementById("loginModal");

function openModal() {
    modal.style.display = "flex";
}

function closeModal() {
    modal.style.display = "none";
}

window.onclick = function (event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
}
/* Register*/
var loginModal = document.getElementById("loginModal");
var registerModal = document.getElementById("registerModal");

function openModal() {
    loginModal.style.display = "flex";
}

function closeModal() {
    loginModal.style.display = "none";
}

// Hàm mở cửa sổ đăng ký
function openRegisterModal() {
    registerModal.style.display = "flex";
}

// Hàm đóng cửa sổ đăng ký
function closeRegisterModal() {
    registerModal.style.display = "none";
}

window.onclick = function (event) {
    if (event.target == loginModal) {
        loginModal.style.display = "none";
    }
    // Đóng modal đăng ký nếu nhấp ra ngoài
    if (event.target == registerModal) {
        registerModal.style.display = "none";
    }
}
/* Modal box */
var loginModal = document.getElementById("loginModal");
var registerModal = document.getElementById("registerModal");
var forgotPasswordModal = document.getElementById("forgotPasswordModal");

// --- Chức năng chung Modal ---
function openModal() { loginModal.style.display = "flex"; }
function closeModal() { loginModal.style.display = "none"; }
function openRegisterModal() { registerModal.style.display = "flex"; }
function closeRegisterModal() { registerModal.style.display = "none"; }

// --- Chức năng Quên mật khẩu ---
function openForgotPasswordModal() {
    closeModal(); // Đóng hộp đăng nhập
    forgotPasswordModal.style.display = "flex";
    // Reset form khi mở
    document.getElementById('forgotEmail').value = '';
    document.getElementById('verificationSection').style.display = 'none';
}

function closeForgotPasswordModal() {
    forgotPasswordModal.style.display = "none";
}

function sendVerificationCode() {
    // Đây là nơi thêm logic gửi email (cần backend xử lý)
    alert("Mã xác minh đã được gửi đến email của bạn.");
    document.getElementById('verificationSection').style.display = 'block';
}

function verifyCode() {
    // Đây là nơi thêm logic xác minh mã (cần backend xử lý)
    alert("Mã xác minh chính xác! Bạn có thể đặt lại mật khẩu.");
    closeForgotPasswordModal();
}

// --- Đóng Modal khi nhấn ra ngoài nền mờ ---
window.onclick = function (event) {
    if (event.target == loginModal) { closeModal(); }
    if (event.target == registerModal) { closeRegisterModal(); }
    if (event.target == forgotPasswordModal) { closeForgotPasswordModal(); }
}