(function() {
  'use strict';
  
  document.addEventListener('DOMContentLoaded', function() {
    const loadingOverlay = document.getElementById('loading-overlay');
    const body = document.body;
    
    if (!loadingOverlay) {
      console.warn('Loading overlay not found');
      return;
    }
    
    const messages = getLoadingMessages();
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    
    const loadingText = loadingOverlay.querySelector('.loading-text');
    if (loadingText) {
      loadingText.textContent = randomMessage;
    }
    
    setTimeout(function() {
      loadingOverlay.classList.add('fade-out');
      body.classList.add('content-loaded');
      
      setTimeout(function() {
        loadingOverlay.style.display = 'none';
      }, 500); 
    }, 1500);
    
window.addEventListener('load', function() {
    const loader = document.getElementById('loading-overlay');
    const body = document.body;
    
    if (loader) {
        
        requestAnimationFrame(function() {
            
            setTimeout(function() {
                
                loader.style.opacity = '0';
                loader.style.transition = 'opacity 0.5s ease';
                
                
                setTimeout(function() {
                    body.style.opacity = '1';
                }, 200); 
                
                
                setTimeout(function() {
                    loader.style.display = 'none';
                    
                    
                    body.style.visibility = 'visible';
                    body.style.opacity = '1';
                    
                    
                    document.querySelectorAll('.animate-in').forEach(el => {
                        el.style.animationPlayState = 'running';
                    });
                }, 500);
            }, 100);
        });
    }
});
    
    setupNavigationLoader();
  });
  
  function getLoadingMessages() {
    const path = window.location.pathname;
    
    if (path.includes('custom-maker')) {
      return [
        "Designing your dream cake...",
        "Mixing custom ingredients...",
        "Icing your creation...",
        "Adding personalized touches...",
        "Preparing your unique order..."
      ];
    }
    
    return [
      "Baking something delicious...",
      "Whisking up magic...",
      "Almost ready to serve...",
      "Fresh from the oven...",
      "Creating cloud treats...",
      "Sprinkling some joy..."
    ];
  }
  
  function setupNavigationLoader() {
    document.addEventListener('click', function(e) {
      const link = e.target.closest('a');
      
      if (link && 
          link.href && 
          !link.href.includes('#') && 
          link.target !== '_blank' &&
          link.href !== window.location.href &&
          isInternalLink(link.href)) {
        
        e.preventDefault();
        
        const loadingOverlay = document.getElementById('loading-overlay');
        if (loadingOverlay) {
          loadingOverlay.style.display = 'flex';
          loadingOverlay.classList.remove('fade-out');
          
          const loadingText = loadingOverlay.querySelector('.loading-text');
          if (loadingText) {
            const navMessages = [
              "Heading to the kitchen...",
              "Getting things ready...",
              "Preparing next page...",
              "Almost there..."
            ];
            loadingText.textContent = navMessages[Math.floor(Math.random() * navMessages.length)];
          }
          
          setTimeout(() => {
            window.location.href = link.href;
          }, 300);
        }
      }
    });
  }
  
  function isInternalLink(url) {
    try {
      const linkUrl = new URL(url, window.location.href);
      const currentUrl = new URL(window.location.href);
      return linkUrl.hostname === currentUrl.hostname;
    } catch {
      return false;
    }
  }
  
})();