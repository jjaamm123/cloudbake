const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: String,
    price: { type: Number, required: true },
    category: { type: String, enum: ['cake', 'cupcake', 'pastry'], required: true },
    image: String, // URL to your image
    isAvailable: { type: Boolean, default: true }
});

module.exports = mongoose.model('Product', productSchema);