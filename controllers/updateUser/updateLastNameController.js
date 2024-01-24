const data = {
  users: require('../../model/users.json'),
  setUsers: function (data) {
    this.users = data
  },
}
const bcrypt = require('bcrypt')
const path = require('path')
const fsPromises = require('fs').promises

const updateUsersLastName = async (req, res) => {
  const { password, lastName } = req.body

  const userToUpdate = data.users.find((user) =>
    bcrypt.compareSync(password, user.password),
  )

  if (!userToUpdate) {
    return res.status(400).json({
      message: `User with such password not found`,
    })
  }

  userToUpdate.lastName = lastName

  const filteredUsers = data.users.filter((user) => user.lastName !== lastName)

  const unsortedUsers = [...filteredUsers, userToUpdate]

  const newUser = unsortedUsers.sort((a, b) =>
    a.id > b.id ? 1 : a.id < b.id ? -1 : 0,
  )

  data.setUsers(newUser)

  await fsPromises.writeFile(
    path.join(__dirname, '../../model/users.json'),
    JSON.stringify(data.users),
  )

  res.json({
    message: 'Last name successfully updated!',
    newUser,
  })
}

module.exports = { updateUsersLastName }
