/* Cấu hình API URL */
const API_URL = 'http://localhost:3000/api';
const token = localStorage.getItem('userToken');

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

async function apiRequest(url, options) {
    try {
        const response = await fetch(url, options);

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
        throw error;
    }
}


// 1. Xử lý Đăng nhập (Đã có BE)
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
        // Chuyển hướng tới trang sau đăng nhập
        window.location.href = '/assets/after-login/after-login.html';

    } catch (error) {
        alert(error.message);
    }
}

// 2. Xử lý Đăng ký (Đã có BE)
async function handleRegister() {
    const registerUrl = `${API_URL}/auth/register`;
    const HoTen = document.getElementById('registerFullName').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('registerConfirmPassword').value;
    const username = document.getElementById('registerUsername').value;
    const phone = document.getElementById('registerPhone').value;

    if (password !== confirmPassword) {
        alert("Mật khẩu xác nhận không khớp!");
        return;
    }

    if (!email || !password || !username || !phone) {
        alert("Vui lòng điền đầy đủ tất cả các trường bắt buộc.");
        return;
    }

    try {
        const data = await apiRequest(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ HoTen, email, password, username, phone }),
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

// 4. Xử lý Quên mật khẩu (Xác nhận mã và đổi mật khẩu) (Đã có BE)
async function verifyCode() {
    const verifyUrl = `${API_URL}/auth/reset-password`;
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
    window.location.href = "../../../index.html";
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

    const selectDate = document.getElementById('selectDate');
    if (selectDate) {
        selectDate.addEventListener('change', (e) => {
            console.log('Ngày đã chọn:', e.target.value);
        });
    }
});

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
    }

    // Xử lý submit form
    ownerForm.addEventListener('submit', (e) => {
        e.preventDefault();

        if (!isLoggedIn()) {
            alert("Vui lòng đăng nhập trước khi đăng ký sân!");
            return;
        }

        const formData = new FormData(ownerForm);

        console.log("Dữ liệu đăng ký sân:", Object.fromEntries(formData.entries()));
        alert("Đăng ký sân thành công!");

        fetch(`${API_URL}/register-stadium`, { method: 'POST', body: formData })
    });

});

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

/* Scripts cho dat-san.html */

document.addEventListener('DOMContentLoaded', () => {
    const bookingForm = document.getElementById('bookingForm');

    if (bookingForm) {
        bookingForm.addEventListener('submit', function (e) {
            e.preventDefault();

            // Lấy dữ liệu từ form
            const formData = {
                name: document.getElementById('name').value,
                phone: document.getElementById('phone').value,
                date: document.getElementById('date').value,
                time: document.getElementById('time').value,
                note: document.getElementById('note').value
            };

            // Kiểm tra tính hợp lệ cơ bản
            if (!formData.name || !formData.phone || !formData.date || !formData.time) {
                alert("Vui lòng điền đầy đủ thông tin bắt buộc.");
                return;
            }

            console.log("Dữ liệu đặt sân:", formData);
            alert("Đã gửi yêu cầu đặt sân thành công! (Demo)");

            // --- LOGIC GỌI API ---

            fetch(`${API_URL}/auth/bookings`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + localStorage.getItem('userToken')
                },
                body: JSON.stringify(formData)
            })
                .then(response => response.json())
                .then(data => {
                    alert("Đặt sân thành công! Mã đặt chỗ: " + data.bookingId);
                    bookingForm.reset();
                })
                .catch(error => {
                    console.error('Lỗi khi đặt sân:', error);
                    alert("Đặt sân thất bại. Vui lòng thử lại.");
                });
        });
    }
});

/* Script cho hoá đơn */

function formatCurrency(number) {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
        minimumFractionDigits: 0
    }).format(number);
}

/**
 * Hàm tính toán lại tổng tiền khi số lượng thay đổi
 */
function calculateTotal() {
    const serviceFeeRate = 0.05; // 5% phí dịch vụ
    let runningSubtotal = 0;

    // 1. Tính tổng tiền dịch vụ
    const serviceRow = document.querySelector('tr[data-service-id="1"]');
    if (serviceRow) {
        const basePrice = parseInt(serviceRow.getAttribute('data-base-price')); // 100000
        const quantity = parseInt(serviceRow.querySelector('.quantity-input').value);

        const lineTotal = basePrice * quantity;
        runningSubtotal = lineTotal;

        // Cập nhật trường Thành tiền
        serviceRow.querySelector('.subtotal-amount').textContent = formatCurrency(lineTotal);
        serviceRow.querySelector('.price').textContent = formatCurrency(basePrice); // Cập nhật lại đơn giá
    }

    // 2. Tính Phí dịch vụ
    const serviceFee = runningSubtotal * serviceFeeRate;
    document.getElementById('service-fee-amount').textContent = formatCurrency(serviceFee);

    // 3. Tính Tổng cộng
    const grandTotal = runningSubtotal + serviceFee;
    document.getElementById('grand-total').textContent = formatCurrency(grandTotal);
}

function handlePayment() {
    const grandTotalElement = document.getElementById('grand-total');
    const grandTotalText = grandTotalElement ? grandTotalElement.textContent : '0₫';

    alert(`Xác nhận thanh toán thành công số tiền ${grandTotalText}!`);
    console.log("Tiến hành chuyển hướng đến cổng thanh toán...");

    // Thêm logic chuyển hướng đến cổng thanh toán hoặc xử lý backend tại đây.
}

// Gắn sự kiện lắng nghe vào input số lượng để tính toán
document.addEventListener('DOMContentLoaded', () => {
    const quantityInput = document.querySelector('.quantity-input');

    if (quantityInput) {
        quantityInput.addEventListener('change', calculateTotal);
        quantityInput.addEventListener('keyup', calculateTotal);
    }

    calculateTotal();
});

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

        // --- LOGIC GỌI API ĐỂ CẬP NHẬT VAI TRÒ ---

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
document.addEventListener("DOMContentLoaded", function () {
    checkLoginStatus();

    // Lắng nghe sự kiện click nút Đăng nhập trong Modal
    const loginSubmitBtn = document.querySelector("#loginModal button[type='submit']");
    if (loginSubmitBtn) {
        loginSubmitBtn.addEventListener("click", handleLogin);
    }
});

// Hàm kiểm tra trạng thái đăng nhập
function checkLoginStatus() {
    const token = localStorage.getItem("userToken");
    const authSection = document.querySelector(".auth");

    if (token && authSection) {
        // Nếu đã có token, thay đổi nút Đăng nhập/Đăng ký thành thông tin User
        authSection.innerHTML = `
            <div class="user-profile">
                <span>Chào, User!</span>
                <a href="#" onclick="handleLogout()" style="margin-left: 15px; color: #ff4d4d;">Đăng xuất</a>
            </div>
        `;
    }
}
function checkAccess(event, targetUrl) {
    event.preventDefault(); // Chặn chuyển hướng ngay lập tức
    const token = localStorage.getItem("userToken");

    if (token) {
        window.location.href = targetUrl; // Cho phép đi tiếp
    } else {
        alert("Bạn cần đăng nhập để truy cập tính năng dành cho chủ sân!");
        openModal(); // Mở modal đăng nhập cho khách
    }
}

