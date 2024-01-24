#!/usr/bin/env node

/**
 * Module dependencies.
 */

const app = require('./app')
const debug = require('debug')(
  'template-express-live-reload:server',
)
const http = require('http')

/**
 * Get port from environment and store in Express.
 */

const port = normalizePort(process.env.PORT || '4000')
app.set('port', port)

/**
 * Create HTTP server.
 */

const server = http.createServer(app)

/**
 * Listen on provided port, on all network interfaces.
 */

server.listen(port)
server.on('error', onError)
server.on('listening', onListening)

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
  const port = parseInt(val, 10)

  if (isNaN(port)) {
    // named pipe
    return val
  }

  if (port >= 0) {
    // port number
    return port
  }

  return false
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error
  }

  const bind =
    typeof port === 'string'
      ? 'Pipe ' + port
      : 'Port ' + port

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.log(bind + ' requires elevated privileges')
      process.exit(1)
      break
    case 'EADDRINUSE':
      console.log(bind + ' is already in use')
      process.exit(1)
      break
    default:
      throw error
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

// const mongoose = require('mongoose')
// const connectDB = require('./config/dbConn')

// // Connect to MongoDB:
// connectDB()
// mongoose.connection.once('open', () => {
//   console.log('Mongoose connected to db')
//   app.listen(port, () => {
//     console.log(
//       'Listening on ' + 'http://localhost:' + port,
//     )
//   })
// })

function onListening() {
  const addr = server.address()
  const bind =
    typeof addr === 'string'
      ? 'pipe ' + addr
      : 'port ' + addr.port
  debug('Listening on ' + bind)
  console.log(
    'Listening on ' + 'http://localhost:' + addr.port,
  )
}

/**
 * Event logs
 */

const logEvents = require('./middleware/logEvents')
const EventEmitter = require('events')

class Emitter extends EventEmitter {}

// initialize obj
const myEmitter = new Emitter()

// adding listener for the log event
myEmitter.on('log', (message) => {
  logEvents(message)
})

// emit log event after 1 second
setTimeout(() => {
  myEmitter.emit('log', 'Server started')
}, 1000)

// after starting the server, you can see the logs in the logs/eventsLog.txt file
// and we will receive a message in the console after 1 second that the server has started or performed some other action:
