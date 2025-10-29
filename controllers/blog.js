const blogRouter = require('express').Router()
/** @type {import('mongoose').Model} */
const Blog = require('../models/blog')
const User = require('../models/user')

blogRouter.get('/', async (request, response) => {
  const posts = await Blog.find({}).populate('author', {
    username: 1,
    name: 1
  })

  response.status(200).json(posts)
})

blogRouter.post('/', async (request, response) => {
  const body = request.body

  if (!body.title) {
    response.status(400).json({
      error: 'title missing'
    })
  }

  const user = await User.findById(body.author)

  const blog = new Blog({
    title: body.title,
    author: user._id,
    url: body.url,
    likes: body.likes || 0
  })

  const savedBlog = await blog.save()

  user.blogs = user.blogs.concat(savedBlog._id)
  await user.save()

  response.status(201).json(savedBlog)
})

blogRouter.delete('/:id', async (request, response) => {
  const id = request.params.id

  await Blog.findByIdAndDelete(id)

  response.status(204).end()
})

blogRouter.put('/:id', async (request, response) => {
  const body = request.body

  const blog = await Blog.findById(request.params.id)

  if (!blog) response.status(404).end()

  blog.title = body.title
  blog.author = body.author
  blog.url = body.url
  blog.likes = body.likes

  const updatedPost = await blog.save()

  response.status(200).json(updatedPost)
})

module.exports = blogRouter