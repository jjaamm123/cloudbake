const express = require('express');
const router  = express.Router();
const jwt     = require('jsonwebtoken');
const User    = require('../models/user');
const { protect } = require('../middleware/authMiddleware');
const {
    sendWelcomeEmail,
    sendLoginNotificationEmail
} = require('../utils/emailService');                  

function getTierFromPoints(points) {
    if (points >= 1500) return 'gold';
    if (points >= 500)  return 'silver';
    return 'bronze';
}

function pointsToNextTier(points) {
    if (points < 500)  return { next: 'silver', needed: 500  - points };
    if (points < 1500) return { next: 'gold',   needed: 1500 - points };
    return null;
}

const generateToken = (id) =>
    jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });

router.post('/register', async (req, res) => {
    const { name, email, password, type } = req.body;

    try {
        const userExists = await User.findOne({ email });
        if (userExists)
            return res.status(400).json({ message: 'User already exists' });

        const startingPoints = 100;
        const user = await User.create({
            name,
            email,
            password,
            role:   type === 'wholesale' ? 'wholesale_pending' : 'customer',
            points: startingPoints,
            tier:   getTierFromPoints(startingPoints)
        });

        if (user) {
            sendWelcomeEmail({ to: email, name })
                .catch(err => console.error('Welcome email failed:', err));

            const progress = pointsToNextTier(user.points);
            res.status(201).json({
                _id:          user._id,
                name:         user.name,
                email:        user.email,
                role:         user.role,
                points:       user.points,
                tier:         user.tier,
                nextTier:     progress?.next   || null,
                pointsNeeded: progress?.needed || 0,
                joinDate:     user.createdAt,
                token:        generateToken(user._id)
            });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});

router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });

        if (user && (await user.matchPassword(password))) {
            const correctTier = getTierFromPoints(user.points);
            if (user.tier !== correctTier) {
                user.tier = correctTier;
                await user.save();
            }

            const loginTime = new Date().toLocaleString('en-US', {
                weekday: 'long', year: 'numeric', month: 'long',
                day: 'numeric', hour: '2-digit', minute: '2-digit',
                timeZoneName: 'short'
            });
            const ua      = req.headers['user-agent'] || '';
            const browser = ua.includes('Chrome')  ? 'Google Chrome'
                          : ua.includes('Firefox') ? 'Mozilla Firefox'
                          : ua.includes('Safari')  ? 'Safari'
                          : ua.includes('Edge')    ? 'Microsoft Edge'
                          : 'Unknown browser';

            sendLoginNotificationEmail({ to: email, name: user.name, time: loginTime, browser })
                .catch(err => console.error('Login notification email failed:', err));

            const progress = pointsToNextTier(user.points);
            res.json({
                _id:          user._id,
                name:         user.name,
                email:        user.email,
                role:         user.role,
                points:       user.points,
                tier:         user.tier,
                nextTier:     progress?.next   || null,
                pointsNeeded: progress?.needed || 0,
                joinDate:     user.createdAt,
                token:        generateToken(user._id)
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});

router.get('/profile', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        if (!user) return res.status(404).json({ message: 'User not found' });

        const correctTier = getTierFromPoints(user.points);
        if (user.tier !== correctTier) {
            user.tier = correctTier;
            await user.save();
        }

        const Order  = require('../models/order');
        const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
        const progress = pointsToNextTier(user.points);

        res.json({
            _id:          user._id,
            name:         user.name,
            email:        user.email,
            role:         user.role,
            points:       user.points,
            tier:         user.tier,
            nextTier:     progress?.next   || null,
            pointsNeeded: progress?.needed || 0,
            joinDate:     user.createdAt,
            orders:       orders.length
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});

router.post('/update-points', protect, async (req, res) => {
    try {
        const { totalPrice } = req.body;
        if (!totalPrice || totalPrice <= 0)
            return res.status(400).json({ message: 'Invalid totalPrice' });

        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const pointsEarned = Math.floor(totalPrice / 10);
        user.points += pointsEarned;
        user.tier    = getTierFromPoints(user.points);
        await user.save();

        const progress = pointsToNextTier(user.points);
        res.json({
            points:       user.points,
            tier:         user.tier,
            pointsEarned,
            nextTier:     progress?.next   || null,
            pointsNeeded: progress?.needed || 0
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;