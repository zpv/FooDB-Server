const users = require('./users')
const setup = require('./setup.js')
const restaurants = require('./restaurants.js')

module.exports = (app) => {
  app.use('/users', users)
  app.use('/setup', setup)
  app.use('/restaurants', restaurants)
}