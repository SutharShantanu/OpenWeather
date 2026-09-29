# OpenWeather

A weather dashboard built with Next.js (App Router), React 19, Tailwind CSS v4 and shadcn/ui.

It shows current conditions, hourly and daily forecasts, charts, a precipitation radar, air quality, climate normals and a side-by-side city comparison. It can also read the weather out loud with free neural voices.

## Features

- **Weather sources:** Open-Meteo (default, no key), OpenWeatherMap (needs an API key), or a built-in simulator. Open-Meteo lets you pick the forecast model (ECMWF, GFS, ICON and others).
- **Location:** GPS, then IP-based detection, then a configurable default city. City search, pinned cities and nearby stations.
- **Radar:** RainViewer tiles on a Leaflet map (CARTO or OpenStreetMap basemaps).
- **Speech:** weather briefings through Microsoft Edge neural voices (no key needed).
- **Settings:** units, regional formats, theme, data source, API keys, speech and favorites. Stored in `localStorage` and synced across tabs; dialogs and tabs are reflected in the URL.
- **Languages:** 31 UI languages are listed. Only Hindi is complete; several others are partial and fall back to English.

## Getting started

Requires Node.js 20.9 or newer.

```bash
npm install
cp .env.example .env.local   # optional, every value has a default
npm run dev
```

Open http://localhost:3000.

## Configuration

All variables are documented in [`.env.example`](.env.example). None are required. The ones you are most likely to set:

| Variable | Purpose |
| --- | --- |
| `OPENWEATHER_API_KEY` | Server-side OpenWeatherMap key. Users can also enter their own key in Settings. |
| `NEXT_PUBLIC_CARTO_API_KEY` | CARTO basemap key; removes the watermark on the Dark/Voyager map styles. |
| `NEXT_PUBLIC_DEFAULT_WEATHER_SOURCE` | `open-meteo`, `openweathermap`, `simulation` or `auto`. |
| `NEXT_PUBLIC_DEFAULT_CITY` / `_LAT` / `_LON` | Fallback location when detection fails. |
| `*_BASE_URL` | Override upstream API hosts (for proxies or mirrors). |

`NEXT_PUBLIC_*` values are embedded in the browser bundle, so never put secrets in them.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` / `npm start` | Production build / serve it |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript, no emit |
| `npm run format` | Prettier |

CI (`.github/workflows/ci.yml`) runs lint, typecheck, build and `npm audit` on every push to `main` and on pull requests.

## API routes

All routes live in `app/api/` and are public.

| Route | Purpose |
| --- | --- |
| `GET /api/weather` | Current conditions and forecasts. Params: `city` or `lat`+`lon`, `source`, `station`, `lang`. Optional `x-owm-api-key` header. |
| `GET /api/search` | City search / geocoding |
| `GET /api/location` | Approximate location from request headers / IP |
| `GET /api/nearby` | Nearby cities for a coordinate |
| `GET /api/climate` | Normals and records for today from the last 10 years |
| `POST /api/tts` | Text to speech (Edge neural voices), max 5000 characters |

Invalid input returns `400`. When an upstream provider fails, the routes return an error (`404`/`502`/`503`) instead of made-up data. Simulated data is only served when `source=simulation` is requested.

`proxy.ts` rate-limits `/api/*` per IP (60 requests/minute, 20 for TTS).

## Deployment notes

- **Rate limiting is in memory**, so each server instance keeps its own counters. For multiple instances or serverless, use a shared store (Redis/Upstash) or your platform's firewall rules.
- **Client IPs** come from `x-forwarded-for`. Only trust this behind a proxy that overwrites the header (Vercel, Cloudflare, Nginx).
- **Edge TTS** uses Microsoft's unofficial endpoint. It may be throttled or change without notice.

## Project structure

```
app/            routes, layout, API handlers, error boundaries
components/     UI (components/ui = shadcn primitives, components/settings = settings dialog)
hooks/          client hooks (weather fetching, URL sync, settings, TTS player)
lib/            config, weather types and mapping, formatting, translations
messages/       UI strings per language (en.json is the source)
proxy.ts        API rate limiting
```

To add a shadcn component: `npx shadcn@latest add <name>`.
