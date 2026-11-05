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
            animateCalendarTransition();
        });
    }
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            currentCalDate.setMonth(currentCalDate.getMonth() + 1);
            renderMiniCalendar(customEvents);
            animateCalendarTransition();
        });
    }
}

function animateCalendarTransition() {
    if (window.gsap) {
        gsap.from('#miniCalendar .cal-days span', {
            opacity: 0,
            scale: 0.85,
            duration: 0.2,
            stagger: 0.005,
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

// Tự động khởi chạy nếu có container #miniCalendar
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('miniCalendar')) {
        renderMiniCalendar();
    }
});
