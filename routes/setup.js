const Router = require('express-promise-router')

const db = require('../db')
const setup = require('../db/setup')

// create a new express-promise-router
// this has the same API as the normal express router except
// it allows you to use async functions as route handlers
const router = new Router()

// export our router to be mounted by the parent application
module.exports = router

router.post('/', async (req, res) => {
  const { password } = req.body

  // Only allow authenticated users to initialize database.
  if (password != process.env.DBADMINPW) {
    res.send('Invalid password.')
    return
  }

  setup()

  res.send('Database initalized.')
})