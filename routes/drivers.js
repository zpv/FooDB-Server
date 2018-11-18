const Router = require('express-promise-router')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

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

router.post('/register', async (req, res) => {
  const { name, email, password, phone } = req.body
  if (email && password && phone) {
    const hashedPassword = bcrypt.hashSync(password, 8)

    try {
      console.log("faffawf")
      const { rows } = await db.query('INSERT INTO "driver" (name, email, password, phone_num) VALUES($1, $2, $3, $4) RETURNING *', [name, email, hashedPassword, phone])
      const driverId = rows[0].driver_id
      console.log(driverId)

      const token = jwt.sign({id: driverId}, process.env.SESSION_SECRET, {
        expiresIn: 86400 // expires in 24 hours
      })
      res.status(200).send({auth: true, token: token, did: driverId})
    } catch (e) {
      console.log(e)
      if (e.routine == '_bt_check_unique')
        return res.status(409).send({auth: false, error: 'Driver with the same email already exists.'})
      res.status(500).send({auth: false, error: 'There was an error creating your account.'})
    }
  }
})

router.post('/login', async (req, res) => {
  const { email, password } = req.body
  if (email && password) {
    let { rows } = await db.query('SELECT driver_id, email, password FROM "driver" WHERE email = $1', [email])

    if (!rows[0]) {
      return res.status(404).send('No user found.')
    }

    if(bcrypt.compareSync(password, rows[0].password)) {
      const driverId = rows[0].driver_id
      let token = jwt.sign({id: rows[0].driver_id}, process.env.SESSION_SECRET, {
        expiresIn: 86400 // expires in 24 hours
      })
      res.status(200).send({auth: true, token: token, did: driverId})
    } else {
      res.status(401).send({ auth: false, token: null })
    }
  }
})

//
router.post('/update/phone', async (req, res) => {
  const token = req.headers['authorization']
  const phone = req.body
  if (!token) return res.status(401).send({auth: false, message: 'No token provided'})
  if (phone) {
    try {
      const { id } = jwt.verify(token.split(" ")[1], process.env.SESSION_SECRET) // get driver id
      const { rows } = await db.query('UPDATE driver SET phone_num = $1 WHERE driver_id = $2', [phone, id])
      res.send(rows[0])
    } catch (e) {
      console.log(e)
      res.status(500).send({auth: false, error: 'Failed to authenticate token.'})
    }
  }
})

// Endpoint for getting deliverer info
router.get('/:id', async (req, res) => {
  const { id } = req.params
  const { rows } = await db.query('SELECT name, phone_num, lat, lon FROM driver WHERE driver_id = $1', [id])
  res.send(rows[0])
})

router.get('/:id/reviews', async (req, res) => {
  const { id } = req.params
  const { rows } = await db.query('SELECT * FROM driver_review WHERE driver_id = $1', [id]);
  res.send(rows)
})

router.get('/:id/stars', async (req, res) => {
  const { id } = req.params
  const { rows } = await db.query('SELECT avg(stars) FROM driver_review WHERE driver_id = $1', [id]);
  res.send(rows)
})
router.get('/:id/orders', async (req, res) => {
  const { id } = req.params
  const { rows } = await db.query('SELECT "restaurant".address as r_address, * FROM "restaurant", "order" WHERE "restaurant".restaurant_id = "order".restaurant_id AND driver_id = $1 AND delivered_datetime IS NULL', [id]);
  res.send(rows)
})

router.delete("/delete", async (req, res) => {
  // Verify user is signed in with a proper authentication token
  const token = req.headers['authorization']
  if (!token) return res.status(401).send({auth: false, message: 'No token provided'})
  try {
    const {id} = jwt.verify(token.split(" ")[1], process.env.SESSION_SECRET)

    const { rows } = await db.query('DELETE FROM driver WHERE driver_id = $1', [id])

    console.log(rows)
    res.status(200).send(rows[0])
  } catch (e) {
    console.log(e)
    return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' });
  }
})

router.post("/", async (req, res) => {
  // Verify user is signed in with a proper authentication token
  const token = req.headers['authorization']
  if (!token) return res.status(401).send({auth: false, message: 'No token provided'})
  try {
    const {id} = jwt.verify(token.split(" ")[1], process.env.SESSION_SECRET)

    const { driver_id, stars} = req.body

    const review_id = (await db.query('INSERT INTO "restaurant_review" (driver_id, user_id, stars) VALUES ($1, $2, $3)', [driver_id, id, stars])).rows[0].review_id

    console.log(review_id)
    res.status(200).send({review_id})
    const { rows } = await db.query('SELECT name, email, phone_num FROM "user" WHERE user_id = $1', [id])
    res.send(rows[0])
  } catch (e) {
    console.log(e)
    return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' });
  }
})

router.get('/:id/vehicles', async (req, res) => {
  const { id } = req.params
  const { rows } = await db.query('SELECT name, phone_num, license_plate, make, model, color, year, since' +
    ' FROM driver D, drives DR, vehicle V' +
    ' WHERE D.driver_id = DR.driver_id AND' +
    ' DR.driver_id = V.driver_id AND' +
    ' D.driver_id = $1', [id])
  res.send(rows[0])
})


