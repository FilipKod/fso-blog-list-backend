const express = require('express')
const mongoose = require('mongoose')

const blogRouter = require('./controllers/blog')
const userRouter = require('./controllers/users')

const config = require('./utils/config')
const errorHandler = require('./utils/middleware')

const app = express()

mongoose.connect(config.MONGODB_URI)

app.use(express.json())

app.use('/api/blogs', blogRouter)
app.use('/api/users', userRouter)

app.use(errorHandler)

module.exports = app