document.addEventListener('DOMContentLoaded', async () => {

    const API   = 'http://localhost:5000/api';
    const token = localStorage.getItem('cloudbakes_token');

    const userData = safeParseJSON(localStorage.getItem('cloudbakes_user'))
                  || safeParseJSON(localStorage.getItem('cloudbakeUser'))
                  || {};

    if (!token) {
        alert('Please log in to view your dashboard.');
        window.location.href = 'login.html';
        return;
    }

    const cachedName = userData.name || userData.username
                    || userData.email?.split('@')[0] || 'Valued Customer';

    setEl('user-name',  cachedName);
    setEl('user-email', userData.email || '');

    if (userData.tier || userData.points !== undefined) {
        renderLoyalty({
            tier:         userData.tier  || 'bronze',
            points:       userData.points ?? 0,
            nextTier:     userData.nextTier,
            pointsNeeded: userData.pointsNeeded
        });
    }

    try {
        const profileRes = await fetch(`${API}/auth/profile`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (profileRes.ok) {
            const profile = await profileRes.json();

            setEl('user-name',  profile.name  || cachedName);
            setEl('user-email', profile.email || '');

            renderLoyalty({
                tier:         profile.tier         || 'bronze',
                points:       profile.points        ?? 0,
                nextTier:     profile.nextTier,
                pointsNeeded: profile.pointsNeeded
            });

            const merged = { ...userData, ...profile };
            localStorage.setItem('cloudbakes_user', JSON.stringify(merged));

        } else if (profileRes.status === 401) {
            localStorage.removeItem('cloudbakes_token');
            window.location.href = 'login.html';
            return;
        }
    } catch (profileErr) {
        console.warn('Profile fetch failed, using cached data.', profileErr);
    }

    try {
        const ordersRes = await fetch(`${API}/orders`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!ordersRes.ok) throw new Error(`HTTP ${ordersRes.status}`);

        const data   = await ordersRes.json();
        const orders = Array.isArray(data) ? data : (data.orders || []);

        renderOrders(orders);

        if (!userData.tier) {
            renderLoyaltyFromSpend(orders);
        }

        if (orders.length > 0) {
            const badge = document.getElementById('orders-count-badge');
            if (badge) {
                badge.textContent     = `${orders.length} order${orders.length !== 1 ? 's' : ''}`;
                badge.style.display   = 'inline-block';
            }
        }

    } catch (error) {
        console.error('Dashboard orders error:', error);
        document.getElementById('orders-list').innerHTML = `
            <tr>
                <td colspan="4" class="table-status-cell table-error">
                    <i class="fas fa-exclamation-circle"></i>
                    Failed to load orders. Please try again later.
                </td>
            </tr>`;
    }

    document.getElementById('logout-btn').addEventListener('click', () => {
        localStorage.removeItem('cloudbakes_token');
        localStorage.removeItem('cloudbakes_user');
        localStorage.removeItem('cloudbakeUser');
        window.location.href = 'login.html';
    });
});

function renderOrders(orders) {
    const tbody = document.getElementById('orders-list');

    if (!orders || orders.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="4" class="table-status-cell">
                    🍰 You haven't placed any orders yet.
                    <a href="menu.html" style="color:#ff85a2; font-weight:600; margin-left:6px;">Browse our menu!</a>
                </td>
            </tr>`;
        return;
    }

    tbody.innerHTML = orders.map(order => {
        const date = new Date(order.createdAt).toLocaleDateString('en-US', {
            year: 'numeric', month: 'short', day: 'numeric'
        });

        let statusClass, statusText;
        const s = (order.status || '').toLowerCase();

        if (order.isDelivered || s === 'delivered') {
            statusClass = 'status-delivered';
            statusText  = 'Delivered';
        } else if (s === 'cancelled') {
            statusClass = 'status-cancelled';
            statusText  = 'Cancelled';
        } else if (s === 'out for delivery' || s === 'out-for-delivery') {
            statusClass = 'status-out';
            statusText  = 'Out for Delivery';
        } else {
            statusClass = 'status-processing';
            statusText  = order.status || 'Processing';
        }

        const shortId = String(order._id).slice(-6).toUpperCase();

        return `
            <tr>
                <td class="order-id-cell">#${shortId}</td>
                <td>${date}</td>
                <td class="order-amount-cell">NPR ${Number(order.totalPrice).toFixed(0)}</td>
                <td><span class="status-badge ${statusClass}">${statusText}</span></td>
            </tr>
        `;
    }).join('');
}

const TIERS = {
    bronze: {
        label:      'Bronze Member',
        icon:       'fas fa-medal',
        color:      '#cd7f32',
        textColor:  'white',
        next:       'Silver',
        threshold:  500,
        prev:       0,
        perks:      ['Free delivery over NPR 500', 'Birthday bonus 50 pts']
    },
    silver: {
        label:      'Silver Member',
        icon:       'fas fa-star',
        color:      '#a8a9ad',
        textColor:  '#333',
        next:       'Gold',
        threshold:  1500,
        prev:       500,
        perks:      ['Free delivery on all orders', '5% off every order', 'Birthday bonus 150 pts']
    },
    gold: {
        label:      'Gold Member',
        icon:       'fas fa-crown',
        color:      '#ffd700',
        textColor:  '#333',
        next:       null,
        threshold:  null,
        prev:       1500,
        perks:      ['Always free delivery', '10% off every order', 'Exclusive gifts', 'Birthday bonus 300 pts']
    }
};

function renderLoyalty({ tier, points, nextTier, pointsNeeded }) {
    const tierKey  = (tier || 'bronze').toLowerCase();
    const tierInfo = TIERS[tierKey] || TIERS.bronze;

    const badge = document.getElementById('loyalty-badge');
    if (badge) {
        badge.className             = `loyalty-badge tier-${tierKey}`;
        badge.innerHTML             = `<i class="${tierInfo.icon}"></i> ${tierInfo.label}`;
        badge.style.background      = tierInfo.color;
        badge.style.color           = tierInfo.textColor;
    }

    const progressWrap = document.getElementById('loyalty-progress-wrap');
    const barFill      = document.getElementById('loyalty-bar-fill');
    const curLabel     = document.getElementById('tier-current-label');
    const nxtLabel     = document.getElementById('tier-next-label');

    if (tierInfo.next && progressWrap) {
        progressWrap.style.display = 'block';
        if (curLabel) curLabel.textContent = tierInfo.label.replace(' Member', '');
        if (nxtLabel) nxtLabel.textContent = tierInfo.next;

        // Calculate pct between prev and next threshold
        const pct = tierInfo.threshold
            ? Math.min(100, Math.round(
                ((points - tierInfo.prev) / (tierInfo.threshold - tierInfo.prev)) * 100
              ))
            : 100;

        if (barFill) {
            barFill.style.width      = `${pct}%`;
            barFill.style.background = tierInfo.color;
        }
    } else if (progressWrap) {
        progressWrap.style.display = 'none';
    }

    const text = document.getElementById('loyalty-text');
    if (text) {
        if (tierInfo.next) {
            const needed = pointsNeeded ?? (tierInfo.threshold - points);
            text.innerHTML = `
                <i class="fas fa-info-circle"></i>
                <strong>${points}</strong> points · Earn
                <strong>${Math.max(0, needed)}</strong> more to reach ${tierInfo.next}
                <span class="loyalty-rate">(1 pt per NPR 10 spent)</span>`;
        } else {
            text.innerHTML = `<i class="fas fa-star"></i> You've reached Gold — the highest tier! 🎉`;
        }
    }

    const perksEl = document.getElementById('loyalty-perks');
    if (perksEl) {
        perksEl.innerHTML = tierInfo.perks.map(p =>
            `<span class="loyalty-perk"><i class="fas fa-check-circle"></i> ${p}</span>`
        ).join('');
    }
}

function renderLoyaltyFromSpend(orders) {
    const totalSpent = orders.reduce((sum, o) => sum + (Number(o.totalPrice) || 0), 0);

    let tier, points, pointsNeeded, nextTier;

    if (totalSpent >= 15000) {
        tier = 'gold'; points = 1500; pointsNeeded = 0; nextTier = null;
    } else if (totalSpent >= 5000) {
        tier = 'silver';
        points       = 500 + Math.floor((totalSpent - 5000) / 10);
        pointsNeeded = Math.max(0, 1500 - points);
        nextTier     = 'gold';
    } else {
        tier = 'bronze';
        points       = Math.floor(totalSpent / 10);
        pointsNeeded = Math.max(0, 500 - points);
        nextTier     = 'silver';
    }

    renderLoyalty({ tier, points, pointsNeeded, nextTier });
}

function setEl(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
}

function safeParseJSON(str) {
    try { return JSON.parse(str); } catch { return null; }
}