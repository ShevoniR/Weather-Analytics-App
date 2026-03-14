import React, { useMemo } from 'react'

const HOURS = ['Now-5h', 'Now-4h', 'Now-3h', 'Now-2h', 'Now-1h', 'Now']
const W = 280
const H = 90
const PAD = { top: 10, right: 10, bottom: 22, left: 32 }

function seededRand(seed, i) {
  const x = Math.sin(seed * 9301 + i * 49297 + 233) * 10000
  return (x - Math.floor(x)) * 2 - 1
}

function strSeed(str) {
  return Array.from(str).reduce((acc, ch) => acc + ch.charCodeAt(0), 0)
}

function generateTrendData(currentTemp, cityCode) {
  const seed = strSeed(cityCode)
  const points = HOURS.map((_, i) => {
    if (i === HOURS.length - 1) return currentTemp // last point = actual
    return Math.round((currentTemp + seededRand(seed, i) * 2) * 10) / 10
  })
  return points
}

function scaleY(val, min, max) {
  const range = max - min || 1
  const innerH = H - PAD.top - PAD.bottom
  return PAD.top + innerH - ((val - min) / range) * innerH
}

function scaleX(i, total) {
  const innerW = W - PAD.left - PAD.right
  return PAD.left + (i / (total - 1)) * innerW
}

export default function TemperatureChart({ city }) {
  const data = useMemo(() => generateTrendData(city.temperature, city.cityCode), [city.temperature, city.cityCode])

  const minVal = Math.min(...data) - 1
  const maxVal = Math.max(...data) + 1

  const points = data.map((val, i) => `${scaleX(i, data.length)},${scaleY(val, minVal, maxVal)}`).join(' ')

  const yTicks = [minVal + 1, (minVal + maxVal) / 2, maxVal - 1].map(Math.round)

  return (
    <div style={{ marginTop: '0.75rem' }}>
      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
        Temperature trend (simulated ±2°C)
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H} style={{ overflow: 'visible' }}>
        {yTicks.map((tick) => {
          const y = scaleY(tick, minVal, maxVal)
          return (
            <g key={tick}>
              <line
                x1={PAD.left}
                y1={y}
                x2={W - PAD.right}
                y2={y}
                stroke="var(--chart-grid)"
                strokeWidth="1"
                strokeDasharray="3 3"
              />
              <text x={PAD.left - 4} y={y + 3.5} textAnchor="end" fontSize="9" fill="var(--text-muted)">
                {tick}°
              </text>
            </g>
          )
        })}

        <polygon
          points={`
            ${points}
            ${scaleX(data.length - 1, data.length)},${H - PAD.bottom}
            ${scaleX(0, data.length)},${H - PAD.bottom}
          `}
          fill="var(--chart-line)"
          fillOpacity="0.12"
        />

        <polyline
          points={points}
          fill="none"
          stroke="var(--chart-line)"
          strokeWidth="2"
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        {data.map((val, i) => (
          <circle
            key={i}
            cx={scaleX(i, data.length)}
            cy={scaleY(val, minVal, maxVal)}
            r={i === data.length - 1 ? 4 : 2.5}
            fill={i === data.length - 1 ? 'var(--chart-line)' : 'var(--bg-card)'}
            stroke="var(--chart-line)"
            strokeWidth="1.5"
          />
        ))}

        {[0, data.length - 1].map((i) => (
          <text key={i} x={scaleX(i, data.length)} y={H - 4} textAnchor="middle" fontSize="9" fill="var(--text-muted)">
            {HOURS[i]}
          </text>
        ))}
      </svg>
    </div>
  )
}
