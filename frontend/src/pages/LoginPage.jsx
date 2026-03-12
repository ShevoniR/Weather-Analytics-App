import React from 'react'
import { useAuth0 } from '@auth0/auth0-react'

export default function LoginPage() {
  const { loginWithRedirect } = useAuth0()

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>🌤 Weather Analytics</h1>
        <p style={styles.subtitle}>Comfort Index Rankings for cities around the world.</p>
        <p style={styles.info}>
          Please log in to view the dashboard. Only authorized users may access this application.
        </p>
        <button style={styles.button} onClick={() => loginWithRedirect()}>
          Log In
        </button>
      </div>
    </div>
  )
}

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    backgroundColor: '#f0f4f8',
    padding: '1rem',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: '12px',
    padding: '2.5rem',
    maxWidth: '420px',
    width: '100%',
    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
    textAlign: 'center',
  },
  title: {
    fontSize: '2rem',
    marginBottom: '0.5rem',
    color: '#1a202c',
  },
  subtitle: {
    color: '#4a5568',
    marginBottom: '1.5rem',
    fontSize: '1rem',
  },
  info: {
    backgroundColor: '#ebf8ff',
    color: '#2b6cb0',
    padding: '0.75rem 1rem',
    borderRadius: '8px',
    fontSize: '0.875rem',
    marginBottom: '1.5rem',
  },
  button: {
    backgroundColor: '#3182ce',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    padding: '0.75rem 2rem',
    fontSize: '1rem',
    cursor: 'pointer',
    width: '100%',
  },
}
