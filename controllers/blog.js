const blogRouter = require('express').Router()
/** @type {import('mongoose').Model} */
const Blog = require('../models/blog')

blogRouter.get('/', async (request, response) => {
  const posts = await Blog.find({})

  response.status(200).json(posts)
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

blogRouter.delete('/:id', async (request, response) => {
  const id = request.params.id

  await Blog.findByIdAndDelete(id)

  response.status(204).end()
})

module.exports = blogRouter