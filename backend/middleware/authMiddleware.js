const jwt = require('jsonwebtoken');
const User = require('../models/user');

const protect = async (req, res, next) => {
    let token;

    // 1. Check if the "Authorization" header exists and starts with "Bearer"
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            // 2. Get the token from the header (removing "Bearer " string)
            token = req.headers.authorization.split(' ')[1];

            // 3. Verify the token using your Secret Key
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // 4. Find the user in the DB (exclude the password for safety)
            // We attach this user to the request object so orderRoutes can use it!
            req.user = await User.findById(decoded.id).select('-password');

            next(); // Move on to the next step (the route handler)
        } catch (error) {
            console.error(error);
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        res.status(401).json({ message: 'Not authorized, no token' });
    }
};

module.exports = { protect };