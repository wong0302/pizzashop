const config = require('config')
const mongoose = require('mongoose')
const logger = require('./logger')

module.exports = () => {
  const {scheme, host, port, name, username, password, authSource} = config.get('db')
  const credentials = username && password ? `${username}:${password}@` : ''

  let connectionString = `${scheme}://${credentials}${host}`

  if (scheme === 'mongodb') {
    connectionString += `:${port}/${name}?authSource=${authSource}`
  } else {
    connectionString += `/${authSource}?retryWrites=true&w=majority`
  }

  mongoose
    .connect(
      connectionString,
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true,
        useFindAndModify: false,
        dbName: name
      }
    )
    .then(() => {
      logger.log('info', `Connected to MongoDB @ ${name}...`)
    })
    .catch(err => {
      logger.log('error', `Error connecting to MongoDB ...`, err)
      process.exit(1)
    })
}