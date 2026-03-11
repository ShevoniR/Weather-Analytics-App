const { getCache, setCache } = require('../cache/cache');

const OPEN_WEATHER_ENDPOINT =
  'https://api.openweathermap.org/data/2.5/weather';

function kelvinToCelsius(kelvin) {
  return kelvin - 273.15;
}

async function fetchWeatherForCity(cityId, apiKey) {
  const cacheKey = `weather_${cityId}`;
  const cached = getCache(cacheKey);
  if (cached) {
    return cached;
  }

  const url = `${OPEN_WEATHER_ENDPOINT}?id=${cityId}&appid=${apiKey}`;
  const res = await fetch(url);

  if (!res.ok) {
    throw new Error(
      `Failed to fetch weather for cityId=${cityId}: ${res.status} ${res.statusText}`
    );
  }

  const data = await res.json();

  const tempKelvin = data.main?.temp;
  const tempCelsius =
    typeof tempKelvin === 'number' ? kelvinToCelsius(tempKelvin) : null;

  const result = {
    city: data.name,
    weather: {
      description:
        Array.isArray(data.weather) && data.weather[0]
          ? data.weather[0].description
          : null,
    },
    temp: tempCelsius,
    humidity: data.main?.humidity ?? null,
    wind: {
      speed: data.wind?.speed ?? null,
    },
    clouds: {
      all: data.clouds?.all ?? null,
    },
    pressure: data.main?.pressure ?? null,
    visibility: data.visibility ?? null,
  };

  setCache(cacheKey, result);

  return result;
}

async function fetchWeatherForCities(cityIds, apiKey) {
  const results = await Promise.allSettled(
    cityIds.map((id) => fetchWeatherForCity(id, apiKey))
  );

  return results
    .filter((r) => r.status === 'fulfilled')
    .map((r) => r.value);
}

module.exports = {
  fetchWeatherForCity,
  fetchWeatherForCities,
};

