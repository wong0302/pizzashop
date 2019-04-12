//TODO: Recheck content
const mongoose = require('mongoose')

const orderSchema = new mongoose.Schema({
    customr: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    type: {type: String, trim: true, lowercase: true, enum: ['pickup', 'delivery'], default: 'pickup'},
    status: {type: String, trim: true, lowercase: true, enum: ['draft', 'ordered', 'paid', 'delivered'], default: 'draft'},
    pizzas: [{type: mongoose.Schema.Types.ObjectId, ref: 'Pizzas'}],
    //TODO: address required field must be set to true if type is delivery
    address: {type: String, trim: true, lowercase: true, required: false},
    price: {type: Number, default: 0},
    //TODO: charge default field must be set to 500 if type is delivery
    deliveryCharge: {type: Number, default: 0},
    tax: {type: Number, default: 0},
    total: {type: Number, default: 0},
},
{
    timestamps: true
})

const Model = mongoose.model('Order', orderSchema)
module.exports = Model