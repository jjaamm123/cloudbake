document.addEventListener('DOMContentLoaded', function() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const forms = document.querySelectorAll('.register-form');
    const customerForm = document.getElementById('customerForm');
    const wholesaleForm = document.getElementById('wholesaleForm');
    const successModal = document.getElementById('successModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalMessage = document.getElementById('modalMessage');
    const continueShoppingBtn = document.getElementById('continueShopping');
    const goToDashboardBtn = document.getElementById('goToDashboard');
    const toast = document.createElement('div');
    toast.className = 'toast';
    document.body.appendChild(toast);

    const urlParams = new URLSearchParams(window.location.search);
    const userType = urlParams.get('type');

    if (userType === 'wholesale') {
        switchToWholesale();
    }

    tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const tab = this.dataset.tab;
            
            tabBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            forms.forEach(form => form.classList.remove('active'));
            document.getElementById(`${tab}Form`).classList.add('active');
            
            if (tab === 'wholesale') {
                document.querySelector('.wholesale-jump').scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    const togglePasswordBtns = document.querySelectorAll('.toggle-password');
    togglePasswordBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const input = this.closest('.password-wrapper').querySelector('input');
            const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
            input.setAttribute('type', type);
            this.querySelector('i').classList.toggle('fa-eye');
            this.querySelector('i').classList.toggle('fa-eye-slash');
        });
    });

    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    const strengthBar = document.querySelector('.strength-bar');
    const strengthText = document.querySelector('.strength-text');
    const passwordMatch = document.querySelector('.password-match');

    if (passwordInput) {
        passwordInput.addEventListener('input', function() {
            const password = this.value;
            let strength = 0;
            let color = '#ff4757';
            let text = 'Weak';
            
            if (password.length >= 8) strength++;
            if (/[A-Z]/.test(password)) strength++;
            if (/[0-9]/.test(password)) strength++;
            if (/[^A-Za-z0-9]/.test(password)) strength++;
            
            if (strength === 0) {
                color = '#ff4757';
                text = 'Weak';
            } else if (strength <= 2) {
                color = '#ffa502';
                text = 'Medium';
            } else {
                color = '#2ed573';
                text = 'Strong';
            }
            
            strengthBar.style.width = (strength * 25) + '%';
            strengthBar.style.backgroundColor = color;
            strengthText.textContent = text;
            strengthText.style.color = color;
            
            if (confirmPasswordInput.value) {
                checkPasswordMatch();
            }
        });
    }

    if (confirmPasswordInput) {
        confirmPasswordInput.addEventListener('input', checkPasswordMatch);
    }

    function checkPasswordMatch() {
        if (passwordInput.value === confirmPasswordInput.value && passwordInput.value !== '') {
            passwordMatch.classList.add('show');
        } else {
            passwordMatch.classList.remove('show');
        }
    }

    const emailInput = document.getElementById('email');
    if (emailInput) {
        emailInput.addEventListener('input', function() {
            const email = this.value;
            const validIcon = this.parentElement.querySelector('.valid-icon');
            const errorIcon = this.parentElement.querySelector('.error-icon');
            
            if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                validIcon.style.display = 'inline';
                errorIcon.style.display = 'none';
                this.style.borderColor = '#4CAF50';
            } else if (email.length > 0) {
                validIcon.style.display = 'none';
                errorIcon.style.display = 'inline';
                this.style.borderColor = '#ff4757';
            } else {
                validIcon.style.display = 'none';
                errorIcon.style.display = 'none';
                this.style.borderColor = '#e0e0e0';
            }
        });
    }

    customerForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        if (!validateCustomerForm()) {
            showToast('Please fill all required fields correctly', 'error');
            return;
        }
        
        const formData = {
            type: 'customer',
            firstName: document.getElementById('firstName').value,
            lastName: document.getElementById('lastName').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value || null,
            birthday: document.getElementById('birthday').value || null,
            newsletter: document.getElementById('newsletter').checked
        };
        
        await submitRegistration(formData);
    });

    wholesaleForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        if (!validateWholesaleForm()) {
            showToast('Please fill all required fields correctly', 'error');
            return;
        }
        
        const formData = {
            type: 'wholesale',
            businessName: document.getElementById('businessName').value,
            businessType: document.getElementById('businessType').value,
            contactName: document.getElementById('contactName').value,
            businessEmail: document.getElementById('businessEmail').value,
            businessPhone: document.getElementById('businessPhone').value,
            taxId: document.getElementById('taxId').value || null,
            monthlyVolume: document.getElementById('monthlyVolume').value,
            requirements: document.getElementById('requirements').value || null,
            subscription: document.querySelector('input[name="subscription"]:checked').value
        };
        
        await submitRegistration(formData);
    });

    function validateCustomerForm() {
        const firstName = document.getElementById('firstName');
        const lastName = document.getElementById('lastName');
        const email = document.getElementById('email');
        const password = document.getElementById('password');
        const confirmPassword = document.getElementById('confirmPassword');
        const terms = document.getElementById('terms');
        
        let isValid = true;
        
        if (firstName.value.length < 2) {
            markInvalid(firstName);
            isValid = false;
        } else {
            markValid(firstName);
        }
        
        if (lastName.value.length < 2) {
            markInvalid(lastName);
            isValid = false;
        } else {
            markValid(lastName);
        }
        
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
            markInvalid(email);
            isValid = false;
        } else {
            markValid(email);
        }
        
        if (password.value.length < 8) {
            markInvalid(password);
            isValid = false;
        } else {
            markValid(password);
        }
        
        if (password.value !== confirmPassword.value) {
            markInvalid(confirmPassword);
            isValid = false;
        } else {
            markValid(confirmPassword);
        }
        
        if (!terms.checked) {
            showToast('Please agree to the Terms of Service', 'error');
            isValid = false;
        }
        
        return isValid;
    }

    function validateWholesaleForm() {
        const requiredFields = [
            'businessName',
            'businessType',
            'contactName',
            'businessEmail',
            'businessPhone',
            'monthlyVolume'
        ];
        
        let isValid = true;
        
        requiredFields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (!field.value.trim()) {
                markInvalid(field);
                isValid = false;
            } else {
                markValid(field);
            }
        });
        
        const email = document.getElementById('businessEmail');
        if (email.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
            markInvalid(email);
            isValid = false;
        }
        
        const terms = document.getElementById('wholesaleTerms');
        if (!terms.checked) {
            showToast('Please agree to the Wholesale Terms', 'error');
            isValid = false;
        }
        
        return isValid;
    }

    function markInvalid(element) {
        element.style.borderColor = '#ff4757';
        element.style.backgroundColor = '#fff5f5';
    }

    function markValid(element) {
        element.style.borderColor = '#4CAF50';
        element.style.backgroundColor = '#f8fff9';
    }

    async function submitRegistration(formData) {
        const submitBtn = document.querySelector('.btn-register:not([style*="display: none"])');
        const spinner = submitBtn.querySelector('.btn-spinner');
        
        submitBtn.disabled = true;
        spinner.style.display = 'block';
        
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const user = {
            email: formData.type === 'customer' ? formData.email : formData.businessEmail,
            name: formData.type === 'customer' ? `${formData.firstName} ${formData.lastName}` : formData.contactName,
            role: formData.type === 'customer' ? 'customer' : 'wholesale_pending',
            points: formData.type === 'customer' ? 100 : 500,
            tier: 'bronze',
            type: formData.type,
            ...formData
        };
        
        localStorage.setItem('cloudbakeUser', JSON.stringify(user));
        localStorage.setItem('isLoggedIn', 'true');
        
        showSuccessModal(user);
        
        submitBtn.disabled = false;
        spinner.style.display = 'none';
    }

    function showSuccessModal(user) {
        if (user.type === 'customer') {
            modalTitle.textContent = 'Welcome to CloudBake!';
            modalMessage.textContent = `Hi ${user.name.split(' ')[0]}! Your account has been created successfully.`;
            document.querySelector('.points').textContent = user.points;
        } else {
            modalTitle.textContent = 'Application Submitted!';
            modalMessage.textContent = `Thank you ${user.contactName.split(' ')[0]}! Your wholesale application has been received.`;
            document.querySelector('.points').textContent = user.points;
            document.querySelector('.welcome-gift h3').textContent = 'Application Bonus!';
            document.querySelector('.welcome-gift p').innerHTML = `You'll receive <span class="points">${user.points}</span> bonus points upon approval`;
        }
        
        successModal.style.display = 'flex';
    }

    continueShoppingBtn.addEventListener('click', function() {
        successModal.style.display = 'none';
        window.location.href = 'index.html';
    });

    goToDashboardBtn.addEventListener('click', function() {
        successModal.style.display = 'none';
        window.location.href = 'account.html';
    });

    document.querySelectorAll('.social-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const platform = this.classList.contains('google') ? 'Google' : 'Facebook';
            showToast(`${platform} registration coming soon!`);
        });
    });

    function showToast(message, type = 'info') {
        toast.textContent = message;
        toast.className = 'toast';
        
        if (type === 'error') {
            toast.style.background = '#ff4757';
        } else if (type === 'success') {
            toast.style.background = '#2ed573';
        } else {
            toast.style.background = '#3742fa';
        }
        
        toast.classList.add('show');
        
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }

    const style = document.createElement('style');
    style.textContent = `
        .toast {
            position: fixed;
            bottom: 30px;
            right: 30px;
            background: #3742fa;
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

    function switchToWholesale() {
        tabBtns.forEach(b => b.classList.remove('active'));
        document.querySelector('[data-tab="wholesale"]').classList.add('active');
        
        forms.forEach(form => form.classList.remove('active'));
        wholesaleForm.classList.add('active');
        
        setTimeout(() => {
            wholesaleForm.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    }

    window.addEventListener('click', function(e) {
        if (e.target === successModal) {
            successModal.style.display = 'none';
        }
    });
});