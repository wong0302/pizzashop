const mongoose = require('mongoose')
const Pizza = require('./Pizza')

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

orderSchema.pre('save', async function (next) {
    let pizzaCost = await orderSchema.methods.calcPizzaCost(this)
    console.log('Pizza cost:', pizzaCost)

    let deliveryCharge = this.deliveryCharge
    console.log('delivery charge:', deliveryCharge)

    let tax = await orderSchema.methods.calcTaxCost(pizzaCost, deliveryCharge)
    console.log('tax:', tax)

    this.price = pizzaCost
    this.tax = tax
    this.total = pizzaCost + deliveryCharge + tax
})

orderSchema.methods.calcTaxCost = function(pizzaCost, deliveryCharge) {
    return (pizzaCost + deliveryCharge) * 0.13
}

orderSchema.methods.calcPizzaCost = async function(order) {
    await order.populate('pizzas').execPopulate()

    let pizzaCost = order.pizzas.reduce(function(pre, pizza) {
        return pre + pizza.price
    }, 0)

    return pizzaCost
}

const Model = mongoose.model('Order', orderSchema)
module.exports = Model