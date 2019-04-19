const sanitizeBody = require('../middleware/sanitizeBody')
const Ingredient = require('../models/Ingredient')
const router = require('express').Router()

const authorize = require('../middleware/auth')
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
  const ingredients = await Ingredient.find()
  res.send({data: ingredients})
})  //Tested on 10/4 ~10:00 AM, Akel, working.

router.get('/:id', async (req, res) => {
  try {
    const ingredient = await Ingredient.findById(req.params.id)
    if (!ingredient) throw new Error('Resource not found')
    res.send({data: ingredient})
  } catch (err) {
    sendResourceNotFound(req, res)
  }
}) //Tested on 10/4 ~10:00 AM, Akel, working.

router.post('/', sanitizeBody, async (req, res) => {
  const newIngredient = new Ingredient(req.sanitizedBody)
  try {
    await newIngredient.save()
    res.status(201).send({data: newIngredient})
  } catch (err) {
    res.status(500).send({
      errors: [{
        status: 'Server error',
        code: '500',
        title: 'Problem saving document to the database.'
      }]
    })
  }
}) //Tested on 10/4 ~10:00 AM, Akel, working.

const update = (overwrite = false) => async (req, res) => {
  try {
    const ingredient = await Ingredient.findByIdAndUpdate(
      req.params.id,
      req.sanitizedBody,
      {
        new: true,
        overwrite,
        runValidators: true
      }
    )
    if (!ingredient) throw new Error('Resource not found')
    res.send({data: ingredient})
  } catch (err) {
    sendResourceNotFound(req, res)
  }
} //Tested on 10/4 ~10:00 AM, Akel, working.

router.put('/:id', sanitizeBody, update((overwrite = true)))
router.patch('/:id', sanitizeBody, update((overwrite = false)))

router.delete('/:id', async (req, res) => {
  try {
    const ingredient = await Ingredient.findByIdAndRemove(req.params.id)
    if (!ingredient) throw new Error('Resource not found')
    res.send({data: ingredient})
  } catch (err) {
    sendResourceNotFound(req, res)
  }
}) //Tested on 10/4 ~10:00 AM, Akel, working.

function sendResourceNotFound(req, res) {
  res.status(404).send({
    errors: [{
      status: 'Not Found',
      code: '404',
      title: 'Resource does not exist',
      description: `We could not find an ingredient with id: ${req.params.id}`
    }]
  })
} //Tested on 10/4 ~11:30 AM with GET request, Akel, working.

module.exports = router