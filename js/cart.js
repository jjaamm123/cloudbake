class ShoppingCart {
    constructor() {
        this.cart = this.loadCart();
        this.initCart();
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

    saveCart() {
        try {
            localStorage.setItem('cloudbakeCart', JSON.stringify(this.cart));
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
        const cartBtn = document.querySelector('.cart-btn');
        const cartOverlay = document.getElementById('cart-overlay');
        const cartSidebar = document.getElementById('cart-sidebar');
        const closeCart = document.getElementById('close-cart');

        if (cartBtn) {
            cartBtn.addEventListener('click', (e) => {
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
            
            let itemContainer = addBtn.closest('.item-card') || 
                            addBtn.closest('.menu-item') ||   
                            addBtn.closest('.item-card') ||   
                            addBtn.parentElement.parentElement; 
            
            if (!itemContainer) {
                console.error('Could not find item container for:', addBtn);
                return;
            }

            const itemName = addBtn.dataset.item || 
                        itemContainer.querySelector('h3')?.textContent || 
                        'Unknown Item';
            
            const itemImage = itemContainer.querySelector('img')?.src || '';
            const itemPrice = itemContainer.querySelector('.price')?.textContent || '$0.00';
            
            console.log('Adding item:', {
                name: itemName,
                price: itemPrice,
                containerClass: itemContainer.className
            });
            
            this.addItem({
                id: this.generateItemId(itemName),
                name: itemName,
                image: itemImage,
                price: itemPrice,
                quantity: 1
            });
            
            this.showToast(`${itemName} added to cart!`);
        });
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
            cartCount.textContent = this.cart.length;
        }
    }

    calculateTotal() {
        return this.cart.reduce((total, item) => {
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
    }

    renderCart() {
        const cartItems = document.getElementById('cart-items');
        const cartEmpty = document.getElementById('cart-empty');
        const cartTotal = document.getElementById('cart-total-price');

        if (!cartItems || !cartEmpty || !cartTotal) return;

        cartItems.innerHTML = '';

        if (this.cart.length === 0) {
            cartEmpty.style.display = 'block';
            cartItems.style.display = 'none';
            cartTotal.textContent = 'NPR 0';
            return;
        }

        cartEmpty.style.display = 'none';
        cartItems.style.display = 'flex';

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
            itemElement.className = 'cart-item';
            itemElement.innerHTML = `
                <div class="cart-item-image">
                    <img src="${item.image}" alt="${item.name}" onerror="this.src='https://via.placeholder.com/70x70?text=Food'">
                </div>
                <div class="cart-item-details">
                    <div class="cart-item-title">${item.name}</div>
                    <div class="cart-item-price">${displayPrice}</div>
                    <div class="cart-item-controls">
                        <button class="quantity-btn decrease" data-id="${item.id}">
                            <i class="fas fa-minus"></i>
                        </button>
                        <span class="cart-item-quantity">${item.quantity}</span>
                        <button class="quantity-btn increase" data-id="${item.id}">
                            <i class="fas fa-plus"></i>
                        </button>
                        <button class="remove-item" data-id="${item.id}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `;
            cartItems.appendChild(itemElement);
        });

        cartTotal.textContent = `NPR ${Math.round(this.calculateTotal())}`;
        this.addCartEventListeners();
    }

    addCartEventListeners() {
        document.querySelectorAll('.decrease').forEach(button => {
            button.addEventListener('click', (e) => {
                this.updateQuantity(e.currentTarget.dataset.id, -1);
            });
        });

        document.querySelectorAll('.increase').forEach(button => {
            button.addEventListener('click', (e) => {
                this.updateQuantity(e.currentTarget.dataset.id, 1);
            });
        });

        document.querySelectorAll('.remove-item').forEach(button => {
            button.addEventListener('click', (e) => {
                this.removeItem(e.currentTarget.dataset.id);
                this.showToast('Item removed from cart!', 'info');
            });
        });

        const checkoutBtn = document.getElementById('checkout-btn');
        if (checkoutBtn) {
            checkoutBtn.addEventListener('click', () => {
                if (this.cart.length === 0) {
                    this.showToast('Your cart is empty!', 'error');
                    return;
                }
                
                this.checkUserLogin();
            });
        }
    }

    checkUserLogin() {
        const userData = localStorage.getItem('cloudbakeUser');
        
        if (userData) {
            this.showToast('Proceeding to checkout...', 'success');
            
            setTimeout(() => {
                window.location.href = 'checkout.html';
            }, 1000);
        } else {
            this.showToast('Please login to continue checkout', 'info');
            
            localStorage.setItem('redirectAfterLogin', 'checkout.html');
            

            setTimeout(() => {
                window.location.href = 'login.html';
            }, 1500);
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

    clearCart() {
        this.cart = [];
        this.saveCart();
        this.updateCartCount();
        this.renderCart();
    }
}


document.addEventListener('DOMContentLoaded', () => {

    if (!window.cloudbakeCart) {
        window.cloudbakeCart = new ShoppingCart();
    } else {
        window.cloudbakeCart.updateCartCount();
    }
});