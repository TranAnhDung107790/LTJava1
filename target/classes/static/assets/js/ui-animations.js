/**
 * ==========================================================================
 * 🎭 UI ANIMATIONS & PASTEL TOAST NOTIFICATIONS (gsap-skill & ui-ux-pro-max)
 * Elastic Modal Physics · Pastel Toasts · SPA Page Transitions · Row Collapse
 * ==========================================================================
 */

// 1. PASTEL TOAST NOTIFICATION SYSTEM
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

    // GSAP Spring Slide-in from right
    if (window.gsap) {
        gsap.fromTo(toast,
            { x: 90, opacity: 0, scale: 0.92 },
            { x: 0, opacity: 1, scale: 1, duration: 0.35, ease: 'back.out(1.2)' }
        );
    }

    // Auto dismiss
    setTimeout(dismissToast, duration);
}

// 2. MODAL ELASTIC BOUNCE (gsap-skill back.out preset)
function initModalAnimations() {
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

// 3. SMOOTH PAGE TRANSITIONS (SPA FEELING)
function initPageTransitions() {
    // Subtle canvas reveal on page load
    if (window.gsap) {
        gsap.fromTo('.app-main',
            { opacity: 0.7, y: 8 },
            { opacity: 1, y: 0, duration: 0.28, ease: 'power1.out', clearProps: 'all' }
        );
    }

    // Intercept sidebar navigation for smooth exit
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

// 4. ANIMATE ROW REMOVAL HELPER
export function animateRowRemoval(rowEl, onComplete) {
    if (!rowEl) {
        if (onComplete) onComplete();
        return;
    }
    if (window.gsap) {
        gsap.to(rowEl, {
            x: -35,
            opacity: 0,
            duration: 0.25,
            ease: 'power2.in',
            onComplete: () => {
                rowEl.remove();
                if (onComplete) onComplete();
            }
        });
    } else {
        rowEl.remove();
        if (onComplete) onComplete();
    }
}

// Helper: Escape HTML
function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

// 5. GLOBAL ATTACHMENT & ALERT OVERRIDE
if (typeof window !== 'undefined') {
    window.showToast = showToast;
    window.animateRowRemoval = animateRowRemoval;

    // Tự động chuyển đổi toàn bộ alert() thô cứng sang Toast Pastel sang trọng
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

    document.addEventListener('DOMContentLoaded', () => {
        initModalAnimations();
        initPageTransitions();
    });
}
