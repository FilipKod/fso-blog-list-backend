const errorHandler = (error, request, response, next) => {
  console.log(error)

  if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }

  next()
}

module.exports = errorHandler