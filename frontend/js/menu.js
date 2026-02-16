const menuGrid = document.getElementById('menu-items-grid');
const loadingOverlay = document.getElementById('loading-overlay');

// --- 1. INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    // Only fetch if we are on the menu page
    if (menuGrid) {
        fetchProducts();
    } else {
        // If on Home page, just enable filters/search if they exist
        setupFiltersAndSearch();
    }
    
    setupScrollEffects();
});

// --- 2. FETCH DATA ---
async function fetchProducts() {
    try {
        const response = await fetch('http://localhost:5000/api/products');
        const products = await response.json();
        
        renderProducts(products);
        
        // Hide Loader
        if (loadingOverlay) loadingOverlay.style.display = 'none';

        // We DO NOT attach "Add" listeners here. 
        // Your cart.js is already listening to the document!
        setupFiltersAndSearch(); 

    } catch (error) {
        console.error("Error loading menu:", error);
        if (menuGrid) menuGrid.innerHTML = '<p class="error-msg">Sorry, the menu is taking a nap.</p>';
        if (loadingOverlay) loadingOverlay.style.display = 'none';
    }
}

// --- 3. RENDER HTML (Formatted for your cart.js) ---
function renderProducts(products) {
    menuGrid.innerHTML = products.map(product => {
        // 1. Format Price string exactly how cart.js expects it
        const priceDisplay = product.price > 50 
            ? `Rs ${product.price}` 
            : `$${product.price}`;
        
        let badgeHTML = product.rating >= 4.8 ? '<div class="item-badge">Bestseller</div>' : '';

        // 2. The HTML Structure
        // Notice we include 'data-item' on the button because your cart.js looks for it!
        return `
        <div class="menu-item" data-category="${product.category}">
            <div class="item-image">
                <img src="${product.image}" alt="${product.name}" loading="lazy">
                ${badgeHTML}
            </div>
            <div class="item-content">
                <h3>${product.name}</h3>
                <p>${product.description}</p>
                <div class="item-tags">
                    <span class="tag">${product.category}</span>
                </div>
                <div class="item-footer">
                    <span class="price">${priceDisplay}</span>
                    
                    <button class="add-btn" data-item="${product.name}">
                        <i class="fas fa-plus"></i> Add
                    </button>
                </div>
            </div>
        </div>
        `;
    }).join('');

    // Entrance Animation
    const items = document.querySelectorAll('.menu-item');
    items.forEach((item, index) => {
        setTimeout(() => {
            item.style.opacity = '1';
            item.style.transform = 'translateY(0)';
        }, index * 50); 
    });
}

// --- 4. FILTERS & SEARCH (Visuals only) ---
function setupFiltersAndSearch() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const searchInput = document.getElementById('menu-search');
    const menuItems = document.querySelectorAll('.menu-item');

    // Filter Logic
    if (filterButtons.length > 0) {
        filterButtons.forEach(button => {
            // Remove old listeners to be safe
            const newBtn = button.cloneNode(true);
            button.parentNode.replaceChild(newBtn, button);

            newBtn.addEventListener('click', function() {
                // Visual update
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                
                const filterValue = this.getAttribute('data-filter');
                const currentItems = document.querySelectorAll('.menu-item'); // Re-select in case of dynamic load

                currentItems.forEach(item => {
                    const itemCategory = item.getAttribute('data-category');
                    if (filterValue === 'all' || itemCategory === filterValue) {
                        item.style.display = 'block';
                        setTimeout(() => item.style.opacity = '1', 10);
                    } else {
                        item.style.opacity = '0';
                        setTimeout(() => item.style.display = 'none', 300);
                    }
                });
            });
        });
    }

    // Search Logic
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase().trim();
            const currentItems = document.querySelectorAll('.menu-item');

            currentItems.forEach(item => {
                const text = item.textContent.toLowerCase();
                if (text.includes(searchTerm)) {
                    item.style.display = 'block';
                    setTimeout(() => item.style.opacity = '1', 10);
                } else {
                    item.style.display = 'none';
                    item.style.opacity = '0';
                }
            });
        });
    }
}

function setupScrollEffects() {
    window.addEventListener('scroll', function() {
        const menuFilter = document.querySelector('.menu-filter');
        if (menuFilter) {
            menuFilter.style.boxShadow = window.scrollY > 100 
                ? '0 4px 20px rgba(0, 0, 0, 0.1)' 
                : '0 2px 10px rgba(0, 0, 0, 0.05)';
        }
    });
}