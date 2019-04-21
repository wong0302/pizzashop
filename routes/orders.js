const sanitizeBody = require('../middleware/sanitizeBody')
const Order = require('../models/Order')
const router = require('express').Router()

const User = require('../models/User')

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

router.get('/', authorize, async (req, res) => {
  const user = await User.findById(req.user._id)
  const orders = await Order.find().populate('users').populate('pizzas')

  if (!user.isStaff) {
    const userOrders = await Order.getOrders(req.user._id, orders)
    res.send({data: userOrders})
  } else if (user.isStaff) {
    res.send({data: orders})
  }
}) //Tested on 20/4, with Authorization, working, Akel.

router.get('/:id', authorize, async (req, res) => {
  const user = await User.findById(req.user._id)
  try {
    const order = await Order.findOne({_id: req.params.id, customer: req.user._id}).populate('users').populate('pizzas')
    if (!order) throw new Error('Resource not found')
    res.send({data: order})
  } catch (err) {
    sendResourceNotFound(req, res)
  }
}) //Tested on 20/4, with Authorization, working, Akel.

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
    const order = await Order.findOneAndUpdate(
      {_id: req.params.id, customer: req.user._id},
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

router.put('/:id', authorize, sanitizeBody, update((overwrite = true)))
router.patch('/:id', authorize, sanitizeBody, update((overwrite = false)))

router.delete('/:id', authorize, async (req, res) => {
  try {
    const order = await Order.findOneAndRemove({_id: req.params.id, customer: req.user._id})
    if (!order) throw new Error('Resource not found')
    res.send({data: order})
  } catch (err) {
    sendResourceNotFound(req, res)
  }
}) //Tested on 20/4 with authorization, working, Akel.

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