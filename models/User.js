const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    firstName: {type: String, trim: true, maxlength: 64, required: true},
    lastName: {type: String, trim: true, maxlength: 64, required: true},
    email: {type: String, trim: true, maxlength: 512, required: true, unique: true},
    password: {type: String, trim: true, maxlength: 70, required: true},
    isStaff: {type: Boolean, trim: true, default: false}
})

//TODO: Implement the rest of the model content

const Model = mongoose.model('User', userSchema)
module.exports = Model