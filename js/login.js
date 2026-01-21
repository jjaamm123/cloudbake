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

const mockUsers = {
    'customer@cloudbake.com': {
        password: 'demo123',
        name: 'Alex Morgan',
        role: 'customer',
        points: 850,
        tier: 'silver'
    },
    'wholesale@cloudbake.com': {
        password: 'demo123',
        name: 'Sarah Chen',
        role: 'wholesale',
        points: 2500,
        tier: 'platinum'
    }
};

togglePassword.addEventListener('click', function() {
    const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
    passwordInput.setAttribute('type', type);
    this.classList.toggle('fa-eye');
    this.classList.toggle('fa-eye-slash');
});

function validateForm() {
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();
    let isValid = true;

    emailInput.style.borderColor = '#e0e0e0';
    passwordInput.style.borderColor = '#e0e0e0';

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        emailInput.style.borderColor = '#ff4757';
        isValid = false;
    }

    if (!password || password.length < 6) {
        passwordInput.style.borderColor = '#ff4757';
        isValid = false;
    }

    return isValid;
}

function showToast(message, type = 'success') {
    toast.textContent = message;
    toast.className = 'toast show';
    
    if (type === 'error') {
        toast.style.background = '#ff4757';
    } else {
        toast.style.background = '#4CAF50';
    }
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

function showLoginSuccess(user) {
    userNameSpan.textContent = user.name;
    document.querySelector('.points').textContent = user.points;
    
    loginModal.style.display = 'flex';
    
    setTimeout(() => {
        redirectToHomepage(user);
    }, 3000);
}

function redirectToHomepage(user) {
    localStorage.setItem('cloudbakeUser', JSON.stringify(user));
    localStorage.setItem('isLoggedIn', 'true');
    
    window.location.href = 'index.html';
}

loginForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    if (!validateForm()) {
        showToast('Please check your email and password', 'error');
        return;
    }
    
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();
    const rememberMe = document.getElementById('remember').checked;
    
    loginBtn.disabled = true;
    btnSpinner.style.display = 'block';
    
try {
        // 1. CALL REAL BACKEND API
        const response = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: email,
                password: password
            })
        });
        
        const data = await response.json();
        
        // 2. CHECK IF LOGIN SUCCESSFUL
        if (response.ok && data.token) {
            // Save token to localStorage
            localStorage.setItem('cloudbakes_token', data.token);
            localStorage.setItem('cloudbakes_user', JSON.stringify({
                _id: data._id,
                name: data.name,
                email: data.email,
                role: data.role
            }));
            
            if (rememberMe) {
                localStorage.setItem('rememberedEmail', email);
            }
            
            // Show success modal
            userNameSpan.textContent = data.name;
            loginModal.style.display = 'flex';
            
            showToast('Login successful! Redirecting...');
            
            // Redirect after 3 seconds
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 3000);
            
        } else {
            // Login failed
            showToast(data.message || 'Invalid email or password', 'error');
        }
        
    } catch (error) {
        // Network or server error
        console.error('Login error:', error);
        showToast('Cannot connect to server. Please try again.', 'error');
    } finally {
        // Hide loading
        loginBtn.disabled = false;
        btnSpinner.style.display = 'none';
    }
});

goHomeBtn.addEventListener('click', function() {
    // Get user data from localStorage (set during successful login)
    const userData = JSON.parse(localStorage.getItem('cloudbakes_user') || '{}');
    if (userData.name) {
        window.location.href = 'index.html';
    } else {
        showToast('Please login first', 'error');
    }
});

document.querySelector('.social-btn.google').addEventListener('click', function() {
    showToast('Google login coming soon!');
});

document.querySelector('.social-btn.facebook').addEventListener('click', function() {
    showToast('Facebook login coming soon!');
});

document.querySelector('.forgot-password').addEventListener('click', function(e) {
    e.preventDefault();
    const email = prompt('Enter your email to reset password:');
    if (email) {
        showToast(`Password reset link sent to ${email}`, 'success');
    }
});

window.addEventListener('load', function() {
    const rememberedEmail = localStorage.getItem('rememberedEmail');
    if (rememberedEmail) {
        emailInput.value = rememberedEmail;
        document.getElementById('remember').checked = true;
    }
    
    const features = document.querySelectorAll('.feature');
    features.forEach((feature, index) => {
        feature.style.animationDelay = `${index * 0.1}s`;
        feature.classList.add('animate-in');
    });
});

const style = document.createElement('style');
style.textContent = `
    .feature.animate-in {
        animation: slideInLeft 0.6s ease forwards;
        opacity: 0;
        transform: translateX(-20px);
    }
    
    @keyframes slideInLeft {
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }
    
    .toast {
        position: fixed;
        bottom: 30px;
        right: 30px;
        background: #4CAF50;
        color: white;
        padding: 1rem 2rem;
        border-radius: 10px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        transform: translateY(100px);
        opacity: 0;
        transition: all 0.3s ease;
        z-index: 1000;
        font-weight: 500;
    }
    
    .toast.show {
        transform: translateY(0);
        opacity: 1;
    }
`;
document.head.appendChild(style);

// After successful login:
function handleSuccessfulLogin(userData) {
    localStorage.setItem('cloudbakeUser', JSON.stringify(userData));
    
    // Check if there's a redirect URL stored
    const redirectUrl = localStorage.getItem('redirectAfterLogin');
    
    if (redirectUrl) {
        // Clear the redirect URL
        localStorage.removeItem('redirectAfterLogin');
        // Redirect to the intended page
        window.location.href = redirectUrl;
    } else {
        // Default redirect
        window.location.href = 'index.html';
    }
}