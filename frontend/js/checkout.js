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
        } catch (e) { return []; }
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
        this.calculateTotals();
    }

    setupEventListeners() {
        document.querySelectorAll('.payment-option').forEach(option => {
            option.addEventListener('click', () => {
                document.querySelectorAll('.payment-option').forEach(opt => opt.classList.remove('active'));
                option.classList.add('active');
                this.selectedPaymentMethod = option.dataset.method;
            });
        });

        const placeOrderBtn = document.getElementById('place-order-btn');
        if (placeOrderBtn) {
            placeOrderBtn.addEventListener('click', () => this.placeOrder());
        }
    }

    loadOrderSummary() {
        const checkoutItems = document.getElementById('checkout-items');
        if (!checkoutItems) return;

        checkoutItems.innerHTML = '';

        this.cart.forEach(item => {
            const cleanStr = String(item.price).replace(/[^0-9.]/g, '');
            const price = parseFloat(cleanStr) || 0;
            
            const itemElement = document.createElement('div');
            itemElement.className = 'checkout-item';
            itemElement.innerHTML = `
                <div class="checkout-item-image">
                    <img src="${item.image}" alt="${item.name}" onerror="this.src='img/donut-1-svgrepo-com.svg'">
                </div>
                <div class="checkout-item-details">
                    <div class="checkout-item-name">${item.name}</div>
                    <div class="checkout-item-price">NPR ${price}</div>
                    <div class="checkout-item-quantity">Quantity: ${item.quantity}</div>
                </div>
            `;
            checkoutItems.appendChild(itemElement);
        });
    }

    calculateTotals() {
        const subtotal = this.cart.reduce((total, item) => {
            const cleanStr = String(item.price).replace(/[^0-9.]/g, '');
            let price = parseFloat(cleanStr) || 0;
            
            if (price > 0 && price < 50) price = price * 135; 
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

    async placeOrder() {
        const termsCheckbox = document.getElementById('terms-agree');
        if (termsCheckbox && !termsCheckbox.checked) {
            alert('Please agree to the terms and conditions');
            return;
        }

        const address = document.getElementById('addr-street')?.value || 'Not Provided';
        const city = document.getElementById('addr-city')?.value || 'Kathmandu';
        const zip = document.getElementById('addr-zip')?.value || '44600';

        const submitBtn = document.getElementById('place-order-btn');
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';

        const orderData = {
            orderItems: this.cart.map(item => {
                const cleanStr = String(item.price).replace(/[^0-9.]/g, '');
                return {
                    product: item.id, 
                    name: item.name,
                    image: item.image,
                    price: parseFloat(cleanStr) || 0,
                    qty: item.quantity
                }
            }),
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
                document.getElementById('order-id').textContent = data._id || 'ORD-NEW';
                document.getElementById('success-modal').classList.add('active');
            } else {
                throw new Error(data.message || 'Order failed');
            }
        } catch (error) {
            console.error(error);
            alert(error.message);
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
}

document.addEventListener('DOMContentLoaded', () => {
    window.checkoutManager = new CheckoutManager();
});