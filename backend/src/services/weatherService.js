const axios = require('axios')
const cache = require('./cacheService')
const { computeComfortIndex } = require('./comfortService')
const citiesData = require('../../cities.json')

const OWM_BASE_URL = 'https://api.openweathermap.org/data/2.5/weather'

const RAW_PREFIX = 'raw_weather_'
const PROCESSED_PREFIX = 'processed_'
const ALL_CITIES_KEY = 'all_cities_ranked'

/**
 * Fetch raw weather data for a single city from OWM.
 * Result is cached under RAW_PREFIX + cityCode.
 *
 * @param {string} cityCode - OpenWeatherMap city ID
 * @returns {object} { data: rawWeatherObject, cacheStatus: "HIT"|"MISS" }
 */
async function fetchCityWeather(cityCode) {
  const cacheKey = RAW_PREFIX + cityCode
  const cached = cache.get(cacheKey)

  if (cached.status === 'HIT') {
    return { data: cached.value, cacheStatus: 'HIT' }
  }

  const apiKey = process.env.OPENWEATHER_API_KEY
  if (!apiKey) throw new Error('OPENWEATHER_API_KEY is not set in environment')

  const response = await axios.get(OWM_BASE_URL, {
    params: { id: cityCode, appid: apiKey },
    timeout: 8000,
  })

  const rawData = response.data
  cache.set(cacheKey, rawData) // store raw response with default TTL
  return { data: rawData, cacheStatus: 'MISS' }
}

/**
 * Fetch, process, and rank all cities from cities.json.
 * The full ranked list is itself cached under ALL_CITIES_KEY.
 *
 * @returns {object} { cities: rankedArray, overallCacheStatus }
 */
async function getAllCitiesRanked() {
  const listCache = cache.get(ALL_CITIES_KEY)
  if (listCache.status === 'HIT') {
    return { cities: listCache.value, overallCacheStatus: 'HIT' }
  }

  const cityList = citiesData.List
  const results = []

  for (const city of cityList) {
    const processedKey = PROCESSED_PREFIX + city.CityCode
    const processedCache = cache.get(processedKey)

    if (processedCache.status === 'HIT') {
      results.push(processedCache.value)
      continue
    }

    try {
      const { data: rawWeather, cacheStatus } = await fetchCityWeather(city.CityCode)
      const { score, breakdown } = computeComfortIndex(rawWeather)

      const processed = {
        cityCode: city.CityCode,
        cityName: rawWeather.name,
        country: rawWeather.sys.country,
        weather: {
          description: rawWeather.weather[0].description,
          icon: rawWeather.weather[0].icon,
          main: rawWeather.weather[0].main,
        },
        temperature: breakdown.temperatureCelsius,
        feelsLike: Math.round((rawWeather.main.feels_like - 273.15) * 10) / 10,
        humidity: breakdown.humidity,
        windSpeedKmh: breakdown.windSpeedKmh,
        cloudiness: breakdown.cloudiness,
        pressure: rawWeather.main.pressure,
        visibility: rawWeather.visibility || null,
        comfortScore: score,
        scoreBreakdown: breakdown.penalties,
        rawCacheStatus: cacheStatus,
        fetchedAt: new Date().toISOString(),
      }

      cache.set(processedKey, processed)
      results.push(processed)
    } catch (err) {
      results.push({
        cityCode: city.CityCode,
        cityName: city.CityName,
        error: err.message,
        comfortScore: null,
      })
    }
  }

  const ranked = results
    .filter((c) => c.comfortScore !== null)
    .sort((a, b) => b.comfortScore - a.comfortScore)
    .map((city, idx) => ({ ...city, rank: idx + 1 }))

  const errored = results.filter((c) => c.comfortScore === null)
  const finalList = [...ranked, ...errored]

  cache.set(ALL_CITIES_KEY, finalList)

  return { cities: finalList, overallCacheStatus: 'MISS' }
}

module.exports = { fetchCityWeather, getAllCitiesRanked }
