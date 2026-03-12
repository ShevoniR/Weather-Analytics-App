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
│           └── weatherService.js     # OWM fetch + orchestration
└── frontend/
    ├── package.json
    ├── .env.example
    └── src/
        ├── index.js                   # React entry point
        ├── App.js                     # Auth-based routing
        ├── context/
        │   └── AuthProvider.jsx       # Auth0Provider wrapper
        ├── services/
        │   └── weatherApi.js          # API calls to backend
        └── pages/
            ├── LoginPage.jsx          # Unauthenticated view
            └── Dashboard.jsx          # Main authenticated view
        └── components/
            └── CityCard.jsx           # Per-city weather + score card
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

## Known Limitations

1. **Cities.json is small** — only 8 cities are included. More cities can be added but `cities.json` is treated as read-only per the spec.
2. **No database** — all state is in-memory. Restarting the backend clears the cache.
3. **No Redis** — `node-cache` is per-process. In a multi-instance deployment you'd replace it with a shared Redis cache.
4. **Auth0 free tier** — MFA and advanced login policies require certain Auth0 plan features; the free tier supports TOTP-based MFA but email OTP may require a paid plan depending on tenant settings.
5. **OWM free tier rate limit** — 60 calls/minute. With 8 cities this is well within limits, but a large city list would require batching.
6. **No HTTPS in dev** — run behind a reverse proxy (nginx/Caddy) with TLS in production.
