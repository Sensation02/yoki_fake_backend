const express = require('express')
const app = express()
const path = require('path')
const cors = require('cors')
const corsOptions = require('./config/corsOptions')
// const { logger } = require('./middleware/logEvents')
const logger = require('morgan')
const errorHandler = require('./middleware/errorHandler')
const cookieParser = require('cookie-parser')
const credentials = require('./middleware/credentials')
// const mongoose = require('mongoose')
// const connectDB = require('./config/dbConn')
const PORT = process.env.PORT || 4000

// connect to database
// connectDB()

// custom middleware logger
app.use(logger('dev'))

// Handle options credentials check - before CORS!
// and fetch cookies credentials requirement
app.use(credentials)

// Cross Origin Resource Sharing
app.use(cors(corsOptions))
// app.use((req, res, next) => {
//   res.header('Access-Control-Allow-Origin', '*')
//   res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE')
//   res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
//   next()
// })

// built-in middleware to handle urlencoded form data
app.use(express.urlencoded({ extended: false }))

// built-in middleware for json
app.use(express.json())

//middleware for cookies
app.use(cookieParser())

//serve static files
app.use('/', express.static(path.join(__dirname, '/public')))

// routes
const route = require('./src/index.js')

app.use('/', route)

app.use(errorHandler)

// mongoose.connection.once('open', () => {
//   console.log('MongoDB connection ready!')
//   app.listen(PORT, () => {
//     console.log(`Server running on port ${PORT}`)
//   })
// })

// mongoose.connection.on('connected', () => {
//   console.log('MongoDB connection ready!')
//   app.listen(PORT, () => {
//     console.log(`Server running on port ${PORT}`)
//   })
// })

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
