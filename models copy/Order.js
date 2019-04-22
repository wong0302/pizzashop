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
    //console.log('pre hook is run')
    let pizzaCost = await orderSchema.methods.calcPizzaCost(this)
    //console.log('Pizza cost:', pizzaCost)

    let deliveryCharge = this.deliveryCharge
    //console.log('delivery charge:', deliveryCharge)

    let tax = await orderSchema.methods.calcTaxCost(pizzaCost, deliveryCharge)
    //console.log('tax:', tax)

    this.price = pizzaCost
    this.tax = tax
    this.total = pizzaCost + deliveryCharge + tax
    next()
})

orderSchema.post('findOneAndUpdate', async function (doc, next){
    //console.log("post hook is run, doc is", doc);
    await doc.populate('pizzas').execPopulate()
    await doc.save()
    next()
})

//Calculate tax
orderSchema.methods.calcTaxCost = function(pizzaCost, deliveryCharge) {
    return (pizzaCost + deliveryCharge) * 0.13
}

//Calculate total pizza cost
orderSchema.methods.calcPizzaCost = async function(order) {
    await order.populate('pizzas').execPopulate()

    let pizzaCost = order.pizzas.reduce(function(pre, pizza) {
        return pre + pizza.price
    }, 0)

    return pizzaCost
}

orderSchema.statics.getOrders = async function(userId, orders) {
    const userOrders = orders.filter(order => {
        if(order.customer == userId){
            return order
        }
    })
    return userOrders
}

const Model = mongoose.model('Order', orderSchema)
module.exports = Model