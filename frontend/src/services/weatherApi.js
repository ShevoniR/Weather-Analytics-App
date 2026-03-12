import axios from 'axios'

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000'

function apiClient(accessToken) {
  return axios.create({
    baseURL: BASE_URL,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  })
}

export async function fetchWeatherData(accessToken) {
  const client = apiClient(accessToken)
  const response = await client.get('/api/weather')
  return response.data
}

export async function fetchCacheDebug() {
  const response = await axios.get(`${BASE_URL}/api/debug/cache`)
  return response.data
}

export async function refreshWeatherData(accessToken) {
  const client = apiClient(accessToken)
  const response = await client.post('/api/weather/refresh')
  return response.data
}
