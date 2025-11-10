const blogRouter = require('express').Router()
/** @type {import('mongoose').Model} */
const Blog = require('../models/blog')
const { requestAuth } = require('../utils/middleware')

blogRouter.get('/', async (request, response) => {
  const posts = await Blog.find({}).populate('author', {
    username: 1,
    name: 1
  })

  response.status(200).json(posts)
})

blogRouter.post('/', requestAuth, async (request, response) => {
  const body = request.body
  const user = request.user

  const blog = new Blog({
    title: body.title,
    author: user._id,
    url: body.url,
    likes: body.likes || 0
  })

  const savedBlog = await blog.save()

  user.blogs = user.blogs.concat(savedBlog._id)
  await user.save()

  await savedBlog.populate('author', 'username name')

  response.status(201).json(savedBlog)
})

blogRouter.delete('/:id', requestAuth, async (request, response) => {
  const id = request.params.id
  const user = request.user

  const blog = await Blog.findById(id)

  if (blog.author.toString() === user._id.toString()) {
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

  blog.author = body.author.id
  blog.title = body.title
  blog.url = body.url
  blog.likes = body.likes

  const updatedPost = await blog.save()

  await updatedPost.populate('author', 'name username')

  response.status(200).json(updatedPost)
})

module.exports = blogRouter