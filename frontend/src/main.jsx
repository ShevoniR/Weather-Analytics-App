import React from 'react'
import ReactDOM from 'react-dom/client'
import { ThemeProvider } from './context/ThemeContext'
import AuthProvider from './context/AuthProvider'
import App from './App'

const globalStyles = `
  * { box-sizing: border-box; }
  body {
    margin: 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    transition: background-color 0.2s ease, color 0.2s ease;
  }
`
const styleTag = document.createElement('style')
styleTag.textContent = globalStyles
document.head.appendChild(styleTag)

const root = ReactDOM.createRoot(document.getElementById('root'))
root.render(
  <React.StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <App />
      </AuthProvider>
    </ThemeProvider>
  </React.StrictMode>
)
