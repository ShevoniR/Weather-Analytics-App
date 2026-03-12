require('dotenv').config()
const express = require('express')
const cors = require('cors')

const weatherRoutes = require('./routes/weather')
const debugRoutes = require('./routes/debug')

const app = express()
const PORT = process.env.PORT || 5000

app.use(express.json())

app.use(
  cors({
    origin: process.env.FRONTEND_URL || ['http://localhost:3000', 'http://localhost:5173', 'http://127.0.0.1:5173'],
    methods: ['GET', 'POST', 'DELETE'],
    allowedHeaders: ['Authorization', 'Content-Type'],
  })
)

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  })
})

app.use('/api/weather', weatherRoutes)

app.use('/api/debug', debugRoutes)

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' })
})

app.use((err, req, res, next) => {
  console.error('Unhandled error:', err)

  if (err.status === 401) {
    return res.status(401).json({ error: 'Unauthorized', detail: err.message })
  }
  if (err.status === 403) {
    return res.status(403).json({ error: 'Forbidden', detail: err.message })
  }

  res.status(500).json({ error: 'Internal server error' })
})

app.listen(PORT, () => {
  console.log(`\n🌤  Weather Analytics API running on http://localhost:${PORT}`)
  console.log(`   Health:  GET  /health`)
  console.log(`   Weather: GET  /api/weather  (requires Auth0 JWT)`)
  console.log(`   Debug:   GET  /api/debug/cache`)
  console.log(`\n   Auth0 Domain:    ${process.env.AUTH0_DOMAIN || 'NOT SET'}`)
  console.log(`   Auth0 Audience:  ${process.env.AUTH0_AUDIENCE || 'NOT SET'}\n`)
})
