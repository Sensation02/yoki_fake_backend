const usersDB = {
  users: require('../model/users.json'),
  setUsers: function (data) {
    this.users = data
  },
}
const jwt = require('jsonwebtoken') // for JWT authentication
require('dotenv').config() // for .env file
// const User = require('../model/users')

const handleRefreshToken = async (req, res) => {
  // get cookies from request:
  const cookies = req.cookies

  // if there is no jwt cookie, return 401 status (Unauthorized):
  if (!cookies?.jwt) return res.sendStatus(401)
  console.log('cookies.jwt', cookies.jwt) // log jwt cookie

  // get jwt cookie:
  const refreshToken = cookies.jwt

  const foundUser = usersDB.users.find(
    (user) => user.refreshToken === refreshToken,
  ) // find user by refreshToken in usersDB
  // or with mongoose:
  // const foundUser = await User.findOne({
  //   refreshToken,
  // }).exec()

  // if there is no user with this refreshToken, return 403 status (Forbidden)
  if (!foundUser) return res.sendStatus(403)

  // if there is a user with this refreshToken, verify refreshToken:
  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
    // if there is an error with verifying refreshToken, return 403 status (Forbidden):
    if (err || foundUser.email !== decoded.email) return res.sendStatus(403)

    // create new accessToken:
    const accessToken = jwt.sign(
      { email: decoded.email },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: '1h' },
    )

    // send accessToken to client:
    res.status(200).json({ accessToken })
    console.log('new accessToken delivered')
  })
}

module.exports = { handleRefreshToken }
