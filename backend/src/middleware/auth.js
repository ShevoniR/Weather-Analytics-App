const { auth } = require('express-oauth2-jwt-bearer')

const requireAuth = auth({
  issuerBaseURL: `https://${process.env.AUTH0_DOMAIN}/`,
  audience: process.env.AUTH0_AUDIENCE,
  tokenSigningAlg: 'RS256',
})

module.exports = { requireAuth }
