const sanitizeBody = require('../middleware/sanitizeBody')
const Pizza = require('../models/Pizza')
const router = require('express').Router()

//const authorize = require('../middleware/auth')
const isStaff = require ('../middleware/isStaff')
//TODO: Test sanitization

/*
* Authentication:
* GET: ALL
* POST: Staff only
* PUT/PATCH: Staff only
* DELETE: Staff only
*/

router.get('/', async (req, res) => {
  const pizzas = await Pizza.find()
  res.send({data: pizzas})
}) //Tested on 10/4 ~11:00 AM, Akel, working.

router.get('/:id', async (req, res) => {
  try {
    const pizza = await Pizza.findById(req.params.id).populate('ingredients')
    if (!pizza) throw new Error('Resource not found')
    res.send({data: pizza})
  } catch (err) {
    sendResourceNotFound(req, res)
  }
}) //Tested on 10/4 ~11:00 AM, Akel, working.

router.post('/', isStaff, sanitizeBody, async (req, res) => {
  const newPizza = new Pizza(req.sanitizedBody)
  try {
    await newPizza.save()
    res.status(201).send({data: newPizza})
  } catch (err) {
    res.status(500).send({
      errors: [{
        status: 'Server error',
        code: '500',
        title: 'Problem saving document to the database'
      }]
    })
  }
}) //Tested on 21/4 with authorization. Akel.

const update = (overwrite = false) => async (req, res) => {
  try {
    const pizza = await Pizza.findOneAndUpdate(
      req.params.id,
      req.sanitizedBody,
      {
        new: true,
        overwrite,
        runValidators: true
      }
    )
    if (!pizza) throw new Error('Resource not found')
    res.send({data: pizza})
  } catch (err) {
    sendResourceNotFound(res, res)
  }
} //Tested on 21/4 with authorization. Akel.

router.put('/:id', isStaff, sanitizeBody, update((overwrite = true)))
router.patch('/:id', isStaff, sanitizeBody, update((overwrite = false)))

router.delete('/:id', isStaff, async (req, res) => {
  try {
    const pizza = await Pizza.findByIdAndRemove(req.params.id)
    if (!pizza) throw new Error('Resource not found')
    res.send({data: pizza})
  } catch (err) {
    sendResourceNotFound(req, res)
  }
}) //Tested on 21/4 with authorization. Akel.

function sendResourceNotFound(req, res) {
  res.status(404).send({
    errors: [{
      status: 'Not Found',
      code: '404',
      title: 'Resource does not exist',
      description: `We could not find a pizza with id: ${req.params.id}`
    }]
  })
} //Tested on 10/4 ~11:30 AM with GET request, Akel, working.

module.exports = router