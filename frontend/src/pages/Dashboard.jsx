import React, { useState, useEffect, useCallback } from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import CityCard from '../components/CityCard'
import { fetchWeatherData, fetchCacheDebug, refreshWeatherData } from '../services/weatherApi'

export default function Dashboard() {
  const { user, logout, getAccessTokenSilently } = useAuth0()

  const [cities, setCities] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [cacheStatus, setCacheStatus] = useState(null)
  const [cacheDebug, setCacheDebug] = useState(null)
  const [showDebug, setShowDebug] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const token = await getAccessTokenSilently({
        authorizationParams: { audience: import.meta.env.VITE_AUTH0_AUDIENCE },
      })
      const data = await fetchWeatherData(token)
      setCities(data.cities)
      setCacheStatus(data.cacheStatus)
    } catch (err) {
      console.error('Dashboard load error:', err)
      setError(err.response?.data?.error || err.message || 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }, [getAccessTokenSilently])

  useEffect(() => {
    loadData()
  }, [loadData])

  const loadCacheDebug = async () => {
    try {
      const info = await fetchCacheDebug()
      setCacheDebug(info)
      setShowDebug(true)
    } catch (err) {
      console.error('Cache debug error:', err)
    }
  }

  const handleRefresh = async () => {
    try {
      setRefreshing(true)
      const token = await getAccessTokenSilently({
        authorizationParams: { audience: import.meta.env.VITE_AUTH0_AUDIENCE },
      })
      await refreshWeatherData(token)
      await loadData()
    } catch (err) {
      setError(err.message)
    } finally {
      setRefreshing(false)
    }
  }

  return (
    <div style={styles.page}>
      {/* Header */}
      <header style={styles.header}>
        <div>
          <h1 style={styles.title}>🌤 Weather Analytics</h1>
          <p style={styles.subtitle}>Comfort Index Rankings</p>
        </div>
        <div style={styles.userArea}>
          <span style={styles.userEmail}>{user?.email}</span>
          <button
            style={styles.logoutBtn}
            onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
          >
            Log Out
          </button>
        </div>
      </header>

      {/* Controls bar */}
      <div style={styles.controls}>
        {cacheStatus && (
          <span
            style={{
              ...styles.cacheBadge,
              backgroundColor: cacheStatus === 'HIT' ? '#c6f6d5' : '#bee3f8',
              color: cacheStatus === 'HIT' ? '#276749' : '#2c5282',
            }}
          >
            List Cache: {cacheStatus}
          </span>
        )}
        <button style={styles.btnSecondary} onClick={loadCacheDebug}>
          Cache Debug
        </button>
        <button style={styles.btnPrimary} onClick={handleRefresh} disabled={refreshing}>
          {refreshing ? 'Refreshing…' : 'Refresh Data'}
        </button>
      </div>

      {/* Cache debug panel */}
      {showDebug && cacheDebug && (
        <div style={styles.debugPanel}>
          <div style={styles.debugHeader}>
            <strong>Cache Debug</strong>
            <button style={styles.closeBtn} onClick={() => setShowDebug(false)}>
              ✕
            </button>
          </div>
          <div style={styles.debugGrid}>
            <DebugStat label="Total Keys" value={cacheDebug.totalKeys} />
            <DebugStat label="TTL (s)" value={cacheDebug.configuredTTL} />
            <DebugStat label="Hits" value={cacheDebug.stats.hits} />
            <DebugStat label="Misses" value={cacheDebug.stats.misses} />
            <DebugStat label="Hit Ratio" value={cacheDebug.stats.hitRatio} />
          </div>
          <div style={styles.debugEntries}>
            {cacheDebug.entries.map((e) => (
              <div key={e.key} style={styles.debugEntry}>
                <code style={styles.debugKey}>{e.key}</code>
                <span style={styles.debugTtl}>expires in {e.expiresInSeconds}s</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main content */}
      {loading && <p style={styles.message}>Loading weather data…</p>}
      {error && <p style={styles.error}>Error: {error}</p>}

      {!loading && !error && (
        <>
          <p style={styles.count}>Showing {cities.length} cities ranked by Comfort Index</p>
          <div style={styles.grid}>
            {cities.map((city) => (
              <CityCard key={city.cityCode} city={city} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

function DebugStat({ label, value }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: '0.7rem', color: '#718096' }}>{label}</div>
      <div style={{ fontWeight: '700', fontSize: '1rem' }}>{value}</div>
    </div>
  )
}

const styles = {
  page: {
    minHeight: '100vh',
    backgroundColor: '#f7fafc',
    padding: '0',
  },
  header: {
    backgroundColor: '#2b6cb0',
    color: '#fff',
    padding: '1rem 1.5rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '0.5rem',
  },
  title: { margin: 0, fontSize: '1.4rem' },
  subtitle: { margin: 0, fontSize: '0.8rem', opacity: 0.8 },
  userArea: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    flexWrap: 'wrap',
  },
  userEmail: { fontSize: '0.875rem', opacity: 0.9 },
  logoutBtn: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    color: '#fff',
    border: '1px solid rgba(255,255,255,0.4)',
    borderRadius: '6px',
    padding: '0.35rem 0.9rem',
    cursor: 'pointer',
    fontSize: '0.8rem',
  },
  controls: {
    display: 'flex',
    gap: '0.75rem',
    alignItems: 'center',
    padding: '0.75rem 1.5rem',
    backgroundColor: '#fff',
    borderBottom: '1px solid #e2e8f0',
    flexWrap: 'wrap',
  },
  cacheBadge: {
    padding: '0.25rem 0.75rem',
    borderRadius: '999px',
    fontSize: '0.8rem',
    fontWeight: '600',
  },
  btnPrimary: {
    backgroundColor: '#3182ce',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    padding: '0.4rem 1rem',
    cursor: 'pointer',
    fontSize: '0.85rem',
  },
  btnSecondary: {
    backgroundColor: '#edf2f7',
    color: '#4a5568',
    border: '1px solid #e2e8f0',
    borderRadius: '6px',
    padding: '0.4rem 1rem',
    cursor: 'pointer',
    fontSize: '0.85rem',
  },
  debugPanel: {
    margin: '1rem 1.5rem',
    backgroundColor: '#fff',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    padding: '1rem',
  },
  debugHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '0.75rem',
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '0.9rem',
    color: '#718096',
  },
  debugGrid: {
    display: 'flex',
    gap: '1.5rem',
    flexWrap: 'wrap',
    marginBottom: '0.75rem',
    padding: '0.75rem',
    backgroundColor: '#f7fafc',
    borderRadius: '6px',
  },
  debugEntries: { display: 'flex', flexDirection: 'column', gap: '0.3rem' },
  debugEntry: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.8rem',
    padding: '0.2rem 0',
    borderBottom: '1px solid #f0f0f0',
  },
  debugKey: { color: '#2d3748', fontFamily: 'monospace' },
  debugTtl: { color: '#718096' },
  count: {
    padding: '0.75rem 1.5rem 0',
    color: '#718096',
    fontSize: '0.875rem',
    margin: 0,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '1rem',
    padding: '1rem 1.5rem',
  },
  message: { padding: '2rem 1.5rem', color: '#718096', textAlign: 'center' },
  error: { padding: '2rem 1.5rem', color: '#c53030', textAlign: 'center' },
}
