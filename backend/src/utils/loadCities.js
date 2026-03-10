const fs = require('fs')
const path = require('path')

const CITIES_FILE_PATH = path.join(__dirname, '..', '..', 'cities.json')

function loadCities() {
	const raw = fs.readFileSync(CITIES_FILE_PATH, 'utf-8')
	const data = JSON.parse(raw)

	if (!Array.isArray(data)) {
		throw new Error('cities.json must contain an array of city objects')
	}

	const cityCodes = data
		.map((city) => city && city.CityCode)
		.filter(Boolean)
		.map(String)

	if (cityCodes.length < 10) {
		throw new Error(`cities.json must contain at least 10 cities with CityCode; found ${cityCodes.length}`)
	}

	return cityCodes
}

module.exports = {
	loadCities,
}
