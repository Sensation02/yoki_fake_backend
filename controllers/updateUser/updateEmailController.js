const data = {
  users: require('../../model/users.json'),
  setUsers: function (data) {
    this.users = data
  },
}
const bcrypt = require('bcrypt')
const path = require('path')
const fsPromises = require('fs').promises

const updateUsersEmail = async (req, res) => {
  const { email, password } = req.body

  console.log('password: ', password)
  console.log('users passwords: ', data.users.password)

  const userToUpdate = data.users.find((user) =>
    bcrypt.compareSync(password, user.password),
  )

  if (!userToUpdate) {
    return res.status(400).json({
      message: `User with such password not found`,
    })
  }

  userToUpdate.email = email

  const filteredUsers = data.users.filter(
    (user) => user.email !== email,
  )

  const unsortedUsers = [...filteredUsers, userToUpdate]

  const newUser = unsortedUsers.sort((a, b) =>
    a.id > b.id ? 1 : a.id < b.id ? -1 : 0,
  )

  data.setUsers(newUser)

  // save new users array to users.json file
  await fsPromises.writeFile(
    path.join(__dirname, '../../model/users.json'),
    JSON.stringify(data.users),
  )

  res.json({
    message: 'Email successfully updated!',
    newUser,
  })
}

module.exports = { updateUsersEmail }
