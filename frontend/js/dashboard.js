document.addEventListener('DOMContentLoaded', async () => {

    const token = localStorage.getItem('cloudbakes_token');
    const userStr = localStorage.getItem('cloudbakeUser'); 

    if (!token) {
        alert("Please log in to view your dashboard.");
        window.location.href = 'login.html';
        return;
    }

 
    if (userStr) {
        const user = JSON.parse(userStr);
        document.getElementById('user-name').textContent = user.name || "Valued Customer";
        document.getElementById('user-email').textContent = user.email || "";
    }


    try {
        const response = await fetch('http://localhost:5000/api/orders/myorders', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) throw new Error("Failed to fetch orders");

        const orders = await response.json();
        renderOrders(orders);
        calculateLoyalty(orders);

    } catch (error) {
        console.error("Dashboard Error:", error);
        document.getElementById('orders-list').innerHTML = `
            <tr><td colspan="4" style="text-align: center; color: red;">Failed to load orders. Please try again later.</td></tr>
        `;
    }


    document.getElementById('logout-btn').addEventListener('click', () => {
        localStorage.removeItem('cloudbakes_token');
        localStorage.removeItem('cloudbakeUser');
        window.location.href = 'login.html';
    });
});


function renderOrders(orders) {
    const tbody = document.getElementById('orders-list');
    
    if (orders.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" style="text-align: center;">You haven't placed any orders yet. Time to buy some cake! 🍰</td></tr>`;
        return;
    }

    tbody.innerHTML = orders.map(order => {

        const date = new Date(order.createdAt).toLocaleDateString('en-US', {
            year: 'numeric', month: 'short', day: 'numeric'
        });
        

        const statusClass = order.isDelivered ? 'status-delivered' : 'status-processing';
        const statusText = order.isDelivered ? 'Delivered' : 'Processing';


        const shortId = order._id.substring(order._id.length - 6).toUpperCase();

        return `
            <tr>
                <td style="font-family: monospace; font-weight: bold;">#${shortId}</td>
                <td>${date}</td>
                <td style="font-weight: 600;">NPR ${order.totalPrice}</td>
                <td><span class="status-badge ${statusClass}">${statusText}</span></td>
            </tr>
        `;
    }).join('');
}

function calculateLoyalty(orders) {
 
    const totalSpent = orders.reduce((sum, order) => sum + order.totalPrice, 0);
    
    const badge = document.getElementById('loyalty-badge');
    const text = document.getElementById('loyalty-text');

    if (totalSpent >= 15000) {
        badge.className = 'loyalty-badge tier-gold';
        badge.innerHTML = '<i class="fas fa-crown"></i> Gold Member';
        text.textContent = `Amazing! You've spent NPR ${totalSpent} with us. Enjoy top-tier perks!`;
    } 
    else if (totalSpent >= 5000) {
        badge.className = 'loyalty-badge tier-silver';
        badge.innerHTML = '<i class="fas fa-star"></i> Silver Member';
        const toNext = 15000 - totalSpent;
        text.textContent = `You've spent NPR ${totalSpent}. Spend NPR ${toNext} more to reach Gold!`;
    } 
    else {
        badge.className = 'loyalty-badge tier-bronze';
        badge.innerHTML = '<i class="fas fa-medal"></i> Bronze Member';
        const toNext = 5000 - totalSpent;
        text.textContent = `You've spent NPR ${totalSpent}. Spend NPR ${toNext} more to reach Silver!`;
    }
}