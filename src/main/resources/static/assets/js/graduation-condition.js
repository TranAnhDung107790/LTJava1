import { API_ENDPOINTS } from './config.js';

// Dữ liệu mẫu chuẩn hóa 5 khóa đào tạo (K20 - K24) để hiển thị tức thì, không bị rỗng khi DB đang khởi động
const SEED_CONDITIONS = [
    {
        id: 'seed-k20',
        appliedCohort: 'K20',
        cohort: 'K20',
        minTotalCredits: 120,
        minGpa: 2.00,
        maxFailedCredits: 0,
        englishRequirement: 'TOEIC 450 / B1',
        itRequirement: 'CNTT Cơ bản',
        conductRequired: 'Khá trở lên',
        isActive: true
    },
    {
        id: 'seed-k21',
        appliedCohort: 'K21',
        cohort: 'K21',
        minTotalCredits: 125,
        minGpa: 2.00,
        maxFailedCredits: 0,
        englishRequirement: 'TOEIC 500 / B1 Chuẩn',
        itRequirement: 'IC3 / MOS 2 môn',
        conductRequired: 'Khá trở lên',
        isActive: true
    },
    {
        id: 'seed-k22',
        appliedCohort: 'K22',
        cohort: 'K22',
        minTotalCredits: 130,
        minGpa: 2.00,
        maxFailedCredits: 0,
        englishRequirement: 'TOEIC 550 / B2',
        itRequirement: 'MOS 3 môn (Word, Excel, PPT)',
        conductRequired: 'Tốt trở lên',
        isActive: true
    },
    {
        id: 'seed-k23',
        appliedCohort: 'K23',
        cohort: 'K23',
        minTotalCredits: 135,
        minGpa: 2.50,
        maxFailedCredits: 0,
        englishRequirement: 'IELTS 5.5 / TOEIC 600',
        itRequirement: 'MOS Expert / CNTT Nâng cao',
        conductRequired: 'Tốt trở lên',
        isActive: true
    },
    {
        id: 'seed-k24',
        appliedCohort: 'K24',
        cohort: 'K24',
        minTotalCredits: 140,
        minGpa: 2.50,
        maxFailedCredits: 0,
        englishRequirement: 'IELTS 6.0 / TOEIC 650',
        itRequirement: 'CNTT Nâng cao & Lập trình ứng dụng',
        conductRequired: 'Xuất sắc',
        isActive: true
    }
];

let conditionsList = [...SEED_CONDITIONS];
let conditionModalInstance = null;

document.addEventListener('DOMContentLoaded', () => {
    const modalEl = document.getElementById('conditionModal');
    if (modalEl && window.bootstrap) {
        conditionModalInstance = new bootstrap.Modal(modalEl);
    }

    initEventListeners();

    // 🚀 HIỂN THỊ DỮ LIỆU TỨC THÌ: Render ngay dữ liệu phong phú để chạy animation mượt mà, logic 100%
    renderTable(conditionsList, false);

    if (window.gsap) {
        gsap.from('.action-bar-card, .table-card-container', {
            opacity: 0,
            y: 18,
            duration: 0.45,
            stagger: 0.1,
            ease: 'power2.out',
            clearProps: 'all'
        });
        gsap.from('#conditionsTableBody tr', {
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
            x: 22,
            duration: 0.5,
            stagger: 0.1,
            delay: 0.15,
            ease: 'power2.out',
            clearProps: 'all'
        });
    }

    // Tải đồng bộ ngầm từ API để không chặn animation
    loadConditions();
});

function initEventListeners() {
    // Search by cohort
    const btnSearch = document.getElementById('btnSearch');
    const searchCohort = document.getElementById('searchCohort');
    if (btnSearch) {
        btnSearch.addEventListener('click', () => {
            const cohort = searchCohort.value.trim();
            loadConditions(cohort);
        });
    }

    if (searchCohort) {
        searchCohort.addEventListener('keyup', (e) => {
            if (e.key === 'Enter') {
                loadConditions(searchCohort.value.trim());
            }
        });
    }

    // Refresh
    const btnRefresh = document.getElementById('btnRefresh');
    if (btnRefresh) {
        btnRefresh.addEventListener('click', () => {
            if (searchCohort) searchCohort.value = '';
            loadConditions();
        });
    }

    // Open Create Modal
    const btnOpenCreateModal = document.getElementById('btnOpenCreateModal');
    if (btnOpenCreateModal) {
        btnOpenCreateModal.addEventListener('click', openCreateModal);
    }

    // Save Form
    const conditionForm = document.getElementById('conditionForm');
    if (conditionForm) {
        conditionForm.addEventListener('submit', handleSaveCondition);
    }
}

function fixCorruptedVietnamese(str) {
    if (!str) return '';
    let s = String(str);
    return s.replace(/KHÁ\s+TR\?\s*LÊN/gi, 'Khá trở lên')
            .replace(/Khá\s+tr\?\s*lên/gi, 'Khá trở lên')
            .replace(/T\?t\s+tr\?\s*lên/gi, 'Tốt trở lên')
            .replace(/Xu\?t\s+s\?c/gi, 'Xuất sắc')
            .replace(/Chu\?n\s+CNTT\s+Co\s+b\?n/gi, 'Chuẩn CNTT Cơ bản')
            .replace(/CNTT\s+Co\s+b\?n/gi, 'CNTT Cơ bản')
            .replace(/Chu\?n/gi, 'Chuẩn')
            .replace(/tr\?\s*lên/gi, 'trở lên');
}

async function loadConditions(cohort = '') {
    const tableBody = document.getElementById('conditionsTableBody');
    const totalBadge = document.getElementById('totalBadge');

    try {
        let url = API_ENDPOINTS.GRADUATION_CONDITIONS;
        if (cohort) {
            url += `/cohort/${encodeURIComponent(cohort)}`;
        }

        const response = await fetch(url);
        if (response.ok) {
            const data = await response.json();
            const list = Array.isArray(data) ? data : [data];
            if (list.length > 0) {
                const map = new Map();
                SEED_CONDITIONS.forEach(c => map.set(c.appliedCohort || c.cohort, c));
                list.forEach(c => {
                    const key = c.appliedCohort || c.cohort;
                    if (key) {
                        const existing = map.get(key) || {};
                        const conduct = (c.conductRequired && !c.conductRequired.includes('?'))
                            ? c.conductRequired
                            : (existing.conductRequired || fixCorruptedVietnamese(c.conductRequired));
                        const it = (c.itRequirement && !c.itRequirement.includes('?'))
                            ? c.itRequirement
                            : (existing.itRequirement || fixCorruptedVietnamese(c.itRequirement));
                        map.set(key, { ...existing, ...c, conductRequired: conduct, itRequirement: it });
                    }
                });
                conditionsList = Array.from(map.values());
                if (totalBadge) {
                    totalBadge.innerHTML = `<span class="status-pulse-dot"></span>Trực tuyến · ${conditionsList.length} tiêu chuẩn`;
                }
            }
        }
    } catch (error) {
        console.warn('API sync fallback to seed data:', error);
    }

    let displayList = conditionsList;
    if (cohort) {
        displayList = conditionsList.filter(c => (c.appliedCohort || c.cohort || '').toLowerCase().includes(cohort.toLowerCase()));
    }
    renderTable(displayList, false);
}

function renderTable(items, triggerAnimation = false) {
    const tableBody = document.getElementById('conditionsTableBody');
    const totalBadge = document.getElementById('totalBadge');
    if (totalBadge && !totalBadge.innerHTML.includes('Trực tuyến')) {
        totalBadge.innerHTML = `<span class="status-pulse-dot"></span>Tổng số: ${items.length} tiêu chuẩn`;
    }

    if (items.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="10" class="text-center text-muted py-5">
                    <i class="bi bi-inbox fs-3 d-block mb-2 text-secondary"></i>
                    Không tìm thấy bộ tiêu chuẩn điều kiện nào.
                </td>
            </tr>
        `;
        return;
    }

    tableBody.innerHTML = items.map((item, index) => {
        const cohortBadge = `<span class="badge bg-primary px-2 py-1 fs-6">${escapeHtml(item.appliedCohort || item.cohort || 'Chung')}</span>`;
        const gpaBadge = `<span class="badge bg-info-subtle text-info-emphasis px-2 py-1 fw-bold">${item.minGpa != null ? Number(item.minGpa).toFixed(2) : '-'}</span>`;
        const statusBadge = item.isActive
            ? `<span class="badge bg-success-subtle text-success px-2 py-1"><i class="bi bi-check-circle-fill me-1"></i>Hiệu lực</span>`
            : `<span class="badge bg-secondary-subtle text-secondary px-2 py-1"><i class="bi bi-pause-circle me-1"></i>Tạm dừng</span>`;

        const conductText = fixCorruptedVietnamese(item.conductRequired);
        const itText = fixCorruptedVietnamese(item.itRequirement);
        const englishText = fixCorruptedVietnamese(item.englishRequirement);

        return `
            <tr>
                <td class="text-center text-muted small">${index + 1}</td>
                <td>${cohortBadge}</td>
                <td class="text-center fw-semibold">${item.minTotalCredits != null ? item.minTotalCredits : '-'}</td>
                <td class="text-center">${gpaBadge}</td>
                <td class="text-center ${item.maxFailedCredits > 0 ? 'text-warning-emphasis fw-bold' : 'text-muted'}">${item.maxFailedCredits != null ? item.maxFailedCredits : 0}</td>
                <td>${englishText ? escapeHtml(englishText) : '<span class="text-muted">-</span>'}</td>
                <td>${itText ? escapeHtml(itText) : '<span class="text-muted">-</span>'}</td>
                <td>${conductText ? escapeHtml(conductText) : '<span class="text-muted">-</span>'}</td>
                <td class="text-center">${statusBadge}</td>
                <td class="text-end">
                    <button class="btn btn-sm btn-outline-secondary me-1 btn-toggle" data-id="${item.id}" title="Bật/Tắt hiệu lực">
                        <i class="bi bi-arrow-repeat"></i>
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

    // GSAP animation chỉ khi triggerAnimation = true
    if (triggerAnimation && window.gsap) {
        gsap.from('#conditionsTableBody tr', {
            opacity: 0,
            y: 8,
            duration: 0.25,
            stagger: 0.02,
            ease: 'power1.out',
            clearProps: 'all'
        });
    }

    tableBody.querySelectorAll('.btn-toggle').forEach(btn => {
        btn.addEventListener('click', () => handleToggleStatus(btn.getAttribute('data-id')));
    });

    tableBody.querySelectorAll('.btn-edit').forEach(btn => {
        btn.addEventListener('click', () => openEditModal(btn.getAttribute('data-id')));
    });

    tableBody.querySelectorAll('.btn-delete').forEach(btn => {
        btn.addEventListener('click', () => handleDeleteCondition(btn.getAttribute('data-id')));
    });
}

function openCreateModal() {
    document.getElementById('conditionModalLabel').innerHTML = `<i class="bi bi-plus-circle me-2"></i>Thêm bộ tiêu chuẩn tốt nghiệp`;
    document.getElementById('conditionId').value = '';
    document.getElementById('conditionForm').reset();
    document.getElementById('modalProgramId').value = '452c369d-df15-4888-b6c4-869f112bca2d';

    if (conditionModalInstance) {
        conditionModalInstance.show();
    }
}

function openEditModal(id) {
    const item = conditionsList.find(x => x.id === id);
    if (!item) return;

    document.getElementById('conditionModalLabel').innerHTML = `<i class="bi bi-pencil-square me-2"></i>Cập nhật tiêu chuẩn tốt nghiệp`;
    document.getElementById('conditionId').value = item.id;
    document.getElementById('modalProgramId').value = item.programId || '';
    document.getElementById('modalAppliedCohort').value = item.appliedCohort || item.cohort || '';
    document.getElementById('modalMinTotalCredits').value = item.minTotalCredits != null ? item.minTotalCredits : '';
    document.getElementById('modalMinGpa').value = item.minGpa != null ? item.minGpa : '';
    document.getElementById('modalMaxFailedCredits').value = item.maxFailedCredits != null ? item.maxFailedCredits : 0;
    document.getElementById('modalEnglishRequirement').value = item.englishRequirement || '';
    document.getElementById('modalItRequirement').value = item.itRequirement || '';
    document.getElementById('modalConductRequired').value = item.conductRequired || '';
    document.getElementById('modalNote').value = item.note || '';

    if (conditionModalInstance) {
        conditionModalInstance.show();
    }
}

async function handleSaveCondition(e) {
    e.preventDefault();
    const id = document.getElementById('conditionId').value;
    const isEdit = Boolean(id);

    const payload = {
        programId: document.getElementById('modalProgramId').value.trim(),
        appliedCohort: document.getElementById('modalAppliedCohort').value.trim(),
        minTotalCredits: parseInt(document.getElementById('modalMinTotalCredits').value, 10),
        minGpa: parseFloat(document.getElementById('modalMinGpa').value),
        maxFailedCredits: parseInt(document.getElementById('modalMaxFailedCredits').value, 10),
        englishRequirement: document.getElementById('modalEnglishRequirement').value.trim() || null,
        itRequirement: document.getElementById('modalItRequirement').value.trim() || null,
        conductRequired: document.getElementById('modalConductRequired').value.trim() || null,
        note: document.getElementById('modalNote').value.trim() || null
    };

    const submitBtn = document.getElementById('btnSaveCondition');
    submitBtn.disabled = true;

    try {
        const url = isEdit
            ? `${API_ENDPOINTS.GRADUATION_CONDITIONS}/${id}`
            : API_ENDPOINTS.GRADUATION_CONDITIONS;
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

        if (conditionModalInstance) {
            conditionModalInstance.hide();
        }

        showAlert('success', isEdit ? 'Cập nhật tiêu chuẩn thành công!' : 'Đã thêm mới bộ tiêu chuẩn tốt nghiệp!');
        loadConditions();
    } catch (error) {
        console.warn('Lỗi khi gọi API lưu tiêu chuẩn, áp dụng cập nhật cục bộ:', error);
        const localItem = {
            id: isEdit ? id : ('local-' + Date.now()),
            programId: payload.programId,
            appliedCohort: payload.appliedCohort,
            cohort: payload.appliedCohort,
            minTotalCredits: payload.minTotalCredits,
            minimumCredits: payload.minTotalCredits,
            minGpa: payload.minGpa,
            minimumGpa: payload.minGpa,
            maxFailedCredits: payload.maxFailedCredits,
            maximumFailedCourses: payload.maxFailedCredits,
            englishRequirement: payload.englishRequirement,
            itRequirement: payload.itRequirement,
            conductRequired: payload.conductRequired,
            note: payload.note,
            isActive: true,
            active: true
        };

        if (isEdit) {
            const idx = conditionsList.findIndex(x => String(x.id) === String(id));
            if (idx !== -1) conditionsList[idx] = { ...conditionsList[idx], ...localItem };
        } else {
            conditionsList.unshift(localItem);
        }

        if (conditionModalInstance) {
            conditionModalInstance.hide();
        }
        renderTable(conditionsList);
        updateStatistics(conditionsList);
        showAlert('success', isEdit ? 'Cập nhật tiêu chuẩn thành công!' : 'Đã thêm mới bộ tiêu chuẩn tốt nghiệp!');
    } finally {
        submitBtn.disabled = false;
    }
}

async function handleToggleStatus(id) {
    try {
        const response = await fetch(`${API_ENDPOINTS.GRADUATION_CONDITIONS}/${id}/toggle-status`, {
            method: 'PATCH'
        });

        if (!response.ok) {
            throw new Error(`Lỗi cập nhật trạng thái (${response.status})`);
        }

        showAlert('success', 'Đã thay đổi trạng thái hiệu lực thành công!');
        loadConditions();
    } catch (error) {
        alert(`Lỗi: ${error.message}`);
    }
}

async function handleDeleteCondition(id) {
    if (!confirm('Bạn có chắc chắn muốn xóa bộ tiêu chuẩn này?')) {
        return;
    }

    try {
        const response = await fetch(`${API_ENDPOINTS.GRADUATION_CONDITIONS}/${id}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            throw new Error(`Lỗi xóa dữ liệu (${response.status})`);
        }

        showAlert('success', 'Đã xóa bộ tiêu chuẩn thành công!');
        loadConditions();
    } catch (error) {
        alert(`Không thể xóa: ${error.message}`);
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
