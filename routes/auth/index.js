const sanitizeBody = require('../../middleware/sanitizeBody')
const router = require('express').Router()

const User = require('../../models/User')
const authorize = require('../../middleware/auth')

//load the user document from the database and return it to the client
//Tested via postman @ 10/4 17:20, Akel, working.
router.get('/users/me', authorize, async (req, res) => {
  const user = await User.findById(req.user._id)
  res.send({data: user})
})

//Tested via postman @ 17/4 17:20, Akel, working.
router.patch('/users/me', authorize, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
    user.password = req.body.password
    await user.save()
    res.send({data: user})
  } catch (err) {
    next(err)
  }
})

router.post('/users', sanitizeBody, async (req, res) => {
  //New user, tested via postman @ 17:00, Akel, working.
  try {
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
  } catch (err) {
    res.status(500).send({
      errors: [{
        status: 'Internal Server Error',
        code: '500',
        title: 'Problem saving document to the database'
      }]
    })
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