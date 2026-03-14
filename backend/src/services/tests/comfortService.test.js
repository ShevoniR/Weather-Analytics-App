const { computeComfortIndex } = require('../comfortService')

function makeWeather(tempC, humidity, windMps = 0, cloudsPercent = 0, weatherId = 800) {
  return {
    main: { temp: tempC + 273.15, humidity },
    wind: { speed: windMps },
    clouds: { all: cloudsPercent },
    weather: [{ id: weatherId }],
  }
}

describe('computeComfortIndex — return shape', () => {
  test('returns a score and a breakdown object', () => {
    const result = computeComfortIndex(makeWeather(21, 50))
    expect(result).toHaveProperty('score')
    expect(result).toHaveProperty('breakdown')
    expect(result.breakdown).toHaveProperty('penalties')
  })

  test('score is an integer between 0 and 100', () => {
    const result = computeComfortIndex(makeWeather(21, 50))
    expect(Number.isInteger(result.score)).toBe(true)
    expect(result.score).toBeGreaterThanOrEqual(0)
    expect(result.score).toBeLessThanOrEqual(100)
  })
})

describe('computeComfortIndex — ideal conditions', () => {
  test('21 C / 50% humidity / no wind / clear sky → perfect 100', () => {
    const result = computeComfortIndex(makeWeather(21, 50, 0, 0, 800))
    expect(result.score).toBe(100)
  })

  test('all penalties are 0 under perfect conditions', () => {
    const result = computeComfortIndex(makeWeather(21, 50, 0, 0, 800))
    const p = result.breakdown.penalties
    expect(p.temperature).toBe(0)
    expect(p.humidity).toBe(0)
    expect(p.wind).toBe(0)
    expect(p.cloudiness).toBe(0)
  })
})

describe('temperaturePenalty', () => {
  test('18–24 C range gives temperature penalty = 0', () => {
    ;[18, 20, 22, 24].forEach((t) => {
      const { breakdown } = computeComfortIndex(makeWeather(t, 50, 0, 0, 800))
      expect(breakdown.penalties.temperature).toBe(0)
    })
  })

  test('0 C → maximum temperature penalty (40 pts)', () => {
    const { breakdown } = computeComfortIndex(makeWeather(0, 50, 0, 0, 800))
    expect(breakdown.penalties.temperature).toBe(40)
  })

  test('38 C → maximum temperature penalty (40 pts)', () => {
    const { breakdown } = computeComfortIndex(makeWeather(38, 50, 0, 0, 800))
    expect(breakdown.penalties.temperature).toBe(40)
  })

  test('extremely cold (-20 C) → penalty clamped at 40', () => {
    const { breakdown } = computeComfortIndex(makeWeather(-20, 50, 0, 0, 800))
    expect(breakdown.penalties.temperature).toBe(40)
  })

  test('extremely hot (50 C) → penalty clamped at 40', () => {
    const { breakdown } = computeComfortIndex(makeWeather(50, 50, 0, 0, 800))
    expect(breakdown.penalties.temperature).toBe(40)
  })

  test('9 C → halfway between 0 and 18 → ~50% of 40 = 20', () => {
    const { breakdown } = computeComfortIndex(makeWeather(9, 50, 0, 0, 800))
    expect(breakdown.penalties.temperature).toBeCloseTo(20, 0)
  })
})

describe('humidityPenalty', () => {
  test('40–60% range gives humidity penalty = 0', () => {
    ;[40, 50, 60].forEach((h) => {
      const { breakdown } = computeComfortIndex(makeWeather(21, h, 0, 0, 800))
      expect(breakdown.penalties.humidity).toBe(0)
    })
  })

  test('0% humidity → maximum penalty (25 pts)', () => {
    const { breakdown } = computeComfortIndex(makeWeather(21, 0, 0, 0, 800))
    expect(breakdown.penalties.humidity).toBe(25)
  })

  test('100% humidity → maximum penalty (25 pts)', () => {
    const { breakdown } = computeComfortIndex(makeWeather(21, 100, 0, 0, 800))
    expect(breakdown.penalties.humidity).toBe(25)
  })
})

describe('windPenalty', () => {
  test('0–4 m/s (0–14.4 km/h) gives wind penalty = 0', () => {
    ;[0, 2, 4].forEach((mps) => {
      const { breakdown } = computeComfortIndex(makeWeather(21, 50, mps, 0, 800))
      expect(breakdown.penalties.wind).toBe(0)
    })
  })

  test('16.67 m/s (~60 km/h) → maximum wind penalty (20 pts)', () => {
    const { breakdown } = computeComfortIndex(makeWeather(21, 50, 16.67, 0, 800))
    expect(breakdown.penalties.wind).toBe(20)
  })

  test('very high wind (30 m/s) → penalty clamped at 20', () => {
    const { breakdown } = computeComfortIndex(makeWeather(21, 50, 30, 0, 800))
    expect(breakdown.penalties.wind).toBe(20)
  })
})

describe('cloudinessPenalty', () => {
  test('clear sky (id 800, 0% clouds) → cloudiness penalty = 0', () => {
    const { breakdown } = computeComfortIndex(makeWeather(21, 50, 0, 0, 800))
    expect(breakdown.penalties.cloudiness).toBe(0)
  })

  test('thunderstorm (id 200) → maximum cloudiness penalty (15 pts)', () => {
    const { breakdown } = computeComfortIndex(makeWeather(21, 50, 0, 50, 200))
    expect(breakdown.penalties.cloudiness).toBe(15)
  })

  test('heavy rain (id 501) → maximum cloudiness penalty (15 pts)', () => {
    const { breakdown } = computeComfortIndex(makeWeather(21, 50, 0, 80, 501))
    expect(breakdown.penalties.cloudiness).toBe(15)
  })

  test('snow (id 601) → maximum cloudiness penalty (15 pts)', () => {
    const { breakdown } = computeComfortIndex(makeWeather(21, 50, 0, 90, 601))
    expect(breakdown.penalties.cloudiness).toBe(15)
  })

  test('mist/fog (id 701) → 70% of 15 = 10.5', () => {
    const { breakdown } = computeComfortIndex(makeWeather(21, 50, 0, 40, 701))
    expect(breakdown.penalties.cloudiness).toBeCloseTo(10.5, 0)
  })

  test('overcast clouds (id 804, 100% clouds) → 0.5 * 15 = 7.5', () => {
    const { breakdown } = computeComfortIndex(makeWeather(21, 50, 0, 100, 804))
    expect(breakdown.penalties.cloudiness).toBeCloseTo(7.5, 0)
  })
})

describe('computeComfortIndex — combined scenarios', () => {
  test('worst possible conditions → score 0', () => {
    const result = computeComfortIndex(makeWeather(-20, 0, 30, 100, 200))
    expect(result.score).toBe(0)
  })

  test('hot humid tropical storm → score near 0 (<=10)', () => {
    const result = computeComfortIndex(makeWeather(36, 95, 20, 100, 502))
    expect(result.score).toBeLessThanOrEqual(10)
  })

  test('breakdown.temperatureCelsius rounds to 1 decimal', () => {
    const result = computeComfortIndex(makeWeather(21.567, 50))
    expect(result.breakdown.temperatureCelsius).toBe(21.6)
  })

  test('breakdown.windSpeedKmh converts m/s correctly (5 m/s = 18 km/h)', () => {
    const result = computeComfortIndex(makeWeather(21, 50, 5))
    expect(result.breakdown.windSpeedKmh).toBe(18)
  })

  test('missing wind field defaults to 0 penalty', () => {
    const raw = {
      main: { temp: 294.15, humidity: 50 },
      clouds: { all: 0 },
      weather: [{ id: 800 }],
    }
    const result = computeComfortIndex(raw)
    expect(result.breakdown.penalties.wind).toBe(0)
  })

  test('empty weather array defaults to clear-sky behaviour', () => {
    const raw = {
      main: { temp: 294.15, humidity: 50 },
      wind: { speed: 0 },
      clouds: { all: 0 },
      weather: [],
    }
    const result = computeComfortIndex(raw)
    expect(result.score).toBe(100)
  })
})
