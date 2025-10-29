const blogRouter = require('express').Router()
const jwt = require('jsonwebtoken')
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

  const decodedToken = jwt.verify(request.token, process.env.JWT_SECRET)

  if (!decodedToken.id) {
    return response.status(401).json({ error: 'invalid token' })
  }

  const user = await User.findById(decodedToken.id)

  if (!user) {
    return response.status(401).json({ error: 'UserId missing or not valid' })
  }

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

  const decodedToken = jwt.verify(request.token, process.env.JWT_SECRET)

  if (!decodedToken.id) {
    return response.status(401).json({ error: 'invalid token' })
  }

  const user = await User.findById(decodedToken.id)

  if (!user) {
    return response.status(401).json({ error: 'UserId missing or not valid' })
  }

  const blog = await Blog.findById(id)

  if (blog.author.toString() === decodedToken.id.toString()) {
    await Blog.findByIdAndDelete(id)
    response.status(204).end()
  } else {
    response.status(403).json({ error: 'permission denied: user is not the author' })
  }
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