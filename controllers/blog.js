const blogRouter = require('express').Router()
const Blog = require('../models/blog')

blogRouter.get('/', async (request, response) => {
  const posts = await Blog.find({})

  return response.status(200).json(posts)
})

blogRouter.post('/', async (request, response) => {
  const blog = new Blog(request.body)

  const newBlog = await blog.save()

  response.status(201).json(newBlog)
})

module.exports = blogRouter