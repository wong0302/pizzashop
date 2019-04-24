const mongoose = require('mongoose')

const ingredientSchema = new mongoose.Schema({
	name: {type: String, trim: true, maxlength: 64, required: true},
	price: {type: Number, trim: true, maxvalue: 10000, default: 100},
	quantity: {type: Number, trim: true, maxvalue: 1000, default: 10},
	isGlutenFree: {type: Boolean, trim: true, default: false},
	imageUrl: {type: String, trim: true, maxlength: 1024},
	categories: {type: String, trim: true, lowercase: true, enum: ['meat', 'spicy', 'vegetarian', 'vegan', 'halal', 'kosher', 'cheese', 'seasonings']}
})

ingredientSchema.statics.getIngredients = function(inStock){
  if(inStock) return this.find({quantity: {$gte: 1}})
  if(!inStock) return this.find()
}

const Model = mongoose.model('Ingredient', ingredientSchema)
module.exports = Model