// Phân quyền demo cho toàn bộ dự án Nhóm 11 (Giải pháp A - chỉ ở trình duyệt).
// KHÔNG phải bảo mật thật: tài khoản nằm trong file JS này và backend không kiểm tra.
const DEMO_USER = { username: 'admin', password: 'admin123', role: 'ADMIN' };
const STORAGE_KEY = 'n11_demo_auth';
const LOGIN_PAGE = '/graduation-login.html';

export function isLoggedIn() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return false;
        const data = JSON.parse(raw);
        return !!data && data.username === DEMO_USER.username && data.role === DEMO_USER.role;
    } catch (e) {
        return false;
    }
}

export function login(username, password, redirect) {
    const user = (username || '').trim();
    const pass = password || '';
    if (user !== DEMO_USER.username || pass !== DEMO_USER.password) {
        return { ok: false, message: 'Tài khoản hoặc mật khẩu không đúng. Chỉ tài khoản admin được phép truy cập.' };
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
        username: DEMO_USER.username,
        role: DEMO_USER.role,
        loginAt: new Date().toISOString()
    }));
    const target = (redirect && redirect.startsWith('/') && !redirect.startsWith('//'))
        ? redirect
        : '/index.html';
    location.replace(target);
    return { ok: true };
}

export function logout() {
    localStorage.removeItem(STORAGE_KEY);
    location.replace(LOGIN_PAGE);
}

export function requireLogin(redirect) {
    if (isLoggedIn()) return true;
    const back = redirect || (location.pathname + location.search);
    location.replace(LOGIN_PAGE + '?redirect=' + encodeURIComponent(back));
    return false;
}

// Hiện nhãn người dùng + nút đăng xuất trên thanh header của các trang AdminLTE
export function mountUserBadge() {
    if (document.getElementById('n11UserBadge')) return;
    const host = document.querySelector('.app-header .container-fluid') || document.body;
    const box = document.createElement('div');
    box.id = 'n11UserBadge';
    box.className = 'd-flex align-items-center gap-2 ms-auto';
    box.innerHTML = `
        <span class="badge bg-primary-subtle text-primary border border-primary-subtle rounded-pill px-2 py-1" style="font-size:.75rem;">
            <i class="bi bi-person-badge me-1"></i>Admin
        </span>
        <button type="button" class="btn btn-sm btn-outline-secondary" id="n11LogoutBtn">
            <i class="bi bi-box-arrow-right me-1"></i>Đăng xuất
        </button>`;
    host.appendChild(box);
    const btn = document.getElementById('n11LogoutBtn');
    if (btn) btn.addEventListener('click', logout);
}
