const usersDB = {
  users: require('../model/users.json'),
  setUsers: function (data) {
    this.users = data
  },
}

console.log('auth controller. usersDB found', usersDB.users.length)

const fsPromises = require('fs').promises
const path = require('path')
// const User = require('../model/users')
const bcrypt = require('bcrypt') // for password hashing

const handleNewUser = async (req, res) => {
  const { email, password, firstName, lastName } = req.body

  console.log('auth controller handleNewUser. req.body data received.')

  // check if email and password are not empty:
  if (!email || !password || !firstName || !lastName) {
    return res.status(400).json({
      message: 'auth controller handleNewUser. Please fill all fields',
    })
  }

  console.log(
    'auth controller handleNewUser. email and password are not empty. checking if user exists in the database...',
  )

  // check if user with this email already exists:
  const duplicate = usersDB.users.find((user) => user.email === email)
  // or with mongoose:
  // const duplicate = await User.findOne({ email }).exec()

  if (duplicate) {
    return res.status(409).json({
      message: `User with email: ${email} already exists`,
    })
  }

  console.log(
    'auth controller handleNewUser. user not found. creating new user...',
  )

  try {
    // hash password:
    const hashedPassword = await bcrypt.hash(password, 10)

    console.log(
      'auth controller handleNewUser. password hashed. creating new user...',
    )

    const newUser = {
      id:
        usersDB.users.length > 0
          ? usersDB.users[usersDB.users.length - 1].id + 1
          : 1,
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

    console.log(
      'auth controller handleNewUser. new user created. adding new user to users array...',
    )

    usersDB.users.push(newUser)

    console.log(
      'auth controller handleNewUser. new user added to users array. saving users array to users.json...',
    )

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
