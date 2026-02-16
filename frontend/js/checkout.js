class CheckoutManager {
    constructor() {
        this.cart = this.loadCart();
        this.token = localStorage.getItem('cloudbakes_token'); 
        this.selectedPaymentMethod = 'COD'; 
        this.initCheckout();
    }

    loadCart() {
        try {

            const savedCart = localStorage.getItem('cloudbakes_cart');
            return savedCart ? JSON.parse(savedCart) : [];
        } catch (e) {
            return [];
        }
    }

    initCheckout() {

        if (!this.token) {
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
        

        const user = localStorage.getItem('cloudbakeUser');
        if(user) this.loadUserDetails(JSON.parse(user));

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
        
        paymentDetails.classList.add('active');
    }

    loadOrderSummary() {
        const checkoutItems = document.getElementById('checkout-items');
        if (!checkoutItems) return;

        checkoutItems.innerHTML = '';

        this.cart.forEach(item => {

            let displayPrice = item.price > 50 ? `NPR ${item.price}` : `$${item.price}`;
            
            const itemElement = document.createElement('div');
            itemElement.className = 'checkout-item';
            itemElement.innerHTML = `
                <div class="checkout-item-image">
                    <img src="${item.image}" alt="${item.name}" onerror="this.src='https://via.placeholder.com/60'">
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

    loadUserDetails(user) {
        const userDetails = document.getElementById('user-details');
        if (userDetails && user) {
            userDetails.innerHTML = `
                <div class="user-detail"><span>Name:</span> <span>${user.name || 'Valued Customer'}</span></div>
                <div class="user-detail"><span>Email:</span> <span>${user.email || 'N/A'}</span></div>
            `;
        }
    }

    calculateTotals() {
        const subtotal = this.cart.reduce((total, item) => {
            let price = parseFloat(item.price);
            if (price < 50) price = price * 135; 
            return total + (price * item.quantity);
        }, 0);

        const deliveryFee = 100;
        const tax = subtotal * 0.13; 
        const total = subtotal + deliveryFee + tax;


        this.finalTotal = Math.round(total);

        document.getElementById('checkout-subtotal').textContent = `NPR ${Math.round(subtotal)}`;
        document.getElementById('checkout-delivery').textContent = `NPR ${deliveryFee}`;
        document.getElementById('checkout-tax').textContent = `NPR ${Math.round(tax)}`;
        document.getElementById('checkout-total').textContent = `NPR ${Math.round(total)}`;
    }

    updateCartCount() {
        const cartCount = document.querySelector('.cart-count');
        if (cartCount) cartCount.textContent = this.cart.length;
    }


    async placeOrder() {
        const termsCheckbox = document.getElementById('terms-agree');
        if (!termsCheckbox.checked) {
            this.showToast('Please agree to the terms and conditions', 'error');
            return;
        }


        const address = document.getElementById('addr-street')?.value || 'Not Provided';
        const city = document.getElementById('addr-city')?.value || 'Kathmandu';
        const zip = document.getElementById('addr-zip')?.value || '44600';

        this.showToast('Processing your order...', 'info');
        const submitBtn = document.getElementById('place-order-btn');
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';

        // Prepare Data
        const orderData = {
            orderItems: this.cart.map(item => ({
                product: item.id, 
                name: item.name,
                image: item.image,
                price: parseFloat(item.price),
                qty: item.quantity
            })),
            shippingAddress: { address, city, postalCode: zip, country: 'Nepal' },
            paymentMethod: this.selectedPaymentMethod,
            totalPrice: this.finalTotal
        };

        try {
            const res = await fetch('http://localhost:5000/api/orders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.token}` 
                },
                body: JSON.stringify(orderData)
            });

            const data = await res.json();

            if (res.ok) {

                this.clearCart();
                this.showOrderSuccess(data._id || 'ORD-NEW');
            } else {
                throw new Error(data.message || 'Order failed');
            }
        } catch (error) {
            console.error(error);
            this.showToast(error.message, 'error');
            submitBtn.disabled = false;
            submitBtn.innerText = 'Place Order';
        }
    }

    clearCart() {
        localStorage.removeItem('cloudbakes_cart');
        if (window.cartSystem) {
            window.cartSystem.cart = [];
            window.cartSystem.updateCartCount();
        }
    }

    showOrderSuccess(orderId) {
        document.getElementById('order-id').textContent = orderId;
        document.getElementById('success-modal').classList.add('active');
    }

    showToast(message, type = 'success') {
        const toast = document.getElementById('toast');
        if (toast) {
            toast.textContent = message;
            toast.className = `toast ${type}`;
            toast.classList.add('show');
            setTimeout(() => toast.classList.remove('show'), 3000);
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.checkoutManager = new CheckoutManager();
});