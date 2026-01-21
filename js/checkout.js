
class CheckoutManager {
    constructor() {
        this.cart = this.loadCart();
        this.user = this.loadUser();
        this.selectedPaymentMethod = 'cash';
        this.initCheckout();
    }

    loadCart() {
        try {
            const savedCart = localStorage.getItem('cloudbakeCart');
            return savedCart ? JSON.parse(savedCart) : [];
        } catch (e) {
            console.error('Error loading cart:', e);
            return [];
        }
    }

    loadUser() {
        try {
            const userData = localStorage.getItem('cloudbakeUser');
            return userData ? JSON.parse(userData) : null;
        } catch (e) {
            console.error('Error loading user:', e);
            return null;
        }
    }

    initCheckout() {
        
        if (!this.user) {
            alert('Please login to access checkout page');
            window.location.href = 'login.html';
            return;
        }

        
        if (this.cart.length === 0) {
            alert('Your cart is empty');
            window.location.href = 'menu.html';
            return;
        }

        this.setupEventListeners();
        this.loadOrderSummary();
        this.loadUserDetails();
        this.calculateTotals();
        this.updateCartCount();
    }

    setupEventListeners() {
        
        document.querySelectorAll('.payment-option').forEach(option => {
            option.addEventListener('click', () => {
                this.selectPaymentMethod(option);
            });
        });

        
        const placeOrderBtn = document.getElementById('place-order-btn');
        if (placeOrderBtn) {
            placeOrderBtn.addEventListener('click', () => {
                this.placeOrder();
            });
        }

        
        const changeAddressBtn = document.getElementById('change-address');
        if (changeAddressBtn) {
            changeAddressBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.changeAddress();
            });
        }
    }

    selectPaymentMethod(selectedOption) {
        
        document.querySelectorAll('.payment-option').forEach(option => {
            option.classList.remove('active');
        });

        
        selectedOption.classList.add('active');

        
        this.selectedPaymentMethod = selectedOption.dataset.method;

        
        this.showPaymentDetails();
    }

    showPaymentDetails() {
        const paymentDetails = document.getElementById('payment-details');
        if (!paymentDetails) return;

        let detailsHTML = '';

        switch (this.selectedPaymentMethod) {
            case 'cash':
                detailsHTML = `
                    <div class="cash-details">
                        <p><i class="fas fa-info-circle"></i> Please have exact change ready for delivery</p>
                    </div>
                `;
                break;
            case 'khalti':
                detailsHTML = `
                    <div class="khalti-details">
                        <p><i class="fas fa-mobile-alt"></i> You will be redirected to Khalti payment page</p>
                        <button class="btn btn-primary" id="khalti-pay-btn">
                            <i class="fas fa-qrcode"></i> Pay with Khalti
                        </button>
                    </div>
                `;
                break;
            case 'card':
                detailsHTML = `
                    <div class="card-details">
                        <form id="card-form">
                            <div class="form-group">
                                <label for="card-number">Card Number</label>
                                <input type="text" id="card-number" placeholder="1234 5678 9012 3456" maxlength="19">
                            </div>
                            <div class="card-row">
                                <div class="form-group">
                                    <label for="expiry-date">Expiry Date</label>
                                    <input type="text" id="expiry-date" placeholder="MM/YY" maxlength="5">
                                </div>
                                <div class="form-group">
                                    <label for="cvv">CVV</label>
                                    <input type="text" id="cvv" placeholder="123" maxlength="3">
                                </div>
                            </div>
                            <div class="form-group">
                                <label for="card-name">Name on Card</label>
                                <input type="text" id="card-name" placeholder="John Doe">
                            </div>
                        </form>
                    </div>
                `;
                break;
        }

        paymentDetails.innerHTML = detailsHTML;
        paymentDetails.classList.add('active');

        
        const khaltiBtn = document.getElementById('khalti-pay-btn');
        if (khaltiBtn) {
            khaltiBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.processKhaltiPayment();
            });
        }
    }

    loadOrderSummary() {
        const checkoutItems = document.getElementById('checkout-items');
        if (!checkoutItems) return;

        checkoutItems.innerHTML = '';

        this.cart.forEach(item => {
            const priceText = item.price.toLowerCase();
            let displayPrice = item.price;
            
            if (priceText.includes('for')) {
                const match = priceText.match(/(\d+\.?\d*)/);
                const extractedPrice = match ? parseFloat(match[1]) : 0;
                const forMatch = priceText.match(/for\s+(\d+)/);
                if (forMatch) {
                    const count = parseInt(forMatch[1]);
                    const perItem = Math.round(extractedPrice / count);
                    displayPrice = `NPR ${perItem} per piece`;
                }
            }

            const itemElement = document.createElement('div');
            itemElement.className = 'checkout-item';
            itemElement.innerHTML = `
                <div class="checkout-item-image">
                    <img src="${item.image}" alt="${item.name}" onerror="this.src='https:
                </div>
                <div class="checkout-item-details">
                    <div class="checkout-item-name">${item.name}</div>
                    <div class="checkout-item-price">${displayPrice}</div>
                    <div class="checkout-item-quantity">Quantity: ${item.quantity}</div>
                </div>
            `;
            checkoutItems.appendChild(itemElement);
        });
    }

    loadUserDetails() {
        const userDetails = document.getElementById('user-details');
        const userAddress = document.getElementById('user-address');

        if (!this.user) return;

        if (userDetails) {
            userDetails.innerHTML = `
                <div class="user-detail">
                    <span>Name:</span>
                    <span>${this.user.name || 'Not provided'}</span>
                </div>
                <div class="user-detail">
                    <span>Email:</span>
                    <span>${this.user.email || 'Not provided'}</span>
                </div>
                <div class="user-detail">
                    <span>Phone:</span>
                    <span>${this.user.phone || 'Not provided'}</span>
                </div>
            `;
        }

        if (userAddress) {
            userAddress.textContent = this.user.address || 'Please add delivery address';
        }
    }

    calculateTotals() {
        const subtotal = this.cart.reduce((total, item) => {
            const priceText = item.price.toLowerCase();
            let price = 0;
            
            if (priceText.includes('rs') || priceText.includes('npr')) {
                const match = priceText.match(/(\d+\.?\d*)/);
                price = match ? parseFloat(match[1]) : 0;
                
                const forMatch = priceText.match(/for\s+(\d+)/);
                if (forMatch) {
                    const count = parseInt(forMatch[1]);
                    price = price / count;
                }
            } else if (priceText.includes('$')) {
                const match = priceText.match(/(\d+\.?\d*)/);
                const usdPrice = match ? parseFloat(match[1]) : 0;
                price = usdPrice * 133;
            }
            
            return total + (price * item.quantity);
        }, 0);

        const deliveryFee = 100;
        const tax = subtotal * 0.13; 
        const total = subtotal + deliveryFee + tax;

        
        document.getElementById('checkout-subtotal').textContent = `NPR ${Math.round(subtotal)}`;
        document.getElementById('checkout-delivery').textContent = `NPR ${deliveryFee}`;
        document.getElementById('checkout-tax').textContent = `NPR ${Math.round(tax)}`;
        document.getElementById('checkout-total').textContent = `NPR ${Math.round(total)}`;
    }

    placeOrder() {
        
        const termsCheckbox = document.getElementById('terms-agree');
        if (!termsCheckbox.checked) {
            this.showToast('Please agree to the terms and conditions', 'error');
            return;
        }

        
        if (this.selectedPaymentMethod === 'card') {
            if (!this.validateCardDetails()) {
                this.showToast('Please fill in all card details correctly', 'error');
                return;
            }
        }

        
        this.showToast('Processing your order...', 'info');

        
        setTimeout(() => {
            
            const orderId = `CB-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
            
            
            this.saveOrder(orderId);
            
            
            this.clearCart();
            
            
            this.showOrderSuccess(orderId);
        }, 2000);
    }

    validateCardDetails() {
        const cardNumber = document.getElementById('card-number')?.value.trim();
        const expiryDate = document.getElementById('expiry-date')?.value.trim();
        const cvv = document.getElementById('cvv')?.value.trim();
        const cardName = document.getElementById('card-name')?.value.trim();

        if (!cardNumber || !expiryDate || !cvv || !cardName) {
            return false;
        }

        
        const cardRegex = /^\d{16}$/;
        const expiryRegex = /^\d{2}\/\d{2}$/;
        const cvvRegex = /^\d{3}$/;

        return cardRegex.test(cardNumber.replace(/\s/g, '')) &&
               expiryRegex.test(expiryDate) &&
               cvvRegex.test(cvv);
    }

    processKhaltiPayment() {
        this.showToast('Redirecting to Khalti...', 'info');
        
        
        setTimeout(() => {
            this.showToast('Payment successful! Placing your order...', 'success');
            
            
            setTimeout(() => {
                this.placeOrder();
            }, 1000);
        }, 1500);
    }

    saveOrder(orderId) {
        const order = {
            id: orderId,
            date: new Date().toISOString(),
            items: this.cart,
            user: this.user,
            paymentMethod: this.selectedPaymentMethod,
            total: this.calculateOrderTotal(),
            status: 'processing'
        };

        
        const orders = JSON.parse(localStorage.getItem('cloudbakeOrders') || '[]');
        orders.push(order);
        localStorage.setItem('cloudbakeOrders', JSON.stringify(orders));
    }

    calculateOrderTotal() {
        const subtotal = this.cart.reduce((total, item) => {
            const priceText = item.price.toLowerCase();
            let price = 0;
            
            if (priceText.includes('rs') || priceText.includes('npr')) {
                const match = priceText.match(/(\d+\.?\d*)/);
                price = match ? parseFloat(match[1]) : 0;
                
                const forMatch = priceText.match(/for\s+(\d+)/);
                if (forMatch) {
                    const count = parseInt(forMatch[1]);
                    price = price / count;
                }
            } else if (priceText.includes('$')) {
                const match = priceText.match(/(\d+\.?\d*)/);
                const usdPrice = match ? parseFloat(match[1]) : 0;
                price = usdPrice * 133;
            }
            
            return total + (price * item.quantity);
        }, 0);

        return subtotal + 100 + (subtotal * 0.13); 
    }

    clearCart() {
        localStorage.removeItem('cloudbakeCart');
        if (window.cloudbakeCart) {
            window.cloudbakeCart.cart = [];
            window.cloudbakeCart.updateCartCount();
        }
    }

    showOrderSuccess(orderId) {
        document.getElementById('order-id').textContent = orderId;
        document.getElementById('success-modal').classList.add('active');
    }

    changeAddress() {
        const newAddress = prompt('Enter your new delivery address:');
        if (newAddress && newAddress.trim()) {
            
            if (this.user) {
                this.user.address = newAddress.trim();
                localStorage.setItem('cloudbakeUser', JSON.stringify(this.user));
                
                
                document.getElementById('user-address').textContent = newAddress.trim();
                this.showToast('Address updated successfully!', 'success');
            }
        }
    }

    updateCartCount() {
        const cartCount = document.querySelector('.cart-count');
        if (cartCount) {
            cartCount.textContent = this.cart.length;
        }
    }

    showToast(message, type = 'success') {
        const toast = document.getElementById('toast');
        if (toast) {
            toast.textContent = message;
            toast.className = `toast ${type}`;
            toast.classList.add('show');
            
            setTimeout(() => {
                toast.classList.remove('show');
            }, 3000);
        }
    }
}


document.addEventListener('DOMContentLoaded', () => {
    const checkoutManager = new CheckoutManager();
    window.checkoutManager = checkoutManager;
});