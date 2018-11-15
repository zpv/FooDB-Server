const Router = require('express-promise-router')

const db = require('../db')
const jwt = require('jsonwebtoken')
const format = require('pg-format')

// create a new express-promise-router
// this has the same API as the normal express router except
// it allows you to use async functions as route handlers
const router = new Router()

// export our router to be mounted by the parent application
module.exports = router

router.post('/', async (req, res) => {
  // Verify user is signed in with a proper authentication token
  const token = req.headers['authorization']
  if (!token) return res.status(401).send({auth: false, message: 'No token provided'})
  try {
    const { id } = jwt.verify(token.split(" ")[1], process.env.SESSION_SECRET)

    const { restaurant_id, food_items } = req.body
    const address = (await db.query('SELECT address FROM "user" WHERE user_id = $1', [id])).rows[0].address

    const order_id = (await db.query('INSERT INTO "order" (restaurant_id, user_id, address, placed_datetime) VALUES($1, $2, $3, CURRENT_TIMESTAMP) RETURNING order_id', [restaurant_id, id, address])).rows[0].order_id

    let values = []
    for (item of food_items) {
      values.push([order_id, restaurant_id, item.name])
    }

    const insertOrderItems = format('INSERT INTO "order_item" (order_id, restaurant_id, menuitem_name) VALUES %L', values)
    await db.query(insertOrderItems)

    console.log(order_id)
    res.status(200).send({order_id})
    // const { rows } = await db.query('SELECT name, email, phone_num FROM "user" WHERE user_id = $1', [id])
    // res.send(rows[0])
  } catch (e) {
    console.log(e)
    return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' });
  }
})


router.get('/me', async (req, res) => {
  const token = req.headers['authorization']
  if (!token) return res.status(401).send({auth: false, message: 'No token provided'})
  try {
    const { id } = jwt.verify(token.split(" ")[1], process.env.SESSION_SECRET) // get user id
    const orders = (await db.query('SELECT * FROM "order" WHERE user_id = $1', [id])).rows

    res.send(orders)
  } catch (e) {
    console.log(e)
    return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' });
  }
})

router.get('/:id', async (req, res) => {
  const order_id = req.params.id
  const token = req.headers['authorization']
  if (!token) return res.status(401).send({auth: false, message: 'No token provided'})
  try {
    const { id } = jwt.verify(token.split(" ")[1], process.env.SESSION_SECRET) // get user id
    const order = (await db.query('SELECT * FROM "order" WHERE order_id = $1 AND user_id = $2', [order_id, id])).rows[0]
    const order_items = (await db.query('SELECT line_number, menuitem_name, price FROM "order_item", "menu_item" WHERE order_id = $1 AND menu_item.name = menuitem_name', [order_id])).rows

    res.send({order, order_items})
  } catch (e) {
    console.log(e)
    return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' });
  }
})
