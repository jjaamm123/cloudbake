
let allProducts = [];
const menuGrid = document.getElementById('menu-items-grid');
const loadingOverlay = document.getElementById('loading-overlay');
const toast = document.getElementById('toast');
const cartCount = document.querySelector('.cart-count');

//INITIALIZATION
document.addEventListener('DOMContentLoaded', () => {
    fetchProducts();
    setupScrollEffects();
});

//FETCH DATA
async function fetchProducts() {
    try {
        const response = await fetch('http://localhost:5000/api/products');
        allProducts = await response.json();
        
        renderProducts(allProducts);
        
        setupInteractions();
        

        if (loadingOverlay) loadingOverlay.style.display = 'none';

    } catch (error) {
        console.error("Error loading menu:", error);
        menuGrid.innerHTML = '<p class="error-msg">Sorry, the menu is taking a nap. Please try again later.</p>';
        if (loadingOverlay) loadingOverlay.style.display = 'none';
    }
}

//RENDER HTML
function renderProducts(products) {
    menuGrid.innerHTML = products.map(product => {
        const priceDisplay = product.price > 50 
            ? `Rs ${product.price}` 
            : `$${product.price}`;
        
        let badgeHTML = '';
        if (product.rating >= 4.8) badgeHTML = '<div class="item-badge">Bestseller</div>';
        else if (product.category === 'seasonal') badgeHTML = '<div class="item-badge">Seasonal</div>';

        return `
        <div class="menu-item" data-category="${product.category}" style="opacity: 0; transform: translateY(20px);">
            <div class="item-image">
                <img src="${product.image}" alt="${product.name}" loading="lazy">
                ${badgeHTML}
            </div>
            <div class="item-content">
                <h3>${product.name}</h3>
                <p>${product.description}</p>
                <div class="item-tags">
                    <span class="tag">${product.category}</span>
                    <span class="tag">Vegetarian</span>
                </div>
                <div class="item-footer">
                    <span class="price">${priceDisplay}</span>
                    <button class="add-btn" 
                        data-id="${product._id}" 
                        data-name="${product.name}" 
                        data-price="${product.price}" 
                        data-image="${product.image}">
                        <i class="fas fa-plus"></i> Add
                    </button>
                </div>
            </div>
        </div>
        `;
    }).join('');


    const items = document.querySelectorAll('.menu-item');
    items.forEach((item, index) => {
        setTimeout(() => {
            item.style.opacity = '1';
            item.style.transform = 'translateY(0)';
        }, index * 50); 
    });
}

//QOL INTERACTIONS
function setupInteractions() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const searchInput = document.getElementById('menu-search');
    const menuItems = document.querySelectorAll('.menu-item');
    const addButtons = document.querySelectorAll('.add-btn');

    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            const filterValue = this.getAttribute('data-filter');
            
            menuItems.forEach(item => {
                const itemCategory = item.getAttribute('data-category');
                
                if (filterValue === 'all' || itemCategory === filterValue) {
                    
                    item.style.display = 'block';
                    setTimeout(() => {
                        item.style.opacity = '1';
                        item.style.transform = 'translateY(0)';
                    }, 10);
                } else {
                    
                    item.style.opacity = '0';
                    item.style.transform = 'translateY(20px)';
                    setTimeout(() => {
                        item.style.display = 'none';
                    }, 300);
                }
            });
        });
    });

    //Search Logic
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase().trim();
            const activeFilter = document.querySelector('.filter-btn.active').getAttribute('data-filter');

            menuItems.forEach(item => {
                const itemName = item.querySelector('h3').textContent.toLowerCase();
                const itemDesc = item.querySelector('p').textContent.toLowerCase();
                const itemCategory = item.getAttribute('data-category');

                const matchesSearch = itemName.includes(searchTerm) || itemDesc.includes(searchTerm);
                const matchesFilter = activeFilter === 'all' || itemCategory === activeFilter;

                if (matchesSearch && matchesFilter) {
                    item.style.display = 'block';
                    setTimeout(() => {
                        item.style.opacity = '1';
                        item.style.transform = 'translateY(0)';
                    }, 10);
                } else {
                    item.style.opacity = '0';
                    item.style.transform = 'translateY(20px)';
                    setTimeout(() => {
                        item.style.display = 'none';
                    }, 300);
                }
            });
        });
    }

    //Cart Animation
    addButtons.forEach(button => {
        button.addEventListener('click', function() {
            const product = {
                id: this.getAttribute('data-id'),
                name: this.getAttribute('data-name'),
                price: this.getAttribute('data-price'),
                image: this.getAttribute('data-image')
            };

            let currentCount = parseInt(cartCount.textContent) || 0;
            cartCount.textContent = currentCount + 1;
            
            cartCount.style.transform = 'scale(1.2)';
            setTimeout(() => cartCount.style.transform = 'scale(1)', 300);

            showToast(`${product.name} added to cart!`);

            const originalHTML = this.innerHTML;
            const originalBg = this.style.background;
            
            this.innerHTML = '<i class="fas fa-check"></i> Added';
            this.style.background = '#10b981';
            this.disabled = true;

            setTimeout(() => {
                this.innerHTML = originalHTML;
                this.style.background = originalBg;
                this.disabled = false;
            }, 2000);


            let cart = JSON.parse(localStorage.getItem('cloudbakes_cart')) || [];

            const existingItem = cart.find(item => item.id === product.id);

            if (existingItem) {
                existingItem.quantity += 1;
            } else {
                cart.push({ ...product, quantity: 1 });
            }

            localStorage.setItem('cloudbakes_cart', JSON.stringify(cart));

            updateCartCount();
                });
            });
        }

//HELPER FUNCTIONS 

function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.className = 'toast show';
    toast.style.background = '#4CAF50'; 
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

function setupScrollEffects() {
    window.addEventListener('scroll', function() {
        const menuFilter = document.querySelector('.menu-filter');
        if (menuFilter) {
            if (window.scrollY > 100) {
                menuFilter.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.1)';
                menuFilter.style.backdropFilter = 'blur(10px)';
            } else {
                menuFilter.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.05)';
                menuFilter.style.backdropFilter = 'none';
            }
        }
    });
}