// Підключаємо роутер до бек-енду
const express = require('express')
const router = express.Router()
const verifyJWT = require('../middleware/verifyJWT')
const bodyParser = require('body-parser')

// const auth = require('./auth')
// router.use('/auth', auth)

router.use(bodyParser.json())

router.use('/register', require('./route/register'))
router.use('/auth', require('./route/auth'))

// route for refreshing token (we will use it in front-end)
router.use('/refresh', require('./route/refresh'))

// route for logout
router.use('/logout', require('./route/logout'))

// for verifying JWT token we use verifyJWT middleware before all routes which we want to protect
// so verifyJWT middleware will be applied to all routes below
router.use(verifyJWT)
router.use('/users', require('./api/users'))
router.use('/users/:id', require('./api/users'))

router.get('/', (req, res) => {
  res.status(200).json('Hello World')
})

// Експортуємо глобальний роутер
module.exports = router
