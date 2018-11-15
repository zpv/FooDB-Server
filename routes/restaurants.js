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

// gets all reviews for that restaurant
router.get('/:id/review', async (req, res) => {
    const { id } = req.params.id
    const { rows } = await db.query('SELECT * FROM restaurant_review, restaurant WHERE restaurant_review.restaurant_id = rest.restaurant_id', [id]);
    res.send(rows)
})
// TODO: not sure about the actual query part...
// posts a review for that restaurant
<<<<<<< HEAD
// router.post('/:id/review', async (req, res) => {
//     const { id } = req.params.id
//     const { restaurant_id } = req.params.body.restaurant_id
//     const { user_id } = req.params.body.user_id
//     const { rows } = await db.query('INSERT INTO restaurant_review (restaurant_review.stars, restaurant_review.content) VALUES ($1, "thi', [id], [restaurant_id], [user_id]);
//     res.send(rows[0])
// })
router.post("/", async (req, res) => {
    // Verify user is signed in with a proper authentication token
    const token = req.headers['authorization']
    if (!token) return res.status(401).send({auth: false, message: 'No token provided'})
    try {
      const {id} = jwt.verify(token.split(" ")[1], process.env.SESSION_SECRET)
  
      const { restaurant_id, stars, content} = req.body
=======
router.post('/:id/review', async (req, res) => {
    const { id } = req.params.id
    const { restaurant_id, user_id } = req.body
    const { rows } = await db.query('INSERT INTO restaurant_review VALUES (restaurant_review.stars, restaurant_review.content)', [id], [restaurant_id], [user_id]);
    res.send(rows[0])
})

>>>>>>> 4d4dd1437eb6c29e2eb6355a2b0362f2e28fd08a

      const review_id = (await db.query('INSERT INTO "restaurant_review" (restaurant_id, user_id, restaurant_review.stars, restaurant_review.content) VALUES ($1, $2, $3, $4)', [restaurant_id, id, stars, content])).rows[0].review_id
  
      console.log(review_id)
      res.status(200).send({review_id})
      const { rows } = await db.query('SELECT name, email, phone_num FROM "user" WHERE user_id = $1', [id])
      res.send(rows[0])
    } catch (e) {
      console.log(e)
      return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' });
    }
  })
