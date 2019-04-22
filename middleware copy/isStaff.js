const jwt = require('jsonwebtoken')
const jwtPrivateKey = 'superSecureSecret'
const User = require('../models/User')

const parseToken = header => {
    if (header) {
      const [type, token] = header.split(' ')
      return type == 'Bearer' && typeof token !== 'undefined' ? token : undefined
    }
  }

module.exports = async (req, res, next) => {
  const token = parseToken(req.header('Authorization'))

  if (!token) {
    return res.status(401).send({
      errors: [
        {
          status: 'Unauthorized',
          code: '401',
          title: 'Authentication failed',
          description: 'Missing bearer token'
        }
      ]
    })
  }
    
  try {
    const payload = jwt.verify(token, jwtPrivateKey)
    req.user = payload
    const user = await User.findById(req.user._id)
    if(user.isStaff) {
        next()
    } else {
        throw new Error('Not authorized')
    }
  } catch (err) {
    res.status(401).send({
      errors: [
        {
            status: 'Unauthorized',
            code: '401',
            title: 'Authentication failed',
            description: 'Not admin user'
        }
      ]
    })
  }
}