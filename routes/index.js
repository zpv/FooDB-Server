const users = require('./users')
const setup = require('./setup.js')

module.exports = (app) => {
  app.use('/users', users)
  app.use('/setup', setup)
}