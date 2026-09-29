export const SUPPORTED_UI_LANGUAGES = [
  "en",
  "es",
  "fr",
  "de",
  "it",
  "pt",
  "ru",
  "ja",
  "ko",
  "zh",
  "hi",
  "ar",
  "bn",
  "id",
  "nl",
  "tr",
  "pl",
  "vi",
  "th",
  "sv",
  "da",
  "nb",
  "fi",
  "el",
  "cs",
  "uk",
  "ro",
  "hu",
  "he",
  "ms",
  "fil",
] as const;

export type SupportedLanguage = (typeof SUPPORTED_UI_LANGUAGES)[number];

export interface Translations {
  common: {
    stationTelemetryActive: string;
    retry: string;
    weatherUnavailableTitle: string;
    weatherUnavailableDesc: string;
    dataUnavailable: string;
    approximateLocation: string;
    offline: string;
    source: string;
    change: string;
    refresh: string;
    pressure: string;
    feelsLike: string;
    synopticTime: string;
    stationTelemetry: string;
    loading: string;
    searchPlaceholder: string;
    briefing: string;
    playing: string;
    preparing: string;
    settings: string;
    locateMe: string;
    locating: string;
    clear: string;
    reset: string;
    done: string;
    save: string;
    saved: string;
    cancel: string;
    today: string;
    now: string;
    high: string;
    low: string;
    shareStation: string;
    copied: string;
    advisorySystem: string;
    noActiveAlerts: string;
    activeBulletin: string;
    precip: string;
    sourceTooltip: string;
    simulatedSensor: string;
    consoleFooter: string;
  };
  tabs: {
    overview: string;
    charts: string;
    radar: string;
    airQuality: string;
    climate: string;
    compare: string;
  };
  hero: {
    min: string;
    max: string;
    wind: string;
    humidity: string;
    barometer: string;
    visibility: string;
    dewPoint: string;
    uvIndex: string;
    clouds: string;
  };
  forecast: {
    hourlyTitle: string;
    hourlyDesc: string;
    dailyTitle: string;
    dailyDesc: string;
    tenDayOutlook: string;
    pop: string;
    oneHourPrecision: string;
    cards: string;
    curve: string;
  };
  days: {
    MON: string;
    TUE: string;
    WED: string;
    THU: string;
    FRI: string;
    SAT: string;
    SUN: string;
    TODAY: string;
  };
  conditions: Record<string, string>;
  widgets: {
    wind: {
      title: string;
      subtitle: string;
      speed: string;
      gusts: string;
      direction: string;
      calm: string;
      lightBreeze: string;
      moderateBreeze: string;
      freshBreeze: string;
      strongBreeze: string;
      gale: string;
      storm: string;
      beaufortScale: string;
      forceScale: (scale: number) => string;
    };
    humidity: {
      title: string;
      subtitle: string;
      relativeHumidity: string;
      dewPoint: string;
      dry: string;
      comfortable: string;
      humid: string;
      veryHumid: string;
      heatIndex: string;
    };
    airQuality: {
      title: string;
      subtitle: string;
      index: string;
      good: string;
      moderate: string;
      sensitive: string;
      unhealthy: string;
      veryUnhealthy: string;
      hazardous: string;
      scale: string;
      level1Desc: string;
      level2Desc: string;
      level3Desc: string;
      level4Desc: string;
      level5Desc: string;
    };
    solar: {
      title: string;
      subtitle: string;
      sunrise: string;
      sunset: string;
      dayLength: string;
      solarNoon: string;
      dawn: string;
      dusk: string;
      lunarSubtitle: string;
      sunTab: string;
      moonTab: string;
      sunAboveHorizon: string;
      nightCycle: string;
      lunarPhase: string;
      illumination: (percent: number) => string;
      cyclePhase: string;
      skyVisibility: string;
      brightSky: string;
      darkSky: string;
    };
    uv: {
      title: string;
      subtitle: string;
      low: string;
      moderate: string;
      high: string;
      veryHigh: string;
      extreme: string;
      protectionRequired: string;
      currentIntensity: string;
      dailyPeak: string;
      burnTime: string;
      recommendedSpf: string;
      lowAdvice: string;
      moderateAdvice: string;
      highAdvice: string;
      veryHighAdvice: string;
      extremeAdvice: string;
      burnTimeOver60: string;
      burnTime40: string;
      burnTime25: string;
      burnTime15: string;
      burnTimeUnder10: string;
    };
  };
  settingsDialog: {
    title: string;
    subtitle: string;
    tabSource: string;
    tabLocations: string;
    tabApi: string;
    tabUnits: string;
    tabFavorites: string;
    tabRegional: string;
    tabSpeech: string;
    tabTheme: string;
    resetDefaults: string;
    done: string;
    regional: {
      headerTitle: string;
      headerSubtitle: string;
      langTitle: string;
      langDesc: string;
      selectLanguagePlaceholder: string;
      timeTitle: string;
      timeDesc: string;
      time24Label: string;
      time24Desc: string;
      time12Label: string;
      time12Desc: string;
      dateTitle: string;
      dateDesc: string;
      coordTitle: string;
      coordDesc: string;
      clock: string;
      zulu: string;
      pattern: string;
      preview: string;
      system: string;
      sample: string;
      searchLanguagePlaceholder: string;
      noLanguageFound: string;
      voiceOnly: string;
      uiFallbackNotice: (languageName: string) => string;
      dateFormats: { iso: string; intl: string; us: string };
      coordFormats: { decimal: string; dms: string };
    };
    units: {
      headerTitle: string;
      headerSubtitle: string;
      tempTitle: string;
      tempDesc: string;
      windTitle: string;
      windDesc: string;
      pressureTitle: string;
      pressureDesc: string;
      precipTitle: string;
      precipDesc: string;
      presets: { metric: string; imperial: string; custom: string };
      selectTempPlaceholder: string;
      selectWindPlaceholder: string;
      selectPressurePlaceholder: string;
      selectPrecipPlaceholder: string;
      options: {
        temp: { C: string; F: string };
        wind: { "m/s": string; "km/h": string; mph: string; knots: string };
        pressure: { hPa: string; inHg: string; mmHg: string };
        precip: { mm: string; in: string };
      };
    };
    theme: {
      headerTitle: string;
      headerSubtitle: string;
      darkTitle: string;
      darkDesc: string;
      lightTitle: string;
      lightDesc: string;
      systemTitle: string;
      systemDesc: string;
      darkSubtitle: string;
      darkBadge: string;
      lightSubtitle: string;
      lightBadge: string;
      systemSubtitle: string;
      systemBadge: string;
    };
    tabDescriptions: {
      locations: string;
      source: string;
      api: string;
      units: string;
      localization: string;
      speech: string;
      appearance: string;
    };
    autoSourceBadge: string;
    resetConfirmTitle: string;
    resetConfirmDesc: string;
    scrollTabsLeft: string;
    scrollTabsRight: string;
    sectionPicker: string;
    source: {
      feedTitle: string;
      live: string;
      feedDesc: string;
      model: string;
      providerTitle: string;
      providerDesc: string;
      providerAria: string;
      apiKeyRequired: string;
      keyless: string;
      customOwmKeyActive: string;
      sharedServerKey: string;
      configuredInApiTab: string;
      nwpTitle: string;
      nwpDesc: string;
      stationNoticeTitle: string;
      stationNoticeDesc: string;
      selectNwpPlaceholder: string;
    };
    apiKeys: {
      headerTitle: string;
      credentialsBadge: string;
      headerDesc: string;
      customSetCount: (count: number, total: number) => string;
      customSet: string;
      serverShared: string;
      studioShared: string;
      showKey: string;
      hideKey: string;
      enterKeyToTest: string;
      owmTitle: string;
      owmDesc: string;
      owmPlaceholder: string;
      showOwmKey: string;
      hideOwmKey: string;
      testConnection: string;
      owmHelp: string;
      cartoTitle: string;
      cartoDesc: string;
      cartoPlaceholder: string;
      showCartoKey: string;
      hideCartoKey: string;
      cartoHelp: string;
      cartoAccepted: string;
      cartoWatermarked: string;
      testingCartoKey: string;
      testKey: string;
      keyVerified: string;
      keyTestFailed: string;
      testingKey: string;
      contactingOwm: string;
      owmAccepted: string;
      testLocationFallback: string;
      liveReading: (place: string, reading: string) => string;
      humidityValue: (percent: number) => string;
      testFailedHttp: (status: number) => string;
      testTimedOut: (seconds: number) => string;
      networkError: string;
      historyTitle: string;
      historyDesc: string;
      noHistory: string;
      useKey: string;
      activeKey: string;
      previousKey: string;
      deleteKeyAria: string;
      clearHistory: string;
      revertToServerShared: string;
      recentKeys: string;
    };
    locations: {
      activeStation: string;
      liveSync: string;
      monitoringLabel: string;
      savedCount: (count: number, max: number) => string;
      addTitle: string;
      addDesc: string;
      pinnedCount: (count: number, max: number) => string;
      limitCount: (count: number, max: number) => string;
      searchAria: string;
      searchPlaceholder: string;
      maxPinnedPlaceholder: (max: number) => string;
      clearSearch: string;
      resultsTitle: string;
      resultsAria: string;
      searching: string;
      foundCount: (count: number) => string;
      locatingStations: string;
      pinned: string;
      limitBadge: (max: number) => string;
      pin: string;
      noStationTitle: string;
      noStationDesc: (query: string) => string;
      feedbackNoMatch: string;
      feedbackAllPinned: string;
      nearbyTab: string;
      popularTab: string;
      near: (city: string) => string;
      scanningNearby: string;
      pinNearbyAria: (city: string, distanceKm: number) => string;
      pinAria: (city: string) => string;
      nearbyErrorTitle: string;
      nearbyErrorDesc: string;
      retry: string;
      locationUnknownTitle: string;
      locationUnknownDesc: string;
      allNearbySavedTitle: string;
      allNearbySavedDesc: string;
      noRegionalTitle: string;
      noRegionalDesc: string;
      allPopularAddedTitle: string;
      allPopularAddedDesc: string;
      noPinnedTitle: string;
      noPinnedDesc: string;
      savedTitle: string;
      savedDesc: (count: number, max: number) => string;
      groundStation: string;
      selectStation: string;
      showWeatherFor: (city: string) => string;
      removeFromFavorites: string;
      removeAria: (city: string) => string;
    };
    speech: {
      engineTitle: string;
      personaTitle: string;
      personaDesc: string;
      recentVoices: string;
      filterByTone: string;
      allTonesShort: string;
      allTones: string;
      allVoices: string;
      maleVoices: string;
      femaleVoices: string;
      noVoicesWithTone: (tone: string) => string;
      noMaleVoicesWithTone: (tone: string) => string;
      noFemaleVoicesWithTone: (tone: string) => string;
      male: string;
      female: string;
      playPreview: string;
      pausePreview: string;
      resumePreview: string;
      loading: string;
      pause: string;
      resume: string;
      stop: string;
      playAudition: string;
      script: string;
      genericVoiceNotice: (voiceName: string) => string;
      velocityTitle: string;
      velocityDesc: string;
      velocityValueText: (rate: string) => string;
      pitchTitle: string;
      pitchDesc: string;
      pitchValueText: (semitones: number) => string;
      volumeTitle: string;
      volumeDesc: string;
      volumeValueText: (decibels: string) => string;
      autoBriefingTitle: string;
      autoBriefingDesc: string;
      deliveryTitle: string;
      deliveryDesc: string;
      deliveryStyles: {
        meteorological: string;
        calm: string;
        cheerful: string;
        energetic: string;
        authoritative: string;
      };
      /** Display names for neural voice tones, keyed by the tone id in lib/edge-tts. */
      tones: {
        Firm: string;
        Upbeat: string;
        Informative: string;
        Bright: string;
        Smooth: string;        Excitable: string;
        Youthful: string;
        Breezy: string;
        "Easy-going": string;
        Breathy: string;
        Clear: string;
        Gravelly: string;
        Soft: string;
        Even: string;
        Mature: string;
        Forward: string;
        Friendly: string;
        Casual: string;
        Gentle: string;
        Lively: string;
        Knowledgeable: string;
        Warm: string;
      };
      visualizer: {
        live: string;
        paused: string;
        synthesizing: string;
        idle: string;
        tone: string;
        pitch: string;
        rate: string;
        positionAria: string;
        positionText: (current: string, total: string) => string;
        noAudio: string;
      };
    };
  };
  header: {
    home: string;
    currentStationGps: string;
    detecting: string;
    gpsLocked: string;
    clickToLoadStation: string;
    autoDetectStation: string;
    locateAction: string;
    locatingStations: string;
    geocodingMatches: string;
    noStationFound: (query: string) => string;
    popularHubs: string;
    aiAdvisor: string;
    aiAdvisorDesc: string;
    sourceDesc: string;
    locateDesc: string;
    openMenu: string;
    mainMenu: string;
    switchToLight: string;
    switchToDark: string;
    toggleTheme: string;
  };
  aiAdvisor: {
    bannerTitle: string;
    liveInsights: string;
    bannerDesc: string;
    fullBrief: string;
    actionDirective: string;
    microClimateStability: string;
    microClimateDesc: string;
    stable: string;
    attireGuidance: string;
    outdoorActivity: string;
    tomorrowShift: string;
    dialogTitle: string;
    dialogDesc: (cityName: string) => string;
    shortRangeDisturbances: string;
    guidanceLabel: string;
    stabilityHigh: string;
    plannedShiftsTitle: string;
    precipRiskLabel: string;
    quickConsultationTitle: string;
    quickQuestionUmbrella: string;
    quickQuestionWear: string;
    quickQuestionExercise: string;
    quickQuestionTomorrow: string;
    chatPlaceholder: string;
    askButton: string;
    consultationPrefix: string;
    answerUmbrellaYes: (time: string) => string;
    answerUmbrellaNo: string;
    answerWearCold: (temp: string, unit: string) => string;
    answerWearHot: (temp: string, unit: string) => string;
    answerWearMild: (temp: string, unit: string) => string;
    answerExercise: (time: string, temp: string, unit: string) => string;
    answerTomorrow: (city: string, desc: string, high: string, low: string, unit: string, pop: number) => string;
    answerTomorrowFallback: string;
    answerWeekend: (satDesc: string, satHigh: string, sunDesc: string, sunHigh: string, unit: string) => string;
    answerWeekendFallback: string;
    answerGeneral: (city: string, pressure: string, humidity: number, desc: string, min: string, max: string, unit: string) => string;
    suddenRainTitle: string;
    suddenRainDetail: (start: number, end: number, time: string) => string;
    suddenRainAction: string;
    rapidCoolingTitle: string;
    rapidCoolingDetail: (drop: number, unit: string, hours: number) => string;
    rapidCoolingAction: string;
    windSurgeTitle: string;
    windSurgeDetail: (gust: string, time: string) => string;
    windSurgeAction: string;
    tomorrowConsistent: string;
    tomorrowWarmer: (diff: number, unit: string) => string;
    tomorrowCooler: (diff: number, unit: string) => string;
    tomorrowRainChance: (pop: number) => string;
    tomorrowMainlyDry: string;
    tomorrowPeriod: string;
    weekendPeriod: string;
    weekendHeadline: string;
    weekendSummaryRain: (temp: number, unit: string) => string;
    weekendSummaryDry: (temp: number, unit: string) => string;
    weekendHighsNear: (temp: number, unit: string) => string;
    weekendPrecipProbable: string;
    weekendPrecipMinimal: string;
    clothingMild: string;
    clothingCold: string;
    clothingHot: string;
    clothingRain: string;
    sportSuperb: string;
    sportAcceptable: string;
    sportAdverse: string;
    commuteRain: string;
    commuteDry: string;
    summarySteady: string;
    timingAround: (time: string) => string;
    timingBy: (time: string) => string;
  };
  notifications: {
    title: string;
    activeCount: (count: number) => string;
    currentBulletins: string;
    dismiss: string;
    allClearTitle: string;
    allClearDesc: (cityName: string) => string;
  };
  pinned: {
    title: string;
    desc: string;
    stationCount: (count: number) => string;
    loadingTelemetry: string;
    unpinStation: string;
  };
  airQualityDeep: {
    whoSubtitle: string;
    aqiTitle: string;
    scaleDesc: string;
    generalPublic: string;
    outdoorActivity: string;
    sensitiveGroups: string;
    pm25: string;
    pm10: string;
    o3: string;
    no2: string;
    so2: string;
    co: string;
    percentOfLimit: (percent: number) => string;
  };
  climate: {
    yearBaseline: (years: number) => string;
    benchmarkDesc: (date: string) => string;
    todaysDelta: string;
    twelveMonthCycle: string;
    thermalDeparture: string;
    aboveClimateNormal: string;
    belowClimateNormal: string;
    currentVsExpected: string;
    observed: string;
    avgHigh: string;
    histAvgHigh: string;
    thirtyDayBaseline: string;
    histAvgLow: string;
    diurnalMinimum: string;
    recordHigh: string;
    recordedIn: (year: number) => string;
    recordLow: string;
    annualCurve: string;
    highsVsLows: (unit: string) => string;
    normalHigh: string;
    normalLow: string;
    monthlyRainfall: string;
  };
  charts: {
    twentyFourHour: string;
    interactiveDesc: string;
    tempTab: string;
    ambient: string;
    apparent: string;
    precipProbability: string;
    windSpeed: string;
    relativeHumidity: string;
    uvRadiation: string;
  };
  radar: {
    desc: string;
    dark: string;
    light: string;
    radarLayer: string;
    cloudsLayer: string;
    clearLayer: string;
    playbackSpeed: string;
    toggleFullscreen: string;
    openFullRadar: string;
    fullRadar: string;
    precipDbz: string;
    drizzle: string;
    heavy: string;
    pause: string;
    playLoop: string;
    frame: string;
    stationPopup: (cityName: string) => string;
  };
  compare: {
    desc: string;
    primaryStation: string;
    targetStation: string;
    active: string;
    syncingTelemetry: string;
    connected: string;
    switchDashboard: string;
    atmosphericMetric: string;
    spreadDelta: string;
    temperature: string;
    humidity: string;
    windVelocity: string;
    pressure: string;
    airQuality: string;
  };
  alerts: {
    bulletinTitle: string;
    activeAlerts: (count: number) => string;
    bulletinDesc: (cityName: string) => string;
    soundChime: string;
    collapse: string;
    expand: string;
    expires: string;
    safetyProtocol: string;
    acknowledged: string;
    actionRequired: string;
    nominal: string;
  };
}

import { createTranslator } from "next-intl";
import enMessages from "@/messages/en.json";

// messages/*.json is the single source of UI strings; next-intl formats them.
// English ships in the bundle as the fallback. Other locales are code-split
// and loaded on demand, then kept in memory so each file loads at most once.
export type Messages = typeof enMessages;

const loadedMessages = new Map<SupportedLanguage, Messages>([["en", enMessages]]);
const pendingMessages = new Map<SupportedLanguage, Promise<Messages>>();

export function loadMessages(lang?: string): Promise<Messages> {
  const resolved = resolveUiLanguage(lang) ?? "en";
  const loaded = loadedMessages.get(resolved);
  if (loaded) return Promise.resolve(loaded);
  let pending = pendingMessages.get(resolved);
  if (!pending) {
    pending = import(`../messages/${resolved}.json`)
      .then((mod: { default: Messages }) => {
        loadedMessages.set(resolved, mod.default);
        return mod.default;
      })
      .catch((err) => {
        pendingMessages.delete(resolved); // allow a retry later
        console.warn(`Failed to load "${resolved}" messages`, err);
        return enMessages;
      });
    pendingMessages.set(resolved, pending);
  }
  return pending;
}

/** Messages for a locale if already loaded (synchronously), otherwise null. */
export function getLoadedMessages(lang?: string): Messages | null {
  return loadedMessages.get(resolveUiLanguage(lang) ?? "en") ?? null;
}

const FUNCTION_PARAM_MAP: Record<string, string[]> = {
  "settingsDialog.regional.uiFallbackNotice": ["languageName"],
  "settingsDialog.apiKeys.customSetCount": ["count", "total"],
  "settingsDialog.apiKeys.liveReading": ["place", "reading"],
  "settingsDialog.apiKeys.humidityValue": ["percent"],
  "settingsDialog.apiKeys.testFailedHttp": ["status"],
  "settingsDialog.apiKeys.testTimedOut": ["seconds"],
  "settingsDialog.locations.savedCount": ["count", "max"],
  "settingsDialog.locations.pinnedCount": ["count", "max"],
  "settingsDialog.locations.limitCount": ["count", "max"],
  "settingsDialog.locations.maxPinnedPlaceholder": ["max"],
  "settingsDialog.locations.foundCount": ["count"],
  "settingsDialog.locations.limitBadge": ["max"],
  "settingsDialog.locations.noStationDesc": ["query"],
  "settingsDialog.locations.near": ["city"],
  "settingsDialog.locations.pinNearbyAria": ["city", "distanceKm"],
  "settingsDialog.locations.pinAria": ["city"],
  "settingsDialog.locations.savedDesc": ["count", "max"],
  "settingsDialog.locations.showWeatherFor": ["city"],
  "settingsDialog.locations.removeAria": ["city"],
  "settingsDialog.speech.noVoicesWithTone": ["tone"],
  "settingsDialog.speech.noMaleVoicesWithTone": ["tone"],
  "settingsDialog.speech.noFemaleVoicesWithTone": ["tone"],
  "settingsDialog.speech.genericVoiceNotice": ["voiceName"],
  "settingsDialog.speech.velocityValueText": ["rate"],
  "settingsDialog.speech.pitchValueText": ["semitones"],
  "settingsDialog.speech.volumeValueText": ["decibels"],
  "settingsDialog.speech.visualizer.positionText": ["current", "total"],
  "header.noStationFound": ["query"],
  "aiAdvisor.dialogDesc": ["cityName"],
  "aiAdvisor.answerUmbrellaYes": ["time"],
  "aiAdvisor.answerWearCold": ["temp", "unit"],
  "aiAdvisor.answerWearHot": ["temp", "unit"],
  "aiAdvisor.answerWearMild": ["temp", "unit"],
  "aiAdvisor.answerExercise": ["time", "temp", "unit"],
  "aiAdvisor.answerTomorrow": ["city", "desc", "high", "low", "unit", "pop"],
  "aiAdvisor.answerWeekend": ["satDesc", "satHigh", "sunDesc", "sunHigh", "unit"],
  "aiAdvisor.answerGeneral": ["city", "pressure", "humidity", "desc", "min", "max", "unit"],
  "aiAdvisor.suddenRainDetail": ["start", "end", "time"],
  "aiAdvisor.rapidCoolingDetail": ["drop", "unit", "hours"],
  "aiAdvisor.windSurgeDetail": ["gust", "time"],
  "aiAdvisor.tomorrowWarmer": ["diff", "unit"],
  "aiAdvisor.tomorrowCooler": ["diff", "unit"],
  "aiAdvisor.tomorrowRainChance": ["pop"],
  "aiAdvisor.weekendSummaryRain": ["temp", "unit"],
  "aiAdvisor.weekendSummaryDry": ["temp", "unit"],
  "aiAdvisor.weekendHighsNear": ["temp", "unit"],
  "aiAdvisor.timingAround": ["time"],
  "aiAdvisor.timingBy": ["time"],
  "notifications.activeCount": ["count"],
  "notifications.allClearDesc": ["cityName"],
  "pinned.stationCount": ["count"],
  "airQualityDeep.percentOfLimit": ["percent"],
  "climate.yearBaseline": ["years"],
  "climate.benchmarkDesc": ["date"],
  "climate.recordedIn": ["year"],
  "climate.highsVsLows": ["unit"],
  "radar.stationPopup": ["cityName"],
  "alerts.activeAlerts": ["count"],
  "alerts.bulletinDesc": ["cityName"],
  "widgets.wind.forceScale": ["scale"],
  "widgets.solar.illumination": ["percent"],
};

/**
 * Builds the typed `t.section.key` tree from a next-intl translator. Keys listed
 * in FUNCTION_PARAM_MAP become functions whose positional args map to ICU
 * values; next-intl formats them (so ICU plurals work). Other keys are plain strings.
 */
function buildTranslations(
  translate: ReturnType<typeof createTranslator<Messages>>,
  node: Record<string, unknown>,
  path = ""
): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(node)) {
    const p = path ? `${path}.${key}` : key;
    if (value && typeof value === "object") {
      out[key] = buildTranslations(translate, value as Record<string, unknown>, p);
      continue;
    }
    const params = FUNCTION_PARAM_MAP[p];
    const id = p as Parameters<typeof translate.raw>[0];
    out[key] = params
      ? (...args: unknown[]) =>
          translate(id, Object.fromEntries(params.map((name, i) => [name, (args[i] ?? "") as string])) as never)
      : translate.raw(id);
  }
  return out;
}

const TRANSLATION_CACHE = new Map<SupportedLanguage, Translations>();

/**
 * Returns the translation tree for a language. Falls back to English (without
 * caching it) until that language's messages have been loaded via loadMessages().
 */
export function getTranslation(lang: string = "en"): Translations {
  const resolved = resolveUiLanguage(lang) ?? "en";
  const cached = TRANSLATION_CACHE.get(resolved);
  if (cached) return cached;
  const messages = loadedMessages.get(resolved);
  const locale = messages ? resolved : "en";
  const translate = createTranslator({
    locale,
    messages: messages ?? enMessages,
    // Missing keys fall back to English instead of rendering the key path.
    getMessageFallback: ({ key, namespace }) => {
      const full = namespace ? `${namespace}.${key}` : key;
      return String(full.split(".").reduce<unknown>((o, k) => (o as Record<string, unknown>)?.[k], enMessages) ?? full);
    },
  });
  const tree = buildTranslations(translate, (messages ?? enMessages) as Record<string, unknown>) as unknown as Translations;
  if (messages) TRANSLATION_CACHE.set(resolved, tree);
  return tree;
}

/** Resolves a BCP-47 tag ("it-IT", "pt-BR", "ru") to a UI language we ship translations for, if any. */
export function resolveUiLanguage(lang?: string): SupportedLanguage | null {
  const base = (lang || "").split(/[-_]/)[0].toLowerCase();
  return (SUPPORTED_UI_LANGUAGES as readonly string[]).includes(base)
    ? (base as SupportedLanguage)
    : null;
}

export function translateCondition(condition: string, lang: string = "en"): string {
  if (!condition) return "";
  const t = getTranslation(lang);
  if (t.conditions[condition]) {
    return t.conditions[condition];
  }
  // Try case-insensitive matching
  const lower = condition.toLowerCase().trim();
  for (const [k, v] of Object.entries(t.conditions)) {
    if (k.toLowerCase().trim() === lower) return v;
  }
  // Try matching against English condition values
  const enConditions = resolveUiLanguage(lang) === "en" ? {} : getTranslation("en").conditions;
  for (const [k, v] of Object.entries(enConditions)) {
    if (v.toLowerCase().trim() === lower && t.conditions[k]) {
      return t.conditions[k];
    }
  }
  // Keyword fallbacks
  if (lower.includes("thunder") || lower.includes("storm")) {
    return t.conditions["STORM"] || t.conditions["Thunderstorm"] || condition;
  }
  if (lower.includes("snow") || lower.includes("blizzard")) {
    return t.conditions["SNOW"] || condition;
  }
  if (lower.includes("drizzle")) {
    return t.conditions["Drizzle"] || condition;
  }
  if (lower.includes("rain") || lower.includes("shower")) {
    return t.conditions["RAIN"] || condition;
  }
  if (lower.includes("fog") || lower.includes("mist") || lower.includes("haze")) {
    return t.conditions["FOG"] || condition;
  }
  if (lower.includes("cloud")) {
    return t.conditions["CLOUDY"] || t.conditions["Partly Cloudy"] || condition;
  }
  if (lower.includes("clear") || lower.includes("sun")) {
    return t.conditions["Clear Sky"] || t.conditions["SUNNY"] || condition;
  }
  return condition;
}

export function translateDay(day: string, lang: string = "en"): string {
  const t = getTranslation(lang);
  const upper = day.toUpperCase().trim() as keyof typeof t.days;
  if (t.days[upper]) {
    return t.days[upper];
  }
  return day;
}
