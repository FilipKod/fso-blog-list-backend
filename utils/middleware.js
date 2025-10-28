const logger = require('./logger')

const errorHandler = (error, request, response, next) => {
  logger.error(error)

  if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  } else if (
    error.name === 'MongoServerError' &&
    error.message.includes('E11000 duplicate key error collection')) {
    return response.status(409).json({ error: 'username must be unique' })
  }

  next()
}

module.exports = errorHandler