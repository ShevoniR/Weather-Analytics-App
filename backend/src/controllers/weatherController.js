const { loadCities } = require('../utils/loadCities');
const { fetchWeatherForCities } = require('../services/weatherService');
const { calculateComfortIndex } = require('../utils/comfortIndex');
const { getCache, setCache } = require('../cache/cache');

async function getWeatherSummary(req, res) {
  try {
    const cachedResults = getCache('comfort_results');
    if (cachedResults) {
      return res.json(cachedResults);
    }

    const apiKey = process.env.OPENWEATHER_API_KEY;
    if (!apiKey) {
      return res
        .status(500)
        .json({ error: 'OPENWEATHER_API_KEY is not configured' });
    }

    const cityIds = loadCities();
    const weatherData = await fetchWeatherForCities(cityIds, apiKey);

    const ranked = weatherData
      .map((w) => {
        const comfortScore = calculateComfortIndex({
          temp: w.temp,
          humidity: w.humidity,
          windSpeed: w.wind?.speed,
          cloudiness: w.clouds?.all,
          pressure: w.pressure,
        });

        return {
          city: w.city,
          weather: w.weather?.description || null,
          temp: w.temp,
          humidity: w.humidity,
          windSpeed: w.wind?.speed ?? null,
          cloudiness: w.clouds?.all ?? null,
          pressure: w.pressure,
          visibility: w.visibility ?? null,
          comfortScore,
        };
      })
      .sort((a, b) => b.comfortScore - a.comfortScore)
      .map((item, index) => ({
        ...item,
        rank: index + 1,
      }));

    setCache('comfort_results', ranked);

    return res.json(ranked);
  } catch (err) {
    console.error('Error in getWeatherSummary:', err);
    return res.status(500).json({
      error: 'Failed to fetch weather data',
      details: err && err.message ? err.message : String(err),
    });
  }
}

module.exports = {
  getWeatherSummary,
};

