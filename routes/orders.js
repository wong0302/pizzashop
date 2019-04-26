const sanitizeBody = require('../middleware/sanitizeBody')
const Order = require('../models/Order')
const router = require('express').Router()
const ResourceNotFoundError = require('../exceptions/ResourceNotFound')

const User = require('../models/User')
const authorize = require('../middleware/auth')
const isStaff = require ('../middleware/isStaff')


//TODO: Fix staff orders check
//TODO: Test routes
//TODO: Test sanitization

/*
* Authentication:
* GET: logged in user and staff
* POST: logged in user  and staff
* PUT/PATCH: logged in user and staff
* DELETE: logged in user and Staff
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

router.get('/:id', authorize, async (req, res, next) => {
  const user = await User.findById(req.user._id)
  
  try {
    let order = {}
    if (!user.isStaff) {
     order = await Order.findOne({_id: req.params.id, customer: req.user._id}).populate('users').populate('pizzas')
    } else {
       order = await Order.findById(req.params.id).populate('users').populate('pizzas')
    }
    if (!order) throw new ResourceNotFoundError(`We could not find an order with id: ${req.params.id}`)
    res.send({data: order})
  } catch (err) {
    next(err)
  }
}) //Tested on 20/4, with Authorization, working, Akel.

router.post('/', authorize, sanitizeBody, async (req, res, next) => {
  new Order(req.sanitizedBody)
    .save()
    .then(newOrder => res.status(201).send({data: newOrder}))
    .catch (next)
}) //Tested on 17/4, Akel, working.

const update = (overwrite = false) => async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)
    let order = {}
    if (!user.isStaff) {
      order = await Order.findOneAndUpdate({_id: req.params.id, customer: req.user._id},req.sanitizedBody,
        {
          new: true,
          overwrite,
          runValidators: true
        }
      )
     } else {
      order = await Order.findByIdAndUpdate(req.params.id,req.sanitizedBody,{new: true, overwrite,runValidators: true})
     }
    if (!order) throw new ResourceNotFoundError(`We could not find an order with id: ${req.params.id}`)
    res.send({data: order})
  } catch (err) {
    next(err)
  }
} //Not tested

router.put('/:id', authorize, sanitizeBody, update((overwrite = true)))
router.patch('/:id', authorize, sanitizeBody, update((overwrite = false)))

router.delete('/:id', authorize, async (req, res, next) => {
  const user = await User.findById(req.user._id)
  let order = {}
  try {
    if (!user.isStaff) {
      order = await Order.findOneAndRemove({_id: req.params.id, customer: req.user._id})
     } else {
        order = await Order.findOneAndRemove(req.params.id)
     }
    if (!order) throw new ResourceNotFoundError(`We could not find an order with id: ${req.params.id}`)
    res.send({data: order})
  } catch (err) {
    next(err)
  }
}) //Tested on 20/4 with authorization, working, Akel.

module.exports = router