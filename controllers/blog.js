const blogRouter = require('express').Router()
const Blog = require('../models/blog')

blogRouter.get('/', async (request, response) => {
  const posts = await Blog.find({})

  return response.status(200).json(posts)
})

blogRouter.post('/', async (request, response) => {
  const body = request.body

  if (!body.title) {
    response.status(400).json({
      error: 'title missing'
    })
  }

  const blog = new Blog({
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes || 0
  })

  const newBlog = await blog.save()

  response.status(201).json(newBlog)
})

module.exports = blogRouter