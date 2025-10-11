const blog = require("../models/blog");
const lodash = require('lodash')

const dummy = (blogs) => {
  return 1;
}

const totalLikes = (blogs) => {
  const likesCount = blogs.reduce((acumulator, post) => acumulator + post.likes, 0);
  return likesCount
}

const favoriteBlog = (blogs) => {
  if (blogs.length === 0) return undefined

  const sortedBlogs = blogs.reduce((prevPost, post) => {
    return post.likes > prevPost.likes ? post : prevPost
  })
  return sortedBlogs
}

const mostBlogs = (blogs) => {
  if (blogs.length === 0) return undefined

  const [author, blogCount] = lodash(blogs)
    .countBy('author')
    .toPairs()
    .maxBy((pairs) => pairs[1])


  return {
    author,
    blogs: blogCount
  }
}

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs
}