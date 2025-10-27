const mongoose = require('mongoose')

/**
 * @type {import('mongoose').Schema}
 */
const userSchema = mongoose.Schema({
  username: {
    type: String,
    required: [true, 'username is required'],
    minLength: 3,
    unique: [true, 'username must be unique']
  },
  name: String,
  passwordHash: {
    type: String,
    required: true
  }
})

userSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject.__v
    delete returnedObject._id
  }
})

module.exports = mongoose.model('User', userSchema)