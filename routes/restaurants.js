const Router = require('express-promise-router')

const db = require('../db')

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
    const { rows } = await db.query('SELECT name, rating FROM restaurant WHERE restaurant_id = $1', [id])
    res.send(rows[0])
})


// for restaurant managers, gets all orders of the restaurant
router.get('/:id/orders', async (req, res) => {
    const { id } = req.params
    const { rows } = await db.query('SELECT * FROM "restaurant", "order" WHERE "restaurant".restaurant_id = "order".restaurant_id AND "order".restaurant_id = $1 AND prepared_datetime IS NULL', [id]);
    res.send(rows)
})

// gets all reviews for that restaurant
router.get('/:id/review', async (req, res) => {
    const { id } = req.params.id
    const { rows } = await db.query('SELECT * FROM restaurant_review, restaurant WHERE restaurant_review.restaurant_id = rest.restaurant_id', [id]);
    res.send(rows)
})
// TODO: not sure about the actual query part...
// posts a review for that restaurant
router.post('/:id/review', async (req, res) => {
    const { id } = req.params.id
    const { restaurant_id, user_id } = req.body
    const { rows } = await db.query('INSERT INTO restaurant_review VALUES (restaurant_review.stars, restaurant_review.content)', [id], [restaurant_id], [user_id]);
    res.send(rows[0])
})
