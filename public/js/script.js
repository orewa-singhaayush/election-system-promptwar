// ==========================================
// VOTEASSIST — FRONTEND LOGIC v2
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

// ── Toast Notification (replaces all alert()) ─────────────────────────────
function showToast(message, type = 'info') {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.setAttribute('aria-live', 'polite');
        container.setAttribute('aria-atomic', 'true');
        Object.assign(container.style, {
            position: 'fixed', bottom: '1.5rem', right: '1.5rem',
            zIndex: '9999', display: 'flex', flexDirection: 'column', gap: '0.5rem'
        });
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
    Object.assign(toast.style, {
        background: c.bg, border: `1px solid ${c.border}`, color: c.text,
        padding: '0.8rem 1.2rem', borderRadius: '0.6rem',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        display: 'flex', alignItems: 'center', gap: '0.6rem',
        maxWidth: '320px', fontSize: '0.9rem', fontWeight: '500',
        animation: 'slideInToast 0.25s ease', opacity: '1',
        transition: 'opacity 0.3s ease'
    });
    toast.innerHTML = `<i class="fa-solid ${c.icon}" style="flex-shrink:0"></i><span>${message}</span>`;
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
        errEl.setAttribute('aria-live', 'polite');
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
    const icon = themeToggle.querySelector('i');
    const root = document.documentElement;

    const saved = localStorage.getItem('theme');
    if (saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        root.setAttribute('data-theme', 'dark');
        icon?.classList.replace('fa-moon', 'fa-sun');
    }

    themeToggle.addEventListener('click', () => {
        const isDark = root.getAttribute('data-theme') === 'dark';
        if (isDark) {
            root.removeAttribute('data-theme');
            localStorage.setItem('theme', 'light');
            icon?.classList.replace('fa-sun', 'fa-moon');
        } else {
            root.setAttribute('data-theme', 'dark');
            localStorage.setItem('theme', 'dark');
            icon?.classList.replace('fa-moon', 'fa-sun');
        }
    });
}

// ── Mobile Menu ───────────────────────────────────────────────────────────
function initMobileMenu() {
    const toggle = document.getElementById('mobileToggle');
    const navLinks = document.getElementById('navLinks');
    if (!toggle || !navLinks) return;

    const updateIcon = (open) => {
        const icon = toggle.querySelector('i');
        icon?.classList.replace(open ? 'fa-bars' : 'fa-xmark', open ? 'fa-xmark' : 'fa-bars');
        toggle.setAttribute('aria-expanded', String(open));
    };

    toggle.addEventListener('click', () => {
        const isOpen = navLinks.classList.toggle('active');
        updateIcon(isOpen);
    });

    // Keyboard: Enter/Space activates toggle
    toggle.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle.click(); }
    });

    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
            updateIcon(false);
        });
    });
}

// ── Stepper ───────────────────────────────────────────────────────────────
const stepsData = [
    {
        title: 'Register to Vote',
        description: 'Ensure you are eligible and registered to vote in your state.',
        details: [
            'Check your voter registration status online.',
            'If not registered, register online, by mail, or in person.',
            'Be aware of registration deadlines for your state.'
        ]
    },
    {
        title: 'Research Candidates & Issues',
        description: 'Learn about the people and policies on your ballot.',
        details: [
            'Find a sample ballot for your district.',
            'Read non-partisan voter guides.',
            'Understand the key issues being voted on.'
        ]
    },
    {
        title: 'Make a Plan to Vote',
        description: 'Decide when, where, and how you will cast your ballot.',
        details: [
            'Find your designated polling place.',
            'Check polling hours.',
            'Decide if you will vote early, by mail, or on Election Day.'
        ]
    },
    {
        title: 'Cast Your Ballot',
        description: 'Go to the polls or mail your ballot and make your voice heard.',
        details: [
            'Follow all instructions carefully on the ballot.',
            'If you make a mistake, ask a poll worker for a new ballot.',
            'If voting by mail, track your ballot to ensure it was received.'
        ]
    }
];

function initStepper() {
    let currentStep = 0;
    const totalSteps = stepsData.length;
    const contentDiv = document.getElementById('stepContent');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const currentStepText = document.getElementById('currentStepText');
    const indicators = document.querySelectorAll('.step-indicator');
    const progressFills = document.querySelectorAll('.progress-fill');

    if (!contentDiv || !nextBtn || !prevBtn) return;

    function updateUI() {
        const data = stepsData[currentStep];
        if (!data) return;

        contentDiv.style.opacity = 0;
        setTimeout(() => {
            const detailsHtml = data.details.map(d =>
                `<li><i class="fa-solid fa-circle-check"></i> ${d}</li>`
            ).join('');
            contentDiv.innerHTML = `<h3>${data.title}</h3><p>${data.description}</p>
                <ul class="step-details">${detailsHtml}</ul>`;
            contentDiv.style.opacity = 1;
        }, 50);

        if (currentStepText) currentStepText.textContent = currentStep + 1;
        prevBtn.disabled = currentStep === 0;
        nextBtn.innerHTML = currentStep === totalSteps - 1
            ? `Finish <i class="fa-solid fa-check"></i>`
            : `Next Step <i class="fa-solid fa-chevron-right"></i>`;

        indicators.forEach((ind, i) => {
            ind.classList.remove('active', 'completed');
            if (i < currentStep) { ind.classList.add('completed'); ind.innerHTML = '<i class="fa-solid fa-check"></i>'; }
            else if (i === currentStep) { ind.classList.add('active'); ind.innerHTML = i + 1; }
            else { ind.innerHTML = i + 1; }
        });

        progressFills.forEach((fill, i) => {
            fill.style.width = i < currentStep ? '100%' : '0%';
        });
    }

    nextBtn.addEventListener('click', () => { if (currentStep < totalSteps - 1) { currentStep++; updateUI(); } });
    prevBtn.addEventListener('click', () => { if (currentStep > 0) { currentStep--; updateUI(); } });
    updateUI();
}

// ── Scroll Animations ─────────────────────────────────────────────────────
function initScrollAnimations() {
    const els = document.querySelectorAll('.animate-on-scroll');
    if (!els.length) return;
    const revealAll = () => els.forEach(el => el.classList.add('visible'));
    if (!('IntersectionObserver' in window)) { revealAll(); return; }
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); observer.unobserve(e.target); } });
    }, { threshold: 0.1 });
    els.forEach(el => observer.observe(el));
    setTimeout(revealAll, 1000);
}

// ── AI Chatbot ────────────────────────────────────────────────────────────
function initChatbot() {
    const chatForm = document.getElementById('chatForm');
    const chatInput = document.getElementById('chatInput');
    const chatMessages = document.getElementById('chatMessages');
    const sendBtn = document.getElementById('sendBtn');
    const MAX_LENGTH = 500;

    if (!chatForm || !chatInput || !chatMessages) return;

    // Character counter
    const counter = document.createElement('div');
    counter.style.cssText = 'font-size:0.75rem;color:#94a3b8;text-align:right;margin-top:0.2rem;';
    counter.setAttribute('aria-live', 'polite');
    chatInput.parentNode.insertBefore(counter, chatInput.nextSibling);

    chatInput.addEventListener('input', () => {
        const len = chatInput.value.length;
        counter.textContent = `${len}/${MAX_LENGTH}`;
        counter.style.color = len > MAX_LENGTH ? '#dc2626' : '#94a3b8';
    });

    chatForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const userText = chatInput.value.trim();
        if (!userText) return;

        if (userText.length > MAX_LENGTH) {
            showToast(`Message too long (max ${MAX_LENGTH} chars).`, 'error');
            return;
        }

        appendMessage('user', userText);
        chatInput.value = '';
        counter.textContent = '';
        setLoading(true);

        try {
            const reply = await fetchBackendResponse(userText);
            appendMessage('assistant', reply.text, reply.isFallback);
        } catch (error) {
            // fetchBackendResponse only throws on genuine network failure (no response at all)
            appendMessage('assistant', '⚠️ Network error — please check your connection and try again.', true);
        } finally {
            setLoading(false);
            chatInput.focus();
        }
    });

    // Keyboard: Ctrl+Enter submits
    chatInput.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') chatForm.requestSubmit();
    });

    function setLoading(isLoading) {
        chatInput.disabled = isLoading;
        if (sendBtn) {
            sendBtn.disabled = isLoading;
            sendBtn.innerHTML = isLoading
                ? '<i class="fa-solid fa-circle-notch fa-spin"></i>'
                : '<i class="fa-solid fa-paper-plane"></i>';
        }
    }

    function appendMessage(role, text, isError = false, isFallback = false) {
        const msgDiv = document.createElement('div');
        msgDiv.className = `message ${role}-msg`;
        msgDiv.setAttribute('role', role === 'assistant' ? 'status' : 'none');
        const icon = role === 'user' ? 'fa-user' : (isError ? 'fa-triangle-exclamation' : 'fa-robot');
        const safe = text.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/\n/g,'<br>');
        const fallbackTag = isFallback
            ? `<div style="font-size:0.7rem;color:#94a3b8;margin-top:0.4rem;font-style:italic;">⚡ Quick answer (AI unavailable)</div>`
            : '';
        msgDiv.innerHTML = `
            <div class="msg-avatar"><i class="fa-solid ${icon}" aria-hidden="true"></i></div>
            <div class="msg-bubble" ${isError ? 'style="background:#fee2e2;color:#991b1b;"' : ''}>${safe}${fallbackTag}</div>`;
        chatMessages.appendChild(msgDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    async function fetchBackendResponse(userText) {
        const res = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: userText })
        });

        // Parse JSON regardless of status code
        const data = await res.json().catch(() => null);

        // If the server returned a reply (even a fallback), use it — never error
        if (data && data.reply) {
            return { text: data.reply, isFallback: data.source === 'fallback' };
        }

        // Only throw on genuine failure (no reply field at all)
        throw new Error(data?.error || 'No response from server');
    }
}

// ── Modals ────────────────────────────────────────────────────────────────
function initModals() {
    const registerModal = document.getElementById('registerModal');
    const statusModal   = document.getElementById('statusModal');
    const btnOpenRegister = document.getElementById('btnOpenRegister');
    const btnOpenStatus   = document.getElementById('btnOpenStatus');
    const closeRegister   = document.getElementById('closeRegister');
    const closeStatus     = document.getElementById('closeStatus');
    const registerForm    = document.getElementById('registerForm');
    const statusForm      = document.getElementById('statusForm');

    const showModal = (modal) => {
        if (!modal) return;
        modal.classList.add('show');
        // Focus first input for accessibility
        setTimeout(() => modal.querySelector('input, select, button')?.focus(), 100);
    };
    const hideModal = (modal) => {
        if (!modal) return;
        modal.classList.remove('show');
        const form = modal.querySelector('form');
        if (form) { form.reset(); clearFieldErrors(form); }
        // Clear any result divs
        modal.querySelectorAll('.form-result').forEach(el => { el.style.display = 'none'; el.innerHTML = ''; });
    };

    // Keyboard: Escape closes modal
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            hideModal(registerModal);
            hideModal(statusModal);
        }
    });

    if (btnOpenRegister) btnOpenRegister.addEventListener('click', (e) => { e.preventDefault(); showModal(registerModal); });
    if (btnOpenStatus)   btnOpenStatus.addEventListener('click', (e) => { e.preventDefault(); showModal(statusModal); });
    if (closeRegister)   closeRegister.addEventListener('click', () => hideModal(registerModal));
    if (closeStatus)     closeStatus.addEventListener('click', () => hideModal(statusModal));

    window.addEventListener('click', (e) => {
        if (e.target === registerModal) hideModal(registerModal);
        if (e.target === statusModal)   hideModal(statusModal);
    });

    // ── Registration Form ─────────────────────────────────────────────────
    if (registerForm) {
        const submitBtn = registerForm.querySelector('[type="submit"]');

        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            clearFieldErrors(registerForm);

            const fields = ['fullName','dob','zipCode','gender','relativeName','houseNo','street','village','postOffice','district','state','constituency'];
            const formData = {};
            fields.forEach(f => {
                const el = document.getElementById(f);
                if (el) formData[f] = el.value;
            });

            // Client-side quick validation
            if (!formData.fullName?.trim()) { setFieldError('fullName', 'Full name is required'); return; }
            if (!formData.dob)             { setFieldError('dob', 'Date of birth is required'); return; }
            if (!/^\d{6}$/.test(formData.zipCode)) { setFieldError('zipCode', 'Enter a valid 6-digit PIN code'); return; }

            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.textContent = 'Registering...';
            }

            try {
                const res = await fetch('/api/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });
                const data = await res.json();

                if (data.success) {
                    showToast(`✅ Registered! Your Voter ID: ${data.voterId}`, 'success');
                    registerForm.reset();
                    hideModal(registerModal);
                } else {
                    const msg = data.message || (data.errors?.[0]?.msg) || 'Registration failed';
                    showToast(msg, 'error');
                    if (data.errors) {
                        data.errors.forEach(err => {
                            if (err.path) setFieldError(err.path, err.msg);
                        });
                    }
                }
            } catch {
                showToast('Connection error. Check your network.', 'error');
            } finally {
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'Complete Registration';
                }
            }
        });
    }

    // ── Status Form ───────────────────────────────────────────────────────
    if (statusForm) {
        const resDiv = document.getElementById('statusResult');
        const submitBtn = statusForm.querySelector('[type="submit"]');

        statusForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            clearFieldErrors(statusForm);

            const voterId   = document.getElementById('voterId')?.value?.trim();
            const fullName  = document.getElementById('statusName')?.value?.trim();
            const zipCode   = document.getElementById('statusZip')?.value?.trim();

            if (!voterId && !(fullName && zipCode)) {
                showToast('Enter a Voter ID or both Name and PIN Code.', 'error');
                return;
            }

            if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Checking...'; }

            try {
                const res = await fetch('/api/status', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ voterId, fullName, zipCode })
                });
                const data = await res.json();

                if (data.success && resDiv) {
                    const v = data.voter;
                    resDiv.style.display = 'block';
                    resDiv.innerHTML = `
                        <div style="background:#dcfce7;border:1px solid #16a34a;border-radius:0.6rem;padding:1rem;margin-top:1rem;">
                            <p><strong>✅ Voter Found</strong></p>
                            <p><b>Name:</b> ${v.fullName}</p>
                            <p><b>Voter ID:</b> ${v.voterId}</p>
                            <p><b>Status:</b> <span style="color:#16a34a;font-weight:600">${v.status}</span></p>
                            <p><b>Constituency:</b> ${v.constituency || '—'}</p>
                        </div>`;
                } else {
                    if (resDiv) resDiv.style.display = 'none';
                    showToast('Voter not found. Check your details.', 'error');
                }
            } catch {
                showToast('Connection error. Check your network.', 'error');
            } finally {
                if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Check Status'; }
            }
        });
    }
}
