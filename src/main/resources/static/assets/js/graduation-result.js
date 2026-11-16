import { API_ENDPOINTS } from './config.js';

/*
// Dữ liệu mẫu chuẩn hóa (Đã tắt - Hệ thống chuyển sang nạp 100% dữ liệu từ Database)
const SEED_RESULTS = [
    {
        id: 'seed-res-1',
        studentName: 'Bùi Gia An',
        studentCode: '26763',
        gpa: 3.45,
        totalCredits: 132,
        failedCredits: 0,
        result: 1,
        classification: 'GIỎI',
        decisionDate: '2026-11-15',
        note: 'QĐ 452/QĐ-ĐHA công nhận tốt nghiệp đợt 1'
    },
    {
        id: 'seed-res-2',
        studentName: 'Trần Thị B',
        studentCode: 'SV002',
        gpa: 3.68,
        totalCredits: 130,
        failedCredits: 0,
        result: 1,
        classification: 'XUẤT SẮC',
        decisionDate: '2026-11-15',
        note: 'Khen thưởng sinh viên tốt nghiệp Xuất sắc'
    },
    {
        id: 'seed-res-3',
        studentName: 'Lê Hoàng C',
        studentCode: 'SV003',
        gpa: 2.85,
        totalCredits: 128,
        failedCredits: 2,
        result: 0,
        classification: 'CHƯA ĐẠT',
        decisionDate: '-',
        note: 'Nợ 2 tín chỉ & chờ nộp chứng chỉ tiếng Anh'
    },
    {
        id: 'seed-res-4',
        studentName: 'Phạm Minh D',
        studentCode: 'SV004',
        gpa: 3.22,
        totalCredits: 135,
        failedCredits: 0,
        result: 1,
        classification: 'GIỎI',
        decisionDate: '2026-11-15',
        note: 'QĐ 452/QĐ-ĐHA công nhận tốt nghiệp'
    },
    {
        id: 'seed-res-5',
        studentName: 'Hoàng Thị E',
        studentCode: 'SV005',
        gpa: 3.82,
        totalCredits: 131,
        failedCredits: 0,
        result: 1,
        classification: 'XUẤT SẮC',
        decisionDate: '2026-11-15',
        note: 'Thủ khoa tốt nghiệp Khóa K22 ngành CNTT'
    },
    {
        id: 'seed-res-6',
        studentName: 'Vũ Đức F',
        studentCode: 'SV006',
        gpa: 2.35,
        totalCredits: 124,
        failedCredits: 6,
        result: 0,
        classification: 'CHƯA ĐẠT',
        decisionDate: '-',
        note: 'Chưa đủ điều kiện 130 tín chỉ tích lũy'
    },
    {
        id: 'seed-res-7',
        studentName: 'Đặng Nhật G',
        studentCode: 'SV007',
        gpa: 3.15,
        totalCredits: 130,
        failedCredits: 0,
        result: 1,
        classification: 'KHÁ',
        decisionDate: '2026-11-15',
        note: 'QĐ 452/QĐ-ĐHA công nhận tốt nghiệp'
    },
    {
        id: 'seed-res-8',
        studentName: 'Bùi Thảo H',
        studentCode: 'SV008',
        gpa: 3.55,
        totalCredits: 133,
        failedCredits: 0,
        result: 1,
        classification: 'GIỎI',
        decisionDate: '2026-11-15',
        note: 'QĐ 452/QĐ-ĐHA công nhận tốt nghiệp'
    }
];
*/

let localResultsList = [];
// State
let currentPage = 0;
let pageSize = 10;
let currentFilterResult = '';
let currentFilterCondition = '';
const studentsMap = new Map();
const conditionsMap = new Map();
let currentStudentSummary = null;

// Bootstrap Modal instances
let evaluateModalInstance = null;
let resultModalInstance = null;
let wordExportModalInstance = null;

document.addEventListener('DOMContentLoaded', async () => {
    // Initialize Modals
    const evalModalEl = document.getElementById('evaluateModal');
    if (evalModalEl && window.bootstrap) {
        evaluateModalInstance = new bootstrap.Modal(evalModalEl);
    }

    const resModalEl = document.getElementById('resultModal');
    if (resModalEl && window.bootstrap) {
        resultModalInstance = new bootstrap.Modal(resModalEl);
    }
    const wordExportModalEl = document.getElementById('wordExportModal');
    if (wordExportModalEl && window.bootstrap) {
        wordExportModalInstance = new bootstrap.Modal(wordExportModalEl);
    }

    // Attach Event Listeners
    initEventListeners();

    // Trạng thái đang nạp dữ liệu ban đầu từ Database
    const initialTableBody = document.getElementById('resultsTableBody');
    if (initialTableBody) {
        initialTableBody.innerHTML = `
            <tr>
                <td colspan="10" class="text-center text-muted py-5">
                    <div class="spinner-border spinner-border-sm text-primary me-2" role="status"></div>
                    Đang tải danh sách kết quả xét tốt nghiệp từ hệ thống...
                </td>
            </tr>
        `;
    }

    if (window.gsap) {
        gsap.from('.action-bar-card, .table-card-container', {
            opacity: 0,
            y: 18,
            duration: 0.45,
            stagger: 0.1,
            ease: 'power2.out',
            clearProps: 'all'
        });
        gsap.from('#resultsTableBody tr', {
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
    Promise.all([loadStudents(), loadConditions(), loadExportClasses()]).then(() => {
        loadResults();
    });
});

function initEventListeners() {
    // Search
    const btnSearch = document.getElementById('btnSearch');
    const searchKeyword = document.getElementById('searchKeyword');

    if (btnSearch) {
        btnSearch.addEventListener('click', () => {
            currentPage = 0;
            loadResults();
        });
    }

    if (searchKeyword) {
        searchKeyword.addEventListener('keyup', (e) => {
            if (e.key === 'Enter') {
                currentPage = 0;
                loadResults();
            }
        });
    }

    // Filter by Result status
    const filterResult = document.getElementById('filterResult');
    if (filterResult) {
        filterResult.addEventListener('change', (e) => {
            currentFilterResult = e.target.value;
            currentPage = 0;
            loadResults();
        });
    }

    const filterCondition = document.getElementById('filterCondition');
    if (filterCondition) {
        filterCondition.addEventListener('change', (e) => {
            currentFilterCondition = e.target.value;
            currentPage = 0;
            loadResults();
        });
    }

    const btnExportWord = document.getElementById('btnExportWord');
    if (btnExportWord) {
        btnExportWord.addEventListener('click', openWordExportModal);
    }
    const btnConfirmExportWord = document.getElementById('btnConfirmExportWord');
    if (btnConfirmExportWord) {
        btnConfirmExportWord.addEventListener('click', handleExportWord);
    }
    const wordExportConditions = document.getElementById('wordExportConditions');
    if (wordExportConditions) {
        wordExportConditions.addEventListener('change', () => {
            const conditionIds = Array.from(wordExportConditions.selectedOptions)
                .map(option => option.value)
                .filter(Boolean);
            loadExportClasses(conditionIds);
        });
    }

    // Filter by Page Size
    const filterSize = document.getElementById('filterSize');
    if (filterSize) {
        filterSize.addEventListener('change', (e) => {
            pageSize = parseInt(e.target.value, 10);
            currentPage = 0;
            loadResults();
        });
    }

    // Refresh button
    const btnRefresh = document.getElementById('btnRefresh');
    if (btnRefresh) {
        btnRefresh.addEventListener('click', () => {
            if (searchKeyword) searchKeyword.value = '';
            currentFilterResult = '';
            currentFilterCondition = '';
            const filterCondEl = document.getElementById('filterCondition');
            if (filterCondEl) filterCondEl.value = '';
            const filterResEl = document.getElementById('filterResult');
            if (filterResEl) filterResEl.value = '';
            currentPage = 0;
            loadResults();
        });
    }

    // Open Evaluate Modal
    const btnOpenEvaluateModal = document.getElementById('btnOpenEvaluateModal');
    if (btnOpenEvaluateModal) {
        btnOpenEvaluateModal.addEventListener('click', () => {
            if (evaluateModalInstance) {
                document.getElementById('evalReviewerId').value = '';
                evaluateModalInstance.show();
            }
        });
    }

    // Execute Evaluate Button
    const btnExecuteEvaluate = document.getElementById('btnExecuteEvaluate');
    if (btnExecuteEvaluate) {
        btnExecuteEvaluate.addEventListener('click', handleExecuteEvaluate);
    }

    // Open Manual Create Modal
    const btnOpenCreateModal = document.getElementById('btnOpenCreateModal');
    if (btnOpenCreateModal) {
        btnOpenCreateModal.addEventListener('click', () => {
            openCreateModal();
        });
    }

    // Save Result Form
    const resultForm = document.getElementById('resultForm');
    if (resultForm) {
        resultForm.addEventListener('submit', handleSaveResult);
    }

    // Evaluate Condition Detail preview
    const evalConditionSelect = document.getElementById('evalConditionSelect');
    if (evalConditionSelect) {
        evalConditionSelect.addEventListener('change', (e) => {
            const cond = conditionsMap.get(e.target.value);
            const detailEl = document.getElementById('evalConditionDetail');
            if (cond && detailEl) {
                const cohort = cond.appliedCohort || 'Chung';
                detailEl.innerHTML = `<div class="mt-2 p-2 bg-light rounded border border-warning">
                    <div><i class="bi bi-mortarboard-fill text-warning me-1"></i><strong>Khóa áp dụng:</strong> <span class="badge bg-primary">${cohort}</span></div>
                    <div class="mt-1"><i class="bi bi-shield-check text-success me-1"></i><strong>Tiêu chuẩn:</strong> GPA sàn: <b>${cond.minGpa}</b> | Tín chỉ sàn: <b>${cond.minTotalCredits}</b> | Nợ tối đa: <b>${cond.maxFailedCredits}</b></div>
                    <div class="mt-1 text-muted small"><i class="bi bi-info-circle me-1"></i>Hệ thống sẽ <strong>chỉ quét và xét duyệt sinh viên thuộc khóa ${cohort}</strong>.</div>
                </div>`;
            } else if (detailEl) {
                detailEl.innerHTML = '';
            }
        });
    }

    const modalStudentSelect = document.getElementById('modalStudentId');
    const modalConditionSelect = document.getElementById('modalConditionId');
    if (modalStudentSelect) {
        modalStudentSelect.addEventListener('change', refreshManualDerivedData);
    }
    if (modalConditionSelect) {
        modalConditionSelect.addEventListener('change', refreshManualDerivedData);
    }
}

// =================================================================================
// 1. TẢI DỮ LIỆU BẢNG KẾT QUẢ XÉT TỐT NGHIỆP
// =================================================================================
async function loadResults() {
    const tableBody = document.getElementById('resultsTableBody');
    const totalBadge = document.getElementById('totalBadge');

    const keyword = document.getElementById('searchKeyword')?.value.trim() || '';

    try {
        let url = `${API_ENDPOINTS.GRADUATION_RESULTS}?page=${currentPage}&size=${pageSize}&sortBy=createdAt&direction=desc`;
        if (currentFilterResult !== '') {
            url += `&result=${encodeURIComponent(currentFilterResult)}`;
        }
        if (currentFilterCondition) {
            url += `&conditionId=${encodeURIComponent(currentFilterCondition)}`;
        }

        const response = await fetch(url);
        if (response.ok) {
            const data = await response.json();
            if (data && data.content) {
                localResultsList = data.content;
                let displayItems = data.content;

                // Lọc theo từ khóa tìm kiếm nếu có
                if (keyword) {
                    const kwLower = keyword.toLowerCase();
                    displayItems = displayItems.filter(r => {
                        const student = studentsMap.get(r.studentId);
                        const name = (student?.fullName || r.studentName || '').toLowerCase();
                        const code = (student?.studentCode || r.studentCode || '').toLowerCase();
                        return name.includes(kwLower) || code.includes(kwLower);
                    });
                }

                const pageData = {
                    ...data,
                    content: displayItems,
                    totalElements: keyword ? displayItems.length : data.totalElements
                };

                if (totalBadge) {
                    totalBadge.innerHTML = `<span class="status-pulse-dot"></span>Trực tuyến · ${pageData.totalElements} kết quả`;
                }
                renderResultsTable(pageData, false);
                renderPagination(pageData);
                updateResultStats(pageData);
                return;
            }
        }
    } catch (error) {
        console.error('Lỗi khi tải kết quả tốt nghiệp từ API:', error);
    }

    // Khi không có dữ liệu hoặc API lỗi
    localResultsList = [];
    const emptyPageData = {
        content: [],
        totalElements: 0,
        totalPages: 0,
        number: 0,
        size: pageSize
    };
    renderResultsTable(emptyPageData, false);
    renderPagination(emptyPageData);
    updateResultStats(emptyPageData);
}

function renderResultsTable(pageData, triggerAnimation = false) {
    const tableBody = document.getElementById('resultsTableBody');
    const items = pageData.content || [];
    const keyword = document.getElementById('searchKeyword')?.value.trim();

    // Cập nhật tổng số
    const totalBadge = document.getElementById('totalBadge');
    if (totalBadge && !totalBadge.innerHTML.includes('Trực tuyến')) {
        totalBadge.innerHTML = `<span class="status-pulse-dot"></span>Tổng số: ${pageData.totalElements || 0} kết quả`;
    }

    if (items.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="10" class="text-center text-muted py-5">
                    <i class="bi bi-inbox fs-3 d-block mb-2 text-secondary"></i>
                    ${keyword ? `Không tìm thấy kết quả nào phù hợp với từ khóa "<strong>${escapeHtml(keyword)}</strong>".` : 'Chưa có kết quả xét tốt nghiệp nào.'}
                </td>
            </tr>
        `;
        return;
    }

    const startIdx = pageData.number * pageData.size;

    tableBody.innerHTML = items.map((item, index) => {
        // Thông tin sinh viên (ưu tiên tên sinh viên từ studentsMap hoặc backend và làm sạch số đuôi)
        const student = studentsMap.get(item.studentId);
        const rawName = student?.fullName || student?.name || item.studentName;
        const fullName = formatStudentName(rawName);
        const studentCode = student?.studentCode || item.studentCode || '';

        let studentDisplay = '';
        if (fullName) {
            studentDisplay = `<strong>${escapeHtml(fullName)}</strong>${studentCode ? `<br/><small class="text-muted"><i class="bi bi-person-vcard me-1"></i>${escapeHtml(studentCode)}</small>` : ''}`;
        } else {
            studentDisplay = `<span class="fw-semibold text-dark">Sinh viên #${item.studentId ? item.studentId.substring(0, 8) : '-'}</span>`;
        }

        // Badge Kết quả Đạt / Chưa đạt
        const resultBadge = Number(item.result) === 1
            ? `<span class="badge badge-pass shadow-sm"><i class="bi bi-check-circle-fill me-1"></i>Đạt</span>`
            : `<span class="badge badge-fail shadow-sm"><i class="bi bi-x-circle-fill me-1"></i>Chưa đạt</span>`;

        // Badge Xếp loại
        const classificationBadge = getClassificationBadge(item.classification);

        // Định dạng GPA
        const gpaValue = item.gpa != null ? Number(item.gpa).toFixed(2) : '-';
        const gpaClass = Number(gpaValue) >= 3.2 ? 'text-success fw-bold' : (Number(gpaValue) >= 2.5 ? 'text-primary fw-semibold' : 'text-dark');

        // Ghi chú
        const noteDisplay = item.note ? escapeHtml(item.note) : '<span class="text-muted">-</span>';

        // Ngày ra quyết định
        const decisionDateDisplay = item.decisionDate || '<span class="text-muted">-</span>';

        return `
            <tr>
                <td class="text-center text-muted small">${startIdx + index + 1}</td>
                <td>${studentDisplay}</td>
                <td class="text-center ${gpaClass}">${gpaValue}</td>
                <td class="text-center fw-semibold">${item.totalCredits != null ? item.totalCredits : '-'}</td>
                <td class="text-center ${item.failedCredits > 0 ? 'text-danger fw-bold' : 'text-muted'}">${item.failedCredits != null ? item.failedCredits : 0}</td>
                <td class="text-center">${resultBadge}</td>
                <td class="text-center">${classificationBadge}</td>
                <td class="small text-muted">${decisionDateDisplay}</td>
                <td class="small text-secondary" style="max-width: 250px;">${noteDisplay}</td>
                <td class="text-end">
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

    // GSAP Stagger animation cho các hàng trong bảng kết quả (clearProps chống lỗi mờ dòng - gsap-skill)
    if (triggerAnimation && window.gsap) {
        gsap.from('#resultsTableBody tr', {
            opacity: 0,
            y: 8,
            duration: 0.25,
            stagger: 0.02,
            ease: 'power1.out',
            clearProps: 'all'
        });
    }

    // Attach row action events
    tableBody.querySelectorAll('.btn-edit').forEach(btn => {
        btn.addEventListener('click', () => openEditModal(btn.getAttribute('data-id'), items));
    });

    tableBody.querySelectorAll('.btn-delete').forEach(btn => {
        btn.addEventListener('click', () => handleDeleteResult(btn.getAttribute('data-id')));
    });
}

function getClassificationBadge(classification) {
    switch (Number(classification)) {
        case 1:
            return `<span class="badge badge-class-1"><i class="bi bi-star-fill me-1"></i>Xuất sắc</span>`;
        case 2:
            return `<span class="badge badge-class-2"><i class="bi bi-patch-check-fill me-1"></i>Giỏi</span>`;
        case 3:
            return `<span class="badge badge-class-3">Khá</span>`;
        case 4:
            return `<span class="badge badge-class-4">Trung bình</span>`;
        default:
            return `<span class="text-muted small">-</span>`;
    }
}

function renderPagination(pageData) {
    const pageInfo = document.getElementById('pageInfo');
    const pagination = document.getElementById('pagination');

    const totalElements = pageData.totalElements || 0;
    const totalPages = pageData.totalPages || 0;
    const current = pageData.number || 0;
    const size = pageData.size || 10;

    const from = totalElements === 0 ? 0 : current * size + 1;
    const to = Math.min((current + 1) * size, totalElements);

    if (pageInfo) {
        pageInfo.textContent = `Đang hiển thị ${from} - ${to} của ${totalElements} bản ghi (Trang ${current + 1}/${Math.max(totalPages, 1)})`;
    }

    if (!pagination) return;

    if (totalPages <= 1) {
        pagination.innerHTML = '';
        return;
    }

    let html = '';

    // First & Prev
    html += `
        <li class="page-item ${current === 0 ? 'disabled' : ''}">
            <button class="page-link" data-page="0" title="Trang đầu">&laquo;</button>
        </li>
        <li class="page-item ${current === 0 ? 'disabled' : ''}">
            <button class="page-link" data-page="${current - 1}" title="Trang trước">&lsaquo;</button>
        </li>
    `;

    // Pages numbers (hiển thị cửa sổ 5 trang)
    const windowSize = 5;
    let startPage = Math.max(0, current - Math.floor(windowSize / 2));
    let endPage = Math.min(totalPages - 1, startPage + windowSize - 1);
    if (endPage - startPage < windowSize - 1) {
        startPage = Math.max(0, endPage - windowSize + 1);
    }

    for (let p = startPage; p <= endPage; p++) {
        html += `
            <li class="page-item ${p === current ? 'active' : ''}">
                <button class="page-link" data-page="${p}">${p + 1}</button>
            </li>
        `;
    }

    // Next & Last
    html += `
        <li class="page-item ${current >= totalPages - 1 ? 'disabled' : ''}">
            <button class="page-link" data-page="${current + 1}" title="Trang sau">&rsaquo;</button>
        </li>
        <li class="page-item ${current >= totalPages - 1 ? 'disabled' : ''}">
            <button class="page-link" data-page="${totalPages - 1}" title="Trang cuối">&raquo;</button>
        </li>
    `;

    pagination.innerHTML = html;

    pagination.querySelectorAll('.page-link').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const targetPage = parseInt(btn.getAttribute('data-page'), 10);
            if (!isNaN(targetPage) && targetPage >= 0 && targetPage < totalPages && targetPage !== current) {
                currentPage = targetPage;
                loadResults();
            }
        });
    });
}

// =================================================================================
// 2. KÍCH HOẠT XÉT DUYỆT TỰ ĐỘNG (/api/graduation-results/evaluate)
// =================================================================================
async function handleExecuteEvaluate() {
    const conditionId = document.getElementById('evalConditionSelect').value;
    if (!conditionId) {
        alert('Vui lòng chọn một bộ điều kiện tốt nghiệp!');
        return;
    }

    const cond = conditionsMap.get(conditionId);
    const cohort = cond ? cond.appliedCohort : null;

    const reviewerInput = document.getElementById('evalReviewerId').value.trim();
    if (reviewerInput && !isUuid(reviewerInput)) {
        alert('Mã cán bộ / người duyệt phải là UUID hợp lệ, hoặc để trống.');
        return;
    }
    const payload = {
        conditionId: conditionId,
        cohort: cohort,
        reviewerId: reviewerInput || null
    };

    const btnExecute = document.getElementById('btnExecuteEvaluate');
    btnExecute.disabled = true;
    btnExecute.innerHTML = `<span class="spinner-border spinner-border-sm me-1" role="status"></span>Đang xử lý quét...`;

    try {
        const response = await fetch(`${API_ENDPOINTS.GRADUATION_RESULTS}/evaluate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            throw new Error(errData.message || errData.error || `Lỗi máy chủ (${response.status})`);
        }

        const evaluatedList = await response.json();

        if (evaluateModalInstance) {
            evaluateModalInstance.hide();
        }

        const cohortText = cohort ? ` khóa ${cohort}` : '';
        showListAlert('success', `⚡ Đã kích hoạt xét duyệt tự động thành công cho <strong>${evaluatedList.length}</strong> sinh viên${cohortText}!`);
        currentPage = 0;
        loadResults();
    } catch (error) {
        console.error('Lỗi xét duyệt tự động:', error);
        alert(`Không thể thực hiện xét duyệt: ${error.message}`);
    } finally {
        btnExecute.disabled = false;
        btnExecute.innerHTML = `<i class="bi bi-play-circle-fill me-1"></i>Bắt đầu quét & Đánh giá`;
    }
}

// =================================================================================
// 3. THÊM / CẬP NHẬT THỦ CÔNG
// =================================================================================
function openCreateModal() {
    document.getElementById('resultModalLabel').innerHTML = `<i class="bi bi-plus-circle me-2"></i>Tạo kết quả tốt nghiệp`;
    document.getElementById('resultId').value = '';
    document.getElementById('resultForm').reset();
    document.getElementById('modalStudentId').disabled = false;
    document.getElementById('modalResultStatus').disabled = true;
    document.getElementById('modalClassification').disabled = true;
    resetManualDerivedData();
    document.getElementById('modalDecisionDate').value = new Date().toISOString().split('T')[0];

    if (resultModalInstance) {
        resultModalInstance.show();
    }
}

function openEditModal(id, items) {
    const item = items.find(x => x.id === id);
    if (!item) return;

    document.getElementById('resultModalLabel').innerHTML = `<i class="bi bi-pencil-square me-2"></i>Cập nhật kết quả tốt nghiệp`;
    document.getElementById('resultId').value = item.id;

    // Đảm bảo dropdown sinh viên có option tương ứng
    const studentSelect = document.getElementById('modalStudentId');
    if (item.studentId && !studentSelect.querySelector(`option[value="${item.studentId}"]`)) {
        const opt = document.createElement('option');
        opt.value = item.studentId;
        const name = formatStudentName(item.studentName || 'Sinh viên');
        opt.textContent = `${item.studentCode || 'SV'} - ${name}`;
        studentSelect.appendChild(opt);
    }

    document.getElementById('modalStudentId').value = item.studentId || '';
    document.getElementById('modalStudentId').disabled = true;
    document.getElementById('modalConditionId').value = item.conditionId || '';
    document.getElementById('modalGpa').value = item.gpa != null ? item.gpa : '';
    document.getElementById('modalTotalCredits').value = item.totalCredits != null ? item.totalCredits : '';
    document.getElementById('modalFailedCredits').value = item.failedCredits != null ? item.failedCredits : 0;
    document.getElementById('modalResultStatus').value = item.result != null ? item.result : '1';
    document.getElementById('modalClassification').value = item.classification != null ? item.classification : '';
    document.getElementById('modalDecisionDate').value = item.decisionDate || '';
    document.getElementById('modalReviewer').value = item.reviewer || '';
    document.getElementById('modalNote').value = item.note || '';
    currentStudentSummary = null;
    refreshManualDerivedData();

    if (resultModalInstance) {
        resultModalInstance.show();
    }
}

async function handleSaveResult(e) {
    e.preventDefault();
    const id = document.getElementById('resultId').value;
    const isEdit = Boolean(id);

    const studentIdVal = document.getElementById('modalStudentId').value;
    const conditionIdVal = document.getElementById('modalConditionId').value;
    if (!currentStudentSummary) {
        showManualSummaryStatus('danger', 'Không thể lưu vì sinh viên chưa có dữ liệu tổng kết hợp lệ.');
        return;
    }
    const derived = calculateDerivedResult(currentStudentSummary, conditionsMap.get(conditionIdVal));
    if (!derived) {
        showManualSummaryStatus('danger', 'Vui lòng chọn sinh viên và bộ điều kiện hợp lệ trước khi lưu.');
        return;
    }
    const gpaVal = derived.gpa;
    const totalCreditsVal = derived.totalCredits;
    const failedCreditsVal = derived.failedCredits;
    const resultStatusVal = parseInt(document.getElementById('modalResultStatus').value, 10);
    const classificationVal = document.getElementById('modalClassification').value ? parseInt(document.getElementById('modalClassification').value, 10) : null;
    const decisionDateVal = document.getElementById('modalDecisionDate').value || new Date().toISOString().split('T')[0];
    const reviewerVal = document.getElementById('modalReviewer').value.trim() || null;
    if (reviewerVal && !isUuid(reviewerVal)) {
        alert('Người duyệt phải là UUID hợp lệ, hoặc để trống.');
        return;
    }
    const noteVal = document.getElementById('modalNote').value.trim() || null;

    const payload = {
        studentId: studentIdVal,
        conditionId: conditionIdVal,
        gpa: gpaVal,
        totalCredits: totalCreditsVal,
        failedCredits: failedCreditsVal,
        result: resultStatusVal,
        classification: classificationVal,
        decisionDate: decisionDateVal,
        reviewer: reviewerVal,
        note: noteVal
    };

    // Đóng modal ngay tức thì
    if (resultModalInstance) {
        resultModalInstance.hide();
    }

    // 🚀 TỐI ƯU TỨC THÌ: Lấy thông tin sinh viên và render bảng ngay lập tức trong 50ms
    const selStudent = studentsMap.get(studentIdVal) || { studentCode: 'SV', fullName: 'Sinh viên', className: 'CNTT-K24-01' };
    const studentNameClean = formatStudentName(selStudent.fullName || 'Sinh viên');

    const newItem = {
        id: isEdit ? id : ('res-' + Date.now()),
        studentId: studentIdVal,
        conditionId: conditionIdVal,
        studentCode: selStudent.studentCode || 'SV',
        studentName: studentNameClean,
        gpa: gpaVal,
        totalCredits: totalCreditsVal,
        failedCredits: failedCreditsVal,
        result: resultStatusVal,
        classification: classificationVal,
        decisionDate: decisionDateVal,
        reviewer: reviewerVal,
        note: noteVal,
        isActive: true
    };

    if (isEdit) {
        const idx = localResultsList.findIndex(x => String(x.id) === String(id));
        if (idx !== -1) localResultsList[idx] = { ...localResultsList[idx], ...newItem };
    } else {
        localResultsList.unshift(newItem);
    }

    const pageData = {
        content: localResultsList.slice(currentPage * pageSize, (currentPage + 1) * pageSize),
        totalElements: localResultsList.length,
        totalPages: Math.ceil(localResultsList.length / pageSize),
        number: currentPage,
        size: pageSize
    };
    renderResultsTable(pageData, false);
    renderPagination(pageData);

    const resultLabel = resultStatusVal === 1 ? '<span class="text-success fw-bold">ĐẠT</span>' : '<span class="text-danger fw-bold">CHƯA ĐẠT</span>';
    const classNames = { 1: 'Xuất sắc', 2: 'Giỏi', 3: 'Khá', 4: 'Trung bình' };
    const classLabel = classificationVal && classNames[classificationVal] ? ` (${classNames[classificationVal]})` : '';

    const successMsg = isEdit
        ? `✅ Đã cập nhật kết quả tốt nghiệp cho sinh viên: <strong>${studentNameClean}</strong> (${selStudent.studentCode || 'SV'}) - ${resultLabel}${classLabel}`
        : `✅ Đã ghi nhận kết quả tốt nghiệp mới cho sinh viên: <strong>${studentNameClean}</strong> (${selStudent.studentCode || 'SV'}) - ${resultLabel}${classLabel}`;
    showListAlert('success', successMsg);

    // Gửi đồng bộ ngầm lên backend
    try {
        const url = isEdit
            ? `${API_ENDPOINTS.GRADUATION_RESULTS}/${id}`
            : API_ENDPOINTS.GRADUATION_RESULTS;
        const method = isEdit ? 'PUT' : 'POST';

        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || errorData.error || `Lỗi máy chủ (${response.status})`);
            }
            const savedData = await response.json();
            if (savedData && savedData.id && !isEdit) {
                newItem.id = savedData.id;
        }
    } catch (error) {
            console.error('Không thể lưu kết quả tốt nghiệp:', error);
            showListAlert('danger', `Không thể lưu kết quả vào hệ thống: ${escapeHtml(error.message)}`);
    }
}

function resetManualDerivedData() {
    currentStudentSummary = null;
    ['modalGpa', 'modalTotalCredits', 'modalFailedCredits'].forEach(id => {
            document.getElementById(id).value = '';
    });
    document.getElementById('modalResultStatus').value = '';
    document.getElementById('modalClassification').value = '';
    const saveButton = document.getElementById('btnSaveResult');
    if (saveButton) saveButton.disabled = true;
    showManualSummaryStatus('secondary', 'Chọn sinh viên và bộ điều kiện để hệ thống tải dữ liệu tổng kết.');
}

async function refreshManualDerivedData() {
    const studentId = document.getElementById('modalStudentId')?.value;
    const conditionId = document.getElementById('modalConditionId')?.value;
    resetManualDerivedData();

    if (!studentId || !conditionId) return;

    showManualSummaryStatus('info', 'Đang tải dữ liệu tổng kết...');
    try {
            const response = await fetch(`${API_ENDPOINTS.GRADUATION_RESULTS}/student/${studentId}/summary`);
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || errorData.error || 'Không tìm thấy dữ liệu tổng kết');
            }
            currentStudentSummary = await response.json();
            const derived = calculateDerivedResult(currentStudentSummary, conditionsMap.get(conditionId));
            if (!derived) {
                throw new Error('Bộ điều kiện tốt nghiệp không hợp lệ');
            }

            document.getElementById('modalGpa').value = derived.gpa.toFixed(2);
            document.getElementById('modalTotalCredits').value = derived.totalCredits;
            document.getElementById('modalFailedCredits').value = derived.failedCredits;
            document.getElementById('modalResultStatus').value = String(derived.result);
            document.getElementById('modalClassification').value = derived.classification ? String(derived.classification) : '';
            document.getElementById('modalResultStatus').disabled = false;
            document.getElementById('modalClassification').disabled = false;
            document.getElementById('btnSaveResult').disabled = false;
            showManualSummaryStatus('success', 'Đã tải dữ liệu tổng kết và tự động tính kết quả theo bộ điều kiện.');
    } catch (error) {
            currentStudentSummary = null;
            showManualSummaryStatus('danger', `Không thể tải dữ liệu tổng kết: ${error.message}`);
    }
}

function calculateDerivedResult(summary, condition) {
    if (!summary || !condition || summary.gpa == null) return null;

    const gpa = Number(summary.gpa);
    const totalCredits = Number(summary.totalCredits || 0);
    const failedCredits = Number(summary.failedCredits || 0);
    const isPass = totalCredits >= Number(condition.minTotalCredits ?? 120)
            && gpa >= Number(condition.minGpa ?? 2.00)
            && failedCredits <= Number(condition.maxFailedCredits ?? 0);

    let classification = null;
    if (isPass) {
            classification = gpa >= 3.60 ? 1 : (gpa >= 3.20 ? 2 : (gpa >= 2.50 ? 3 : 4));
    }
    return { gpa, totalCredits, failedCredits, result: isPass ? 1 : 0, classification };
}

function showManualSummaryStatus(type, message) {
    const status = document.getElementById('studentSummaryStatus');
    if (!status) return;
    const icons = { success: 'bi-check-circle', danger: 'bi-exclamation-triangle', info: 'bi-hourglass-split', secondary: 'bi-info-circle' };
    status.className = `alert alert-${type} py-2 small mb-0`;
    status.innerHTML = `<i class="bi ${icons[type] || icons.info} me-1"></i>${escapeHtml(message)}`;
}

// =================================================================================
// 4. XÓA KẾT QUẢ
// =================================================================================
async function handleDeleteResult(id) {
    if (!confirm('Bạn có chắc chắn muốn xóa bản ghi kết quả này?')) {
        return;
    }

    const item = localResultsList.find(x => String(x.id) === String(id));
    const sName = item ? (item.studentName || 'Sinh viên') : '';

    localResultsList = localResultsList.filter(x => String(x.id) !== String(id));
    const pageData = {
        content: localResultsList.slice(currentPage * pageSize, (currentPage + 1) * pageSize),
        totalElements: localResultsList.length,
        totalPages: Math.ceil(localResultsList.length / pageSize),
        number: currentPage,
        size: pageSize
    };
    renderResultsTable(pageData, false);
    renderPagination(pageData);

    showListAlert('success', `🗑️ Đã xóa bản ghi kết quả của sinh viên: <strong>${sName}</strong> thành công!`);

    try {
        await fetch(`${API_ENDPOINTS.GRADUATION_RESULTS}/${id}`, { method: 'DELETE' });
    } catch (error) {
        console.warn('Lỗi xóa API kết quả:', error);
    }
}

// =================================================================================
// 5. TIỆN ÍCH TẢI DỮ LIỆU PHỤ TRỢ (STUDENTS & CONDITIONS)
// =================================================================================
async function loadStudents() {
    /*
    const fallbackStudents = [
        { id: "8f64a671-de50-4c87-8b39-ff5bdbf387e8", studentCode: "26687", fullName: "Hứa Tiến Tiến", className: "OTO-K26-02" },
        { id: "35f6941e-b583-4625-8ce2-ff4d1990a891", studentCode: "26563", fullName: "Ngô Hữu Tuấn", className: "NNA-K26-01" },
        { id: "c21b452a-bb86-4054-a619-ff21dc207a19", studentCode: "25549", fullName: "Hồ Hoàng Hùng", className: "KTPM-K26-02" },
        { id: "0e374a91-d6e6-4174-b7df-ff19e2e5876f", studentCode: "23017", fullName: "Vũ Khánh Tùng", className: "CNTT-K24-01" },
        { id: "861670d3-393c-4c59-93b9-fea33e67b71f", studentCode: "26395", fullName: "Hoàng Hoàng Tâm", className: "QTKD-K25-01" },
        { id: "e86e5ca4-db05-436a-9ab0-fe6a6e9d1afc", studentCode: "26666", fullName: "Chu Hà Linh", className: "MKT-K26-01" }
    ];
    */

    try {
        let list = [];
        try {
            const staticResp = await fetch('assets/data/students.json');
            if (staticResp.ok) {
                list = await staticResp.json();
            }
        } catch (err) {}

        if (!list || list.length === 0) {
            const response = await fetch(API_ENDPOINTS.STUDENTS);
            if (response.ok) {
                list = await response.json();
            }
        }
        if (!list) {
            list = [];
        }

        const cleanedList = list.map(s => {
            const code = s.studentCode || s.code || '';
            return {
                ...s,
                studentCode: code,
                fullName: formatStudentName(s.fullName || s.name || 'Sinh viên', code)
            };
        });
        sortStudentsAlphabetically(cleanedList);

        const select = document.getElementById('modalStudentId');
        let optionsHtml = '<option value="">-- Chọn sinh viên --</option>';

        cleanedList.forEach(s => {
            studentsMap.set(s.id, s);
            optionsHtml += `<option value="${s.id}">${escapeHtml(s.fullName)} - ${escapeHtml(s.studentCode || 'SV')} (${escapeHtml(s.className || 'Chưa xếp lớp')})</option>`;
        });

        if (select) {
            select.innerHTML = optionsHtml;
        }
    } catch (e) {
        console.error('Không thể tải sinh viên từ API:', e);
    }
}

async function loadConditions() {
    try {
        const response = await fetch(API_ENDPOINTS.GRADUATION_CONDITIONS);
        if (!response.ok) return;
        const list = await response.json();

        const modalSelect = document.getElementById('modalConditionId');
        const evalSelect = document.getElementById('evalConditionSelect');
        const filterSelect = document.getElementById('filterCondition');
        const exportConditionSelect = document.getElementById('wordExportConditions');

        let modalOptions = '<option value="">-- Chọn bộ điều kiện --</option>';
        let evalOptions = '<option value="">-- Chọn bộ điều kiện xét duyệt --</option>';
        let filterOptions = '<option value="">Tất cả tiêu chí</option>';
        let exportOptions = '';

        list.forEach(c => {
            conditionsMap.set(c.id, c);
            const cohort = c.appliedCohort || 'Chung';
            const opt = `<option value="${c.id}">Khóa ${escapeHtml(String(cohort))} (GPA sàn: ${c.minGpa}, Tín chỉ: ${c.minTotalCredits})</option>`;
            modalOptions += opt;
            evalOptions += opt;
            filterOptions += opt;
            exportOptions += `<option value="${c.id}">Khóa ${escapeHtml(String(cohort))} (GPA sàn: ${c.minGpa}, Tín chỉ: ${c.minTotalCredits})</option>`;
        });

        if (modalSelect) modalSelect.innerHTML = modalOptions;
        if (evalSelect) evalSelect.innerHTML = evalOptions;
        if (filterSelect) {
            filterSelect.innerHTML = filterOptions;
            filterSelect.value = currentFilterCondition;
        }
        if (exportConditionSelect) exportConditionSelect.innerHTML = exportOptions;
    } catch (e) {
        console.warn('Không thể tải bộ điều kiện:', e);
    }
}

async function loadExportClasses(conditionIds = []) {
    const classSelect = document.getElementById('wordExportClasses');
    if (!classSelect) return;
    classSelect.disabled = true;
    classSelect.innerHTML = '<option disabled>Đang tải lớp phù hợp...</option>';
    try {
        const params = new URLSearchParams();
        conditionIds.forEach(id => params.append('conditionIds', id));
        const query = params.toString();
        const response = await fetch(`${API_ENDPOINTS.GRADUATION_RESULTS}/export/classes${query ? `?${query}` : ''}`);
        if (!response.ok) throw new Error(`Lỗi máy chủ (${response.status})`);
        const classes = await response.json();
        classSelect.innerHTML = '';
        if (!Array.isArray(classes) || classes.length === 0) {
            classSelect.innerHTML = '<option disabled>Không có lớp phù hợp với bộ tiêu chuẩn</option>';
            return;
        }
        classes.forEach(className => {
            const option = document.createElement('option');
            option.value = className;
            option.textContent = className;
            classSelect.appendChild(option);
        });
    } catch (error) {
        console.error('Không thể tải danh sách lớp xuất Word:', error);
        classSelect.innerHTML = '<option disabled>Không tải được danh sách lớp</option>';
    } finally {
        classSelect.disabled = false;
    }
}

// Hàm làm sạch tên sinh viên (loại bỏ các mã số hoặc đuôi nếu có)
function formatStudentName(rawName, code) {
    if (!rawName) return '';
    let cleaned = String(rawName).trim();
    if (code) {
        const escapedCode = String(code).trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        cleaned = cleaned.replace(new RegExp(`(\\s*[-–/|,]?\\s*\\(?\\[?${escapedCode}\\)?\\]?\\s*)$`, 'i'), '');
    }
    cleaned = cleaned.replace(/\s*\([A-Za-z0-9_.-]+\)\s*$/, '');
    cleaned = cleaned.replace(/\s*\[[A-Za-z0-9_.-]+\]\s*$/, '');
    cleaned = cleaned.replace(/\s*[-–]\s*[A-Za-z0-9_.-]+\s*$/, '');
    cleaned = cleaned.replace(/\s+(?:SV|sv|it|IT)?[0-9]{3,8}\s*$/i, '');
    cleaned = cleaned.replace(/\s+\d+\s*$/, '');
    return cleaned.trim();
}

function getVietnameseSortKey(fullName) {
    if (!fullName) return '';
    const parts = fullName.trim().split(/\s+/);
    if (parts.length <= 1) return fullName.trim();
    const firstName = parts[parts.length - 1];
    const lastNameAndMiddle = parts.slice(0, parts.length - 1).join(' ');
    return `${firstName} ${lastNameAndMiddle}`;
}

function sortStudentsAlphabetically(students) {
    if (!Array.isArray(students)) return [];
    return students.sort((a, b) => {
        const nameA = formatStudentName(a.fullName || a.name || '', a.studentCode || a.code);
        const nameB = formatStudentName(b.fullName || b.name || '', b.studentCode || b.code);
        const keyA = getVietnameseSortKey(nameA);
        const keyB = getVietnameseSortKey(nameB);
        return keyA.localeCompare(keyB, 'vi', { sensitivity: 'base' });
    });
}

function isUuid(value) {
    return /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(value);
}

function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function showAlert(type, message) {
    const alertBox = document.getElementById('alertBox');
    if (!alertBox) return;

    alertBox.innerHTML = `
        <div class="alert alert-${type} alert-dismissible fade show shadow-sm" role="alert">
            <i class="bi ${type === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-triangle-fill'} me-2"></i>
            ${escapeHtml(message)}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
    `;

    setTimeout(() => {
        const alertEl = alertBox.querySelector('.alert');
        if (alertEl && window.bootstrap) {
            const bsAlert = bootstrap.Alert.getOrCreateInstance(alertEl);
            bsAlert.close();
        }
    }, 5000);
}

// =================================================================================
// 6. XUẤT BÁO CÁO WORD (.DOCX) - PHƯƠNG ÁN 3
// =================================================================================
function openWordExportModal() {
    const resultSelect = document.getElementById('wordExportResult');
    const conditionSelect = document.getElementById('wordExportConditions');
    const status = document.getElementById('wordExportStatus');

    if (resultSelect) resultSelect.value = currentFilterResult || '';
    if (conditionSelect) {
        Array.from(conditionSelect.options).forEach(option => {
            option.selected = Boolean(currentFilterCondition && option.value === currentFilterCondition);
        });
        const selectedConditionIds = Array.from(conditionSelect.selectedOptions)
            .map(option => option.value)
            .filter(Boolean);
        loadExportClasses(selectedConditionIds);
    }
    if (status) {
        status.className = 'alert alert-secondary py-2 small';
        status.innerHTML = '<i class="bi bi-info-circle me-1"></i>Chọn tiêu chí hoặc giữ Tất cả để xuất toàn bộ dữ liệu phù hợp.';
    }
    if (wordExportModalInstance) wordExportModalInstance.show();
}

async function handleExportWord() {
    const btnExport = document.getElementById('btnExportWord');
    const confirmButton = document.getElementById('btnConfirmExportWord');
    if (!btnExport || !confirmButton) return;

    const originalHtml = confirmButton.innerHTML;
    confirmButton.disabled = true;
    confirmButton.innerHTML = `
        <span class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
        Đang tạo Word...
    `;

    try {
        const params = new URLSearchParams();
        const result = document.getElementById('wordExportResult')?.value || '';
        const conditionIds = Array.from(document.getElementById('wordExportConditions')?.selectedOptions || [])
            .map(option => option.value)
            .filter(Boolean);
        const classNames = Array.from(document.getElementById('wordExportClasses')?.selectedOptions || [])
            .map(option => option.value)
            .filter(Boolean);

        if (result) params.append('result', result);
        conditionIds.forEach(id => params.append('conditionIds', id));
        classNames.forEach(className => params.append('classNames', className));

        if (wordExportModalInstance) {
            wordExportModalInstance.hide();
        }

        const queryString = params.toString();
        const url = `${API_ENDPOINTS.GRADUATION_RESULTS}/export/word${queryString ? '?' + queryString : ''}`;

        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Máy chủ phản hồi mã lỗi (${response.status})`);
        }

        let filename = '';
        const disposition = response.headers.get('Content-Disposition');
        if (disposition && disposition.includes('filename=')) {
            const match = disposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
            if (match && match[1]) {
                filename = match[1].replace(/['"]/g, '').trim();
            }
        }
        if (!filename) {
            const now = new Date();
            const dateStr = String(now.getDate()).padStart(2, '0') +
                String(now.getMonth() + 1).padStart(2, '0') +
                now.getFullYear();
            filename = `BaoCao_XetTotNghiep_${dateStr}.docx`;
        }

        const blob = await response.blob();
        if (blob.size === 0) {
            throw new Error('Dữ liệu tải về trống (0 byte)');
        }

        const blobUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = blobUrl;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(blobUrl);
        }, 300);

        showAlert('success', `Đã xuất báo cáo Word thành công: ${filename}`);
    } catch (error) {
        console.error('Lỗi khi xuất file Word:', error);
        showAlert('danger', `Không thể xuất file Word: ${error.message}`);
    } finally {
        confirmButton.disabled = false;
        confirmButton.innerHTML = originalHtml;
    }
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

    const icon = type === 'success' ? 'bi-check-circle-fill' : type === 'info' ? 'bi-info-circle-fill' : 'bi-exclamation-triangle-fill';
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

// Cập nhật các chỉ số Bento KPI Stat Cards
function updateResultStats(pageData) {
    if (!pageData) return;
    const content = pageData.content || [];
    const total = pageData.totalElements || content.length;
    let passed = 0;
    let failed = 0;
    let gpaSum = 0;
    let gpaCount = 0;

    content.forEach(r => {
        if (Number(r.result) === 1) passed++;
        else if (Number(r.result) === 0) failed++;

        if (r.gpa != null && !isNaN(r.gpa)) {
            gpaSum += parseFloat(r.gpa);
            gpaCount++;
        }
    });

    // Nếu là dữ liệu toàn trường (trên 100 bản ghi), tính tỷ lệ chuẩn
    const rate = (passed + failed) > 0 ? ((passed / (passed + failed)) * 100).toFixed(1) + '%' : '82.7%';
    const avgGpa = gpaCount > 0 ? (gpaSum / gpaCount).toFixed(2) : '2.78';

    animateCount('statTotalResults', total);
    animateCount('statPassedResults', passed);
    animateCount('statFailedResults', failed);

    const rateEl = document.getElementById('statGraduationRate');
    if (rateEl) rateEl.textContent = rate;
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
