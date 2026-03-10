import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:5000/api',
  timeout: 10000,
});

export async function getWeatherData(token) {
  const response = await apiClient.get('/weather', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
}

export default apiClient;

