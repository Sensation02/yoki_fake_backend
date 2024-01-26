const jwt = require('jsonwebtoken')
require('dotenv').config()

module.exports = function (req, res, next) {
  const token = req.header('token')
  console.log('Token found. verifying...')
  if (!token)
    return res.status(401).json({ message: 'Auth middleware. Token not found' })
  try {
    const decoded = jwt.decode(token, process.env.ACCESS_TOKEN_SECRET)
    console.log('Token verified and decoded: ', decoded)
    if (decoded && decoded.user) {
      req.user = decoded.user
      console.log('user found and decoded')
    } else {
      console.log('decoded.user not found')
    }
    next()
  } catch (e) {
    console.error(e)
    res.status(500).send({ message: 'Invalid Token' })
  }
}
