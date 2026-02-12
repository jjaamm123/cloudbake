const loginForm = document.getElementById('loginForm');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const togglePassword = document.getElementById('togglePassword');
const loginBtn = document.querySelector('.btn-login');
const btnSpinner = document.querySelector('.btn-spinner');
const loginModal = document.getElementById('loginModal');
const userNameSpan = document.getElementById('userName');
const goHomeBtn = document.getElementById('goHomeBtn');
const toast = document.getElementById('toast');

// API Configuration
const API_BASE_URL = 'http://localhost:5000/api';
const AUTH_ENDPOINTS = {
    LOGIN: `${API_BASE_URL}/auth/login`,
    REGISTER: `${API_BASE_URL}/auth/register`,
    FORGOT_PASSWORD: `${API_BASE_URL}/auth/forgot-password`
};

// Storage keys
const STORAGE_KEYS = {
    TOKEN: 'cloudbakes_token',
    USER: 'cloudbakes_user',
    REMEMBERED_EMAIL: 'rememberedEmail',
    REDIRECT_URL: 'redirectAfterLogin'
};

// Toggle password visibility
togglePassword.addEventListener('click', function () {
    const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
    passwordInput.setAttribute('type', type);
    this.classList.toggle('fa-eye');
    this.classList.toggle('fa-eye-slash');
});

// Form validation
function validateForm() {
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();
    let isValid = true;

    // Reset borders
    emailInput.style.borderColor = '#e0e0e0';
    passwordInput.style.borderColor = '#e0e0e0';

    // Email validation
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        emailInput.style.borderColor = '#ff4757';
        isValid = false;
        showToast('Please enter a valid email address', 'error');
    }

    // Password validation
    if (!password || password.length < 6) {
        passwordInput.style.borderColor = '#ff4757';
        isValid = false;
        showToast('Password must be at least 6 characters', 'error');
    }

    return isValid;
}

// Toast notification system
function showToast(message, type = 'success') {
    toast.textContent = message;
    toast.className = 'toast show';

    if (type === 'error') {
        toast.style.background = '#ff4757';
    } else if (type === 'warning') {
        toast.style.background = '#ffa502';
    } else {
        toast.style.background = '#4CAF50';
    }

    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Show login success modal
function showLoginSuccess(user) {
    userNameSpan.textContent = user.name;
    document.querySelector('.points').textContent = user.points || 0;

    loginModal.style.display = 'flex';

    // Auto-redirect after 3 seconds
    setTimeout(() => {
        redirectAfterLogin();
    }, 3000);
}

// Handle redirection after login
function redirectAfterLogin() {
    // Check if there's a redirect URL stored (from protected pages)
    const redirectUrl = localStorage.getItem(STORAGE_KEYS.REDIRECT_URL);

    if (redirectUrl) {
        // Clear the redirect URL
        localStorage.removeItem(STORAGE_KEYS.REDIRECT_URL);
        // Redirect to the intended page
        window.location.href = redirectUrl;
    } else {
        // Default redirect to homepage
        window.location.href = 'index.html';
    }
}

// Save user session
function saveUserSession(userData, rememberMe = false) {
    localStorage.setItem(STORAGE_KEYS.TOKEN, userData.token);
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify({
        _id: userData._id,
        name: userData.name,
        email: userData.email,
        role: userData.role,
        points: userData.points || 0,
        tier: userData.tier || 'bronze'
    }));

    if (rememberMe) {
        localStorage.setItem(STORAGE_KEYS.REMEMBERED_EMAIL, userData.email);
    } else {
        localStorage.removeItem(STORAGE_KEYS.REMEMBERED_EMAIL);
    }

    // Update navbar if Auth class exists
    if (window.Auth && typeof Auth.updateNavbar === 'function') {
        Auth.updateNavbar();
    }
}

// Main login handler
loginForm.addEventListener('submit', async function (e) {
    e.preventDefault();

    // Validate form
    if (!validateForm()) {
        return;
    }

    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();
    const rememberMe = document.getElementById('remember').checked;

    // Show loading state
    loginBtn.disabled = true;
    btnSpinner.style.display = 'block';

    try {
        // Call backend login API
        const response = await fetch(AUTH_ENDPOINTS.LOGIN, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                email: email,
                password: password
            })
        });

        const data = await response.json();

        // Handle response
        if (response.ok) {
            if (data.token) {
                // Save user session
                saveUserSession(data, rememberMe);

                // Show success
                showToast('Login successful! Redirecting...');
                showLoginSuccess(data);

            } else {
                // No token in response
                showToast('Login failed: Invalid server response', 'error');
            }
        } else if (response.status === 404) {
            // User not found - Redirect to register
            showToast('User not found. Redirecting to registration...', 'warning');
            setTimeout(() => {
                window.location.href = 'register.html';
            }, 2000);
        } else {
            // API returned error
            showToast(data.message || `Login failed (${response.status})`, 'error');
        }

    } catch (error) {
        // Network or server error
        console.error('Login error:', error);

        if (error.name === 'TypeError' && error.message.includes('fetch')) {
            showToast('Cannot connect to server. Please check your connection.', 'error');
        } else {
            showToast('An unexpected error occurred. Please try again.', 'error');
        }
    } finally {
        // Reset loading state
        loginBtn.disabled = false;
        btnSpinner.style.display = 'none';
    }
});

// Go Home button handler
goHomeBtn.addEventListener('click', function () {
    redirectAfterLogin();
});

// Social login buttons (placeholders for now)
document.querySelector('.social-btn.google').addEventListener('click', function () {
    showToast('Google authentication will be available soon!', 'warning');
});

document.querySelector('.social-btn.facebook').addEventListener('click', function () {
    showToast('Facebook authentication will be available soon!', 'warning');
});

// Forgot password handler
document.querySelector('.forgot-password').addEventListener('click', async function (e) {
    e.preventDefault();

    const email = prompt('Enter your email to reset password:');
    if (email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        try {
            const response = await fetch(AUTH_ENDPOINTS.FORGOT_PASSWORD, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });

            if (response.ok) {
                showToast('Password reset link sent to your email! Check your inbox.');
            } else {
                showToast('Failed to send reset link. Please try again.', 'error');
            }
        } catch (error) {
            showToast('Cannot connect to server. Please try again later.', 'error');
        }
    } else if (email) {
        showToast('Please enter a valid email address', 'error');
    }
});

// Page load initialization REMEMBERED EMAIL, ANIMATIONS, TOKEN VALIDATION
window.addEventListener('load', function () {
    // Auto-fill remembered email
    const rememberedEmail = localStorage.getItem(STORAGE_KEYS.REMEMBERED_EMAIL);
    if (rememberedEmail) {
        emailInput.value = rememberedEmail;
        document.getElementById('remember').checked = true;
    }

    // Animate features
    const features = document.querySelectorAll('.feature');
    features.forEach((feature, index) => {
        feature.style.animationDelay = `${index * 0.1}s`;
        feature.classList.add('animate-in');
    });

    // Check if user is already logged in
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
    if (token) {
        // Optional: Validate token with backend
        // autoValidateToken(token);
    }
});

// Optional: Token validation function
async function autoValidateToken(token) {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/validate`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) {
            // Token invalid, clear storage
            localStorage.removeItem(STORAGE_KEYS.TOKEN);
            localStorage.removeItem(STORAGE_KEYS.USER);
        }
    } catch (error) {
        console.warn('Token validation failed:', error);
    }
}


if (response.ok && data.token) {
    // Save token to localStorage
    localStorage.setItem('cloudbakes_token', data.token);
    localStorage.setItem('cloudbakes_user', JSON.stringify({
        _id: data._id,
        name: data.name,
        email: data.email,
        role: data.role,
        points: data.points || 100, 
        tier: data.tier || 'bronze'   
    }));

    // Update navbar
    if (window.Auth && typeof Auth.updateNavbar === 'function') {
        Auth.updateNavbar();
    }

    if (rememberMe) {
        localStorage.setItem('rememberedEmail', email);
    }

    // Show success modal WITH POINTS
    userNameSpan.textContent = data.name;
    document.querySelector('.points').textContent = data.points || 100; 

    loginModal.style.display = 'flex';

    showToast('Login successful! Redirecting...');

    // Redirect after 3 seconds
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 3000);
}
