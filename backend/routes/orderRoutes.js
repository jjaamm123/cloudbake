const express = require('express');
const router  = express.Router();
const Order   = require('../models/order');
const User    = require('../models/user');
const { protect } = require('../middleware/authMiddleware');
const { sendOrderConfirmationEmail } = require('../utils/emailService');  // ← NEW

function getTierFromPoints(points) {
    if (points >= 1500) return 'gold';
    if (points >= 500)  return 'silver';
    return 'bronze';
}

router.post('/', protect, async (req, res) => {
    const { orderItems, shippingAddress, paymentMethod, totalPrice } = req.body;

    if (!orderItems || orderItems.length === 0)
        return res.status(400).json({ message: 'No order items' });

    try {
        const order = new Order({
            user: req.user._id,
            orderItems,
            shippingAddress,
            paymentMethod,
            totalPrice
        });

        const createdOrder = await order.save();

        // Award loyalty points — unchanged
        try {
            const pointsEarned = Math.floor(totalPrice / 10);
            const user = await User.findById(req.user._id);
            if (user) {
                user.points += pointsEarned;
                user.tier    = getTierFromPoints(user.points);
                await user.save();
            }
        } catch (pointsError) {
            console.error('Points update failed:', pointsError);
        }

        try {
            const user = await User.findById(req.user._id).select('name email');
            if (user?.email) {
                const addressStr = [
                    shippingAddress?.address,
                    shippingAddress?.city,
                    shippingAddress?.postalCode,
                    shippingAddress?.country
                ].filter(Boolean).join(', ');

                sendOrderConfirmationEmail({
                    to:            user.email,
                    name:          user.name,
                    orderId:       createdOrder._id,
                    items:         orderItems,
                    total:         totalPrice,
                    paymentMethod: paymentMethod || 'COD',
                    address:       addressStr   || 'Not provided'
                }).catch(err => console.error('Order confirmation email failed:', err));
            }
        } catch (emailErr) {
            console.error('Order email prep failed:', emailErr);
        }

        res.status(201).json(createdOrder);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});

router.get('/', protect, async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user._id })
            .sort({ createdAt: -1 });

        res.json({ orders, count: orders.length });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});

router.get('/:id', protect, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('user', 'name email');

        if (order) res.json(order);
        else       res.status(404).json({ message: 'Order not found' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;