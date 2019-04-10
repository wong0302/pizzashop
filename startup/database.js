const debug = require('debug')('pizzashop:db')
const mongoose = require('mongoose')

module.exports = () => {
  mongoose
    .connect('mongodb://localhost:27017/wackelstackel', {useNewUrlParser: true})
    .then(() => {
      debug('successfully connected')
    })
    .catch(err => {
      debug('Failed connection attempt:', rr)
      process.exit(1)
    })
}