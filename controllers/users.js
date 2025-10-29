const userRouter = require('express').Router()
const User = require('../models/user')
const bcrypt = require('bcrypt')

userRouter.post('/', async (request, response) => {
  const { username, password, name } = request.body

  if (!password) {
    return response.status(400).json({ error: 'Password is required.' })
  }

  if (password.length < 3) {
    return response.status(400).json({ error: 'Password must contains at least 3 characters.' })
  }

  const saltRounds = 10
  const passwordHash = await bcrypt.hash(password, saltRounds)

  const user = new User({
    username,
    name,
    passwordHash
  })

  const savedUser = await user.save()

  response.status(201).json(savedUser)
})

userRouter.get('/', async (request, response) => {
  const users = await User.find({}).populate('blogs', '-author')

  response.json(users)
})

module.exports = userRouter