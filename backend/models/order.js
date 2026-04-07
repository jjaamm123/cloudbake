const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
    name:    { type: String,  required: true },
    qty:     { type: Number,  required: true, default: 1 },
    image:   { type: String,  default: '' },
    price:   { type: Number,  required: true },
    product: { type: String,  default: '' }   // item id / slug from cart
}, { _id: false });

const shippingAddressSchema = new mongoose.Schema({
    address:    { type: String, default: '' },
    city:       { type: String, default: 'Kathmandu' },
    postalCode: { type: String, default: '' },
    country:    { type: String, default: 'Nepal' },
    phone:      { type: String, default: '' },
    name:       { type: String, default: '' }
}, { _id: false });

const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref:  'User',
        required: true
    },
    orderItems:      [orderItemSchema],
    shippingAddress: shippingAddressSchema,
    paymentMethod:   { type: String, default: 'COD' },
    totalPrice:      { type: Number, required: true, default: 0 },
    isPaid:          { type: Boolean, default: false },
    isDelivered:     { type: Boolean, default: false },
    status: {
        type:    String,
        default: 'Processing',
        enum:    ['Processing', 'Confirmed', 'Out for Delivery', 'Delivered', 'Cancelled']
    },
    paidAt:      { type: Date },
    deliveredAt: { type: Date }
}, {
    timestamps: true   // adds createdAt + updatedAt automatically
});

module.exports = mongoose.model('Order', orderSchema);