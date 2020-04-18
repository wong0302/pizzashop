'use strict'

//const logger = require('./logger')
require('./startup/database')()
const cors = require('cors')

const compression = require('compression')
const helmet = require('helmet')
const express = require('express')
const app = express()


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

const port = process.env.PORT || 3031
app.listen(port, () => console.log(`Express is listening on port ${port} ...`))