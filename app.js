require('dotenv').config()
const express = require('express')
const bodyParser = require('body-parser')
const mountRoutes = require('./routes')

const port = 8080

const app = express()
app.use(bodyParser.json());
mountRoutes(app)

app.listen(port, () => {console.log("FooDB Backend Started")})