import { API_ENDPOINTS } from './config.js';

let sessionsList = [];
let sessionModalInstance = null;
let autoModalInstance = null;
let activeOnlyFilter = false;

document.addEventListener('DOMContentLoaded', () => {
    const modalEl = document.getElementById('sessionModal');
    if (modalEl && window.bootstrap) {
        sessionModalInstance = new bootstrap.Modal(modalEl);
    }

    const autoModalEl = document.getElementById('autoModal');
    if (autoModalEl && window.bootstrap) {
        autoModalInstance = new bootstrap.Modal(autoModalEl);
    }

    initEventListeners();
    loadSessions();

    if (window.gsap) {
        gsap.from('.bento-stat-card', {
            opacity: 0,
            y: 16,
            duration: 0.5,
            stagger: 0.08,
            ease: 'power2.out'
        });
    }
});

function initEventListeners() {
    // Filter toggles
    const btnFilterAll = document.getElementById('btnFilterAll');
    const btnFilterActiveOnly = document.getElementById('btnFilterActiveOnly');

    if (btnFilterAll && btnFilterActiveOnly) {
        btnFilterAll.addEventListener('click', () => {
            btnFilterAll.classList.add('active');
            btnFilterActiveOnly.classList.remove('active');
            activeOnlyFilter = false;
            loadSessions();
        });

        btnFilterActiveOnly.addEventListener('click', () => {
            btnFilterActiveOnly.classList.add('active');
            btnFilterAll.classList.remove('active');
            activeOnlyFilter = true;
            loadSessions();
        });
    }

    // Search
    const btnSearch = document.getElementById('btnSearch');
    const searchKeyword = document.getElementById('searchKeyword');

    if (btnSearch) {
        btnSearch.addEventListener('click', () => {
            const kw = searchKeyword.value.trim();
            loadSessions(kw);
        });
    }

    if (searchKeyword) {
        searchKeyword.addEventListener('keyup', (e) => {
            if (e.key === 'Enter') {
                loadSessions(searchKeyword.value.trim());
            }
        });
    }

    // Refresh
    const btnRefresh = document.getElementById('btnRefresh');
    if (btnRefresh) {
        btnRefresh.addEventListener('click', () => {
            if (searchKeyword) searchKeyword.value = '';
            loadSessions();
        });
    }

    // Create Modal
    const btnOpenCreateModal = document.getElementById('btnOpenCreateModal');
    if (btnOpenCreateModal) {
        btnOpenCreateModal.addEventListener('click', openCreateModal);
    }

    // Auto Generate Modal
    const btnOpenAutoModal = document.getElementById('btnOpenAutoModal');
    if (btnOpenAutoModal) {
        btnOpenAutoModal.addEventListener('click', () => {
            if (autoModalInstance) {
                autoModalInstance.show();
            }
        });
    }

    // Save Form
    const sessionForm = document.getElementById('sessionForm');
    if (sessionForm) {
        sessionForm.addEventListener('submit', handleSaveSession);
    }

    // Auto Generate Form Submit
    const autoForm = document.getElementById('autoForm');
    if (autoForm) {
        autoForm.addEventListener('submit', handleAutoGenerateSessions);
    }
}

async function loadSessions(keyword = '') {
    const tableBody = document.getElementById('sessionsTableBody');
    tableBody.innerHTML = `
        <tr>
            <td colspan="10" class="text-center text-muted py-5">
                <div class="spinner-border spinner-border-sm text-primary me-2"></div>
                Đang tải danh sách đợt xét tốt nghiệp...
            </td>
        </tr>
    `;

    try {
        let url = API_ENDPOINTS.GRADUATION_SESSIONS;

        if (activeOnlyFilter) {
            url += '/active';
        } else if (keyword) {
            url += `/search?keyword=${encodeURIComponent(keyword)}`;
        }

        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Lỗi tải dữ liệu (${response.status})`);
        }

        sessionsList = await response.json();
        renderTable(sessionsList);
    } catch (error) {
        console.error('Lỗi khi tải đợt xét:', error);
        tableBody.innerHTML = `
            <tr>
                <td colspan="10" class="text-center text-danger py-4">
                    <i class="bi bi-exclamation-triangle-fill me-2"></i>
                    Không thể tải dữ liệu: ${error.message}
                </td>
            </tr>
        `;
    }
}

function renderTable(items) {
    const tableBody = document.getElementById('sessionsTableBody');
    const totalBadge = document.getElementById('totalBadge');
    if (totalBadge) {
        totalBadge.textContent = `Tổng số: ${items.length}`;
    }

    // Cập nhật các chỉ số Bento Stat Cards
    updateBentoStats(sessionsList.length > 0 ? sessionsList : items);

    if (items.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="10" class="text-center text-muted py-5">
                    <i class="bi bi-inbox fs-3 d-block mb-2 text-secondary"></i>
                    Chưa có đợt xét tốt nghiệp nào phù hợp với bộ lọc.
                </td>
            </tr>
        `;
        return;
    }

    const today = new Date().toISOString().split('T')[0];

    tableBody.innerHTML = items.map((item, index) => {
        const sessionCodeBadge = `<span class="session-code-pill">${escapeHtml(item.sessionCode)}</span>`;

        // Tính toán tình trạng hạn nộp với chuẩn status pill của UI/UX Pro Max
        let periodStatus = '<span class="badge-status badge-status-expired"><i class="bi bi-dash-circle me-1"></i>Chưa mở</span>';
        if (item.startDate && item.dueDate) {
            if (today >= item.startDate && today <= item.dueDate) {
                periodStatus = '<span class="badge-status badge-status-active"><span class="status-pulse-dot"></span>Đang mở nộp</span>';
            } else if (today < item.startDate) {
                periodStatus = '<span class="badge-status badge-status-upcoming"><i class="bi bi-clock-history me-1"></i>Sắp diễn ra</span>';
            } else if (today > item.dueDate) {
                periodStatus = '<span class="badge-status badge-status-expired"><i class="bi bi-check2-circle me-1"></i>Đã đóng</span>';
            }
        }

        return `
            <tr>
                <td class="text-center text-muted small fw-medium">${index + 1}</td>
                <td>${sessionCodeBadge}</td>
                <td class="fw-bold text-dark">${escapeHtml(item.sessionName)}</td>
                <td class="text-center"><span class="badge bg-light text-secondary border">${escapeHtml(item.academicYear || '-')}</span></td>
                <td class="text-center"><span class="badge bg-primary-subtle text-primary fw-semibold px-2">HK${item.semester || 1}</span></td>
                <td class="small text-muted font-monospace">${item.startDate || '-'}</td>
                <td class="small text-muted font-monospace">${item.dueDate || '-'}</td>
                <td class="text-center">${periodStatus}</td>
                <td class="small text-muted" style="max-width: 220px;">${item.note ? escapeHtml(item.note) : '-'}</td>
                <td class="text-end">
                    <button class="btn btn-sm btn-outline-primary btn-action-icon me-1 btn-edit" data-id="${item.id}" title="Chỉnh sửa đợt xét">
                        <i class="bi bi-pencil-square"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger btn-action-icon btn-delete" data-id="${item.id}" title="Xóa đợt xét">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join('');

    // GSAP Stagger animation cho các hàng bảng
    if (window.gsap) {
        gsap.from('#sessionsTableBody tr', {
            opacity: 0,
            y: 8,
            duration: 0.25,
            stagger: 0.03,
            ease: 'power1.out'
        });
    }

    tableBody.querySelectorAll('.btn-edit').forEach(btn => {
        btn.addEventListener('click', () => openEditModal(btn.getAttribute('data-id')));
    });

    tableBody.querySelectorAll('.btn-delete').forEach(btn => {
        btn.addEventListener('click', () => handleDeleteSession(btn.getAttribute('data-id')));
    });
}

function updateBentoStats(allSessions) {
    const today = new Date().toISOString().split('T')[0];
    let activeCount = 0;
    let upcomingCount = 0;
    let latestYear = '2026 - 2027';

    allSessions.forEach(item => {
        if (item.academicYear) latestYear = item.academicYear;
        if (item.startDate && item.dueDate) {
            if (today >= item.startDate && today <= item.dueDate) {
                activeCount++;
            } else if (today < item.startDate) {
                upcomingCount++;
            }
        }
    });

    animateCount('statTotalSessions', allSessions.length);
    animateCount('statActiveSessions', activeCount);
    animateCount('statUpcomingSessions', upcomingCount);

    const yearEl = document.getElementById('statCurrentYear');
    if (yearEl) yearEl.textContent = latestYear;
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

function openCreateModal() {
    document.getElementById('sessionModalLabel').innerHTML = `<i class="bi bi-calendar-plus me-2"></i>Tạo đợt xét tốt nghiệp mới`;
    document.getElementById('sessionId').value = '';
    document.getElementById('sessionForm').reset();
    document.getElementById('modalSessionCode').disabled = false;
    document.getElementById('modalStartDate').value = new Date().toISOString().split('T')[0];

    if (sessionModalInstance) {
        sessionModalInstance.show();
    }
}

function openEditModal(id) {
    const item = sessionsList.find(x => x.id === id);
    if (!item) return;

    document.getElementById('sessionModalLabel').innerHTML = `<i class="bi bi-pencil-square me-2"></i>Cập nhật thông tin đợt xét`;
    document.getElementById('sessionId').value = item.id;
    document.getElementById('modalSessionCode').value = item.sessionCode || '';
    document.getElementById('modalSessionCode').disabled = true;
    document.getElementById('modalSessionName').value = item.sessionName || '';
    document.getElementById('modalAcademicYear').value = item.academicYear || '';
    document.getElementById('modalSemester').value = item.semester || 2;
    document.getElementById('modalStartDate').value = item.startDate || '';
    document.getElementById('modalDueDate').value = item.dueDate || '';
    document.getElementById('modalNote').value = item.note || '';

    if (sessionModalInstance) {
        sessionModalInstance.show();
    }
}

async function handleSaveSession(e) {
    e.preventDefault();
    const id = document.getElementById('sessionId').value;
    const isEdit = Boolean(id);

    const payload = {
        sessionCode: document.getElementById('modalSessionCode').value.trim(),
        sessionName: document.getElementById('modalSessionName').value.trim(),
        academicYear: document.getElementById('modalAcademicYear').value.trim() || null,
        semester: parseInt(document.getElementById('modalSemester').value, 10),
        startDate: document.getElementById('modalStartDate').value || null,
        dueDate: document.getElementById('modalDueDate').value || null,
        note: document.getElementById('modalNote').value.trim() || null
    };

    const submitBtn = document.getElementById('btnSaveSession');
    submitBtn.disabled = true;

    try {
        const url = isEdit
            ? `${API_ENDPOINTS.GRADUATION_SESSIONS}/${id}`
            : API_ENDPOINTS.GRADUATION_SESSIONS;
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

        if (sessionModalInstance) {
            sessionModalInstance.hide();
        }

        showAlert('success', isEdit ? 'Cập nhật đợt xét thành công!' : 'Đã tạo đợt xét tốt nghiệp mới thành công!');
        loadSessions();
    } catch (error) {
        alert(`Lỗi khi lưu đợt xét: ${error.message}`);
    } finally {
        submitBtn.disabled = false;
    }
}

async function handleDeleteSession(id) {
    if (!confirm('Bạn có chắc chắn muốn xóa đợt xét tốt nghiệp này?')) {
        return;
    }

    try {
        const response = await fetch(`${API_ENDPOINTS.GRADUATION_SESSIONS}/${id}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            throw new Error(`Lỗi máy chủ (${response.status})`);
        }

        showAlert('success', 'Đã xóa đợt xét thành công!');
        loadSessions();
    } catch (error) {
        alert(`Không thể xóa: ${error.message}`);
    }
}

async function handleAutoGenerateSessions(e) {
    e.preventDefault();
    const selectYear = document.getElementById('autoAcademicYear');
    const academicYear = selectYear ? selectYear.value : '2026-2027';
    const submitBtn = document.getElementById('btnExecuteAuto');
    if (submitBtn) submitBtn.disabled = true;

    try {
        const response = await fetch(`${API_ENDPOINTS.GRADUATION_SESSIONS}/auto-generate?academicYear=${encodeURIComponent(academicYear)}`, {
            method: 'POST'
        });

        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error(err.message || err.error || `Lỗi máy chủ (${response.status})`);
        }

        const createdList = await response.json();

        if (autoModalInstance) {
            autoModalInstance.hide();
        }

        if (createdList && createdList.length > 0) {
            showAlert('success', `Đã khởi tạo thành công ${createdList.length} đợt xét mới cho năm học ${academicYear}!`);
        } else {
            showAlert('info', `Các đợt xét chuẩn cho năm học ${academicYear} đã tồn tại từ trước (không tạo trùng).`);
        }

        loadSessions();
    } catch (error) {
        alert(`Lỗi khi tự động khởi tạo: ${error.message}`);
    } finally {
        if (submitBtn) submitBtn.disabled = false;
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
