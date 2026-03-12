import React from 'react'
import { Auth0Provider } from '@auth0/auth0-react'

export default function AuthProvider({ children }) {
  const domain = process.env.REACT_APP_AUTH0_DOMAIN
  const clientId = process.env.REACT_APP_AUTH0_CLIENT_ID
  const audience = process.env.REACT_APP_AUTH0_AUDIENCE

  if (!domain || !clientId) {
    return (
      <div style={{ padding: '2rem', color: 'red' }}>
        <h2>Auth0 not configured</h2>
        <p>
          Copy <code>frontend/.env.example</code> to <code>frontend/.env</code> and fill in your Auth0 values.
        </p>
      </div>
    )
  }

  return (
    <Auth0Provider
      domain={domain}
      clientId={clientId}
      authorizationParams={{
        redirect_uri: window.location.origin,
        audience: audience,
        scope: 'openid profile email',
      }}
    >
      {children}
    </Auth0Provider>
  )
}
