class Auth {
    static isLoggedIn() {
        return localStorage.getItem('cloudbakes_token') !== null;
    }

    static getUser() {
        try {
            const user = localStorage.getItem('cloudbakeUser'); 
            return user ? JSON.parse(user) : null;
        } catch (error) {
            console.error('Error parsing user data:', error);
            return null;
        }
    }

    static logout() {
        localStorage.removeItem('cloudbakes_token');
        localStorage.removeItem('cloudbakeUser');
        window.location.href = 'login.html';
    }

    static updateNavbar() {
        const authContainer = document.getElementById('nav-auth-container') || document.querySelector('.nav-auth');
        
        if (!authContainer) {
            console.warn("Auth Container not found in Navbar. Ensure <div id='nav-auth-container'> exists.");
            return;
        }

        const token = localStorage.getItem('cloudbakes_token');

        if (token) {
            authContainer.innerHTML = `
                <a href="dashboard.html" class="profile-btn" title="My Dashboard" style="margin-left: 15px; font-size: 1.3rem; color: #333; display: flex; align-items: center;">
                    <i class="fas fa-user-circle"></i>
                </a>
            `;
        } else {
            authContainer.innerHTML = `
                <a href="login.html" class="login-link" style="text-decoration: none; color: #333; font-weight: 600; margin-left: 15px;">
                    Login
                </a>
            `;
        }
    }
}

window.Auth = Auth;

document.addEventListener('DOMContentLoaded', () => {
    Auth.updateNavbar();
});