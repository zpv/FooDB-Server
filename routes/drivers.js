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


router.get('/:id', async (req, res) => {
  const { id } = req.params
  const { rows } = await db.query('SELECT name, phone_num, lat, lon FROM driver WHERE driver_id = $1', [id])
  res.send(rows[0])
})

router.get('/:id/vehicles', async (req, res) => {
  const { id } = req.params
  const { rows } = await db.query('SELECT vin, license_plate, make, model, color, year FROM vehicle WHERE driver_id = $1', [id])
  res.send(rows[0])
})

router.get('/:id/since', async (req, res) => {
  const { id } = req.params
  const { rows } = await db.query('SELECT name, phone_num, license_plate, make, model, color, year, since' +
    ' FROM driver D, drives DR, vehicle V' +
    ' WHERE D.driver_id = DR.driver_id AND' +
    ' DR.driver_id = V.driver_id AND' +
    ' D.driver_id = $1', [id])
  res.send(rows[0])
})
