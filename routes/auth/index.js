const sanitizeBody = require('../../middleware/sanitizeBody')
const router = require('express').Router()
const debug = require('debug')('pizzashop:db')

const User = require('../../models/User')

const authorize = require('../../middleware/auth')
const isStaff = require ('../../middleware/isStaff')

const ResourceNotFoundError = require('../../exceptions/ResourceNotFound')


router.get('/users/', isStaff, async (req, res) => {
  const users = await User.find()
  res.send({data: users})
})

//load the user document from the database and return it to the client
//Tested via postman @ 10/4 17:20, Akel, working.
router.get('/users/me', authorize, async (req, res) => {
  const user = await User.findById(req.user._id)
  res.send({data: user})
})

//Tested via postman @ 17/4 17:20, Akel, working.
/*** Change password ***/
router.patch('/users/me', authorize, async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)
    user.password = req.body.password
    await user.save()
    res.send({data: user})
  } catch (err) {
    next(err)
  }
})

//New user, tested via postman @ 17:00, Akel, working.
router.post('/users', sanitizeBody, async (req, res, next) => {
  try {
    //Send error if isStaff field is set
    if(req.body.isStaff != null) {
      return res.status(500).send({
        errors: [
          {
            status: 'Internal Server Error',
            code: '500',
            title: 'Problem saving document to the database.'
          }
        ]
      })
    }

    let newUser = new User(req.sanitizedBody)
    //Check if email already exists
    //email exists, tested via postman @ 10/4 17:00, Akel, working.
    const emailExists = !!(await User.countDocuments({email: newUser.email}))
    if (emailExists) { 
      return res.status(404).send({
        errors: [
          {
            status: 'Bad Request',
            code: '400',
            title: 'Validation Error',
            detail: `Email address '${newUser.email}' is already registered`,
            source: {pointer: '/data/attributes/email'}
          }
        ]
      })
    }

    await newUser.save()
    res.status(201).send({data: newUser})
  }
  catch (err) {
    next(err)
  }
})

router.patch('/users/:id', isStaff, sanitizeBody, async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      req.sanitizedBody,
      {
        new: true,
        overwrite: false,
        runValidators: true
      }
    )
    if (!user) throw new ResourceNotFoundError(`We could not find a user with id: ${req.params.id}`)
    res.send({data: user})
  } catch (err) {
    next(err)
  }
})

router.post('/tokens', sanitizeBody, async (req, res) => {
  const {email, password} = req.sanitizedBody
  const user = await User.authenticate(email, password)

  //Invalid user, tested via postman @ 10/4 17:00, Akel, working.
  if (!user) {
    return res.status(401).send({ 
      errors: [
        {
          status: 'Unauthorized',
          code: '401',
          title: 'Incorrect username or password.'
        }
      ]
    })
  }
  //generate token, tested via postman @ 10/4 17:15, Akel, working.
  res.status(201).send({data: {token: user.generateAuthToken()}})
})

module.exports = router