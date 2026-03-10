import React, { useEffect, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { getWeatherData } from '../services/api';
import WeatherCard from '../components/WeatherCard';
import './Dashboard.css';

function Dashboard() {
  const {
    isAuthenticated,
    isLoading: authLoading,
    loginWithRedirect,
    getAccessTokenSilently,
  } = useAuth0();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isAuthenticated || authLoading) {
      return;
    }

    async function fetchData() {
      try {
        setLoading(true);
        setError(null);
        const token = await getAccessTokenSilently();
        const result = await getWeatherData(token);
        setData(result);
      } catch (err) {
        setError('Failed to load weather data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [isAuthenticated, authLoading, getAccessTokenSilently]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      loginWithRedirect();
    }
  }, [authLoading, isAuthenticated, loginWithRedirect]);

  if (authLoading || !isAuthenticated) {
    return <div>Redirecting to login...</div>;
  }

  if (loading) {
    return <div>Loading weather data...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="dashboard-root">
      <h1 className="dashboard-title">Weather Comfort Dashboard</h1>
      <div className="dashboard-grid">
        {data.map((item) => (
          <WeatherCard
            key={item.city}
            city={item.city}
            weather={item.weather}
            temp={item.temp}
            comfortScore={item.comfortScore}
            rank={item.rank}
          />
        ))}
      </div>
    </div>
  );
}

export default Dashboard;

