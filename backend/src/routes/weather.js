const express = require('express')
const router = express.Router()
const { requireAuth } = require('../middleware/auth')
const { getAllCitiesRanked, fetchCityWeather } = require('../services/weatherService')
const cache = require('../services/cacheService')

router.get('/', requireAuth, async (req, res) => {
  try {
    const { cities, overallCacheStatus } = await getAllCitiesRanked()
    res.json({
      cacheStatus: overallCacheStatus,
      count: cities.length,
      cities,
    })
  } catch (err) {
    console.error('Error in GET /api/weather:', err.message)
    res.status(500).json({ error: 'Failed to fetch weather data', detail: err.message })
  }
})

router.get('/:cityCode', requireAuth, async (req, res) => {
  const { cityCode } = req.params
  try {
    const { data, cacheStatus } = await fetchCityWeather(cityCode)
    res.json({ cacheStatus, data })
  } catch (err) {
    console.error(`Error fetching city ${cityCode}:`, err.message)
    res.status(500).json({ error: 'Failed to fetch city weather', detail: err.message })
  }
})

router.post('/refresh', requireAuth, async (req, res) => {
  cache.flush()
  try {
    const { cities } = await getAllCitiesRanked()
    res.json({ message: 'Cache cleared and data refreshed', count: cities.length, cities })
  } catch (err) {
    res.status(500).json({ error: 'Refresh failed', detail: err.message })
  }
})

module.exports = router
