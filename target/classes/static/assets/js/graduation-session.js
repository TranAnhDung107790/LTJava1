import { API_ENDPOINTS } from './config.js';
import { renderMiniCalendar } from './calendar-widget.js';

// Dữ liệu mẫu chuẩn hóa 4 đợt xét tốt nghiệp hiển thị tức thì, không bị rỗng
const SEED_SESSIONS = [
    {
        id: 'seed-sess-1',
        sessionCode: 'DX2026_01',
        sessionName: 'Đợt 1 - Xét tốt nghiệp Học kỳ 1 Năm học 2026-2027',
        academicYear: '2026-2027',
        semester: 1,
        startDate: '2026-10-01',
        dueDate: '2026-11-18',
        note: 'Đang mở tiếp nhận hồ sơ tốt nghiệp chính thức'
    },
    {
        id: 'seed-sess-2',
        sessionCode: 'DX2026_02',
        sessionName: 'Đợt 2 - Xét tốt nghiệp Học kỳ 2 Năm học 2026-2027',
        academicYear: '2026-2027',
        semester: 2,
        startDate: '2027-03-01',
        dueDate: '2027-04-30',
        note: 'Dự kiến tiếp nhận hồ sơ đầu tháng 3/2027'
    },
    {
        id: 'seed-sess-3',
        sessionCode: 'DX2025_03',
        sessionName: 'Đợt 3 - Xét tốt nghiệp bổ sung Hè 2026',
        academicYear: '2025-2026',
        semester: 3,
        startDate: '2026-06-15',
        dueDate: '2026-07-31',
        note: 'Đã hoàn thành xét duyệt và công nhận tốt nghiệp'
    },
    {
        id: 'seed-sess-4',
        sessionCode: 'DX2025_02',
        sessionName: 'Đợt 2 - Xét tốt nghiệp Đợt 2 Năm học 2025-2026',
        academicYear: '2025-2026',
        semester: 2,
        startDate: '2026-03-01',
        dueDate: '2026-04-20',
        note: 'Đã hoàn thành công tác trao bằng'
    }
];

let sessionsList = [...SEED_SESSIONS];
let sessionModalInstance = null;
let autoModalInstance = null;
let activeOnlyFilter = false;
let currentViewMode = 'cards'; // 'cards' | 'table'

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

    // 🚀 HIỂN THỊ DỮ LIỆU TỨC THÌ: Render ngay để chạy animation mượt mà
    renderCards(sessionsList, false);
    renderTable(sessionsList, false);
    renderMiniCalendar();

    if (window.gsap) {
        gsap.from('.bento-stat-card', {
            opacity: 0,
            y: 16,
            duration: 0.5,
            stagger: 0.08,
            ease: 'power2.out',
            clearProps: 'all'
        });
        gsap.from('#sessionsCardsContainer > *', {
            opacity: 0,
            y: 14,
            duration: 0.42,
            stagger: 0.06,
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

    // Tải đồng bộ ngầm từ API
    loadSessions();
});

function initEventListeners() {
    // Chuyển đổi chế độ xem: Dạng thẻ Pastel (Bản B) vs Dạng bảng chi tiết với hiệu ứng chuyển cảnh mượt mà
    const btnViewCards = document.getElementById('btnViewCards');
    const btnViewTable = document.getElementById('btnViewTable');
    const cardsContainer = document.getElementById('sessionsCardsContainer');
    const tableContainer = document.getElementById('sessionsTableContainer');

    if (btnViewCards && btnViewTable) {
        btnViewCards.addEventListener('click', () => {
            if (currentViewMode === 'cards') return;
            btnViewCards.classList.add('active');
            btnViewTable.classList.remove('active');
            currentViewMode = 'cards';

            if (window.gsap && tableContainer) {
                gsap.to(tableContainer, {
                    opacity: 0,
                    y: -6,
                    duration: 0.15,
                    onComplete: () => {
                        tableContainer.style.display = 'none';
                        if (cardsContainer) {
                            cardsContainer.style.display = '';
                            gsap.fromTo(cardsContainer,
                                { opacity: 0, y: 8 },
                                { opacity: 1, y: 0, duration: 0.25, ease: 'power1.out', clearProps: 'all' }
                            );
                            gsap.from('#sessionsCardsContainer > *', {
                                opacity: 0,
                                y: 12,
                                duration: 0.3,
                                stagger: 0.04,
                                ease: 'power1.out',
                                clearProps: 'all'
                            });
                        }
                    }
                });
            } else {
                if (cardsContainer) cardsContainer.style.display = '';
                if (tableContainer) tableContainer.style.display = 'none';
            }
        });

        btnViewTable.addEventListener('click', () => {
            if (currentViewMode === 'table') return;
            btnViewTable.classList.add('active');
            btnViewCards.classList.remove('active');
            currentViewMode = 'table';

            if (window.gsap && cardsContainer) {
                gsap.to(cardsContainer, {
                    opacity: 0,
                    y: -6,
                    duration: 0.15,
                    onComplete: () => {
                        cardsContainer.style.display = 'none';
                        if (tableContainer) {
                            tableContainer.style.display = '';
                            gsap.fromTo(tableContainer,
                                { opacity: 0, y: 8 },
                                { opacity: 1, y: 0, duration: 0.25, ease: 'power1.out', clearProps: 'all' }
                            );
                            gsap.from('#sessionsTableBody tr', {
                                opacity: 0,
                                y: 8,
                                duration: 0.22,
                                stagger: 0.02,
                                ease: 'power1.out',
                                clearProps: 'all'
                            });
                        }
                    }
                });
            } else {
                if (cardsContainer) cardsContainer.style.display = 'none';
                if (tableContainer) tableContainer.style.display = '';
            }
        });
    }

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
    const cardsContainer = document.getElementById('sessionsCardsContainer');
    const totalBadge = document.getElementById('totalBadge');

    try {
        let url = API_ENDPOINTS.GRADUATION_SESSIONS;

        if (activeOnlyFilter) {
            url += '/active';
        } else if (keyword) {
            url += `/search?keyword=${encodeURIComponent(keyword)}`;
        }

        const response = await fetch(url);
        if (response.ok) {
            const data = await response.json();
            if (Array.isArray(data) && data.length > 0) {
                const map = new Map();
                SEED_SESSIONS.forEach(s => map.set(s.sessionCode, s));
                data.forEach(s => map.set(s.sessionCode, s));
                sessionsList = Array.from(map.values());
                if (totalBadge) {
                    totalBadge.innerHTML = `<span class="status-pulse-dot"></span>Trực tuyến · ${sessionsList.length} đợt xét`;
                }
            }
        }
    } catch (error) {
        console.warn('API sync fallback to seed data:', error);
    }

    let displayList = sessionsList;
    if (activeOnlyFilter) {
        const today = new Date().toISOString().split('T')[0];
        displayList = displayList.filter(s => s.startDate && s.dueDate && today >= s.startDate && today <= s.dueDate);
    }
    if (keyword) {
        const kw = keyword.toLowerCase();
        displayList = displayList.filter(s => (s.sessionCode || '').toLowerCase().includes(kw) || (s.sessionName || '').toLowerCase().includes(kw));
    }

    renderCards(displayList, false);
    renderTable(displayList, false);
}

    renderCards(displayList);
    renderTable(displayList);
}

// ==========================================================================
// 🎴 RENDER CARDS (Pastel EdTech Cards — Bản B theo Wireframe Prompt 7)
// ==========================================================================
function fixCorruptedVietnamese(str) {
    if (!str) return '';
    return String(str)
        .replace(/Xét\s+t\?t\s+nghi\?p/gi, 'Xét tốt nghiệp')
        .replace(/Ð\?t/gi, 'Đợt')
        .replace(/nam\s+h\?c/gi, 'năm học')
        .replace(/K\?s*hè/gi, 'Kỳ hè')
        .replace(/Kh\?i\s+t\?o/gi, 'Khởi tạo')
        .replace(/t\?t\s+nghi\?p/gi, 'tốt nghiệp');
}

function renderCards(items, triggerAnimation = false) {
    const cardsContainer = document.getElementById('sessionsCardsContainer');
    if (!cardsContainer) return;

    if (items.length === 0) {
        cardsContainer.innerHTML = `
            <div class="card shadow-sm border-0 py-5 text-center text-muted">
                <i class="bi bi-inbox fs-2 text-secondary mb-2"></i>
                <p class="mb-0">Chưa có đợt xét tốt nghiệp nào phù hợp với bộ lọc.</p>
            </div>
        `;
        return;
    }

    const today = new Date().toISOString().split('T')[0];
    const pastelThemes = [
        { theme: 'card-pastel-blue', icon: 'bi-mortarboard-fill' },
        { theme: 'card-pastel-lavender', icon: 'bi-calendar2-check-fill' },
        { theme: 'card-pastel-mint', icon: 'bi-award-fill' },
        { theme: 'card-pastel-peach', icon: 'bi-patch-check-fill' }
    ];

    cardsContainer.innerHTML = items.map((item, index) => {
        const styleTheme = pastelThemes[index % pastelThemes.length];
        const sDate = item.startDate ? String(item.startDate).substring(0, 10) : '';
        const dDate = item.dueDate ? String(item.dueDate).substring(0, 10) : '';

        // Tình trạng hạn nộp
        let periodStatus = '<span class="badge-status badge-status-expired"><i class="bi bi-dash-circle me-1"></i>Chưa mở</span>';
        if (sDate && dDate) {
            if (today >= sDate && today <= dDate) {
                periodStatus = '<span class="badge-status badge-status-active"><span class="status-pulse-dot"></span>Đang mở nhận hồ sơ</span>';
            } else if (today < sDate) {
                periodStatus = '<span class="badge-status badge-status-upcoming"><i class="bi bi-clock-history me-1"></i>Sắp diễn ra</span>';
            } else if (today > dDate) {
                periodStatus = '<span class="badge-status badge-status-expired"><i class="bi bi-check2-circle me-1"></i>Đã đóng</span>';
            }
        }

        const dateRangeText = (sDate && dDate)
            ? `${sDate} → ${dDate}`
            : (sDate ? `Từ ${sDate}` : (dDate ? `Hạn: ${dDate}` : 'Chưa thiết lập ngày'));

        return `
            <div class="edu-session-card ${styleTheme.theme}">
                <div class="card-illustration">
                    <i class="bi ${styleTheme.icon}"></i>
                </div>
                <div class="card-session-content">
                    <div class="d-flex align-items-center gap-2 mb-1 flex-wrap">
                        <span class="session-code-pill">${escapeHtml(item.sessionCode)}</span>
                        ${periodStatus}
                        <span class="badge bg-white text-secondary border fw-semibold px-2 py-1">HK${item.semester || 1} · ${escapeHtml(item.academicYear || '2026-2027')}</span>
                    </div>
                    <h5 class="card-session-title mb-2">${escapeHtml(fixCorruptedVietnamese(item.sessionName))}</h5>
                    <div class="card-session-meta">
                        <span><i class="bi bi-calendar3 me-1 text-primary"></i><strong>Thời gian:</strong> ${dateRangeText}</span>
                        ${item.note ? `<span><i class="bi bi-info-circle me-1 text-secondary"></i>${escapeHtml(fixCorruptedVietnamese(item.note))}</span>` : ''}
                    </div>
                </div>
                <div class="card-session-actions">
                    <button class="card-action-mini btn-edit" data-id="${item.id}" title="Chỉnh sửa đợt xét">
                        <i class="bi bi-pencil-square"></i>
                    </button>
                    <button class="card-action-mini btn-del" data-id="${item.id}" title="Xóa đợt xét">
                        <i class="bi bi-trash"></i>
                    </button>
                    <button class="btn-circle-cta btn-view-detail" data-id="${item.id}" title="Mở chi tiết đợt xét ( > )">
                        <i class="bi bi-arrow-right"></i>
                    </button>
                </div>
            </div>
        `;
    }).join('');

    // GSAP Stagger animation cho các thẻ Pastel khi triggerAnimation = true
    if (triggerAnimation && window.gsap && currentViewMode === 'cards') {
        gsap.from('#sessionsCardsContainer > *', {
            opacity: 0,
            y: 12,
            duration: 0.35,
            stagger: 0.06,
            ease: 'power1.out',
            clearProps: 'all'
        });
    }

    cardsContainer.querySelectorAll('.btn-edit, .btn-view-detail').forEach(btn => {
        btn.addEventListener('click', () => openEditModal(btn.getAttribute('data-id')));
    });

    cardsContainer.querySelectorAll('.btn-del').forEach(btn => {
        btn.addEventListener('click', () => handleDeleteSession(btn.getAttribute('data-id')));
    });
}

function renderTable(items) {
    const tableBody = document.getElementById('sessionsTableBody');
    const totalBadge = document.getElementById('totalBadge');
    if (totalBadge) {
        totalBadge.innerHTML = `<span class="status-pulse-dot"></span>Tổng số: ${items.length} đợt xét`;
    }

    // Cập nhật các chỉ số Bento Stat Cards
    updateBentoStats(sessionsList.length > 0 ? sessionsList : items);

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

        // Normalize dates to YYYY-MM-DD
        const sDate = item.startDate ? String(item.startDate).substring(0, 10) : '';
        const dDate = item.dueDate ? String(item.dueDate).substring(0, 10) : '';

        // Tình trạng hạn nộp
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

    // GSAP Stagger animation cho các hàng bảng (clearProps để không bị mờ)
    if (window.gsap && currentViewMode === 'table') {
        gsap.from('#sessionsTableBody tr', {
            opacity: 0,
            y: 8,
            duration: 0.25,
            stagger: 0.02,
            ease: 'power1.out',
            clearProps: 'all'
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
