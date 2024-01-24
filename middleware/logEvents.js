// Here you can see the logic for logging events to a file.

const { format } = require('date-fns')
const { v4: uuid } = require('uuid')
const fsPromise = require('fs').promises
const path = require('path')

const logEvents = async (message) => {
  const logPath = path.join(__dirname, '..', 'logs')
  const logFile = path.join(logPath, 'eventsLog.txt')
  const dateTime = format(new Date(), 'yyyy-MM-dd HH:mm:ss')

  // const logItem = {
  //   id: uuid(), // unique id for each log
  //   timestamp: dateTime, // date and time of the event
  //   message, // the event message
  // }
  const logItem = `Log ==== ${dateTime} --- ${uuid()} --- ${message}`
  console.log(logItem)

  // create the logs directory if it doesn't exist:
  try {
    await fsPromise.mkdir(logPath)
  } catch (error) {
    if (error.code !== 'EEXIST') {
      throw error
    }
  }

  // append the log to the file:
  try {
    await fsPromise.appendFile(logFile, `${logItem}\n`)
  } catch (error) {
    console.error(`Failed to log event: ${error}`)
  }
}

module.exports = logEvents
