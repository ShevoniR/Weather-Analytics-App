import React, { createContext, useContext, useState, useEffect } from 'react'

const ThemeContext = createContext(null)

const CSS_VARIABLES = `
  :root {
    --bg-page:         #f7fafc;
    --bg-card:         #ffffff;
    --bg-stat:         #f7fafc;
    --bg-controls:     #ffffff;
    --bg-debug:        #ffffff;
    --bg-debug-inner:  #f7fafc;
    --bg-header:       #2b6cb0;
    --border:          #e2e8f0;
    --text-primary:    #1a202c;
    --text-secondary:  #4a5568;
    --text-muted:      #718096;
    --text-header:     #ffffff;
    --btn-primary-bg:  #3182ce;
    --btn-primary-txt: #ffffff;
    --btn-sec-bg:      #edf2f7;
    --btn-sec-txt:     #4a5568;
    --btn-sec-border:  #e2e8f0;
    --shadow:          0 2px 8px rgba(0,0,0,0.08);
    --chart-line:      #3182ce;
    --chart-grid:      #e2e8f0;
    --input-bg:        #ffffff;
    --input-border:    #e2e8f0;
  }
  body.dark-mode {
    --bg-page:         #0f1117;
    --bg-card:         #1a1d27;
    --bg-stat:         #22263a;
    --bg-controls:     #14161f;
    --bg-debug:        #1a1d27;
    --bg-debug-inner:  #22263a;
    --bg-header:       #1e3a5f;
    --border:          #2d3555;
    --text-primary:    #e2e8f0;
    --text-secondary:  #a0aec0;
    --text-muted:      #718096;
    --text-header:     #e2e8f0;
    --btn-primary-bg:  #4299e1;
    --btn-primary-txt: #ffffff;
    --btn-sec-bg:      #22263a;
    --btn-sec-txt:     #a0aec0;
    --btn-sec-border:  #2d3555;
    --shadow:          0 2px 8px rgba(0,0,0,0.4);
    --chart-line:      #63b3ed;
    --chart-grid:      #2d3555;
    --input-bg:        #22263a;
    --input-border:    #2d3555;
  }
`

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(() => {
    try {
      const saved = localStorage.getItem('theme')
      if (saved !== null) return saved === 'dark'
    } catch (_) {}
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false
  })

  useEffect(() => {
    if (!document.getElementById('theme-vars')) {
      const style = document.createElement('style')
      style.id = 'theme-vars'
      style.textContent = CSS_VARIABLES
      document.head.appendChild(style)
    }
  }, [])

  useEffect(() => {
    document.body.classList.toggle('dark-mode', isDark)
    document.body.style.backgroundColor = isDark ? '#0f1117' : '#f7fafc'
    try {
      localStorage.setItem('theme', isDark ? 'dark' : 'light')
    } catch (_) {}
  }, [isDark])

  const toggleTheme = () => setIsDark((p) => !p)

  return <ThemeContext.Provider value={{ isDark, toggleTheme }}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be inside ThemeProvider')
  return ctx
}
