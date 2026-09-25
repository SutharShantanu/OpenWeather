import type {
  WeatherDataSource,
  ForecastStationModel,
  WindSpeedUnit,
  PressureUnit,
  PrecipitationUnit,
  TimeFormat,
} from "./weather";

export interface LocationConfig {
  defaultCity: string;
  defaultLat: number;
  defaultLon: number;
  defaultCountry: string;
  popularCities: string[];
}

export interface ApiEndpointsConfig {
  openWeatherApiBaseUrl: string;
  openWeatherGeoBaseUrl: string;
  openMeteoApiBaseUrl: string;
  openMeteoGeoBaseUrl: string;
  openMeteoAirQualityBaseUrl: string;
  openMeteoArchiveBaseUrl: string;
  bigDataCloudGeoBaseUrl: string;
  rainViewerApiBaseUrl: string;
  rainViewerTileBaseUrl: string;
  cartoCdnTileBaseUrl: string;
  openStreetMapTileBaseUrl: string;
}

export interface ApiKeysConfig {
  openWeatherApiKey: string;
  cartoApiKey: string;
}

export interface SettingsDefaultsConfig {
  defaultWeatherSource: WeatherDataSource;
  defaultForecastStation: ForecastStationModel;
  defaultTempUnit: "C" | "F";
  defaultWindUnit: WindSpeedUnit;
  defaultPressureUnit: PressureUnit;
  defaultPrecipUnit: PrecipitationUnit;
  defaultLanguage: string;
  defaultTimeFormat: TimeFormat;
  defaultDateFormat: "iso" | "intl" | "us";
  defaultCoordinateFormat: "decimal" | "dms";
  defaultTtsSpeed: number;
  defaultTtsPitch: number;
  defaultTtsVolume: number;
}

export interface AppConfig {
  location: LocationConfig;
  api: ApiEndpointsConfig;
  keys: ApiKeysConfig;
  settings: SettingsDefaultsConfig;
}

const DEFAULT_POPULAR_CITIES = [
  "London",
  "Tokyo",
  "New York",
  "Paris",
  "Zurich",
  "Sydney",
  "Singapore",
  "Reykjavik",
  "Dubai",
  "Mumbai",
  "Toronto",
  "Berlin",
];

function getPopularCities(): string[] {
  const envCities = process.env.NEXT_PUBLIC_POPULAR_CITIES;
  if (!envCities) return DEFAULT_POPULAR_CITIES;
  const parsed = envCities
    .split(",")
    .map((c) => c.trim())
    .filter(Boolean);
  return parsed.length > 0 ? parsed : DEFAULT_POPULAR_CITIES;
}

export const CONFIG: AppConfig = {
  location: {
    defaultCity: process.env.NEXT_PUBLIC_DEFAULT_CITY || "",
    defaultLat: process.env.NEXT_PUBLIC_DEFAULT_LAT
      ? parseFloat(process.env.NEXT_PUBLIC_DEFAULT_LAT)
      : 0,
    defaultLon: process.env.NEXT_PUBLIC_DEFAULT_LON
      ? parseFloat(process.env.NEXT_PUBLIC_DEFAULT_LON)
      : 0,
    defaultCountry: process.env.NEXT_PUBLIC_DEFAULT_COUNTRY || "",
    popularCities: getPopularCities(),
  },
  api: {
    openWeatherApiBaseUrl:
      (typeof process !== "undefined" && process.env.OPENWEATHER_API_BASE_URL) ||
      "https://api.openweathermap.org",
    openWeatherGeoBaseUrl:
      (typeof process !== "undefined" && process.env.OPENWEATHER_GEO_BASE_URL) ||
      "https://api.openweathermap.org/geo/1.0",
    openMeteoApiBaseUrl:
      (typeof process !== "undefined" && process.env.OPEN_METEO_API_BASE_URL) ||
      "https://api.open-meteo.com/v1",
    openMeteoGeoBaseUrl:
      (typeof process !== "undefined" && process.env.OPEN_METEO_GEO_BASE_URL) ||
      "https://geocoding-api.open-meteo.com/v1",
    openMeteoAirQualityBaseUrl:
      (typeof process !== "undefined" && process.env.OPEN_METEO_AIR_QUALITY_BASE_URL) ||
      "https://air-quality-api.open-meteo.com/v1",
    openMeteoArchiveBaseUrl:
      (typeof process !== "undefined" && process.env.OPEN_METEO_ARCHIVE_BASE_URL) ||
      "https://archive-api.open-meteo.com/v1",
    bigDataCloudGeoBaseUrl:
      (typeof process !== "undefined" && process.env.BIGDATACLOUD_GEO_BASE_URL) ||
      "https://api.bigdatacloud.net/data",
    rainViewerApiBaseUrl:
      process.env.NEXT_PUBLIC_RAINVIEWER_API_BASE_URL || "https://api.rainviewer.com",
    rainViewerTileBaseUrl:
      process.env.NEXT_PUBLIC_RAINVIEWER_TILE_BASE_URL || "https://tilecache.rainviewer.com",
    cartoCdnTileBaseUrl:
      process.env.NEXT_PUBLIC_CARTOCDN_TILE_BASE_URL || "https://{s}.basemaps.cartocdn.com",
    openStreetMapTileBaseUrl:
      process.env.NEXT_PUBLIC_OPENSTREETMAP_TILE_BASE_URL ||
      "https://{s}.tile.openstreetmap.org",
  },
  keys: {
    openWeatherApiKey:
      (typeof process !== "undefined" && process.env.OPENWEATHER_API_KEY) || "",
    cartoApiKey:
      process.env.NEXT_PUBLIC_CARTO_API_KEY || "",
  },
  settings: {
    defaultWeatherSource:
      (process.env.NEXT_PUBLIC_DEFAULT_WEATHER_SOURCE as WeatherDataSource) || "open-meteo",
    defaultForecastStation:
      (process.env.NEXT_PUBLIC_DEFAULT_FORECAST_STATION as ForecastStationModel) || "best_match",
    defaultTempUnit:
      (process.env.NEXT_PUBLIC_DEFAULT_TEMP_UNIT as "C" | "F") || "C",
    defaultWindUnit:
      (process.env.NEXT_PUBLIC_DEFAULT_WIND_UNIT as WindSpeedUnit) || "km/h",
    defaultPressureUnit:
      (process.env.NEXT_PUBLIC_DEFAULT_PRESSURE_UNIT as PressureUnit) || "hPa",
    defaultPrecipUnit:
      (process.env.NEXT_PUBLIC_DEFAULT_PRECIP_UNIT as PrecipitationUnit) || "mm",
    defaultLanguage: process.env.NEXT_PUBLIC_DEFAULT_LANGUAGE || "en",
    defaultTimeFormat:
      (process.env.NEXT_PUBLIC_DEFAULT_TIME_FORMAT as TimeFormat) || "24h",
    defaultDateFormat:
      (process.env.NEXT_PUBLIC_DEFAULT_DATE_FORMAT as "iso" | "intl" | "us") || "iso",
    defaultCoordinateFormat:
      (process.env.NEXT_PUBLIC_DEFAULT_COORDINATE_FORMAT as "decimal" | "dms") || "decimal",
    defaultTtsSpeed: process.env.NEXT_PUBLIC_DEFAULT_TTS_SPEED
      ? parseFloat(process.env.NEXT_PUBLIC_DEFAULT_TTS_SPEED)
      : 1.0,
    defaultTtsPitch: process.env.NEXT_PUBLIC_DEFAULT_TTS_PITCH
      ? parseFloat(process.env.NEXT_PUBLIC_DEFAULT_TTS_PITCH)
      : 0.0,
    defaultTtsVolume: process.env.NEXT_PUBLIC_DEFAULT_TTS_VOLUME
      ? parseFloat(process.env.NEXT_PUBLIC_DEFAULT_TTS_VOLUME)
      : 0.0,
  },
};
