const data = {
  users: require('../model/users.json'),
  setUsers: function (data) {
    this.users = data
  },
}
const fs = require('fs')
const bcrypt = require('bcrypt')

const forgotPassword = (req, res) => {
  console.log('Receiving data from request body...')
  const { email, password, newPassword } = req.body

  console.log('Data received. Checking if user exists...')
  const user = data.users.find((user) => user.email === email)

  if (!user) {
    return res.status(400).json({
      message: `User with email: ${email} not found`,
    })
  }
  console.log('User exists. Checking if password is correct...')
  const isValid = bcrypt.compare(String(password), String(user.password))

  if (!isValid) {
    return res.status(400).json({
      message: 'Error. Password is incorrect',
    })
  }
  console.log('Password checked. Updating password...')

  const hashedNewPassword = bcrypt.hashSync(newPassword, 10)
  user.password = hashedNewPassword

  console.log('Password updated. filtering users array...')

  const filteredUsers = data.users.filter((user) => user.email !== email)

  console.log(
    'Users array filtered. adding updated user to the end of users array...',
  )

  const unsortedUsers = [...filteredUsers, user]

  console.log('Users array updated. sorting users array...')

  data.setUsers(
    unsortedUsers.sort((a, b) => (a.id > b.id ? 1 : a.id < b.id ? -1 : 0)),
  )

  console.log('Users array sorted. rewriting users.json file...')

  fs.writeFileSync('./model/users.json', JSON.stringify(data.users))

  console.log('users.json file rewrited. Sending response...')

  res.status(200).json({ message: 'Successfully updated!', user })
}

module.exports = { forgotPassword }
