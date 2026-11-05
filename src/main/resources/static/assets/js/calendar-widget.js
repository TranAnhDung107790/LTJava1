// ==========================================================================
// 📅 CALENDAR WIDGET — LỊCH XÉT TỐT NGHIỆP TÍCH HỢP SỰ KIỆN 4 PHẦN (NHÓM 11)
// ==========================================================================

export let currentCalDate = new Date();

// Danh sách sự kiện quan trọng của 4 phần theo các tháng
export const GRADUATION_EVENTS = [
    // --- Năm 2026 ---
    // Tháng 10/2026 (Tháng 9 trong JS Date: 0-indexed)
    { day: 1, month: 9, year: 2026, part: 'd', title: '[Phần D - Đợt xét] Mở nhận hồ sơ xét tốt nghiệp Đợt 1' },
    { day: 5, month: 9, year: 2026, part: 'a', title: '[Phần A - Tiêu chuẩn] Cập nhật khung điều kiện tốt nghiệp HK1' },
    { day: 15, month: 9, year: 2026, part: 'c', title: '[Phần C - Hồ sơ] Tiếp nhận minh chứng chứng chỉ đợt đầu' },
    { day: 31, month: 9, year: 2026, part: 'd', title: '[Phần D - Đợt xét] Chốt danh sách sinh viên dự kiến' },

    // Tháng 11/2026 (Tháng 10 trong JS Date: 0-indexed)
    { day: 5, month: 10, year: 2026, part: 'a', title: '[Phần A - Tiêu chuẩn] Rà soát đối chiếu tiêu chuẩn tín chỉ & GPA' },
    { day: 10, month: 10, year: 2026, part: 'c', title: '[Phần C - Hồ sơ] Hạn cuối nộp bổ sung hồ sơ đề nghị tốt nghiệp' },
    { day: 18, month: 10, year: 2026, part: 'd', title: '[Phần D - Đợt xét] Hạn chót đợt xét tốt nghiệp Đợt 1' },
    { day: 25, month: 10, year: 2026, part: 'b', title: '[Phần B - Kết quả] Công bố kết quả xét tốt nghiệp chính thức' },

    // Tháng 12/2026 (Tháng 11 trong JS Date)
    { day: 10, month: 11, year: 2026, part: 'b', title: '[Phần B - Kết quả] Lễ trao bằng tốt nghiệp Đợt 1' },

    // --- Năm 2027 ---
    // Tháng 3/2027 (Tháng 2 trong JS Date)
    { day: 1, month: 2, year: 2027, part: 'd', title: '[Phần D - Đợt xét] Mở nhận hồ sơ xét tốt nghiệp Đợt 2' },
    { day: 10, month: 2, year: 2027, part: 'a', title: '[Phần A - Tiêu chuẩn] Rà soát điều kiện tốt nghiệp HK2' },
    { day: 20, month: 2, year: 2027, part: 'c', title: '[Phần C - Hồ sơ] Hạn nộp hồ sơ xét Đợt 2' },
    { day: 30, month: 3, year: 2027, part: 'd', title: '[Phần D - Đợt xét] Hạn chót nộp hồ sơ xét Đợt 2' },
    { day: 15, month: 4, year: 2027, part: 'b', title: '[Phần B - Kết quả] Công bố kết quả xét Đợt 2' },

    // Sự kiện neo mặc định cho các tháng khác
    { day: 5, part: 'a', title: '[Phần A - Tiêu chuẩn] Rà soát quy chuẩn đào tạo & tín chỉ' },
    { day: 12, part: 'c', title: '[Phần C - Hồ sơ] Kiểm tra hồ sơ & chứng chỉ sinh viên' },
    { day: 18, part: 'd', title: '[Phần D - Đợt xét] Hạn chót nộp hồ sơ đợt xét' },
    { day: 25, part: 'b', title: '[Phần B - Kết quả] Họp hội đồng công bố kết quả xét' }
];

export function renderMiniCalendar(customEvents = []) {
    const container = document.getElementById('miniCalendar');
    if (!container) return;

    const year = currentCalDate.getFullYear();
    const month = currentCalDate.getMonth();
    const today = new Date();

    const monthNames = [
        'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
        'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
    ];
    const dayNames = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const startOffset = (firstDay === 0) ? 6 : firstDay - 1; // Bắt đầu từ Thứ 2

    const allEvents = [...GRADUATION_EVENTS, ...customEvents];

    let daysHTML = '';
    for (let i = 0; i < startOffset; i++) {
        daysHTML += '<span class="cal-day empty"></span>';
    }

    for (let d = 1; d <= daysInMonth; d++) {
        const isToday = (d === today.getDate() && month === today.getMonth() && year === today.getFullYear()) ? ' today' : '';

        // Tìm các sự kiện trong ngày
        let matchingEvents = allEvents.filter(ev => {
            if (ev.month !== undefined && ev.year !== undefined) {
                return ev.day === d && ev.month === month && ev.year === year;
            }
            return false;
        });

        // Nếu tháng không có sự kiện cụ thể, dùng sự kiện neo
        if (matchingEvents.length === 0) {
            matchingEvents = allEvents.filter(ev => ev.month === undefined && ev.day === d);
        }

        let dotsHTML = '';
        let tooltipText = '';

        if (matchingEvents.length > 0) {
            tooltipText = matchingEvents.map(e => e.title).join('\n');
            const partsSeen = new Set();
            matchingEvents.forEach(e => {
                if (!partsSeen.has(e.part)) {
                    partsSeen.add(e.part);
                    dotsHTML += `<span class="cal-mini-dot dot-part-${e.part}"></span>`;
                }
            });
        }

        const hasEventClass = matchingEvents.length > 0 ? ' has-event' : '';
        const titleAttr = tooltipText ? ` title="${escapeHtml(tooltipText)}"` : '';

        daysHTML += `
            <span class="cal-day${isToday}${hasEventClass}"${titleAttr}>
                <span class="day-num">${d}</span>
                ${dotsHTML ? `<span class="cal-day-dots">${dotsHTML}</span>` : ''}
            </span>
        `;
    }

    container.innerHTML = `
        <div class="cal-header">
            <h6><i class="bi bi-calendar3 me-1 text-primary"></i>${monthNames[month]} ${year}</h6>
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
        <div class="cal-legend mt-2 pt-2 border-top">
            <div class="d-flex flex-wrap gap-2 text-muted" style="font-size: 0.72rem;">
                <span class="d-flex align-items-center gap-1"><span class="cal-legend-dot dot-part-a"></span>A: Tiêu chuẩn</span>
                <span class="d-flex align-items-center gap-1"><span class="cal-legend-dot dot-part-b"></span>B: Kết quả</span>
                <span class="d-flex align-items-center gap-1"><span class="cal-legend-dot dot-part-c"></span>C: Hồ sơ</span>
                <span class="d-flex align-items-center gap-1"><span class="cal-legend-dot dot-part-d"></span>D: Đợt xét</span>
            </div>
        </div>
    `;

    const prevBtn = container.querySelector('#calPrevBtn');
    const nextBtn = container.querySelector('#calNextBtn');
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            currentCalDate.setMonth(currentCalDate.getMonth() - 1);
            renderMiniCalendar(customEvents);
            animateCalendarTransition(-1);
        });
    }
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            currentCalDate.setMonth(currentCalDate.getMonth() + 1);
            renderMiniCalendar(customEvents);
            animateCalendarTransition(1);
        });
    }
}

function animateCalendarTransition(direction = 1) {
    if (window.gsap) {
        gsap.from('#miniCalendar .cal-days', {
            opacity: 0.4,
            x: direction * 15,
            duration: 0.22,
            ease: 'power2.out',
            clearProps: 'all'
        });
        gsap.from('#miniCalendar .cal-day', {
            scale: 0.9,
            duration: 0.2,
            stagger: 0.004,
            ease: 'power1.out',
            clearProps: 'all'
        });
    }
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

function initSidebarToggleAnimation() {
    const toggleBtns = document.querySelectorAll('[data-lte-toggle="sidebar"]');
    toggleBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            if (window.gsap) {
                gsap.fromTo(btn, { scale: 0.86 }, { scale: 1, duration: 0.26, ease: 'back.out(2.2)' });
            }
        });
    });
}

// Tự động khởi chạy nếu có container #miniCalendar
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('miniCalendar')) {
        renderMiniCalendar();
    }
    initGlobalModalAnimations();
    initGlobalPageTransitions();
    initSidebarToggleAnimation();
});

// ==========================================================================
// 🍞 PASTEL TOAST NOTIFICATIONS & MODAL GSAP ANIMATIONS (NHÓM 11)
// Tích hợp trực tiếp vào calendar-widget.js để không tạo thêm file mới,
// tránh mọi nguy cơ xung đột khi gộp mã nguồn 12 nhóm.
// ==========================================================================

export function showToast(message, type = 'info', duration = 3200) {
    let container = document.getElementById('eduToastContainer');
    if (!container) {
        container = document.createElement('div');
        container.id = 'eduToastContainer';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    const typeClass = ['success', 'danger', 'warning', 'info'].includes(type) ? type : 'info';
    toast.className = `edu-toast edu-toast-${typeClass}`;

    let iconClass = 'bi-info-circle-fill';
    if (typeClass === 'success') iconClass = 'bi-check-circle-fill';
    else if (typeClass === 'danger') iconClass = 'bi-exclamation-triangle-fill';
    else if (typeClass === 'warning') iconClass = 'bi-exclamation-circle-fill';

    toast.innerHTML = `
        <div class="edu-toast-content">
            <i class="bi ${iconClass} edu-toast-icon"></i>
            <span>${escapeHtml(message)}</span>
        </div>
        <button type="button" class="edu-toast-close" title="Đóng">&times;</button>
    `;

    container.appendChild(toast);

    const closeBtn = toast.querySelector('.edu-toast-close');
    const dismissToast = () => {
        if (!toast.parentElement) return;
        if (window.gsap) {
            gsap.to(toast, {
                x: 80,
                opacity: 0,
                scale: 0.9,
                duration: 0.22,
                ease: 'power2.in',
                onComplete: () => toast.remove()
            });
        } else {
            toast.remove();
        }
    };

    if (closeBtn) closeBtn.addEventListener('click', dismissToast);

    if (window.gsap) {
        gsap.fromTo(toast,
            { x: 90, opacity: 0, scale: 0.92 },
            { x: 0, opacity: 1, scale: 1, duration: 0.35, ease: 'back.out(1.2)' }
        );
    }

    setTimeout(dismissToast, duration);
}

function initGlobalModalAnimations() {
    document.addEventListener('show.bs.modal', (e) => {
        const dialog = e.target.querySelector('.modal-dialog');
        if (dialog && window.gsap) {
            gsap.fromTo(dialog,
                { scale: 0.86, y: -25, opacity: 0 },
                { scale: 1, y: 0, opacity: 1, duration: 0.35, ease: 'back.out(1.4)', clearProps: 'transform,opacity' }
            );
        }
    });

    document.addEventListener('hide.bs.modal', (e) => {
        const dialog = e.target.querySelector('.modal-dialog');
        if (dialog && window.gsap) {
            gsap.to(dialog, {
                scale: 0.92,
                y: 15,
                opacity: 0,
                duration: 0.2,
                ease: 'power2.in'
            });
        }
    });
}

function initGlobalPageTransitions() {
    if (window.gsap) {
        gsap.fromTo('.app-main',
            { opacity: 0.7, y: 8 },
            { opacity: 1, y: 0, duration: 0.28, ease: 'power1.out', clearProps: 'all' }
        );
    }

    document.querySelectorAll('.app-sidebar .nav-link').forEach(link => {
        const href = link.getAttribute('href');
        if (href && href !== '#' && !href.startsWith('javascript:')) {
            link.addEventListener('click', (e) => {
                const currentFile = window.location.pathname.split('/').pop() || 'index.html';
                const targetFile = href.split('/').pop();
                if (currentFile === targetFile) return;

                e.preventDefault();
                if (window.gsap) {
                    gsap.to('.app-main', {
                        opacity: 0,
                        y: -8,
                        duration: 0.16,
                        ease: 'power2.in',
                        onComplete: () => {
                            window.location.href = href;
                        }
                    });
                } else {
                    window.location.href = href;
                }
            });
        }
    });
}

// Gắn global và chuyển alert() sang Toast Pastel
if (typeof window !== 'undefined') {
    window.showToast = showToast;
    window.alert = function(msg) {
        let type = 'info';
        const lower = String(msg).toLowerCase();
        if (lower.includes('thành công') || lower.includes('success')) {
            type = 'success';
        } else if (lower.includes('lỗi') || lower.includes('thất bại') || lower.includes('không thể') || lower.includes('error')) {
            type = 'danger';
        } else if (lower.includes('vui lòng') || lower.includes('chú ý') || lower.includes('cảnh báo')) {
            type = 'warning';
        }
        showToast(msg, type);
    };
}
