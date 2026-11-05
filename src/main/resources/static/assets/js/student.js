import { API_ENDPOINTS } from './config.js';

document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const page = params.get('page') || 'list';

    const pageList = document.getElementById('page-list');
    const pageForm = document.getElementById('page-form');

    if (page === 'form') {
        if (pageList) pageList.style.display = 'none';
        if (pageForm) pageForm.style.display = '';
    } else {
        if (pageList) pageList.style.display = '';
        if (pageForm) pageForm.style.display = 'none';
    }

    initStudentPage();
    renderMiniCalendar();

    if (window.gsap) {
        gsap.from('.bento-stat-card', {
            opacity: 0,
            y: 16,
            duration: 0.5,
            stagger: 0.08,
            ease: 'power2.out'
        });
        gsap.from('.edu-side-panel > *', {
            opacity: 0,
            x: 30,
            duration: 0.6,
            stagger: 0.15,
            delay: 0.25,
            ease: 'power2.out'
        });
    }
});

function initStudentPage() {
    const studentTableBody = document.getElementById('studentTableBody');
    const searchForm = document.getElementById('searchForm');
    const studentForm = document.getElementById('studentForm');

    // =========================
    // TRANG DANH SÁCH
    // =========================
    if (studentTableBody) {
        loadStudents();

        if (searchForm) {
            searchForm.addEventListener('submit', handleSearch);
        }
    }

    // =========================
    // TRANG FORM THÊM / SỬA / XEM
    // =========================
    if (studentForm) {
        initStudentForm();
    }
}

// =========================
// LIST STUDENTS
// =========================

async function loadStudents(keyword = '') {
    const studentTableBody = document.getElementById('studentTableBody');
    if (!studentTableBody) return;

    try {
        studentTableBody.innerHTML = `
            <tr>
                <td colspan="8" class="text-center text-muted py-5">
                    <div class="spinner-border spinner-border-sm text-primary me-2"></div>
                    Đang tải dữ liệu sinh viên...
                </td>
            </tr>
        `;

        const trimmedKeyword = keyword.trim();
        const url = trimmedKeyword
            ? `${API_ENDPOINTS.STUDENTS}?keyword=${encodeURIComponent(trimmedKeyword)}`
            : API_ENDPOINTS.STUDENTS;

        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const students = await response.json();
        renderStudents(students);
    } catch (error) {
        console.error('Lỗi khi tải danh sách sinh viên:', error);
        studentTableBody.innerHTML = `
            <tr>
                <td colspan="8" class="text-center text-danger py-4">
                    <i class="bi bi-exclamation-triangle-fill me-2"></i>
                    Không thể tải danh sách sinh viên: ${error.message}
                </td>
            </tr>
        `;
    }
}

// =========================
// RENDER STUDENTS (Pastel EdTech Hub UI)
// =========================

function getAvatarColorClass(str) {
    const classes = ['av-purple', 'av-blue', 'av-green', 'av-orange', 'av-pink'];
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return classes[Math.abs(hash) % classes.length];
}

function getInitials(name) {
    if (!name) return 'SV';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function renderStudents(students) {
    const studentTableBody = document.getElementById('studentTableBody');
    if (!studentTableBody) return;

    // Cập nhật các thẻ Bento Stat Cards
    updateStudentStats(students);

    if (!students || students.length === 0) {
        studentTableBody.innerHTML = `
            <tr>
                <td colspan="8" class="text-center text-muted py-5">
                    <i class="bi bi-inbox fs-3 d-block mb-2 text-secondary"></i>
                    Không có dữ liệu sinh viên nào phù hợp.
                </td>
            </tr>
        `;
        return;
    }

    studentTableBody.innerHTML = students
        .map((student, index) => {
            const avatarColor = getAvatarColorClass(student.fullName || student.studentCode || 'SV');
            const initials = getInitials(student.fullName);

            return `
                <tr>
                    <td class="text-center text-muted small fw-medium">${index + 1}</td>
                    <td>
                        <span class="session-code-pill">${escapeHtml(student.studentCode)}</span>
                    </td>
                    <td>
                        <div class="d-flex align-items-center gap-2">
                            <div class="team-avatar ${avatarColor}" style="width: 34px; height: 34px; font-size: 0.75rem;">
                                ${initials}
                            </div>
                            <div>
                                <div class="fw-bold text-dark">${escapeHtml(student.fullName)}</div>
                            </div>
                        </div>
                    </td>
                    <td class="text-muted small">
                        ${escapeHtml(student.email)}
                    </td>
                    <td class="text-muted small font-monospace">
                        ${escapeHtml(student.phone)}
                    </td>
                    <td class="text-center">
                        <span class="badge bg-light text-primary border fw-semibold px-2 py-1">
                            ${escapeHtml(student.className)}
                        </span>
                    </td>
                    <td class="text-center">
                        <span class="badge-status badge-status-active">
                            <span class="status-pulse-dot"></span>Đang học
                        </span>
                    </td>
                    <td class="text-end">
                        <div class="table-actions">
                            <!-- Xem -->
                            <a
                                class="btn btn-info btn-sm"
                                href="index.html?page=form&id=${encodeURIComponent(student.id)}&mode=view"
                                title="Xem chi tiết"
                            >
                                <i class="bi bi-eye"></i>
                            </a>

                            <!-- Sửa -->
                            <a
                                class="btn btn-warning btn-sm"
                                href="index.html?page=form&id=${encodeURIComponent(student.id)}&mode=edit"
                                title="Chỉnh sửa thông tin"
                            >
                                <i class="bi bi-pencil-square"></i>
                            </a>

                            <!-- Xóa -->
                            <button
                                type="button"
                                class="btn btn-danger btn-sm"
                                title="Xóa"
                                onclick="deleteStudent('${escapeHtml(student.id)}')"
                            >
                                <i class="bi bi-trash"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        })
        .join('');

    // GSAP Stagger animation cho các hàng trong bảng
    if (window.gsap) {
        gsap.from('#studentTableBody tr', {
            opacity: 0,
            y: 8,
            duration: 0.25,
            stagger: 0.02,
            ease: 'power1.out'
        });
    }
}

function updateStudentStats(students) {
    if (!students) return;
    const total = students.length;
    const classes = new Set(students.map(s => s.className).filter(Boolean)).size;

    animateCount('statTotalStudents', total);
    animateCount('statActiveStudents', total);
    animateCount('statTotalClasses', classes || 1);
}

function animateCount(elementId, targetValue) {
    const el = document.getElementById(elementId);
    if (!el) return;
    if (!window.gsap) {
        el.textContent = targetValue;
        return;
    }
    const currentVal = parseInt(el.textContent, 10) || 0;
    const obj = { val: currentVal };
    gsap.to(obj, {
        val: targetValue,
        duration: 0.6,
        ease: 'power2.out',
        onUpdate: () => {
            el.textContent = Math.round(obj.val);
        }
    });
}

// =========================
// SEARCH
// =========================

function handleSearch(event) {
    event.preventDefault();
    const keywordInput = document.getElementById('keyword');
    const keyword = keywordInput ? keywordInput.value.trim() : '';
    loadStudents(keyword);
}

// =========================
// DELETE STUDENT
// =========================

window.deleteStudent = async function (id) {
    const confirmed = window.confirm('Bạn có chắc muốn xóa sinh viên này?');
    if (!confirmed) return;

    try {
        const response = await fetch(
            `${API_ENDPOINTS.STUDENTS}/${encodeURIComponent(id)}`,
            { method: 'DELETE' }
        );

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        alert('Xóa sinh viên thành công');
        const keywordInput = document.getElementById('keyword');
        const keyword = keywordInput ? keywordInput.value.trim() : '';
        await loadStudents(keyword);
    } catch (error) {
        console.error('Lỗi khi xóa sinh viên:', error);
        alert('Xóa sinh viên thất bại');
    }
};

// =========================
// FORM
// =========================

function initStudentForm() {
    const studentForm = document.getElementById('studentForm');
    if (!studentForm) return;

    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');
    const mode = urlParams.get('mode') || 'create';

    setupFormMode(mode);

    if ((mode === 'view' || mode === 'edit') && id) {
        loadStudentDetail(id, mode);
    }

    studentForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        if (mode === 'view') return;
        await saveStudent(mode, id);
    });
}

function setupFormMode(mode) {
    const pageTitle = document.getElementById('pageTitle');
    const pageHeading = document.getElementById('pageHeading');
    const breadcrumbTitle = document.getElementById('breadcrumbTitle');
    const formTitle = document.getElementById('formTitle');
    const submitButton = document.getElementById('submitButton');

    const fields = [
        document.getElementById('studentCode'),
        document.getElementById('fullName'),
        document.getElementById('email'),
        document.getElementById('phone'),
        document.getElementById('className')
    ];

    if (mode === 'create') {
        if (pageTitle) pageTitle.textContent = 'Thêm sinh viên | School Manager';
        if (pageHeading) pageHeading.innerHTML = '<i class="bi bi-person-plus text-primary me-2"></i>Thêm sinh viên';
        if (breadcrumbTitle) breadcrumbTitle.textContent = 'Thêm';
        if (formTitle) formTitle.innerHTML = '<i class="bi bi-person-vcard me-2"></i>Thêm sinh viên mới';
        if (submitButton) {
            submitButton.style.display = '';
            submitButton.innerHTML = `<i class="bi bi-plus-circle me-1"></i>Thêm sinh viên`;
        }
        return;
    }

    if (mode === 'edit') {
        if (pageTitle) pageTitle.textContent = 'Sửa sinh viên | School Manager';
        if (pageHeading) pageHeading.innerHTML = '<i class="bi bi-pencil-square text-primary me-2"></i>Sửa sinh viên';
        if (breadcrumbTitle) breadcrumbTitle.textContent = 'Sửa';
        if (formTitle) formTitle.innerHTML = '<i class="bi bi-pencil-square me-2"></i>Cập nhật thông tin sinh viên';
        if (submitButton) {
            submitButton.style.display = '';
            submitButton.innerHTML = `<i class="bi bi-check-circle me-1"></i>Lưu thay đổi`;
        }
        return;
    }

    if (mode === 'view') {
        if (pageTitle) pageTitle.textContent = 'Chi tiết sinh viên | School Manager';
        if (pageHeading) pageHeading.innerHTML = '<i class="bi bi-person-badge text-primary me-2"></i>Chi tiết sinh viên';
        if (breadcrumbTitle) breadcrumbTitle.textContent = 'Xem';
        if (formTitle) formTitle.innerHTML = '<i class="bi bi-person-badge me-2"></i>Thông tin sinh viên';
        if (submitButton) submitButton.style.display = 'none';

        fields.forEach((field) => {
            if (field) field.readOnly = true;
        });
    }
}

async function loadStudentDetail(id, mode) {
    try {
        const response = await fetch(`${API_ENDPOINTS.STUDENTS}/${encodeURIComponent(id)}`);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const student = await response.json();
        fillStudentForm(student);
        if (mode === 'view') setFormReadOnly(true);
    } catch (error) {
        console.error('Lỗi khi lấy thông tin sinh viên:', error);
        alert('Không thể lấy thông tin sinh viên');
        window.location.href = 'index.html?page=list';
    }
}

function fillStudentForm(student) {
    const studentCode = document.getElementById('studentCode');
    const fullName = document.getElementById('fullName');
    const email = document.getElementById('email');
    const phone = document.getElementById('phone');
    const className = document.getElementById('className');

    if (studentCode) studentCode.value = student.studentCode || '';
    if (fullName) fullName.value = student.fullName || '';
    if (email) email.value = student.email || '';
    if (phone) phone.value = student.phone || '';
    if (className) className.value = student.className || '';
}

async function saveStudent(mode, id = null) {
    try {
        const student = getStudentFormData();
        if (!validateStudent(student)) return;

        let url = API_ENDPOINTS.STUDENTS;
        let method = 'POST';

        if (mode === 'edit' && id) {
            url = `${API_ENDPOINTS.STUDENTS}/${encodeURIComponent(id)}`;
            method = 'PUT';
        }

        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(student)
        });

        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        alert(mode === 'edit' ? 'Cập nhật sinh viên thành công' : 'Thêm sinh viên thành công');
        window.location.href = 'index.html?page=list';
    } catch (error) {
        console.error('Lỗi khi lưu sinh viên:', error);
        alert(mode === 'edit' ? 'Cập nhật sinh viên thất bại' : 'Thêm sinh viên thất bại');
    }
}

function getStudentFormData() {
    return {
        studentCode: getValue('studentCode'),
        fullName: getValue('fullName'),
        email: getValue('email'),
        phone: getValue('phone'),
        className: getValue('className')
    };
}

function getValue(id) {
    const element = document.getElementById(id);
    return element ? element.value.trim() : '';
}

function validateStudent(student) {
    if (!student.studentCode) { alert('Vui lòng nhập mã sinh viên'); return false; }
    if (!student.fullName) { alert('Vui lòng nhập họ và tên'); return false; }
    if (!student.email) { alert('Vui lòng nhập email'); return false; }
    if (!student.phone) { alert('Vui lòng nhập số điện thoại'); return false; }
    if (!student.className) { alert('Vui lòng nhập lớp'); return false; }
    return true;
}

function setFormReadOnly(readOnly) {
    const fields = ['studentCode', 'fullName', 'email', 'phone', 'className'];
    fields.forEach((id) => {
        const element = document.getElementById(id);
        if (element) element.readOnly = readOnly;
    });
}

function escapeHtml(value) {
    if (value === null || value === undefined) return '';
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

// ==========================================================================
// 📅 MINI CALENDAR (eCoursie style side panel)
// ==========================================================================

function renderMiniCalendar() {
    const container = document.getElementById('miniCalendar');
    if (!container) return;

    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const today = now.getDate();

    const monthNames = ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
                        'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'];
    const dayNames = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const startOffset = (firstDay === 0) ? 6 : firstDay - 1; // Monday start

    let daysHTML = '';
    for (let i = 0; i < startOffset; i++) {
        daysHTML += '<span class="cal-day empty"></span>';
    }
    for (let d = 1; d <= daysInMonth; d++) {
        const isToday = d === today ? ' today' : '';
        daysHTML += `<span class="cal-day${isToday}">${d}</span>`;
    }

    container.innerHTML = `
        <div class="cal-header">
            <h6>${monthNames[month]} ${year}</h6>
            <div class="cal-nav">
                <button type="button"><i class="bi bi-chevron-left"></i></button>
                <button type="button"><i class="bi bi-chevron-right"></i></button>
            </div>
        </div>
        <div class="cal-weekdays">
            ${dayNames.map(d => `<span>${d}</span>`).join('')}
        </div>
        <div class="cal-days">
            ${daysHTML}
        </div>
    `;
}
