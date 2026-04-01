class CheckoutManager {
    constructor() {
        this.cart                  = this.loadCart();
        this.token                 = localStorage.getItem('cloudbakes_token');
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
        this.renderCheckoutRecommendations();
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
            const price    = parseFloat(cleanStr) || 0;

            const itemElement = document.createElement('div');
            itemElement.className = 'checkout-item';
            itemElement.innerHTML = `
                <div class="checkout-item-image">
                    <img src="${item.image}" alt="${item.name}"
                         onerror="this.src='img/donut-1-svgrepo-com.svg'">
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
    
    getCheckoutRecommendations() {
        if (typeof RECOMMENDED_ITEMS === 'undefined') return [];
        const cartIds = new Set(this.cart.map(i => i.id));
        return RECOMMENDED_ITEMS.filter(r => !cartIds.has(r.id)).slice(0, 5);
    }

    renderCheckoutRecommendations() {
        const recs = this.getCheckoutRecommendations();
        if (recs.length === 0) return;

        // Insert between order-items and order-totals
        const orderTotals = document.querySelector('.order-totals');
        if (!orderTotals) return;

        const wrapper = document.createElement('div');
        wrapper.id = 'checkout-recommendations';
        wrapper.className = 'checkout-rec-section';

        wrapper.innerHTML = `
            <div class="checkout-rec-header">
                <i class="fas fa-fire-alt"></i>
                <span>Complete your order</span>
                <span class="checkout-rec-sub">Frequently ordered together</span>
            </div>
            <div class="checkout-rec-list">
                ${recs.map(item => `
                    <div class="checkout-rec-item" data-rec-id="${item.id}">
                        <div class="checkout-rec-img-wrap">
                            <img src="${item.image}" alt="${item.name}"
                                 onerror="this.src='https://via.placeholder.com/56x56?text=Cake'">
                            ${item.tag ? `<span class="checkout-rec-tag">${item.tag}</span>` : ''}
                        </div>
                        <div class="checkout-rec-info">
                            <p class="checkout-rec-name">${item.name}</p>
                            <p class="checkout-rec-price">${item.price}</p>
                        </div>
                        <button class="checkout-rec-add"
                                data-rec-id="${item.id}"
                                data-rec-name="${item.name}"
                                data-rec-price="${item.price}"
                                data-rec-image="${item.image}">
                            <i class="fas fa-plus"></i> Add
                        </button>
                    </div>
                `).join('')}
            </div>
        `;

        orderTotals.parentNode.insertBefore(wrapper, orderTotals);

        // Bind add buttons
        wrapper.querySelectorAll('.checkout-rec-add').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const b        = e.currentTarget;
                const recId    = b.dataset.recId;
                const recName  = b.dataset.recName;
                const recPrice = b.dataset.recPrice;
                const recImage = b.dataset.recImage;

                // Add to localStorage cart
                this.addToCart({ id: recId, name: recName, price: recPrice, image: recImage, quantity: 1 });

                // Visual feedback — disable button
                b.disabled = true;
                b.innerHTML = '<i class="fas fa-check"></i> Added';
                b.classList.add('added');

                // Also update the sidebar cart if it's loaded
                if (window.cartSystem) {
                    window.cartSystem.cart = this.cart;
                    window.cartSystem.saveCart();
                    window.cartSystem.updateCartCount();
                }

                this.calculateTotals();
                this.showCheckoutToast(`${recName} added!`);
            });
        });
    }

    addToCart(newItem) {
        const existing = this.cart.find(i => i.id === newItem.id);
        if (existing) {
            existing.quantity += 1;
        } else {
            this.cart.push(newItem);
        }
        // Persist
        try {
            localStorage.setItem('cloudbakes_cart', JSON.stringify(this.cart));
        } catch (e) { console.error(e); }
    }

    showCheckoutToast(message) {
        const toast = document.getElementById('toast');
        if (toast) {
            toast.textContent = message;
            toast.className   = 'toast success';
            toast.classList.add('show');
            setTimeout(() => toast.classList.remove('show'), 3000);
        }
    }

    calculateTotals() {
        const subtotal = this.cart.reduce((total, item) => {
            const cleanStr = String(item.price).replace(/[^0-9.]/g, '');
            let price = parseFloat(cleanStr) || 0;
            if (price > 0 && price < 50) price = price * 135;
            return total + (price * item.quantity);
        }, 0);

        const deliveryFee = 100;
        const tax         = subtotal * 0.13;
        const total       = subtotal + deliveryFee + tax;

        this.finalTotal = Math.round(total);

        document.getElementById('checkout-subtotal').textContent = `NPR ${Math.round(subtotal)}`;
        document.getElementById('checkout-delivery').textContent = `NPR ${deliveryFee}`;
        document.getElementById('checkout-tax').textContent      = `NPR ${Math.round(tax)}`;
        document.getElementById('checkout-total').textContent    = `NPR ${Math.round(total)}`;
    }

    async placeOrder() {
        const termsCheckbox = document.getElementById('terms-agree');
        if (termsCheckbox && !termsCheckbox.checked) {
            alert('Please agree to the terms and conditions');
            return;
        }

        const address = document.getElementById('addr-street')?.value || 'Not Provided';
        const city    = document.getElementById('addr-city')?.value   || 'Kathmandu';
        const zip     = document.getElementById('addr-zip')?.value    || '44600';

        const submitBtn    = document.getElementById('place-order-btn');
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';

        const orderData = {
            orderItems: this.cart.map(item => {
                const cleanStr = String(item.price).replace(/[^0-9.]/g, '');
                return {
                    product: item.id,
                    name:    item.name,
                    image:   item.image,
                    price:   parseFloat(cleanStr) || 0,
                    qty:     item.quantity
                };
            }),
            shippingAddress: { address, city, postalCode: zip, country: 'Nepal' },
            paymentMethod:   this.selectedPaymentMethod,
            totalPrice:      this.finalTotal
        };

        try {
            const res  = await fetch('http://localhost:5000/api/orders', {
                method: 'POST',
                headers: {
                    'Content-Type':  'application/json',
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
            submitBtn.disabled  = false;
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