require('dotenv').config()
const express = require('express')
const bodyParser = require('body-parser')
const mountRoutes = require('./routes')
const cors = require('cors')
const dev = process.env.NODE_ENV !== 'production'

const port = 8080

const app = express()
app.use(bodyParser.json())
if (dev) {
    app.use(cors())
}
mountRoutes(app)

app.listen(port, () => {console.log("FooDB Backend Started")})