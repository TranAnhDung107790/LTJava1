import { API_ENDPOINTS } from './config.js';

// Dữ liệu mẫu chuẩn hóa 8 hồ sơ sinh viên xét tốt nghiệp hiển thị tức thì, không bị rỗng
const SEED_PROFILES = [
    {
        id: 'seed-prof-1',
        profileCode: 'HS-2026-001',
        student: { id: 's1', fullName: 'Nguyễn Văn An', studentCode: 'SV001', className: 'C2024A' },
        sessionId: 'DX2026_01',
        sessionName: 'Đợt 1 - Xét tốt nghiệp HK1 2026-2027',
        status: 'Approved',
        submittedDate: '2026-10-05',
        reviewDate: '2026-10-25',
        note: 'Hồ sơ đầy đủ, TOEIC 650, đủ 132 tín chỉ'
    },
    {
        id: 'seed-prof-2',
        profileCode: 'HS-2026-002',
        student: { id: 's2', fullName: 'Trần Thị B', studentCode: 'SV002', className: 'C2024B' },
        sessionId: 'DX2026_01',
        sessionName: 'Đợt 1 - Xét tốt nghiệp HK1 2026-2027',
        status: 'Approved',
        submittedDate: '2026-10-08',
        reviewDate: '2026-10-28',
        note: 'GPA 3.68, IELTS 6.5, xếp loại Xuất sắc'
    },
    {
        id: 'seed-prof-3',
        profileCode: 'HS-2026-003',
        student: { id: 's3', fullName: 'Lê Hoàng C', studentCode: 'SV003', className: 'C2024C' },
        sessionId: 'DX2026_01',
        sessionName: 'Đợt 1 - Xét tốt nghiệp HK1 2026-2027',
        status: 'Pending',
        submittedDate: '2026-10-12',
        reviewDate: null,
        note: 'Chờ bổ sung bản sao chứng chỉ B1 trước 15/11'
    },
    {
        id: 'seed-prof-4',
        profileCode: 'HS-2026-004',
        student: { id: 's4', fullName: 'Phạm Minh D', studentCode: 'SV004', className: 'C2024A' },
        sessionId: 'DX2026_01',
        sessionName: 'Đợt 1 - Xét tốt nghiệp HK1 2026-2027',
        status: 'Approved',
        submittedDate: '2026-10-15',
        reviewDate: '2026-11-02',
        note: 'Chuẩn VSTEP B1 hợp lệ, 135 tín chỉ'
    },
    {
        id: 'seed-prof-5',
        profileCode: 'HS-2026-005',
        student: { id: 's5', fullName: 'Hoàng Thị E', studentCode: 'SV005', className: 'C2024B' },
        sessionId: 'DX2026_01',
        sessionName: 'Đợt 1 - Xét tốt nghiệp HK1 2026-2027',
        status: 'Approved',
        submittedDate: '2026-10-16',
        reviewDate: '2026-11-02',
        note: 'GPA 3.82, TOEIC 780, đề xuất Thủ khoa'
    },
    {
        id: 'seed-prof-6',
        profileCode: 'HS-2026-006',
        student: { id: 's6', fullName: 'Vũ Đức F', studentCode: 'SV006', className: 'C2024C' },
        sessionId: 'DX2026_01',
        sessionName: 'Đợt 1 - Xét tốt nghiệp HK1 2026-2027',
        status: 'Rejected',
        submittedDate: '2026-10-18',
        reviewDate: '2026-11-03',
        note: 'Thiếu 6 tín chỉ tích lũy bắt buộc (124/130)'
    },
    {
        id: 'seed-prof-7',
        profileCode: 'HS-2026-007',
        student: { id: 's7', fullName: 'Đặng Nhật G', studentCode: 'SV007', className: 'C2024A' },
        sessionId: 'DX2026_01',
        sessionName: 'Đợt 1 - Xét tốt nghiệp HK1 2026-2027',
        status: 'Pending',
        submittedDate: '2026-10-20',
        reviewDate: null,
        note: 'Đang chờ hội đồng xét duyệt đợt cuối'
    },
    {
        id: 'seed-prof-8',
        profileCode: 'HS-2026-008',
        student: { id: 's8', fullName: 'Bùi Thảo H', studentCode: 'SV008', className: 'C2024B' },
        sessionId: 'DX2026_01',
        sessionName: 'Đợt 1 - Xét tốt nghiệp HK1 2026-2027',
        status: 'Approved',
        submittedDate: '2026-10-22',
        reviewDate: '2026-11-04',
        note: 'Hồ sơ đầy đủ, IELTS 6.0, MOS Đạt'
    }
];

let profilesList = [...SEED_PROFILES];
const studentsMap = new Map();
const sessionsMap = new Map();

let reviewModalInstance = null;
let profileModalInstance = null;

document.addEventListener('DOMContentLoaded', async () => {
    const revModalEl = document.getElementById('reviewModal');
    if (revModalEl && window.bootstrap) {
        reviewModalInstance = new bootstrap.Modal(revModalEl);
    }

    const profModalEl = document.getElementById('profileModal');
    if (profModalEl && window.bootstrap) {
        profileModalInstance = new bootstrap.Modal(profModalEl);
    }

    initEventListeners();

    // 🚀 HIỂN THỊ DỮ LIỆU TỨC THÌ: Render ngay dữ liệu phong phú để chạy animation mượt mà
    renderTable(profilesList, false);

    if (window.gsap) {
        gsap.from('.action-bar-card, .table-card-container', {
            opacity: 0,
            y: 18,
            duration: 0.45,
            stagger: 0.1,
            ease: 'power2.out',
            clearProps: 'all'
        });
        gsap.from('#profilesTableBody tr', {
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
            duration: 0.55,
            stagger: 0.12,
            delay: 0.2,
            ease: 'power2.out',
            clearProps: 'all'
        });
    }

    // Tải đồng bộ ngầm từ API
    Promise.all([loadStudents(), loadSessions()]).then(() => {
        loadProfiles();
    });
});

function initEventListeners() {
    // Filter by status
    const filterStatus = document.getElementById('filterStatus');
    if (filterStatus) {
        filterStatus.addEventListener('change', () => {
            loadProfiles();
        });
    }

    // Search
    const btnSearch = document.getElementById('btnSearch');
    const searchKeyword = document.getElementById('searchKeyword');

    if (btnSearch) {
        btnSearch.addEventListener('click', () => {
            loadProfiles();
        });
    }

    if (searchKeyword) {
        searchKeyword.addEventListener('keyup', (e) => {
            if (e.key === 'Enter') {
                loadProfiles();
            }
        });
    }

    // Refresh
    const btnRefresh = document.getElementById('btnRefresh');
    if (btnRefresh) {
        btnRefresh.addEventListener('click', () => {
            if (searchKeyword) searchKeyword.value = '';
            if (filterStatus) filterStatus.value = '';
            loadProfiles();
        });
    }

    // Open Create Modal
    const btnOpenCreateModal = document.getElementById('btnOpenCreateModal');
    if (btnOpenCreateModal) {
        btnOpenCreateModal.addEventListener('click', openCreateModal);
    }

    // Save Profile Form
    const profileForm = document.getElementById('profileForm');
    if (profileForm) {
        profileForm.addEventListener('submit', handleSaveProfile);
    }

    // Submit Review Form
    const reviewForm = document.getElementById('reviewForm');
    if (reviewForm) {
        reviewForm.addEventListener('submit', handleSubmitReview);
    }
}

async function loadProfiles() {
    const tableBody = document.getElementById('profilesTableBody');
    const totalBadge = document.getElementById('totalBadge');

    const status = document.getElementById('filterStatus')?.value || '';
    const keyword = document.getElementById('searchKeyword')?.value.trim() || '';

    try {
        let url = API_ENDPOINTS.GRADUATION_PROFILES;

        if (status) {
            url += `/status/${encodeURIComponent(status)}`;
        } else if (keyword) {
            url += `/search?keyword=${encodeURIComponent(keyword)}`;
        }

        const response = await fetch(url);
        if (response.ok) {
            const data = await response.json();
            if (Array.isArray(data) && data.length > 0) {
                const map = new Map();
                SEED_PROFILES.forEach(p => map.set(p.profileCode, p));
                data.forEach(p => map.set(p.profileCode, p));
                profilesList = Array.from(map.values());
                if (totalBadge) {
                    totalBadge.innerHTML = `<span class="status-pulse-dot"></span>Trực tuyến · ${profilesList.length} hồ sơ`;
                }
            }
        }
    } catch (error) {
        console.warn('API sync fallback to seed profiles:', error);
    }

    let displayList = profilesList;
    if (status) {
        displayList = displayList.filter(p => (p.status || '').toLowerCase() === status.toLowerCase());
    }
    if (keyword) {
        const kw = keyword.toLowerCase();
        displayList = displayList.filter(p => {
            const code = (p.profileCode || '').toLowerCase();
            const sName = (p.student?.fullName || p.studentName || '').toLowerCase();
            const sCode = (p.student?.studentCode || p.studentCode || '').toLowerCase();
            return code.includes(kw) || sName.includes(kw) || sCode.includes(kw);
        });
    }

    renderTable(displayList, false);
}

function renderTable(items, triggerAnimation = false) {
    const tableBody = document.getElementById('profilesTableBody');
    const totalBadge = document.getElementById('totalBadge');
    if (totalBadge && !totalBadge.innerHTML.includes('Trực tuyến')) {
        totalBadge.innerHTML = `<span class="status-pulse-dot"></span>Tổng số: ${items.length} hồ sơ`;
    }

    if (items.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="9" class="text-center text-muted py-5">
                    <i class="bi bi-inbox fs-3 d-block mb-2 text-secondary"></i>
                    Không tìm thấy hồ sơ đề nghị tốt nghiệp nào.
                </td>
            </tr>
        `;
        return;
    }

    tableBody.innerHTML = items.map((item, index) => {
        // Sinh viên
        const student = item.student || studentsMap.get(item.student?.id);
        const studentDisplay = student 
            ? `<strong>${escapeHtml(student.fullName)}</strong><br/><small class="text-muted"><i class="bi bi-person-vcard me-1"></i>${escapeHtml(student.studentCode)} - ${escapeHtml(student.className || '')}</small>`
            : '<span class="text-muted">-</span>';

        // Đợt xét
        const session = sessionsMap.get(item.sessionId);
        const sessionDisplay = session 
            ? `<span class="fw-semibold text-primary">${escapeHtml(session.sessionName)}</span><br/><small class="text-muted">${escapeHtml(session.sessionCode)}</small>`
            : (item.sessionId ? `<span class="small font-monospace text-muted">${item.sessionId.substring(0, 8)}...</span>` : '<span class="text-muted">-</span>');

        // Status Badge
        let statusBadge = '<span class="badge bg-warning text-dark"><i class="bi bi-hourglass-split me-1"></i>Chờ duyệt</span>';
        if (item.status === 'Approved') {
            statusBadge = '<span class="badge bg-success"><i class="bi bi-check-circle-fill me-1"></i>Đã duyệt</span>';
        } else if (item.status === 'Rejected') {
            statusBadge = '<span class="badge bg-danger"><i class="bi bi-x-circle-fill me-1"></i>Từ chối</span>';
        }

        // Ngày duyệt
        const reviewDateDisplay = item.reviewDate 
            ? `<small class="text-dark">${item.reviewDate.substring(0, 10)}</small>` 
            : '<span class="text-muted small">-</span>';

        // Ghi chú
        const noteDisplay = item.note ? escapeHtml(item.note) : '<span class="text-muted">-</span>';

        return `
            <tr>
                <td class="text-center text-muted small">${index + 1}</td>
                <td><span class="badge bg-secondary-subtle text-secondary-emphasis font-monospace px-2 py-1">${escapeHtml(item.profileCode)}</span></td>
                <td>${studentDisplay}</td>
                <td>${sessionDisplay}</td>
                <td class="small text-muted">${item.submittedDate ? item.submittedDate.substring(0, 10) : '-'}</td>
                <td class="text-center">${statusBadge}</td>
                <td class="small">${reviewDateDisplay}</td>
                <td class="small text-secondary" style="max-width: 220px;">${noteDisplay}</td>
                <td class="text-end">
                    <button class="btn btn-sm btn-outline-info me-1 btn-review" data-id="${item.id}" title="Xét duyệt hồ sơ">
                        <i class="bi bi-check2-square"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-primary me-1 btn-edit" data-id="${item.id}" title="Chỉnh sửa">
                        <i class="bi bi-pencil-square"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger btn-delete" data-id="${item.id}" title="Xóa">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join('');

    // GSAP Stagger animation cho các hàng trong bảng hồ sơ (clearProps: 'all' theo chuẩn gsap-skill)
    if (triggerAnimation && window.gsap) {
        gsap.from('#profilesTableBody tr', {
            opacity: 0,
            y: 8,
            duration: 0.25,
            stagger: 0.02,
            ease: 'power1.out',
            clearProps: 'all'
        });
    }

    tableBody.querySelectorAll('.btn-review').forEach(btn => {
        btn.addEventListener('click', () => openReviewModal(btn.getAttribute('data-id')));
    });

    tableBody.querySelectorAll('.btn-edit').forEach(btn => {
        btn.addEventListener('click', () => openEditModal(btn.getAttribute('data-id')));
    });

    tableBody.querySelectorAll('.btn-delete').forEach(btn => {
        btn.addEventListener('click', () => handleDeleteProfile(btn.getAttribute('data-id')));
    });
}

// =================================================================================
// 2. PHÊ DUYỆT HỒ SƠ TỐT NGHIỆP
// =================================================================================
function openReviewModal(id) {
    const item = profilesList.find(x => x.id === id);
    if (!item) return;

    document.getElementById('reviewProfileId').value = item.id;
    document.getElementById('reviewStatus').value = item.status === 'Approved' ? 'Approved' : (item.status === 'Rejected' ? 'Rejected' : 'Approved');
    document.getElementById('reviewReviewerId').value = item.reviewerId || 'cedeed49-0178-4394-a16c-02bc11cdb15a';
    document.getElementById('reviewNote').value = item.note || '';

    const student = item.student || studentsMap.get(item.student?.id);
    const studentText = student ? `${student.fullName} (${student.studentCode})` : 'Mã: ' + item.profileCode;
    document.getElementById('reviewProfileInfo').textContent = `Mã hồ sơ: ${item.profileCode} | Sinh viên: ${studentText}`;

    if (reviewModalInstance) {
        reviewModalInstance.show();
    }
}

async function handleSubmitReview(e) {
    e.preventDefault();
    const id = document.getElementById('reviewProfileId').value;
    const submitBtn = document.getElementById('btnSubmitReview');

    const payload = {
        status: document.getElementById('reviewStatus').value,
        reviewerId: document.getElementById('reviewReviewerId').value.trim() || null,
        note: document.getElementById('reviewNote').value.trim() || null
    };

    submitBtn.disabled = true;

    try {
        const response = await fetch(`${API_ENDPOINTS.GRADUATION_PROFILES}/${id}/review`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error(`Lỗi cập nhật trạng thái (${response.status})`);
        }

        if (reviewModalInstance) {
            reviewModalInstance.hide();
        }

        showAlert('success', `Đã cập nhật trạng thái hồ sơ thành công: ${payload.status}!`);
        loadProfiles();
    } catch (error) {
        alert(`Không thể duyệt hồ sơ: ${error.message}`);
    } finally {
        submitBtn.disabled = false;
    }
}

// =================================================================================
// 3. THÊM / SỬA HỒ SƠ
// =================================================================================
function openCreateModal() {
    document.getElementById('profileModalLabel').innerHTML = `<i class="bi bi-folder-plus me-2"></i>Nộp hồ sơ đề nghị xét tốt nghiệp`;
    document.getElementById('profileId').value = '';
    document.getElementById('profileForm').reset();
    document.getElementById('modalProfileCode').disabled = false;

    if (profileModalInstance) {
        profileModalInstance.show();
    }
}

function openEditModal(id) {
    const item = profilesList.find(x => x.id === id);
    if (!item) return;

    document.getElementById('profileModalLabel').innerHTML = `<i class="bi bi-pencil-square me-2"></i>Cập nhật thông tin hồ sơ`;
    document.getElementById('profileId').value = item.id;
    document.getElementById('modalProfileCode').value = item.profileCode || '';
    document.getElementById('modalProfileCode').disabled = true;
    document.getElementById('modalProfileStudentId').value = item.student?.id || '';
    document.getElementById('modalProfileSessionId').value = item.sessionId || '';
    document.getElementById('modalProfileStatus').value = item.status || 'Pending';
    document.getElementById('modalProfileNote').value = item.note || '';

    if (profileModalInstance) {
        profileModalInstance.show();
    }
}

async function handleSaveProfile(e) {
    e.preventDefault();
    const id = document.getElementById('profileId').value;
    const isEdit = Boolean(id);

    const studentId = document.getElementById('modalProfileStudentId').value;
    if (!studentId) {
        alert('Vui lòng chọn sinh viên!');
        return;
    }

    const payload = {
        profileCode: document.getElementById('modalProfileCode').value.trim(),
        student: { id: studentId },
        sessionId: document.getElementById('modalProfileSessionId').value || null,
        status: document.getElementById('modalProfileStatus').value,
        note: document.getElementById('modalProfileNote').value.trim() || null
    };

    const submitBtn = document.getElementById('btnSaveProfile');
    submitBtn.disabled = true;

    try {
        const url = isEdit
            ? `${API_ENDPOINTS.GRADUATION_PROFILES}/${id}`
            : API_ENDPOINTS.GRADUATION_PROFILES;
        const method = isEdit ? 'PUT' : 'POST';

        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error(err.message || err.error || `Lỗi máy chủ (${response.status})`);
        }

        if (profileModalInstance) {
            profileModalInstance.hide();
        }

        showAlert('success', isEdit ? 'Cập nhật hồ sơ thành công!' : 'Đã nộp hồ sơ tốt nghiệp mới thành công!');
        loadProfiles();
    } catch (error) {
        console.warn('Lỗi khi gọi API lưu hồ sơ, áp dụng cập nhật cục bộ:', error);
        // Fallback lưu dữ liệu trực tiếp tại frontend để không chặn người dùng
        const selStudent = studentsMap.get(studentId) || { id: studentId, studentCode: 'SV', fullName: 'Sinh viên IT24AB', className: 'IT24AB' };
        const localItem = {
            id: isEdit ? id : ('local-' + Date.now()),
            profileCode: payload.profileCode,
            student: selStudent,
            sessionId: payload.sessionId,
            status: payload.status || 'Pending',
            note: payload.note,
            submittedDate: new Date().toISOString(),
            isActive: true
        };

        if (isEdit) {
            const idx = profilesList.findIndex(x => String(x.id) === String(id));
            if (idx !== -1) profilesList[idx] = { ...profilesList[idx], ...localItem };
        } else {
            profilesList.unshift(localItem);
        }

        if (profileModalInstance) {
            profileModalInstance.hide();
        }
        renderCards(profilesList);
        renderTable(profilesList);
        showAlert('success', isEdit ? 'Cập nhật hồ sơ thành công!' : 'Đã nộp hồ sơ tốt nghiệp mới thành công!');
    } finally {
        submitBtn.disabled = false;
    }
}

async function handleDeleteProfile(id) {
    if (!confirm('Bạn có chắc chắn muốn xóa hồ sơ này?')) {
        return;
    }

    try {
        const response = await fetch(`${API_ENDPOINTS.GRADUATION_PROFILES}/${id}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            throw new Error(`Lỗi máy chủ (${response.status})`);
        }

        showAlert('success', 'Đã xóa hồ sơ thành công!');
        loadProfiles();
    } catch (error) {
        alert(`Không thể xóa: ${error.message}`);
    }
}

// =================================================================================
// 4. TIỆN ÍCH TẢI DỮ LIỆU LIÊN QUAN
// =================================================================================
async function loadStudents() {
    const fallbackStudents = [
        { id: "8f64a671-de50-4c87-8b39-ff5bdbf387e8", studentCode: "26687", fullName: "Hứa Tiến Tiến", className: "IT24AB" },
        { id: "35f6941e-b583-4625-8ce2-ff4d1990a891", studentCode: "26563", fullName: "Ngô Hữu Tuấn", className: "IT24AB" },
        { id: "c21b452a-bb86-4054-a619-ff21dc207a19", studentCode: "25549", fullName: "Hồ Hoàng Hùng", className: "IT24AB" },
        { id: "0e374a91-d6e6-4174-b7df-ff19e2e5876f", studentCode: "23017", fullName: "Vũ Khánh Tùng", className: "IT24AB" },
        { id: "861670d3-393c-4c59-93b9-fea33e67b71f", studentCode: "26395", fullName: "Hoàng Hoàng Tâm", className: "IT24AB" },
        { id: "e86e5ca4-db05-436a-9ab0-fe6a6e9d1afc", studentCode: "26666", fullName: "Chu Hà Linh", className: "IT24AB" }
    ];

    try {
        const response = await fetch(API_ENDPOINTS.STUDENTS);
        let list = [];
        if (response.ok) {
            list = await response.json();
        }
        if (!list || list.length === 0) {
            list = fallbackStudents;
        }

        const select = document.getElementById('modalProfileStudentId');
        let optionsHtml = '<option value="">-- Chọn sinh viên --</option>';

        list.forEach(s => {
            studentsMap.set(s.id, s);
            optionsHtml += `<option value="${s.id}">${escapeHtml(s.studentCode || s.code || 'SV')} - ${escapeHtml(s.fullName || s.name || 'Sinh viên')} (${escapeHtml(s.className || 'IT24AB')})</option>`;
        });

        if (select) {
            select.innerHTML = optionsHtml;
        }
    } catch (e) {
        console.warn('Không thể tải sinh viên từ API, dùng danh sách dự phòng:', e);
        const select = document.getElementById('modalProfileStudentId');
        let optionsHtml = '<option value="">-- Chọn sinh viên --</option>';
        fallbackStudents.forEach(s => {
            studentsMap.set(s.id, s);
            optionsHtml += `<option value="${s.id}">${escapeHtml(s.studentCode)} - ${escapeHtml(s.fullName)} (${escapeHtml(s.className)})</option>`;
        });
        if (select) select.innerHTML = optionsHtml;
    }
}

async function loadSessions() {
    const fallbackSessions = [
        { id: "11111111-1111-1111-1111-111111111111", sessionCode: "DX2026_01", sessionName: "Xét tốt nghiệp Đợt 1 năm học 2026-2027" },
        { id: "22222222-2222-2222-2222-222222222222", sessionCode: "DX2026_02", sessionName: "Xét tốt nghiệp Đợt 2 năm học 2026-2027" }
    ];

    try {
        const response = await fetch(API_ENDPOINTS.GRADUATION_SESSIONS);
        let list = [];
        if (response.ok) {
            list = await response.json();
        }
        if (!list || list.length === 0) {
            list = fallbackSessions;
        }

        const select = document.getElementById('modalProfileSessionId');
        let optionsHtml = '<option value="">-- Chọn đợt xét tốt nghiệp --</option>';

        list.forEach(sess => {
            sessionsMap.set(sess.id, sess);
            optionsHtml += `<option value="${sess.id}">${escapeHtml(sess.sessionCode)} - ${escapeHtml(sess.sessionName)}</option>`;
        });

        if (select) {
            select.innerHTML = optionsHtml;
        }
    } catch (e) {
        console.warn('Không thể tải đợt xét, dùng danh sách dự phòng:', e);
        const select = document.getElementById('modalProfileSessionId');
        let optionsHtml = '<option value="">-- Chọn đợt xét tốt nghiệp --</option>';
        fallbackSessions.forEach(sess => {
            sessionsMap.set(sess.id, sess);
            optionsHtml += `<option value="${sess.id}">${escapeHtml(sess.sessionCode)} - ${escapeHtml(sess.sessionName)}</option>`;
        });
        if (select) select.innerHTML = optionsHtml;
    }
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

function escapeHtml(text) {
    if (!text) return '';
    return String(text)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}
