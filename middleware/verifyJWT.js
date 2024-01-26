const jwt = require('jsonwebtoken')
require('dotenv').config()

const secret = process.env.ACCESS_TOKEN_SECRET

const verifyJWT = (req, res, next) => {
  const authHeader = req.headers.authorization

  // check if accessToken is not empty
  if (!authHeader) {
    return res.status(403).json({ message: 'No token provided' })
  }
  console.log('Access token received. Trying to split it')

  const parts = authHeader.split(' ')

  if (!parts.length === 2) {
    return res.status(403).json({ message: 'Token error' })
  } else {
    console.log('Token split successfully')
  }

  const [scheme, token] = parts
  console.log('Token parts. scheme: ', scheme, 'token: ', token)

  if (!/^Bearer$/i.test(scheme)) {
    return res.status(403).json({ message: 'Token malformed' })
  } else {
    console.log('Bearer scheme found in token')
  }

  try {
    console.log('Trying to verify token')
    jwt.verify(token, secret, (err, decoded) => {
      console.log('decode info: ', { decoded })
      if (err)
        return res
          .status(403)
          .json({ message: 'Failed to authenticate token.' })

      req.userId = decoded.id
      next()
    })
  } catch (error) {
    return res.status(403).json({
      message: 'Invalid token',
    })
  }
}

module.exports = verifyJWT
