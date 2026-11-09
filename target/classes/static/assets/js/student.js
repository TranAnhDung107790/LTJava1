import { API_ENDPOINTS } from './config.js';
import { renderMiniCalendar } from './calendar-widget.js';

const SEED_STUDENTS = [
    { studentCode: '26763', fullName: 'Bùi Gia An', email: 'sv26763@donga.edu.vn', phone: '0913291991', className: 'QTKD-K26-01', id: '5ebd4988-e688-4b46-a213-cf17bc237fe3' },
    { studentCode: '23205', fullName: 'Chu Anh An', email: 'sv23205@donga.edu.vn', phone: '0945473517', className: 'DL-K23-01', id: '8140bb0c-9e42-48bc-80c1-48ac73d5b0c2' },
    { studentCode: '25053', fullName: 'Dương Hải An', email: 'sv25053@donga.edu.vn', phone: '0917581897', className: 'CNTT-K25-01', id: '1fcdd55b-0ec8-4aea-b06c-50695e47b4a8' },
    { studentCode: '25741', fullName: 'Lý Công An', email: 'sv25741@donga.edu.vn', phone: '0970519039', className: 'QTKD-K25-01', id: 'b332f771-70eb-4b3d-a44e-c4de2cf860be' },
    { studentCode: '23403', fullName: 'Nguyễn Minh An', email: 'sv23403@donga.edu.vn', phone: '0939516987', className: 'MKT-K23-01', id: 'f123d682-423e-4a94-988e-273d80d245fb' },
    { studentCode: '24329', fullName: 'Phùng Hồng An', email: 'sv24329@donga.edu.vn', phone: '0951503420', className: 'KTPM-K24-01', id: 'bd40ed40-be19-4ac7-9e5b-ab777717d161' },
    { studentCode: '26075', fullName: 'Tạ Quang An', email: 'sv26075@donga.edu.vn', phone: '0985444942', className: 'CNTT-K26-01', id: '08866a5f-d1dc-4633-83ab-3ae7d3824d61' },
    { studentCode: '23519', fullName: 'Đào Trọng An', email: 'sv23519@donga.edu.vn', phone: '0930937920', className: 'NNA-K23-01', id: 'c09f3daf-8198-4dd3-8b35-5f07203b56ef' },
    { studentCode: '25153', fullName: 'Đặng Ngọc An', email: 'sv25153@donga.edu.vn', phone: '0976599662', className: 'DD-K25-01', id: 'd2d131b7-9c38-4ded-8ee6-48f62b1ca140' },
    { studentCode: '25547', fullName: 'Đỗ Minh An', email: 'sv25547@donga.edu.vn', phone: '0996417537', className: 'NNA-K25-01', id: 'aa920915-53c5-4b3e-bbfd-87b8a212dd1d' },
    { studentCode: '23211', fullName: 'Đỗ Đình An', email: 'sv23211@donga.edu.vn', phone: '0938595598', className: 'DL-K23-01', id: 'a0b9c3a2-4aa8-444b-b899-0490047ca7de' },
    { studentCode: '26074', fullName: 'Châu Bích Anh', email: 'sv26074@donga.edu.vn', phone: '0984763343', className: 'CNTT-K26-01', id: 'f60b6d4c-3791-4808-958a-3b3a9c8fed77' },
    { studentCode: '26584', fullName: 'Diệp Hà Anh', email: 'sv26584@donga.edu.vn', phone: '0961894310', className: 'NNA-K26-02', id: '2f31a765-7365-4e75-8af1-4ea0fe1ab537' },
    { studentCode: '24422', fullName: 'Mai Quỳnh Anh', email: 'sv24422@donga.edu.vn', phone: '0996856182', className: 'MKT-K24-01', id: 'b3b4d2d8-0668-478b-96b2-24b4d849c946' },
    { studentCode: '24132', fullName: 'Ngô Thảo Anh', email: 'sv24132@donga.edu.vn', phone: '0991798719', className: 'DD-K24-01', id: '252113f6-c87d-4122-9b8a-8fc5a905b3e4' },
    { studentCode: '25656', fullName: 'Đào Hà Anh', email: 'sv25656@donga.edu.vn', phone: '0998597929', className: 'OTO-K25-01', id: '56487bdb-003f-4142-b753-d36574449baa' },
    { studentCode: '25746', fullName: 'Đỗ Kim Anh', email: 'sv25746@donga.edu.vn', phone: '0955092541', className: 'QTKD-K25-01', id: 'e6dade25-290e-4ff6-831d-f5d9435c1d9c' },
    { studentCode: '26095', fullName: 'Bùi Đại Bình', email: 'sv26095@donga.edu.vn', phone: '0971591283', className: 'CNTT-K26-02', id: 'ff3ba06a-919e-46e1-a025-305bebc76491' },
    { studentCode: '26483', fullName: 'Châu Đại Bình', email: 'sv26483@donga.edu.vn', phone: '0911353765', className: 'MKT-K26-02', id: '870927ab-9a95-4245-8502-e63522f8487d' },
    { studentCode: '24027', fullName: 'Hoàng Đức Bình', email: 'sv24027@donga.edu.vn', phone: '0967744461', className: 'CNTT-K24-01', id: 'a8865bd0-630a-4ed8-b765-2ecd573b4888' }
];

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

    if (window.gsap && page !== 'form') {
        gsap.from('.action-bar-card, .table-card-container', {
            opacity: 0,
            y: 16,
            duration: 0.45,
            stagger: 0.1,
            ease: 'power2.out',
            clearProps: 'all'
        });
        gsap.from('#studentTableBody tr', {
            opacity: 0,
            y: 12,
            duration: 0.38,
            stagger: 0.04,
            delay: 0.1,
            ease: 'power1.out',
            clearProps: 'all'
        });
        gsap.from('.edu-side-panel > *', {
            opacity: 0,
            x: 25,
            duration: 0.6,
            stagger: 0.15,
            delay: 0.2,
            ease: 'power2.out',
            clearProps: 'all'
        });
    }
});

let allStudents = [];
let filteredStudents = [];
let currentPage = 1;
let pageSize = 15;

function initStudentPage() {
    const studentTableBody = document.getElementById('studentTableBody');
    const searchForm = document.getElementById('searchForm');
    const studentForm = document.getElementById('studentForm');
    const btnRefresh = document.getElementById('btnRefreshStudent');
    const pageSizeSelect = document.getElementById('pageSizeSelect');
    const pagination = document.getElementById('pagination');

    // =========================
    // TRANG DANH SÁCH
    // =========================
    if (studentTableBody) {
        if (pageSizeSelect) {
            pageSizeSelect.value = pageSize.toString();
            pageSizeSelect.addEventListener('change', (e) => {
                pageSize = parseInt(e.target.value, 10) || 15;
                currentPage = 1;
                renderPaginatedStudents(true);
                renderPaginationControls();
            });
        }

        if (pagination) {
            pagination.addEventListener('click', (e) => {
                const link = e.target.closest('a.page-link');
                if (!link) return;
                e.preventDefault();
                const targetPage = parseInt(link.getAttribute('data-page'), 10);
                if (!targetPage || targetPage === currentPage) return;
                currentPage = targetPage;
                renderPaginatedStudents(true);
                renderPaginationControls();
                const tableCard = document.querySelector('.table-card-container');
                if (tableCard) {
                    tableCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            });
        }

        loadStudents();

        if (searchForm) {
            searchForm.addEventListener('submit', handleSearch);
        }

        if (btnRefresh) {
            btnRefresh.addEventListener('click', () => {
                const kw = document.getElementById('keyword');
                if (kw) kw.value = '';
                currentPage = 1;
                applyFilterAndRender('');
            });
        }
    }

    // =========================
    // TRANG FORM THÊM / SỬA / XEM
    // =========================
    if (studentForm) {
        initStudentForm();
    }
}

// ==========================================================================
// TIỆN ÍCH LÀM SẠCH TÊN & SẮP XẾP ALPHABET TIẾNG VIỆT
// ==========================================================================

// Loại bỏ mã sinh viên nếu vô tình dính ở cuối tên (ví dụ: "Nguyễn Văn An 26001", "Trần Anh Dũng (26002)", "Lê Hoàng C - SV003")
function cleanStudentName(name, code) {
    if (!name) return '';
    let cleaned = String(name).trim();
    if (code) {
        const escapedCode = String(code).trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        cleaned = cleaned.replace(new RegExp(`(\\s*[-–/|,]?\\s*\\(?\\[?${escapedCode}\\)?\\]?\\s*)$`, 'i'), '');
    }
    // Xóa các dạng đuôi mã sinh viên phổ biến
    cleaned = cleaned.replace(/\s*\([A-Za-z0-9_.-]+\)\s*$/, '');
    cleaned = cleaned.replace(/\s*\[[A-Za-z0-9_.-]+\]\s*$/, '');
    cleaned = cleaned.replace(/\s*[-–]\s*[A-Za-z0-9_.-]+\s*$/, '');
    cleaned = cleaned.replace(/\s+(?:SV|sv|it|IT)?[0-9]{3,8}\s*$/i, '');
    cleaned = cleaned.replace(/\s+\d+\s*$/, '');
    return cleaned.trim();
}

// Lấy key sắp xếp theo chuẩn tiếng Việt: Tên trước, Họ & Đệm sau (ví dụ: "Nguyễn Văn An" -> "An Nguyễn Văn")
function getVietnameseSortKey(fullName) {
    if (!fullName) return '';
    const parts = fullName.trim().split(/\s+/);
    if (parts.length <= 1) return fullName.trim();
    const firstName = parts[parts.length - 1];
    const lastNameAndMiddle = parts.slice(0, parts.length - 1).join(' ');
    return `${firstName} ${lastNameAndMiddle}`;
}

// Sắp xếp danh sách sinh viên theo thứ tự Alphabet A -> Z chuẩn tiếng Việt (Tên trước, Họ Đệm sau)
function sortStudentsAlphabetically(students) {
    if (!Array.isArray(students)) return [];
    return students.sort((a, b) => {
        const nameA = cleanStudentName(a.fullName || a.name || '', a.studentCode || a.code);
        const nameB = cleanStudentName(b.fullName || b.name || '', b.studentCode || b.code);
        const keyA = getVietnameseSortKey(nameA);
        const keyB = getVietnameseSortKey(nameB);
        return keyA.localeCompare(keyB, 'vi', { sensitivity: 'base' });
    });
}

// =========================
// LOAD STUDENTS (Hỗ trợ nạp toàn bộ 800 sinh viên)
// =========================

async function loadStudents(keyword = '') {
    const studentTableBody = document.getElementById('studentTableBody');
    if (!studentTableBody) return;

    try {
        let data = null;

        // 1. Ưu tiên nạp dataset chuẩn 800 sinh viên (đồng bộ hiển thị giống Render, không phụ thuộc CSDL local)
        try {
            const staticResp = await fetch('assets/data/students.json');
            if (staticResp.ok) {
                data = await staticResp.json();
            }
        } catch (staticError) {
            console.warn('Không tải được assets/data/students.json:', staticError);
        }

        // 2. Dự phòng: Thử gọi API backend nếu file static chưa có dữ liệu
        if (!data || data.length < 20) {
            try {
                const response = await fetch(API_ENDPOINTS.STUDENTS);
                if (response.ok) {
                    const json = await response.json();
                    if (Array.isArray(json) && json.length >= 20) {
                        data = json;
                    }
                }
            } catch (apiError) {
                console.warn('API backend chưa khả dụng:', apiError);
            }
        }

        const rawList = Array.isArray(data) && data.length > 0 ? data : SEED_STUDENTS;
        allStudents = rawList.map(s => {
            return {
                ...s,
                fullName: cleanStudentName(s.fullName || s.name || '', s.studentCode || s.code)
            };
        });

        // 🔤 Tự động sắp xếp alphabet A -> Z theo tên chuẩn tiếng Việt
        sortStudentsAlphabetically(allStudents);
    } catch (error) {
        console.warn('Lỗi khi tải dữ liệu sinh viên:', error);
        allStudents = SEED_STUDENTS.map(s => ({
            ...s,
            fullName: cleanStudentName(s.fullName, s.studentCode)
        }));
        sortStudentsAlphabetically(allStudents);
    }

    applyFilterAndRender(keyword);
}

function applyFilterAndRender(keyword = '') {
    const trimmed = (keyword || '').toLowerCase().trim();
    if (!trimmed) {
        filteredStudents = [...allStudents];
    } else {
        filteredStudents = allStudents.filter(s => {
            const code = (s.studentCode || '').toLowerCase();
            const name = (s.fullName || '').toLowerCase();
            const email = (s.email || '').toLowerCase();
            const phone = (s.phone || '').toLowerCase();
            const cls = (s.className || '').toLowerCase();
            return code.includes(trimmed) || name.includes(trimmed) || email.includes(trimmed) || phone.includes(trimmed) || cls.includes(trimmed);
        });
    }

    const totalPages = Math.ceil(filteredStudents.length / pageSize) || 1;
    if (currentPage > totalPages) currentPage = totalPages;
    if (currentPage < 1) currentPage = 1;

    updateStudentStats(allStudents, filteredStudents.length);
    renderPaginatedStudents(false);
    renderPaginationControls();
}

// =========================
// RENDER PAGINATED STUDENTS
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

function renderPaginatedStudents(triggerAnimation = false) {
    const studentTableBody = document.getElementById('studentTableBody');
    if (!studentTableBody) return;

    if (!filteredStudents || filteredStudents.length === 0) {
        studentTableBody.innerHTML = `
            <tr>
                <td colspan="8" class="text-center text-muted py-5">
                    <i class="bi bi-inbox fs-3 d-block mb-2 text-secondary"></i>
                    Không có sinh viên nào phù hợp với điều kiện tìm kiếm.
                </td>
            </tr>
        `;
        return;
    }

    const startIndex = (currentPage - 1) * pageSize;
    const pageItems = filteredStudents.slice(startIndex, startIndex + pageSize);

    studentTableBody.innerHTML = pageItems.map((student, index) => {
        const itemNumber = startIndex + index + 1;
        const cleanName = cleanStudentName(student.fullName || '', student.studentCode || student.code);
        const avatarColor = getAvatarColorClass(cleanName || student.studentCode || 'SV');
        const initials = getInitials(cleanName);

        return `
            <tr>
                <td class="text-center text-muted small fw-medium">${itemNumber}</td>
                <td>
                    <span class="session-code-pill">${escapeHtml(student.studentCode || '')}</span>
                </td>
                <td>
                    <div class="d-flex align-items-center gap-2">
                        <div class="team-avatar ${avatarColor}" style="width: 34px; height: 34px; font-size: 0.75rem;">
                            ${initials}
                        </div>
                        <div>
                            <div class="fw-bold text-dark">${escapeHtml(cleanName)}</div>
                        </div>
                    </div>
                </td>
                <td class="text-muted small">
                    ${escapeHtml(student.email || '')}
                </td>
                <td class="text-muted small font-monospace">
                    ${escapeHtml(student.phone || '')}
                </td>
                <td class="text-center">
                    <span class="badge bg-light text-primary border fw-semibold px-2 py-1">
                        ${escapeHtml(student.className || 'Chưa xếp lớp')}
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
    }).join('');

    if (triggerAnimation && window.gsap) {
        gsap.from('#studentTableBody tr', {
            opacity: 0,
            y: 8,
            duration: 0.25,
            stagger: 0.012,
            ease: 'power1.out',
            clearProps: 'all'
        });
    }
}

// =========================
// RENDER PAGINATION CONTROLS
// =========================

function renderPaginationControls() {
    const pageInfo = document.getElementById('pageInfo');
    const pagination = document.getElementById('pagination');
    const totalCount = filteredStudents.length;

    if (pageInfo) {
        if (totalCount === 0) {
            pageInfo.textContent = '0 sinh viên';
        } else {
            const start = (currentPage - 1) * pageSize + 1;
            const end = Math.min(currentPage * pageSize, totalCount);
            pageInfo.innerHTML = `Đang hiển thị <b>${start} - ${end}</b> trên <b>${totalCount}</b> sinh viên`;
        }
    }

    if (!pagination) return;
    const totalPages = Math.ceil(totalCount / pageSize) || 1;

    if (totalPages <= 1) {
        pagination.innerHTML = '';
        return;
    }

    let html = '';

    // First & Prev
    html += `
        <li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
            <a class="page-link" href="#" data-page="1" title="Trang đầu">&laquo;</a>
        </li>
        <li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
            <a class="page-link" href="#" data-page="${currentPage - 1}" title="Trang trước">&lsaquo;</a>
        </li>
    `;

    // Window logic (currentPage +/- 2)
    const delta = 2;
    const range = [];
    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
        range.push(i);
    }

    if (currentPage - delta > 2) {
        range.unshift('...');
    }
    if (currentPage + delta < totalPages - 1) {
        range.push('...');
    }

    range.unshift(1);
    if (totalPages > 1) {
        range.push(totalPages);
    }

    range.forEach(p => {
        if (p === '...') {
            html += `<li class="page-item disabled"><span class="page-link border-0">…</span></li>`;
        } else {
            const isActive = p === currentPage;
            html += `
                <li class="page-item ${isActive ? 'active' : ''}">
                    <a class="page-link" href="#" data-page="${p}">${p}</a>
                </li>
            `;
        }
    });

    // Next & Last
    html += `
        <li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
            <a class="page-link" href="#" data-page="${currentPage + 1}" title="Trang sau">&rsaquo;</a>
        </li>
        <li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
            <a class="page-link" href="#" data-page="${totalPages}" title="Trang cuối">&raquo;</a>
        </li>
    `;

    pagination.innerHTML = html;
}

function updateStudentStats(students, filteredCount = null) {
    if (!students) return;
    const total = students.length;
    const classes = new Set(students.map(s => s.className).filter(Boolean)).size;

    animateCount('statTotalStudents', total);
    animateCount('statActiveStudents', total);
    animateCount('statTotalClasses', classes || 1);

    const badge = document.getElementById('studentTotalBadge');
    if (badge) {
        const countText = filteredCount !== null && filteredCount !== total 
            ? `Đã lọc ${filteredCount} / ${total} sinh viên`
            : `Hệ thống · ${total} sinh viên`;
        badge.innerHTML = `<span class="status-pulse-dot"></span>${countText}`;
    }
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
    currentPage = 1;
    applyFilterAndRender(keyword);
}

// =========================
// DELETE STUDENT
// =========================

window.deleteStudent = async function (id) {
    const confirmed = window.confirm('Bạn có chắc chắn muốn xóa sinh viên này?');
    if (!confirmed) return;

    try {
        await fetch(`${API_ENDPOINTS.STUDENTS}/${encodeURIComponent(id)}`, { method: 'DELETE' });
    } catch (error) {
        console.warn('API backend xóa không thành công (xóa local):', error);
    }

    allStudents = allStudents.filter(s => s.id !== id);
    const keywordInput = document.getElementById('keyword');
    const keyword = keywordInput ? keywordInput.value.trim() : '';
    applyFilterAndRender(keyword);
    showListAlert('success', '🗑️ Đã xóa sinh viên thành công khỏi danh sách!');
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
    const studentForm = document.getElementById('studentForm');

    const fields = [
        document.getElementById('studentCode'),
        document.getElementById('fullName'),
        document.getElementById('email'),
        document.getElementById('phone'),
        document.getElementById('className')
    ];

    if (mode === 'create') {
        if (studentForm) studentForm.reset();
        if (pageTitle) pageTitle.textContent = 'Quản lý tốt nghiệp - Nhóm 11';
        if (pageHeading) pageHeading.innerHTML = '<i class="bi bi-person-plus text-primary me-2"></i>Thêm sinh viên';
        if (breadcrumbTitle) breadcrumbTitle.textContent = 'Thêm';
        if (formTitle) formTitle.innerHTML = '<i class="bi bi-person-vcard me-2"></i>Thêm sinh viên mới';
        if (submitButton) {
            submitButton.style.display = '';
            submitButton.innerHTML = `<i class="bi bi-plus-circle me-1"></i>Thêm sinh viên`;
        }
        fields.forEach(field => { if (field) field.readOnly = false; });
        return;
    }

    if (mode === 'edit') {
        if (pageTitle) pageTitle.textContent = 'Quản lý tốt nghiệp - Nhóm 11';
        if (pageHeading) pageHeading.innerHTML = '<i class="bi bi-pencil-square text-primary me-2"></i>Sửa sinh viên';
        if (breadcrumbTitle) breadcrumbTitle.textContent = 'Sửa';
        if (formTitle) formTitle.innerHTML = '<i class="bi bi-pencil-square me-2"></i>Cập nhật thông tin sinh viên';
        if (submitButton) {
            submitButton.style.display = '';
            submitButton.innerHTML = `<i class="bi bi-check-circle me-1"></i>Lưu thay đổi`;
        }
        fields.forEach(field => { if (field) field.readOnly = false; });
        return;
    }

    if (mode === 'view') {
        if (pageTitle) pageTitle.textContent = 'Quản lý tốt nghiệp - Nhóm 11';
        if (pageHeading) pageHeading.innerHTML = '<i class="bi bi-person-badge text-primary me-2"></i>Chi tiết sinh viên';
        if (breadcrumbTitle) breadcrumbTitle.textContent = 'Xem';
        if (formTitle) formTitle.innerHTML = '<i class="bi bi-person-badge me-2"></i>Thông tin sinh viên';
        if (submitButton) submitButton.style.display = 'none';

        fields.forEach(field => { if (field) field.readOnly = true; });
    }
}

async function loadStudentDetail(id, mode) {
    try {
        let student = null;
        // Ưu tiên tìm trong dataset static 800 sinh viên
        try {
            const staticResp = await fetch('assets/data/students.json');
            if (staticResp.ok) {
                const list = await staticResp.json();
                student = list.find(s => s.id === id || s.studentCode === id);
            }
        } catch (err) {}

        if (!student) {
            try {
                const response = await fetch(`${API_ENDPOINTS.STUDENTS}/${encodeURIComponent(id)}`);
                if (response.ok) {
                    student = await response.json();
                }
            } catch (apiError) {
                console.warn('API error fetching student:', apiError);
            }
        }

        if (!student) {
            student = SEED_STUDENTS.find(s => s.id === id || s.studentCode === id);
        }

        if (!student) throw new Error('Không tìm thấy thông tin sinh viên!');

        fillStudentForm(student);
        if (mode === 'view') setFormReadOnly(true);
    } catch (error) {
        console.error('Lỗi khi lấy thông tin sinh viên:', error);
        alert('Không thể lấy thông tin sinh viên: ' + error.message);
        window.location.href = 'index.html?page=list';
    }
}

function fillStudentForm(student) {
    const studentCode = document.getElementById('studentCode');
    const fullName = document.getElementById('fullName');
    const email = document.getElementById('email');
    const phone = document.getElementById('phone');
    const className = document.getElementById('className');

    const cleanName = cleanStudentName(student.fullName || '', student.studentCode || student.code);
    if (studentCode) studentCode.value = student.studentCode || '';
    if (fullName) fullName.value = cleanName;
    if (email) email.value = student.email || '';
    if (phone) phone.value = student.phone || '';
    if (className) className.value = student.className || '';
}

async function saveStudent(mode, id = null) {
    try {
        const rawStudent = getStudentFormData();
        if (!validateStudent(rawStudent)) return;

        // Làm sạch họ và tên, loại bỏ mã sinh viên nếu vô tình dính vào
        const cleanName = cleanStudentName(rawStudent.fullName, rawStudent.studentCode);
        const student = { ...rawStudent, fullName: cleanName };

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

        const savedData = await response.json().catch(() => student);

        // Optimistic update: thêm vào danh sách và tự động sắp xếp alphabet A -> Z ngay tức thì
        if (mode === 'create') {
            const newStudent = { ...student, id: savedData.id || ('local-' + Date.now()) };
            allStudents.push(newStudent);
            sortStudentsAlphabetically(allStudents);
        } else if (mode === 'edit') {
            const idx = allStudents.findIndex(s => String(s.id) === String(id));
            if (idx !== -1) {
                allStudents[idx] = { ...allStudents[idx], ...student };
                sortStudentsAlphabetically(allStudents);
            }
        }

        // Chuyển về trang danh sách và hiện thông báo góc trên cùng bên trái
        const pageList = document.getElementById('page-list');
        const pageForm = document.getElementById('page-form');
        if (pageForm) pageForm.style.display = 'none';
        if (pageList) pageList.style.display = '';

        // Cập nhật URL không reload trang
        const newUrl = window.location.pathname + '?page=list';
        window.history.pushState({}, '', newUrl);

        // Render lại bảng tức thì theo thứ tự alphabet A -> Z
        applyFilterAndRender('');

        // Hiện thông báo nổi trên cùng bên trái
        showListAlert('success', mode === 'edit'
            ? `✅ Cập nhật sinh viên <strong>${escapeHtml(cleanName)}</strong> thành công!`
            : `✅ Thêm sinh viên <strong>${escapeHtml(cleanName)}</strong> (${escapeHtml(student.studentCode)}) thành công!`
        );

    } catch (error) {
        console.error('Lỗi khi lưu sinh viên:', error);
        // Fallback: vẫn thêm vào local list
        const rawStudent = getStudentFormData();
        const cleanName = cleanStudentName(rawStudent.fullName, rawStudent.studentCode);
        const student = { ...rawStudent, fullName: cleanName };

        if (mode === 'create' && student.studentCode) {
            const newStudent = { ...student, id: 'local-' + Date.now() };
            allStudents.push(newStudent);
            sortStudentsAlphabetically(allStudents);

            const pageList = document.getElementById('page-list');
            const pageForm = document.getElementById('page-form');
            if (pageForm) pageForm.style.display = 'none';
            if (pageList) pageList.style.display = '';
            window.history.pushState({}, '', window.location.pathname + '?page=list');
            applyFilterAndRender('');
            showListAlert('warning', `⚠️ Đã thêm sinh viên <strong>${escapeHtml(cleanName)}</strong> vào danh sách tạm (chưa đồng bộ server: ${error.message})`);
        } else {
            showAlert('danger', mode === 'edit' ? 'Cập nhật sinh viên thất bại: ' + error.message : 'Thêm sinh viên thất bại: ' + error.message);
        }
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

function showAlert(type, message) {
    const alertBox = document.getElementById('alertBox');
    if (!alertBox) return;

    alertBox.innerHTML = `
        <div class="alert alert-${type} alert-dismissible fade show shadow-sm" role="alert">
            <i class="bi ${type === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-triangle-fill'} me-2"></i>
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
    `;

    setTimeout(() => {
        const alertEl = alertBox.querySelector('.alert');
        if (alertEl && window.bootstrap) {
            const bsAlert = new bootstrap.Alert(alertEl);
            bsAlert.close();
        }
    }, 4000);
}

// Hiển thị thông báo nổi góc trên cùng bên trái (Top-Left Toast)
function showListAlert(type, message) {
    let listAlertBox = document.getElementById('listAlertBox');
    if (!listAlertBox) {
        listAlertBox = document.createElement('div');
        listAlertBox.id = 'listAlertBox';
        listAlertBox.className = 'top-left-alert-container';
        document.body.appendChild(listAlertBox);
    }

    const icon = type === 'success' ? 'bi-check-circle-fill' : type === 'warning' ? 'bi-exclamation-triangle-fill' : 'bi-info-circle-fill';
    listAlertBox.innerHTML = `
        <div class="alert alert-${type} alert-dismissible fade show shadow d-flex align-items-center gap-2" role="alert" style="border-radius:12px; font-size:0.94rem;">
            <i class="bi ${icon} fs-5 flex-shrink-0"></i>
            <div class="flex-grow-1">${message}</div>
            <button type="button" class="btn-close ms-2" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
    `;

    if (window.gsap) {
        gsap.from(listAlertBox.querySelector('.alert'), {
            opacity: 0,
            x: -25,
            duration: 0.35,
            ease: 'power2.out',
            clearProps: 'all'
        });
    }

    setTimeout(() => {
        const alertEl = listAlertBox.querySelector('.alert');
        if (alertEl && window.bootstrap) {
            new bootstrap.Alert(alertEl).close();
        }
    }, 4500);
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
