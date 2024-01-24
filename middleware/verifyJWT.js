const jwt = require('jsonwebtoken')
require('dotenv').config()

const verifyJWT = (req, res, next) => {
  const accessToken = req.headers['authorization']

  // check if accessToken is not empty
  if (!accessToken) {
    return res.status(401).json({
      message: 'Access denied',
    })
  }
  console.log('accessToken: ', accessToken) // for testing

  const token = accessToken.split(' ')[1] // Bearer <token> and it's in the second position [1]

  // check if token is not empty
  try {
    const validToken = jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET,
      (err, decoded) => {
        if (err) return res.sendStatus(403) // forbidden
        // next we need a middleware to check if the user exists in the database
        req.user = decoded.email
        // next() is used to call the next middleware
        next()
      },
    )
    // req.user = validToken
    // next()
  } catch (error) {
    return res.status(403).json({
      message: 'Invalid token',
    })
  }
}

module.exports = verifyJWT
