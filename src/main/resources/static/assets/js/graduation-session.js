import { API_ENDPOINTS } from './config.js';

let sessionsList = [];
let sessionModalInstance = null;
let autoModalInstance = null;
let viewMode = 'cards'; // 'cards' | 'table'
let currentCalDate = new Date();

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
        gsap.from('.edu-side-panel > *', {
            opacity: 0,
            x: 25,
            duration: 0.6,
            stagger: 0.15,
            delay: 0.25,
            ease: 'power2.out'
        });
    }
});

function initEventListeners() {
    // Dropdown filters (Wireframe: [Học kỳ ▼] [Niên khóa ▼] [Trạng thái ▼])
    const filterSemester = document.getElementById('filterSemester');
    const filterYear = document.getElementById('filterYear');
    const filterStatusSelect = document.getElementById('filterStatusSelect');

    if (filterSemester) {
        filterSemester.addEventListener('change', () => applyClientFilters());
    }
    if (filterYear) {
        filterYear.addEventListener('change', () => applyClientFilters());
    }
    if (filterStatusSelect) {
        filterStatusSelect.addEventListener('change', () => applyClientFilters());
    }

    // Search
    const btnSearch = document.getElementById('btnSearch');
    const searchKeyword = document.getElementById('searchKeyword');

    if (btnSearch) {
        btnSearch.addEventListener('click', () => {
            applyClientFilters();
        });
    }

    if (searchKeyword) {
        searchKeyword.addEventListener('keyup', (e) => {
            if (e.key === 'Enter') {
                applyClientFilters();
            }
        });
    }

    // Refresh
    const btnRefresh = document.getElementById('btnRefresh');
    if (btnRefresh) {
        btnRefresh.addEventListener('click', () => {
            if (searchKeyword) searchKeyword.value = '';
            if (filterSemester) filterSemester.value = '';
            if (filterYear) filterYear.value = '';
            if (filterStatusSelect) filterStatusSelect.value = '';
            loadSessions();
        });
    }

    // View Mode Toggle (Wireframe: [ 🔄 Chuyển sang xem dạng Bảng chi tiết ])
    const btnToggleView = document.getElementById('btnToggleView');
    if (btnToggleView) {
        btnToggleView.addEventListener('click', toggleViewMode);
    }

    // Header Search Toggle shortcut
    const btnHeaderSearchToggle = document.getElementById('btnHeaderSearchToggle');
    if (btnHeaderSearchToggle && searchKeyword) {
        btnHeaderSearchToggle.addEventListener('click', () => {
            searchKeyword.focus();
        });
    }

    // Header Bell Notification
    const btnNotificationBell = document.getElementById('btnNotificationBell');
    if (btnNotificationBell) {
        btnNotificationBell.addEventListener('click', () => {
            const activeCount = sessionsList.filter(s => isSessionActive(s)).length;
            showAlert('info', `Hệ thống có ${activeCount} đợt xét tốt nghiệp đang tiếp nhận hồ sơ.`);
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
    const cardContainer = document.getElementById('sessionsCardContainer');
    const tableBody = document.getElementById('sessionsTableBody');

    if (cardContainer) {
        cardContainer.innerHTML = `
            <div class="text-center text-muted py-5 card p-4">
                <div class="spinner-border spinner-border-sm text-primary me-2"></div>
                Đang tải danh sách đợt xét tốt nghiệp...
            </div>
        `;
    }

    if (tableBody) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="10" class="text-center text-muted py-5">
                    <div class="spinner-border spinner-border-sm text-primary me-2"></div>
                    Đang tải danh sách đợt xét tốt nghiệp...
                </td>
            </tr>
        `;
    }

    try {
        let url = API_ENDPOINTS.GRADUATION_SESSIONS;
        if (keyword) {
            url += `/search?keyword=${encodeURIComponent(keyword)}`;
        }

        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Lỗi tải dữ liệu (${response.status})`);
        }

        sessionsList = await response.json();
        applyClientFilters();
        renderMiniCalendar();
    } catch (error) {
        console.error('Lỗi khi tải đợt xét:', error);
        if (cardContainer) {
            cardContainer.innerHTML = `
                <div class="alert alert-danger p-4">
                    <i class="bi bi-exclamation-triangle-fill me-2"></i>
                    Không thể tải dữ liệu: ${error.message}
                </div>
            `;
        }
        if (tableBody) {
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
}

function applyClientFilters() {
    const keyword = document.getElementById('searchKeyword')?.value.trim().toLowerCase() || '';
    const semester = document.getElementById('filterSemester')?.value || '';
    const year = document.getElementById('filterYear')?.value || '';
    const status = document.getElementById('filterStatusSelect')?.value || '';

    const today = new Date().toISOString().split('T')[0];

    let filtered = sessionsList.filter(item => {
        // Keyword
        if (keyword) {
            const code = (item.sessionCode || '').toLowerCase();
            const name = (item.sessionName || '').toLowerCase();
            const note = (item.note || '').toLowerCase();
            if (!code.includes(keyword) && !name.includes(keyword) && !note.includes(keyword)) {
                return false;
            }
        }

        // Semester
        if (semester && String(item.semester) !== String(semester)) {
            return false;
        }

        // Academic Year
        if (year && (item.academicYear || '') !== year) {
            return false;
        }

        // Status
        if (status) {
            const sDate = item.startDate ? String(item.startDate).substring(0, 10) : '';
            const dDate = item.dueDate ? String(item.dueDate).substring(0, 10) : '';

            if (status === 'active') {
                if (!(sDate && dDate && today >= sDate && today <= dDate)) return false;
            } else if (status === 'upcoming') {
                if (!(sDate && today < sDate)) return false;
            } else if (status === 'expired') {
                if (!(dDate && today > dDate)) return false;
            }
        }

        return true;
    });

    updateBentoStats(sessionsList);
    renderCards(filtered);
    renderTable(filtered);
}

function toggleViewMode() {
    const cardContainer = document.getElementById('sessionsCardContainer');
    const tableContainer = document.getElementById('sessionsTableContainer');
    const btn = document.getElementById('btnToggleView');

    if (viewMode === 'cards') {
        viewMode = 'table';
        if (cardContainer) cardContainer.style.display = 'none';
        if (tableContainer) tableContainer.style.display = '';
        if (btn) {
            btn.innerHTML = `<i class="bi bi-grid me-1"></i>Xem dạng Thẻ trực quan`;
        }
    } else {
        viewMode = 'cards';
        if (cardContainer) cardContainer.style.display = '';
        if (tableContainer) tableContainer.style.display = 'none';
        if (btn) {
            btn.innerHTML = `<i class="bi bi-table me-1"></i>Xem dạng Bảng chi tiết`;
        }
    }
}

// ==========================================================================
// 🎴 RENDER CARDS VIEW (Pastel Cards Matching ASCII Wireframe & eCoursie)
// ==========================================================================

function renderCards(items) {
    const container = document.getElementById('sessionsCardContainer');
    if (!container) return;

    if (items.length === 0) {
        container.innerHTML = `
            <div class="card p-5 text-center text-muted">
                <i class="bi bi-inbox fs-1 d-block mb-3 text-secondary"></i>
                <h5 class="fw-bold">Chưa có đợt xét tốt nghiệp nào phù hợp</h5>
                <p class="small mb-3">Thử thay đổi bộ lọc hoặc bấm "Tự động tạo đợt" để khởi tạo niên giám mới.</p>
                <div class="d-flex justify-content-center gap-2">
                    <button class="btn btn-outline-primary btn-sm" onclick="document.getElementById('btnRefresh').click()">
                        <i class="bi bi-arrow-clockwise me-1"></i>Xóa bộ lọc
                    </button>
                    <button class="btn btn-primary btn-sm" onclick="document.getElementById('btnOpenCreateModal').click()">
                        <i class="bi bi-plus-circle me-1"></i>Tạo đợt xét mới
                    </button>
                </div>
            </div>
        `;
        return;
    }

    const today = new Date().toISOString().split('T')[0];

    const cardThemes = [
        { theme: 'card-pastel-blue', icon: 'bi-laptop' },
        { theme: 'card-pastel-lavender', icon: 'bi-mortarboard-fill' },
        { theme: 'card-pastel-peach', icon: 'bi-trophy-fill' },
        { theme: 'card-pastel-mint', icon: 'bi-calendar2-check-fill' }
    ];

    container.innerHTML = items.map((item, index) => {
        const themeObj = cardThemes[index % cardThemes.length];
        const sDate = item.startDate ? String(item.startDate).substring(0, 10) : '';
        const dDate = item.dueDate ? String(item.dueDate).substring(0, 10) : '';

        // Status Badge
        let statusBadge = '<span class="badge-status badge-status-expired"><i class="bi bi-dash-circle me-1"></i>Chưa mở</span>';
        if (sDate && dDate) {
            if (today >= sDate && today <= dDate) {
                statusBadge = '<span class="badge-status badge-status-active"><span class="status-pulse-dot"></span>Đang mở nhận hồ sơ</span>';
            } else if (today < sDate) {
                statusBadge = '<span class="badge-status badge-status-upcoming"><i class="bi bi-clock-history me-1"></i>Sắp diễn ra</span>';
            } else if (today > dDate) {
                statusBadge = '<span class="badge-status badge-status-expired"><i class="bi bi-check2-circle me-1"></i>Đã đóng</span>';
            }
        }

        const dateRange = (sDate && dDate)
            ? `${formatDateDisplay(sDate)} — ${formatDateDisplay(dDate)}`
            : 'Chưa thiết lập ngày';

        const semesterName = item.semester === 1 ? 'Học kỳ I' : (item.semester === 2 ? 'Học kỳ II' : 'Học kỳ hè');

        return `
            <div class="edu-session-card ${themeObj.theme}" data-id="${item.id}">
                <!-- Illustration Box (Left) -->
                <div class="card-illustration">
                    <i class="bi ${themeObj.icon}"></i>
                </div>

                <!-- Session Content (Middle) -->
                <div class="card-session-content">
                    <div class="d-flex align-items-center gap-2 mb-1">
                        <span class="session-code-pill">${escapeHtml(item.sessionCode)}</span>
                        <span class="badge bg-light text-primary border">${escapeHtml(item.academicYear || '2026-2027')}</span>
                        <span class="badge bg-primary-subtle text-primary fw-semibold">${semesterName}</span>
                    </div>

                    <div class="card-session-title">
                        ${escapeHtml(item.sessionName)}
                    </div>

                    <div class="card-session-meta">
                        <div>
                            <i class="bi bi-clock-history me-1 text-primary"></i>
                            <strong>Thời gian:</strong> ${dateRange}
                        </div>
                        <div>${statusBadge}</div>
                    </div>

                    <div class="card-session-note">
                        <i class="bi bi-chat-square-text me-1 text-muted"></i>
                        ${item.note ? escapeHtml(item.note) : 'Chưa có ghi chú hướng dẫn thêm cho đợt xét này.'}
                    </div>
                </div>

                <!-- Action Buttons (Right) -->
                <div class="card-session-actions">
                    <button class="card-action-mini btn-edit" data-id="${item.id}" title="Chỉnh sửa đợt xét">
                        <i class="bi bi-pencil-square"></i>
                    </button>
                    <button class="card-action-mini btn-del btn-delete" data-id="${item.id}" title="Xóa đợt xét">
                        <i class="bi bi-trash"></i>
                    </button>
                    <!-- Circular Purple CTA (>) - Wireframe signature -->
                    <button class="btn-circle-cta btn-view-cta" data-id="${item.id}" title="Xem & Chỉnh sửa chi tiết">
                        <i class="bi bi-chevron-right"></i>
                    </button>
                </div>
            </div>
        `;
    }).join('');

    // GSAP entrance animation for cards
    if (window.gsap) {
        gsap.from('.edu-session-card', {
            opacity: 0,
            y: 12,
            duration: 0.3,
            stagger: 0.05,
            ease: 'power2.out'
        });
    }

    // Attach listeners
    container.querySelectorAll('.btn-edit, .btn-view-cta').forEach(btn => {
        btn.addEventListener('click', () => openEditModal(btn.getAttribute('data-id')));
    });

    container.querySelectorAll('.btn-delete').forEach(btn => {
        btn.addEventListener('click', () => handleDeleteSession(btn.getAttribute('data-id')));
    });
}

// ==========================================================================
// 📋 RENDER TABLE VIEW (Enterprise Grid)
// ==========================================================================

function renderTable(items) {
    const tableBody = document.getElementById('sessionsTableBody');
    const totalBadge = document.getElementById('totalBadge');
    if (totalBadge) {
        totalBadge.innerHTML = `<span class="status-pulse-dot"></span>Tổng số: ${items.length} đợt xét`;
    }

    if (!tableBody) return;

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
        const sDate = item.startDate ? String(item.startDate).substring(0, 10) : '';
        const dDate = item.dueDate ? String(item.dueDate).substring(0, 10) : '';

        let periodStatus = '<span class="badge-status badge-status-expired"><i class="bi bi-dash-circle me-1"></i>Chưa mở</span>';
        if (sDate && dDate) {
            if (today >= sDate && today <= dDate) {
                periodStatus = '<span class="badge-status badge-status-active"><span class="status-pulse-dot"></span>Đang mở nộp</span>';
            } else if (today < sDate) {
                periodStatus = '<span class="badge-status badge-status-upcoming"><i class="bi bi-clock-history me-1"></i>Sắp diễn ra</span>';
            } else if (today > dDate) {
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
                <td class="small text-muted font-monospace">${sDate || '-'}</td>
                <td class="small text-muted font-monospace">${dDate || '-'}</td>
                <td class="text-center">${periodStatus}</td>
                <td class="small text-muted" style="max-width: 220px;">${item.note ? escapeHtml(item.note) : '-'}</td>
                <td class="text-end">
                    <button class="btn btn-sm btn-outline-primary btn-action-icon me-1 btn-edit-table" data-id="${item.id}" title="Chỉnh sửa đợt xét">
                        <i class="bi bi-pencil-square"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger btn-action-icon btn-delete-table" data-id="${item.id}" title="Xóa đợt xét">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join('');

    tableBody.querySelectorAll('.btn-edit-table').forEach(btn => {
        btn.addEventListener('click', () => openEditModal(btn.getAttribute('data-id')));
    });

    tableBody.querySelectorAll('.btn-delete-table').forEach(btn => {
        btn.addEventListener('click', () => handleDeleteSession(btn.getAttribute('data-id')));
    });
}

function isSessionActive(item) {
    const today = new Date().toISOString().split('T')[0];
    const sDate = item.startDate ? String(item.startDate).substring(0, 10) : '';
    const dDate = item.dueDate ? String(item.dueDate).substring(0, 10) : '';
    return Boolean(sDate && dDate && today >= sDate && today <= dDate);
}

function updateBentoStats(allSessions) {
    const today = new Date().toISOString().split('T')[0];
    let activeCount = 0;
    let upcomingCount = 0;
    let latestYear = '2026 - 2027';

    allSessions.forEach(item => {
        if (item.academicYear) latestYear = item.academicYear;
        const sDate = item.startDate ? String(item.startDate).substring(0, 10) : '';
        const dDate = item.dueDate ? String(item.dueDate).substring(0, 10) : '';
        if (sDate && dDate) {
            if (today >= sDate && today <= dDate) {
                activeCount++;
            } else if (today < sDate) {
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
    document.getElementById('modalStartDate').value = item.startDate ? String(item.startDate).substring(0, 10) : '';
    document.getElementById('modalDueDate').value = item.dueDate ? String(item.dueDate).substring(0, 10) : '';
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

function formatDateDisplay(isoDate) {
    if (!isoDate) return '';
    const parts = isoDate.split('-');
    if (parts.length === 3) {
        return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return isoDate;
}

// ==========================================================================
// 📅 MINI CALENDAR (Highlights Graduation Deadlines - ASCII Wireframe)
// ==========================================================================

function renderMiniCalendar() {
    const container = document.getElementById('miniCalendar');
    if (!container) return;

    const year = currentCalDate.getFullYear();
    const month = currentCalDate.getMonth();
    const today = new Date();

    const monthNames = ['Th1', 'Th2', 'Th3', 'Th4', 'Th5', 'Th6',
                        'Th7', 'Th8', 'Th9', 'Th10', 'Th11', 'Th12'];
    const dayNames = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

    // Map deadline days in this month from sessionsList
    const deadlineDays = new Set();
    sessionsList.forEach(item => {
        if (item.dueDate) {
            const dStr = String(item.dueDate).substring(0, 10);
            const dObj = new Date(dStr);
            if (dObj.getFullYear() === year && dObj.getMonth() === month) {
                deadlineDays.add(dObj.getDate());
            }
        }
    });

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const startOffset = (firstDay === 0) ? 6 : firstDay - 1; // Monday start

    let daysHTML = '';
    for (let i = 0; i < startOffset; i++) {
        daysHTML += '<span class="cal-day empty"></span>';
    }
    for (let d = 1; d <= daysInMonth; d++) {
        const isToday = (d === today.getDate() && month === today.getMonth() && year === today.getFullYear()) ? ' today' : '';
        const isDeadline = deadlineDays.has(d) ? ' has-deadline' : '';
        const titleAttr = isDeadline ? ' title="Hạn chót nộp hồ sơ đợt xét tốt nghiệp"' : '';
        daysHTML += `<span class="cal-day${isToday}${isDeadline}"${titleAttr}>${d}</span>`;
    }

    container.innerHTML = `
        <div class="cal-header">
            <h6 class="mb-0 fw-bold">${monthNames[month]} ${year}</h6>
            <div class="cal-nav">
                <button type="button" id="calPrevBtn" title="Tháng trước"><i class="bi bi-chevron-left"></i></button>
                <button type="button" id="calNextBtn" title="Tháng sau"><i class="bi bi-chevron-right"></i></button>
            </div>
        </div>
        <div class="cal-weekdays">
            ${dayNames.map(d => `<span>${d}</span>`).join('')}
        </div>
        <div class="cal-days">
            ${daysHTML}
        </div>
    `;

    const prevBtn = container.querySelector('#calPrevBtn');
    const nextBtn = container.querySelector('#calNextBtn');
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            currentCalDate.setMonth(currentCalDate.getMonth() - 1);
            renderMiniCalendar();
        });
    }
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            currentCalDate.setMonth(currentCalDate.getMonth() + 1);
            renderMiniCalendar();
        });
    }
}
