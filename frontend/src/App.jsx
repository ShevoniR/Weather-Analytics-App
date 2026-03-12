import React from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import LoginPage from './pages/LoginPage'
import Dashboard from './pages/Dashboard'

export default function App() {
  const { isLoading, isAuthenticated, error } = useAuth0()

  if (isLoading) {
    return (
      <div style={styles.loading}>
        <p>Loading…</p>
      </div>
    )
  }

  if (error) {
    return (
      <div style={styles.error}>
        <h2>Authentication Error</h2>
        <p>{error.message}</p>
      </div>
    )
  }

  return isAuthenticated ? <Dashboard /> : <LoginPage />
}

const styles = {
  loading: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    color: '#4a5568',
    fontSize: '1.1rem',
  },
  error: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    color: '#c53030',
    textAlign: 'center',
    padding: '2rem',
  },
}
