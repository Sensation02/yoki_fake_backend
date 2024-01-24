const express = require('express')
const router = express.Router()
const {
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
  getUserById,
  getUserByEmail,
} = require('../../controllers/usersController')

// here we can create, read, update, delete users (CRUD) using REST API methods (GET, POST, PUT, DELETE) for /users route
// apply verifyJWT middleware to all routes which we want to protect
// if we want to protect all routes in this file, we can use it in main router file (src/route/index.js)
router.route('/').get(getAllUsers)

router.route('/').post(getUserByEmail)

router.route('/').post(createUser)

router.route('/:id').put(updateUser)

router.route('/:id').delete(deleteUser)

// here we can get user by id
router.route('/:id').get(getUserById)

module.exports = router
