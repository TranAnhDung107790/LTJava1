import { API_ENDPOINTS } from './config.js';

// State
let currentPage = 0;
let pageSize = 10;
let currentFilterResult = '';
let currentFilterCondition = '';
const studentsMap = new Map();
const conditionsMap = new Map();

// Bootstrap Modal instances
let evaluateModalInstance = null;
let resultModalInstance = null;

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

    // Attach Event Listeners
    initEventListeners();

    // Load initial metadata (students and conditions) then load results
    await Promise.all([loadStudents(), loadConditions()]);
    loadResults();
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
        btnExportWord.addEventListener('click', handleExportWord);
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
}

// =================================================================================
// 1. TẢI DỮ LIỆU BẢNG KẾT QUẢ XÉT TỐT NGHIỆP
// =================================================================================
async function loadResults() {
    const tableBody = document.getElementById('resultsTableBody');
    tableBody.innerHTML = `
        <tr>
            <td colspan="10" class="text-center text-muted py-5">
                <div class="spinner-border spinner-border-sm text-primary me-2" role="status"></div>
                Đang tải dữ liệu kết quả...
            </td>
        </tr>
    `;

    const keyword = document.getElementById('searchKeyword')?.value.trim() || '';

    try {
        if (keyword) {
            // Xử lý tìm kiếm theo mã SV, họ tên hoặc UUID
            const kwLower = keyword.toLowerCase();
            const matchedStudentIds = [];

            for (const [sId, student] of studentsMap.entries()) {
                const sName = formatStudentName(student.fullName || student.name || '');
                if (
                    (student.studentCode && student.studentCode.toLowerCase().includes(kwLower)) ||
                    sName.toLowerCase().includes(kwLower) ||
                    (student.className && student.className.toLowerCase().includes(kwLower)) ||
                    sId.toLowerCase() === kwLower
                ) {
                    matchedStudentIds.push(sId);
                }
            }

            let searchResults = [];

            if (matchedStudentIds.length > 0) {
                // Tải kết quả của các sinh viên khớp
                const promises = matchedStudentIds.map(sId =>
                    fetch(`${API_ENDPOINTS.GRADUATION_RESULTS}/student/${sId}`)
                        .then(res => res.ok ? res.json() : [])
                        .catch(() => [])
                );
                const resultsArrays = await Promise.all(promises);
                searchResults = resultsArrays.flat();
            } else {
                // Thử tìm theo ID bản ghi nếu người dùng nhập UUID
                const isUuid = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(keyword);
                if (isUuid) {
                    const res = await fetch(`${API_ENDPOINTS.GRADUATION_RESULTS}/${keyword}`);
                    if (res.ok) {
                        const item = await res.json();
                        searchResults = [item];
                    }
                } else {
                    // Lọc theo tên sinh viên hoặc mã sinh viên trả về trong trang kết quả
                    const res = await fetch(`${API_ENDPOINTS.GRADUATION_RESULTS}?page=0&size=100&sortBy=createdAt&direction=desc`);
                    if (res.ok) {
                        const pData = await res.json();
                        searchResults = (pData.content || []).filter(r => {
                            const name = formatStudentName(r.studentName || '');
                            return name.toLowerCase().includes(kwLower) ||
                                (r.studentCode && r.studentCode.toLowerCase().includes(kwLower));
                        });
                    }
                }
            }

            // Lọc theo trạng thái nếu có chọn Đạt / Chưa đạt
            if (currentFilterResult !== '') {
                const targetRes = parseInt(currentFilterResult, 10);
                searchResults = searchResults.filter(r => Number(r.result) === targetRes);
            }
            if (currentFilterCondition) {
                searchResults = searchResults.filter(r => r.conditionId === currentFilterCondition);
            }

            const pageData = {
                content: searchResults,
                totalElements: searchResults.length,
                totalPages: 1,
                number: 0,
                size: Math.max(searchResults.length, 10)
            };

            renderResultsTable(pageData);
            renderPagination(pageData);
            return;
        }

        let url = `${API_ENDPOINTS.GRADUATION_RESULTS}?page=${currentPage}&size=${pageSize}&sortBy=createdAt&direction=desc`;
        if (currentFilterResult !== '') {
            url += `&result=${encodeURIComponent(currentFilterResult)}`;
        }
        if (currentFilterCondition) {
            url += `&conditionId=${encodeURIComponent(currentFilterCondition)}`;
        }

        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Lỗi tải dữ liệu (${response.status})`);
        }

        const data = await response.json();
        renderResultsTable(data);
        renderPagination(data);
    } catch (error) {
        console.error('Lỗi khi tải kết quả tốt nghiệp:', error);
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

function renderResultsTable(pageData) {
    const tableBody = document.getElementById('resultsTableBody');
    const items = pageData.content || [];
    const keyword = document.getElementById('searchKeyword')?.value.trim();

    // Cập nhật tổng số
    const totalBadge = document.getElementById('totalBadge');
    if (totalBadge) {
        totalBadge.textContent = `Tổng số: ${pageData.totalElements || 0}`;
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
        showAlert('success', `Đã xét duyệt tự động thành công cho ${evaluatedList.length} sinh viên${cohortText}!`);
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
    document.getElementById('resultModalLabel').innerHTML = `<i class="bi bi-plus-circle me-2"></i>Nhập kết quả tốt nghiệp thủ công`;
    document.getElementById('resultId').value = '';
    document.getElementById('resultForm').reset();
    document.getElementById('modalStudentId').disabled = false;
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

    if (resultModalInstance) {
        resultModalInstance.show();
    }
}

async function handleSaveResult(e) {
    e.preventDefault();
    const id = document.getElementById('resultId').value;
    const isEdit = Boolean(id);

    const reviewerValue = document.getElementById('modalReviewer').value.trim();
    if (reviewerValue && !isUuid(reviewerValue)) {
        alert('Người duyệt phải là UUID hợp lệ, hoặc để trống.');
        return;
    }

    const payload = {
        studentId: document.getElementById('modalStudentId').value,
        conditionId: document.getElementById('modalConditionId').value,
        gpa: parseFloat(document.getElementById('modalGpa').value),
        totalCredits: parseInt(document.getElementById('modalTotalCredits').value, 10),
        failedCredits: parseInt(document.getElementById('modalFailedCredits').value || '0', 10),
        result: parseInt(document.getElementById('modalResultStatus').value, 10),
        classification: document.getElementById('modalClassification').value ? parseInt(document.getElementById('modalClassification').value, 10) : null,
        decisionDate: document.getElementById('modalDecisionDate').value || null,
        reviewer: reviewerValue || null,
        note: document.getElementById('modalNote').value.trim() || null
    };

    const submitBtn = document.getElementById('btnSaveResult');
    submitBtn.disabled = true;

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
            const err = await response.json().catch(() => ({}));
            throw new Error(err.message || err.error || `Lỗi máy chủ (${response.status})`);
        }

        if (resultModalInstance) {
            resultModalInstance.hide();
        }

        showAlert('success', isEdit ? 'Cập nhật kết quả tốt nghiệp thành công!' : 'Đã thêm mới kết quả tốt nghiệp thành công!');
        loadResults();
    } catch (error) {
        alert(`Lỗi khi lưu kết quả: ${error.message}`);
    } finally {
        submitBtn.disabled = false;
    }
}

// =================================================================================
// 4. XÓA KẾT QUẢ
// =================================================================================
async function handleDeleteResult(id) {
    if (!confirm('Bạn có chắc chắn muốn xóa bản ghi kết quả này?')) {
        return;
    }

    try {
        const response = await fetch(`${API_ENDPOINTS.GRADUATION_RESULTS}/${id}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            throw new Error(`Lỗi xóa dữ liệu (${response.status})`);
        }

        showAlert('success', 'Đã xóa kết quả tốt nghiệp thành công!');
        loadResults();
    } catch (error) {
        alert(`Không thể xóa: ${error.message}`);
    }
}

// =================================================================================
// 5. TIỆN ÍCH TẢI DỮ LIỆU PHỤ TRỢ (STUDENTS & CONDITIONS)
// =================================================================================
async function loadStudents() {
    try {
        const response = await fetch(API_ENDPOINTS.STUDENTS);
        if (!response.ok) return;
        const list = await response.json();

        const select = document.getElementById('modalStudentId');
        let optionsHtml = '<option value="">-- Chọn sinh viên --</option>';

        list.forEach(s => {
            studentsMap.set(s.id, s);
            const cleanName = formatStudentName(s.fullName || s.name || '');
            optionsHtml += `<option value="${s.id}">${escapeHtml(s.studentCode)} - ${escapeHtml(cleanName)} (${escapeHtml(s.className || 'Chưa xếp lớp')})</option>`;
        });

        if (select) {
            select.innerHTML = optionsHtml;
        }
    } catch (e) {
        console.warn('Không thể tải sinh viên:', e);
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

        let modalOptions = '<option value="">-- Chọn bộ điều kiện --</option>';
        let evalOptions = '<option value="">-- Chọn bộ điều kiện xét duyệt --</option>';
        let filterOptions = '<option value="">Tất cả tiêu chí</option>';

        list.forEach(c => {
            conditionsMap.set(c.id, c);
            const cohort = c.appliedCohort || 'Chung';
            const opt = `<option value="${c.id}">Khóa ${escapeHtml(String(cohort))} (GPA sàn: ${c.minGpa}, Tín chỉ: ${c.minTotalCredits})</option>`;
            modalOptions += opt;
            evalOptions += opt;
            filterOptions += opt;
        });

        if (modalSelect) modalSelect.innerHTML = modalOptions;
        if (evalSelect) evalSelect.innerHTML = evalOptions;
        if (filterSelect) {
            filterSelect.innerHTML = filterOptions;
            filterSelect.value = currentFilterCondition;
        }
    } catch (e) {
        console.warn('Không thể tải bộ điều kiện:', e);
    }
}

// Hàm làm sạch tên sinh viên (loại bỏ các số ở đuôi nếu có do dữ liệu mẫu)
function formatStudentName(rawName) {
    if (!rawName) return '';
    return rawName.replace(/\s+\d+$/, '').trim();
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
async function handleExportWord() {
    const btnExport = document.getElementById('btnExportWord');
    if (!btnExport) return;

    const originalHtml = btnExport.innerHTML;
    btnExport.disabled = true;
    btnExport.innerHTML = `
        <span class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
        Đang tạo Word...
    `;

    try {
        const params = new URLSearchParams();
        if (currentFilterCondition) {
            params.append('conditionId', currentFilterCondition);
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
        btnExport.disabled = false;
        btnExport.innerHTML = originalHtml;
    }
}