const config = require('config')
const mongoose = require('mongoose')
const db = config.get('db')
const debug = require('debug')('pizzashop:db')

//const mongoose = require('mongoose')
let credentials = ''
if (process.env.NODE_ENV === 'production') {
  credentials = `${db.username}:${db.password}@`
}

module.exports = () => {
  const connectionString = `mongodb://${credentials}${db.host}:${db.port}/${db.name}?authSource=admin`
  mongoose
  .connect(connectionString, {useNewUrlParser: true})
    .then(() => {
      debug('successfully connected')
    })
    .catch(err => {
      debug('Failed connection attempt:', err)
      process.exit(1)
    })
}

// module.exports = () => {
//   mongoose
//     .connect('mongodb://localhost:27017/wackelstackel', {useNewUrlParser: true})
//     .then(() => {
//       debug('successfully connected')
//     })
//     .catch(err => {
//       debug('Failed connection attempt:', err)
//       process.exit(1)
//     })
// }