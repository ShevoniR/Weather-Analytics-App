import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import CityCard from '../components/CityCard'
import { fetchWeatherData, fetchCacheDebug, refreshWeatherData } from '../services/weatherApi'
import { useTheme } from '../context/ThemeContext'

const SORT_OPTIONS = [
  { key: 'comfort', label: 'Comfort Score', fn: (a, b) => b.comfortScore - a.comfortScore },
  { key: 'temp_asc', label: 'Temp ↑ (coldest first)', fn: (a, b) => a.temperature - b.temperature },
  { key: 'temp_desc', label: 'Temp ↓ (hottest first)', fn: (a, b) => b.temperature - a.temperature },
  { key: 'humidity', label: 'Humidity (high→low)', fn: (a, b) => b.humidity - a.humidity },
  { key: 'wind', label: 'Wind (high→low)', fn: (a, b) => b.windSpeedKmh - a.windSpeedKmh },
  { key: 'name', label: 'City Name (A→Z)', fn: (a, b) => a.cityName.localeCompare(b.cityName) },
]

const FILTER_OPTIONS = [
  { key: 'all', label: 'All cities', test: () => true },
  { key: 'excellent', label: 'Excellent (80+)', test: (c) => c.comfortScore >= 80 },
  { key: 'good', label: 'Good (60–79)', test: (c) => c.comfortScore >= 60 && c.comfortScore < 80 },
  { key: 'fair', label: 'Fair (40–59)', test: (c) => c.comfortScore >= 40 && c.comfortScore < 60 },
  { key: 'poor', label: 'Poor (20–39)', test: (c) => c.comfortScore >= 20 && c.comfortScore < 40 },
  { key: 'harsh', label: 'Harsh (<20)', test: (c) => c.comfortScore < 20 },
]

export default function Dashboard() {
  const { user, logout, getAccessTokenSilently } = useAuth0()
  const { isDark, toggleTheme } = useTheme()

  const [cities, setCities] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [cacheStatus, setCacheStatus] = useState(null)
  const [cacheDebug, setCacheDebug] = useState(null)
  const [showDebug, setShowDebug] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  const [sortKey, setSortKey] = useState('comfort') // default: sort by comfort score
  const [filterKey, setFilterKey] = useState('all') // default: show all cities
  const [showCharts, setShowCharts] = useState(true) // toggle temperature charts

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

  const displayedCities = useMemo(() => {
    const filterFn = FILTER_OPTIONS.find((f) => f.key === filterKey)?.test ?? (() => true)
    const sortFn = SORT_OPTIONS.find((s) => s.key === sortKey)?.fn
    const filtered = cities.filter(filterFn)
    return sortFn ? [...filtered].sort(sortFn) : filtered
  }, [cities, sortKey, filterKey])

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

  const s = styles

  return (
    <div style={s.page}>
      <header style={s.header}>
        <div>
          <h1 style={s.title}>🌤 Weather Analytics</h1>
          <p style={s.subtitle}>Comfort Index Rankings</p>
        </div>
        <div style={s.userArea}>
          <span style={s.userEmail}>{user?.email}</span>

          <button style={s.themeBtn} onClick={toggleTheme} title="Toggle dark/light mode">
            {isDark ? '☀️ Light' : '🌙 Dark'}
          </button>

          <button style={s.logoutBtn} onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}>
            Log Out
          </button>
        </div>
      </header>

      <div style={s.controls}>
        {cacheStatus && (
          <span
            style={{
              ...s.cacheBadge,
              backgroundColor: cacheStatus === 'HIT' ? '#c6f6d5' : '#bee3f8',
              color: cacheStatus === 'HIT' ? '#276749' : '#2c5282',
            }}
          >
            List Cache: {cacheStatus}
          </span>
        )}

        <label style={s.controlLabel}>
          Sort:
          <select value={sortKey} onChange={(e) => setSortKey(e.target.value)} style={s.select}>
            {SORT_OPTIONS.map((o) => (
              <option key={o.key} value={o.key}>
                {o.label}
              </option>
            ))}
          </select>
        </label>

        <label style={s.controlLabel}>
          Filter:
          <select value={filterKey} onChange={(e) => setFilterKey(e.target.value)} style={s.select}>
            {FILTER_OPTIONS.map((o) => (
              <option key={o.key} value={o.key}>
                {o.label}
              </option>
            ))}
          </select>
        </label>

        <button
          style={{
            ...s.btnSecondary,
            backgroundColor: showCharts ? 'var(--btn-primary-bg)' : 'var(--btn-sec-bg)',
            color: showCharts ? 'var(--btn-primary-txt)' : 'var(--btn-sec-txt)',
          }}
          onClick={() => setShowCharts((v) => !v)}
        >
          {showCharts ? 'Hide Charts' : 'Show Charts'}
        </button>

        <button style={s.btnSecondary} onClick={loadCacheDebug}>
          Cache Debug
        </button>

        <button style={s.btnPrimary} onClick={handleRefresh} disabled={refreshing}>
          {refreshing ? 'Refreshing…' : 'Refresh Data'}
        </button>
      </div>

      {showDebug && cacheDebug && (
        <div style={s.debugPanel}>
          <div style={s.debugHeader}>
            <strong style={{ color: 'var(--text-primary)' }}>Cache Debug</strong>
            <button style={s.closeBtn} onClick={() => setShowDebug(false)}>
              ✕
            </button>
          </div>
          <div style={s.debugGrid}>
            <DebugStat label="Total Keys" value={cacheDebug.totalKeys} />
            <DebugStat label="TTL (s)" value={cacheDebug.configuredTTL} />
            <DebugStat label="Hits" value={cacheDebug.stats.hits} />
            <DebugStat label="Misses" value={cacheDebug.stats.misses} />
            <DebugStat label="Hit Ratio" value={cacheDebug.stats.hitRatio} />
          </div>
          <div style={s.debugEntries}>
            {cacheDebug.entries.map((e) => (
              <div key={e.key} style={s.debugEntry}>
                <code style={s.debugKey}>{e.key}</code>
                <span style={s.debugTtl}>expires in {e.expiresInSeconds}s</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {loading && <p style={s.message}>Loading weather data…</p>}
      {error && <p style={s.errorMsg}>Error: {error}</p>}

      {!loading && !error && (
        <>
          <p style={s.count}>
            Showing {displayedCities.length} of {cities.length} cities
            {filterKey !== 'all' && ` (filtered: ${FILTER_OPTIONS.find((f) => f.key === filterKey)?.label})`}
            {' · '}sorted by {SORT_OPTIONS.find((o) => o.key === sortKey)?.label}
          </p>

          {displayedCities.length === 0 && <p style={s.message}>No cities match the selected filter.</p>}

          <div style={s.grid}>
            {displayedCities.map((city) => (
              <CityCard key={city.cityCode} city={city} showChart={showCharts} />
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
      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{label}</div>
      <div style={{ fontWeight: '700', fontSize: '1rem', color: 'var(--text-primary)' }}>{value}</div>
    </div>
  )
}

const styles = {
  page: { minHeight: '100vh', backgroundColor: 'var(--bg-page)', padding: 0 },
  header: {
    backgroundColor: 'var(--bg-header)',
    color: 'var(--text-header)',
    padding: '1rem 1.5rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '0.5rem',
  },
  title: { margin: 0, fontSize: '1.4rem', color: 'var(--text-header)' },
  subtitle: { margin: 0, fontSize: '0.8rem', opacity: 0.8, color: 'var(--text-header)' },
  userArea: { display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' },
  userEmail: { fontSize: '0.875rem', opacity: 0.9, color: 'var(--text-header)' },
  themeBtn: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    color: 'var(--text-header)',
    border: '1px solid rgba(255,255,255,0.35)',
    borderRadius: '6px',
    padding: '0.35rem 0.9rem',
    cursor: 'pointer',
    fontSize: '0.8rem',
  },
  logoutBtn: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    color: 'var(--text-header)',
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
    backgroundColor: 'var(--bg-controls)',
    borderBottom: '1px solid var(--border)',
    flexWrap: 'wrap',
  },
  controlLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    fontSize: '0.8rem',
    color: 'var(--text-secondary)',
    fontWeight: '600',
  },
  select: {
    backgroundColor: 'var(--input-bg)',
    color: 'var(--text-primary)',
    border: '1px solid var(--input-border)',
    borderRadius: '6px',
    padding: '0.3rem 0.5rem',
    fontSize: '0.8rem',
    cursor: 'pointer',
  },
  cacheBadge: {
    padding: '0.25rem 0.75rem',
    borderRadius: '999px',
    fontSize: '0.8rem',
    fontWeight: '600',
  },
  btnPrimary: {
    backgroundColor: 'var(--btn-primary-bg)',
    color: 'var(--btn-primary-txt)',
    border: 'none',
    borderRadius: '6px',
    padding: '0.4rem 1rem',
    cursor: 'pointer',
    fontSize: '0.85rem',
  },
  btnSecondary: {
    backgroundColor: 'var(--btn-sec-bg)',
    color: 'var(--btn-sec-txt)',
    border: '1px solid var(--btn-sec-border)',
    borderRadius: '6px',
    padding: '0.4rem 1rem',
    cursor: 'pointer',
    fontSize: '0.85rem',
  },
  debugPanel: {
    margin: '1rem 1.5rem',
    backgroundColor: 'var(--bg-debug)',
    border: '1px solid var(--border)',
    borderRadius: '8px',
    padding: '1rem',
  },
  debugHeader: { display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' },
  closeBtn: { background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.9rem', color: 'var(--text-muted)' },
  debugGrid: {
    display: 'flex',
    gap: '1.5rem',
    flexWrap: 'wrap',
    marginBottom: '0.75rem',
    padding: '0.75rem',
    backgroundColor: 'var(--bg-debug-inner)',
    borderRadius: '6px',
  },
  debugEntries: { display: 'flex', flexDirection: 'column', gap: '0.3rem' },
  debugEntry: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.8rem',
    padding: '0.2rem 0',
    borderBottom: '1px solid var(--border)',
  },
  debugKey: { color: 'var(--text-primary)', fontFamily: 'monospace' },
  debugTtl: { color: 'var(--text-muted)' },
  count: { padding: '0.75rem 1.5rem 0', color: 'var(--text-muted)', fontSize: '0.875rem', margin: 0 },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '1rem',
    padding: '1rem 1.5rem',
  },
  message: { padding: '2rem 1.5rem', color: 'var(--text-muted)', textAlign: 'center' },
  errorMsg: { padding: '2rem 1.5rem', color: '#c53030', textAlign: 'center' },
}
