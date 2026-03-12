const NodeCache = require('node-cache')

const CACHE_TTL = parseInt(process.env.CACHE_TTL_SECONDS) || 300

const cache = new NodeCache({ stdTTL: CACHE_TTL, checkperiod: 60 })

const stats = {
  hits: 0,
  misses: 0,
  sets: 0,
}

function get(key) {
  const value = cache.get(key)
  if (value !== undefined) {
    stats.hits++
    return { value, status: 'HIT' }
  }
  stats.misses++
  return { value: null, status: 'MISS' }
}

function set(key, value, ttl = CACHE_TTL) {
  stats.sets++
  cache.set(key, value, ttl)
}

function del(key) {
  cache.del(key)
}

function flush() {
  cache.flushAll()
  stats.hits = 0
  stats.misses = 0
  stats.sets = 0
}

function getDebugInfo() {
  const keys = cache.keys()
  const entries = keys.map((key) => {
    const ttl = cache.getTtl(key)
    const remainingMs = ttl ? ttl - Date.now() : null
    return {
      key,
      expiresInSeconds: remainingMs ? Math.round(remainingMs / 1000) : null,
    }
  })

  return {
    totalKeys: keys.length,
    configuredTTL: CACHE_TTL,
    stats: {
      hits: stats.hits,
      misses: stats.misses,
      sets: stats.sets,
      hitRatio:
        stats.hits + stats.misses > 0 ? ((stats.hits / (stats.hits + stats.misses)) * 100).toFixed(1) + '%' : 'N/A',
    },
    entries,
  }
}

module.exports = { get, set, del, flush, getDebugInfo }
