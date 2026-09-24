import { translateCondition } from "./translations";

export interface RegionalLanguageOption {
  code: string;
  label: string;
  englishName: string;
  region: string;
  scriptGlyph: string;
  flag: string;
  weatherConditionSample: string;
  speechPreviewText: string;
  voiceHighlights: string;
  advisoryPreview: string;
  lexicon: { key: string; val: string }[];
}

/**
 * Standard country code mapping for regional language flags.
 * Flags are synthesized dynamically using Unicode regional indicator symbols.
 */
const DEFAULT_LANG_COUNTRIES: Record<string, string> = {
  en: "US",
  es: "ES",
  fr: "FR",
  de: "DE",
  it: "IT",
  pt: "BR",
  ru: "RU",
  ja: "JP",
  ko: "KR",
  zh: "CN",
  hi: "IN",
  ar: "SA",
  bn: "BD",
  id: "ID",
  nl: "NL",
  tr: "TR",
  pl: "PL",
  vi: "VN",
  th: "TH",
  sv: "SE",
  da: "DK",
  no: "NO",
  fi: "FI",
  el: "GR",
  cs: "CZ",
  uk: "UA",
  ro: "RO",
  hu: "HU",
  he: "IL",
  ms: "MY",
  fil: "PH",
};

/**
 * Dynamically generate emoji flag from 2-letter ISO country code.
 * (e.g. "US" -> 🇺🇸, "FR" -> 🇫🇷, "JP" -> 🇯🇵)
 */
export function getFlagEmoji(countryCode: string): string {
  if (!countryCode || countryCode.length !== 2) return "🌐";
  try {
    const codePoints = countryCode
      .toUpperCase()
      .split("")
      .map((char) => 127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
  } catch {
    return "🌐";
  }
}

/**
 * Google Cloud Text-to-Speech & Google Translate official base locale identifiers.
 */
export const GOOGLE_BASE_LOCALES: string[] = [
  "en-US",
  "es-ES",
  "fr-FR",
  "de-DE",
  "it-IT",
  "pt-BR",
  "ru-RU",
  "ja-JP",
  "ko-KR",
  "zh-CN",
  "hi-IN",
  "ar-XA",
  "bn-IN",
  "id-ID",
  "nl-NL",
  "tr-TR",
  "pl-PL",
  "vi-VN",
  "th-TH",
  "sv-SE",
  "da-DK",
  "nb-NO",
  "fi-FI",
  "el-GR",
  "cs-CZ",
  "uk-UA",
  "ro-RO",
  "hu-HU",
  "he-IL",
  "ms-MY",
  "fil-PH",
];

/**
 * Dynamically builds a RegionalLanguageOption using:
 * 1. Web Standard Intl.DisplayNames for native and English names
 * 2. Unicode regional indicator symbols for country flags
 * 3. Dynamic meteorological translation from OpenWeather dictionary
 */
export function buildLanguageOption(localeCode: string): RegionalLanguageOption {
  const parts = localeCode.replace("_", "-").split("-");
  const langCode = parts[0].toLowerCase();
  const countryCode =
    (parts[1] && parts[1].length === 2 ? parts[1].toUpperCase() : null) ||
    DEFAULT_LANG_COUNTRIES[langCode] ||
    "";

  // 1. Dynamic English name resolution via Intl.DisplayNames
  let englishName = langCode;
  try {
    if (typeof Intl !== "undefined" && Intl.DisplayNames) {
      const enDisplay = new Intl.DisplayNames(["en"], { type: "language" });
      englishName = enDisplay.of(langCode) || langCode;
    }
  } catch {
    englishName = langCode.toUpperCase();
  }

  // 2. Dynamic native name resolution via Intl.DisplayNames
  let label = englishName;
  try {
    if (typeof Intl !== "undefined" && Intl.DisplayNames) {
      const nativeDisplay = new Intl.DisplayNames([langCode], { type: "language" });
      const rawNative = nativeDisplay.of(langCode);
      if (rawNative) {
        label = rawNative.charAt(0).toUpperCase() + rawNative.slice(1);
      }
    }
  } catch {
    label = englishName;
  }

  // 3. Dynamic region name resolution via Intl.DisplayNames
  let regionName = "International";
  try {
    if (countryCode && typeof Intl !== "undefined" && Intl.DisplayNames) {
      const regionDisplay = new Intl.DisplayNames(["en"], { type: "region" });
      regionName = regionDisplay.of(countryCode) || countryCode;
    }
  } catch {
    regionName = countryCode || "Global";
  }

  // 4. Dynamic emoji flag
  const flag = countryCode ? getFlagEmoji(countryCode) : "🌐";

  // 5. Dynamic script glyph
  const scriptGlyph = label.slice(0, 2);

  // 6. Dynamic meteorological condition sample using translation engine
  const conditionSample = translateCondition("Partly Cloudy", langCode);
  const weatherConditionSample = `${conditionSample} • 22°C • WNW 14 km/h`;

  // 7. Dynamic Google TTS preview text
  const speechPreviewText = `Google Text-to-Speech (${label}): ${conditionSample}. Barometric pressure is steady at 1013 hPa.`;

  // 8. Dynamic voice highlights
  const voiceHighlights = "Google Neural & Studio Synthesis";

  // 9. Dynamic advisory preview
  const advisoryPreview = `Synoptic atmospheric bulletin for ${regionName}. Stable tropospheric stratification across the observation sector.`;

  // 10. Dynamic lexicon
  const lexicon = [
    { key: "Precipitation", val: translateCondition("Rain", langCode) || "Precipitation" },
    { key: "Severe Alert", val: translateCondition("Thunderstorm", langCode) || "Severe Alert" },
    { key: "Barometer", val: "Barometric Tendency" },
  ];

  return {
    code: langCode,
    label,
    englishName,
    region: regionName,
    scriptGlyph,
    flag,
    weatherConditionSample,
    speechPreviewText,
    voiceHighlights,
    advisoryPreview,
    lexicon,
  };
}

/**
 * Dynamically generated language options list from Google Cloud & Translate locales.
 */
export const GOOGLE_LANGUAGES: RegionalLanguageOption[] = GOOGLE_BASE_LOCALES.map((loc) =>
  buildLanguageOption(loc)
);

/**
 * Query client browser Web Speech API for available installed speech voices.
 */
export function getBrowserSpeechLocales(): string[] {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return [];
  try {
    const voices = window.speechSynthesis.getVoices();
    return Array.from(new Set(voices.map((v) => v.lang).filter(Boolean)));
  } catch {
    return [];
  }
}

/**
 * Merges the base locales with the browser's speech synthesis locales,
 * synthesizing any newly discovered locales on-the-fly.
 */
export async function fetchLiveGoogleLanguages(): Promise<RegionalLanguageOption[]> {
  const discovered = new Set<string>(GOOGLE_BASE_LOCALES);

  // 1. Incorporate browser speech synthesis locales
  getBrowserSpeechLocales().forEach((loc) => discovered.add(loc));

  const map = new Map<string, RegionalLanguageOption>();
  for (const loc of discovered) {
    const opt = buildLanguageOption(loc);
    if (!map.has(opt.code)) {
      map.set(opt.code, opt);
    }
  }

  return Array.from(map.values());
}

/**
 * Lookup Google regional language option dynamically, with automatic on-the-fly creation.
 */
export function getGoogleLanguage(code?: string): RegionalLanguageOption {
  if (!code) return GOOGLE_LANGUAGES[0];
  const shortCode = code.split("-")[0].toLowerCase();
  const matched =
    GOOGLE_LANGUAGES.find((lang) => lang.code === shortCode) ||
    GOOGLE_LANGUAGES.find((lang) => lang.code.toLowerCase() === code.toLowerCase());

  return matched || buildLanguageOption(code);
}
