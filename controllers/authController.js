const usersDB = {
  users: require('../model/users.json'),
  setUsers: function (data) {
    this.users = data
  },
}

const bcrypt = require('bcrypt') // for password hashing
const jwt = require('jsonwebtoken') // for JWT authentication
require('dotenv').config() // for .env file

// for file system (because we don't have a database for now)
const fsPromises = require('fs').promises // for file system
const path = require('path')
// const bodyParser = require('body-parser')

// const User = require('../model/users')

const accessKey = process.env.ACCESS_TOKEN_SECRET
const refreshKey = process.env.REFRESH_TOKEN_SECRET

const tokenOptions = {
  expiresIn: '1d',
}

const handleLogin = async (req, res) => {
  const { email, password } = req.body

  console.log(
    'auth controller handleLogin. req.body data received. checking if email and password are not empty...',
    email,
    password,
  )

  if (!email || !password) {
    return res.status(400).json({ message: 'Error. Please fill all fields' })
  }

  console.log(
    'auth controller handleLogin. email and password are not empty. checking if user exists in the database...',
  )

  const foundUser = usersDB.users.find((user) => user.email === email)

  if (!foundUser) {
    console.log('auth controller handleLogin. user not found')
    return res.status(404).json({
      message: `User with such email not found`,
    })
  } else {
    console.log(
      'auth controller handleLogin. user found, email: ',
      foundUser.email,
    )
  }

  console.log(
    'auth controller handleLogin. checking if the password is correct...',
  )

  const match = await bcrypt.compare(password, foundUser.password)

  if (!match) {
    console.log('auth controller handleLogin. password is wrong')
    return res.status(401).json({
      message: 'Wrong password',
    })
  } else {
    console.log(
      'auth controller handleLogin. password is correct. creating access and refresh tokens and payloads for them...',
    )
  }

  const payload = {
    user: {
      id: foundUser.id,
      email: foundUser.email,
    },
  }

  // if the password is correct:
  // create access and refresh tokens:
  const accessToken = jwt.sign(payload, accessKey, tokenOptions)
  console.log(
    'auth controller handleLogin. access token created, payload: ',
    accessToken.payload,
  )
  const refreshToken = jwt.sign(payload, refreshKey, tokenOptions)
  console.log(
    'auth controller handleLogin. refresh token created, payload: ',
    refreshToken.payload,
  )

  // JWT authentication (access and refresh tokens):
  // filtering out the current user from the usersDB to add the new refresh token to it
  const otherUser = usersDB.users.filter(
    (user) => user.email !== foundUser.email,
  )

  // creating the current(new) user with the refresh token
  const currentUser = {
    ...foundUser,
    refreshToken,
  }

  // updating the usersDB with the current user (with the new refresh token)
  usersDB.setUsers([...otherUser, currentUser])

  // saving the updated usersDB to users.json
  await fsPromises.writeFile(
    path.join(__dirname, '../model/users.json'),
    JSON.stringify(usersDB.users),
  )

  // sending the access token and the refresh token to the client so we can use them in front-end and allow the user to access protected routes
  console.log('Sending access token and refresh token to the client...')
  res.cookie('jwt', refreshToken, {
    httpOnly: true,
    // sameSite: 'none',
    // secure: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours - max age of the cookie
  })
  res.status(200).json({ accessToken })
  console.log('Access token and refresh token sent to the client')
}

const me = async (req, res) => {
  console.log('auth controller me. req.user: ', req.user)
  try {
    // request.user is getting fetched from Middleware after token authentication
    console.log('auth controller me. Finding user in the database...')
    const user = await usersDB.users.find((user) => user.id === req.user.id)

    console.log('auth controller me. user found')

    if (!user) {
      return res
        .status(401)
        .json({ message: 'auth controller me. User Not Exist' })
    }

    console.log('auth controller me. Sending user to the client...')
    res.status(200).json({ user, message: 'auth controller me. Success.' })
    console.log('auth controller me. User sent to the client')
  } catch (e) {
    res
      .status(500)
      .json({ message: 'auth controller me. Error in Fetching user' })
  }
}

module.exports = { handleLogin, me }
