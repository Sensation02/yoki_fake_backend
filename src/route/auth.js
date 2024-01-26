const express = require('express')
const router = express.Router()
const authController = require('../../controllers/authController')
const auth = require('../../middleware/auth')

// insert middleware here between the route and the controller
router.get('/me', auth, authController.me)
router.post('/', authController.handleLogin)

module.exports = router
