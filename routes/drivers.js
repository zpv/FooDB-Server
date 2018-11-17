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

// Get assigned orders for driver
router.get('/:id/orders', async (req, res) => {
  const { id } = req.params
  const { rows } = await db.query('SELECT "restaurant".address as r_address, * FROM "restaurant", "order" WHERE "restaurant".restaurant_id = "order".restaurant_id AND driver_id = $1 AND delivered_datetime IS NULL', [id]);
  res.send(rows)
})

// register TODO: not right
router.post('/register', async (req, res) => {
  const { name, email, password, phone } = req.body
  if (email && password && phone) {
    const hashedPassword = bcrypt.hashSync(password, 8)

    try {
      const { rows } = await db.query('INSERT INTO "driver" (name, email, password, phone_num) VALUES($1, $2, $3, $4) RETURNING *', [name, email, hashedPassword, phone])
      const driverId = rows[0].driver_id

      const token = jwt.sign({id: driverId}, process.env.SESSION_SECRET, {
        expiresIn: 86400 // expires in 24 hours
      })

      res.status(200).send({auth: true, token: token})
    } catch (e) {
      console.log(e)
      if (e.routine == '_bt_check_unique')
        return res.status(409).send({auth: false, error: 'Driver with the same email already exists.'})
      res.status(500).send({auth: false, error: 'There was an error creating your account.'})
    }
  }
})

//
router.post('/:id/update/phone', async (req, res) => {
  const { id } = req.params
  const { email } = req.body
  if (email) {
    try {
      const { rows } = await db.query('UPDATE driver SET phone_num = $1 WHERE driver_id = $2', [email, id])
      res.send(rows[0])
    } catch (e) {
      res.status(500).send({auth: false, error: 'There was an error updating your phone number.'})
    }
  }

})

// Endpoint for getting deliverer info
router.get('/:id', async (req, res) => {
  const { id } = req.params
  const { rows } = await db.query('SELECT name, phone_num, lat, lon FROM driver WHERE driver_id = $1', [id])
  res.send(rows[0])
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


