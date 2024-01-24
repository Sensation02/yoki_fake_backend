const usersDB = {
  users: require('../model/users.json'),
  setUsers: function (data) {
    this.users = data
  },
}
// for deleting tokens from users.json
// can be replaced with database in future
const fsPromises = require('fs').promises
const path = require('path')
// const User = require('../model/users')

const handleLogout = async (req, res) => {
  // on client side we need to delete cookies with accessToken and refreshToken

  const cookies = req.cookies // get cookies from request
  if (!cookies?.jwt) return res.sendStatus(204) // if there is no jwt cookie, return 204 status (No Content)
  const refreshToken = cookies.jwt // get jwt cookie

  // find user by refreshToken in usersDB:
  const foundUser = usersDB.users.find(
    (user) => user.refreshToken === refreshToken,
  )
  // or with mongoose:
  // const foundUser = await User.findOne({
  //   refreshToken,
  // }).exec()

  if (!foundUser) {
    res.clearCookie('jwt', {
      httpOnly: true,
    }) // delete jwt cookie
    return res.sendStatus(204) // send 204 status (No Content)
  }

  // delete refreshToken from users.json
  const otherUsers = usersDB.users.filter(
    (user) => user.refreshToken !== foundUser.refreshToken,
  ) // get all users except user with refreshToken

  const currentUsers = { ...foundUser, refreshToken: '' } // create new user with refreshToken = '' - empty string

  usersDB.setUsers([...otherUsers, currentUsers]) // set new usersDB

  // save new usersDB to users.json
  await fsPromises.writeFile(
    path.join(__dirname, '../model/users.json'),
    JSON.stringify(usersDB.users),
  )

  res.clearCookie('jwt', {
    httpOnly: true,
  }) // delete jwt cookie
  res.sendStatus(204) // send 204 status (No Content)
}

module.exports = { handleLogout }
