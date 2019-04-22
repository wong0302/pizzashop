const sanitizeBody = require('../middleware/sanitizeBody')
const Ingredient = require('../models/Ingredient')
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
  const ingredients = await Ingredient.find()
  res.send({data: ingredients})
})  //Tested on 10/4 ~10:00 AM, Akel, working.

router.get('/:id', async (req, res, next) => {
  try {
    const ingredient = await Ingredient.findById(req.params.id)
    if (!ingredient) throw new ResourceNotFoundError(`We could not find an ingredient with id: ${req.params.id}`)
    res.send({data: ingredient})
  } catch (err) {
    next(err)
  }
}) //Tested on 10/4 ~10:00 AM, Akel, working.

router.post('/', isStaff, sanitizeBody, async (req, res, next) => {
  new Ingredient(req.sanitizedBody)
    .save()
    .then(newIngredient => res.status(201).send({data: newIngredient}))
    .catch (next)
}) //Tested on 21/4 with authorization, Akel.

const update = (overwrite = false) => async (req, res, next) => {
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
    if (!ingredient) throw new ResourceNotFoundError(`We could not find an ingredient with id: ${req.params.id}`)
    res.send({data: ingredient})
  } catch (err) {
    next(err)
  }
} //Tested on 21/4 with authorization, Akel.

router.put('/:id', isStaff, sanitizeBody, update((overwrite = true)))
router.patch('/:id', isStaff, sanitizeBody, update((overwrite = false)))

router.delete('/:id', isStaff, async (req, res, next) => {
  try {
    const ingredient = await Ingredient.findByIdAndRemove(req.params.id)
    if (!ingredient) throw new ResourceNotFoundError(`We could not find an ingredient with id: ${req.params.id}`)
    res.send({data: ingredient})
  } catch (err) {
    next(err)
  }
}) //Tested on 21/4 with authorization, Akel.

module.exports = router