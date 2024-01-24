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

// const User = require('../model/users')

const handleLogin = async (req, res) => {
  const { email, password } = req.body

  // check if email and password are not empty:
  if (!email || !password) {
    return res.status(400).json({ message: 'Error. Please fill all fields' })
  }

  // check if user exists in the database:
  const foundUser = usersDB.users.find((user) => user.email === email)
  // or with mongoose:
  // const foundUser = await User.findOne({
  //   email,
  // }).exec()

  if (!foundUser) {
    return res.status(401).json({
      message: `User with email: ${email} not found`,
    })
  }

  const match = await bcrypt.compare(password, foundUser.password)

  if (!match) {
    return res.status(401).json({
      message: 'Wrong password',
    })
  }

  // if the password is correct:
  if (match) {
    // create access and refresh tokens:
    const accessToken = jwt.sign(
      { email: foundUser.email },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: '1d' },
    )
    const refreshToken = jwt.sign(
      { email: foundUser.email },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: '1d' },
    )

    // JWT authentication (access and refresh tokens):
    // filtering out the current user from the usersDB
    const otherUser = usersDB.users.filter(
      (user) => user.email !== foundUser.email,
    )

    // creating the current user with the new refresh token
    const currentUser = {
      ...foundUser,
      refreshToken,
    }

    // updating the usersDB with the current user
    usersDB.setUsers([...otherUser, currentUser])

    // saving the updated usersDB to users.json
    await fsPromises.writeFile(
      path.join(__dirname, '../model/users.json'),
      JSON.stringify(usersDB.users),
    )

    // sending the access token and the refresh token to the client so we can use them in front-end and allow the user to access protected routes
    res.cookie('jwt', refreshToken, {
      httpOnly: true,
      // sameSite: 'none',
      // secure: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours - max age of the cookie
    })
    res.json({ accessToken })
  } else {
    return res.sendStatus(401)
  }
}

module.exports = { handleLogin }
