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
      setTimeout(function() {
        if (!loadingOverlay.classList.contains('fade-out')) {
          loadingOverlay.classList.add('fade-out');
          body.classList.add('content-loaded');
          setTimeout(function() {
            loadingOverlay.style.display = 'none';
          }, 500);
        }
      }, 3000); 
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