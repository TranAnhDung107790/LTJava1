import { API_ENDPOINTS } from './config.js';

// Dữ liệu mẫu đã bỏ để dùng 100% dữ liệu từ Database (giống các module khác)
/*
const SEED_PROFILES = [];
*/
let profilesList = [];
const studentsMap = new Map();
const sessionsMap = new Map();
const graduatedStudentIds = new Set();
let currentSelectedStudent = null;
let filteredEligibleStudents = [];

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
    Promise.all([loadStudents(), loadSessions(), loadGraduationResults()]).then(() => {
        loadProfiles();
    });
});

function initEventListeners() {
    // 1. Filter bằng nút Segmented Pills 1 chạm trực quan
    const filterPills = document.querySelectorAll('.prof-filter-btn');
    const filterStatus = document.getElementById('filterStatus');

    filterPills.forEach(pill => {
        pill.addEventListener('click', () => {
            filterPills.forEach(p => p.classList.remove('active'));
            pill.classList.add('active');
            const val = pill.getAttribute('data-status') || '';
            if (filterStatus) filterStatus.value = val;
            loadProfiles();
        });
    });

    if (filterStatus) {
        filterStatus.addEventListener('change', () => {
            const currentVal = filterStatus.value;
            filterPills.forEach(p => {
                if ((p.getAttribute('data-status') || '') === currentVal) {
                    p.classList.add('active');
                } else {
                    p.classList.remove('active');
                }
            });
            loadProfiles();
        });
    }

    // 2. Search
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

    // 3. Refresh (Đặt lại trạng thái các nút và bộ lọc)
    const btnRefresh = document.getElementById('btnRefresh');
    if (btnRefresh) {
        btnRefresh.addEventListener('click', () => {
            if (searchKeyword) searchKeyword.value = '';
            if (filterStatus) filterStatus.value = '';
            filterPills.forEach(p => {
                if ((p.getAttribute('data-status') || '') === '') {
                    p.classList.add('active');
                } else {
                    p.classList.remove('active');
                }
            });
            loadProfiles();
        });
    }

    // 4. Open Create Modal
    const btnOpenCreateModal = document.getElementById('btnOpenCreateModal');
    if (btnOpenCreateModal) {
        btnOpenCreateModal.addEventListener('click', openCreateModal);
    }

    // 5. Nút Quyết định trong Modal Xét duyệt (Decision Selection Cards)
    document.querySelectorAll('.prof-decision-card').forEach(card => {
        card.addEventListener('click', () => {
            const val = card.getAttribute('data-val');
            setReviewDecision(val, true);
        });
    });

    // 6. Save Profile Form
    const profileForm = document.getElementById('profileForm');
    if (profileForm) {
        profileForm.addEventListener('submit', handleSaveProfile);
    }

    // 7. Submit Review Form
    const reviewForm = document.getElementById('reviewForm');
    if (reviewForm) {
        reviewForm.addEventListener('submit', handleSubmitReview);
    }

    // 8. Searchable Student Picker Event Listeners
    const searchInput = document.getElementById('studentSearchInput');
    const dropdownList = document.getElementById('studentDropdownList');
    const btnChangeStudent = document.getElementById('btnChangeStudent');
    const sessionSelect = document.getElementById('modalProfileSessionId');

    if (searchInput) {
        searchInput.addEventListener('focus', () => {
            if (dropdownList) {
                dropdownList.classList.remove('d-none');
                renderStudentDropdown(searchInput.value);
            }
        });

        searchInput.addEventListener('click', () => {
            if (dropdownList) {
                dropdownList.classList.remove('d-none');
                renderStudentDropdown(searchInput.value);
            }
        });

        searchInput.addEventListener('input', (e) => {
            if (dropdownList) dropdownList.classList.remove('d-none');
            renderStudentDropdown(e.target.value);
        });
    }

    if (btnChangeStudent) {
        btnChangeStudent.addEventListener('click', () => {
            clearStudentSelection();
            if (searchInput) {
                searchInput.focus();
            }
            if (dropdownList) {
                dropdownList.classList.remove('d-none');
                renderStudentDropdown();
            }
        });
    }

    // Đóng dropdown khi click bên ngoài container tìm kiếm sinh viên
    document.addEventListener('click', (e) => {
        const picker = document.getElementById('studentPickerContainer');
        if (dropdownList && picker && !picker.contains(e.target)) {
            dropdownList.classList.add('d-none');
        }
    });

    // Khi thay đổi đợt xét tốt nghiệp: cập nhật lại danh sách sinh viên đủ điều kiện
    if (sessionSelect) {
        sessionSelect.addEventListener('change', () => {
            updateEligibleStudents();
            const helper = document.getElementById('sessionAutoHelper');
            if (helper) {
                const bestId = findBestMatchingSessionId();
                if (sessionSelect.value === bestId && bestId) {
                    helper.classList.remove('d-none');
                } else {
                    helper.classList.add('d-none');
                }
            }
        });
    }
}

// Cập nhật số đếm trên các nút lọc trạng thái 1 chạm
function updateFilterCounts(allList) {
    if (!Array.isArray(allList)) return;
    const countAll = allList.length;
    const countPending = allList.filter(p => (p.status || '').toLowerCase() === 'pending').length;
    const countApproved = allList.filter(p => (p.status || '').toLowerCase() === 'approved').length;
    const countRejected = allList.filter(p => (p.status || '').toLowerCase() === 'rejected').length;

    const elAll = document.getElementById('countAll');
    const elPending = document.getElementById('countPending');
    const elApproved = document.getElementById('countApproved');
    const elRejected = document.getElementById('countRejected');

    if (elAll) elAll.textContent = countAll;
    if (elPending) elPending.textContent = countPending;
    if (elApproved) elApproved.textContent = countApproved;
    if (elRejected) elRejected.textContent = countRejected;
}

// Chuyển đổi trạng thái quyết định phê duyệt và đồng bộ giao diện nút
function setReviewDecision(status, autoFillTemplate = false) {
    const hiddenInput = document.getElementById('reviewStatus');
    if (hiddenInput) hiddenInput.value = status;

    document.querySelectorAll('.prof-decision-card').forEach(c => {
        if (c.getAttribute('data-val') === status) {
            c.classList.add('active');
        } else {
            c.classList.remove('active');
        }
    });

    const submitBtn = document.getElementById('btnSubmitReview');
    const noteEl = document.getElementById('reviewNote');

    if (submitBtn) {
        submitBtn.className = 'btn btn-sm fw-bold px-3 shadow-sm';
        if (status === 'Approved') {
            submitBtn.classList.add('btn-success');
            submitBtn.innerHTML = '<i class="bi bi-check-lg me-1"></i>Xác nhận chấp thuận hồ sơ';
            if (autoFillTemplate && (!noteEl.value || noteEl.value.includes('chứng chỉ') || noteEl.value.includes('Từ chối') || noteEl.value.includes('chưa đạt'))) {
                noteEl.value = 'Hồ sơ đầy đủ, đủ điều kiện công nhận tốt nghiệp.';
            }
        } else {
            submitBtn.classList.add('btn-danger');
            submitBtn.innerHTML = '<i class="bi bi-x-circle me-1"></i>Xác nhận từ chối hồ sơ';
            if (autoFillTemplate && (!noteEl.value || noteEl.value.includes('công nhận') || noteEl.value.includes('đủ điều kiện'))) {
                noteEl.value = 'Hồ sơ chưa đạt điều kiện tốt nghiệp (chưa đủ tín chỉ tích lũy hoặc thiếu chứng chỉ chuẩn đầu ra).';
            }
        }
    }
}

// Làm sạch tên sinh viên (loại bỏ mã SV/thừa) giống module kết quả tốt nghiệp
function formatStudentName(rawName, code) {
    if (!rawName) return '';
    let cleaned = String(rawName).trim();
    if (code) {
        const escapedCode = String(code).trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        cleaned = cleaned.replace(new RegExp(`(\\s*[-–/"|,]?\\s*\\(?\\[?${escapedCode}\\)?\\]?\\s*)$`, 'i'), '');
    }
    cleaned = cleaned.replace(/\s*\([A-Za-z0-9_.-]+\)\s*$/, '');
    cleaned = cleaned.replace(/\s*\[[A-Za-z0-9_.-]+\]\s*$/, '');
    cleaned = cleaned.replace(/\s*[-–"]\s*[A-Za-z0-9_.-]+\s*$/, '');
    // Giữ nguyên phần số đuôi là một phần của tên sinh viên
    return cleaned.trim();
}

// Cập nhật các thẻ KPI bento cho hồ sơ
function updateProfileStats(list) {
    if (!Array.isArray(list)) return;
    const total = list.length;
    const approved = list.filter(p => (p.status || '').toLowerCase() === 'approved').length;
    const pending = list.filter(p => (p.status || '').toLowerCase() === 'pending').length;
    const rejected = list.filter(p => (p.status || '').toLowerCase() === 'rejected').length;

    animateCount('statTotalProfiles', total);
    animateCount('statApprovedProfiles', approved);
    animateCount('statPendingProfiles', pending);
    animateCount('statRejectedProfiles', rejected);
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
            if (Array.isArray(data)) {
                profilesList = data;
                profilesList.forEach(p => {
                    if ((p.status || '').toLowerCase() === 'approved' && p.student?.id) {
                        graduatedStudentIds.add(String(p.student.id));
                    }
                });
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

    // Luôn cập nhật số lượng trên các nút lọc trạng thái và KPI bento
    updateFilterCounts(profilesList);
    updateProfileStats(profilesList);

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
        // Sinh viên (làm sạch tên sinh viên giống module kết quả)
        const student = item.student || studentsMap.get(item.student?.id);
        const rawName = student?.fullName || student?.name || item.studentName || item.studentFullName;
        const fullName = formatStudentName(rawName, student?.studentCode || item.studentCode);
        const studentCode = student?.studentCode || item.studentCode || '';
        const className = student?.className || item.className || '';
        const studentDisplay = fullName
            ? `<strong>${escapeHtml(fullName)}</strong><br/><small class="text-muted"><i class="bi bi-person-vcard me-1"></i>${escapeHtml(studentCode)} - ${escapeHtml(className)}</small>`
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

        // Nút Xét duyệt: Hồ sơ Pending nổi bật, Hồ sơ đã duyệt/từ chối được làm mờ (disabled)
        const isPending = (item.status === 'Pending');
        const isApproved = (item.status === 'Approved');
        const isRejected = (item.status === 'Rejected');

        let reviewBtnHtml = '';
        if (isPending) {
            reviewBtnHtml = `
                <button class="prof-btn-review is-pending btn-review" data-id="${item.id}" title="Xét duyệt ngay (Đang chờ duyệt)">
                    <i class="bi bi-exclamation-circle-fill"></i><span>Xét duyệt</span>
                </button>
            `;
        } else if (isApproved) {
            const dateStr = item.reviewDate ? item.reviewDate.substring(0, 10) : '';
            const titleStr = dateStr 
                ? `Hồ sơ đã được phê duyệt ngày ${dateStr}. Dùng nút Chỉnh sửa nếu cần thay đổi.` 
                : 'Hồ sơ đã được phê duyệt. Dùng nút Chỉnh sửa nếu cần thay đổi.';
            reviewBtnHtml = `
                <button class="prof-btn-review is-reviewed is-approved" disabled title="${titleStr}">
                    <i class="bi bi-check-circle-fill text-success"></i><span>Đã duyệt</span>
                </button>
            `;
        } else if (isRejected) {
            const dateStr = item.reviewDate ? item.reviewDate.substring(0, 10) : '';
            const titleStr = dateStr 
                ? `Hồ sơ đã bị từ chối ngày ${dateStr}. Dùng nút Chỉnh sửa nếu cần thay đổi.` 
                : 'Hồ sơ đã bị từ chối. Dùng nút Chỉnh sửa nếu cần thay đổi.';
            reviewBtnHtml = `
                <button class="prof-btn-review is-reviewed is-rejected" disabled title="${titleStr}">
                    <i class="bi bi-x-circle-fill text-danger"></i><span>Đã từ chối</span>
                </button>
            `;
        } else {
            reviewBtnHtml = `
                <button class="prof-btn-review btn-review" data-id="${item.id}" title="Xét duyệt hồ sơ">
                    <i class="bi bi-clipboard-check-fill"></i><span>Xét duyệt</span>
                </button>
            `;
        }

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
                    <div class="prof-btn-group">
                        ${reviewBtnHtml}
                        <div class="prof-secondary-actions">
                            <button class="prof-btn-edit btn-edit" data-id="${item.id}" title="Chỉnh sửa thông tin">
                                <i class="bi bi-pencil-fill"></i>
                            </button>
                            <button class="prof-btn-delete btn-delete" data-id="${item.id}" title="Xóa hồ sơ">
                                <i class="bi bi-trash3-fill"></i>
                            </button>
                        </div>
                    </div>
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
    const item = profilesList.find(x => String(x.id) === String(id));
    if (!item) return;

    document.getElementById('reviewProfileId').value = item.id;
    document.getElementById('reviewReviewerId').value = item.reviewerId || 'cedeed49-0178-4394-a16c-02bc11cdb15a';
    document.getElementById('reviewNote').value = item.note || '';

    const student = item.student || studentsMap.get(item.student?.id);
    const cleanedName = formatStudentName(student?.fullName || student?.name, student?.studentCode);
    const studentText = cleanedName ? `${cleanedName} (${student.studentCode})` : 'Mã: ' + item.profileCode;
    document.getElementById('reviewProfileInfo').textContent = `Mã hồ sơ: ${item.profileCode} | Sinh viên: ${studentText}`;

    // Đồng bộ trạng thái quyết định phê duyệt và nhãn nút bấm (Mặc định Approved, hoặc Rejected nếu trạng thái hiện tại là Rejected)
    const targetStatus = (item.status === 'Rejected') ? 'Rejected' : 'Approved';
    setReviewDecision(targetStatus, !item.note);

    if (reviewModalInstance) {
        reviewModalInstance.show();
    }
}

async function handleSubmitReview(e) {
    e.preventDefault();
    const id = document.getElementById('reviewProfileId').value;
    const submitBtn = document.getElementById('btnSubmitReview');

    const statusVal = document.getElementById('reviewStatus').value || 'Approved';
    let reviewerIdVal = document.getElementById('reviewReviewerId').value.trim();
    if (!reviewerIdVal) {
        reviewerIdVal = 'cedeed49-0178-4394-a16c-02bc11cdb15a';
    }
    const noteVal = document.getElementById('reviewNote').value.trim() || null;

    const payload = {
        status: statusVal,
        reviewerId: reviewerIdVal,
        note: noteVal
    };

    submitBtn.disabled = true;

    const UUID_REGEX = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
    const isRealUuid = UUID_REGEX.test(id);

    try {
        if (!isRealUuid) {
            // Xử lý hồ sơ mẫu (seed data) trong phiên làm việc hiện tại:
            // Cập nhật trực tiếp dữ liệu bộ nhớ để không gửi id phi-UUID lên Spring Boot (tránh lỗi 400 Bad Request)
            const nowStr = new Date().toISOString().substring(0, 10);
            
            const targetProfile = profilesList.find(p => String(p.id) === String(id));
            if (targetProfile) {
                targetProfile.status = payload.status;
                targetProfile.reviewDate = nowStr;
                targetProfile.reviewerId = payload.reviewerId;
                targetProfile.note = payload.note;
            }

            const targetSeed = (typeof SEED_PROFILES !== 'undefined' ? SEED_PROFILES : []).find(p => String(p.id) === String(id));
            if (targetSeed) {
                targetSeed.status = payload.status;
                targetSeed.reviewDate = nowStr;
                targetSeed.reviewerId = payload.reviewerId;
                targetSeed.note = payload.note;
            }

            if (reviewModalInstance) {
                reviewModalInstance.hide();
            }

            showAlert('success', `Đã xét duyệt thành công hồ sơ: ${payload.status === 'Approved' ? 'Chấp thuận' : 'Từ chối'}!`);
            renderTable(profilesList, true);
            return;
        }

        // Trường hợp hồ sơ thực trong cơ sở dữ liệu (UUID hợp lệ):
        const response = await fetch(`${API_ENDPOINTS.GRADUATION_PROFILES}/${id}/review`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            let errorMsg = `Lỗi cập nhật trạng thái (${response.status})`;
            try {
                const errData = await response.json();
                if (errData && (errData.message || errData.error)) {
                    errorMsg = errData.message || errData.error;
                }
            } catch (_) {}
            throw new Error(errorMsg);
        }

        const updatedData = await response.json();

        // Cập nhật lại trong danh sách hồ sơ
        const idx = profilesList.findIndex(p => String(p.id) === String(id));
        if (idx !== -1) {
            profilesList[idx] = { ...profilesList[idx], ...updatedData };
        }

        if (reviewModalInstance) {
            reviewModalInstance.hide();
        }

        showAlert('success', `Đã cập nhật trạng thái hồ sơ thành công: ${payload.status === 'Approved' ? 'Chấp thuận' : 'Từ chối'}!`);
        renderTable(profilesList, true);
    } catch (error) {
        alert(`Không thể duyệt hồ sơ: ${error.message}`);
    } finally {
        submitBtn.disabled = false;
    }
}

// =================================================================================
// 3. THÊM / SỬA HỒ SƠ & SEARCHABLE STUDENT PICKER
// =================================================================================

// Lấy chữ cái đầu làm avatar
function getInitials(name) {
    if (!name) return 'SV';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

// 1. Tự động lấy hoặc sinh mã hồ sơ theo thứ tự HS_2026_001, 002, 003... nhìn vào database
async function getNextProfileCode() {
    try {
        const response = await fetch(`${API_ENDPOINTS.GRADUATION_PROFILES}/next-code`);
        if (response.ok) {
            const data = await response.json();
            if (data && data.nextCode) {
                return data.nextCode;
            }
        }
    } catch (e) {
        console.warn('Không thể lấy mã từ API next-code, fallback sang tính cục bộ:', e);
    }

    // Fallback: Tính toán cục bộ dựa trên profilesList
    const currentYear = new Date().getFullYear();
    let maxSeq = 0;
    const regex = new RegExp(`^HS[_-]?${currentYear}[_-]?(\\d+)$`, 'i');
    profilesList.forEach(p => {
        const code = p.profileCode || '';
        const m = code.match(regex);
        if (m && m[1]) {
            const num = parseInt(m[1], 10);
            if (num > maxSeq) maxSeq = num;
        }
    });
    const nextSeq = maxSeq + 1;
    return `HS_${currentYear}_${String(nextSeq).padStart(3, '0')}`;
}

// 2. Tự động tìm đợt xét tốt nghiệp phù hợp với thời gian hiện tại
function findBestMatchingSessionId() {
    const todayStr = new Date().toISOString().substring(0, 10);
    const sessions = Array.from(sessionsMap.values());
    if (sessions.length === 0) return '';

    // Ưu tiên 1: Đợt có startDate <= today <= dueDate (đang mở nhận hồ sơ)
    const active = sessions.find(s => {
        if (s.startDate && s.dueDate) {
            return s.startDate <= todayStr && todayStr <= s.dueDate;
        }
        return false;
    });
    if (active) return active.id;

    // Ưu tiên 2: Đợt sắp diễn ra gần nhất (startDate >= today)
    const upcoming = sessions
        .filter(s => s.startDate && s.startDate >= todayStr)
        .sort((a, b) => a.startDate.localeCompare(b.startDate));
    if (upcoming.length > 0) return upcoming[0].id;

    // Ưu tiên 3: Lấy đợt đầu tiên
    return sessions[0].id;
}

// 3. Tính toán và lọc danh sách sinh viên khả dụng cho đợt xét đang chọn
function updateEligibleStudents() {
    const currentSessionId = document.getElementById('modalProfileSessionId')?.value || '';

    // Thu thập các sinh viên đã có hồ sơ trong đợt này
    const sessionSubmittedStudentIds = new Set();
    profilesList.forEach(p => {
        if (p.sessionId && String(p.sessionId) === String(currentSessionId) && p.student?.id) {
            sessionSubmittedStudentIds.add(String(p.student.id));
        }
    });

    // Thu thập các sinh viên đã được duyệt tốt nghiệp (Approved hoặc Kết quả = 1)
    const allGraduatedIds = new Set(graduatedStudentIds);
    profilesList.forEach(p => {
        if ((p.status || '').toLowerCase() === 'approved' && p.student?.id) {
            allGraduatedIds.add(String(p.student.id));
        }
    });

    // Lọc:
    // - Sinh viên đã được duyệt tốt nghiệp thì KHÔNG hiển thị lại
    // - Sinh viên đã được thêm ở đợt này rồi thì KHÔNG hiển thị lại ở đợt này nữa
    const allStudents = Array.from(studentsMap.values());
    filteredEligibleStudents = allStudents.filter(s => {
        const sId = String(s.id);
        if (allGraduatedIds.has(sId)) return false;
        if (currentSessionId && sessionSubmittedStudentIds.has(sId)) return false;
        return true;
    });

    // Nếu sinh viên đang chọn bị trùng ở đợt mới, bỏ chọn để người dùng chọn lại
    if (currentSelectedStudent) {
        const stillEligible = filteredEligibleStudents.some(s => String(s.id) === String(currentSelectedStudent.id));
        if (!stillEligible) {
            clearStudentSelection();
            showAlert('warning', 'Sinh viên vừa chọn đã có hồ sơ trong đợt xét này, vui lòng chọn sinh viên khác!');
        }
    }

    renderStudentDropdown();
}

// Render dropdown danh sách sinh viên tìm kiếm
function renderStudentDropdown(keyword = '') {
    const dropdownItems = document.getElementById('studentDropdownItems');
    const dropdownCount = document.getElementById('studentDropdownCount');
    if (!dropdownItems) return;

    const kw = (keyword || '').toLowerCase().trim();
    let displayStudents = filteredEligibleStudents;
    if (kw) {
        displayStudents = filteredEligibleStudents.filter(s => {
            const name = (s.fullName || s.name || '').toLowerCase();
            const code = (s.studentCode || '').toLowerCase();
            const cls = (s.className || '').toLowerCase();
            return name.includes(kw) || code.includes(kw) || cls.includes(kw);
        });
    }

    if (dropdownCount) {
        dropdownCount.textContent = `${displayStudents.length} sinh viên khả dụng`;
    }

    if (displayStudents.length === 0) {
        dropdownItems.innerHTML = `
            <div class="p-3 text-center text-muted small">
                <i class="bi bi-person-x fs-4 d-block mb-1 text-secondary"></i>
                ${kw ? 'Không tìm thấy sinh viên nào khớp với từ khóa tìm kiếm.' : 'Không có sinh viên nào khả dụng ở đợt này (đã nộp hoặc đã tốt nghiệp).'}
            </div>
        `;
        return;
    }

    dropdownItems.innerHTML = displayStudents.map(s => {
        const initials = getInitials(s.fullName || s.name || 'SV');
        const code = escapeHtml(s.studentCode || 'SV');
        const name = escapeHtml(s.fullName || s.name || 'Sinh viên');
        const cls = escapeHtml(s.className || 'Chưa xếp lớp');

        return `
            <div class="prof-student-item" data-id="${s.id}">
                <div class="d-flex align-items-center gap-2 overflow-hidden">
                    <div class="prof-student-avatar">${initials}</div>
                    <div class="text-truncate">
                        <div class="fw-bold text-dark small text-truncate">${name}</div>
                        <div class="text-muted" style="font-size: 0.74rem;">
                            <span class="badge bg-light text-primary border me-1 font-monospace">${code}</span>
                            <span>${cls}</span>
                        </div>
                    </div>
                </div>
                <button type="button" class="btn btn-sm btn-outline-primary py-0 px-2 fw-semibold" style="font-size: 0.72rem;">
                    Chọn
                </button>
            </div>
        `;
    }).join('');

    dropdownItems.querySelectorAll('.prof-student-item').forEach(item => {
        item.addEventListener('click', () => {
            const sId = item.getAttribute('data-id');
            const target = studentsMap.get(sId);
            if (target) {
                selectStudent(target);
            }
        });
    });
}

// Chọn một sinh viên
function selectStudent(student) {
    currentSelectedStudent = student;
    const hiddenInput = document.getElementById('modalProfileStudentId');
    if (hiddenInput) hiddenInput.value = student.id;

    const selectedCard = document.getElementById('studentSelectedCard');
    const searchWrap = document.getElementById('studentSearchWrap');
    const dropdown = document.getElementById('studentDropdownList');

    const name = student.fullName || student.name || 'Sinh viên';
    document.getElementById('selectedStudentAvatar').textContent = getInitials(name);
    document.getElementById('selectedStudentName').textContent = name;
    document.getElementById('selectedStudentCode').textContent = student.studentCode || 'SV';
    document.getElementById('selectedStudentClass').textContent = student.className || 'Chưa xếp lớp';

    if (selectedCard) selectedCard.classList.remove('d-none');
    if (searchWrap) searchWrap.classList.add('d-none');
    if (dropdown) dropdown.classList.add('d-none');
}

// Bỏ chọn sinh viên để tìm lại
function clearStudentSelection() {
    currentSelectedStudent = null;
    const hiddenInput = document.getElementById('modalProfileStudentId');
    if (hiddenInput) hiddenInput.value = '';

    const selectedCard = document.getElementById('studentSelectedCard');
    const searchWrap = document.getElementById('studentSearchWrap');
    const searchInput = document.getElementById('studentSearchInput');

    if (selectedCard) selectedCard.classList.add('d-none');
    if (searchWrap) searchWrap.classList.remove('d-none');
    if (searchInput) searchInput.value = '';
}

// MỞ MODAL NỘP HỒ SƠ TỐT NGHIỆP
async function openCreateModal() {
    document.getElementById('profileModalLabel').innerHTML = `<i class="bi bi-folder-plus me-2"></i>Nộp hồ sơ đề nghị xét tốt nghiệp`;
    document.getElementById('profileId').value = '';
    document.getElementById('profileForm').reset();

    // 1. Hiển thị Picker tạo mới, ẩn Thẻ khóa
    const pickerContainer = document.getElementById('studentPickerContainer');
    const lockedCard = document.getElementById('studentLockedCard');
    if (pickerContainer) pickerContainer.classList.remove('d-none');
    if (lockedCard) lockedCard.classList.add('d-none');
    clearStudentSelection();

    // 2. Tự động sinh mã hồ sơ nhìn vào database dạng HS_2026_001, 002, 003...
    const codeInput = document.getElementById('modalProfileCode');
    if (codeInput) {
        codeInput.value = 'Đang tạo mã...';
        codeInput.readOnly = true;
        const nextCode = await getNextProfileCode();
        codeInput.value = nextCode;
    }

    // 3. Tự động chọn đợt xét tốt nghiệp phù hợp với thời gian hiện tại
    const sessionSelect = document.getElementById('modalProfileSessionId');
    sessionSelect?.querySelectorAll('option[data-profile-session-fallback]').forEach(option => option.remove());
    const sessionHelper = document.getElementById('sessionAutoHelper');
    const bestSessionId = findBestMatchingSessionId();
    if (sessionSelect && bestSessionId) {
        sessionSelect.value = bestSessionId;
        if (sessionHelper) sessionHelper.classList.remove('d-none');
    }

    // 4. Lọc sinh viên khả dụng cho đợt xét đang chọn
    updateEligibleStudents();

    // 5. Ghi chú sinh viên mặc định hiện: 'Đang chờ hội đồng xét duyệt đợt cuối'
    const noteEl = document.getElementById('modalProfileNote');
    if (noteEl) {
        noteEl.value = 'Đang chờ hội đồng xét duyệt đợt cuối';
    }

    // 6. Trạng thái mặc định: Pending
    const statusEl = document.getElementById('modalProfileStatus');
    if (statusEl) {
        statusEl.value = 'Pending';
    }

    if (profileModalInstance) {
        profileModalInstance.show();
    }
}

// MỞ MODAL CHỈNH SỬA HỒ SƠ TỐT NGHIỆP
function openEditModal(id) {
    const item = profilesList.find(x => String(x.id) === String(id));
    if (!item) return;

    document.getElementById('profileModalLabel').innerHTML = `<i class="bi bi-pencil-square me-2"></i>Cập nhật thông tin hồ sơ`;
    document.getElementById('profileId').value = item.id;
    
    // 1. Mã hồ sơ không thể sửa
    const codeInput = document.getElementById('modalProfileCode');
    if (codeInput) {
        codeInput.value = item.profileCode || '';
        codeInput.readOnly = true;
    }

    // 2. KHÓA CỐ ĐỊNH SINH VIÊN: Không thể chỉnh sửa thành sinh viên khác, hiện rõ thông tin sinh viên
    const pickerContainer = document.getElementById('studentPickerContainer');
    const lockedCard = document.getElementById('studentLockedCard');
    if (pickerContainer) pickerContainer.classList.add('d-none');
    if (lockedCard) lockedCard.classList.remove('d-none');

    const student = item.student || studentsMap.get(item.student?.id);
    const studentName = formatStudentName(student?.fullName || student?.name, student?.studentCode) || 'Sinh viên';
    const studentCode = student?.studentCode || 'SV';
    const studentClass = student?.className || 'Chưa xếp lớp';
    const studentId = student?.id || item.student?.id || '';

    document.getElementById('lockedStudentName').textContent = studentName;
    document.getElementById('lockedStudentCode').textContent = studentCode;
    document.getElementById('lockedStudentClass').textContent = studentClass;
    document.getElementById('lockedStudentAvatar').textContent = getInitials(studentName);
    document.getElementById('modalProfileStudentId').value = studentId;

    // 3. Đợt xét và trạng thái
    const sessionSelect = document.getElementById('modalProfileSessionId');
    const sessionId = item.sessionId ? String(item.sessionId) : '';
    if (sessionSelect && sessionId && !Array.from(sessionSelect.options).some(option => option.value === sessionId)) {
        const session = sessionsMap.get(sessionId);
        const sessionLabel = session
            ? [session.sessionCode, session.sessionName].filter(Boolean).join(' - ')
            : item.sessionName || `Đợt xét hiện tại (${sessionId})`;
        const option = document.createElement('option');
        option.value = sessionId;
        option.textContent = sessionLabel;
        option.dataset.profileSessionFallback = 'true';
        sessionSelect.append(option);
    }
    if (sessionSelect) {
        sessionSelect.value = sessionId;
    }
    const sessionHelper = document.getElementById('sessionAutoHelper');
    if (sessionHelper) sessionHelper.classList.add('d-none');

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
        alert('Vui lòng chọn sinh viên nộp hồ sơ!');
        return;
    }

    const sessionId = document.getElementById('modalProfileSessionId').value || null;
    const profileCode = document.getElementById('modalProfileCode').value.trim();

    // Frontend validation khi tạo mới
    if (!isEdit) {
        // Kiểm tra nếu sinh viên đã được duyệt tốt nghiệp
        const isGraduated = graduatedStudentIds.has(String(studentId)) ||
            profilesList.some(p => String(p.student?.id) === String(studentId) && (p.status || '').toLowerCase() === 'approved');
        if (isGraduated) {
            alert('Sinh viên này đã được duyệt tốt nghiệp, không thể nộp thêm hồ sơ mới!');
            return;
        }

        // Kiểm tra nếu sinh viên đã nộp trong đợt này
        if (sessionId) {
            const alreadySubmittedInSession = profilesList.some(p => 
                String(p.student?.id) === String(studentId) && String(p.sessionId) === String(sessionId)
            );
            if (alreadySubmittedInSession) {
                alert('Sinh viên này đã nộp hồ sơ trong đợt xét tốt nghiệp này rồi!');
                return;
            }
        }
    }

    const payload = {
        profileCode: profileCode,
        student: { id: studentId },
        sessionId: sessionId,
        status: document.getElementById('modalProfileStatus').value,
        note: document.getElementById('modalProfileNote').value.trim() || null
    };

    const submitBtn = document.getElementById('btnSaveProfile');
    submitBtn.disabled = true;

    const UUID_REGEX = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

    try {
        if (isEdit && !UUID_REGEX.test(id)) {
            const target = profilesList.find(p => String(p.id) === String(id));
            if (target) {
                target.profileCode = payload.profileCode;
                target.sessionId = payload.sessionId;
                target.status = payload.status;
                target.note = payload.note;
                // Khi chỉnh sửa: không đổi sinh viên khác
            }
            const sTarget = (typeof SEED_PROFILES !== 'undefined' ? SEED_PROFILES : []).find(p => String(p.id) === String(id));
            if (sTarget) {
                sTarget.profileCode = payload.profileCode;
                sTarget.sessionId = payload.sessionId;
                sTarget.status = payload.status;
                sTarget.note = payload.note;
            }
            if (profileModalInstance) {
                profileModalInstance.hide();
            }
            showAlert('success', 'Cập nhật hồ sơ thành công!');
            renderTable(profilesList, true);
            return;
        }

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
        alert(`Lỗi khi lưu hồ sơ: ${error.message}`);
    } finally {
        submitBtn.disabled = false;
    }
}

async function handleDeleteProfile(id) {
    if (!confirm('Bạn có chắc chắn muốn xóa hồ sơ này?')) {
        return;
    }

    const UUID_REGEX = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
    if (!UUID_REGEX.test(id)) {
        profilesList = profilesList.filter(p => String(p.id) !== String(id));
        const sIdx = (typeof SEED_PROFILES !== 'undefined' ? SEED_PROFILES : []).findIndex(p => String(p.id) === String(id));
        if (sIdx !== -1 && typeof SEED_PROFILES !== 'undefined') SEED_PROFILES.splice(sIdx, 1);
        showAlert('success', 'Đã xóa hồ sơ thành công!');
        renderTable(profilesList, true);
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
    try {
        const response = await fetch(API_ENDPOINTS.STUDENTS);
        if (!response.ok) return;
        const list = await response.json();

        list.forEach(s => {
            if (s && s.fullName) {
                s.fullName = formatStudentName(s.fullName, s.studentCode);
            }
            studentsMap.set(s.id, s);
        });
    } catch (e) {
        console.warn('Không thể tải sinh viên:', e);
    }
}

async function loadSessions() {
    try {
        const response = await fetch(API_ENDPOINTS.GRADUATION_SESSIONS);
        if (!response.ok) return;
        const list = await response.json();

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
        console.warn('Không thể tải đợt xét:', e);
    }
}

async function loadGraduationResults() {
    try {
        const response = await fetch(`${API_ENDPOINTS.GRADUATION_RESULTS}?result=1&size=1000`);
        if (!response.ok) return;
        const data = await response.json();
        const list = Array.isArray(data) ? data : (data.content || []);
        list.forEach(r => {
            if (r.studentId && (r.result === 1 || String(r.result) === '1')) {
                graduatedStudentIds.add(String(r.studentId));
            }
        });
    } catch (e) {
        console.warn('Không thể tải kết quả tốt nghiệp:', e);
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
