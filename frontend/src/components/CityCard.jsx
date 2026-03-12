import React from 'react'

function getComfortLabel(score) {
  if (score >= 80) return { label: 'Excellent', color: '#276749' }
  if (score >= 60) return { label: 'Good', color: '#2f855a' }
  if (score >= 40) return { label: 'Fair', color: '#c05621' }
  if (score >= 20) return { label: 'Poor', color: '#c53030' }
  return { label: 'Harsh', color: '#742a2a' }
}

export default function CityCard({ city }) {
  const { label, color } = getComfortLabel(city.comfortScore)
  const iconUrl = city.weather?.icon ? `https://openweathermap.org/img/wn/${city.weather.icon}@2x.png` : null

  return (
    <div style={styles.card}>
      {/* Rank badge */}
      <div style={styles.rankBadge}>#{city.rank}</div>

      {/* City name and country */}
      <div style={styles.header}>
        {iconUrl && <img src={iconUrl} alt={city.weather.description} style={styles.icon} />}
        <div>
          <h2 style={styles.cityName}>{city.cityName}</h2>
          <span style={styles.country}>{city.country}</span>
        </div>
      </div>

      {/* Weather description */}
      <p style={styles.description}>
        {city.weather?.description
          ? city.weather.description.charAt(0).toUpperCase() + city.weather.description.slice(1)
          : 'N/A'}
      </p>

      {/* Core stats grid */}
      <div style={styles.statsGrid}>
        <Stat label="Temperature" value={`${city.temperature}°C`} />
        <Stat label="Feels Like" value={`${city.feelsLike}°C`} />
        <Stat label="Humidity" value={`${city.humidity}%`} />
        <Stat label="Wind" value={`${city.windSpeedKmh} km/h`} />
        <Stat label="Clouds" value={`${city.cloudiness}%`} />
        <Stat label="Pressure" value={`${city.pressure} hPa`} />
      </div>

      {/* Comfort Score */}
      <div style={styles.scoreSection}>
        <span style={styles.scoreLabel}>Comfort Score</span>
        <div style={styles.scoreRow}>
          <span style={{ ...styles.scoreBadge, backgroundColor: color }}>{city.comfortScore} / 100</span>
          <span style={{ ...styles.comfortLabel, color }}>{label}</span>
        </div>
        {/* Score bar */}
        <div style={styles.barTrack}>
          <div
            style={{
              ...styles.barFill,
              width: `${city.comfortScore}%`,
              backgroundColor: color,
            }}
          />
        </div>
      </div>

      {/* Cache status indicator */}
      <div style={styles.cacheTag}>
        <span
          style={{
            ...styles.cacheStatus,
            backgroundColor: city.rawCacheStatus === 'HIT' ? '#c6f6d5' : '#bee3f8',
            color: city.rawCacheStatus === 'HIT' ? '#276749' : '#2c5282',
          }}
        >
          Cache: {city.rawCacheStatus || 'N/A'}
        </span>
      </div>
    </div>
  )
}

function Stat({ label, value }) {
  return (
    <div style={styles.stat}>
      <span style={styles.statLabel}>{label}</span>
      <span style={styles.statValue}>{value}</span>
    </div>
  )
}

const styles = {
  card: {
    backgroundColor: '#fff',
    borderRadius: '12px',
    padding: '1.25rem',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    position: 'relative',
    border: '1px solid #e2e8f0',
  },
  rankBadge: {
    position: 'absolute',
    top: '0.75rem',
    right: '0.75rem',
    backgroundColor: '#ebf4ff',
    color: '#2b6cb0',
    fontWeight: '700',
    fontSize: '0.875rem',
    padding: '0.2rem 0.5rem',
    borderRadius: '999px',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    marginBottom: '0.25rem',
  },
  icon: { width: '48px', height: '48px' },
  cityName: {
    margin: 0,
    fontSize: '1.2rem',
    fontWeight: '700',
    color: '#1a202c',
  },
  country: { fontSize: '0.8rem', color: '#718096' },
  description: {
    margin: '0.25rem 0 0.75rem',
    fontSize: '0.875rem',
    color: '#4a5568',
    textTransform: 'capitalize',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '0.4rem',
    marginBottom: '1rem',
  },
  stat: {
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#f7fafc',
    borderRadius: '6px',
    padding: '0.4rem 0.6rem',
  },
  statLabel: { fontSize: '0.7rem', color: '#718096', textTransform: 'uppercase' },
  statValue: { fontSize: '0.9rem', fontWeight: '600', color: '#2d3748' },
  scoreSection: { marginBottom: '0.75rem' },
  scoreLabel: { fontSize: '0.75rem', color: '#718096', textTransform: 'uppercase' },
  scoreRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    margin: '0.3rem 0',
  },
  scoreBadge: {
    color: '#fff',
    fontWeight: '700',
    fontSize: '1rem',
    padding: '0.2rem 0.6rem',
    borderRadius: '6px',
  },
  comfortLabel: { fontWeight: '600', fontSize: '0.875rem' },
  barTrack: {
    width: '100%',
    height: '6px',
    backgroundColor: '#e2e8f0',
    borderRadius: '999px',
    overflow: 'hidden',
  },
  barFill: { height: '100%', borderRadius: '999px', transition: 'width 0.4s ease' },
  cacheTag: { marginTop: '0.5rem' },
  cacheStatus: {
    fontSize: '0.7rem',
    padding: '0.15rem 0.5rem',
    borderRadius: '999px',
    fontWeight: '600',
  },
}
