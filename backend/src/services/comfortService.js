function clamp(val, min, max) {
  return Math.min(Math.max(val, min), max)
}

function temperaturePenalty(tempCelsius) {
  const IDEAL_LOW = 18
  const IDEAL_HIGH = 24
  const ABS_LOW = 0
  const ABS_HIGH = 38

  if (tempCelsius >= IDEAL_LOW && tempCelsius <= IDEAL_HIGH) {
    return 0
  }
  if (tempCelsius < IDEAL_LOW) {
    return clamp((IDEAL_LOW - tempCelsius) / (IDEAL_LOW - ABS_LOW), 0, 1)
  }
  return clamp((tempCelsius - IDEAL_HIGH) / (ABS_HIGH - IDEAL_HIGH), 0, 1)
}

function humidityPenalty(humidity) {
  const IDEAL_LOW = 40
  const IDEAL_HIGH = 60

  if (humidity >= IDEAL_LOW && humidity <= IDEAL_HIGH) {
    return 0
  }
  if (humidity < IDEAL_LOW) {
    return clamp((IDEAL_LOW - humidity) / IDEAL_LOW, 0, 1)
  }
  return clamp((humidity - IDEAL_HIGH) / (100 - IDEAL_HIGH), 0, 1)
}

function windPenalty(windSpeedMps) {
  const speedKmh = windSpeedMps * 3.6
  const IDEAL_MAX = 15
  const ABS_MAX = 60

  if (speedKmh <= IDEAL_MAX) return 0
  return clamp((speedKmh - IDEAL_MAX) / (ABS_MAX - IDEAL_MAX), 0, 1)
}

function cloudinessPenalty(cloudsPercent, weatherId) {
  const baseCloudPenalty = cloudsPercent / 200

  if (weatherId >= 200 && weatherId < 700) {
    return 1.0
  }
  if (weatherId >= 700 && weatherId < 800) {
    return 0.7
  }
  return baseCloudPenalty
}

/**
 * Main export: compute Comfort Index Score for a city.
 *
 * @param {object} weatherData - Raw OpenWeatherMap API response
 * @returns {object} { score, breakdown }
 */
function computeComfortIndex(weatherData) {
  const tempKelvin = weatherData.main.temp
  const tempCelsius = tempKelvin - 273.15
  const humidity = weatherData.main.humidity // %
  const windSpeed = weatherData.wind?.speed || 0 // m/s
  const cloudiness = weatherData.clouds?.all || 0 // %
  const weatherId = weatherData.weather?.[0]?.id || 800

  const tPenalty = temperaturePenalty(tempCelsius)
  const hPenalty = humidityPenalty(humidity)
  const wPenalty = windPenalty(windSpeed)
  const cPenalty = cloudinessPenalty(cloudiness, weatherId)

  const WEIGHTS = { temperature: 40, humidity: 25, wind: 20, cloudiness: 15 }

  const totalPenalty =
    tPenalty * WEIGHTS.temperature +
    hPenalty * WEIGHTS.humidity +
    wPenalty * WEIGHTS.wind +
    cPenalty * WEIGHTS.cloudiness

  const score = Math.round(clamp(100 - totalPenalty, 0, 100))

  return {
    score,
    breakdown: {
      temperatureCelsius: Math.round(tempCelsius * 10) / 10,
      humidity,
      windSpeedKmh: Math.round(windSpeed * 3.6 * 10) / 10,
      cloudiness,
      penalties: {
        temperature: Math.round(tPenalty * WEIGHTS.temperature * 10) / 10,
        humidity: Math.round(hPenalty * WEIGHTS.humidity * 10) / 10,
        wind: Math.round(wPenalty * WEIGHTS.wind * 10) / 10,
        cloudiness: Math.round(cPenalty * WEIGHTS.cloudiness * 10) / 10,
      },
    },
  }
}

module.exports = { computeComfortIndex }
