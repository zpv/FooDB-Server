const users = require('./users')
const setup = require('./setup')
const restaurants = require('./restaurants')
const drivers = require('./drivers')
const orders = require('./orders')

module.exports = (app) => {
  app.use('/users', users)
  app.use('/setup', setup)
  app.use('/restaurants', restaurants)
  app.use('/drivers', drivers)
  app.use('/orders', orders)
}