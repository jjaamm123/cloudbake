class CheckoutManager {
    constructor() {
        this.cart                  = this.loadCart();
        this.token                 = localStorage.getItem('cloudbakes_token');
        this.selectedPaymentMethod = 'COD';
        this.finalTotal            = 0;
        this.initCheckout();
    }

    loadCart() {
        try {
            const saved = localStorage.getItem('cloudbakes_cart');
            return saved ? JSON.parse(saved) : [];
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

        this.prefillContactInfo();
        this.setupEventListeners();
        this.loadOrderSummary();
        this.renderCheckoutRecommendations();
        this.calculateTotals();
    }

    prefillContactInfo() {
        const userData = this.safeParseJSON(localStorage.getItem('cloudbakes_user'))
                      || this.safeParseJSON(localStorage.getItem('cloudbakeUser'))
                      || {};

        const nameEl  = document.getElementById('contact-name');
        const emailEl = document.getElementById('contact-email');
        const phoneEl = document.getElementById('contact-phone');

        if (nameEl  && !nameEl.value)  nameEl.value  = userData.name  || '';
        if (emailEl && !emailEl.value) emailEl.value = userData.email || '';
        if (phoneEl && !phoneEl.value) phoneEl.value = userData.phone || '';
    }

    setupEventListeners() {
        document.querySelectorAll('.payment-option').forEach(option => {
            option.addEventListener('click', () => {
                document.querySelectorAll('.payment-option').forEach(o => o.classList.remove('active'));
                option.classList.add('active');
                this.selectedPaymentMethod = option.dataset.method;
            });
        });

        document.getElementById('place-order-btn')
            ?.addEventListener('click', () => this.placeOrder());
    }

    loadOrderSummary() {
        const container = document.getElementById('checkout-items');
        if (!container) return;
        container.innerHTML = '';

        this.cart.forEach(item => {
            const price = this.parsePrice(item.price);
            const el    = document.createElement('div');
            el.className = 'checkout-item';
            el.innerHTML = `
                <div class="checkout-item-image">
                    <img src="${item.image}" alt="${item.name}"
                         onerror="this.src='img/donut-1-svgrepo-com.svg'">
                </div>
                <div class="checkout-item-details">
                    <div class="checkout-item-name">${item.name}</div>
                    <div class="checkout-item-price">NPR ${price.toFixed(0)}</div>
                    <div class="checkout-item-quantity">Quantity: ${item.quantity}</div>
                </div>
            `;
            container.appendChild(el);
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

        const orderTotals = document.querySelector('.order-totals');
        if (!orderTotals) return;

        const wrapper = document.createElement('div');
        wrapper.id        = 'checkout-recommendations';
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
            </div>`;

        orderTotals.parentNode.insertBefore(wrapper, orderTotals);

        wrapper.querySelectorAll('.checkout-rec-add').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const b = e.currentTarget;
                this.addToCart({
                    id: b.dataset.recId, name: b.dataset.recName,
                    price: b.dataset.recPrice, image: b.dataset.recImage, quantity: 1
                });
                b.disabled  = true;
                b.innerHTML = '<i class="fas fa-check"></i> Added';
                b.classList.add('added');
                if (window.cartSystem) {
                    window.cartSystem.cart = this.cart;
                    window.cartSystem.saveCart();
                    window.cartSystem.updateCartCount();
                }
                this.calculateTotals();
                this.showToast(`${b.dataset.recName} added!`);
            });
        });
    }

    addToCart(newItem) {
        const existing = this.cart.find(i => i.id === newItem.id);
        if (existing) { existing.quantity += 1; }
        else          { this.cart.push(newItem); }
        try { localStorage.setItem('cloudbakes_cart', JSON.stringify(this.cart)); }
        catch (e) { console.error(e); }
    }

    parsePrice(rawPrice) {
        if (typeof rawPrice === 'number') return rawPrice;
        const clean = String(rawPrice).replace(/[^0-9.]/g, '');
        return parseFloat(clean) || 0;
    }

    calculateTotals() {
        const subtotal = this.cart.reduce((total, item) =>
            total + (this.parsePrice(item.price) * item.quantity), 0);

        const deliveryFee = 100;
        const tax         = subtotal * 0.13;
        const total       = subtotal + deliveryFee + tax;
        this.finalTotal   = Math.round(total);

        document.getElementById('checkout-subtotal').textContent = `NPR ${Math.round(subtotal)}`;
        document.getElementById('checkout-delivery').textContent = `NPR ${deliveryFee}`;
        document.getElementById('checkout-tax').textContent      = `NPR ${Math.round(tax)}`;
        document.getElementById('checkout-total').textContent    = `NPR ${this.finalTotal}`;
    }

    async placeOrder() {
        // Terms
        const termsCheckbox = document.getElementById('terms-agree');
        if (termsCheckbox && !termsCheckbox.checked) {
            this.showToast('Please agree to the terms and conditions', 'error');
            return;
        }

        const street = document.getElementById('addr-street')?.value?.trim();
        const city   = document.getElementById('addr-city')?.value?.trim()   || 'Kathmandu';
        const zip    = document.getElementById('addr-zip')?.value?.trim()    || '44600';
        const name   = document.getElementById('contact-name')?.value?.trim();
        const phone  = document.getElementById('contact-phone')?.value?.trim();

        if (!street) {
            this.showToast('Please enter your delivery address', 'error');
            document.getElementById('addr-street')?.focus(); return;
        }
        if (!name) {
            this.showToast('Please enter your full name', 'error');
            document.getElementById('contact-name')?.focus(); return;
        }
        if (!phone) {
            this.showToast('Please enter your phone number', 'error');
            document.getElementById('contact-phone')?.focus(); return;
        }

        const submitBtn     = document.getElementById('place-order-btn');
        submitBtn.disabled  = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing…';

        const orderData = {
            orderItems: this.cart.map(item => ({
                product: item.id   || '',
                name:    item.name,
                image:   item.image || '',
                price:   this.parsePrice(item.price),
                qty:     item.quantity
            })),
            shippingAddress: {
                name,
                phone,
                address:    street,
                city,
                postalCode: zip,
                country:    'Nepal'
            },
            paymentMethod: this.selectedPaymentMethod,
            totalPrice:    this.finalTotal
        };

        try {
            const res  = await fetch('http://localhost:5000/api/orders', {
                method:  'POST',
                headers: {
                    'Content-Type':  'application/json',
                    'Authorization': `Bearer ${this.token}`
                },
                body: JSON.stringify(orderData)
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Order failed. Please try again.');

            this.clearCart();

            try {
                const profileRes = await fetch('http://localhost:5000/api/auth/profile', {
                    headers: { 'Authorization': `Bearer ${this.token}` }
                });
                if (profileRes.ok) {
                    const profile  = await profileRes.json();
                    const existing = this.safeParseJSON(localStorage.getItem('cloudbakes_user')) || {};
                    localStorage.setItem('cloudbakes_user', JSON.stringify({ ...existing, ...profile }));
                }
            } catch (profileErr) {
                // Non-critical — order is already saved, just log it
                console.warn('Profile refresh after order failed:', profileErr);
            }

            /* ── STEP 4: Show success modal ────────────────────── */
            const shortId   = String(data._id).slice(-8).toUpperCase();
            const orderIdEl = document.getElementById('order-id');
            if (orderIdEl) orderIdEl.textContent = shortId;

            const modal = document.getElementById('success-modal');
            if (modal) modal.classList.add('active');

        } catch (error) {
            console.error('Place order error:', error);
            this.showToast(error.message || 'Something went wrong. Please try again.', 'error');
            submitBtn.disabled  = false;
            submitBtn.innerHTML = '<i class="fas fa-lock"></i> Place Order';
        }
    }

    clearCart() {
        localStorage.removeItem('cloudbakes_cart');
        if (window.cartSystem) {
            window.cartSystem.cart = [];
            window.cartSystem.updateCartCount();
        }
    }

    safeParseJSON(str) {
        try { return JSON.parse(str); } catch { return null; }
    }

    showToast(message, type = 'success') {
        const toast = document.getElementById('toast');
        if (!toast) return;
        toast.textContent = message;
        toast.className   = `toast ${type}`;
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 3500);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.checkoutManager = new CheckoutManager();
});