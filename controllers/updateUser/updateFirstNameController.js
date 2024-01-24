const data = {
  users: require('../../model/users.json'),
  setUsers: function (data) {
    this.users = data
  },
}
const bcrypt = require('bcrypt')
const path = require('path')
const fsPromises = require('fs').promises

const updateUsersName = async (req, res) => {
  const { password, firstName } = req.body

  // decrypt password from request body
  const decryptPassword = await bcrypt.hash(password, 10)

  // find user by password from request body
  const userToUpdate = data.users.find(
    (user) => user.password === decryptPassword,
  )

  // if user doesn't exist - return error
  if (!userToUpdate) {
    return res.status(400).json({
      message: `User not found`,
    })
  }

  // if user exists but password is incorrect - return error
  if (userToUpdate.password !== decryptPassword) {
    return res.status(400).json({
      message: `Password is incorrect`,
    })
  }

  // if user exists and password is correct - update users info with data from request body
  userToUpdate.firstName = firstName

  // filter users array and remove user with old first name
  const filteredUsers = data.users.filter(
    (user) => user.firstName !== firstName,
  )

  // sorting users and adding updated user to the end of users array
  const unsortedUsers = [...filteredUsers, userToUpdate]

  const newUser = unsortedUsers.sort((a, b) =>
    a.id > b.id ? 1 : a.id < b.id ? -1 : 0,
  )

  // set users array with updated user
  data.setUsers(newUser)

  // write updated users array to users.json file
  await fsPromises.writeFile(
    path.join(__dirname, '../../model/users.json'),
    JSON.stringify(data.users),
  )

  // send response with updated user
  res.json({
    message: 'First name successfully updated!',
    newUser,
  })
}

module.exports = { updateUsersName }
