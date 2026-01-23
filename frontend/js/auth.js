


class Auth {
    
    static isLoggedIn() {
        return localStorage.getItem('cloudbakes_token') !== null;
    }
    
    
    static getUser() {
        try {
            const user = localStorage.getItem('cloudbakes_user');
            return user ? JSON.parse(user) : null;
        } catch (error) {
            console.error('Error parsing user data:', error);
            return null;
        }
    }
    
    
    static getToken() {
        return localStorage.getItem('cloudbakes_token');
    }
    
    
    static logout() {
        localStorage.removeItem('cloudbakes_token');
        localStorage.removeItem('cloudbakes_user');
        window.location.href = 'login.html';
    }
    
    
    static updateNavbar() {
        
        const navAuth = document.querySelector('.nav-auth') || 
                    document.querySelector('.nav-icons') ||
                    document.querySelector('.navbar .nav-container > div:last-child');
        
        if (!navAuth) return;
        
        const user = this.getUser();
        
        if (user) {
            
            navAuth.innerHTML = `
                <div class="user-menu" style="display: flex; align-items: center; gap: 10px;">
                    <span style="color: #ff6b8b; font-weight: 500;">
                        <i class="fas fa-user"></i> Hi, ${user.name}
                    </span>
                    <button onclick="Auth.logout()" 
                            style="background: #ff4757; color: white; border: none; 
                            padding: 5px 15px; border-radius: 4px; cursor: pointer;">
                        Logout
                    </button>
                </div>
            `;
        } else {
            
            navAuth.innerHTML = `
                <div style="display: flex; gap: 10px;">
                    <a href="login.html" class="login-btn" 
                    style="padding: 8px 20px; background: #4CAF50; color: white; 
                        border-radius: 4px; text-decoration: none;">
                        Login
                    </a>
                    <a href="register.html" class="register-btn"
                    style="padding: 8px 20px; background: #2196F3; color: white; 
                        border-radius: 4px; text-decoration: none;">
                        Register
                    </a>
                </div>
            `;
        }
    }
    
    
    static async fetchWithAuth(url, options = {}) {
        const token = this.getToken();
        
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers
        };
        
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        
        return fetch(url, {
            ...options,
            headers
        });
    }
}


window.Auth = Auth;


document.addEventListener('DOMContentLoaded', () => {
    Auth.updateNavbar();
});

// js/auth.js
class Auth {
    static isLoggedIn() { /* ... */ }
    static getUser() { /* ... */ }
    static logout() { /* ... */ }
    static updateNavbar() { /* ... */ }
}
window.Auth = Auth;