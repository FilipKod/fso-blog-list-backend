const mongoose = require('mongoose')

/**
 * @type {import('mongoose').Schema}
 */
const blogSchema = mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  url: String,
  likes: Number,
})

blogSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject.__v
    delete returnedObject._id
  }
})

module.exports = mongoose.model('Blog', blogSchema)