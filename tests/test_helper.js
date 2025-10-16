const Blog = require('../models/blog')

const initalPosts = [
  {
    title: 'Nas prvy prispevok',
    author: 'Filip Madunicky',
    url: 'nas-prvy-prispevok',
    likes: 3,
  },
  {
    title: 'I enjoy programming',
    author: 'madisek',
    url: 'i-enjoy-programming',
    likes: 22,
  },
  {
    title: 'som unaveny z prace',
    author: 'filipek',
    url: 'som-unaveny-z-prace',
    likes: 145,
  }
]

const nonExistingId = async () => {
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

const postsInDb = async () => {
  const posts = await Blog.find({})
  return posts.map(post => post.toJSON())
}

module.exports = {
  initalPosts,
  nonExistingId,
  postsInDb
}