const User = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback_secret', {
        expiresIn: '30d'
    });
};

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Please add all fields' });
        }

        // Check for user
        const user = await User.findOne({ email });

        if (!user) {
            // SPECIFIC REQUIREMENT: Return 404 if user doesn't exist to trigger frontend redirect
            return res.status(404).json({ message: 'User not found' });
        }

        if (user && (await bcrypt.compare(password, user.password))) {
            const token = generateToken(user._id);
            res.status(200).json({
                _id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                points: user.points,
                tier: user.tier,
                token: token
            });
        } else {
            res.status(401).json({ message: 'Invalid credentials' });
        }

    } catch (error) {
        console.error('Login Error:', error);

        // Check for database connection errors (Timeout, Network, etc.)
        if (
            error.name === 'MongoNetworkError' ||
            error.name === 'MongooseServerSelectionError' ||
            (error.name === 'MongooseError' && error.message.includes('timed out'))
        ) {
            return res.status(503).json({ message: 'Service Unavailable: Database connection failed' });
        }

        res.status(500).json({ message: 'Server error' });
    }
};

const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Please add all fields' });
        }

        // Check if user exists
        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user
        const user = await User.create({
            name,
            email,
            password: hashedPassword
        });

        if (user) {
            res.status(201).json({
                _id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                points: user.points,
                tier: user.tier,
                token: generateToken(user._id)
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }

    } catch (error) {
        console.error('Registration Error:', error);

        // Check for database connection errors (Timeout, Network, etc.)
        if (
            error.name === 'MongoNetworkError' ||
            error.name === 'MongooseServerSelectionError' ||
            (error.name === 'MongooseError' && error.message.includes('timed out'))
        ) {
            return res.status(503).json({ message: 'Service Unavailable: Database connection failed' });
        }

        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    loginUser,
    registerUser
};