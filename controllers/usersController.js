const data = {
  users: require('../model/users.json'),
  setUsers: function (data) {
    this.users = data
  },
}
const fs = require('fs')
const bcrypt = require('bcrypt')

// REST API's methods which we can use for /users route
// this API's is just for example
const getAllUsers = (req, res) => {
  return res.status(200).json(data.users)
}

const createUser = (req, res) => {
  const { email, password, firstName, lastName } = req.body

  // check if email and password are not empty
  if (!email || !password || !firstName || !lastName) {
    return res.status(400).json({ message: 'Error. Please fill all fields' })
  }

  const newUser = {
    id: data.users[data.users.length - 1].id + 1,
    firstName,
    lastName,
    email,
    password,
  }

  if (data.users.find((user) => user.email === email)) {
    return res.status(400).json({
      message: `User with such email: ${email} already exists`,
    })
  }

  // add new user to users array
  // data.users.setUsers([...data.users, newUser])
  // or
  data.users.push(newUser)

  // rewrite users.json file with new users array
  fs.writeFileSync('./model/users.json', JSON.stringify(data.users))

  res.status(201).json({
    message: 'Successfully created!',
    users: data.users,
  })
}

const updateUser = (req, res) => {
  const id = parseInt(req.params.id)

  // find user by id from request params
  const user = data.users.find((user) => user.id === id)

  // if user doesn't exist - return error
  if (!user) {
    return res.status(400).json({
      message: `User with ID:${id} not found`,
    })
  }

  console.log(req.body)

  // condition for updating user's email
  // updating email
  const conditionEmail = req.body.email && req.body.password
  // updating password
  const conditionPassword = req.body.password && req.body.newPassword
  // updating first name
  const conditionFirstName = req.body.firstName && req.body.password
  // updating last name
  const conditionLastName = req.body.lastName && req.body.password

  // hashing new password
  const hashedPassword = bcrypt.hash(req.body.newPassword, 10)

  // decrypting old password to compare with password from request body
  const isValid = bcrypt.compare(req.body.password, user.password)

  console.log(conditionEmail)

  // if user exists - update users info with data from request body according to conditions
  if (conditionEmail) {
    // check if email already exists
    // if (data.users.find((user) => user.email === req.body.email)) {
    //   return res.status(400).json({
    //     message: `User with such email: ${req.body.email} already exists`,
    //   })
    // }

    if (!isValid) {
      return res.status(400).json({
        message: 'Error. Password is incorrect',
      })
    } else {
      user.email = req.body.email
    }
  } else if (conditionPassword) {
    // check if old password is correct
    if (!decryptedPassword) {
      return res.status(400).json({
        message: 'Error. Old password is incorrect',
      })
    }

    user.password = hashedPassword
  } else if (conditionFirstName) {
    user.firstName = req.body.firstName
  } else if (conditionLastName) {
    user.lastName = req.body.lastName
  } else {
    return res.status(400).json({
      message: 'Error. Please fill all fields',
    })
  }

  // filter users array by id, to exclude updated user
  const filteredUsers = data.users.filter(
    (user) => user.id !== parseInt(req.params.id),
  )

  // add updated user to the end of users array
  const unsortedUsers = [...filteredUsers, user]

  // set users array with updated user
  data.setUsers(
    unsortedUsers.sort((a, b) => (a.id > b.id ? 1 : a.id < b.id ? -1 : 0)),
  )

  // rewrite users.json file with new users array
  fs.writeFileSync('./model/users.json', JSON.stringify(data.users))

  res.json({ message: 'Successfully updated!', user })
}

const deleteUser = (req, res) => {
  const id = req.body.id

  const user = data.users.find((user) => user.id === id)

  // if user doesn't exist - return error
  if (!user) {
    return res.status(400).json({
      message: `User with ID:${id} not found`,
    })
  }

  // filter users array by id, to exclude deleted user
  const filteredUsers = data.users.filter((user) => user.id !== id)

  // set users array without deleted user
  data.setUsers([...filteredUsers])

  // rewrite users.json file with new users array
  fs.writeFileSync('./model/users.json', JSON.stringify(data.users))

  res.json({ message: 'Successfully deleted!', user })
}

const getUserById = (req, res) => {
  const user = data.users.find((user) => user.id === parseInt(req.params.id))

  // if user doesn't exist - return error
  if (!user) {
    return res.status(400).json({
      message: `User with ID: ${req.params.id} not found`,
    })
  }

  res.json({ message: 'Successfully found!', user })
}

const getUserByEmail = (req, res) => {
  const email = req.body.email
  const user = data.users.find((user) => user.email === email)

  // if user doesn't exist - return error
  if (!user) {
    return res.status(400).json({
      message: `User with email: ${req.body.email} not found`,
    })
  }

  res.json({ message: 'Successfully found!', user })
}

module.exports = {
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
  getUserById,
  getUserByEmail,
}
