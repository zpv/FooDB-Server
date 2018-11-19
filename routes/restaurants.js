const Router = require('express-promise-router')
var format = require('pg-format');
const db = require('../db')
const jwt = require('jsonwebtoken')

// create a new express-promise-router
// this has the same API as the normal express router except
// it allows you to use async functions as route handlers
const router = new Router()

// export our router to be mounted by the parent application
module.exports = router

router.get('/:id/menu-items', async (req, res) => {
    const { id } = req.params
    const { rows } = await db.query('SELECT * FROM menu_item WHERE restaurant_id = $1', [id])
    res.send(rows)
})

router.get('/list', async (req, res) => {
    const { rows } = await db.query('SELECT * FROM restaurant') // SHOULD USE VIEW THAT SHOWS ONLY HOURS,ADDRESS, RATING
    res.send(rows)
  })

router.get('/:id', async (req, res) => {
    const { id } = req.params
    const { rows } = await db.query('SELECT * FROM restaurant WHERE restaurant_id = $1', [id])
    res.send(rows[0])
})

// for restaurant managers, gets all orders of the restaurant
router.get('/:id/orders', async (req, res) => {
    const { id } = req.params
    const { rows } = await db.query('SELECT * FROM "restaurant", "order" WHERE "restaurant".restaurant_id = "order".restaurant_id AND "order".restaurant_id = $1 AND prepared_datetime IS NULL', [id]);
    res.send(rows)
})

// gets all reviews for that restaurant
router.get('/:id/reviews', async (req, res) => {
    const { id } = req.params
    const { rows } = await db.query('SELECT * FROM restaurant_review WHERE restaurant_review.restaurant_id = $1 ORDER BY review_id DESC', [id]);
    res.send(rows)
})

/* GET FOOD ITEMS WHICH WERE INCLUDED IN ALL ORDERS OF THE RESTAURANT */

router.get('/:id/division', async (req, res) => {
    const { id } = req.params

    const division = await db.query(`
    (SELECT name
      FROM menu_item m
      WHERE m.restaurant_id = $1)
    EXCEPT
    (SELECT name
      FROM (
        (SELECT order_id, name
          FROM menu_item m2, "order" o2
          WHERE m2.restaurant_id = $1
            AND o2.restaurant_id = m2.restaurant_id)
        EXCEPT
          (SELECT order_id, name
          FROM menu_item m3, order_item oi1
          WHERE m3.restaurant_id = $1
            AND oi1.restaurant_id = m3.restaurant_id
            AND oi1.menuitem_name = m3.name))
      AS bad)`, [id])

      res.send(division.rows)
})

router.post("/:id/review", async (req, res) => {
  const restaurant_id = req.params.id
    // Verify user is signed in with a proper authentication token
    const token = req.headers['authorization']
    if (!token) return res.status(401).send({auth: false, message: 'No token provided'})
    try {
      const {id} = jwt.verify(token.split(" ")[1], process.env.SESSION_SECRET)
  
      const { title, stars, content} = req.body

      const review_id = (await db.query('INSERT INTO "restaurant_review"(restaurant_id, user_id, stars, title, content) VALUES ($1, $2, $3, $4, $5) RETURNING *', [restaurant_id, id, stars, title, content])).rows[0].review_id
  
      console.log(review_id)
      res.status(200).send({review_id})
    } catch (e) {
      console.log(e)
      return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' });
    }
  })