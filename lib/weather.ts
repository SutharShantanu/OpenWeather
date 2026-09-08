export type WeatherConditionType =
  | "SUNNY"
  | "CLEAR_NIGHT"
  | "CLOUDY"
  | "PARTLY_CLOUDY_DAY"
  | "PARTLY_CLOUDY_NIGHT"
  | "RAIN"
  | "HEAVY_RAIN"
  | "SNOW"
  | "STORM"
  | "FOG"
  | "WINDY";

export interface AirQualityData {
  aqi: number; // 1 = Good, 2 = Fair, 3 = Moderate, 4 = Poor, 5 = Very Poor
  usAqi?: number; // US EPA standard AQI (0-500)
  europeanAqi?: number; // European standard EAQI (0-100+)
  co: number; // Carbon monoxide (µg/m3)
  no: number; // Nitrogen monoxide (µg/m3)
  no2: number; // Nitrogen dioxide (µg/m3)
  o3: number; // Ozone (µg/m3)
  so2: number; // Sulphur dioxide (µg/m3)
  pm2_5: number; // Fine particles (µg/m3)
  pm10: number; // Coarse particles (µg/m3)
  nh3: number; // Ammonia (µg/m3)
}

export interface MoonInfo {
  phase: number; // 0 to 1
  illumination: number; // 0 to 100%
  name: string; // e.g. "Waxing Crescent", "Full Moon"
}

export interface CurrentWeather {
  cityName: string;
  country: string;
  lat: number;
  lon: number;
  temp: number; // Celsius
  feelsLike: number;
  tempMin: number;
  tempMax: number;
  humidity: number; // %
  pressure: number; // hPa
  windSpeed: number; // m/s
  windDeg: number; // degrees
  windGusts?: number; // m/s
  clouds: number; // %
  visibility: number; // meters
  uvIndex?: number; // 0 to 12+
  dewPoint?: number; // Celsius
  condition: {
    type: WeatherConditionType;
    main: string;
    description: string;
    icon: string;
  };
  sunrise: number; // Unix timestamp
  sunset: number; // Unix timestamp
  dt: number; // Unix timestamp
  moon?: MoonInfo;
  airQuality?: AirQualityData;
}

export interface HourlyForecastItem {
  time: string; // e.g. "12:00"
  timestamp: number;
  temp: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  windGusts?: number;
  uvIndex?: number;
  dewPoint?: number;
  cloudCover?: number;
  conditionType: WeatherConditionType;
  description: string;
  pop: number; // Probability of precipitation (0 to 1)
}

export interface DailyForecastItem {
  day: string; // e.g. "MON", "TODAY"
  date: string;
  tempMin: number;
  tempMax: number;
  conditionType: WeatherConditionType;
  description: string;
  pop: number;
  humidity: number;
  windSpeed: number;
  windGusts?: number;
  uvIndexMax?: number;
  sunrise?: number;
  sunset?: number;
}

export interface WeatherAlert {
  id: string;
  source: string;
  event: string;
  headline: string;
  severity: "Extreme" | "Severe" | "Moderate" | "Minor";
  urgency?: "Immediate" | "Expected" | "Future";
  areas?: string;
  instruction: string;
  effective?: string;
  expires?: string;
}

export type WeatherDataSource = "open-meteo" | "openweathermap" | "simulation" | "auto";

export type ForecastStationModel =
  | "best_match"
  | "ecmwf_ifs025"
  | "gfs_seamless"
  | "icon_seamless"
  | "gem_seamless"
  | "meteofrance_seamless"
  | "jma_seamless";

export interface ForecastStationInfo {
  id: ForecastStationModel;
  name: string;
  agency: string;
  resolution: string;
  coverage: string;
  description: string;
}

export const FORECAST_STATION_MODELS: ForecastStationInfo[] = [
  {
    id: "best_match",
    name: "WMO Best Match Consensus",
    agency: "Multi-Model Ensemble",
    resolution: "Auto (1-11 km)",
    coverage: "Global",
    description: "Intelligently blends optimal high-resolution meteorological models for coordinates.",
  },
  {
    id: "ecmwf_ifs025",
    name: "ECMWF IFS (9 km)",
    agency: "European Centre for Medium-Range Weather Forecasts",
    resolution: "9 km",
    coverage: "Global",
    description: "World gold standard for medium-range atmospheric physics and numerical simulation.",
  },
  {
    id: "gfs_seamless",
    name: "NOAA GFS (13 km)",
    agency: "US National Oceanic & Atmospheric Administration",
    resolution: "13 km",
    coverage: "Global",
    description: "Operational global numerical weather prediction run by the US National Weather Service.",
  },
  {
    id: "icon_seamless",
    name: "DWD ICON (13 km)",
    agency: "Deutscher Wetterdienst (Germany)",
    resolution: "13 km",
    coverage: "Global / Europe",
    description: "Advanced non-hydrostatic atmospheric modeling with precision precipitation dynamics.",
  },
  {
    id: "meteofrance_seamless",
    name: "Météo-France (ARPEGE / AROME)",
    agency: "Météo-France",
    resolution: "2.5-10 km",
    coverage: "Europe & Global",
    description: "High-resolution mesoscale weather prediction with superior convection physics.",
  },
  {
    id: "gem_seamless",
    name: "GEM Global (15 km)",
    agency: "Environment and Climate Change Canada",
    resolution: "15 km",
    coverage: "Global",
    description: "Canadian Meteorological Centre operational numerical weather prediction system.",
  },
  {
    id: "jma_seamless",
    name: "JMA MSM (5 km)",
    agency: "Japan Meteorological Agency",
    resolution: "5 km",
    coverage: "East Asia & Pacific",
    description: "High-resolution meso-scale numerical forecast model with optimized storm tracking.",
  },
];

export interface WeatherDataProviderInfo {
  id: WeatherDataSource;
  name: string;
  provider: string;
  status: "active" | "ready";
  requiresApiKey: boolean;
  description: string;
}

export const WEATHER_DATA_PROVIDERS: WeatherDataProviderInfo[] = [
  {
    id: "open-meteo",
    name: "Open-Meteo High-Resolution",
    provider: "Open-Meteo GmbH & WMO Consensus",
    status: "active",
    requiresApiKey: false,
    description: "10-day outlook, 1-hour resolution, hourly UV & air quality. No API key required.",
  },
  {
    id: "openweathermap",
    name: "OpenWeatherMap Live API",
    provider: "OpenWeather Ltd (OWM 2.5)",
    status: "ready",
    requiresApiKey: true,
    description: "Global weather station network, 5-day forecast, air pollution telemetry.",
  },
  {
    id: "simulation",
    name: "Autonomous Synoptic Simulator",
    provider: "Local Mathematical Physics Engine",
    status: "ready",
    requiresApiKey: false,
    description: "Deterministic atmospheric modeling for offline testing and calibration.",
  },
  {
    id: "auto",
    name: "Auto Consensus & Failover",
    provider: "Dynamic Multi-Engine Failover",
    status: "active",
    requiresApiKey: false,
    description: "Attempts Open-Meteo with chosen station model, then OWM, then simulator.",
  },
];

export interface WeatherData {
  current: CurrentWeather;
  hourly: HourlyForecastItem[];
  daily: DailyForecastItem[];
  alerts?: WeatherAlert[];
  dataSource: "LIVE_API" | "MOCK_FALLBACK";
  providerName?: string;
  stationName?: string;
}

export const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY || "";

export function mapOpenWeatherCondition(icon: string, main: string): WeatherConditionType {
  const isNight = icon.endsWith("n");
  const id = main.toLowerCase();

  if (id.includes("thunderstorm")) return "STORM";
  if (id.includes("drizzle") || id.includes("rain")) {
    return icon.includes("10") || icon.includes("09") ? "HEAVY_RAIN" : "RAIN";
  }
  if (id.includes("snow")) return "SNOW";
  if (id.includes("mist") || id.includes("smoke") || id.includes("haze") || id.includes("dust") || id.includes("fog")) {
    return "FOG";
  }
  if (id.includes("clear")) {
    return isNight ? "CLEAR_NIGHT" : "SUNNY";
  }
  if (id.includes("cloud")) {
    if (icon.includes("02") || icon.includes("03")) {
      return isNight ? "PARTLY_CLOUDY_NIGHT" : "PARTLY_CLOUDY_DAY";
    }
    return "CLOUDY";
  }
  return "CLOUDY";
}

export function mapWmoCode(code: number, isDay: boolean = true): { type: WeatherConditionType; label: string } {
  switch (code) {
    case 0:
      return { type: isDay ? "SUNNY" : "CLEAR_NIGHT", label: isDay ? "Clear Sky" : "Clear Night" };
    case 1:
      return { type: isDay ? "PARTLY_CLOUDY_DAY" : "PARTLY_CLOUDY_NIGHT", label: "Mainly Clear" };
    case 2:
      return { type: isDay ? "PARTLY_CLOUDY_DAY" : "PARTLY_CLOUDY_NIGHT", label: "Partly Cloudy" };
    case 3:
      return { type: "CLOUDY", label: "Overcast" };
    case 45:
    case 48:
      return { type: "FOG", label: "Fog & Depositing Rime" };
    case 51:
    case 53:
    case 55:
      return { type: "RAIN", label: "Drizzle" };
    case 56:
    case 57:
      return { type: "RAIN", label: "Freezing Drizzle" };
    case 61:
    case 63:
      return { type: "RAIN", label: "Rain" };
    case 65:
      return { type: "HEAVY_RAIN", label: "Heavy Rain" };
    case 66:
    case 67:
      return { type: "RAIN", label: "Freezing Rain" };
    case 71:
    case 73:
    case 75:
    case 77:
      return { type: "SNOW", label: "Snow" };
    case 80:
    case 81:
      return { type: "RAIN", label: "Rain Showers" };
    case 82:
      return { type: "HEAVY_RAIN", label: "Violent Rain Showers" };
    case 85:
    case 86:
      return { type: "SNOW", label: "Snow Showers" };
    case 95:
      return { type: "STORM", label: "Thunderstorm" };
    case 96:
    case 99:
      return { type: "STORM", label: "Severe Thunderstorm" };
    default:
      return { type: isDay ? "PARTLY_CLOUDY_DAY" : "PARTLY_CLOUDY_NIGHT", label: "Variable" };
  }
}

export function calculateMoonInfo(date: Date = new Date()): MoonInfo {
  const LUNAR_CYCLE = 29.53058770576 * 86400;
  const KNOWN_NEW_MOON = 947182440; // Jan 6 2000 18:14 UTC in seconds
  const nowSec = date.getTime() / 1000;
  let diff = (nowSec - KNOWN_NEW_MOON) % LUNAR_CYCLE;
  if (diff < 0) diff += LUNAR_CYCLE;
  const phase = diff / LUNAR_CYCLE;
  const illumination = Math.round(((1 - Math.cos(phase * 2 * Math.PI)) / 2) * 100);

  let name = "New Moon";
  if (phase < 0.03 || phase >= 0.97) name = "New Moon";
  else if (phase < 0.22) name = "Waxing Crescent";
  else if (phase < 0.28) name = "First Quarter";
  else if (phase < 0.47) name = "Waxing Gibbous";
  else if (phase < 0.53) name = "Full Moon";
  else if (phase < 0.72) name = "Waning Gibbous";
  else if (phase < 0.78) name = "Last Quarter";
  else name = "Waning Crescent";

  return { phase, illumination, name };
}

export function getUvClassification(uv: number): {
  label: string;
  risk: "Low" | "Moderate" | "High" | "Very High" | "Extreme";
  color: string;
  advice: string;
} {
  const rounded = Math.round(uv * 10) / 10;
  if (rounded < 3) {
    return {
      label: `${rounded} Low`,
      risk: "Low",
      color: "text-emerald-500",
      advice: "No special protection required. Safe for outdoor activities.",
    };
  }
  if (rounded < 6) {
    return {
      label: `${rounded} Moderate`,
      risk: "Moderate",
      color: "text-amber-500",
      advice: "Wear sunglasses, hat, and SPF 30+ sunscreen during midday hours.",
    };
  }
  if (rounded < 8) {
    return {
      label: `${rounded} High`,
      risk: "High",
      color: "text-orange-500",
      advice: "Reduce sun exposure between 10 AM and 4 PM. Seek shade and use SPF 50.",
    };
  }
  if (rounded < 11) {
    return {
      label: `${rounded} Very High`,
      risk: "Very High",
      color: "text-rose-500",
      advice: "Rapid skin damage possible. Minimize direct sun exposure and wear protective clothing.",
    };
  }
  return {
    label: `${rounded} Extreme`,
    risk: "Extreme",
    color: "text-purple-500",
    advice: "Dangerous radiation. Avoid going outdoors in full sunlight. Unprotected skin burns in minutes.",
  };
}

export function cToF(celsius: number): number {
  return (celsius * 9) / 5 + 32;
}

export function fToC(fahrenheit: number): number {
  return ((fahrenheit - 32) * 5) / 9;
}

export function formatTemperature(celsius: number, unit: "C" | "F"): number {
  return unit === "F" ? Math.round(cToF(celsius)) : Math.round(celsius);
}

export function getBeaufortScale(mps: number): { scale: number; label: string } {
  if (mps < 0.5) return { scale: 0, label: "Calm" };
  if (mps < 1.6) return { scale: 1, label: "Light Air" };
  if (mps < 3.4) return { scale: 2, label: "Light Breeze" };
  if (mps < 5.5) return { scale: 3, label: "Gentle Breeze" };
  if (mps < 8.0) return { scale: 4, label: "Moderate Breeze" };
  if (mps < 10.8) return { scale: 5, label: "Fresh Breeze" };
  if (mps < 13.9) return { scale: 6, label: "Strong Breeze" };
  if (mps < 17.2) return { scale: 7, label: "High Wind" };
  if (mps < 20.8) return { scale: 8, label: "Gale" };
  if (mps < 24.5) return { scale: 9, label: "Strong Gale" };
  if (mps < 28.5) return { scale: 10, label: "Storm" };
  if (mps < 32.7) return { scale: 11, label: "Violent Storm" };
  return { scale: 12, label: "Hurricane" };
}

export function getWindDirection(degrees: number): string {
  const directions = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
  const index = Math.round((degrees % 360) / 22.5) % 16;
  return directions[index];
}

export function calculateHeatIndex(tempC: number, humidity: number): number {
  if (tempC < 20) return tempC;
  const t = (tempC * 9) / 5 + 32;
  const rh = humidity;
  const hi = 0.5 * (t + 61.0 + (t - 68.0) * 1.2 + rh * 0.094);
  return ((hi - 32) * 5) / 9;
}

export function getAQIClassification(aqi: number): {
  label: string;
  description: string;
  color: string;
} {
  switch (aqi) {
    case 1:
      return { label: "Good", description: "Air quality is satisfactory with minimal risk.", color: "text-emerald-500" };
    case 2:
      return { label: "Fair", description: "Acceptable quality; minor irritation possible for sensitive groups.", color: "text-sky-500" };
    case 3:
      return { label: "Moderate", description: "General public may experience slight discomfort.", color: "text-amber-500" };
    case 4:
      return { label: "Poor", description: "Health alert: sensitive individuals may experience adverse symptoms.", color: "text-orange-500" };
    case 5:
    default:
      return { label: "Very Poor", description: "Emergency conditions: entire population likely affected.", color: "text-red-500" };
  }
}

export type WindSpeedUnit = "m/s" | "km/h" | "mph" | "knots";
export type PressureUnit = "hPa" | "inHg" | "mmHg";
export type PrecipitationUnit = "mm" | "in";
export type TimeFormat = "12h" | "24h";

export function formatWind(mps: number, unit: WindSpeedUnit = "m/s"): { val: number; unitStr: string } {
  switch (unit) {
    case "km/h":
      return { val: Math.round(mps * 3.6 * 10) / 10, unitStr: "km/h" };
    case "mph":
      return { val: Math.round(mps * 2.23694 * 10) / 10, unitStr: "mph" };
    case "knots":
      return { val: Math.round(mps * 1.94384 * 10) / 10, unitStr: "kn" };
    case "m/s":
    default:
      return { val: Math.round(mps * 10) / 10, unitStr: "m/s" };
  }
}

export function formatPressure(hpa: number, unit: PressureUnit = "hPa"): { val: number; unitStr: string } {
  switch (unit) {
    case "inHg":
      return { val: Math.round(hpa * 0.02953 * 100) / 100, unitStr: "inHg" };
    case "mmHg":
      return { val: Math.round(hpa * 0.75006), unitStr: "mmHg" };
    case "hPa":
    default:
      return { val: Math.round(hpa), unitStr: "hPa" };
  }
}

export function formatPrecip(mm: number, unit: PrecipitationUnit = "mm"): { val: number; unitStr: string } {
  switch (unit) {
    case "in":
      return { val: Math.round(mm * 0.03937 * 100) / 100, unitStr: "in" };
    case "mm":
    default:
      return { val: Math.round(mm * 10) / 10, unitStr: "mm" };
  }
}

