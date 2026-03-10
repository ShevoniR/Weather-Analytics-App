const NodeCache = require('node-cache')

const TTL_SECONDS = 300

const cache = new NodeCache({
	stdTTL: TTL_SECONDS,
	checkperiod: 60,
})

function setCache(key, value, ttl = TTL_SECONDS) {
	return cache.set(key, value, ttl)
}

function getCache(key) {
	return cache.get(key)
}

function delCache(key) {
	return cache.del(key)
}

function flushCache() {
	return cache.flushAll()
}

module.exports = {
	cache,
	TTL_SECONDS,
	setCache,
	getCache,
	delCache,
	flushCache,
}
