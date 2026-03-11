const express = require('express')
const { getWeatherSummary } = require('../controllers/weatherController')
const { getCache } = require('../cache/cache')

const router = express.Router()

router.get('/weather', getWeatherSummary)

router.get('/cache-status', (req, res) => {
  const cached = getCache('comfort_results')
  const status = cached ? 'HIT' : 'MISS'
  res.json({ status })
})

module.exports = router
