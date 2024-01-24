const usersDB = {
  users: require('../model/users.json'),
  setUsers: function (data) {
    this.users = data
  },
}
const fsPromises = require('fs').promises
const path = require('path')
// const User = require('../model/users')
const bcrypt = require('bcrypt') // for password hashing

const handleNewUser = async (req, res) => {
  const { email, password, firstName, lastName } = req.body

  // check if email and password are not empty:
  if (!email || !password || !firstName || !lastName) {
    return res.status(400).json({ message: 'Error. Please fill all fields' })
  }

  // check if user with this email already exists:
  const duplicate = usersDB.users.find((user) => user.email === email)
  // or with mongoose:
  // const duplicate = await User.findOne({ email }).exec()

  if (duplicate) {
    return res.status(409).json({
      message: `User with email: ${email} already exists`,
    })
  }

  try {
    // hash password:
    const hashedPassword = await bcrypt.hash(password, 10)

    const newUser = {
      id: usersDB.users[usersDB.users.length - 1].id + 1,
      firstName,
      lastName,
      email,
      password: hashedPassword,
    }
    // create new user object:
    // const newUser = await User.create({
    //   // id: usersDB.users[usersDB.users.length - 1].id + 1,
    //   email,
    //   password: hashedPassword,
    // })
    // console.log(newUser, ' <- newUser')

    // add new user to users array:
    // usersDB.users.setUsers([...usersDB.users, newUser])
    // or
    usersDB.users.push(newUser)

    await fsPromises.writeFile(
      path.join(__dirname, '../model/users.json'),
      JSON.stringify(usersDB.users),
    )

    res.status(201).json({
      message: 'New user successfully created!',
      user: newUser,
    })
  } catch {
    res.status(500).json({
      message: 'Internal server error',
    })
  }
}

module.exports = { handleNewUser }
