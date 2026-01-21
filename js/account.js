// Account Page JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Tab Switching
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabId = btn.getAttribute('data-tab');
            
            // Remove active class from all tabs
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            
            // Add active class to clicked tab
            btn.classList.add('active');
            document.getElementById(`${tabId}-tab`).classList.add('active');
        });
    });
    
    // Profile Form Submission
    const profileForm = document.getElementById('profile-form');
    if (profileForm) {
        profileForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form values
            const fullName = document.getElementById('full-name').value;
            const email = document.getElementById('email').value;
            const phone = document.getElementById('phone').value;
            const birthday = document.getElementById('birthday').value;
            
            // Update displayed values
            document.getElementById('account-name').textContent = fullName;
            document.getElementById('account-email').textContent = email;
            
            // Show success message
            showToast('Profile updated successfully!');
            
            // Here you would typically send data to server
            console.log('Profile updated:', { fullName, email, phone, birthday });
        });
    }
    
    // Password Form Submission
    const passwordForm = document.getElementById('password-form');
    if (passwordForm) {
        passwordForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const currentPassword = document.getElementById('current-password').value;
            const newPassword = document.getElementById('new-password').value;
            const confirmPassword = document.getElementById('confirm-password').value;
            
            // Basic validation
            if (newPassword !== confirmPassword) {
                showToast('Passwords do not match!', 'error');
                return;
            }
            
            if (newPassword.length < 6) {
                showToast('Password must be at least 6 characters!', 'error');
                return;
            }
            
            // Here you would typically send to server
            console.log('Password change attempted');
            
            // Clear form
            passwordForm.reset();
            
            // Show success
            showToast('Password updated successfully!');
        });
    }
    
    // Edit Profile Picture
    const editPicBtn = document.getElementById('edit-pic-btn');
    if (editPicBtn) {
        editPicBtn.addEventListener('click', function() {
            // In a real app, this would open a file picker
            // For demo, just show a message
            showToast('Clicking this would open image upload');
        });
    }
    
    // Add New Address
    const addAddressBtn = document.getElementById('add-address-btn');
    if (addAddressBtn) {
        addAddressBtn.addEventListener('click', function() {
            // In a real app, this would open an address form modal
            showToast('Add address functionality would open here');
        });
    }
    
    // Edit Address Buttons
    const editAddressBtns = document.querySelectorAll('.edit-address');
    editAddressBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            showToast('Edit address functionality would open here');
        });
    });
    
    // Set as Default Address
    const setDefaultBtns = document.querySelectorAll('.btn.btn-secondary.btn-small:not(:disabled)');
    setDefaultBtns.forEach(btn => {
        if (btn.textContent.includes('Set as Default')) {
            btn.addEventListener('click', function() {
                // Remove 'Default' from all addresses
                document.querySelectorAll('.address-default').forEach(el => {
                    el.parentElement.parentElement.classList.remove('active');
                    el.remove();
                });
                
                // Add 'Default' to clicked address
                const addressCard = btn.closest('.address-card');
                addressCard.classList.add('active');
                
                const addressFooter = btn.parentElement;
                const defaultBadge = document.createElement('span');
                defaultBadge.className = 'address-default';
                defaultBadge.textContent = 'Default';
                
                addressFooter.insertBefore(defaultBadge, btn);
                btn.remove();
                
                showToast('Default address updated!');
            });
        }
    });
    
    // Reorder Buttons
    const reorderBtns = document.querySelectorAll('.btn.btn-secondary.btn-small:not(:disabled)');
    reorderBtns.forEach(btn => {
        if (btn.textContent.includes('Reorder')) {
            btn.addEventListener('click', function() {
                showToast('Items added to cart!');
                
                // Update cart count (simulated)
                const cartCount = document.querySelector('.cart-count');
                if (cartCount) {
                    let count = parseInt(cartCount.textContent) || 0;
                    cartCount.textContent = count + 2;
                    cartCount.style.opacity = '1';
                }
            });
        }
    });
    
    // Dark Mode Toggle
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    if (darkModeToggle) {
        darkModeToggle.addEventListener('change', function() {
            if (this.checked) {
                document.body.classList.add('dark-mode');
                showToast('Dark mode enabled');
            } else {
                document.body.classList.remove('dark-mode');
                showToast('Dark mode disabled');
            }
        });
    }
    
    // Delete Account Button
    const deleteAccountBtn = document.getElementById('delete-account-btn');
    if (deleteAccountBtn) {
        deleteAccountBtn.addEventListener('click', function() {
            if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
                showToast('Account deletion requested. This is a demo.', 'warning');
                // In a real app, this would trigger account deletion
            }
        });
    }
    
    // Settings Toggle Switches
    const toggleSwitches = document.querySelectorAll('.switch input');
    toggleSwitches.forEach(switchEl => {
        switchEl.addEventListener('change', function() {
            const settingName = this.closest('.setting-item').querySelector('h3').textContent;
            const action = this.checked ? 'enabled' : 'disabled';
            showToast(`${settingName} ${action}`);
        });
    });
    
    // Language Select
    const languageSelect = document.querySelector('.select-input');
    if (languageSelect) {
        languageSelect.addEventListener('change', function() {
            showToast(`Language changed to ${this.value}`);
        });
    }
    
    // Toast Notification Function
    function showToast(message, type = 'success') {
        const toast = document.getElementById('toast');
        const toastText = toast.querySelector('span');
        
        toastText.textContent = message;
        toast.className = 'toast';
        toast.classList.add(type);
        toast.style.opacity = '1';
        toast.style.transform = 'translateY(0)';
        
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(20px)';
        }, 3000);
    }
    
    // Initialize with some sample data
    function initializeAccountData() {
        // These values would typically come from a server
        const sampleData = {
            totalOrders: 12,
            memberSince: 2022,
            rewardsPoints: 850,
            recentOrders: 3
        };
        
        // Update stats
        document.getElementById('total-orders').textContent = sampleData.totalOrders;
        document.getElementById('member-since').textContent = sampleData.memberSince;
        document.getElementById('rewards-points').textContent = sampleData.rewardsPoints.toLocaleString();
    }
    
    // Initialize when page loads
    setTimeout(initializeAccountData, 1000);
    
    // Simulate loading
    setTimeout(() => {
        document.getElementById('loading-overlay').style.display = 'none';
    }, 1500);
});