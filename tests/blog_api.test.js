const { test, beforeEach, after } = require('node:test')
const assert = require('node:assert')
const supertest = require('supertest')
const mongoose = require('mongoose')
const app = require('../app')
const helper = require('./test_helper')
const Blog = require('../models/blog')
const User = require('../models/user')

const api = supertest(app)

beforeEach(async () => {
  await User.deleteMany({})
  await Blog.deleteMany({})

  const usersToDb = await helper.hassUsersPass()
  const users = await User.insertMany(usersToDb)

  const postsWithAuthor = helper.initalPosts.map((post, index) => {
    return {
      ...post,
      author: users[index]._id
    }
  })

  await Blog.insertMany(postsWithAuthor)
})

test('all posts are returned as json with correct status code', async () => {
  const response = await api
    .get('/api/blogs')
    .expect(200)
    .expect('Content-type', /application\/json/)

  assert.strictEqual(response.body.length, helper.initalPosts.length)
})

test('blog posts identifier is returned as "id" not "_id"', async () => {
  const response = await api.get('/api/blogs')

  const firstPost = response.body[0]

  assert.strictEqual(Object.hasOwn(firstPost, 'id'), true)

  assert.strictEqual(Object.hasOwn(firstPost, '_id'), false)

  assert.strictEqual(typeof firstPost.id, 'string')
})

test('new valid blog post was added with correct content and auth user', async () => {
  const firstPerson = helper.initalUsers[0]

  const loginResponse = await api
    .post('/api/login')
    .send({
      username: firstPerson.username,
      password: firstPerson.password
    })
    .expect(200)
    .expect('Content-type', /application\/json/)

  const newPost = {
    title: 'testing title',
    url: 'testing-url',
    likes: 111,
  }

  await api
    .post('/api/blogs')
    .send(newPost)
    .set('Authorization', `Bearer ${loginResponse.body.token}`)
    .expect(201)
    .expect('Content-type', /application\/json/)

  const postsAtEnd = await helper.postsInDb()
  assert.strictEqual(postsAtEnd.length, helper.initalPosts.length + 1)

  const contents = postsAtEnd.map(p => p.title)
  assert(contents.includes(newPost.title))

  const usersAtEnd = await helper.usersInDb()
  assert.strictEqual(postsAtEnd[postsAtEnd.length - 1].author.toString(), usersAtEnd[0].id.toString())
})

test('new blog post fails with status code 401 - token missing', async () => {
  const newPost = {
    title: 'testing title',
    url: 'testing-url',
    likes: 111,
  }

  const response = await api
    .post('/api/blogs')
    .send(newPost)
    .set('Authorization', 'Bearer ')
    .expect(401)
    .expect('Content-type', /application\/json/)

  const postsAtEnd = await helper.postsInDb()
  assert.strictEqual(postsAtEnd.length, helper.initalPosts.length)

  assert(response.body.error.includes('token missing'))
})

test('new blog post was added with default property "likes" value', async () => {
  const firstPerson = helper.initalUsers[0]

  const loginResponse = await api
    .post('/api/login')
    .send({
      username: firstPerson.username,
      password: firstPerson.password
    })
    .expect(200)
    .expect('Content-type', /application\/json/)

  const likesMissingPost = {
    title: 'test title default like',
    url: 'test-url'
  }

  await api
    .post('/api/blogs')
    .send(likesMissingPost)
    .set('Authorization', `Bearer ${loginResponse.body.token}`)
    .expect(201)
    .expect('Content-type', /application\/json/)

  const postsAtEnd = await helper.postsInDb()
  assert.strictEqual(postsAtEnd.length, helper.initalPosts.length + 1)

  assert.strictEqual(postsAtEnd[postsAtEnd.length - 1].likes, 0)

  const titles = postsAtEnd.map(p => p.title)
  assert(titles.includes(likesMissingPost.title))

  const usersAtEnd = await helper.usersInDb()
  assert.strictEqual(postsAtEnd[postsAtEnd.length - 1].author.toString(), usersAtEnd[0].id.toString())
})

test('new blog post without title return status 400', async () => {
  const firstPerson = helper.initalUsers[0]

  const loginResponse = await api
    .post('/api/login')
    .send({
      username: firstPerson.username,
      password: firstPerson.password
    })
    .expect(200)
    .expect('Content-type', /application\/json/)

  const titleMissingPost = {
    author: 'test author',
    url: 'test-url'
  }

  await api
    .post('/api/blogs')
    .send(titleMissingPost)
    .set('Authorization', `Bearer ${loginResponse.body.token}`)
    .expect(400)

  const postsAtEnd = await helper.postsInDb()
  assert.strictEqual(postsAtEnd.length, helper.initalPosts.length)
})

test('deleting blog post with status code 204', async () => {
  const firstPerson = helper.initalUsers[0]

  const loginResponse = await api
    .post('/api/login')
    .send({
      username: firstPerson.username,
      password: firstPerson.password
    })
    .expect(200)
    .expect('Content-type', /application\/json/)

  const postsAtStart = await helper.postsInDb()
  const postToDelete = postsAtStart[0]

  await api
    .delete(`/api/blogs/${postToDelete.id}`)
    .set('Authorization', `Bearer ${loginResponse.body.token}`)
    .expect(204)

  const postsAtEnd = await helper.postsInDb()
  assert.strictEqual(postsAtEnd.length, helper.initalPosts.length - 1)

  const contents = postsAtEnd.map(p => p.title)
  assert(!contents.includes(postToDelete.title))
})

test('deleting blog post with status code 401 - permission denied', async () => {
  const person = helper.initalUsers[1]

  const loginResponse = await api
    .post('/api/login')
    .send({
      username: person.username,
      password: person.password
    })
    .expect(200)
    .expect('Content-type', /application\/json/)

  const postsAtStart = await helper.postsInDb()
  const postToDelete = postsAtStart[0]

  const response = await api
    .delete(`/api/blogs/${postToDelete.id}`)
    .set('Authorization', `Bearer ${loginResponse.body.token}`)
    .expect(403)
    .expect('Content-type', /application\/json/)

  const postsAtEnd = await helper.postsInDb()
  assert.strictEqual(postsAtEnd.length, helper.initalPosts.length)

  assert(response.body.error.includes('permission denied: user is not the author'))
})

test('update number of likes in blog post', async () => {
  const firstPerson = helper.initalUsers[0]

  const loginResponse = await api
    .post('/api/login')
    .send({
      username: firstPerson.username,
      password: firstPerson.password
    })
    .expect(200)
    .expect('Content-type', /application\/json/)

  const postsAtStart = await helper.postsInDb()
  const postToUpdate = postsAtStart[0]

  const updatedData = {
    ...postToUpdate,
    likes: 12
  }

  await api
    .put(`/api/blogs/${postToUpdate.id}`)
    .send(updatedData)
    .set('Authorization', `Bearer ${loginResponse.body.token}`)
    .expect(200)
    .expect('Content-type', /application\/json/)

  const postsAtEnd = await helper.postsInDb()

  // length of posts doesn't change
  assert.strictEqual(postsAtEnd.length, helper.initalPosts.length)

  // first post changed based on test
  assert.strictEqual(postsAtEnd[0].likes, updatedData.likes)
})

after(async () => {
  await mongoose.connection.close()
})