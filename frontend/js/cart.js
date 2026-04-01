
const RECOMMENDED_ITEMS = [
    {
        id: 'rec-vanilla-cloud-sponge',
        name: 'Vanilla Cloud Sponge',
        price: 'Rs 500',
        image: 'img/vanilla-c.jpg',
        tag: 'Bestseller'
    },
    {
        id: 'rec-chocolate-fudge-cake',
        name: 'Chocolate Fudge Cake',
        price: 'Rs 700',
        image: 'img/chocolate-fudge.jpg',
        tag: 'Popular'
    },
    {
        id: 'rec-red-velvet',
        name: 'Red Velvet Cake',
        price: 'Rs 1200',
        image: 'img/red-velvet.jpg',
        tag: 'Fan Fave'
    },
    {
        id: 'rec-carrot-cake',
        name: 'Carrot Walnut Cake',
        price: 'Rs 1500',
        image: 'img/carrot-cake.jpg',
        tag: 'Seasonal'
    },
    {
        id: 'rec-fresh-berries',
        name: 'Berry Cream Tart',
        price: 'Rs 699',
        image: 'img/berries.jpg',
        tag: 'New'
    },
    {
        id: 'rec-lemon-curd-roll',
        name: 'Lemon Curd Swiss Roll',
        price: 'Rs 599',
        image: 'img/lemon.jpg',
        tag: 'Chef\'s Pick'
    },
    {
        id: 'rec-ganache-brownie',
        name: 'Ganache Brownie Box',
        price: 'Rs 699',
        image: 'img/ganache.jpg',
        tag: 'Treat'
    },
    {
        id: 'rec-cream-cheese-danish',
        name: 'Cream Cheese Danish',
        price: 'Rs 599',
        image: 'img/cheese.jpg',
        tag: 'Bakery Fresh'
    }
];

class ShoppingCart {
    constructor() {
        this.storageKey = 'cloudbakes_cart';
        this.cart = this.loadCart();
        this.initCart();
    }

    loadCart() {
        try {
            const savedCart = localStorage.getItem(this.storageKey);
            return savedCart ? JSON.parse(savedCart) : [];
        } catch (e) {
            console.error('Error loading cart:', e);
            return [];
        }
    }

    saveCart() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.cart));
            this.updateCartCount();
        } catch (e) {
            console.error('Error saving cart:', e);
        }
    }

    initCart() {
        this.updateCartCount();
        this.setupEventListeners();
        this.renderCart();
    }

    setupEventListeners() {
        const cartBtn     = document.querySelector('.cart-btn');
        const cartOverlay = document.getElementById('cart-overlay');
        const cartSidebar = document.getElementById('cart-sidebar');
        const closeCart   = document.getElementById('close-cart');

        if (cartBtn) {
            const newBtn = cartBtn.cloneNode(true);
            cartBtn.parentNode.replaceChild(newBtn, cartBtn);

            newBtn.addEventListener('click', (e) => {
                e.preventDefault();
                cartSidebar.classList.add('active');
                cartOverlay.classList.add('active');
                this.renderCart();
            });
        }

        if (closeCart) {
            closeCart.addEventListener('click', () => {
                cartSidebar.classList.remove('active');
                cartOverlay.classList.remove('active');
            });
        }

        if (cartOverlay) {
            cartOverlay.addEventListener('click', () => {
                cartSidebar.classList.remove('active');
                cartOverlay.classList.remove('active');
            });
        }

        document.addEventListener('click', (e) => {
            const addBtn = e.target.closest('.add-btn');
            if (!addBtn) return;
            e.preventDefault();

            let itemContainer = addBtn.closest('.item-card')  ||
                                addBtn.closest('.menu-item')  ||
                                addBtn.parentElement.parentElement;

            if (!itemContainer) {
                console.error('Could not find item container for:', addBtn);
                return;
            }

            const itemName  = addBtn.dataset.item ||
                            itemContainer.querySelector('h3')?.textContent ||
                            'Unknown Item';
            const itemImage = itemContainer.querySelector('img')?.src || '';
            const itemPrice = itemContainer.querySelector('.price')?.textContent || 'Rs 0';

            this.addItem({
                id:       this.generateItemId(itemName),
                name:     itemName,
                image:    itemImage,
                price:    itemPrice,
                quantity: 1
            });

            this.showToast(`${itemName} added to cart!`);
        });

        const checkoutBtn = document.getElementById('checkout-btn');
        if (checkoutBtn) {
            const newBtn = checkoutBtn.cloneNode(true);
            checkoutBtn.parentNode.replaceChild(newBtn, checkoutBtn);

            newBtn.addEventListener('click', () => {
                if (this.cart.length === 0) {
                    this.showToast('Your cart is empty!', 'error');
                    return;
                }
                this.checkUserLogin();
            });
        }
    }

    generateItemId(name) {
        return name.toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/[^\w-]/g, '')
            .substring(0, 50);
    }

    addItem(newItem) {
        const existingItem = this.cart.find(item => item.id === newItem.id);

        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            this.cart.push(newItem);
        }

        this.saveCart();
        this.updateCartCount();

        const cartSidebar = document.getElementById('cart-sidebar');
        if (cartSidebar && cartSidebar.classList.contains('active')) {
            this.renderCart();
        }
    }

    removeItem(itemId) {
        this.cart = this.cart.filter(item => item.id !== itemId);
        this.saveCart();
        this.updateCartCount();
        this.renderCart();
    }

    updateQuantity(itemId, change) {
        const item = this.cart.find(item => item.id === itemId);
        if (item) {
            item.quantity += change;
            if (item.quantity <= 0) {
                this.removeItem(itemId);
            } else {
                this.saveCart();
                this.updateCartCount();
                this.renderCart();
            }
        }
    }

    updateCartCount() {
        const cartCount = document.querySelector('.cart-count');
        if (cartCount) {
            cartCount.textContent = this.cart.reduce((sum, item) => sum + item.quantity, 0);
        }
    }

    calculateTotal() {
        return this.cart.reduce((total, item) => {
            const priceText = item.price.toString().toLowerCase();
            let price = 0;

            if (priceText.includes('rs') || priceText.includes('npr')) {
                const match = priceText.match(/(\d+\.?\d*)/);
                price = match ? parseFloat(match[1]) : 0;
                const forMatch = priceText.match(/for\s+(\d+)/);
                if (forMatch) price = price / parseInt(forMatch[1]);
            } else if (priceText.includes('$')) {
                const match = priceText.match(/(\d+\.?\d*)/);
                price = (match ? parseFloat(match[1]) : 0) * 135;
            } else {
                price = parseFloat(item.price) || 0;
            }

            return total + (price * item.quantity);
        }, 0);
    }

    getRecommendations() {
        const cartIds = new Set(this.cart.map(i => i.id));
        return RECOMMENDED_ITEMS.filter(r => !cartIds.has(r.id));
    }

    renderRecommendations() {
        const recs = this.getRecommendations();

        // Remove any old recommendations block
        const old = document.getElementById('cart-recommendations');
        if (old) old.remove();

        if (recs.length === 0) return;

        const cartBody = document.getElementById('cart-body-inner') || document.querySelector('.cart-body');
        if (!cartBody) return;

        const wrapper = document.createElement('div');
        wrapper.id = 'cart-recommendations';
        wrapper.className = 'cart-recommendations';

        wrapper.innerHTML = `
            <div class="cart-rec-header">
                <span class="cart-rec-title">
                    <i class="fas fa-sparkles"></i> You might also like
                </span>
            </div>
            <div class="cart-rec-scroll">
                ${recs.slice(0, 6).map(item => `
                    <div class="cart-rec-card">
                        <div class="cart-rec-image">
                            <img src="${item.image}" alt="${item.name}"
                                 onerror="this.src='https://via.placeholder.com/100x80?text=Cake'">
                            ${item.tag ? `<span class="cart-rec-tag">${item.tag}</span>` : ''}
                        </div>
                        <div class="cart-rec-info">
                            <p class="cart-rec-name">${item.name}</p>
                            <p class="cart-rec-price">${item.price}</p>
                        </div>
                        <button class="cart-rec-add-btn"
                                data-rec-id="${item.id}"
                                data-rec-name="${item.name}"
                                data-rec-price="${item.price}"
                                data-rec-image="${item.image}"
                                title="Add to cart">
                            <i class="fas fa-plus"></i>
                        </button>
                    </div>
                `).join('')}
            </div>
        `;

        cartBody.appendChild(wrapper);

        wrapper.querySelectorAll('.cart-rec-add-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const b = e.currentTarget;
                this.addItem({
                    id:       b.dataset.recId,
                    name:     b.dataset.recName,
                    price:    b.dataset.recPrice,
                    image:    b.dataset.recImage,
                    quantity: 1
                });
                this.showToast(`${b.dataset.recName} added to cart!`);
            });
        });
    }


    renderCart() {
        const cartItems  = document.getElementById('cart-items');
        const cartEmpty  = document.getElementById('cart-empty');
        const cartTotal  = document.getElementById('cart-total-price');

        if (!cartItems || !cartEmpty || !cartTotal) return;

        cartItems.innerHTML = '';

        if (this.cart.length === 0) {
            cartEmpty.style.display  = 'flex';
            cartItems.style.display  = 'none';
            cartTotal.textContent    = 'NPR 0';
        } else {
            cartEmpty.style.display  = 'none';
            cartItems.style.display  = 'block';

            this.cart.forEach(item => {
                const itemElement = document.createElement('div');
                itemElement.className = 'cart-item';
                itemElement.innerHTML = `
                    <div class="cart-item-image">
                        <img src="${item.image}" alt="${item.name}"
                             onerror="this.src='https://via.placeholder.com/70x70?text=Food'">
                    </div>
                    <div class="cart-item-details">
                        <div class="cart-item-title">${item.name}</div>
                        <div class="cart-item-price">${item.price}</div>
                        <div class="cart-item-controls">
                            <button class="quantity-btn decrease" data-id="${item.id}"><i class="fas fa-minus"></i></button>
                            <span class="cart-item-quantity">${item.quantity}</span>
                            <button class="quantity-btn increase" data-id="${item.id}"><i class="fas fa-plus"></i></button>
                            <button class="remove-item" data-id="${item.id}"><i class="fas fa-trash"></i></button>
                        </div>
                    </div>
                `;
                cartItems.appendChild(itemElement);
            });

            cartTotal.textContent = `NPR ${Math.round(this.calculateTotal())}`;
            this.addCartEventListeners();
        }

        // Always render recommendations after cart items
        this.renderRecommendations();
    }

    addCartEventListeners() {
        document.querySelectorAll('.decrease').forEach(btn =>
            btn.addEventListener('click', (e) => this.updateQuantity(e.currentTarget.dataset.id, -1)));

        document.querySelectorAll('.increase').forEach(btn =>
            btn.addEventListener('click', (e) => this.updateQuantity(e.currentTarget.dataset.id, 1)));

        document.querySelectorAll('.remove-item').forEach(btn =>
            btn.addEventListener('click', (e) => {
                this.removeItem(e.currentTarget.dataset.id);
                this.showToast('Item removed', 'info');
            }));
    }

    checkUserLogin() {
        const token = localStorage.getItem('cloudbakes_token');
        if (token) {
            this.showToast('Proceeding to checkout...', 'success');
            setTimeout(() => { window.location.href = 'checkout.html'; }, 1000);
        } else {
            this.showToast('Please login to continue', 'info');
            localStorage.setItem('redirectAfterLogin', 'checkout.html');
            setTimeout(() => { window.location.href = 'login.html'; }, 1500);
        }
    }

    showToast(message, type = 'success') {
        const toast = document.getElementById('toast');
        if (toast) {
            toast.textContent = message;
            toast.className   = `toast ${type}`;
            toast.classList.add('show');
            setTimeout(() => toast.classList.remove('show'), 3000);
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.cartSystem = new ShoppingCart();
});