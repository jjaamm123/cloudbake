// models/Message.js
const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    message: { type: String, required: true },
    isRead: { type: Boolean, default: false }, // Helps you track what you've seen
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Message', messageSchema);