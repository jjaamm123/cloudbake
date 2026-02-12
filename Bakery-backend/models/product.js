const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    category: { 
        type: String, 
        required: true,
        enum: ['cake', 'cupcake', 'pastry', 'cookie', 'bread', 'donuts', 'breads', 'seasonal'] 
    },
    image: { type: String, required: true },
    rating: { type: Number, default: 4.5 },
    isAvailable: { type: Boolean, default: true }
});

module.exports = mongoose.model('Product', productSchema);