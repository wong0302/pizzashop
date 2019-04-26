const sanitizeBody = require('../middleware/sanitizeBody')
const Pizza = require('../models/Pizza')
const router = require('express').Router()
const ResourceNotFoundError = require('../exceptions/ResourceNotFound')

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

router.get('/:id', async (req, res, next) => {
  try {
    const pizza = await Pizza.findById(req.params.id).populate('ingredients')
    if (!pizza) throw new ResourceNotFoundError(`We could not find a pizza with id: ${req.params.id}`)
    res.send({data: pizza})
  } catch (err) {
    next(err)
  }
}) //Tested on 10/4 ~11:00 AM, Akel, working.

router.post('/', isStaff, sanitizeBody, async (req, res, next) => {
  new Pizza(req.sanitizedBody)
    .save()
    .then(newPizza => res.status(201).send({data: newPizza}))
    .catch (next)
}) //Tested on 21/4 with authorization. Akel.

const update = (overwrite = false) => async (req, res, next) => {
  try {
    const pizza = await Pizza.findByIdAndUpdate(
      req.params.id,
      req.sanitizedBody,
      {
        new: true,
        overwrite,
        runValidators: true
      }
    )
    if (!pizza) throw new ResourceNotFoundError(`We could not find a pizza with id: ${req.params.id}`)
    res.send({data: pizza})
  } catch (err) {
    next(err)
  }
} //Tested on 21/4 with authorization. Akel.

router.put('/:id', isStaff, sanitizeBody, update((overwrite = true)))
router.patch('/:id', isStaff, sanitizeBody, update((overwrite = false)))

router.delete('/:id', isStaff, async (req, res, next) => {
  try {
    const pizza = await Pizza.findByIdAndRemove(req.params.id)
    if (!pizza) throw new ResourceNotFoundError(`We could not find a pizza with id: ${req.params.id}`)
    res.send({data: pizza})
  } catch (err) {
    next(err)
  }
}) //Tested on 21/4 with authorization. Akel.

module.exports = router