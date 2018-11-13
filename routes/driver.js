const Router = require('express-promise-router')

const db = require('../db')

// create a new express-promise-router
// this has the same API as the normal express router except
// it allows you to use async functions as route handlers
const router = new Router()

// export our router to be mounted by the parent application
module.exports = router

// General endpoints for all deliverers
router.get('/list', async (req, res) => {
  const { rows } = await db.query('SELECT * FROM driver') // Show all deliverers
  res.send(rows)
})



