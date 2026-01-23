document.addEventListener('DOMContentLoaded', function() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const menuItems = document.querySelectorAll('.menu-item');
    const searchInput = document.getElementById('menu-search');
    
    const addButtons = document.querySelectorAll('.add-btn');
    const cartCount = document.querySelector('.cart-count');
    const toast = document.getElementById('toast');
    
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
                        item.classList.remove('hidden');
                    }, 10);
                } else {
                    item.style.opacity = '0';
                    item.style.transform = 'translateY(20px)';
                    setTimeout(() => {
                        item.style.display = 'none';
                        item.classList.add('hidden');
                    }, 300);
                }
            });
        });
    });
    
    searchInput.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase().trim();
        
        menuItems.forEach(item => {
            const itemName = item.querySelector('h3').textContent.toLowerCase();
            const itemDescription = item.querySelector('p').textContent.toLowerCase();
            const itemTags = Array.from(item.querySelectorAll('.tag')).map(tag => tag.textContent.toLowerCase());
            
            const matchesSearch = itemName.includes(searchTerm) || 
                                itemDescription.includes(searchTerm) ||
                                itemTags.some(tag => tag.includes(searchTerm));
            
            // Check current filter
            const activeFilter = document.querySelector('.filter-btn.active').getAttribute('data-filter');
            const itemCategory = item.getAttribute('data-category');
            
            const matchesFilter = activeFilter === 'all' || itemCategory === activeFilter;
            
            if (matchesSearch && matchesFilter) {
                item.style.display = 'block';
                setTimeout(() => {
                    item.style.opacity = '1';
                    item.style.transform = 'translateY(0)';
                    item.classList.remove('hidden');
                }, 10);
            } else {
                item.style.opacity = '0';
                item.style.transform = 'translateY(20px)';
                setTimeout(() => {
                    item.style.display = 'none';
                    item.classList.add('hidden');
                }, 300);
            }
        });
    });
    
    addButtons.forEach(button => {
        button.addEventListener('click', function() {
            const itemName = this.getAttribute('data-item');
            
            let currentCount = parseInt(cartCount.textContent) || 0;
            cartCount.textContent = currentCount + 1;
            
            cartCount.style.transform = 'scale(1.2)';
            setTimeout(() => {
                cartCount.style.transform = 'scale(1)';
            }, 300);
            
            if (toast) {
                toast.querySelector('span').textContent = `${itemName} added to cart!`;
                toast.classList.add('show');
                
                setTimeout(() => {
                    toast.classList.remove('show');
                }, 3000);
            }
            
            const originalHTML = this.innerHTML;
            const originalBackground = this.style.background;
            
            this.innerHTML = '<i class="fas fa-check"></i> Added';
            this.style.background = '#10b981';
            this.disabled = true;
            
            setTimeout(() => {
                this.innerHTML = originalHTML;
                this.style.background = originalBackground;
                this.disabled = false;
            }, 2000);
            

        });
    });
    
    menuItems.forEach(item => {
        item.style.display = 'block';
        item.style.opacity = '1';
        item.style.transform = 'translateY(0)';
        item.classList.remove('hidden');
    });
});

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