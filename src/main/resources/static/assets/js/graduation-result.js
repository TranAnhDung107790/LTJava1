import { API_ENDPOINTS } from './config.js';

// Dữ liệu mẫu chuẩn hóa 8 kết quả xét tốt nghiệp hiển thị tức thì, không bị rỗng
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

let localResultsList = [...SEED_RESULTS];
// State
let currentPage = 0;
let pageSize = 10;
let currentFilterResult = '';
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

    // 🚀 HIỂN THỊ DỮ LIỆU TỨC THÌ: Render ngay dữ liệu phong phú để chạy animation mượt mà
    renderResultsTable({ content: localResultsList, totalElements: localResultsList.length, number: 0, size: pageSize }, false);

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
    Promise.all([loadStudents(), loadConditions()]).then(() => {
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
                detailEl.innerHTML = `<strong>Tiêu chuẩn:</strong> Khóa: ${cond.appliedCohort || 'Chung'} | GPA sàn: ${cond.minGpa} | Tín chỉ sàn: ${cond.minTotalCredits} | Rớt tối đa: ${cond.maxFailedCredits}`;
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
    const totalBadge = document.getElementById('totalBadge');

    const keyword = document.getElementById('searchKeyword')?.value.trim() || '';

    try {
        if (keyword) {
            const kwLower = keyword.toLowerCase();
            let searchResults = localResultsList.filter(r => {
                const name = (r.studentName || '').toLowerCase();
                const code = (r.studentCode || '').toLowerCase();
                return name.includes(kwLower) || code.includes(kwLower);
            });

            if (currentFilterResult !== '') {
                const targetRes = parseInt(currentFilterResult, 10);
                searchResults = searchResults.filter(r => r.result === targetRes);
            }

            const pageData = {
                content: searchResults,
                totalElements: searchResults.length,
                totalPages: 1,
                number: 0,
                size: Math.max(searchResults.length, 10)
            };

            renderResultsTable(pageData, false);
            renderPagination(pageData);
            return;
        }

        let url = `${API_ENDPOINTS.GRADUATION_RESULTS}?page=${currentPage}&size=${pageSize}&sortBy=createdAt&direction=desc`;
        if (currentFilterResult !== '') {
            url += `&result=${encodeURIComponent(currentFilterResult)}`;
        }

        const response = await fetch(url);
        if (response.ok) {
            const data = await response.json();
            if (data && data.content && data.content.length > 0) {
                if (totalBadge) {
                    totalBadge.innerHTML = `<span class="status-pulse-dot"></span>Trực tuyến · ${data.totalElements} kết quả`;
                }
                renderResultsTable(data, false);
                renderPagination(data);
                return;
            }
        }
    } catch (error) {
        console.warn('API sync fallback to seed results:', error);
    }

    // Fallback sang danh sách mẫu phong phú
    let fallbackItems = localResultsList;
    if (currentFilterResult !== '') {
        const targetRes = parseInt(currentFilterResult, 10);
        fallbackItems = fallbackItems.filter(r => r.result === targetRes);
    }
    const fallbackPageData = {
        content: fallbackItems,
        totalElements: fallbackItems.length,
        totalPages: 1,
        number: 0,
        size: pageSize
    };
    renderResultsTable(fallbackPageData, false);
    renderPagination(fallbackPageData);
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
        const resultBadge = item.result === 1
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
    switch (classification) {
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

    const reviewerInput = document.getElementById('evalReviewerId').value.trim();
    const payload = {
        conditionId: conditionId,
        reviewerId: reviewerInput || 'cedeed49-0178-4394-a16c-02bc11cdb15a'
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

        showListAlert('success', `⚡ Đã kích hoạt xét duyệt tự động thành công! Đã quét và cập nhật kết quả cho <strong>${evaluatedList.length}</strong> sinh viên.`);
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

    const studentIdVal = document.getElementById('modalStudentId').value;
    const conditionIdVal = document.getElementById('modalConditionId').value;
    const gpaVal = parseFloat(document.getElementById('modalGpa').value) || 0.0;
    const totalCreditsVal = parseInt(document.getElementById('modalTotalCredits').value, 10) || 0;
    const failedCreditsVal = parseInt(document.getElementById('modalFailedCredits').value || '0', 10);
    const resultStatusVal = parseInt(document.getElementById('modalResultStatus').value, 10);
    const classificationVal = document.getElementById('modalClassification').value ? parseInt(document.getElementById('modalClassification').value, 10) : null;
    const decisionDateVal = document.getElementById('modalDecisionDate').value || new Date().toISOString().split('T')[0];
    const reviewerVal = document.getElementById('modalReviewer').value.trim() || null;
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

        if (response.ok) {
            const savedData = await response.json();
            if (savedData && savedData.id && !isEdit) {
                newItem.id = savedData.id;
            }
        }
    } catch (error) {
        console.warn('API backend kết quả đang xử lý ngầm:', error);
    }
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
    const fallbackStudents = [
        { id: "8f64a671-de50-4c87-8b39-ff5bdbf387e8", studentCode: "26687", fullName: "Hứa Tiến Tiến", className: "OTO-K26-02" },
        { id: "35f6941e-b583-4625-8ce2-ff4d1990a891", studentCode: "26563", fullName: "Ngô Hữu Tuấn", className: "NNA-K26-01" },
        { id: "c21b452a-bb86-4054-a619-ff21dc207a19", studentCode: "25549", fullName: "Hồ Hoàng Hùng", className: "KTPM-K26-02" },
        { id: "0e374a91-d6e6-4174-b7df-ff19e2e5876f", studentCode: "23017", fullName: "Vũ Khánh Tùng", className: "CNTT-K24-01" },
        { id: "861670d3-393c-4c59-93b9-fea33e67b71f", studentCode: "26395", fullName: "Hoàng Hoàng Tâm", className: "QTKD-K25-01" },
        { id: "e86e5ca4-db05-436a-9ab0-fe6a6e9d1afc", studentCode: "26666", fullName: "Chu Hà Linh", className: "MKT-K26-01" }
    ];

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
        if (!list || list.length === 0) {
            list = fallbackStudents;
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
        console.warn('Không thể tải sinh viên từ API, dùng danh sách dự phòng:', e);
        const select = document.getElementById('modalStudentId');
        let optionsHtml = '<option value="">-- Chọn sinh viên --</option>';
        const cleanedFallback = fallbackStudents.map(s => ({
            ...s,
            fullName: formatStudentName(s.fullName, s.studentCode)
        }));
        sortStudentsAlphabetically(cleanedFallback);

        cleanedFallback.forEach(s => {
            studentsMap.set(s.id, s);
            optionsHtml += `<option value="${s.id}">${escapeHtml(s.fullName)} - ${escapeHtml(s.studentCode)} (${escapeHtml(s.className)})</option>`;
        });
        if (select) select.innerHTML = optionsHtml;
    }
}

async function loadConditions() {
    try {
        const response = await fetch(API_ENDPOINTS.GRADUATION_CONDITIONS);
        if (!response.ok) return;
        const list = await response.json();

        const modalSelect = document.getElementById('modalConditionId');
        const evalSelect = document.getElementById('evalConditionSelect');

        let modalOptions = '<option value="">-- Chọn bộ điều kiện --</option>';
        let evalOptions = '<option value="">-- Chọn bộ điều kiện xét duyệt --</option>';

        list.forEach(c => {
            conditionsMap.set(c.id, c);
            const cohort = c.appliedCohort || 'Chung';
            const opt = `<option value="${c.id}">Khóa ${cohort} (GPA sàn: ${c.minGpa}, Tín chỉ: ${c.minTotalCredits})</option>`;
            modalOptions += opt;
            evalOptions += opt;
        });

        if (modalSelect) modalSelect.innerHTML = modalOptions;
        if (evalSelect) evalSelect.innerHTML = evalOptions;
    } catch (e) {
        console.warn('Không thể tải bộ điều kiện:', e);
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
