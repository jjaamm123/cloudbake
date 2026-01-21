const hamburger = document.getElementById('hamburger');
const navMenu = document.querySelector('.nav-menu');

hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
});

document.addEventListener('click', (e) => {
    if (!hamburger.contains(e.target) && !navMenu.contains(e.target)) {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
    }
});

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;
        
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            window.scrollTo({
                top: targetElement.offsetTop - 80,
                behavior: 'smooth'
            });
            
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        }
    });
});

let cartCount = 0;
const cartCountElement = document.querySelector('.cart-count');
const toast = document.getElementById('toast');

document.querySelectorAll('.add-btn').forEach(button => {
    button.addEventListener('click', function() {
        const item = this.getAttribute('data-item');
        
        cartCount++;
        cartCountElement.textContent = cartCount;
        
        toast.classList.add('show');
        setTimeout(() => {
            toast.classList.remove('show');
        }, 2000);
        
        this.innerHTML = '<i class="fas fa-check"></i>';
        this.style.background = 'var(--primary)';
        
        setTimeout(() => {
            this.innerHTML = '<i class="fas fa-plus"></i>';
            this.style.background = 'var(--secondary)';
        }, 1000);
        
        console.log(`Added to cart: ${item}`);
    });
});



const slideshowImages = [
    {
        url: "img/cake-prep.jpg",
        alt: "Custom Cake Design"
    },
    {
        url: "img/frosting.jpg",
        alt: "Ingredient Selection"
    },
    {
        url: "img/prep.jpg",
        alt: "Color Customization"
    },
    {
        url: "img/cake-done.jpg",
        alt: "Finished Creation"
    }
];

function initSlideshow() {
    const slideshowTrack = document.getElementById('slideshow-track');
    const slideshowDots = document.getElementById('slideshow-dots');
    
    slideshowTrack.innerHTML = '';
    slideshowDots.innerHTML = '';
    
    slideshowImages.forEach((image, index) => {
        const slide = document.createElement('div');
        slide.className = 'slideshow-slide';
        slide.innerHTML = `<img src="${image.url}" alt="${image.alt}">`;
        slideshowTrack.appendChild(slide);
        
        const dot = document.createElement('div');
        dot.className = `slideshow-dot ${index === 0 ? 'active' : ''}`;
        dot.addEventListener('click', () => goToSlide(index));
        slideshowDots.appendChild(dot);
    });
    
    startAutoSlide();
}

let currentSlide = 0;
let slideshowInterval;

function goToSlide(index) {
    currentSlide = index;
    updateSlideshow();
    resetAutoSlide();
}

function nextSlide() {
    currentSlide = (currentSlide + 1) % slideshowImages.length;
    updateSlideshow();
}

function prevSlide() {
    currentSlide = (currentSlide - 1 + slideshowImages.length) % slideshowImages.length;
    updateSlideshow();
}

function updateSlideshow() {
    const slideshowTrack = document.getElementById('slideshow-track');
    const dots = document.querySelectorAll('.slideshow-dot');
    
    slideshowTrack.style.transform = `translateX(-${currentSlide * 100}%)`;
    
    dots.forEach((dot, index) => {
        dot.classList.toggle('active', index === currentSlide);
    });
}

function startAutoSlide() {
    slideshowInterval = setInterval(nextSlide, 4000);
}

function resetAutoSlide() {
    clearInterval(slideshowInterval);
    startAutoSlide();
}

document.getElementById('next-slide')?.addEventListener('click', () => {
    nextSlide();
    resetAutoSlide();
});

document.getElementById('prev-slide')?.addEventListener('click', () => {
    prevSlide();
    resetAutoSlide();
});

const slideshowContainer = document.querySelector('.slideshow-container');
if (slideshowContainer) {
    slideshowContainer.addEventListener('mouseenter', () => {
        clearInterval(slideshowInterval);
    });
    
    slideshowContainer.addEventListener('mouseleave', () => {
        startAutoSlide();
    });
}

document.addEventListener('DOMContentLoaded', () => {
    initSlideshow();
    
    window.addEventListener('scroll', () => {
        const navbar = document.querySelector('.navbar');
        if (window.scrollY > 50) {
            navbar.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.08)';
        } else {
            navbar.style.boxShadow = 'none';
        }
    });
    
    const heroElements = document.querySelectorAll('.hero-content > *');
    heroElements.forEach((element, index) => {
        element.style.animationDelay = `${index * 0.15}s`;
    });
});



document.addEventListener('DOMContentLoaded', function() {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const userData = JSON.parse(localStorage.getItem('cloudbakeUser'));
    
    if (isLoggedIn && userData) {
        updateUIForLoggedInUser(userData);
    }
});

function updateUIForLoggedInUser(user) {
    const navIcons = document.querySelector('.nav-icons');
    if (navIcons) {
        const userMenu = document.createElement('div');
        userMenu.className = 'user-menu';
        userMenu.innerHTML = `
            <button class="user-btn">
                <i class="fas fa-user"></i>
                <span>${user.name.split(' ')[0]}</span>
                <i class="fas fa-chevron-down"></i>
            </button>
            <div class="user-dropdown">
                <a href="account.html" class="dropdown-item">
                    <i class="fas fa-user-circle"></i> My Account
                </a>
                <a href="loyalty.html" class="dropdown-item">
                    <i class="fas fa-crown"></i> Loyalty (${user.points} pts)
                </a>
                ${user.role === 'wholesale' ? `
                <a href="wholesale.html" class="dropdown-item">
                    <i class="fas fa-store"></i> Wholesale Portal
                </a>
                ` : ''}
                <hr>
                <a href="#" class="dropdown-item logout-btn">
                    <i class="fas fa-sign-out-alt"></i> Logout
                </a>
            </div>
        `;
        
        const cartBtn = document.querySelector('.cart-btn');
        navIcons.insertBefore(userMenu, cartBtn);
        
        const logoutBtn = userMenu.querySelector('.logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', function(e) {
                e.preventDefault();
                localStorage.removeItem('isLoggedIn');
                localStorage.removeItem('cloudbakeUser');
                location.reload();
            });
        }
        
        const userBtn = userMenu.querySelector('.user-btn');
        const dropdown = userMenu.querySelector('.user-dropdown');
        
        userBtn.addEventListener('click', function() {
            dropdown.classList.toggle('show');
        });
        
        document.addEventListener('click', function(e) {
            if (!userMenu.contains(e.target)) {
                dropdown.classList.remove('show');
            }
        });
    }
    
    const userMenuStyle = document.createElement('style');
    userMenuStyle.textContent = `
        .user-menu {
            position: relative;
            margin-right: 1rem;
        }
        
        .user-btn {
            background: linear-gradient(135deg, #ffafbd 0%, #ffc3a0 100%);
            color: white;
            border: none;
            padding: 0.5rem 1rem;
            border-radius: 50px;
            display: flex;
            align-items: center;
            gap: 0.5rem;
            cursor: pointer;
            font-weight: 500;
            transition: all 0.3s ease;
        }
        
        .user-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(255, 175, 189, 0.3);
        }
        
        .user-dropdown {
            position: absolute;
            top: 100%;
            right: 0;
            background: white;
            border-radius: 10px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
            min-width: 200px;
            padding: 0.5rem 0;
            opacity: 0;
            visibility: hidden;
            transform: translateY(-10px);
            transition: all 0.3s ease;
            z-index: 1000;
        }
        
        .user-dropdown.show {
            opacity: 1;
            visibility: visible;
            transform: translateY(5px);
        }
        
        .dropdown-item {
            display: flex;
            align-items: center;
            gap: 0.8rem;
            padding: 0.8rem 1.5rem;
            color: #333;
            text-decoration: none;
            transition: all 0.3s ease;
        }
        
        .dropdown-item:hover {
            background: #f8f9fa;
            color: #ff6b6b;
        }
        
        .dropdown-item i {
            width: 20px;
            text-align: center;
        }
        
        .user-dropdown hr {
            margin: 0.5rem 0;
            border: none;
            border-top: 1px solid #eee;
        }
        
        .logout-btn {
            color: #ff4757 !important;
        }
    `;
    document.head.appendChild(userMenuStyle);
}