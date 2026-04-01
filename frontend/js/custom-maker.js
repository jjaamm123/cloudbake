document.addEventListener('DOMContentLoaded', function () {

    /* ============================================================
       STATE
    ============================================================ */
    let currentMode = 'regular'; // 'regular' | 'special'
    let currentStep = 1;

    const MAX_STEPS = { regular: 4, special: 5 };

    let order = {
        // ── Regular fields ──────────────────────────────────────
        base: null,
        size: { inches: '8', price: 500 },
        fillings: [],
        layers: { count: 2, price: 0 },
        icing: null,
        extras: [],
        specialRequest: '',
        uploadedImage: null,
        // ── Special-occasion fields ──────────────────────────────
        occasion: null,
        tiers: { count: 1, price: 0 },
        spBase: null,
        spIcing: null,
        eventDecorations: [],
        eventDate: '',
        guestCount: '',
        colorTheme: '',
        venueType: '',
        spSpecialRequest: '',
        spUploadedImage: null,
        // ── Shared ───────────────────────────────────────────────
        total: 0
    };

    /* ============================================================
       DOM REFERENCES
    ============================================================ */
    const stepSections   = document.querySelectorAll('.option-section');
    const prevBtn        = document.getElementById('prev-step');
    const nextBtn        = document.getElementById('next-step');
    const submitBtn      = document.getElementById('submit-order');
    const clearBtn       = document.getElementById('clear-all');
    const viewSummaryBtn = document.getElementById('view-summary');
    const saveDraftBtn   = document.getElementById('save-draft');
    const currentTotalEl = document.getElementById('current-total');

    // Regular summary
    const summaryBase    = document.getElementById('summary-base');
    const summaryFilling = document.getElementById('summary-filling');
    const summaryIcing   = document.getElementById('summary-icing');
    const summaryExtras  = document.getElementById('summary-extras');

    // Special summary
    const summaryOccasion   = document.getElementById('summary-occasion');
    const summaryTiers      = document.getElementById('summary-tiers');
    const summarySpBase     = document.getElementById('summary-sp-base');
    const summarySpIcing    = document.getElementById('summary-sp-icing');
    const summaryEventDecor = document.getElementById('summary-event-decor');

    // Breakdown spans
    const subtotalEl      = document.getElementById('subtotal');
    const sizeUpgradeEl   = document.getElementById('size-upgrade');
    const layersUpgradeEl = document.getElementById('layers-upgrade');
    const occasionPriceEl = document.getElementById('occasion-price');
    const tierUpgradeEl   = document.getElementById('tier-upgrade');
    const spCakePriceEl   = document.getElementById('sp-cake-price');
    const decorPriceEl    = document.getElementById('decor-price');
    const taxEl           = document.getElementById('tax');
    const finalTotalEl    = document.getElementById('final-total');

    // Regular detail inputs
    const specialRequest  = document.getElementById('special-request');
    const uploadArea      = document.getElementById('upload-area');
    const imageUpload     = document.getElementById('image-upload');
    const previewContainer = document.getElementById('preview-container');

    // Special detail inputs
    const spSpecialRequest  = document.getElementById('sp-special-request');
    const spUploadArea      = document.getElementById('sp-upload-area');
    const spImageUpload     = document.getElementById('sp-image-upload');
    const spPreviewContainer = document.getElementById('sp-preview-container');
    const eventDateInput    = document.getElementById('event-date');
    const guestCountInput   = document.getElementById('guest-count');
    const colorThemeInput   = document.getElementById('color-theme');
    const venueTypeInput    = document.getElementById('venue-type');

    // Progress bars
    const progressRegular = document.getElementById('progress-regular');
    const progressSpecial = document.getElementById('progress-special');

    // Modal
    const successModal = document.getElementById('success-modal');
    const modalClose   = document.querySelector('.modal-close');
    const newDesignBtn = document.getElementById('new-design');
    const goHomeBtn    = document.getElementById('go-home');
    const orderIdEl    = document.getElementById('order-id');
    const modalTitle   = document.getElementById('modal-title');
    const modalMessage = document.getElementById('modal-message');

    /* ============================================================
       INIT
    ============================================================ */
    init();

    function init() {
        loadDraft();
        setupEventListeners();
        updateModeDisplay();
        updateStepDisplay();
        calculateTotal();
        updateSummary();
    }

    /* ============================================================
       EVENT LISTENERS
    ============================================================ */
    function setupEventListeners() {
        prevBtn.addEventListener('click', goToPreviousStep);
        nextBtn.addEventListener('click', goToNextStep);
        submitBtn.addEventListener('click', submitOrder);

        // ── Mode tabs ──────────────────────────────────────────
        document.querySelectorAll('.mode-tab').forEach(tab => {
            tab.addEventListener('click', function () {
                const newMode = this.dataset.mode;
                if (newMode === currentMode) return;
                currentMode = newMode;
                currentStep = 1;
                document.querySelectorAll('.mode-tab').forEach(t => t.classList.remove('active'));
                this.classList.add('active');
                updateModeDisplay();
                updateStepDisplay();
                calculateTotal();
                updateSummary();
            });
        });

        // ── Option cards ───────────────────────────────────────
        document.querySelectorAll('.select-btn').forEach(btn => {
            btn.addEventListener('click', handleOptionSelect);
        });

        // ── Regular: size buttons ──────────────────────────────
        document.querySelectorAll('.size-btn').forEach(btn => {
            btn.addEventListener('click', handleSizeSelect);
        });

        // ── Regular: layer buttons ─────────────────────────────
        document.querySelectorAll('.layer-btn').forEach(btn => {
            btn.addEventListener('click', handleLayerSelect);
        });

        // ── Special: tier buttons ──────────────────────────────
        document.querySelectorAll('.tier-btn').forEach(btn => {
            btn.addEventListener('click', handleTierSelect);
        });

        // ── Regular: special request ───────────────────────────
        if (specialRequest) {
            specialRequest.addEventListener('input', function () {
                order.specialRequest = this.value;
            });
        }

        // ── Special: event detail fields ───────────────────────
        if (spSpecialRequest) {
            spSpecialRequest.addEventListener('input', function () {
                order.spSpecialRequest = this.value;
            });
        }
        if (eventDateInput) {
            eventDateInput.addEventListener('change', function () {
                order.eventDate = this.value;
            });
        }
        if (guestCountInput) {
            guestCountInput.addEventListener('change', function () {
                order.guestCount = this.value;
            });
        }
        if (colorThemeInput) {
            colorThemeInput.addEventListener('input', function () {
                order.colorTheme = this.value;
            });
        }
        if (venueTypeInput) {
            venueTypeInput.addEventListener('change', function () {
                order.venueType = this.value;
            });
        }

        // ── Regular: image upload ──────────────────────────────
        if (uploadArea) {
            uploadArea.addEventListener('click', () => imageUpload.click());
            uploadArea.addEventListener('dragover', handleDragOver);
            uploadArea.addEventListener('drop', e => handleDrop(e, 'regular'));
        }
        if (imageUpload) {
            imageUpload.addEventListener('change', e => {
                if (e.target.files[0]) handleFile(e.target.files[0], 'regular');
            });
        }

        // ── Special: image upload ──────────────────────────────
        if (spUploadArea) {
            spUploadArea.addEventListener('click', () => spImageUpload.click());
            spUploadArea.addEventListener('dragover', handleDragOver);
            spUploadArea.addEventListener('drop', e => handleDrop(e, 'special'));
        }
        if (spImageUpload) {
            spImageUpload.addEventListener('change', e => {
                if (e.target.files[0]) handleFile(e.target.files[0], 'special');
            });
        }

        if (clearBtn)       clearBtn.addEventListener('click', clearAllSelections);
        if (viewSummaryBtn) viewSummaryBtn.addEventListener('click', scrollToSummary);
        if (saveDraftBtn)   saveDraftBtn.addEventListener('click', saveDraft);

        modalClose.addEventListener('click', closeModal);
        newDesignBtn.addEventListener('click', resetForm);
        goHomeBtn.addEventListener('click', () => window.location.href = 'index.html');

        successModal.addEventListener('click', function (e) {
            if (e.target === this) closeModal();
        });
    }

    /* ============================================================
       MODE DISPLAY
    ============================================================ */
    function updateModeDisplay() {
        const isRegular = currentMode === 'regular';

        if (progressRegular) progressRegular.style.display = isRegular ? 'flex' : 'none';
        if (progressSpecial) progressSpecial.style.display = isRegular ? 'none' : 'flex';

        // Summary sidebar items
        document.querySelectorAll('.summary-regular').forEach(el => {
            el.style.display = isRegular ? 'flex' : 'none';
        });
        document.querySelectorAll('.summary-special').forEach(el => {
            el.style.display = isRegular ? 'none' : 'flex';
        });

        // Breakdown rows
        document.querySelectorAll('.breakdown-regular').forEach(el => {
            el.style.display = isRegular ? 'flex' : 'none';
        });
        document.querySelectorAll('.breakdown-special').forEach(el => {
            el.style.display = isRegular ? 'none' : 'flex';
        });

        // Summary notes
        const noteRegular = document.getElementById('summary-note-regular');
        const noteSpecial = document.getElementById('summary-note-special');
        if (noteRegular) noteRegular.style.display = isRegular ? 'flex' : 'none';
        if (noteSpecial) noteSpecial.style.display = isRegular ? 'none' : 'flex';
    }

    /* ============================================================
       STEP NAVIGATION
    ============================================================ */
    function goToPreviousStep() {
        if (currentStep > 1) {
            currentStep--;
            updateStepDisplay();
        }
    }

    function goToNextStep() {
        if (validateCurrentStep()) {
            const max = MAX_STEPS[currentMode];
            if (currentStep < max) {
                currentStep++;
                updateStepDisplay();
            }
        } else {
            showNotification('Please complete this step before proceeding.', 'warning');
        }
    }

    function validateCurrentStep() {
        if (currentMode === 'regular') {
            switch (currentStep) {
                case 1: return order.base !== null;
                case 2: return order.fillings.length > 0;
                case 3: return order.icing !== null;
                case 4: return true;
                default: return true;
            }
        } else {
            switch (currentStep) {
                case 1: return order.occasion !== null;
                case 2: return order.spBase !== null;
                case 3: return order.spIcing !== null;
                case 4: return true; // decorations optional
                case 5: return true; // details optional
                default: return true;
            }
        }
    }

    function updateStepDisplay() {
        const max = MAX_STEPS[currentMode];

        // Hide all sections
        stepSections.forEach(section => section.classList.remove('active'));

        // Show the section matching current mode + step
        const target = document.querySelector(
            `.option-section[data-mode="${currentMode}"][data-step="${currentStep}"]`
        );
        if (target) target.classList.add('active');

        // Update progress bar
        updateProgressSteps();

        // Nav buttons
        prevBtn.style.display   = currentStep === 1    ? 'none' : 'flex';
        nextBtn.style.display   = currentStep === max  ? 'none' : 'flex';
        submitBtn.style.display = currentStep === max  ? 'flex' : 'none';

        document.querySelector('.custom-options').scrollTop = 0;
    }

    function updateProgressSteps() {
        const progressId = currentMode === 'regular' ? 'progress-regular' : 'progress-special';
        const progressEl = document.getElementById(progressId);
        if (!progressEl) return;

        progressEl.querySelectorAll('.progress-step').forEach(step => {
            const num = parseInt(step.dataset.step);
            step.classList.remove('active', 'completed');
            if (num < currentStep)      step.classList.add('completed');
            else if (num === currentStep) step.classList.add('active');
        });
    }

    /* ============================================================
       OPTION SELECTION HANDLER
    ============================================================ */
    function handleOptionSelect(e) {
        const card = e.target.closest('.option-card');
        if (!card) return;

        const optionType  = card.dataset.option;
        const optionValue = card.dataset.value;
        const optionPrice = parseFloat(card.dataset.price);

        const singleSelect = ['base', 'icing', 'occasion', 'sp-base', 'sp-icing'];

        if (singleSelect.includes(optionType)) {
            // Deselect all siblings
            document.querySelectorAll(`[data-option="${optionType}"]`).forEach(c => {
                c.classList.remove('selected');
                c.querySelector('.select-btn').textContent = 'Select';
                c.querySelector('.select-btn').classList.remove('selected');
            });
        }

        card.classList.add('selected');
        const btn = card.querySelector('.select-btn');
        btn.textContent = 'Selected ✓';
        btn.classList.add('selected');

        const item = {
            name:  card.querySelector('h3').textContent,
            value: optionValue,
            price: optionPrice
        };

        switch (optionType) {
            // ── Regular ─────────────────────────────────────────
            case 'base':
                order.base = item;
                break;

            case 'filling': {
                const idx = order.fillings.findIndex(f => f.value === optionValue);
                if (idx > -1) {
                    order.fillings.splice(idx, 1);
                    card.classList.remove('selected');
                    btn.textContent = 'Select';
                    btn.classList.remove('selected');
                } else if (order.fillings.length < 2) {
                    order.fillings.push(item);
                } else {
                    showNotification('You can select up to 2 fillings only', 'warning');
                    card.classList.remove('selected');
                    btn.textContent = 'Select';
                    btn.classList.remove('selected');
                    return;
                }
                break;
            }

            case 'icing':
                order.icing = item;
                break;

            case 'extra': {
                const idx = order.extras.findIndex(ex => ex.value === optionValue);
                if (idx > -1) {
                    order.extras.splice(idx, 1);
                    card.classList.remove('selected');
                    btn.textContent = 'Select';
                    btn.classList.remove('selected');
                } else {
                    order.extras.push(item);
                }
                break;
            }

            // ── Special ─────────────────────────────────────────
            case 'occasion':
                order.occasion = item;
                break;

            case 'sp-base':
                order.spBase = item;
                break;

            case 'sp-icing':
                order.spIcing = item;
                break;

            case 'event-decor': {
                const idx = order.eventDecorations.findIndex(d => d.value === optionValue);
                if (idx > -1) {
                    order.eventDecorations.splice(idx, 1);
                    card.classList.remove('selected');
                    btn.textContent = 'Select';
                    btn.classList.remove('selected');
                } else {
                    order.eventDecorations.push(item);
                }
                break;
            }
        }

        calculateTotal();
        updateSummary();
    }

    /* ============================================================
       SIZE / LAYER / TIER HANDLERS
    ============================================================ */
    function handleSizeSelect(e) {
        const btn = e.target.closest('.size-btn');
        document.querySelectorAll('.size-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        order.size = { inches: btn.dataset.size, price: parseFloat(btn.dataset.price) };
        calculateTotal();
        updateSummary();
    }

    function handleLayerSelect(e) {
        const btn = e.target.closest('.layer-btn');
        document.querySelectorAll('.layer-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        order.layers = { count: parseInt(btn.dataset.layers), price: parseFloat(btn.dataset.price) };
        calculateTotal();
        updateSummary();
    }

    function handleTierSelect(e) {
        const btn = e.target.closest('.tier-btn');
        document.querySelectorAll('.tier-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        order.tiers = { count: parseInt(btn.dataset.tiers), price: parseFloat(btn.dataset.price) };
        calculateTotal();
        updateSummary();
    }

    /* ============================================================
       CALCULATE TOTAL
    ============================================================ */
    function calculateTotal() {
        let subtotal     = 0;
        let sizeUpgrade  = 0;
        let layersUpgrade = 0;
        let tierUpgrade  = 0;
        let occasionAmt  = 0;
        let spCakeAmt    = 0;
        let decorAmt     = 0;

        if (currentMode === 'regular') {
            if (order.base)  subtotal += order.base.price;
            order.fillings.forEach(f => subtotal += f.price);
            if (order.icing) subtotal += order.icing.price;
            order.extras.forEach(ex => subtotal += ex.price);
            sizeUpgrade   = order.size.price;
            layersUpgrade = order.layers.price;
            subtotal += sizeUpgrade + layersUpgrade;
        } else {
            if (order.occasion)  { occasionAmt = order.occasion.price; subtotal += occasionAmt; }
            tierUpgrade = order.tiers.price;
            subtotal += tierUpgrade;
            if (order.spBase)  { spCakeAmt += order.spBase.price; }
            if (order.spIcing) { spCakeAmt += order.spIcing.price; }
            subtotal += spCakeAmt;
            order.eventDecorations.forEach(d => { decorAmt += d.price; });
            subtotal += decorAmt;
        }

        const tax   = subtotal * 0.08;
        const total = subtotal + tax;
        order.total = total;

        // Update regular breakdown
        if (subtotalEl)      subtotalEl.textContent      = `Rs ${subtotal.toFixed(0)}`;
        if (sizeUpgradeEl)   sizeUpgradeEl.textContent   = `Rs ${sizeUpgrade.toFixed(0)}`;
        if (layersUpgradeEl) layersUpgradeEl.textContent  = `Rs ${layersUpgrade.toFixed(0)}`;

        // Update special breakdown
        if (occasionPriceEl) occasionPriceEl.textContent = `Rs ${occasionAmt.toFixed(0)}`;
        if (tierUpgradeEl)   tierUpgradeEl.textContent   = `Rs ${tierUpgrade.toFixed(0)}`;
        if (spCakePriceEl)   spCakePriceEl.textContent   = `Rs ${spCakeAmt.toFixed(0)}`;
        if (decorPriceEl)    decorPriceEl.textContent    = `Rs ${decorAmt.toFixed(0)}`;

        // Common
        if (taxEl)        taxEl.textContent        = `Rs ${tax.toFixed(0)}`;
        if (finalTotalEl) finalTotalEl.textContent = `Rs ${total.toFixed(0)}`;
        if (currentTotalEl) currentTotalEl.textContent = `Rs ${total.toFixed(0)}`;
    }

    /* ============================================================
       UPDATE SUMMARY SIDEBAR
    ============================================================ */
    function updateSummary() {
        if (currentMode === 'regular') {
            setSummaryItem(summaryBase, order.base);

            if (order.fillings.length > 0) {
                const names = order.fillings.map(f => f.name).join(', ');
                const price = order.fillings.reduce((s, f) => s + f.price, 0);
                setSummaryItem(summaryFilling, { name: names, price });
            } else {
                setSummaryItem(summaryFilling, null);
            }

            setSummaryItem(summaryIcing, order.icing);

            if (order.extras.length > 0) {
                const names = order.extras.map(e => e.name).join(', ');
                const price = order.extras.reduce((s, e) => s + e.price, 0);
                setSummaryItem(summaryExtras, { name: names, price });
            } else {
                setSummaryItem(summaryExtras, null);
            }

        } else {
            setSummaryItem(summaryOccasion, order.occasion);

            // Tiers — always show a value
            if (summaryTiers) {
                const ph = summaryTiers.querySelector('.summary-placeholder');
                const sp = summaryTiers.querySelector('.summary-price');
                ph.style.display = 'block';
                ph.textContent   = `${order.tiers.count} Tier${order.tiers.count > 1 ? 's' : ''}`;
                sp.textContent   = order.tiers.price > 0 ? `Rs ${order.tiers.price}` : 'Included';
            }

            setSummaryItem(summarySpBase,  order.spBase);
            setSummaryItem(summarySpIcing, order.spIcing);

            if (order.eventDecorations.length > 0) {
                const names = order.eventDecorations.map(d => d.name).join(', ');
                const price = order.eventDecorations.reduce((s, d) => s + d.price, 0);
                setSummaryItem(summaryEventDecor, { name: names, price });
            } else {
                setSummaryItem(summaryEventDecor, null, 'None selected (optional)');
            }
        }
    }

    /**
     * Update a summary-item element.
     * @param {HTMLElement} el
     * @param {object|null} data  – { name, price }
     * @param {string} emptyText – placeholder text when null
     */
    function setSummaryItem(el, data, emptyText = 'No selection yet') {
        if (!el) return;
        const placeholder = el.querySelector('.summary-placeholder');
        const priceEl     = el.querySelector('.summary-price');

        if (data) {
            placeholder.style.display = 'none';
            priceEl.previousElementSibling.textContent = data.name;
            priceEl.textContent = `Rs ${data.price.toFixed(0)}`;
        } else {
            placeholder.style.display  = 'block';
            placeholder.textContent    = emptyText;
            priceEl.textContent        = 'Rs 0';
        }
    }

    /* ============================================================
       IMAGE UPLOAD
    ============================================================ */
    function handleDragOver(e) {
        e.preventDefault();
        e.stopPropagation();
        e.currentTarget.style.borderColor = 'var(--primary)';
        e.currentTarget.style.background  = 'rgba(156, 136, 255, 0.1)';
    }

    function handleDrop(e, mode) {
        e.preventDefault();
        e.stopPropagation();
        e.currentTarget.style.borderColor = '';
        e.currentTarget.style.background  = '';
        const files = e.dataTransfer.files;
        if (files.length > 0) handleFile(files[0], mode);
    }

    function handleFile(file, mode) {
        if (file.size > 5 * 1024 * 1024) {
            showNotification('File size must be less than 5MB', 'error');
            return;
        }
        if (!file.type.match('image.*')) {
            showNotification('Please upload an image file', 'error');
            return;
        }
        const reader = new FileReader();
        reader.onload = function (e) {
            const container = mode === 'special' ? spPreviewContainer : previewContainer;
            if (container) {
                container.innerHTML = `
                    <img src="${e.target.result}" alt="Uploaded image">
                    <button class="remove-image" onclick="removeUploadedImage('${mode}')">
                        <i class="fas fa-times"></i>
                    </button>
                `;
                container.style.display = 'block';
            }
            const imageData = { name: file.name, type: file.type, data: e.target.result };
            if (mode === 'special') {
                order.spUploadedImage = imageData;
            } else {
                order.uploadedImage = imageData;
            }
            showNotification('Image uploaded successfully!', 'success');
        };
        reader.readAsDataURL(file);
    }

    function removeUploadedImage(mode) {
        if (mode === 'special') {
            if (spPreviewContainer) { spPreviewContainer.innerHTML = ''; spPreviewContainer.style.display = 'none'; }
            order.spUploadedImage = null;
            if (spImageUpload) spImageUpload.value = '';
        } else {
            if (previewContainer) { previewContainer.innerHTML = ''; previewContainer.style.display = 'none'; }
            order.uploadedImage = null;
            if (imageUpload) imageUpload.value = '';
        }
    }

    /* ============================================================
       CLEAR / SAVE / LOAD
    ============================================================ */
    function clearAllSelections() {
        if (!confirm('Are you sure you want to clear all selections? This cannot be undone.')) return;

        order = {
            base: null, size: { inches: '8', price: 500 },
            fillings: [], layers: { count: 2, price: 0 },
            icing: null, extras: [],
            specialRequest: '', uploadedImage: null,
            occasion: null, tiers: { count: 1, price: 0 },
            spBase: null, spIcing: null,
            eventDecorations: [],
            eventDate: '', guestCount: '', colorTheme: '', venueType: '',
            spSpecialRequest: '', spUploadedImage: null,
            total: 0
        };

        document.querySelectorAll('.option-card').forEach(card => {
            card.classList.remove('selected');
            card.querySelector('.select-btn').textContent = 'Select';
            card.querySelector('.select-btn').classList.remove('selected');
        });

        document.querySelectorAll('.size-btn').forEach((b, i) => {
            b.classList.toggle('active', i === 1);
        });
        document.querySelectorAll('.layer-btn').forEach((b, i) => {
            b.classList.toggle('active', i === 0);
        });
        document.querySelectorAll('.tier-btn').forEach((b, i) => {
            b.classList.toggle('active', i === 0);
        });

        if (specialRequest)    specialRequest.value    = '';
        if (spSpecialRequest)  spSpecialRequest.value  = '';
        if (eventDateInput)    eventDateInput.value    = '';
        if (guestCountInput)   guestCountInput.value   = '';
        if (colorThemeInput)   colorThemeInput.value   = '';
        if (venueTypeInput)    venueTypeInput.value    = '';

        removeUploadedImage('regular');
        removeUploadedImage('special');

        calculateTotal();
        updateSummary();
        showNotification('All selections cleared!', 'info');
    }

    function saveDraft() {
        const draft = {
            ...order,
            mode: currentMode,
            step: currentStep,
            timestamp: new Date().toISOString()
        };
        localStorage.setItem('cloudbake_draft', JSON.stringify(draft));
        showNotification('Design saved as draft!', 'success');
    }

    function loadDraft() {
        const saved = localStorage.getItem('cloudbake_draft');
        if (!saved) return;
        try {
            const draft = JSON.parse(saved);
            if (!confirm('We found a saved draft. Would you like to load it?')) return;

            order = { ...order, ...draft };

            if (draft.mode) {
                currentMode = draft.mode;
                currentStep = draft.step || 1;
                document.querySelectorAll('.mode-tab').forEach(t => {
                    t.classList.toggle('active', t.dataset.mode === currentMode);
                });
            }

            if (specialRequest && order.specialRequest)
                specialRequest.value = order.specialRequest;
            if (spSpecialRequest && order.spSpecialRequest)
                spSpecialRequest.value = order.spSpecialRequest;
            if (eventDateInput && order.eventDate)
                eventDateInput.value = order.eventDate;
            if (guestCountInput && order.guestCount)
                guestCountInput.value = order.guestCount;
            if (colorThemeInput && order.colorTheme)
                colorThemeInput.value = order.colorTheme;
            if (venueTypeInput && order.venueType)
                venueTypeInput.value = order.venueType;

            updateModeDisplay();
            calculateTotal();
            updateSummary();
            showNotification('Draft loaded successfully!', 'success');
        } catch (err) {
            console.error('Error loading draft:', err);
        }
    }

    /* ============================================================
       SUBMIT ORDER
    ============================================================ */
    function submitOrder() {
        if (currentMode === 'regular') {
            if (!order.base) {
                showNotification('Please select a cake base', 'error');
                currentStep = 1; updateStepDisplay(); return;
            }
            if (order.fillings.length === 0) {
                showNotification('Please select at least one filling', 'error');
                currentStep = 2; updateStepDisplay(); return;
            }
            if (!order.icing) {
                showNotification('Please select an icing', 'error');
                currentStep = 3; updateStepDisplay(); return;
            }
        } else {
            if (!order.occasion) {
                showNotification('Please select an occasion type', 'error');
                currentStep = 1; updateStepDisplay(); return;
            }
            if (!order.spBase) {
                showNotification('Please select a base flavor', 'error');
                currentStep = 2; updateStepDisplay(); return;
            }
            if (!order.spIcing) {
                showNotification('Please select an icing', 'error');
                currentStep = 3; updateStepDisplay(); return;
            }
        }

        const orderId = 'CB-' + Math.floor(1000 + Math.random() * 9000);
        orderIdEl.textContent = orderId;

        if (modalTitle) {
            modalTitle.textContent = currentMode === 'special'
                ? 'Your special occasion cake order has been received!'
                : 'Your custom cake order has been received!';
        }
        if (modalMessage) {
            modalMessage.textContent = currentMode === 'special'
                ? 'Our event cake specialists will call you within 24 hours to confirm every detail.'
                : "We'll contact you within 2 hours to confirm details and provide an exact quote.";
        }

        successModal.style.display = 'flex';
        localStorage.removeItem('cloudbake_draft');
        console.log('Order submitted:', { mode: currentMode, ...order });
    }

    /* ============================================================
       HELPERS
    ============================================================ */
    function scrollToSummary() {
        document.querySelector('.custom-summary').scrollIntoView({ behavior: 'smooth' });
    }

    function closeModal() {
        successModal.style.display = 'none';
    }

    function resetForm() {
        closeModal();
        clearAllSelections();
        currentStep = 1;
        updateModeDisplay();
        updateStepDisplay();
    }

    function showNotification(message, type) {
        const notification = document.createElement('div');
        notification.innerHTML = `<i class="fas fa-${getNotificationIcon(type)}"></i><span>${message}</span>`;
        notification.style.cssText = `
            position:fixed; top:20px; right:20px;
            background:${getNotificationColor(type)};
            color:white; padding:1rem 1.5rem;
            border-radius:8px; display:flex;
            align-items:center; gap:0.5rem;
            z-index:9999; animation:slideIn 0.3s ease;
            font-family:'Poppins',sans-serif; font-size:0.9rem;
            box-shadow:0 4px 15px rgba(0,0,0,0.2);
        `;
        document.body.appendChild(notification);
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);

        if (!document.getElementById('notification-keyframes')) {
            const style = document.createElement('style');
            style.id = 'notification-keyframes';
            style.textContent = `
                @keyframes slideIn  { from { transform:translateX(110%); opacity:0; } to { transform:translateX(0); opacity:1; } }
                @keyframes slideOut { from { transform:translateX(0); opacity:1; } to { transform:translateX(110%); opacity:0; } }
            `;
            document.head.appendChild(style);
        }
    }

    function getNotificationIcon(type) {
        const icons = { success: 'check-circle', error: 'exclamation-circle', warning: 'exclamation-triangle' };
        return icons[type] || 'info-circle';
    }

    function getNotificationColor(type) {
        const colors = { success: '#4cd964', error: '#ff3b30', warning: '#ff9500' };
        return colors[type] || '#007aff';
    }

    // Expose to inline onclick
    window.removeUploadedImage = removeUploadedImage;
});