const bcrypt = require('bcrypt')
const Blog = require('../models/blog')
const User = require('../models/user')

const initalPosts = [
  {
    title: 'Nas prvy prispevok',
    url: 'nas-prvy-prispevok',
    likes: 3,
  },
  {
    title: 'I enjoy programming',
    url: 'i-enjoy-programming',
    likes: 22,
  },
  {
    title: 'som unaveny z prace',
    url: 'som-unaveny-z-prace',
    likes: 145,
  }
]

const initalUsers = [
  {
    username: 'fipotest',
    name: 'flipo testovic',
    password: 'ipo123'
  },
  {
    username: 'placko',
    name: 'ipor mapovic',
    password: 'mapotapo'
  },
  {
    username: 'zdech',
    name: 'zdeno chodek',
    password: 'izd2016'
  },
]

const nonExistingBlogId = async () => {
  const post = new Blog({
    title: 'willremovesoon',
    author: 'willremovesoon',
    url: 'willremovesoon',
    likes: 0,
  })
  await post.save()
  await post.deteleOne()

  return post._id.toString()
}

const nonExistingUserId = async () => {
  const user = new User({
    username: 'willremovesoon',
    name: 'willremovesoon',
    password: 'willremovesoon'
  })
  await user.save()
  await user.deteleOne()

  return user._id.toString()
}

const postsInDb = async () => {
  const posts = await Blog.find({})
  return posts.map(post => post.toJSON())
}

const usersInDb = async () => {
  const users = await User.find({})
  return users.map(user => user.toJSON())
}

const hassUsersPass = async () => {
  return Promise.all(initalUsers.map(async (user) => {
    return {
      username: user.username,
      name: user.name,
      passwordHash: await bcrypt.hash(user.password, 10)
    }
  }))
}

module.exports = {
  initalPosts,
  nonExistingBlogId,
  postsInDb,
  initalUsers,
  nonExistingUserId,
  usersInDb,
  hassUsersPass
}