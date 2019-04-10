const sanitizeBody = require('../middleware/sanitizeBody')
const Ingredient = require('../models/Ingredient')
const router = require('express').Router()

router.get('/', async (req, res) => {
  const ingredients = await Ingredient.find()
  res.send({data: ingredients})
})

router.get('/:id', async (req, res) => {
  try {
    const ingredient = await Ingredient.findById(req.params.id)
    if (!ingredient) throw new Error('Resource not found')
    res.send({data: ingredient})
  } catch (err) {
    sendResourceNotFound(req, res)
  }
})

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
})

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
}

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
})

function sendResourceNotFound(req, res) {
  res.status(404).send({
    errors: [{
      status: 'Not Found',
      code: '404',
      title: 'Resource does not exist',
      description: `We could not find a student with id: ${req.params.id}`
    }]
  })
}

module.exports = router