const { test, beforeEach, after } = require('node:test')
const assert = require('node:assert')
const supertest = require('supertest')
const mongoose = require('mongoose')
const app = require('../app')
const helper = require('./test_helper')
const Blog = require('../models/blog')

const api = supertest(app)

beforeEach(async () => {
  await Blog.deleteMany({})
  await Blog.insertMany(helper.initalPosts)
})

test('all posts are returned as json', async () => {
  await api
    .get('/api/blogs')
    .expect(200)
    .expect('Content-type', /application\/json/)
})

test('all posts are returned', async () => {
  const response = await api.get('/api/blogs')

  assert.strictEqual(response.body.length, helper.initalPosts.length)
})

test('blog posts identifier is returned as "id" not "_id"', async () => {
  const response = await api.get('/api/blogs')

  const firstPost = response.body[0]

  assert.strictEqual(Object.hasOwn(firstPost, 'id'), true)

  assert.strictEqual(Object.hasOwn(firstPost, '_id'), false)

  assert.strictEqual(typeof firstPost.id, 'string')
})

test('new valid blog post was added with correct content', async () => {
  const newPost = {
    title: 'testing title',
    author: 'testing author',
    url: 'testing-url',
    likes: 111,
  }

  await api
    .post('/api/blogs')
    .send(newPost)
    .expect(201)

  const postsAtEnd = await helper.postsInDb()
  assert.strictEqual(postsAtEnd.length, helper.initalPosts.length + 1)

  const contents = postsAtEnd.map(p => p.title)
  assert(contents.includes(newPost.title))
})

test('new blog post was added with default property "likes" value', async () => {
  const likesMissingPost = {
    title: 'test title',
    author: 'test author',
    url: 'test-url'
  }

  await api
    .post('/api/blogs')
    .send(likesMissingPost)
    .expect(201)

  const postsAtEnd = await helper.postsInDb()
  assert.strictEqual(postsAtEnd.length, helper.initalPosts.length + 1)
  assert.strictEqual(postsAtEnd[postsAtEnd.length - 1].likes, 0)
})

test('new blog post without title return status 400', async () => {
  const titleMissingPost = {
    author: 'test author',
    url: 'test-url'
  }

  await api
    .post('/api/blogs')
    .send(titleMissingPost)
    .expect(400)

  const postsAtEnd = await helper.postsInDb()
  assert.strictEqual(postsAtEnd.length, helper.initalPosts.length)
})

test.only('deleting blog post with status code 204', async () => {
  const postsAtStart = await helper.postsInDb()
  const postToDelete = postsAtStart[0]

  await api.delete(`/api/blogs/${postToDelete.id}`).expect(204)

  const postsAtEnd = await helper.postsInDb()
  assert.strictEqual(postsAtEnd.length, helper.initalPosts.length - 1)

  const contents = postsAtEnd.map(p => p.title)
  assert(!contents.includes(postToDelete.title))
})

after(async () => {
  await mongoose.connection.close()
})