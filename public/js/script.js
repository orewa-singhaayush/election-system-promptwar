// ==========================================
// ELECTION ASSISTANT LOGIC
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
    console.log("🗳️ VoteAssist: Initializing application...");
    
    // Wrap each initialization in try-catch to prevent cascading failures
    const initializers = [
        { name: 'Theme', fn: initTheme },
        { name: 'Mobile Menu', fn: initMobileMenu },
        { name: 'Stepper', fn: initStepper },
        { name: 'Scroll Animations', fn: initScrollAnimations },
        { name: 'Chatbot', fn: initChatbot },
        { name: 'Modals', fn: initModals }
    ];

    initializers.forEach(init => {
        try {
            init.fn();
            console.log(`✅ ${init.name} initialized.`);
        } catch (error) {
            console.error(`❌ Error initializing ${init.name}:`, error);
        }
    });
});

// --- THEME TOGGLE LOGIC ---
function initTheme() {
    const themeToggle = document.getElementById('themeToggle');
    if (!themeToggle) return;

    const icon = themeToggle.querySelector('i');
    const root = document.documentElement;
    
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        root.setAttribute('data-theme', 'dark');
        if (icon) {
            icon.classList.remove('fa-moon');
            icon.classList.add('fa-sun');
        }
    }

    themeToggle.addEventListener('click', () => {
        const isDark = root.getAttribute('data-theme') === 'dark';
        
        if (isDark) {
            root.removeAttribute('data-theme');
            localStorage.setItem('theme', 'light');
            if (icon) {
                icon.classList.remove('fa-sun');
                icon.classList.add('fa-moon');
            }
        } else {
            root.setAttribute('data-theme', 'dark');
            localStorage.setItem('theme', 'dark');
            if (icon) {
                icon.classList.remove('fa-moon');
                icon.classList.add('fa-sun');
            }
        }
    });
}

// --- MOBILE MENU LOGIC ---
function initMobileMenu() {
    const mobileToggle = document.getElementById('mobileToggle');
    const navLinks = document.getElementById('navLinks');

    if (!mobileToggle || !navLinks) return;

    mobileToggle.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        const icon = mobileToggle.querySelector('i');
        if (icon) {
            if (navLinks.classList.contains('active')) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-xmark');
            } else {
                icon.classList.remove('fa-xmark');
                icon.classList.add('fa-bars');
            }
        }
    });

    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
            const icon = mobileToggle.querySelector('i');
            if (icon) {
                icon.classList.remove('fa-xmark');
                icon.classList.add('fa-bars');
            }
        });
    });
}

// --- STEPPER LOGIC ---
const stepsData = [
    {
        title: "Register to Vote",
        description: "Ensure you are eligible and registered to vote in your state.",
        details: [
            "Check your voter registration status online.",
            "If not registered, register online, by mail, or in person.",
            "Be aware of registration deadlines for your state."
        ]
    },
    {
        title: "Research Candidates & Issues",
        description: "Learn about the people and policies on your ballot.",
        details: [
            "Find a sample ballot for your district.",
            "Read non-partisan voter guides.",
            "Understand the key issues being voted on."
        ]
    },
    {
        title: "Make a Plan to Vote",
        description: "Decide when, where, and how you will cast your ballot.",
        details: [
            "Find your designated polling place.",
            "Check polling hours.",
            "Decide if you will vote early, by mail, or on Election Day."
        ]
    },
    {
        title: "Cast Your Ballot",
        description: "Go to the polls or mail your ballot and make your voice heard.",
        details: [
            "Follow all instructions carefully on the ballot.",
            "If you make a mistake, ask a poll worker for a new ballot.",
            "If voting by mail, track your ballot to ensure it was received."
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

    if (!contentDiv || !nextBtn || !prevBtn) {
        console.warn("Stepper elements not found. Skipping initialization.");
        return;
    }

    function updateUI() {
        const data = stepsData[currentStep];
        if (!data) return;

        // Update Content
        contentDiv.style.opacity = 0;
        setTimeout(() => {
            let detailsHtml = data.details.map(d => `<li><i class="fa-solid fa-circle-check"></i> ${d}</li>`).join('');
            contentDiv.innerHTML = `
                <h3>${data.title}</h3>
                <p>${data.description}</p>
                <ul class="step-details">
                    ${detailsHtml}
                </ul>
            `;
            contentDiv.style.opacity = 1;
        }, 50);

        // Update Controls
        if (currentStepText) currentStepText.textContent = currentStep + 1;
        prevBtn.disabled = currentStep === 0;
        
        if (currentStep === totalSteps - 1) {
            nextBtn.innerHTML = `Finish <i class="fa-solid fa-check"></i>`;
        } else {
            nextBtn.innerHTML = `Next Step <i class="fa-solid fa-chevron-right"></i>`;
        }

        // Update Indicators
        indicators.forEach((ind, index) => {
            ind.classList.remove('active', 'completed');
            if (index < currentStep) {
                ind.classList.add('completed');
                ind.innerHTML = '<i class="fa-solid fa-check"></i>';
            } else if (index === currentStep) {
                ind.classList.add('active');
                ind.innerHTML = index + 1;
            } else {
                ind.innerHTML = index + 1;
            }
        });

        progressFills.forEach((fill, index) => {
            if (index < currentStep) {
                fill.style.width = '100%';
            } else {
                fill.style.width = '0%';
            }
        });
    }

    nextBtn.addEventListener('click', () => {
        if (currentStep < totalSteps - 1) {
            currentStep++;
            updateUI();
        }
    });

    prevBtn.addEventListener('click', () => {
        if (currentStep > 0) {
            currentStep--;
            updateUI();
        }
    });

    updateUI();
}

// --- SCROLL ANIMATIONS ---
function initScrollAnimations() {
    const animatedElements = document.querySelectorAll('.animate-on-scroll');
    if (animatedElements.length === 0) return;

    const revealAll = () => {
        animatedElements.forEach(el => el.classList.add('visible'));
    };

    if (!('IntersectionObserver' in window)) {
        revealAll();
        return;
    }

    const observerOptions = {
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    animatedElements.forEach(el => observer.observe(el));

    // FAIL-SAFE: If nothing reveals after 1 second, reveal everything
    setTimeout(revealAll, 1000);
}

// --- AI CHATBOT LOGIC ---
function initChatbot() {
    const chatForm = document.getElementById('chatForm');
    const chatInput = document.getElementById('chatInput');
    const chatMessages = document.getElementById('chatMessages');
    const sendBtn = document.getElementById('sendBtn');

    if (!chatForm || !chatInput || !chatMessages) return;

    chatForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const userText = chatInput.value.trim();
        if (!userText) return;

        appendMessage('user', userText);
        chatInput.value = '';
        chatInput.disabled = true;
        if (sendBtn) sendBtn.disabled = true;

        const loadingId = appendLoading();

        try {
            const reply = await fetchBackendResponse(userText);
            removeLoading(loadingId);
            appendMessage('assistant', reply);
        } catch (error) {
            removeLoading(loadingId);
            let errorMsg = "Sorry, I couldn't connect. Make sure the server is running.";
            appendMessage('assistant', `<i class="fa-solid fa-triangle-exclamation"></i> Error: ${errorMsg}`, true);
        } finally {
            chatInput.disabled = false;
            if (sendBtn) sendBtn.disabled = false;
            chatInput.focus();
        }
    });

    function appendMessage(role, text, isError = false) {
        const msgDiv = document.createElement('div');
        msgDiv.className = `message ${role}-msg`;
        const icon = role === 'user' ? 'fa-user' : (isError ? 'fa-triangle-exclamation' : 'fa-robot');
        const sanitizedText = text.replace(/</g, "&lt;").replace(/>/g, "&gt;");
        msgDiv.innerHTML = `
            <div class="msg-avatar"><i class="fa-solid ${icon}"></i></div>
            <div class="msg-bubble" ${isError ? 'style="background: #fee2e2; color: #991b1b;"' : ''}>${sanitizedText}</div>
        `;
        chatMessages.appendChild(msgDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function appendLoading() {
        const id = 'loading-' + Date.now();
        const msgDiv = document.createElement('div');
        msgDiv.className = `message assistant-msg`;
        msgDiv.id = id;
        msgDiv.innerHTML = `
            <div class="msg-avatar"><i class="fa-solid fa-robot"></i></div>
            <div class="msg-bubble"><i class="fa-solid fa-circle-notch fa-spin"></i> Thinking...</div>
        `;
        chatMessages.appendChild(msgDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        return id;
    }

    function removeLoading(id) {
        const el = document.getElementById(id);
        if (el) el.remove();
    }

    async function fetchBackendResponse(userText) {
        const res = await fetch('http://localhost:3000/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: userText })
        });
        if (!res.ok) throw new Error("Server error");
        const data = await res.json();
        return data.reply;
    }
}

// --- MODAL LOGIC ---
function initModals() {
    const registerModal = document.getElementById('registerModal');
    const statusModal = document.getElementById('statusModal');
    const btnOpenRegister = document.getElementById('btnOpenRegister');
    const btnOpenStatus = document.getElementById('btnOpenStatus');
    const closeRegister = document.getElementById('closeRegister');
    const closeStatus = document.getElementById('closeStatus');
    const registerForm = document.getElementById('registerForm');
    const statusForm = document.getElementById('statusForm');

    const showModal = (modal) => modal && modal.classList.add('show');
    const hideModal = (modal) => modal && modal.classList.remove('show');

    if (btnOpenRegister) btnOpenRegister.addEventListener('click', (e) => { e.preventDefault(); showModal(registerModal); });
    if (btnOpenStatus) btnOpenStatus.addEventListener('click', (e) => { e.preventDefault(); showModal(statusModal); });
    if (closeRegister) closeRegister.addEventListener('click', () => hideModal(registerModal));
    if (closeStatus) closeStatus.addEventListener('click', () => hideModal(statusModal));

    window.addEventListener('click', (e) => {
        if (e.target === registerModal) hideModal(registerModal);
        if (e.target === statusModal) hideModal(statusModal);
    });

    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = {};
            new FormData(registerForm).forEach((value, key) => formData[key] = value);
            // Fallback for direct ID access if FormData fails for some reason
            const fields = ['fullName', 'dob', 'zipCode', 'gender', 'relativeName', 'houseNo', 'street', 'village', 'postOffice', 'district', 'state', 'constituency'];
            fields.forEach(f => {
                const el = document.getElementById(f);
                if (el) formData[f] = el.value;
            });

            try {
                const res = await fetch('http://localhost:3000/api/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });
                const data = await res.json();
                if (data.success) {
                    alert('Registration Successful! ID: ' + data.voterId);
                    hideModal(registerModal);
                } else {
                    alert('Failed: ' + data.message);
                }
            } catch (err) {
                alert('Connection error.');
            }
        });
    }

    if (statusForm) {
        statusForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const voterId = document.getElementById('voterId')?.value;
            try {
                const res = await fetch('http://localhost:3000/api/status', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ voterId })
                });
                const data = await res.json();
                if (data.success) {
                    const resDiv = document.getElementById('statusResult');
                    if (resDiv) {
                        resDiv.style.display = 'block';
                        resDiv.innerHTML = `Voter Found: ${data.voter.fullName} - Status: ${data.voter.status}`;
                    }
                } else {
                    alert('Not found.');
                }
            } catch (err) {
                alert('Error.');
            }
        });
    }
}
