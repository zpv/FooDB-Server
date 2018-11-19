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

router.get('/', async (req, res) => {
  const token = req.headers['authorization']
  console.log("test")
  if (!token) return res.status(401).send({auth: false, message: 'No token provided'})
  
  try {
    const {id} = jwt.verify(token.split(" ")[1], process.env.SESSION_SECRET)

    // user_info is a View of user which hides passwords – prevent access of unnecessary information.
    const { rows } = await db.query('SELECT * FROM "user_info" WHERE user_id = $1', [id])
    res.send(rows[0])
  } catch (e) {
    console.log(e)
    return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' });
  }
})

router.post('/register', async (req, res) => {
  const { name, email, password, phone, address } = req.body 
  if (email && password && phone && address) {
    const hashedPassword = bcrypt.hashSync(password, 8)

    try {
      const { rows } = await db.query('INSERT INTO "user" (name, email, password, phone_num, address) VALUES($1, $2, $3, $4, $5) RETURNING *', [name, email, hashedPassword, phone, address])
      const userId = rows[0].user_id

      const token = jwt.sign({id: userId}, process.env.SESSION_SECRET, {
        expiresIn: 86400 // expires in 24 hours
      })

      res.status(200).send({auth: true, token: token, uid: userId})
    } catch (e) {
      console.log(e)
      if (e.routine == '_bt_check_unique')
        return res.status(409).send({auth: false, error: 'User with the same email already exists.'})
      res.status(500).send({auth: false, error: 'There was an error creating your account.'})
    }
  }
})

router.post('/delete', async (req, res) => {
  // const { name, email, password, phone, address } = req.body
  const token = req.headers['authorization']
    if (!token) return res.status(401).send({auth: false, message: 'No token provided'})
  try {
    const {id} = jwt.verify(token.split(" ")[1], process.env.SESSION_SECRET)

    const { rows } = await db.query('DELETE FROM "user" WHERE email = $1 AND password = $2 AND user_id = $3', [email, password, id])
    //const userId = rows[0].user_id
    
    res.status(200).send(rows[0])

  } catch (e) {
    console.log(e)
    // if (!rows[0]) {
    //   return res.status(404).send('No user found.')
    // }
    res.status(500).send({auth: false, error: 'There was an error deleting your account.'})
  }
})

// router.post('/update', async (req, res) => {
//   const { name, email, password, phone, address } = req.body
//   const hashedPassword = bcrypt.hashSync(password, 8)
//   try {
//     const { row } = await db.query('UPDATE user SET name = $1, email = $2, password = $3, phone_num = $4, address = $5',
//        [name, email, hashedPassword, phone, address])
//     const token = jwt.sign({id: userId}, process.env.SESSION_SECRET, {
//       expiresIn: 86400 
//       })// expires in 24 hours  
//     res.status(200).send({auth: true, token: token, uid: userId})
//   } catch(e) {
//     console.log(e)
//     res.status(500).send({auth: false, error: 'There was an error updating your account.'})

//   }
// })

router.get('/:id/rest-reviews', async (req, res) => {
  const { id } = req.params
  const rows = (await db.query('SELECT * FROM restaurant_review WHERE restaurant_review.user_id = $1', [id])).rows;
  res.send(rows)
})

router.post('/login', async (req, res) => {
  const { email, password } = req.body 
  if (email && password) {
    let { rows } = await db.query('SELECT user_id, email, password FROM "user" WHERE email = $1', [email])
 
    if (!rows[0]) {
      return res.status(404).send('No user found.')
    }

    if(bcrypt.compareSync(password, rows[0].password)) {
      const userId = rows[0].user_id
      let token = jwt.sign({id: rows[0].user_id}, process.env.SESSION_SECRET, {
        expiresIn: 86400 // expires in 24 hours
      })
      res.status(200).send({auth: true, token: token, uid: userId})
    } else {
      res.status(401).send({ auth: false, token: null })
    }
  }
})