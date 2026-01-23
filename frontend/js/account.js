
document.addEventListener('DOMContentLoaded', function() {
    
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabId = btn.getAttribute('data-tab');
            
            
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            
            
            btn.classList.add('active');
            document.getElementById(`${tabId}-tab`).classList.add('active');
        });
    });
    
    
    const profileForm = document.getElementById('profile-form');
        if (profileForm) {
            async function loadUserOrders() {
            try {
                const token = localStorage.getItem('cloudbakes_token');
                if (!token) return;
                
                const response = await fetch('http://localhost:5000/api/orders', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                
                    if (response.ok) {
                        const data = await response.json();
                        
                        // Check if we're on the orders tab
                        const ordersTab = document.getElementById('orders-tab');
                        if (!ordersTab || !data.orders) return;
                        
                        // Clear existing orders (keep the first one as template if needed)
                        const ordersList = ordersTab.querySelector('.orders-list');
                        const existingOrders = ordersList.querySelectorAll('.order-card');
                        existingOrders.forEach((order, index) => {
                            if (index > 0) order.remove(); // Keep first as template or remove all
                        });
                        
                        // Add real orders
                        data.orders.forEach((order, index) => {
                            if (index === 0) {
                                // Update first order card with real data
                                updateOrderCard(existingOrders[0], order);
                            } else {
                                // Create new order card
                                const orderCard = createOrderCard(order);
                                ordersList.appendChild(orderCard);
                            }
                        });
                        
                    }
                } catch (error) {
                    console.error('Error loading orders:', error);
                }
            }

            function updateOrderCard(cardElement, orderData) {
                // Update existing card with real data
                const header = cardElement.querySelector('.order-header');
                const itemsContainer = cardElement.querySelector('.order-items');
                const footer = cardElement.querySelector('.order-footer');
                
                if (header) {
                    const orderNum = header.querySelector('h3');
                    const orderDate = header.querySelector('.order-date');
                    const orderStatus = header.querySelector('.order-status');
                    
                    if (orderNum) orderNum.textContent = `Order #${orderData.id}`;
                    if (orderDate) orderDate.textContent = new Date(orderData.date).toLocaleDateString();
                    if (orderStatus) {
                        orderStatus.textContent = orderData.status;
                        orderStatus.className = `order-status ${orderData.status}`;
                    }
                }
                
                // Update order items
                if (itemsContainer) {
                    itemsContainer.innerHTML = '';
                    orderData.items.forEach(item => {
                        const itemElement = document.createElement('div');
                        itemElement.className = 'order-item';
                        itemElement.innerHTML = `
                            <img src="img/placeholder.jpg" alt="${item.name}">
                            <div>
                                <h4>${item.name}</h4>
                                <p>Qty: ${item.quantity} × $${item.price}</p>
                            </div>
                            <span class="item-price">$${(item.quantity * item.price).toFixed(2)}</span>
                        `;
                        itemsContainer.appendChild(itemElement);
                    });
                }
                
                // Update total
                if (footer) {
                    const totalElement = footer.querySelector('.order-total span:last-child');
                    if (totalElement) {
                        totalElement.textContent = `$${orderData.total.toFixed(2)}`;
                    }
                }
            }
        }
    
    
    const passwordForm = document.getElementById('password-form');
    if (passwordForm) {
        passwordForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const currentPassword = document.getElementById('current-password').value;
            const newPassword = document.getElementById('new-password').value;
            const confirmPassword = document.getElementById('confirm-password').value;
            
            
            if (newPassword !== confirmPassword) {
                showToast('Passwords do not match!', 'error');
                return;
            }
            
            if (newPassword.length < 6) {
                showToast('Password must be at least 6 characters!', 'error');
                return;
            }
            
            
            console.log('Password change attempted');
            
            
            passwordForm.reset();
            
            
            showToast('Password updated successfully!');
        });
    }
    
    
    const editPicBtn = document.getElementById('edit-pic-btn');
    if (editPicBtn) {
        editPicBtn.addEventListener('click', function() {
            
            
            showToast('Clicking this would open image upload');
        });
    }
    
    
    const addAddressBtn = document.getElementById('add-address-btn');
    if (addAddressBtn) {
        addAddressBtn.addEventListener('click', function() {
            
            showToast('Add address functionality would open here');
        });
    }
    
    
    const editAddressBtns = document.querySelectorAll('.edit-address');
    editAddressBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            showToast('Edit address functionality would open here');
        });
    });
    
    
    const setDefaultBtns = document.querySelectorAll('.btn.btn-secondary.btn-small:not(:disabled)');
    setDefaultBtns.forEach(btn => {
        if (btn.textContent.includes('Set as Default')) {
            btn.addEventListener('click', function() {
                
                document.querySelectorAll('.address-default').forEach(el => {
                    el.parentElement.parentElement.classList.remove('active');
                    el.remove();
                });
                
                
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
    
    
    const reorderBtns = document.querySelectorAll('.btn.btn-secondary.btn-small:not(:disabled)');
    reorderBtns.forEach(btn => {
        if (btn.textContent.includes('Reorder')) {
            btn.addEventListener('click', function() {
                showToast('Items added to cart!');
                
                
                const cartCount = document.querySelector('.cart-count');
                if (cartCount) {
                    let count = parseInt(cartCount.textContent) || 0;
                    cartCount.textContent = count + 2;
                    cartCount.style.opacity = '1';
                }
            });
        }
    });
    
    
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
    
    
    const deleteAccountBtn = document.getElementById('delete-account-btn');
    if (deleteAccountBtn) {
        deleteAccountBtn.addEventListener('click', function() {
            if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
                showToast('Account deletion requested. This is a demo.', 'warning');
                
            }
        });
    }
    
    
    const toggleSwitches = document.querySelectorAll('.switch input');
    toggleSwitches.forEach(switchEl => {
        switchEl.addEventListener('change', function() {
            const settingName = this.closest('.setting-item').querySelector('h3').textContent;
            const action = this.checked ? 'enabled' : 'disabled';
            showToast(`${settingName} ${action}`);
        });
    });
    
    
    const languageSelect = document.querySelector('.select-input');
    if (languageSelect) {
        languageSelect.addEventListener('change', function() {
            showToast(`Language changed to ${this.value}`);
        });
    }
    
    
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
    
    
async function initializeAccountData() {
    try {
        // Check if user is logged in
        const userData = JSON.parse(localStorage.getItem('cloudbakes_user') || '{}');
        const token = localStorage.getItem('cloudbakes_token');
        
        if (!token || !userData.email) {
            // Not logged in, redirect to login
            showToast('Please login to view account', 'error');
            setTimeout(() => {
                window.location.href = 'login.html?redirect=account';
            }, 2000);
            return;
        }
        
        // 1. Display basic user info from localStorage
        document.getElementById('account-name').textContent = userData.name || 'User';
        document.getElementById('account-email').textContent = userData.email;
        document.getElementById('rewards-points').textContent = userData.points || 0;
        
        // 2. Fetch detailed account data from backend
        const response = await fetch(`http://localhost:5000/api/auth/profile?email=${encodeURIComponent(userData.email)}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.ok) {
            const accountData = await response.json();
            
            // Update UI with real backend data
            document.getElementById('total-orders').textContent = accountData.orders || 0;
            document.getElementById('member-since').textContent = accountData.joinDate?.split('-')[0] || '2024';
            document.getElementById('rewards-points').textContent = accountData.points || 0;
            
            // Update form fields with real data
            if (document.getElementById('full-name')) {
                document.getElementById('full-name').value = accountData.name || userData.name || '';
            }
            if (document.getElementById('email')) {
                document.getElementById('email').value = accountData.email || userData.email || '';
            }
            
            console.log('Account data loaded from backend:', accountData);
            
        } else {
            // If backend fails, use localStorage data
            document.getElementById('total-orders').textContent = userData.orders || 0;
            document.getElementById('member-since').textContent = '2024';
            document.getElementById('rewards-points').textContent = userData.points || 0;
            
            showToast('Using cached account data', 'warning');
        }
        
    } catch (error) {
        console.error('Error loading account data:', error);
        
        // Fallback to localStorage data
        const userData = JSON.parse(localStorage.getItem('cloudbakes_user') || '{}');
        document.getElementById('account-name').textContent = userData.name || 'User';
        document.getElementById('account-email').textContent = userData.email || 'Not logged in';
        document.getElementById('rewards-points').textContent = userData.points || 0;
        document.getElementById('total-orders').textContent = '0';
        document.getElementById('member-since').textContent = '2024';
        
        showToast('Connected to backend failed. Using local data.', 'error');
    }
}
    
    setTimeout(initializeAccountData, 1000);
    
    
    setTimeout(() => {
        document.getElementById('loading-overlay').style.display = 'none';
    }, 1500);
});

async function loadUserOrders() {
    try {
        const token = localStorage.getItem('cloudbakes_token');
        if (!token) return;
        
        const response = await fetch('http://localhost:5000/api/orders', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            
            // Check if we're on the orders tab
            const ordersTab = document.getElementById('orders-tab');
            if (!ordersTab || !data.orders) return;
            
            // Clear existing orders (keep the first one as template if needed)
            const ordersList = ordersTab.querySelector('.orders-list');
            const existingOrders = ordersList.querySelectorAll('.order-card');
            existingOrders.forEach((order, index) => {
                if (index > 0) order.remove(); // Keep first as template or remove all
            });
            
            // Add real orders
            data.orders.forEach((order, index) => {
                if (index === 0) {
                    // Update first order card with real data
                    updateOrderCard(existingOrders[0], order);
                } else {
                    // Create new order card
                    const orderCard = createOrderCard(order);
                    ordersList.appendChild(orderCard);
                }
            });
            
        }
    } catch (error) {
        console.error('Error loading orders:', error);
    }
}

function updateOrderCard(cardElement, orderData) {
    // Update existing card with real data
    const header = cardElement.querySelector('.order-header');
    const itemsContainer = cardElement.querySelector('.order-items');
    const footer = cardElement.querySelector('.order-footer');
    
    if (header) {
        const orderNum = header.querySelector('h3');
        const orderDate = header.querySelector('.order-date');
        const orderStatus = header.querySelector('.order-status');
        
        if (orderNum) orderNum.textContent = `Order #${orderData.id}`;
        if (orderDate) orderDate.textContent = new Date(orderData.date).toLocaleDateString();
        if (orderStatus) {
            orderStatus.textContent = orderData.status;
            orderStatus.className = `order-status ${orderData.status}`;
        }
    }
    
    // Update order items
    if (itemsContainer) {
        itemsContainer.innerHTML = '';
        orderData.items.forEach(item => {
            const itemElement = document.createElement('div');
            itemElement.className = 'order-item';
            itemElement.innerHTML = `
                <img src="img/placeholder.jpg" alt="${item.name}">
                <div>
                    <h4>${item.name}</h4>
                    <p>Qty: ${item.quantity} × $${item.price}</p>
                </div>
                <span class="item-price">$${(item.quantity * item.price).toFixed(2)}</span>
            `;
            itemsContainer.appendChild(itemElement);
        });
    }
    
    // Update total
    if (footer) {
        const totalElement = footer.querySelector('.order-total span:last-child');
        if (totalElement) {
            totalElement.textContent = `$${orderData.total.toFixed(2)}`;
        }
    }
}

// Replace the setTimeout call at the bottom:
setTimeout(() => {
    initializeAccountData();
    loadUserOrders(); // Load real orders
    document.getElementById('loading-overlay').style.display = 'none';
}, 1000);