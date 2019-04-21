const mongoose = require('mongoose')
const Ingredient = require('./Ingredient')

const pizzaSchema = new mongoose.Schema({
    name: {type: String, trim: true, minlength: 4, maxlength: 64, required: true},
    price: {type: Number, trim: true, minvalue: 1000, maxvalue: 10000, default: 1000},
    size: {type: String, trim: true, lowercase: true, enum: ['small', 'medium', 'large', 'extra large'], default: 'small'},
    isGlutenFree: {type: Boolean, trim: true, default: false},
    imageUrl: {type: String, trim: true, maxlength: 1024},
    //ingredients are the base/default ingredients on the pizza
    ingredients: [{type: mongoose.Schema.Types.ObjectId, ref: 'Ingredient'}],
    //extra toppings are for custom pizza orders
    //Must automatically update price on save.
    extraToppings: [{type: mongoose.Schema.Types.ObjectId, ref: 'Ingredient'}]
})

pizzaSchema.pre('save', async function (next) {
    await this.populate('ingredients').execPopulate()
    await this.populate('extraToppings').execPopulate()

    const allIngredients = [...this.ingredients, ...this.extraToppings]
    console.log('all toppings', allIngredients)

    let price = allIngredients.reduce(function(pre, ingredient) {
        console.log('all toppings', ingredient.price)
        return pre + ingredient.price
    }, 0);

    this.price = price
})

const Model = mongoose.model('Pizza', pizzaSchema)
module.exports = Model