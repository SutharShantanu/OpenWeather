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

// Speech & Audio (Gemini TTS)
export const DEFAULT_GOOGLE_AI_KEY = "";

export const DEFAULT_GEMINI_TTS_MODEL = "gemini-2.5-flash-preview-tts";
export const DEFAULT_GEMINI_TTS_VOICE = "Kore";
export const DEFAULT_GEMINI_SAMPLE_RATE = 24000;

// UI & Animations
export const RADAR_UPDATE_INTERVAL_MS = 300000; // 5 minutes
export const LIVE_CLOCK_INTERVAL_MS = 1000;
