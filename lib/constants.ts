/**
 * Centralized Application Constants for OpenWeather
 * Single source of truth for architectural limits, conversion factors, and default values.
 */

// Pinned / Bookmarked Locations
export const MAX_PINNED_CITIES = 5;

// Geocoding & Search
export const SEARCH_DEBOUNCE_MS = 250;
export const SEARCH_MIN_QUERY_LENGTH = 2;
export const SEARCH_DEFAULT_RESULT_LIMIT = 6;

// Geographic & Physics
export const EARTH_RADIUS_KM = 6371;

// Unit Conversion Multipliers
export const WIND_CONVERSIONS = {
  MS_TO_KMH: 3.6,
  MS_TO_MPH: 2.23694,
  MS_TO_KNOTS: 1.94384,
} as const;

export const PRESSURE_CONVERSIONS = {
  HPA_TO_INHG: 0.02953,
  HPA_TO_MMHG: 0.75006,
} as const;

export const PRECIPITATION_CONVERSIONS = {
  MM_TO_INCHES: 0.03937,
} as const;

// UI & Animations
export const RADAR_UPDATE_INTERVAL_MS = 300000; // 5 minutes
export const LIVE_CLOCK_INTERVAL_MS = 1000;

// LocalStorage Persistence Keys
export const STORAGE_KEYS = {
  SETTINGS: "openweather_settings_v2",
  PINNED_CITIES: "openweather_pinned_v2",
  LAST_CITY: "openweather_last_city",
  USER_SEARCHED: "openweather_user_searched",
  RECENT_VOICES: "openweather_recent_voices",
} as const;

// Default Pinned Locations
export const DEFAULT_PINNED_CITIES = ["Tokyo", "New York", "Paris"] as const;

// Application Tabs
export const APP_TABS = [
  "overview",
  "charts",
  "radar",
  "air-quality",
  "climate",
  "compare",
] as const;
export type AppTab = (typeof APP_TABS)[number];

// Settings Dialog Tabs
export const SETTINGS_TABS = [
  "locations",
  "source",
  "api",
  "units",
  "favorites",
  "localization",
  "speech",
  "appearance",
] as const;
export type SettingsTab = (typeof SETTINGS_TABS)[number];

