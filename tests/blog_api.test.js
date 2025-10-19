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

test.only('blog posts identifier is returned as "id" not "_id"', async () => {
  const response = await api.get('/api/blogs')

  const firstPost = response.body[0]

  assert.strictEqual(Object.hasOwn(firstPost, 'id'), true)

  assert.strictEqual(Object.hasOwn(firstPost, '_id'), false)

  assert.strictEqual(typeof firstPost.id, 'string')
})

after(async () => {
  await mongoose.connection.close()
})