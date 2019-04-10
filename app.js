'use strict'

const express = require('express')

require('./startup/database')()

const app = express()
app.use(express.json())
app.use(require('express-mongo-sanitize')())

app.use('/auth', require('./routes/auth'))
//TODO: add orders route
app.use('/api/pizzas', require('./routes/pizzas'))
app.use('/api/ingredients', require('./routes/ingredients'))

const port = process.env.PORT || 3030
app.listen(port)