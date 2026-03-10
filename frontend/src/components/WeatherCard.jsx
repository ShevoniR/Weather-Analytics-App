import React from 'react';

function getWeatherEmoji(weather) {
  if (!weather) return '🌥️';
  const w = weather.toLowerCase();
  if (w.includes('sun') || w.includes('clear')) return '☀️';
  if (w.includes('cloud')) return '☁️';
  if (w.includes('rain') || w.includes('drizzle')) return '🌧️';
  if (w.includes('storm') || w.includes('thunder')) return '⛈️';
  if (w.includes('snow')) return '❄️';
  return '🌥️';
}

const cardStyle = {
  borderRadius: '12px',
  padding: '1rem 1.25rem',
  background: '#ffffff',
  boxShadow: '0 4px 10px rgba(0,0,0,0.06)',
  display: 'flex',
  flexDirection: 'column',
  gap: '0.4rem',
  minWidth: '220px',
};

const headerStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
};

const cityStyle = {
  fontSize: '1.1rem',
  fontWeight: 600,
};

const rankBadgeStyle = {
  background: '#2563eb',
  color: '#fff',
  borderRadius: '999px',
  padding: '0.15rem 0.6rem',
  fontSize: '0.75rem',
  fontWeight: 500,
};

const metaRowStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginTop: '0.4rem',
};

const tempStyle = {
  fontSize: '1.4rem',
  fontWeight: 600,
};

const comfortStyle = {
  fontSize: '0.9rem',
  fontWeight: 500,
  color: '#16a34a',
};

function WeatherCard({ city, weather, temp, comfortScore, rank }) {
  const icon = getWeatherEmoji(weather);

  return (
    <div style={cardStyle}>
      <div style={headerStyle}>
        <span style={cityStyle}>{city}</span>
        <span style={rankBadgeStyle}>Rank #{rank}</span>
      </div>

      <div style={metaRowStyle}>
        <span style={{ fontSize: '2rem' }}>{icon}</span>
        <div style={{ textAlign: 'right' }}>
          <div style={tempStyle}>
            {temp != null ? `${temp.toFixed(1)}°C` : '-'}
          </div>
          <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
            {weather || 'Unknown'}
          </div>
        </div>
      </div>

      <div style={{ marginTop: '0.4rem' }}>
        <span style={comfortStyle}>Comfort score: {comfortScore}</span>
      </div>
    </div>
  );
}

export default WeatherCard;

