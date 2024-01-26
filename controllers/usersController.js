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
  console.log('Receiving data from request body...')

  const { email, password, newPassword, firstName, lastName, id } = req.body

  console.log('Data received. Checking if user exists...')

  const user = data.users.find((user) => user.id === parseInt(id))
  if (!user) {
    return res.status(400).json({
      message: `User with ID:${id} not found`,
    })
  }

  console.log('User exists. Building conditions...')

  // condition for updating user's email
  // updating email
  const conditionEmail = !!email && !!password
  // updating password
  const conditionPassword = !!password && !!newPassword
  // updating first name
  const conditionFirstName = !!firstName && !!password
  // updating last name
  const conditionLastName = !!lastName && !!password

  console.log('Conditions built. Checking if password is correct...')

  // decrypting old password to compare with password from request body
  const isValid = bcrypt.compare(String(password), String(user.password))
  if (!isValid) {
    return res.status(400).json({
      message: 'Error. Password is incorrect',
    })
  }

  console.log('Password checked. Checking conditions...')

  // if user exists - update users info with data from request body according to conditions
  if (conditionEmail && isValid) {
    console.log('User email updating...')

    user.email = email
    console.log('User email updated')
  } else if (conditionPassword && isValid) {
    console.log('User password updating...')

    // hashing new password
    const hashedNewPassword = bcrypt.hashSync(newPassword, 10)

    user.password = hashedNewPassword
    console.log('User password updated')
  } else if (conditionFirstName && isValid) {
    console.log('User first name updating...')

    user.firstName = firstName
    console.log('User first name updated')
  } else if (conditionLastName && isValid) {
    console.log('User last name updating...')

    user.lastName = lastName
    console.log('User last name updated')
  } else {
    return res.status(400).json({
      message: 'Error. Please fill the fields',
    })
  }

  console.log('User updated. filtering users array...')

  // filter users array by id, to exclude updated user
  const filteredUsers = data.users.filter((user) => user.id !== parseInt(id))

  console.log(
    'Users array filtered. adding updated user to the end of users array...',
  )

  // add updated user to the end of users array
  const unsortedUsers = [...filteredUsers, user]

  console.log('Users array updated. sorting users array...')

  // set users array with updated user
  data.setUsers(
    unsortedUsers.sort((a, b) => (a.id > b.id ? 1 : a.id < b.id ? -1 : 0)),
  )

  console.log('Users array sorted. rewriting users.json file...')

  // rewrite users.json file with new users array
  fs.writeFileSync('./model/users.json', JSON.stringify(data.users))

  console.log('users.json file rewrited. Sending response...')

  res.json({ message: 'Successfully updated!', user })
}

const deleteUser = (req, res) => {
  const id = req.params.id

  console.log('Receiving data from params...')

  const user = data.users.find((user) => user.id === +id)

  // if user doesn't exist - return error
  if (!user) {
    return res.status(400).json({
      message: `User with ID:${+id} not found`,
    })
  }

  console.log('User exists. Deleting user...')

  // filter users array by id, to exclude deleted user
  const filteredUsers = data.users.filter((user) => user.id !== +id)

  // set users array without deleted user
  data.setUsers([...filteredUsers])

  // rewrite users.json file with new users array
  fs.writeFileSync('./model/users.json', JSON.stringify(data.users))

  console.log('User deleted. Sending response...')

  res.status(200).json({ message: 'Successfully deleted!', user })
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

module.exports = {
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
  getUserById,
}
