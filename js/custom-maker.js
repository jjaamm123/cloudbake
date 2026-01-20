document.addEventListener('DOMContentLoaded', function() {
    let order = {
        base: null,
        size: { inches: '8', price: 500 },
        fillings: [],
        layers: { count: 2, price: 0 },
        icing: null,
        extras: [],
        specialRequest: '',
        uploadedImage: null,
        total: 0
    };

    const stepSections = document.querySelectorAll('.option-section');
    const progressSteps = document.querySelectorAll('.progress-step');
    const prevBtn = document.getElementById('prev-step');
    const nextBtn = document.getElementById('next-step');
    const submitBtn = document.getElementById('submit-order');
    const clearBtn = document.getElementById('clear-all');
    const viewSummaryBtn = document.getElementById('view-summary');
    const saveDraftBtn = document.getElementById('save-draft');
    const currentTotalEl = document.getElementById('current-total');
    
    const summaryBase = document.getElementById('summary-base');
    const summaryFilling = document.getElementById('summary-filling');
    const summaryIcing = document.getElementById('summary-icing');
    const summaryExtras = document.getElementById('summary-extras');
    const subtotalEl = document.getElementById('subtotal');
    const sizeUpgradeEl = document.getElementById('size-upgrade');
    const layersUpgradeEl = document.getElementById('layers-upgrade');
    const taxEl = document.getElementById('tax');
    const finalTotalEl = document.getElementById('final-total');
    
    const specialRequest = document.getElementById('special-request');
    const uploadArea = document.getElementById('upload-area');
    const imageUpload = document.getElementById('image-upload');
    const previewContainer = document.getElementById('preview-container');
    
    const successModal = document.getElementById('success-modal');
    const modalClose = document.querySelector('.modal-close');
    const newDesignBtn = document.getElementById('new-design');
    const goHomeBtn = document.getElementById('go-home');
    const orderIdEl = document.getElementById('order-id');

    let currentStep = 1;

    init();

    function init() {
        loadDraft();
        setupEventListeners();
        updateStepDisplay();
        calculateTotal();
        updateSummary();
    }

    function setupEventListeners() {
        prevBtn.addEventListener('click', goToPreviousStep);
        nextBtn.addEventListener('click', goToNextStep);
        submitBtn.addEventListener('click', submitOrder);
        
        document.querySelectorAll('.select-btn').forEach(btn => {
            btn.addEventListener('click', handleOptionSelect);
        });
        
        document.querySelectorAll('.size-btn').forEach(btn => {
            btn.addEventListener('click', handleSizeSelect);
        });
        
        document.querySelectorAll('.layer-btn').forEach(btn => {
            btn.addEventListener('click', handleLayerSelect);
        });
        
        specialRequest.addEventListener('input', function() {
            order.specialRequest = this.value;
        });
        
        uploadArea.addEventListener('click', () => imageUpload.click());
        uploadArea.addEventListener('dragover', handleDragOver);
        uploadArea.addEventListener('drop', handleDrop);
        imageUpload.addEventListener('change', handleImageUpload);
        
        clearBtn.addEventListener('click', clearAllSelections);
        viewSummaryBtn.addEventListener('click', scrollToSummary);
        saveDraftBtn.addEventListener('click', saveDraft);
        
        modalClose.addEventListener('click', closeModal);
        newDesignBtn.addEventListener('click', resetForm);
        goHomeBtn.addEventListener('click', () => window.location.href = 'index.html');
        
        successModal.addEventListener('click', function(e) {
            if (e.target === this) closeModal();
        });
    }

    function goToPreviousStep() {
        if (currentStep > 1) {
            currentStep--;
            updateStepDisplay();
        }
    }

    function goToNextStep() {
        if (validateCurrentStep()) {
            if (currentStep < 4) {
                currentStep++;
                updateStepDisplay();
            }
        } else {
            showNotification('Please complete this step before proceeding.', 'warning');
        }
    }

    function validateCurrentStep() {
        switch(currentStep) {
            case 1:
                return order.base !== null;
            case 2:
                return order.fillings.length > 0;
            case 3:
                return order.icing !== null;
            case 4:
                return true;
            default:
                return true;
        }
    }

    function updateStepDisplay() {
        stepSections.forEach(section => {
            section.classList.remove('active');
        });
        
        document.querySelector(`[data-step="${currentStep}"]`).classList.add('active');
        
        progressSteps.forEach(step => {
            const stepNum = parseInt(step.dataset.step);
            step.classList.remove('active', 'completed');
            
            if (stepNum < currentStep) {
                step.classList.add('completed');
            } else if (stepNum === currentStep) {
                step.classList.add('active');
            }
        });
        
        prevBtn.style.display = currentStep === 1 ? 'none' : 'flex';
        nextBtn.style.display = currentStep === 4 ? 'none' : 'flex';
        submitBtn.style.display = currentStep === 4 ? 'flex' : 'none';
        
        document.querySelector('.custom-options').scrollTop = 0;
    }

    function handleOptionSelect(e) {
        const card = e.target.closest('.option-card');
        const optionType = card.dataset.option;
        const optionValue = card.dataset.value;
        const optionPrice = parseFloat(card.dataset.price);
        
        document.querySelectorAll(`[data-option="${optionType}"]`).forEach(c => {
            c.classList.remove('selected');
            c.querySelector('.select-btn').textContent = 'Select';
            c.querySelector('.select-btn').classList.remove('selected');
        });
        
        card.classList.add('selected');
        const btn = card.querySelector('.select-btn');
        btn.textContent = 'Selected ✓';
        btn.classList.add('selected');
        
        switch(optionType) {
            case 'base':
                order.base = {
                    name: card.querySelector('h3').textContent,
                    value: optionValue,
                    price: optionPrice
                };
                break;
            case 'filling':
                const existingIndex = order.fillings.findIndex(f => f.value === optionValue);
                
                if (existingIndex > -1) {
                    order.fillings.splice(existingIndex, 1);
                    card.classList.remove('selected');
                    btn.textContent = 'Select';
                    btn.classList.remove('selected');
                } else if (order.fillings.length < 2) {
                    order.fillings.push({
                        name: card.querySelector('h3').textContent,
                        value: optionValue,
                        price: optionPrice
                    });
                } else {
                    showNotification('You can select up to 2 fillings only', 'warning');
                    card.classList.remove('selected');
                    btn.textContent = 'Select';
                    btn.classList.remove('selected');
                    return;
                }
                break;
            case 'icing':
                order.icing = {
                    name: card.querySelector('h3').textContent,
                    value: optionValue,
                    price: optionPrice
                };
                break;
            case 'extra':
                const extraIndex = order.extras.findIndex(e => e.value === optionValue);
                
                if (extraIndex > -1) {
                    order.extras.splice(extraIndex, 1);
                    card.classList.remove('selected');
                    btn.textContent = 'Select';
                    btn.classList.remove('selected');
                } else {
                    order.extras.push({
                        name: card.querySelector('h3').textContent,
                        value: optionValue,
                        price: optionPrice
                    });
                }
                break;
        }
        
        calculateTotal();
        updateSummary();
    }

    function handleSizeSelect(e) {
        const btn = e.target.closest('.size-btn');
        const size = btn.dataset.size;
        const price = parseFloat(btn.dataset.price);
        
        document.querySelectorAll('.size-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        order.size = { inches: size, price: price };
        
        calculateTotal();
        updateSummary();
    }

    function handleLayerSelect(e) {
        const btn = e.target.closest('.layer-btn');
        const count = parseInt(btn.dataset.layers);
        const price = parseFloat(btn.dataset.price);
        
        document.querySelectorAll('.layer-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        order.layers = { count: count, price: price };
        
        calculateTotal();
        updateSummary();
    }

    function calculateTotal() {
        let subtotal = 0;
        
        if (order.base) {
            subtotal += order.base.price;
        }
        
        order.fillings.forEach(filling => {
            subtotal += filling.price;
        });
        
        if (order.icing) {
            subtotal += order.icing.price;
        }
        
        order.extras.forEach(extra => {
            subtotal += extra.price;
        });
        
        const sizeUpgrade = order.size.price;
        const layersUpgrade = order.layers.price;
        subtotal += sizeUpgrade + layersUpgrade;
        
        const tax = subtotal * 0.08;
        const total = subtotal + tax;
        
        order.total = total;
        
        subtotalEl.textContent = `Rs ${subtotal.toFixed(0)}`;
        sizeUpgradeEl.textContent = `Rs ${sizeUpgrade.toFixed(0)}`;
        layersUpgradeEl.textContent = `Rs ${layersUpgrade.toFixed(0)}`;
        taxEl.textContent = `Rs ${tax.toFixed(0)}`;
        finalTotalEl.textContent = `Rs ${total.toFixed(0)}`;
        currentTotalEl.textContent = `Rs ${total.toFixed(0)}`;
    }

    function updateSummary() {
        if (order.base) {
            summaryBase.querySelector('.summary-placeholder').style.display = 'none';
            summaryBase.querySelector('.summary-price').previousElementSibling.textContent = order.base.name;
            summaryBase.querySelector('.summary-price').textContent = `Rs ${order.base.price.toFixed(0)}`;
        } else {
            summaryBase.querySelector('.summary-placeholder').style.display = 'block';
            summaryBase.querySelector('.summary-price').textContent = 'Rs 0';
        }
        
        if (order.fillings.length > 0) {
            summaryFilling.querySelector('.summary-placeholder').style.display = 'none';
            const fillingNames = order.fillings.map(f => f.name).join(', ');
            const fillingPrice = order.fillings.reduce((sum, f) => sum + f.price, 0);
            summaryFilling.querySelector('.summary-price').previousElementSibling.textContent = fillingNames;
            summaryFilling.querySelector('.summary-price').textContent = `Rs ${fillingPrice.toFixed(0)}`;
        } else {
            summaryFilling.querySelector('.summary-placeholder').style.display = 'block';
            summaryFilling.querySelector('.summary-price').textContent = 'Rs 0';
        }
        
        if (order.icing) {
            summaryIcing.querySelector('.summary-placeholder').style.display = 'none';
            summaryIcing.querySelector('.summary-price').previousElementSibling.textContent = order.icing.name;
            summaryIcing.querySelector('.summary-price').textContent = `Rs ${order.icing.price.toFixed(0)}`;
        } else {
            summaryIcing.querySelector('.summary-placeholder').style.display = 'block';
            summaryIcing.querySelector('.summary-price').textContent = 'Rs 0';
        }
        
        if (order.extras.length > 0) {
            summaryExtras.querySelector('.summary-placeholder').style.display = 'none';
            const extraNames = order.extras.map(e => e.name).join(', ');
            const extraPrice = order.extras.reduce((sum, e) => sum + e.price, 0);
            summaryExtras.querySelector('.summary-price').previousElementSibling.textContent = extraNames;
            summaryExtras.querySelector('.summary-price').textContent = `Rs ${extraPrice.toFixed(0)}`;
        } else {
            summaryExtras.querySelector('.summary-placeholder').style.display = 'block';
            summaryExtras.querySelector('.summary-price').textContent = 'Rs 0';
        }
    }

    function handleDragOver(e) {
        e.preventDefault();
        e.stopPropagation();
        uploadArea.style.borderColor = 'var(--primary)';
        uploadArea.style.background = 'rgba(156, 136, 255, 0.1)';
    }

    function handleDrop(e) {
        e.preventDefault();
        e.stopPropagation();
        uploadArea.style.borderColor = 'var(--border-color)';
        uploadArea.style.background = '';
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFile(files[0]);
        }
    }

    function handleImageUpload(e) {
        const file = e.target.files[0];
        if (file) {
            handleFile(file);
        }
    }

    function handleFile(file) {
        if (file.size > 5 * 1024 * 1024) {
            showNotification('File size must be less than 5MB', 'error');
            return;
        }
        
        if (!file.type.match('image.*')) {
            showNotification('Please upload an image file', 'error');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = function(e) {
            previewContainer.innerHTML = `
                <img src="${e.target.result}" alt="Uploaded image">
                <button class="remove-image" onclick="removeUploadedImage()">
                    <i class="fas fa-times"></i>
                </button>
            `;
            previewContainer.style.display = 'block';
            
            order.uploadedImage = {
                name: file.name,
                type: file.type,
                data: e.target.result
            };
            
            showNotification('Image uploaded successfully!', 'success');
        };
        reader.readAsDataURL(file);
    }

    function removeUploadedImage() {
        previewContainer.innerHTML = '';
        previewContainer.style.display = 'none';
        order.uploadedImage = null;
        imageUpload.value = '';
    }

    function clearAllSelections() {
        if (confirm('Are you sure you want to clear all selections? This cannot be undone.')) {
            order = {
                base: null,
                size: { inches: '8', price: 500 },
                fillings: [],
                layers: { count: 2, price: 0 },
                icing: null,
                extras: [],
                specialRequest: '',
                uploadedImage: null,
                total: 0
            };
            
            document.querySelectorAll('.option-card').forEach(card => {
                card.classList.remove('selected');
                card.querySelector('.select-btn').textContent = 'Select';
                card.querySelector('.select-btn').classList.remove('selected');
            });
            
            document.querySelectorAll('.size-btn').forEach((btn, index) => {
                btn.classList.remove('active');
                if (index === 1) btn.classList.add('active');
            });
            
            document.querySelectorAll('.layer-btn').forEach((btn, index) => {
                btn.classList.remove('active');
                if (index === 0) btn.classList.add('active');
            });
            
            specialRequest.value = '';
            removeUploadedImage();
            
            calculateTotal();
            updateSummary();
            showNotification('All selections cleared!', 'info');
        }
    }

    function saveDraft() {
        const draft = {
            ...order,
            timestamp: new Date().toISOString()
        };
        
        localStorage.setItem('cloudbake_draft', JSON.stringify(draft));
        showNotification('Design saved as draft!', 'success');
    }

    function loadDraft() {
        const saved = localStorage.getItem('cloudbake_draft');
        if (saved) {
            try {
                const draft = JSON.parse(saved);
                
                if (confirm('We found a saved draft. Would you like to load it?')) {

                    order = draft;
                    
                    specialRequest.value = order.specialRequest;
                    
                    calculateTotal();
                    updateSummary();
                    showNotification('Draft loaded successfully!', 'success');
                }
            } catch (e) {
                console.error('Error loading draft:', e);
            }
        }
    }

    function submitOrder() {
        if (!order.base) {
            showNotification('Please select a cake base', 'error');
            currentStep = 1;
            updateStepDisplay();
            return;
        }
        
        if (order.fillings.length === 0) {
            showNotification('Please select at least one filling', 'error');
            currentStep = 2;
            updateStepDisplay();
            return;
        }
        
        if (!order.icing) {
            showNotification('Please select an icing', 'error');
            currentStep = 3;
            updateStepDisplay();
            return;
        }
        
        const orderId = 'CB-' + Math.floor(1000 + Math.random() * 9000);
        orderIdEl.textContent = orderId;
        
        successModal.style.display = 'flex';
        
        localStorage.removeItem('cloudbake_draft');
        
        console.log('Order submitted:', order);
    }

    function scrollToSummary() {
        document.querySelector('.custom-summary').scrollIntoView({
            behavior: 'smooth'
        });
    }

    function closeModal() {
        successModal.style.display = 'none';
    }

    function resetForm() {
        closeModal();
        clearAllSelections();
        currentStep = 1;
        updateStepDisplay();
    }

    function showNotification(message, type) {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <i class="fas fa-${getNotificationIcon(type)}"></i>
            <span>${message}</span>
        `;
        
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${getNotificationColor(type)};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            display: flex;
            align-items: center;
            gap: 0.5rem;
            z-index: 1000;
            animation: slideIn 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
        
        // Add animations
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOut {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    }

    function getNotificationIcon(type) {
        switch(type) {
            case 'success': return 'check-circle';
            case 'error': return 'exclamation-circle';
            case 'warning': return 'exclamation-triangle';
            default: return 'info-circle';
        }
    }

    function getNotificationColor(type) {
        switch(type) {
            case 'success': return '#4cd964';
            case 'error': return '#ff3b30';
            case 'warning': return '#ff9500';
            default: return '#007aff';
        }
    }
    
    window.removeUploadedImage = removeUploadedImage;
});

