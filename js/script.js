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

document.getElementById('launch-maker')?.addEventListener('click', (e) => {
    e.preventDefault();
    alert('🎨 Custom Maker launching! This interactive tool lets you design your dream pastry with real-time preview.');
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