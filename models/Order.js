const mongoose = require('mongoose')

const orderSchema = new mongoose.Schema({
    customer: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    type: {type: String, trim: true, lowercase: true, enum: ['pickup', 'delivery'], default: 'pickup'},
    status: {type: String, trim: true, lowercase: true, enum: ['draft', 'ordered', 'paid', 'delivered'], default: 'draft'},
    pizzas: [{type: mongoose.Schema.Types.ObjectId, ref: 'Pizza'}],
    address: {type: String, trim: true, lowercase: true, required: function() { return this.type == 'delivery' ? true : false}},
    price: {type: Number, default: 0},
    deliveryCharge: {type: Number, default: function() { return this.type == 'delivery' ? 500 : 0}, set: value => Math.floor(value)},
    tax: {type: Number, default: 0},
    total: {type: Number, default: 0},
},
{
    timestamps: true
})

const Model = mongoose.model('Order', orderSchema)
module.exports = Model