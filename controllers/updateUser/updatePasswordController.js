const usersDB = {
  users: require('../../model/users.json'),
  setUsers: function (data) {
    this.users = data
  },
}
const bcrypt = require('bcrypt')
const path = require('path')
const fsPromises = require('fs').promises

const updateUsersPassword = async (req, res) => {
  // getting old and new passwords from request body
  const { oldPassword, newPassword } = req.body

  // find user with such old password
  const userToUpdate = usersDB.users.find((user) =>
    bcrypt.compareSync(oldPassword, user.password),
  )

  // if user with such old password not found, return error
  if (!userToUpdate) {
    return res.status(400).json({
      message: `User with such password not found`,
    })
  }

  // hash new password
  const salt = bcrypt.genSaltSync(10)
  const hashedPassword = bcrypt.hashSync(newPassword, salt)

  // update user password with new hashed password
  userToUpdate.password = hashedPassword

  // filter users array to remove user with old password
  const filteredUsers = usersDB.users.filter(
    (user) => user.password !== hashedPassword,
  )

  // create new users array with updated user
  const unsortedUsers = [...filteredUsers, userToUpdate]

  // sort new users array by id
  const newUser = unsortedUsers.sort((a, b) =>
    a.id > b.id ? 1 : a.id < b.id ? -1 : 0,
  )

  // set new users array to usersDB
  usersDB.setUsers(newUser)

  // save new users array to users.json file
  await fsPromises.writeFile(
    path.join(__dirname, '../../model/users.json'),
    JSON.stringify(usersDB.users),
  )

  res.json({
    message: 'Password successfully updated!',
    newUser,
  })
}

module.exports = { updateUsersPassword }
