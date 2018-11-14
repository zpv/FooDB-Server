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
    const { rows } = await db.query('SELECT name, rating, img_url FROM restaurant WHERE restaurant_id = $1', [id])
    res.send(rows[0])
})
// router.post('/review', async (req, res) => {
//     const { rows } = await db.query('INSERT INTO restaurant')
// })
router.get('/:id/review', async (req, res) => {
    const { id } = req.params
    const { rows } = await db.query('SELECT * FROM restaurant_review, restaurant WHERE restaurant_review.restaurant_id = restaurant.restaurant_id', [id]);
    res.send(rows)
})


