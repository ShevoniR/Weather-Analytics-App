# Weather Analytics Application

A full-stack weather analytics app that ranks cities by a custom **Comfort Index Score** (0–100). Built with React (frontend) and Node.js + Express (backend), secured with Auth0.

---

## Project Structure

```
weather-app/
├── backend/
│   ├── cities.json                    # City list (do not modify)
│   ├── package.json
│   ├── .env.example                   # Copy to .env and fill values
│   └── src/
│       ├── index.js                   # Express server entry point
│       ├── middleware/
│       │   └── auth.js                # Auth0 JWT verification middleware
│       ├── routes/
│       │   ├── weather.js             # /api/weather (protected)
│       │   └── debug.js               # /api/debug/cache (public)
│       └── services/
│           ├── cacheService.js        # In-memory cache wrapper
│           ├── comfortService.js      # Comfort Index formula
│           ├── weatherService.js      # OWM fetch + orchestration
│           └── __tests__/
│               └── comfortService.test.js   # Unit tests (Jest)
└── frontend/
    ├── package.json
    ├── .env.example
    └── src/
        ├── index.js                   # React entry point
        ├── App.js                     # Auth-based routing
        ├── context/
        │   ├── AuthProvider.jsx       # Auth0Provider wrapper
        │   └── ThemeContext.jsx       # Dark/light mode state + CSS variables
        ├── services/
        │   └── weatherApi.js          # API calls to backend
        ├── pages/
        │   ├── LoginPage.jsx          # Unauthenticated view
        │   └── Dashboard.jsx          # Main authenticated view (sort, filter, theme toggle)
        └── components/
            ├── CityCard.jsx           # Per-city weather + score card
            └── TemperatureChart.jsx   # SVG temperature trend chart
```

---

## Setup Instructions

### 1. OpenWeatherMap API Key

1. Register at https://openweathermap.org/
2. Go to **API keys** in your account
3. Copy your API key (free tier is enough)

### 2. Auth0 Setup

1. Create a free account at https://auth0.com/
2. Create a new **Application** → type: **Single Page Application**
3. In application settings:
   - **Allowed Callback URLs**: `http://localhost:3000`
   - **Allowed Logout URLs**: `http://localhost:3000`
   - **Allowed Web Origins**: `http://localhost:3000`
4. Create a new **API** (Auth0 Dashboard → APIs):
   - **Name**: Weather Analytics API
   - **Identifier** (audience): `https://weather-analytics-api`
5. Enable MFA: **Auth0 Dashboard → Security → Multi-factor Auth → Enable Email**
6. Disable public signups: **Auth0 Dashboard → Authentication → Database → Disable Sign Ups**
7. Create a test user manually: **Auth0 Dashboard → User Management → Users → Create User**
   - Email: `careers@fidenz.com`
   - Password: `Pass#fidenz`

### 3. Backend

```bash
cd backend
cp .env.example .env
# Fill in .env with your values
npm install
npm run dev        # or npm start
```

Backend runs at `http://localhost:5000`.

### 4. Frontend

```bash
cd frontend
cp .env.example .env
# Fill in .env with your Auth0 SPA values
npm install
npm start
```

Frontend runs at `http://localhost:3000`.

---

## Running Tests

Unit tests cover the Comfort Index formula in isolation — no network calls, no Auth0, no cache.

```bash
cd backend
npm test                  # run once
npm run test:watch        # re-run on file save
npm run test:coverage     # with coverage report
```

All 28 tests should pass.

---

## Environment Variables

### Backend `.env`

| Variable              | Description                                            |
| --------------------- | ------------------------------------------------------ |
| `PORT`                | Express port (default: 5000)                           |
| `OPENWEATHER_API_KEY` | Your OWM API key                                       |
| `AUTH0_DOMAIN`        | e.g. `your-tenant.auth0.com`                           |
| `AUTH0_AUDIENCE`      | e.g. `https://weather-analytics-api`                   |
| `CACHE_TTL_SECONDS`   | Cache duration (default: 300)                          |
| `FRONTEND_URL`        | CORS allowed origin (default: `http://localhost:3000`) |

### Frontend `.env`

| Variable                    | Description                                    |
| --------------------------- | ---------------------------------------------- |
| `REACT_APP_AUTH0_DOMAIN`    | Same Auth0 domain                              |
| `REACT_APP_AUTH0_CLIENT_ID` | SPA Client ID from Auth0                       |
| `REACT_APP_AUTH0_AUDIENCE`  | Same audience as backend                       |
| `REACT_APP_API_URL`         | Backend URL (default: `http://localhost:5000`) |

---

## API Endpoints

| Method | Path                     | Auth | Description                        |
| ------ | ------------------------ | ---- | ---------------------------------- |
| GET    | `/health`                | No   | Health check                       |
| GET    | `/api/weather`           | Yes  | All cities ranked by Comfort Index |
| GET    | `/api/weather/:cityCode` | Yes  | Single city raw weather            |
| POST   | `/api/weather/refresh`   | Yes  | Flush cache + re-fetch all         |
| GET    | `/api/debug/cache`       | No   | Cache keys, TTLs, hit/miss stats   |
| DELETE | `/api/debug/cache`       | No   | Flush all cache                    |

---

## Comfort Index Formula

### Formula

```
ComfortIndex = 100
  - (temperaturePenalty × 40)
  - (humidityPenalty    × 25)
  - (windPenalty        × 20)
  - (cloudinessPenalty  × 15)
```

Each `*Penalty` is a value from **0 to 1** (0 = ideal, 1 = maximally uncomfortable).

### Sub-score Definitions

#### Temperature Penalty (weight: 40)

- Ideal range: **18°C – 24°C** → penalty = 0
- Below 0°C or above 38°C → penalty = 1
- Linear scale between ideal and absolute limits

#### Humidity Penalty (weight: 25)

- Ideal range: **40% – 60%** → penalty = 0
- 0% or 100% → penalty = 1

#### Wind Speed Penalty (weight: 20)

- 0 – 15 km/h → penalty = 0 (calm to light breeze)
- 60+ km/h → penalty = 1 (strong wind / storm force)

#### Cloudiness Penalty (weight: 15)

- Clear sky → ~0
- Overcast (100% clouds, no precipitation) → 0.5
- Rain, drizzle, thunderstorm → 1.0
- Mist/fog → 0.7

### Why These Weights?

| Factor      | Weight | Reasoning                                                                                                                           |
| ----------- | ------ | ----------------------------------------------------------------------------------------------------------------------------------- |
| Temperature | 40     | Thermal comfort is the most immediately felt factor in human perception of weather. Extreme heat or cold dominates everything else. |
| Humidity    | 25     | High humidity makes heat oppressive and breathing harder. Low humidity causes dryness and discomfort. Second biggest impact.        |
| Wind Speed  | 20     | Strong wind increases perceived coldness (wind-chill) and is physically unpleasant. Light breezes are acceptable or pleasant.       |
| Cloudiness  | 15     | Overcast skies reduce daylight and can lower mood, but a cloudy day at 22°C is still largely comfortable.                           |

### Trade-offs Considered

1. **Dew point vs humidity**: Dew point is a more precise discomfort measure at high temperatures, but it isn't directly returned by OWM's `weather` endpoint. Humidity is a reasonable proxy and avoids a second API call.

2. **Visibility**: OWM returns visibility in meters. It could serve as an additional parameter (fog = low comfort). Omitted to keep the formula simple and avoid over-fitting to one signal.

3. **Feels-like temperature**: OWM computes a `feels_like` value accounting for humidity and wind. Using it directly would double-count those factors, so the formula uses raw temperature and separate humidity/wind penalties.

4. **Non-linear vs linear scaling**: A sigmoid or square-root curve would model diminishing returns more accurately (30°C is only slightly worse than 28°C, but 42°C is catastrophic). Linear scaling is used here for transparency and debuggability.

---

## Cache Design

The cache is implemented with `node-cache` (in-process, no Redis required).

| Cache Key                | Content                             | TTL                  |
| ------------------------ | ----------------------------------- | -------------------- |
| `raw_weather_{cityCode}` | Raw OWM API JSON for one city       | 5 min (configurable) |
| `processed_{cityCode}`   | Computed comfort score for one city | 5 min                |
| `all_cities_ranked`      | Full ranked list                    | 5 min                |

**Two-level caching strategy:**

- The ranked list is served from `all_cities_ranked` if available (fastest path).
- If the list cache is cold, individual `processed_` keys are checked per city.
- If a processed key is cold, `raw_weather_` is checked before calling OWM.
- This means a partial cache invalidation (e.g. one city's TTL expired) only re-fetches that one city.

**Debug endpoint** (`GET /api/debug/cache`) exposes all keys, their remaining TTL, and hit/miss statistics without exposing raw weather data.

---

## Additional Features

### Dark Mode

The application supports a dark/light theme that persists across page reloads.

**How it works:**

All component colours are defined as CSS custom properties (variables) — e.g. `var(--bg-card)`, `var(--text-primary)` — with two sets of values: one under `:root` (light) and one under `body.dark-mode` (dark). When dark mode is active, `ThemeContext` adds the `dark-mode` class to `<body>`, and the browser resolves every variable to its dark value automatically. No individual component needs to check the current theme; they just use the variable.

The preference is saved to `localStorage` so it survives a page reload. On a user's first visit, the OS-level preference (`prefers-color-scheme: dark`) is used as the default.

The toggle button is in the top-right of the Dashboard header.

**Files involved:**

- `frontend/src/context/ThemeContext.jsx` — provider, CSS variable injection, localStorage persistence
- `frontend/src/index.js` — wraps the app in `<ThemeProvider>` as the outermost wrapper
- All component style objects use `var(--*)` instead of hardcoded colours

---

### Unit Tests

The Comfort Index formula is covered by **28 Jest unit tests** in `backend/src/services/__tests__/comfortService.test.js`.

Tests are grouped into 7 `describe` blocks:

| Block                 | What it covers                                                                   |
| --------------------- | -------------------------------------------------------------------------------- |
| Return shape          | `score` is an integer 0–100; `breakdown.penalties` object is present             |
| Ideal conditions      | Perfect inputs produce score 100 with all penalties at 0                         |
| `temperaturePenalty`  | Ideal band 18–24°C, cold extreme (0°C), hot extreme (38°C), clamping, midpoint   |
| `humidityPenalty`     | Ideal band 40–60%, extremes at 0% and 100%                                       |
| `windPenalty`         | Calm threshold (≤15 km/h), maximum (60 km/h), clamping above maximum             |
| `cloudinessPenalty`   | Clear sky, thunderstorm/rain/snow, mist/fog, overcast clouds                     |
| Combined / edge cases | Worst-case scenario, tropical storm, missing `wind` field, empty `weather` array |

A `makeWeather(tempC, humidity, windMps, cloudsPercent, weatherId)` helper constructs minimal fake OWM response objects, so tests read clearly without noise from irrelevant fields.

Run with:

```bash
cd backend
npm test
```

---

### Sorting and Filtering

The Dashboard controls bar provides two dropdowns that operate entirely on already-fetched data using `useMemo` — no additional API calls are made when the selection changes, so the UI responds instantly.

**Sort options:**

| Option                  | Behaviour              |
| ----------------------- | ---------------------- |
| Comfort Score (default) | Highest score first    |
| Temp ↑ (coldest first)  | Ascending temperature  |
| Temp ↓ (hottest first)  | Descending temperature |
| Humidity (high→low)     | Most humid first       |
| Wind (high→low)         | Windiest first         |
| City Name (A→Z)         | Alphabetical           |

**Filter options:**

| Option               | Score range shown |
| -------------------- | ----------------- |
| All cities (default) | Everything        |
| Excellent            | 80 – 100          |
| Good                 | 60 – 79           |
| Fair                 | 40 – 59           |
| Poor                 | 20 – 39           |
| Harsh                | 0 – 19            |

The filter bands match the comfort labels shown on each city card. The count line below the controls dynamically shows how many cities are visible and the active sort/filter state.

---

### Temperature Trend Charts

Each city card displays a 6-point SVG line chart showing a temperature trend. A **Show Charts / Hide Charts** toggle button in the controls bar shows or hides the charts across all cards simultaneously.

**Data source note:** OpenWeatherMap's free `/weather` endpoint returns only the current moment, not historical data. To show a meaningful trend without a second API call or a paid plan, the chart generates ±2°C of plausible variation around the current temperature using a seeded pseudo-random function (seeded by `cityCode`). This ensures the same city always renders the same shape across re-renders. The chart is labelled _"Temperature trend (simulated ±2°C)"_ to make the nature of the data clear.

The chart is implemented as pure SVG in `TemperatureChart.jsx` with no third-party chart library, keeping the bundle lean. It uses `var(--chart-line)` and `var(--chart-grid)` CSS variables so it switches colours correctly in dark mode.

When the backend is upgraded to call OWM's `/forecast` endpoint, the `generateTrendData` function inside `TemperatureChart.jsx` can be replaced with real hourly values — the chart rendering logic does not need to change.

---

## Known Limitations

1. **Cities.json is small** — only 8 cities are included. More cities can be added but `cities.json` is treated as read-only per the spec.
2. **No database** — all state is in-memory. Restarting the backend clears the cache.
3. **No Redis** — `node-cache` is per-process. In a multi-instance deployment you'd replace it with a shared Redis cache.
4. **Auth0 free tier** — MFA and advanced login policies require certain Auth0 plan features; the free tier supports TOTP-based MFA but email OTP may require a paid plan depending on tenant settings.
5. **OWM free tier rate limit** — 60 calls/minute. With 8 cities this is well within limits, but a large city list would require batching.
6. **No HTTPS in dev** — run behind a reverse proxy (nginx/Caddy) with TLS in production.
7. **Simulated temperature trend** — the temperature charts use generated data, not real historical readings. Upgrading to OWM's `/forecast` endpoint would provide genuine 3-hour interval forecasts.
