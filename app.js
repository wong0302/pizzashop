'use strict'

const express = require('express')
const cors = require('cors')

require('./startup/database')()

const app = express()

app.use(cors())
app.use(express.json())
app.use(require('express-mongo-sanitize')())

app.use('/auth', require('./routes/auth'))
app.use('/api/orders', require('./routes/orders'))
app.use('/api/pizzas', require('./routes/pizzas'))
app.use('/api/ingredients', require('./routes/ingredients'))

const port = process.env.PORT || 3030
app.listen(port)