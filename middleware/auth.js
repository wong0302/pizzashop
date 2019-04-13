const jwt = require('jsonwebtoken')
const jwtPrivateKey = 'superSecureSecret'

const parseToken = header => {
  if (header) {
    const [type, token] = header.split(' ')
    return type == 'Bearer' && typeof token !== 'undefined' ? token : undefined
  }
}

module.exports = (req, res, next) => {
  const token = parseToken(req.header('Authorization'))
  //const token = req.header('bearer')
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
    next()
  } catch (err) {
    res.status(400).send({
      errors: [
        {
          status: 'Bad request',
          code: '400',
          title: 'Validation Error',
          description: 'Invalid bearer token'
        }
      ]
    })
  }
}