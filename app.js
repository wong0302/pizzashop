'use strict'

require('./startup/database')()
const express = require('express')
const app = express()
const cors = require('cors')
const compression = require('compression')
const helmet = require('helmet')

// Apply global middleware with app.use()
app.use(compression())
app.use(helmet())
app.use(cors())
app.use(express.json())
app.use(require('express-mongo-sanitize')())

app.use('/auth', require('./routes/auth'))
app.use('/api/orders', require('./routes/orders'))
app.use('/api/pizzas', require('./routes/pizzas'))
app.use('/api/ingredients', require('./routes/ingredients'))

app.use(require('./middleware/logErrors'))
app.use(require('./middleware/errorHandler'))

// Add the health check route
app.get('/', (req, res) => res.send({data: {healthStatus: 'UP'}}))

// Link the auth and api route handler modules

// Apply the global error handler middleware

// Export the `app` object
module.exports = app