// ==========================================
// VOTEASSIST — FRONTEND LOGIC v3
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
    const initializers = [
        { name: 'Theme',            fn: initTheme },
        { name: 'Mobile Menu',      fn: initMobileMenu },
        { name: 'Stepper',          fn: initStepper },
        { name: 'Scroll Animations',fn: initScrollAnimations },
        { name: 'Chatbot',          fn: initChatbot },
        { name: 'Modals',           fn: initModals }
    ];

    initializers.forEach(({ name, fn }) => {
        try { fn(); }
        catch (e) { console.error(`❌ ${name}:`, e); }
    });
});

// ── Toast Notification ───────────────────────────────────────────────────
function showToast(message, type = 'info') {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.setAttribute('aria-live', 'polite');
        container.style.cssText = 'position:fixed;bottom:1.5rem;right:1.5rem;z-index:9999;display:flex;flex-direction:column;gap:0.5rem';
        document.body.appendChild(container);
    }

    const colors = {
        success: { bg: '#dcfce7', border: '#16a34a', text: '#15803d', icon: 'fa-circle-check' },
        error:   { bg: '#fee2e2', border: '#dc2626', text: '#991b1b', icon: 'fa-circle-xmark' },
        info:    { bg: '#eff6ff', border: '#3b82f6', text: '#1d4ed8', icon: 'fa-circle-info' },
    };
    const c = colors[type] || colors.info;

    const toast = document.createElement('div');
    toast.setAttribute('role', 'alert');
    toast.style.cssText = `background:${c.bg};border:1px solid ${c.border};color:${c.text};padding:0.8rem 1.2rem;border-radius:0.6rem;box-shadow:0 4px 12px rgba(0,0,0,0.15);display:flex;align-items:center;gap:0.6rem;max-width:320px;font-size:0.9rem;font-weight:500;animation:slideInToast 0.25s ease;`;
    toast.innerHTML = `<i class="fa-solid ${c.icon}"></i><span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

// ── Field Error Helpers ───────────────────────────────────────────────────
function setFieldError(fieldId, message) {
    const el = document.getElementById(fieldId);
    if (!el) return;
    el.style.borderColor = '#dc2626';
    el.setAttribute('aria-invalid', 'true');
    let errEl = document.getElementById(`${fieldId}-error`);
    if (!errEl) {
        errEl = document.createElement('span');
        errEl.id = `${fieldId}-error`;
        errEl.style.cssText = 'color:#dc2626;font-size:0.78rem;margin-top:0.2rem;display:block';
        el.parentNode.appendChild(errEl);
    }
    errEl.textContent = message;
}

function clearFieldErrors(form) {
    form.querySelectorAll('input, select').forEach(el => {
        el.style.borderColor = '';
        el.removeAttribute('aria-invalid');
    });
    form.querySelectorAll('[id$="-error"]').forEach(el => el.remove());
}

// ── Theme Toggle ──────────────────────────────────────────────────────────
function initTheme() {
    const themeToggle = document.getElementById('themeToggle');
    if (!themeToggle) return;
    const root = document.documentElement;
    const saved = localStorage.getItem('theme');
    if (saved === 'dark') root.setAttribute('data-theme', 'dark');

    themeToggle.addEventListener('click', () => {
        const isDark = root.getAttribute('data-theme') === 'dark';
        root.setAttribute('data-theme', isDark ? '' : 'dark');
        localStorage.setItem('theme', isDark ? 'light' : 'dark');
    });
}

// ── Mobile Menu ───────────────────────────────────────────────────────────
function initMobileMenu() {
    const toggle = document.getElementById('mobileToggle');
    const navLinks = document.getElementById('navLinks');
    if (!toggle || !navLinks) return;
    toggle.addEventListener('click', () => navLinks.classList.toggle('active'));
}

// ── Stepper ───────────────────────────────────────────────────────────────
function initStepper() {
    const contentDiv = document.getElementById('stepContent');
    const nextBtn = document.getElementById('nextBtn');
    const prevBtn = document.getElementById('prevBtn');
    const stepText = document.getElementById('currentStepText');
    const progressFill = document.getElementById('progressFill');
    const indicators = document.querySelectorAll('.step-indicator');

    if (!contentDiv || !nextBtn || !prevBtn || !stepText) return;

    let currentStep = 1;
    const totalSteps = 4;

    const steps = [
        {
            title: "Register as a Voter",
            desc: "The first step is ensuring you are registered in the electoral roll. If you're 18+ and a citizen, you're eligible!",
            details: [
                { icon: "fa-id-card", text: "Fill Form 6 online or via Voter Helpline App" },
                { icon: "fa-file-invoice", text: "Keep age and address proof documents ready" },
                { icon: "fa-clock", text: "Register at least 3 weeks before election day" }
            ]
        },
        {
            title: "Verify Your Name",
            desc: "Having a Voter ID isn't enough; your name MUST be in the current Electoral Roll to vote.",
            details: [
                { icon: "fa-magnifying-glass", text: "Check status on NVSP.in or our 'Check Status' tool" },
                { icon: "fa-list-check", text: "Ensure your details (name, photo) are correct" },
                { icon: "fa-envelope", text: "Receive your Voter Information Slip (VIS) before polls" }
            ]
        },
        {
            title: "Know Your Booth",
            desc: "Your polling station is usually a school or community center near your residence.",
            details: [
                { icon: "fa-map-location-dot", text: "Find booth location on the Voter Helpline app" },
                { icon: "fa-route", text: "Plan your visit early in the day to avoid heat/lines" },
                { icon: "fa-users", text: "Check for 'Queue Status' if available in your city" }
            ]
        },
        {
            title: "Cast Your Ballot",
            desc: "Visit the booth, get your finger inked, and use the Electronic Voting Machine (EVM).",
            details: [
                { icon: "fa-fingerprint", text: "First officer checks name, second inks finger" },
                { icon: "fa-keyboard", text: "Press the blue button next to your candidate's symbol" },
                { icon: "fa-receipt", text: "Verify the slip in the VVPAT glass for 7 seconds" }
            ]
        }
    ];

    function updateUI() {
        const step = steps[currentStep - 1];
        
        // Update content with animation
        contentDiv.style.opacity = '0';
        setTimeout(() => {
            contentDiv.innerHTML = `
                <h3>${step.title}</h3>
                <p>${step.desc}</p>
                <ul class="step-details">
                    ${step.details.map(d => `
                        <li><i class="fa-solid ${d.icon}"></i> ${d.text}</li>
                    `).join('')}
                </ul>
            `;
            contentDiv.style.opacity = '1';
        }, 300);

        // Update indicators
        indicators.forEach((ind, idx) => {
            const s = idx + 1;
            ind.classList.remove('active', 'completed');
            if (s === currentStep) ind.classList.add('active');
            else if (s < currentStep) ind.classList.add('completed');
        });

        // Update progress bar
        const progress = ((currentStep - 1) / (totalSteps - 1)) * 100;
        if (progressFill) progressFill.style.width = `${progress}%`;

        // Update buttons
        stepText.textContent = currentStep;
        prevBtn.disabled = currentStep === 1;
        
        if (currentStep === totalSteps) {
            nextBtn.innerHTML = 'Got it! <i class="fa-solid fa-check"></i>';
        } else {
            nextBtn.innerHTML = 'Next Step <i class="fa-solid fa-chevron-right"></i>';
        }
    }

    nextBtn.addEventListener('click', () => {
        if (currentStep < totalSteps) {
            currentStep++;
            updateUI();
        } else {
            // Smooth scroll to next section or show success
            showToast('You are ready to vote! 🇮🇳', 'success');
            document.getElementById('timeline').scrollIntoView({ behavior: 'smooth' });
        }
    });

    prevBtn.addEventListener('click', () => {
        if (currentStep > 1) {
            currentStep--;
            updateUI();
        }
    });

    // Initial render
    updateUI();
}

// ── AI Chatbot ────────────────────────────────────────────────────────────
function initChatbot() {
    const chatForm = document.getElementById('chatForm');
    const chatInput = document.getElementById('chatInput');
    const chatMessages = document.getElementById('chatMessages');

    if (!chatForm || !chatInput || !chatMessages) return;

    chatForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const text = chatInput.value.trim();
        if (!text) return;

        appendMessage('user', text);
        chatInput.value = '';

        try {
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: text })
            });
            const resData = await res.json();
            
            if (resData.success && resData.data) {
                appendMessage('assistant', resData.data.reply, false, resData.data.source === 'fallback');
            } else {
                appendMessage('assistant', '⚠️ Sorry, I encountered an error processing your request.', true);
            }
        } catch (error) {
            appendMessage('assistant', '⚠️ Connection error. Please try again.', true);
        }
    });

    function appendMessage(role, text, isError = false, isFallback = false) {
        const msgDiv = document.createElement('div');
        msgDiv.className = `message ${role}-msg`;
        const icon = role === 'user' ? 'fa-user' : (isError ? 'fa-triangle-exclamation' : 'fa-robot');
        const fallbackText = isFallback ? '<br><small style="opacity:0.7">⚡ Fallback answer</small>' : '';
        msgDiv.innerHTML = `
            <div class="msg-avatar"><i class="fa-solid ${icon}"></i></div>
            <div class="msg-bubble" ${isError ? 'style="background:#fee2e2"' : ''}>${text}${fallbackText}</div>`;
        chatMessages.appendChild(msgDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
}

// ── Modals ────────────────────────────────────────────────────────────────
function initModals() {
    const registerForm = document.getElementById('registerForm');
    const statusForm = document.getElementById('statusForm');

    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(registerForm);
            const dataObj = Object.fromEntries(formData.entries());

            try {
                const res = await fetch('/api/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(dataObj)
                });
                const resData = await res.json();
                if (resData.success) {
                    showToast(`✅ Registered! ID: ${resData.data.voterId}`, 'success');
                    registerForm.reset();
                    document.getElementById('registerModal').classList.remove('show');
                } else {
                    showToast(resData.message || 'Registration failed', 'error');
                }
            } catch (err) {
                showToast('Connection error', 'error');
            }
        });
    }

    if (statusForm) {
        statusForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const voterId = document.getElementById('voterId').value;
            const resDiv = document.getElementById('statusResult');

            try {
                const res = await fetch('/api/status', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ voterId })
                });
                const resData = await res.json();
                if (resData.success && resData.data) {
                    const v = resData.data.voter;
                    resDiv.style.display = 'block';
                    resDiv.innerHTML = `<div style="padding:1rem;background:#dcfce7;border-radius:0.5rem;margin-top:1rem;">
                        <strong>✅ Found:</strong> ${v.fullName}<br>
                        <strong>Status:</strong> ${v.status}
                    </div>`;
                } else {
                    showToast('Voter not found', 'error');
                }
            } catch (err) {
                showToast('Connection error', 'error');
            }
        });
    }

    // Modal open/close logic
    document.querySelectorAll('[id^="btnOpen"]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const modalId = btn.id.replace('btnOpen', '').toLowerCase() + 'Modal';
            document.getElementById(modalId).classList.add('show');
        });
    });
    document.querySelectorAll('.close-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            btn.closest('.modal').classList.remove('show');
        });
    });
}

function initScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
    });
    document.querySelectorAll('.animate-on-scroll').forEach(el => observer.observe(el));
}
