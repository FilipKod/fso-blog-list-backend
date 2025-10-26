const express = require('express')
const mongoose = require('mongoose')

const blogRouter = require('./controllers/blog')
const userRouter = require('./controllers/users')

const config = require('./utils/config')

const app = express()

mongoose.connect(config.MONGODB_URI)

app.use(express.json())

app.use('/api/blogs', blogRouter)
app.use('/api/users', userRouter)

module.exports = app