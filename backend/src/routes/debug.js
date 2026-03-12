const express = require('express')
const router = express.Router()
const cache = require('../services/cacheService')

router.get('/cache', (req, res) => {
  const info = cache.getDebugInfo()
  res.json(info)
})

router.delete('/cache', (req, res) => {
  cache.flush()
  res.json({ message: 'Cache flushed successfully' })
})

module.exports = router
