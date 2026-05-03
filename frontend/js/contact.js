document.addEventListener('DOMContentLoaded', function() {
    initFAQAccordion();
    initContactForm();
    setCurrentYear();
});

function initFAQAccordion() {
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        
        question.addEventListener('click', () => {
            faqItems.forEach(otherItem => {
                if (otherItem !== item && otherItem.classList.contains('active')) {
                    otherItem.classList.remove('active');
                }
            });
            item.classList.toggle('active');
        });
    });
}

function initContactForm() {
    const contactForm = document.getElementById('contact-form');
    if (!contactForm) return;

    contactForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        const name    = document.getElementById('name').value.trim();
        const email   = document.getElementById('email').value.trim();
        const subject = document.getElementById('subject').value;
        const message = document.getElementById('message').value.trim();

        // Client-side validation (unchanged)
        if (!name || !email || !subject || !message) {
            showToast('Please fill in all required fields.', 'error');
            return;
        }
        if (!isValidEmail(email)) {
            showToast('Please enter a valid email address.', 'error');
            return;
        }

        // Disable button + show loading state
        const submitBtn = contactForm.querySelector('button[type="submit"]');
        const originalText = submitBtn ? submitBtn.innerHTML : null;
        if (submitBtn) {
            submitBtn.disabled  = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending…';
        }

        try {
            const res = await fetch('http://localhost:5000/api/contact', {
                method:  'POST',
                headers: { 'Content-Type': 'application/json' },
                body:    JSON.stringify({ name, email, subject, message })
            });

            const data = await res.json();

            if (res.ok) {
                showToast(data.message || 'Message sent! We\'ll respond within 24 hours.', 'success');
                setTimeout(() => contactForm.reset(), 2000);
            } else {
                showToast(data.message || 'Failed to send message. Please try again.', 'error');
            }
        } catch (err) {
            console.error('Contact form error:', err);
            showToast('Could not reach the server. Please try again later.', 'error');
        } finally {
            if (submitBtn && originalText) {
                submitBtn.disabled  = false;
                submitBtn.innerHTML = originalText;
            }
        }
    });
}

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    if (!toast) return;

    toast.querySelector('span').textContent = message;
    toast.style.background = type === 'error'
        ? 'linear-gradient(135deg, #ff6b6b, #ff4757)'
        : 'linear-gradient(135deg, #8a67ff, #6b46e5)';

    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 5000);
}

function setCurrentYear() {
    const currentYear = new Date().getFullYear();
    document.querySelectorAll('.current-year').forEach(el => {
        el.textContent = currentYear;
    });
}

function initNavbar() {
    const hamburger = document.getElementById('hamburger');
    const navMenu   = document.querySelector('.nav-menu');
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            hamburger.classList.toggle('active');
        });
    }
}

initNavbar();