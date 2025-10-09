const express = require('express')
const mongoose = require('mongoose')

const blogRouter = require('./controllers/blog')
const config = require('./utils/config')

const app = express()

mongoose.connect(config.MONGODB_URI)

app.use(express.json())

app.use('/api/blogs', blogRouter)

module.exports = app;