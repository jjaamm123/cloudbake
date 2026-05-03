const express = require('express');
const router  = express.Router();
// 1. Remove the email service and import the database model instead
const Message = require('../models/Message'); 

router.post('/', async (req, res) => {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !message) {
        return res.status(400).json({
            message: 'Name, email, and message are required.'
        });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ message: 'Invalid email address.' });
    }

    try {
        // 2. Create a new message document
        const newMessage = new Message({
            name,
            email,
            // If your website form has a subject line, you can add it to the model later, 
            // but for now we'll just save the required fields we setup earlier.
            message: subject ? `[Subject: ${subject}] ${message}` : message 
        });

        // 3. Save it directly to MongoDB
        await newMessage.save();

        res.status(200).json({
            success: true,
            message: 'Your message has been sent! We\'ll get back to you soon.'
        });
    } catch (error) {
        console.error('Contact form database error:', error);
        res.status(500).json({
            message: 'Failed to send message. Please try again later.'
        });
    }
});

module.exports = router;