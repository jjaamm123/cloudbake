// controllers/adminController.js
const Product = require('../models/product'); // Assuming your cake model is named this
const Message = require('../models/Message');

const addMenuItem = async (req, res) => {
    try {
        const newProduct = new Product(req.body);
        const savedProduct = await newProduct.save();
        res.status(201).json({ success: true, data: savedProduct });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const updateMenuItem = async (req, res) => {
    try {
        const updatedProduct = await Product.findByIdAndUpdate(
            req.params.id, 
            req.body, 
            { new: true } 
        );
        res.status(200).json({ success: true, data: updatedProduct });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const deleteMenuItem = async (req, res) => {
    try {
        await Product.findByIdAndDelete(req.params.id);
        res.status(200).json({ success: true, message: 'Menu item deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getContactQueries = async (req, res) => {
    try {
        const messages = await Message.find().sort({ createdAt: -1 }); // Newest first
        res.status(200).json({ success: true, data: messages });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    addMenuItem,
    updateMenuItem,
    deleteMenuItem,
    getContactQueries
};