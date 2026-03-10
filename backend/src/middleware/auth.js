const { expressjwt } = require('express-jwt');
const jwksRsa = require('jwks-rsa');

const domain = process.env.AUTH0_DOMAIN;
const audience = process.env.AUTH0_AUDIENCE;

if (!domain || !audience) {
  // eslint-disable-next-line no-console
  console.warn(
    'AUTH0_DOMAIN or AUTH0_AUDIENCE is not set. JWT verification middleware will fail until configured.'
  );
}

const checkJwt = expressjwt({
  secret: jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: `https://${domain}/.well-known/jwks.json`,
  }),
  audience,
  issuer: `https://${domain}/`,
  algorithms: ['RS256'],
});

module.exports = {
  checkJwt,
};
