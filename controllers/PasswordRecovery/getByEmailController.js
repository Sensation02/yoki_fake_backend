const usersDB = require('../../model/users')

const getByEmail = async (req, res) => {
  const { email } = req.body

  const user = usersDB.find((user) => user.email === email)

  if (!user) {
    return res.status(404).json({
      message: 'User not found',
    })
  }

  return res.status(200).json({
    message: 'User found',
    user,
  })
}

module.exports = getByEmail
