class LoyaltySystem {
    constructor() {
        this.user = this.loadUser();
        this.loyaltyData = this.loadLoyaltyData();
        this.rewards = this.getRewardsData();
        this.initLoyalty();
    }

    loadUser() {
        try {
            const userData = localStorage.getItem('cloudbakeUser');
            return userData ? JSON.parse(userData) : null;
        } catch (e) {
            console.error('Error loading user:', e);
            return null;
        }
    }

    loadLoyaltyData() {
        try {
            const loyaltyData = localStorage.getItem('cloudbakeLoyalty');
            if (!loyaltyData) {
                return {
                    points: 500, 
                    tier: 'silver',
                    history: [
                        {
                            date: new Date().toISOString().split('T')[0],
                            description: 'Welcome bonus',
                            points: 500,
                            type: 'earned'
                        }
                    ],
                    referrals: [],
                    redeemedRewards: [],
                    lastBirthdayClaim: null
                };
            }
            return JSON.parse(loyaltyData);
        } catch (e) {
            console.error('Error loading loyalty data:', e);
            return this.loadLoyaltyData(); 
        }
    }

    saveLoyaltyData() {
        try {
            localStorage.setItem('cloudbakeLoyalty', JSON.stringify(this.loyaltyData));
        } catch (e) {
            console.error('Error saving loyalty data:', e);
        }
    }

    getRewardsData() {
        return [
            {
                id: 'free-coffee',
                title: 'Free Coffee',
                description: 'Enjoy a complimentary coffee with any pastry purchase',
                cost: 100,
                type: 'freebies',
                image: 'https://images.unsplash.com/photo-1511537190424-bbbab87ac5eb?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'
            },
            {
                id: '20-off',
                title: '20% Off Next Order',
                description: 'Get 20% discount on your next purchase',
                cost: 250,
                type: 'discount',
                image: 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'
            },
            {
                id: 'free-croissant',
                title: 'Free Croissant',
                description: 'Get a free fresh-baked croissant',
                cost: 150,
                type: 'freebies',
                image: 'img/croissant.jpg'
            },
            {
                id: 'cake-workshop',
                title: 'Cake Decorating Workshop',
                description: 'Join our exclusive cake decorating class',
                cost: 1000,
                type: 'experiences',
                image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'
            },
            {
                id: '50-off',
                title: '50% Off Custom Cake',
                description: '50% discount on any custom cake order',
                cost: 500,
                type: 'discount',
                image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'
            },
            {
                id: 'free-delivery-month',
                title: 'Free Delivery for a Month',
                description: 'Enjoy free delivery on all orders for 30 days',
                cost: 750,
                type: 'discount',
                image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'
            },
            {
                id: 'birthday-surprise',
                title: 'Birthday Surprise Box',
                description: 'Special birthday treat box with assorted pastries',
                cost: 300,
                type: 'freebies',
                image: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'
            },
            {
                id: 'behind-scenes',
                title: 'Kitchen Tour',
                description: 'Exclusive behind-the-scenes tour of our cloud kitchen',
                cost: 800,
                type: 'experiences',
                image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'
            }
        ];
    }

    initLoyalty() {
        if (!this.user) {
            this.showToast('Please login to view loyalty rewards', 'info');
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);
            return;
        }

        this.setupEventListeners();
        this.loadPointsCard();
        this.loadRewards();
        this.loadHistory();
        this.updateTierProgress();
        this.updateCartCount();
    }

    setupEventListeners() {
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.filterRewards(e.target.dataset.filter);
            });
        });

        const referBtn = document.getElementById('refer-friend');
        if (referBtn) {
            referBtn.addEventListener('click', () => {
                this.showReferralModal();
            });
        }

        const birthdayBtn = document.getElementById('claim-birthday');
        if (birthdayBtn) {
            birthdayBtn.addEventListener('click', () => {
                this.claimBirthdayBonus();
            });
        }

        const challengesBtn = document.getElementById('view-challenges');
        if (challengesBtn) {
            challengesBtn.addEventListener('click', () => {
                this.showChallenges();
            });
        }

        const exportBtn = document.getElementById('export-history');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                this.exportHistory();
            });
        }

        document.addEventListener('click', (e) => {
            if (e.target.id === 'copy-referral' || e.target.closest('#copy-referral')) {
                this.copyReferralLink();
            }
        });

        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('close-modal') || 
                e.target.closest('.close-modal') ||
                e.target.classList.contains('modal-overlay')) {
                this.closeAllModals();
            }
        });
    }

    loadPointsCard() {
        const pointsCard = document.getElementById('user-points-card');
        if (!pointsCard) return;

        const currentTier = this.getCurrentTier();
        const nextTier = this.getNextTier();

        pointsCard.innerHTML = `
            <div class="points-display">
                <div class="points-icon">
                    <i class="fas fa-coins"></i>
                </div>
                <div class="points-info">
                    <h2>${this.loyaltyData.points.toLocaleString()} Points</h2>
                    <p>Available to redeem</p>
                </div>
            </div>
            <div class="tier-info">
                <div class="current-tier">
                    <span>Current Tier:</span>
                    <span class="tier-badge">${currentTier.name}</span>
                </div>
                <div class="next-tier">
                    <p>${nextTier.points - this.loyaltyData.points} points to ${nextTier.name}</p>
                </div>
            </div>
        `;
    }

    getCurrentTier() {
        const points = this.loyaltyData.points;
        if (points >= 3000) {
            return { name: 'Platinum', color: '#b19cd9', minPoints: 3000 };
        } else if (points >= 1000) {
            return { name: 'Gold', color: '#FFD700', minPoints: 1000 };
        } else {
            return { name: 'Silver', color: '#c0c0c0', minPoints: 0 };
        }
    }

    getNextTier() {
        const points = this.loyaltyData.points;
        if (points < 1000) {
            return { name: 'Gold', points: 1000 };
        } else if (points < 3000) {
            return { name: 'Platinum', points: 3000 };
        } else {
            return { name: 'Max', points: Infinity };
        }
    }

    updateTierProgress() {
        const currentTier = this.getCurrentTier();
        const nextTier = this.getNextTier();
        const points = this.loyaltyData.points;

        let progressPercentage = 0;
        if (nextTier.name !== 'Max') {
            const tierRange = nextTier.points - currentTier.minPoints;
            const pointsInTier = points - currentTier.minPoints;
            progressPercentage = (pointsInTier / tierRange) * 100;
        } else {
            progressPercentage = 100;
        }

        const progressFill = document.getElementById('tier-progress');
        if (progressFill) {
            progressFill.style.width = `${Math.min(progressPercentage, 100)}%`;
        }

        const indicator = document.getElementById('current-tier-indicator');
        if (indicator) {
            indicator.style.left = `${Math.min(progressPercentage, 100)}%`;
            indicator.textContent = `${points.toLocaleString()} points`;
        }

        document.querySelectorAll('.tier-card').forEach(card => {
            card.classList.remove('active');
        });
        
        const tierClass = currentTier.name.toLowerCase();
        const activeCard = document.querySelector(`.tier-card.${tierClass}`);
        if (activeCard) {
            activeCard.classList.add('active');
        }
    }

    filterRewards(filter) {
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        event.target.classList.add('active');

        const filteredRewards = filter === 'all' 
            ? this.rewards 
            : this.rewards.filter(reward => reward.type === filter);

        this.loadRewards(filteredRewards);
    }

    loadRewards(rewards = this.rewards) {
        const rewardsGrid = document.getElementById('rewards-grid');
        if (!rewardsGrid) return;

        rewardsGrid.innerHTML = '';

        rewards.forEach(reward => {
            const canAfford = this.loyaltyData.points >= reward.cost;
            const alreadyRedeemed = this.loyaltyData.redeemedRewards?.includes(reward.id);

            const rewardCard = document.createElement('div');
            rewardCard.className = 'reward-card';
            rewardCard.innerHTML = `
                <div class="reward-image">
                    <img src="${reward.image}" alt="${reward.title}">
                </div>
                <div class="reward-content">
                    <div class="reward-header">
                        <h3 class="reward-title">${reward.title}</h3>
                        <span class="reward-cost">${reward.cost} pts</span>
                    </div>
                    <p class="reward-description">${reward.description}</p>
                    <div class="reward-tags">
                        <span class="reward-tag">${reward.type.toUpperCase()}</span>
                    </div>
                    <button class="redeem-btn" 
                            data-id="${reward.id}"
                            ${!canAfford || alreadyRedeemed ? 'disabled' : ''}>
                        <i class="fas fa-gift"></i>
                        ${alreadyRedeemed ? 'Already Redeemed' : canAfford ? 'Redeem Now' : 'Need More Points'}
                    </button>
                </div>
            `;

            const redeemBtn = rewardCard.querySelector('.redeem-btn');
            if (redeemBtn && !redeemBtn.disabled) {
                redeemBtn.addEventListener('click', () => {
                    this.showRedeemModal(reward);
                });
            }

            rewardsGrid.appendChild(rewardCard);
        });
    }

    showRedeemModal(reward) {
        const modal = document.getElementById('redeem-modal');
        const modalBody = document.getElementById('redeem-modal-body');
        const modalTitle = document.getElementById('redeem-title');

        if (!modal || !modalBody || !modalTitle) return;

        modalTitle.textContent = `Redeem: ${reward.title}`;
        
        modalBody.innerHTML = `
            <div class="redeem-modal-content">
                <div class="redeem-icon">
                    <i class="fas fa-gift"></i>
                </div>
                <h3>${reward.title}</h3>
                <p>${reward.description}</p>
                <p><strong>Cost:</strong> ${reward.cost} points</p>
                <p><strong>Your balance:</strong> ${this.loyaltyData.points} points</p>
                <div class="modal-actions">
                    <button class="btn btn-secondary" id="cancel-redeem">
                        Cancel
                    </button>
                    <button class="btn btn-primary" id="confirm-redeem">
                        <i class="fas fa-check"></i> Redeem for ${reward.cost} Points
                    </button>
                </div>
            </div>
        `;

        modal.classList.add('active');

        document.getElementById('cancel-redeem').addEventListener('click', () => {
            modal.classList.remove('active');
        });

        document.getElementById('confirm-redeem').addEventListener('click', () => {
            this.redeemReward(reward);
        });
    }

    redeemReward(reward) {
        if (this.loyaltyData.points < reward.cost) {
            this.showToast('Not enough points to redeem this reward', 'error');
            return;
        }

        this.loyaltyData.points -= reward.cost;
        
        if (!this.loyaltyData.redeemedRewards) {
            this.loyaltyData.redeemedRewards = [];
        }
        this.loyaltyData.redeemedRewards.push(reward.id);
        
        this.loyaltyData.history.unshift({
            date: new Date().toISOString().split('T')[0],
            description: `Redeemed: ${reward.title}`,
            points: -reward.cost,
            type: 'spent'
        });

        this.saveLoyaltyData();
        
        this.loadPointsCard();
        this.loadRewards();
        this.loadHistory();
        this.updateTierProgress();
        
        document.getElementById('redeem-modal').classList.remove('active');
        this.showToast(`Successfully redeemed ${reward.title}!`, 'success');
        
        const redemptionCode = `CB-REWARD-${Math.random().toString(36).substr(2, 8).toUpperCase()}`;
        setTimeout(() => {
            alert(`Your redemption code: ${redemptionCode}\n\nShow this code at checkout or mention it when placing your order.`);
        }, 500);
    }

    showReferralModal() {
        const modal = document.getElementById('referral-modal');
        if (!modal) return;

        if (!this.loyaltyData.referralCode) {
            this.loyaltyData.referralCode = `CB-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
            this.saveLoyaltyData();
        }

        const referralLink = `https://cloudbake.com/ref/${this.loyaltyData.referralCode}`;
        document.getElementById('referral-link').value = referralLink;
        
        document.getElementById('referral-count').textContent = this.loyaltyData.referrals?.length || 0;
        document.getElementById('pending-points').textContent = ((this.loyaltyData.referrals?.length || 0) * 500);

        modal.classList.add('active');
    }

    copyReferralLink() {
        const referralInput = document.getElementById('referral-link');
        referralInput.select();
        referralInput.setSelectionRange(0, 99999);
        
        try {
            navigator.clipboard.writeText(referralInput.value);
            this.showToast('Referral link copied to clipboard!', 'success');
        } catch (err) {
            document.execCommand('copy');
            this.showToast('Referral link copied!', 'success');
        }
    }

    claimBirthdayBonus() {
        const today = new Date();
        const currentMonth = today.getMonth();
        
        if (this.loyaltyData.lastBirthdayClaim) {
            const lastClaim = new Date(this.loyaltyData.lastBirthdayClaim);
            if (lastClaim.getMonth() === currentMonth && lastClaim.getFullYear() === today.getFullYear()) {
                this.showToast('You have already claimed your birthday bonus this month!', 'info');
                return;
            }
        }

        this.loyaltyData.points += 250;
        this.loyaltyData.lastBirthdayClaim = today.toISOString();
        
        this.loyaltyData.history.unshift({
            date: today.toISOString().split('T')[0],
            description: 'Birthday bonus',
            points: 250,
            type: 'earned'
        });

        this.saveLoyaltyData();
        
        this.loadPointsCard();
        this.loadHistory();
        this.updateTierProgress();
        
        this.showToast('Happy Birthday! 250 bonus points added to your account!', 'success');
    }

    showChallenges() {
        const challenges = [
            { title: 'First Order of the Month', points: 100, completed: true },
            { title: 'Order 3 Times This Month', points: 300, completed: false },
            { title: 'Try 5 Different Items', points: 500, completed: false },
            { title: 'Share on Social Media', points: 150, completed: true },
            { title: 'Leave a Review', points: 100, completed: false }
        ];

        let challengesHTML = '<div class="challenges-list">';
        challenges.forEach(challenge => {
            challengesHTML += `
                <div class="challenge-item ${challenge.completed ? 'completed' : ''}">
                    <div>
                        <h4>${challenge.title}</h4>
                        <p>${challenge.points} points</p>
                    </div>
                    ${challenge.completed ? 
                        '<span class="challenge-status"><i class="fas fa-check-circle"></i> Completed</span>' : 
                        '<button class="btn btn-small">Claim</button>'}
                </div>
            `;
        });
        challengesHTML += '</div>';

        let challengesModal = document.getElementById('challenges-modal');
        if (!challengesModal) {
            challengesModal = document.createElement('div');
            challengesModal.id = 'challenges-modal';
            challengesModal.className = 'modal-overlay';
            challengesModal.innerHTML = `
                <div class="modal-content">
                    <div class="modal-header">
                        <h2>Monthly Challenges</h2>
                        <button class="close-modal">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="modal-body">
                        ${challengesHTML}
                    </div>
                </div>
            `;
            document.body.appendChild(challengesModal);
        }

        challengesModal.classList.add('active');
    }

    loadHistory() {
        const historyBody = document.getElementById('history-body');
        if (!historyBody) return;

        if (!this.loyaltyData.history || this.loyaltyData.history.length === 0) {
            historyBody.innerHTML = `
                <tr>
                    <td colspan="4" class="no-history">
                        <i class="fas fa-history"></i>
                        <p>No points history yet</p>
                    </td>
                </tr>
            `;
            return;
        }

        historyBody.innerHTML = '';

        this.loyaltyData.history.forEach((entry, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${entry.date}</td>
                <td>${entry.description}</td>
                <td>
                    <span class="${entry.type === 'earned' ? 'points-earned' : 'points-spent'}">
                        ${entry.type === 'earned' ? '+' : '-'}${entry.points}
                    </span>
                </td>
                <td>
                    ${this.calculateBalanceUpTo(index)}
                </td>
            `;
            historyBody.appendChild(row);
        });
    }

    calculateBalanceUpTo(index) {
        let balance = 0;
        for (let i = 0; i <= index; i++) {
            balance += this.loyaltyData.history[i].points;
        }
        return balance.toLocaleString();
    }

    exportHistory() {
        if (!this.loyaltyData.history || this.loyaltyData.history.length === 0) {
            this.showToast('No history to export', 'info');
            return;
        }

        let csv = 'Date,Description,Points,Type\n';
        this.loyaltyData.history.forEach(entry => {
            csv += `${entry.date},"${entry.description}",${entry.points},${entry.type}\n`;
        });

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `cloudbake-points-history-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);

        this.showToast('History exported successfully!', 'success');
    }

    closeAllModals() {
        document.querySelectorAll('.modal-overlay').forEach(modal => {
            modal.classList.remove('active');
        });
    }

    updateCartCount() {
        const cartCount = document.querySelector('.cart-count');
        if (cartCount && window.cloudbakeCart) {
            cartCount.textContent = window.cloudbakeCart.cart.length;
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

    addPointsFromPurchase(amount) {
        const currentTier = this.getCurrentTier();
        let multiplier = 1;
        
        if (currentTier.name === 'Gold') multiplier = 1.5;
        if (currentTier.name === 'Platinum') multiplier = 2;
        
        const pointsEarned = Math.floor(amount * multiplier);
        
        this.loyaltyData.points += pointsEarned;
        
        // Add to history
        this.loyaltyData.history.unshift({
            date: new Date().toISOString().split('T')[0],
            description: `Purchase - ${amount} spent`,
            points: pointsEarned,
            type: 'earned'
        });
        
        this.saveLoyaltyData();
        this.loadPointsCard();
        this.updateTierProgress();
        
        return pointsEarned;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const loyaltySystem = new LoyaltySystem();
    window.loyaltySystem = loyaltySystem;
});

window.addLoyaltyPoints = function(amount) {
    if (window.loyaltySystem) {
        const pointsEarned = window.loyaltySystem.addPointsFromPurchase(amount);
        return pointsEarned;
    }
    return 0;
};