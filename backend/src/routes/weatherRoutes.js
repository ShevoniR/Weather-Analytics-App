const express = require('express');
const { getWeatherSummary } = require('../controllers/weatherController');
const { getCache } = require('../cache/cache');

const router = express.Router();

// GET /api/weather
router.get('/weather', getWeatherSummary);

// GET /api/cache-status
router.get('/cache-status', (req, res) => {
  const cached = getCache('comfort_results');
  const status = cached ? 'HIT' : 'MISS';
  res.json({ status });
});

module.exports = router;

