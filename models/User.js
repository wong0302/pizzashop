const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')

const bcrypt = require('bcrypt')
const saltRounds = 14

const userSchema = new mongoose.Schema({
    firstName: {type: String, trim: true, maxlength: 64, required: true},
    lastName: {type: String, trim: true, maxlength: 64, required: true},
    email: {type: String, trim: true, maxlength: 512, required: true, unique: true},
    password: {type: String, trim: true, maxlength: 70, required: true},
    isStaff: {type: Boolean, trim: true, default: false}
})

userSchema.methods.generateAuthToken = function() {
  return jwt.sign({_id: this._id}, 'superSecureSecret')
}

userSchema.statics.authenticate = async function(email, password) {
  const user = await this.findOne({email: email})

  const hashedPassword = user ? user.password : `$2b$${saltRounds}$invalidusernameaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa`
  const passwordDidMatch = await bcrypt.compare(password, hashedPassword)

  return passwordDidMatch ? user : null
}

//triggered before a model is saved
userSchema.pre('save', async function (next) {
  // Only encrypt if the password property is being changed.
  if (!this.isModified('password')) return next()

  this.password = await bcrypt.hash(this.password, saltRounds)
  next()
})

//Redact sensitive data
userSchema.methods.toJSON = function() {
  const obj = this.toObject()
  delete obj.password
  delete obj.__v
  return obj
}


const Model = mongoose.model('User', userSchema)
module.exports = Model