const sanitizeBody = require('../middleware/sanitizeBody')
const Order = require('../models/Order')
const router = require('express').Router()

const authorize = require('../middleware/auth')
const isStaff = require ('../middleware/isStaff')

//TODO: Test routes
//TODO: Test sanitization

/*
* Authentication:
* GET: logged in user and staff
* POST: logged in user  and staff
* PUT/PATCH: logged in user and staff
* DELETE: logged in user and Staff only
*/

router.get('/', async (req, res) => {
  const orders = await Order.find().populate('users').populate('pizzas')
  res.send({data: orders})
}) //Tested on 17/4, Akel, working.

router.get('/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('users').populate('pizzas')
    if (!order) throw new Error('Resource not found')
    res.send({data: order})
  } catch (err) {
    sendResourceNotFound(req, res)
  }
}) //Not tested

router.post('/', sanitizeBody, async (req, res) => {
  const newOrder = new Order(req.sanitizedBody)
  try {
    await newOrder.save()
    res.status(201).send({data: newOrder})
  } catch (err) {
    res.status(500).send({
      errors: [{
        status: 'Server error',
        code: '500',
        title: 'Problem saving document to the database.'
      }]
    })
  }
}) //Tested on 17/4, Akel, working.

const update = (overwrite = false) => async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      req.sanitizedBody,
      {
        new: true,
        overwrite,
        runValidators: true
      }
    )
    if (!order) throw new Error('Resource not found')
    res.send({data: order})
  } catch (err) {
    sendResourceNotFound(req, res)
  }
} //Not tested

router.put('/:id', sanitizeBody, update((overwrite = true)))
router.patch('/:id', sanitizeBody, update((overwrite = false)))

router.delete('/:id', async (req, res) => {
  try {
    const order = await Order.findByIdAndRemove(req.params.id)
    if (!order) throw new Error('Resource not found')
    res.send({data: order})
  } catch (err) {
    sendResourceNotFound(req, res)
  }
}) //Not tested

function sendResourceNotFound(req, res) {
  res.status(404).send({
    errors: [{
      status: 'Not Found',
      code: '404',
      title: 'Resource does not exist',
      description: `We could not find an order with id: ${req.params.id}`
    }]
  })
} //Not tested

module.exports = router