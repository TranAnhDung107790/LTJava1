import { API_ENDPOINTS } from './config.js';

let conditionsList = [];
let conditionModalInstance = null;

document.addEventListener('DOMContentLoaded', () => {
    const modalEl = document.getElementById('conditionModal');
    if (modalEl && window.bootstrap) {
        conditionModalInstance = new bootstrap.Modal(modalEl);
    }

    initEventListeners();
    loadConditions();

    if (window.gsap) {
        gsap.from('.action-bar-card, .table-card', {
            opacity: 0,
            y: 16,
            duration: 0.45,
            stagger: 0.1,
            ease: 'power2.out',
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

async function loadConditions(cohort = '') {
    const tableBody = document.getElementById('conditionsTableBody');
    tableBody.innerHTML = `
        <tr>
            <td colspan="10" class="text-center text-muted py-5">
                <div class="spinner-border spinner-border-sm text-primary me-2"></div>
                Đang tải danh sách tiêu chuẩn tốt nghiệp...
            </td>
        </tr>
    `;

    try {
        let url = API_ENDPOINTS.GRADUATION_CONDITIONS;
        if (cohort) {
            url += `/cohort/${encodeURIComponent(cohort)}`;
        }

        const response = await fetch(url);
        if (!response.ok) {
            if (response.status === 404 && cohort) {
                renderTable([]);
                return;
            }
            throw new Error(`Lỗi tải dữ liệu (${response.status})`);
        }

        const data = await response.json();
        conditionsList = Array.isArray(data) ? data : [data];
        renderTable(conditionsList);
    } catch (error) {
        console.error('Lỗi khi tải bộ điều kiện:', error);
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
    const tableBody = document.getElementById('conditionsTableBody');
    const totalBadge = document.getElementById('totalBadge');
    if (totalBadge) {
        totalBadge.textContent = `Tổng số: ${items.length}`;
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

        return `
            <tr>
                <td class="text-center text-muted small">${index + 1}</td>
                <td>${cohortBadge}</td>
                <td class="text-center fw-semibold">${item.minTotalCredits != null ? item.minTotalCredits : '-'}</td>
                <td class="text-center">${gpaBadge}</td>
                <td class="text-center ${item.maxFailedCredits > 0 ? 'text-warning-emphasis fw-bold' : 'text-muted'}">${item.maxFailedCredits != null ? item.maxFailedCredits : 0}</td>
                <td>${item.englishRequirement ? escapeHtml(item.englishRequirement) : '<span class="text-muted">-</span>'}</td>
                <td>${item.itRequirement ? escapeHtml(item.itRequirement) : '<span class="text-muted">-</span>'}</td>
                <td>${item.conductRequired ? escapeHtml(item.conductRequired) : '<span class="text-muted">-</span>'}</td>
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

    // GSAP Stagger animation cho các hàng trong bảng tiêu chuẩn (clearProps: 'all' theo chuẩn gsap-skill)
    if (window.gsap) {
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
        alert(`Lỗi khi lưu tiêu chuẩn: ${error.message}`);
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
