// ==========================================================================
// 📅 CALENDAR WIDGET — LỊCH XÉT TỐT NGHIỆP TÍCH HỢP SỰ KIỆN 4 PHẦN (NHÓM 11)
// ==========================================================================

export let currentCalDate = new Date();
let selectedDay = null; // Ngày đang được chọn để xem chi tiết

// Danh sách sự kiện quan trọng của 4 phần theo các tháng
export const GRADUATION_EVENTS = [
    // --- Năm 2026 ---
    // Tháng 10/2026 (Tháng 9 trong JS Date: 0-indexed)
    { day: 1, month: 9, year: 2026, part: 'd', partName: 'Phần D - Đợt xét', title: 'Mở nhận hồ sơ xét tốt nghiệp Đợt 1', desc: 'Bắt đầu mở cổng trực tuyến tiếp nhận hồ sơ xét tốt nghiệp Đợt 1 năm học 2026-2027 cho sinh viên các khóa K20, K21, K22.' },
    { day: 5, month: 9, year: 2026, part: 'a', partName: 'Phần A - Tiêu chuẩn', title: 'Cập nhật khung điều kiện tốt nghiệp HK1', desc: 'Hội đồng đào tạo ban hành chuẩn đầu ra, điều kiện tín chỉ tích lũy tối thiểu và chuẩn ngoại ngữ/tin học.' },
    { day: 15, month: 9, year: 2026, part: 'c', partName: 'Phần C - Hồ sơ', title: 'Tiếp nhận minh chứng chứng chỉ đợt đầu', desc: 'Sinh viên nộp bổ sung bản sao công chứng chứng chỉ TOEIC, CNTT cơ bản và các hồ sơ miễn giảm học phần.' },
    { day: 31, month: 9, year: 2026, part: 'd', partName: 'Phần D - Đợt xét', title: 'Chốt danh sách sinh viên dự kiến', desc: 'Khoa Công nghệ Thông tin rà soát và lập danh sách sinh viên đủ điều kiện dự kiến đợt 1.' },

    // Tháng 11/2026 (Tháng 10 trong JS Date: 0-indexed)
    { day: 5, month: 10, year: 2026, part: 'a', partName: 'Phần A - Tiêu chuẩn', title: 'Rà soát đối chiếu tiêu chuẩn tín chỉ & GPA', desc: 'Hệ thống tự động quét và kiểm tra điều kiện tốt nghiệp: tối thiểu 120-135 tín chỉ, GPA ≥ 2.00, không nợ môn bắt buộc.' },
    { day: 10, month: 10, year: 2026, part: 'c', partName: 'Phần C - Hồ sơ', title: 'Tiếp nhận & đối soát hồ sơ tốt nghiệp', desc: 'Phòng Đào tạo mở tiếp nhận hồ sơ đề nghị tốt nghiệp bản giấy, đối soát tính hợp lệ của văn bằng chứng chỉ và ảnh làm bằng.' },
    { day: 12, month: 10, year: 2026, part: 'c', partName: 'Phần C - Hồ sơ', title: 'Hạn chót nộp bổ sung chứng chỉ ngoại ngữ & tin học', desc: 'Hạn cuối cùng để sinh viên nộp bổ sung chứng chỉ Tiếng Anh (TOEIC/IELTS) và Tin học (MOS/IC3) để kịp xét đợt 1.' },
    { day: 18, month: 10, year: 2026, part: 'd', partName: 'Phần D - Đợt xét', title: 'Hạn chót đợt xét tốt nghiệp Đợt 1 & Họp Hội đồng', desc: 'Đóng cổng tiếp nhận hồ sơ trực tuyến Đợt 1 năm học 2026-2027. Hội đồng xét tốt nghiệp họp thẩm định danh sách.' },
    { day: 25, month: 10, year: 2026, part: 'b', partName: 'Phần B - Kết quả', title: 'Công bố kết quả xét tốt nghiệp chính thức', desc: 'Ban hành quyết định công nhận tốt nghiệp, công bố danh sách đạt chuẩn và xếp loại tốt nghiệp (Xuất sắc, Giỏi, Khá).' },

    // Tháng 12/2026 (Tháng 11 trong JS Date)
    { day: 10, month: 11, year: 2026, part: 'b', partName: 'Phần B - Kết quả', title: 'Lễ trao bằng tốt nghiệp Đợt 1', desc: 'Tổ chức lễ bế giảng và trao bằng tốt nghiệp cử nhân, kỹ sư cho các tân cử nhân đạt chuẩn.' },

    // --- Năm 2027 ---
    // Tháng 3/2027 (Tháng 2 trong JS Date)
    { day: 1, month: 2, year: 2027, part: 'd', partName: 'Phần D - Đợt xét', title: 'Mở nhận hồ sơ xét tốt nghiệp Đợt 2', desc: 'Bắt đầu tiếp nhận hồ sơ xét tốt nghiệp học kỳ 2 năm học 2026-2027.' },
    { day: 10, month: 2, year: 2027, part: 'a', partName: 'Phần A - Tiêu chuẩn', title: 'Rà soát điều kiện tốt nghiệp HK2', desc: 'Cập nhật tiêu chuẩn cho các sinh viên làm đồ án tốt nghiệp trong học kỳ 2.' },
    { day: 20, month: 2, year: 2027, part: 'c', partName: 'Phần C - Hồ sơ', title: 'Hạn nộp hồ sơ xét Đợt 2', desc: 'Sinh viên nộp hồ sơ đăng ký tốt nghiệp bổ sung HK2.' },
    { day: 30, month: 3, year: 2027, part: 'd', partName: 'Phần D - Đợt xét', title: 'Hạn chót nộp hồ sơ xét Đợt 2', desc: 'Khóa cổng đăng ký xét tốt nghiệp Đợt 2.' },
    { day: 15, month: 4, year: 2027, part: 'b', partName: 'Phần B - Kết quả', title: 'Công bố kết quả xét Đợt 2', desc: 'Công bố danh sách tốt nghiệp Đợt 2 năm học 2026-2027.' },

    // Sự kiện neo mặc định cho các tháng khác
    { day: 5, part: 'a', partName: 'Phần A - Tiêu chuẩn', title: 'Rà soát quy chuẩn đào tạo & tín chỉ', desc: 'Kiểm tra khung chương trình và điều kiện tích lũy tín chỉ.' },
    { day: 10, part: 'c', partName: 'Phần C - Hồ sơ', title: 'Mở cổng nộp hồ sơ trực tuyến', desc: 'Tiếp nhận hồ sơ đăng ký xét tốt nghiệp của sinh viên.' },
    { day: 12, part: 'c', partName: 'Phần C - Hồ sơ', title: 'Kiểm tra hồ sơ & chứng chỉ sinh viên', desc: 'Đối soát văn bằng, chứng chỉ ngoại ngữ và tin học lưu trữ trên hệ thống.' },
    { day: 18, part: 'd', partName: 'Phần D - Đợt xét', title: 'Hạn chót nộp hồ sơ đợt xét', desc: 'Khóa tiếp nhận hồ sơ đợt xét trong tháng.' },
    { day: 25, part: 'b', partName: 'Phần B - Kết quả', title: 'Họp hội đồng công bố kết quả xét', desc: 'Hội đồng xét tốt nghiệp họp và công bố danh sách đạt chuẩn.' }
];

function getPartName(part) {
    switch (part) {
        case 'a': return 'Phần A - Tiêu chuẩn';
        case 'b': return 'Phần B - Kết quả';
        case 'c': return 'Phần C - Hồ sơ';
        case 'd': return 'Phần D - Đợt xét';
        default: return 'Sự kiện tốt nghiệp';
    }
}

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

    // Lưu map sự kiện theo ngày để gắn click handler
    const dayEventsMap = new Map();

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

        dayEventsMap.set(d, matchingEvents);

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
        const isSelectedClass = (selectedDay === d) ? ' cal-day-selected' : '';
        const titleAttr = tooltipText ? ` title="${escapeHtml(tooltipText)}"` : ' title="Nhấp để xem sự kiện ngày này"';

        daysHTML += `
            <span class="cal-day${isToday}${hasEventClass}${isSelectedClass}" data-day="${d}"${titleAttr}>
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
        <div class="cal-event-box" id="calEventBox" style="display: none;"></div>
    `;

    // Gắn sự kiện click cho từng ngày trên lịch
    container.querySelectorAll('.cal-day:not(.empty)').forEach(dayEl => {
        dayEl.addEventListener('click', () => {
            const dayNum = parseInt(dayEl.getAttribute('data-day'), 10);
            if (dayNum) {
                const events = dayEventsMap.get(dayNum) || [];
                handleCalendarDayClick(dayNum, month, year, events, container);
            }
        });
    });

    const prevBtn = container.querySelector('#calPrevBtn');
    const nextBtn = container.querySelector('#calNextBtn');
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            currentCalDate.setMonth(currentCalDate.getMonth() - 1);
            selectedDay = null;
            renderMiniCalendar(customEvents);
            animateCalendarTransition(-1);
        });
    }
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            currentCalDate.setMonth(currentCalDate.getMonth() + 1);
            selectedDay = null;
            renderMiniCalendar(customEvents);
            animateCalendarTransition(1);
        });
    }
}

function handleCalendarDayClick(day, month, year, events, container) {
    const eventBox = container.querySelector('#calEventBox');
    if (!eventBox) return;

    // Nếu nhấp lại đúng ngày đang mở -> đóng lại
    if (selectedDay === day && eventBox.style.display !== 'none') {
        eventBox.style.display = 'none';
        selectedDay = null;
        container.querySelectorAll('.cal-day').forEach(el => el.classList.remove('cal-day-selected'));
        return;
    }

    selectedDay = day;
    container.querySelectorAll('.cal-day').forEach(el => el.classList.remove('cal-day-selected'));
    const targetDayEl = container.querySelector(`.cal-day[data-day="${day}"]`);
    if (targetDayEl) targetDayEl.classList.add('cal-day-selected');

    const formattedDate = `${String(day).padStart(2, '0')}/${String(month + 1).padStart(2, '0')}/${year}`;

    if (!events || events.length === 0) {
        eventBox.innerHTML = `
            <div class="cal-event-box-header">
                <span><i class="bi bi-calendar3 me-1 text-primary"></i>Ngày ${formattedDate}</span>
                <button type="button" class="btn-close cal-event-close" style="font-size: 0.65rem;" title="Đóng"></button>
            </div>
            <div class="cal-event-empty-box">
                <i class="bi bi-calendar-x text-muted fs-5 d-block mb-1"></i>
                Không có sự kiện hoặc hạn chót nào trong ngày này.
            </div>
        `;
    } else {
        const eventsHTML = events.map(ev => {
            const part = ev.part || 'd';
            const partName = ev.partName || getPartName(part);
            return `
                <div class="cal-event-item item-part-${part}">
                    <span class="cal-event-item-badge badge-part-${part}">
                        <span class="cal-mini-dot dot-part-${part} me-1" style="display:inline-block;vertical-align:middle;"></span>${escapeHtml(partName)}
                    </span>
                    <div class="cal-event-item-title">${escapeHtml(ev.title)}</div>
                    ${ev.desc ? `<div class="cal-event-item-desc">${escapeHtml(ev.desc)}</div>` : ''}
                </div>
            `;
        }).join('');

        eventBox.innerHTML = `
            <div class="cal-event-box-header">
                <span><i class="bi bi-calendar-event-fill me-1 text-primary"></i>Sự kiện ngày ${formattedDate} (${events.length})</span>
                <button type="button" class="btn-close cal-event-close" style="font-size: 0.65rem;" title="Đóng"></button>
            </div>
            <div class="cal-events-list">
                ${eventsHTML}
            </div>
        `;
    }

    eventBox.style.display = 'block';

    const closeBtn = eventBox.querySelector('.cal-event-close');
    if (closeBtn) {
        closeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            eventBox.style.display = 'none';
            selectedDay = null;
            container.querySelectorAll('.cal-day').forEach(el => el.classList.remove('cal-day-selected'));
        });
    }

    if (window.gsap) {
        gsap.fromTo(eventBox,
            { opacity: 0, y: 8, scale: 0.96 },
            { opacity: 1, y: 0, scale: 1, duration: 0.25, ease: 'power2.out', clearProps: 'all' }
        );
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
                gsap.fromTo(btn, { scale: 0.85 }, { scale: 1, duration: 0.32, ease: 'back.out(2)' });
                const icon = btn.querySelector('i');
                if (icon) {
                    gsap.fromTo(icon, { rotation: -45 }, { rotation: 0, duration: 0.35, ease: 'power2.out' });
                }
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
            { opacity: 0.5, y: 16 },
            { opacity: 1, y: 0, duration: 0.38, ease: 'power2.out', clearProps: 'all' }
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
