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

export const TRANSLATIONS: Partial<Record<SupportedLanguage, Translations>> = {
  en: {
    common: {
      stationTelemetryActive: "Station Telemetry Active",
      source: "Source",
      change: "CHANGE",
      refresh: "Refresh",
      pressure: "Pressure",
      feelsLike: "Feels like",
      synopticTime: "Synoptic Time",
      stationTelemetry: "Station Telemetry",
      loading: "Loading meteorological data...",
      searchPlaceholder: "Search city, airport, coordinates...",
      briefing: "Briefing",
      playing: "Playing...",
      preparing: "Preparing...",
      settings: "Settings",
      locateMe: "Locate Me",
      locating: "Locating...",
      clear: "Clear",
      reset: "Reset",
      done: "Done",
      save: "Save",
      saved: "Saved",
      cancel: "Cancel",
      today: "Today",
      now: "Now",
      high: "High",
      low: "Low",
      shareStation: "Share Station",
      copied: "Copied link to clipboard!",
      advisorySystem: "Meteorological Advisory System",
      noActiveAlerts: "Atmospheric conditions nominal across local observation sector.",
      activeBulletin: "Active Bulletin",
      precip: "precip",
      sourceTooltip: "Click to choose weather data source & forecast station",
      simulatedSensor: "Simulated Sensor",
      consoleFooter: "OpenWeather Precision Meteorological Console",
    },
    tabs: {
      overview: "Overview",
      charts: "Graphs & Trends",
      radar: "Radar & Satellite",
      airQuality: "Air Quality & Health",
      climate: "Historical & Climate",
      compare: "Station Comparison",
    },
    hero: {
      min: "Min",
      max: "Max",
      wind: "Wind",
      humidity: "Humidity",
      barometer: "Pressure",
      visibility: "Visibility",
      dewPoint: "Dew Point",
      uvIndex: "UV Index",
      clouds: "Clouds",
    },
    forecast: {
      hourlyTitle: "Hourly Telemetry & Trajectory",
      hourlyDesc: "48-hour high-resolution thermodynamic forecast curve",
      dailyTitle: "Daily Meteorological Outlook",
      dailyDesc: "Extended synoptic outlook & thermal trajectory",
      tenDayOutlook: "10-Day Synoptic",
      pop: "precip",
      oneHourPrecision: "1-Hour Precision",
      cards: "Cards",
      curve: "Curve",
    },
    days: {
      MON: "Mon",
      TUE: "Tue",
      WED: "Wed",
      THU: "Thu",
      FRI: "Fri",
      SAT: "Sat",
      SUN: "Sun",
      TODAY: "Today",
    },
    conditions: {
      SUNNY: "Clear Sky",
      CLEAR_NIGHT: "Clear Night",
      PARTLY_CLOUDY_DAY: "Partly Cloudy",
      PARTLY_CLOUDY_NIGHT: "Partly Cloudy",
      CLOUDY: "Overcast",
      FOG: "Fog & Mist",
      RAIN: "Rain",
      HEAVY_RAIN: "Heavy Rain",
      SNOW: "Snow",
      STORM: "Thunderstorm",
      WINDY: "High Winds",
      "Clear Sky": "Clear Sky",
      "Mainly Clear": "Mainly Clear",
      "Partly Cloudy": "Partly Cloudy",
      Overcast: "Overcast",
      Drizzle: "Drizzle",
      "Freezing Drizzle": "Freezing Drizzle",
      "Rain Showers": "Rain Showers",
      "Violent Rain Showers": "Heavy Rain Showers",
      "Snow Showers": "Snow Showers",
      "Severe Thunderstorm": "Severe Thunderstorm",
      "Fog & Depositing Rime": "Dense Fog",
      Thunderstorm: "Thunderstorm",
      "Clear Night": "Clear Night",
      "Freezing Rain": "Freezing Rain",
      Variable: "Variable",
    },
    widgets: {
      wind: {
        title: "Wind Telemetry",
        subtitle: "Atmospheric vector & gust tracking",
        speed: "Wind Speed",
        gusts: "Gust Velocity",
        direction: "Direction",
        calm: "Calm",
        lightBreeze: "Light Breeze",
        moderateBreeze: "Moderate Breeze",
        freshBreeze: "Fresh Breeze",
        strongBreeze: "Strong Breeze",
        gale: "Gale Force",
        storm: "Violent Storm",
        beaufortScale: "Beaufort Scale:",
        forceScale: (scale) => `Force ${scale}`,
      },
      humidity: {
        title: "Relative Humidity",
        subtitle: "Atmospheric moisture & dew saturation",
        relativeHumidity: "Relative Humidity",
        dewPoint: "Dew Point",
        dry: "Dry",
        comfortable: "Comfortable",
        humid: "Humid",
        veryHumid: "Very Humid",
        heatIndex: "NOAA Heat Index:",
      },
      airQuality: {
        title: "Air Quality Index",
        subtitle: "Particulate matter & tropospheric pollutants",
        index: "AQI",
        good: "Good",
        moderate: "Moderate",
        sensitive: "Unhealthy for Sensitive",
        unhealthy: "Unhealthy",
        veryUnhealthy: "Very Unhealthy",
        hazardous: "Hazardous",
        scale: "Scale",
        level1Desc: "Air quality is satisfactory with minimal risk.",
        level2Desc: "Acceptable quality; minor irritation possible for sensitive groups.",
        level3Desc: "General public may experience slight discomfort.",
        level4Desc: "Health alert: sensitive individuals may experience adverse symptoms.",
        level5Desc: "Emergency conditions: entire population likely affected.",
      },
      solar: {
        title: "Solar Ephemeris",
        subtitle: "Celestial arc & daylight trajectory",
        sunrise: "Sunrise",
        sunset: "Sunset",
        dayLength: "Day Length",
        solarNoon: "Solar Noon",
        dawn: "Dawn",
        dusk: "Dusk",
        lunarSubtitle: "Lunar phase & illumination",
        sunTab: "Sun",
        moonTab: "Moon",
        sunAboveHorizon: "Sun Above Horizon",
        nightCycle: "Night Cycle",
        lunarPhase: "Lunar Phase",
        illumination: (percent) => `${percent}% Illumination`,
        cyclePhase: "Cycle Phase",
        skyVisibility: "Sky Visibility",
        brightSky: "Bright Sky",
        darkSky: "Dark Sky",
      },
      uv: {
        title: "UV Radiation",
        subtitle: "Erythemal ultraviolet solar exposure",
        low: "Low",
        moderate: "Moderate",
        high: "High",
        veryHigh: "Very High",
        extreme: "Extreme",
        protectionRequired: "Protection required during midday solar peaks",
        currentIntensity: "Current Intensity",
        dailyPeak: "Daily Peak Index",
        burnTime: "Skin Burn Time",
        recommendedSpf: "Recommended SPF",
        lowAdvice: "No special protection required. Safe for outdoor activities.",
        moderateAdvice: "Wear sunglasses, hat, and SPF 30+ sunscreen during midday hours.",
        highAdvice: "Seek shade during midday peaks. Wear sun-protective clothing and SPF 30+.",
        veryHighAdvice: "Avoid midday sun. Shirt, hat, sunglasses, and high-factor sunscreen essential.",
        extremeAdvice: "Take all precautions. Unprotected skin and eyes will burn in minutes.",
        burnTimeOver60: "> 60 mins",
        burnTime40: "~ 40 mins",
        burnTime25: "~ 25 mins",
        burnTime15: "~ 15 mins",
        burnTimeUnder10: "< 10 mins",
      },
    },
    settingsDialog: {
      title: "Station & Application Preferences",
      subtitle: "Configure meteorological data feeds, numerical forecast models, measurement standards & voice telemetry",
      tabSource: "Source & Models",
      tabLocations: "Locations",
      tabApi: "API Keys",
      tabUnits: "Units",
      tabFavorites: "Favorites",
      tabRegional: "Regional",
      tabSpeech: "Speech & Audio",
      tabTheme: "Theme",
      resetDefaults: "Reset to Defaults",
      done: "Done",
      regional: {
        headerTitle: "ACTIVE REGIONAL TELEMETRY & LOCALE",
        headerSubtitle: "Multi-locale translation, chronometry & ephemeris standard",
        langTitle: "Language & Regional Dialect",
        langDesc: "Select interface language & localized condition terminology",
        selectLanguagePlaceholder: "Select Language",
        timeTitle: "Time Representation",
        timeDesc: "Format across hourly charts & solar ephemeris",
        time24Label: "24-Hour Military Format",
        time24Desc: "(00:00 – 23:59, Synoptic Zulu)",
        time12Label: "12-Hour Standard Format",
        time12Desc: "(Civilian AM / PM)",
        dateTitle: "Date Display Standard",
        dateDesc: "Calendar formatting for 7-day outlooks & radar logs",
        coordTitle: "Coordinate & Geodetic",
        coordDesc: "Latitude & longitude precision format",
        clock: "Clock",
        zulu: "Zulu",
        pattern: "Pattern",
        preview: "Preview",
        system: "System",
        sample: "Sample",
        searchLanguagePlaceholder: "Search language...",
        noLanguageFound: "No language found.",
        voiceOnly: "Voice only",
        uiFallbackNotice: (languageName) =>
          `Interface shown in English; voice briefings use ${languageName}.`,
        dateFormats: {
          iso: "ISO 8601 (Synoptic)",
          intl: "International Standard",
          us: "North American",
        },
        coordFormats: {
          decimal: "Decimal Degrees (DD)",
          dms: "Degrees Minutes Seconds (DMS)",
        },
      },
      units: {
        headerTitle: "MEASUREMENT STANDARDS",
        headerSubtitle: "Global metric, imperial & synoptic meteorological units",
        tempTitle: "Temperature Unit",
        tempDesc: "Display standard for thermodynamic telemetry",
        windTitle: "Wind Speed Unit",
        windDesc: "Velocity measurement for vector wind telemetry",
        pressureTitle: "Pressure Unit",
        pressureDesc: "Barometric atmospheric pressure standard",
        precipTitle: "Precipitation Unit",
        precipDesc: "Hydrometeor accumulation depth standard",
        presets: { metric: "Metric", imperial: "Imperial", custom: "Custom" },
        selectTempPlaceholder: "Select temperature unit",
        selectWindPlaceholder: "Select wind unit",
        selectPressurePlaceholder: "Select pressure unit",
        selectPrecipPlaceholder: "Select precipitation unit",
        options: {
          temp: { C: "Celsius (°C)", F: "Fahrenheit (°F)" },
          wind: {
            "m/s": "Meters per second (m/s)",
            "km/h": "Kilometers per hour (km/h)",
            mph: "Miles per hour (mph)",
            knots: "Knots (knots)",
          },
          pressure: {
            hPa: "Hectopascals (hPa)",
            inHg: "Inches of Mercury (inHg)",
            mmHg: "Millimeters of Mercury (mmHg)",
          },
          precip: { mm: "Millimeters (mm)", in: "Inches (in)" },
        },
      },
      theme: {
        headerTitle: "SYNOPTIC DISPLAY THEME",
        headerSubtitle: "Visual contrast calibration & OLED telemetry optimization",
        darkTitle: "Dark Synoptic",
        darkDesc: "Optimal for radar observation & low fatigue in dark environments",
        lightTitle: "Light Daylight",
        lightDesc: "Crisp daylight contrast suited for bright outdoor viewing",
        systemTitle: "System Dynamic",
        systemDesc: "Follows host operating system display mode automatically",
        darkSubtitle: "Nocturnal Radar",
        darkBadge: "OLED Pitch",
        lightSubtitle: "High Contrast",
        lightBadge: "Daylight",
        systemSubtitle: "OS Responsive",
        systemBadge: "Adaptive",
      },
      tabDescriptions: {
        locations: "Favorite meteorological stations & pinned telemetry points",
        source: "Numerical weather prediction engines & radar telemetry feed",
        api: "OpenWeatherMap API credentials",
        units: "Atmospheric, thermodynamic & wind velocity measurement units",
        localization: "Interface localization, synoptic 24h clock & geodetic grid",
        speech:
          "Multilingual neural voice timbre, velocity, pitch & EQ curves",
        appearance: "Synoptic dark radar theme & visual interface styling",
      },
      autoSourceBadge: "Auto",
      resetConfirmTitle: "Reset all preferences?",
      resetConfirmDesc:
        "Units, language, data source, voice settings and saved API keys will return to their defaults. Pinned locations are kept.",
      scrollTabsLeft: "Scroll tabs left",
      scrollTabsRight: "Scroll tabs right",
      sectionPicker: "Settings section",
      source: {
        feedTitle: "Active Telemetry Feed",
        live: "LIVE",
        feedDesc: "Real-time atmospheric modeling & observation synchronizer",
        model: "Model",
        providerTitle: "Meteorological Data Provider (Source)",
        providerDesc: "Select the observation and primary synoptic data provider",
        providerAria: "Weather data provider",
        apiKeyRequired: "API Key Required",
        keyless: "Keyless",
        customOwmKeyActive: "Custom OpenWeatherMap API key active.",
        sharedServerKey: "Using shared server environment key.",
        configuredInApiTab: "Configured in API Keys Tab",
        nwpTitle: "Numerical Weather Prediction (NWP) Forecast Station",
        nwpDesc: "Choose the atmospheric physics simulation station model for forecasting",
        stationNoticeTitle: "Station Model Notice",
        stationNoticeDesc:
          "OpenWeatherMap uses OWM Station Consensus. Model selection below applies when Open-Meteo or Auto Failover is active.",
        selectNwpPlaceholder: "Select NWP Station Model",
      },
      apiKeys: {
        headerTitle: "API Authentication & Quotas",
        credentialsBadge: "CREDENTIALS",
        headerDesc:
          "Manage personal API keys for dedicated high-frequency telemetry & neural voice pipelines",
        customSetCount: (count, total) => `${count} / ${total} Custom Set`,
        customSet: "Custom Set",
        serverShared: "Server Shared",
        studioShared: "Studio Shared",
        showKey: "Show key",
        hideKey: "Hide key",
        enterKeyToTest: "Enter a key to test it",
        owmTitle: "OpenWeatherMap API Key",
        owmDesc:
          "Supplies current weather observations, 3-hourly forecast projections, and geocoding services.",
        owmPlaceholder: "e.g. 32-character OpenWeatherMap key",
        showOwmKey: "Show OpenWeatherMap key",
        hideOwmKey: "Hide OpenWeatherMap key",
        testConnection: "Test Connection",
        owmHelp:
          "Leave blank to utilize the shared server environment key. Obtain a dedicated API key at",
        testKey: "Test Key",
        keyVerified: "Key Verified",
        keyTestFailed: "Key Test Failed",
        testingKey: "Testing Key...",
        contactingOwm: "Contacting OpenWeatherMap...",
        owmAccepted: "OpenWeatherMap accepted the key.",
        testLocationFallback: "the test location",
        liveReading: (place, reading) => `Live reading for ${place}: ${reading}.`,
        humidityValue: (percent) => `${percent}% humidity`,
        testFailedHttp: (status) => `Key test failed (HTTP ${status}).`,
        testTimedOut: (seconds) => `The test timed out after ${seconds} seconds.`,
        networkError: "Network error while testing the key.",
      },
      locations: {
        activeStation: "Active Weather Station",
        liveSync: "LIVE SYNC",
        monitoringLabel: "Currently monitoring live telemetry for",
        savedCount: (count, max) => `${count}/${max} Saved`,
        addTitle: "Add & Discover Stations",
        addDesc:
          "Search global observation sites or discover regional and major meteorological hubs.",
        pinnedCount: (count, max) => `${count}/${max} Pinned`,
        limitCount: (count, max) => `${count}/${max} Limit`,
        searchAria: "Search stations to pin",
        searchPlaceholder:
          "Search city, airport or coordinate (e.g. Madrid, Zurich, 28.65, 77.23)...",
        maxPinnedPlaceholder: (max) => `Maximum ${max} stations pinned (limit reached)...`,
        clearSearch: "Clear search",
        resultsTitle: "Station Search Results",
        resultsAria: "Station search results",
        searching: "Searching...",
        foundCount: (count) => `${count} found`,
        locatingStations: "Locating meteorological stations…",
        pinned: "Pinned",
        limitBadge: (max) => `Limit ${max}/${max}`,
        pin: "Pin",
        noStationTitle: "No Station Found",
        noStationDesc: (query) =>
          `No station found for “${query}”. Try a different spelling or a nearby larger city.`,
        feedbackNoMatch: "No matching station found. Pick a result from the list to pin it.",
        feedbackAllPinned: "All matching stations are already pinned.",
        nearbyTab: "Nearby Stations",
        popularTab: "Popular Hubs",
        near: (city) => `Near ${city}`,
        scanningNearby: "Scanning regional telemetry stations...",
        pinNearbyAria: (city, distanceKm) => `Pin ${city}, ${distanceKm} km away`,
        pinAria: (city) => `Pin ${city}`,
        nearbyErrorTitle: "Couldn't Load Nearby Stations",
        nearbyErrorDesc: "The regional station lookup failed. Check your connection and try again.",
        retry: "Retry",
        locationUnknownTitle: "Location Unknown",
        locationUnknownDesc:
          "Current coordinates aren't available yet. Try Popular Hubs or search above.",
        allNearbySavedTitle: "All Nearby Stations Saved",
        allNearbySavedDesc:
          "All regional telemetry stations in this range are already in your favorites.",
        noRegionalTitle: "No Regional Stations Detected",
        noRegionalDesc:
          "No regional stations found near the current coordinates. Try Popular Hubs or search above.",
        allPopularAddedTitle: "All Popular Hubs Added",
        allPopularAddedDesc: "All default major regional hubs are already in your favorites.",
        noPinnedTitle: "No Pinned Stations",
        noPinnedDesc:
          "Add frequent locations or research observatories above for instant one-click synoptic access.",
        savedTitle: "Saved Stations",
        savedDesc: (count, max) =>
          `${count} / ${max} stations saved for quick telemetry access`,
        groundStation: "Ground Station Telemetry",
        selectStation: "Select Station",
        showWeatherFor: (city) => `Show weather for ${city}`,
        removeFromFavorites: "Remove from favorites",
        removeAria: (city) => `Remove ${city} from favorites`,
      },
      speech: {
        engineTitle: "Edge Neural Text-to-Speech Engine",
        personaTitle: "Voice Persona & Timbre",
        personaDesc:
          "Select a multilingual neural narrator persona and audition voice delivery.",
        recentVoices: "Recent Voices",
        filterByTone: "Filter by Tone",
        allTonesShort: "All",
        allTones: "All tones",
        allVoices: "All Voices",
        maleVoices: "Male Voices",
        femaleVoices: "Female Voices",
        noVoicesWithTone: (tone) => `No voices found with tone “${tone}”`,
        noMaleVoicesWithTone: (tone) => `No male voices with tone “${tone}”`,
        noFemaleVoicesWithTone: (tone) => `No female voices with tone “${tone}”`,
        male: "Male",
        female: "Female",
        playPreview: "Play voice preview",
        pausePreview: "Pause voice preview",
        resumePreview: "Resume voice preview",
        loading: "Loading...",
        pause: "Pause",
        resume: "Resume",
        stop: "Stop",
        playAudition: "Play Audition",
        script: "Script:",
        genericVoiceNotice: (voiceName) =>
          `The free Edge neural voice service was unreachable, so this preview used your browser's built-in voice, not ${voiceName}. Try again in a moment.`,
        velocityTitle: "Speech Velocity",
        velocityDesc:
          "Browser playback rate applied to the generated audio (the voice itself is synthesized at normal speed)",
        velocityValueText: (rate) => `${rate} times playback speed`,
        pitchTitle: "Voice Pitch Modulation",
        pitchDesc:
          "Semitone pitch shift. Only used by the browser speech fallback; neural voices ignore it.",
        pitchValueText: (semitones) =>
          `${semitones > 0 ? "plus " : semitones < 0 ? "minus " : ""}${Math.abs(semitones).toFixed(1)} semitones`,
        volumeTitle: "Volume Gain Calibration",
        volumeDesc: "Playback volume in decibels, applied in the browser (0 dB = full volume)",
        volumeValueText: (decibels) => `${decibels} decibels`,
        autoBriefingTitle: "Automatic Audio Meteorological Briefing",
        autoBriefingDesc:
          "Read aloud synopsis automatically upon station selection or initialization.",
        deliveryTitle: "Delivery Style",
        deliveryDesc:
          "Adjusts the neural voice's pace and pitch to suit the mood. Not applied to the browser fallback voice.",
        deliveryStyles: {
          meteorological: "Broadcast",
          calm: "Calm",
          cheerful: "Cheerful",
          energetic: "Energetic",
          authoritative: "Authoritative",
        },
        tones: {
          Firm: "Firm",
          Upbeat: "Upbeat",
          Informative: "Informative",
          Bright: "Bright",
          Smooth: "Smooth",
          Excitable: "Excitable",
          Youthful: "Youthful",
          Breezy: "Breezy",
          "Easy-going": "Easy-going",
          Breathy: "Breathy",
          Clear: "Clear",
          Gravelly: "Gravelly",
          Soft: "Soft",
          Even: "Even",
          Mature: "Mature",
          Forward: "Forward",
          Friendly: "Friendly",
          Casual: "Casual",
          Gentle: "Gentle",
          Lively: "Lively",
          Knowledgeable: "Knowledgeable",
          Warm: "Warm",
        },
        visualizer: {
          live: "Live Acoustic Telemetry",
          paused: "Playback Paused",
          synthesizing: "Synthesizing Neural Audio...",
          idle: "Acoustic Spectrum Monitor",
          tone: "Tone",
          pitch: "Pitch",
          rate: "Rate",
          positionAria: "Audio playback position",
          positionText: (current, total) => `${current} of ${total}`,
          noAudio: "No audio loaded",
        },
      },
    },
    header: {
      home: "OpenWeather Home",
      currentStationGps: "Current Station (GPS)",
      detecting: "Detecting...",
      gpsLocked: "GPS Locked",
      clickToLoadStation: "Click to load station",
      autoDetectStation: "Auto-detect meteorological station from device sensors",
      locateAction: "Locate",
      locatingStations: "Locating stations…",
      geocodingMatches: "Geocoding Matches",
      noStationFound: (query) => `No meteorological station found for “${query}”`,
      popularHubs: "Popular Hubs",
      aiAdvisor: "AI Advisor",
      aiAdvisorDesc: "AI synoptic intelligence & sudden shift analysis",
      sourceDesc: "Weather data provider & forecast model",
      locateDesc: "Load weather for your current position",
      openMenu: "Open menu",
      mainMenu: "Main menu",
      switchToLight: "Switch to light mode",
      switchToDark: "Switch to dark mode",
      toggleTheme: "Toggle theme",
    },
    aiAdvisor: {
      bannerTitle: "AI Synoptic Intelligence & Advisory",
      liveInsights: "Live Insights",
      bannerDesc: "Automated pattern analysis for sudden atmospheric variations & planned shifts",
      fullBrief: "Full Synoptic Brief",
      actionDirective: "Action Directive:",
      microClimateStability: "Micro-Climate Stability",
      microClimateDesc: "No sudden micro-climate disturbances detected in the 6-hour forecast window.",
      stable: "STABLE",
      attireGuidance: "Attire Guidance",
      outdoorActivity: "Outdoor Activity",
      tomorrowShift: "Tomorrow Shift",
      dialogTitle: "AI Synoptic Weather Intelligence",
      dialogDesc: (cityName) => `Predictive pattern analytics for sudden shifts, lifestyle planning & advisory for ${cityName}`,
      shortRangeDisturbances: "Short-Range Sudden Disturbances (Next 6-12h)",
      guidanceLabel: "Guidance:",
      stabilityHigh: "Atmospheric stability is high. No sudden cold fronts, squalls, or rapid precipitation onset detected.",
      plannedShiftsTitle: "Planned Synoptic Shifts & Multi-Day Trend",
      precipRiskLabel: "Precipitation Risk:",
      quickConsultationTitle: "Quick AI Consultation",
      quickQuestionUmbrella: "Should I carry an umbrella today?",
      quickQuestionWear: "What should I wear right now?",
      quickQuestionExercise: "Best time for outdoor exercise?",
      quickQuestionTomorrow: "How will tomorrow feel?",
      chatPlaceholder: "Ask AI about commute, apparel, rain window...",
      askButton: "Ask",
      consultationPrefix: "Q: ",
      answerUmbrellaYes: (time) => `Yes, keep an umbrella handy. Precipitation probability exceeds 35% around ${time}.`,
      answerUmbrellaNo: "Precipitation probability is below 20% for the next 12 hours. You likely do not need an umbrella.",
      answerWearCold: (temp, unit) => `It is currently ${temp}°${unit}. We recommend a warm insulated coat or fleece jacket, long trousers, and closed-toe footwear.`,
      answerWearHot: (temp, unit) => `It is currently ${temp}°${unit}. Wear light, breathable clothing (linen/cotton), UV-protection sunglasses, and apply sunscreen.`,
      answerWearMild: (temp, unit) => `It is a mild ${temp}°${unit}. Comfortable layers (a light cardigan, hoodie, or windbreaker over a t-shirt) are ideal.`,
      answerExercise: (time, temp, unit) => `The best window for outdoor exercise is around ${time}, with cooler temperatures (${temp}°${unit}) and lower thermal stress.`,
      answerTomorrow: (city, desc, high, low, unit, pop) => `Tomorrow in ${city}: ${desc}. High of ${high}°${unit}, low of ${low}°${unit}, and a ${pop}% chance of rain.`,
      answerTomorrowFallback: "Tomorrow is expected to remain consistent with current synoptic trends.",
      answerWeekend: (satDesc, satHigh, sunDesc, sunHigh, unit) => `Weekend synoptic outlook: Saturday (${satDesc}, max ${satHigh}°${unit}), Sunday (${sunDesc}, max ${sunHigh}°${unit}).`,
      answerWeekendFallback: "The extended weekend forecast will be available as we approach the end of the week.",
      answerGeneral: (city, pressure, humidity, desc, min, max, unit) => `Synoptic evaluation for ${city}: Atmospheric pressure is ${pressure} with humidity at ${humidity}%. Condition is ${desc}. Expected 24-hour diurnal range is ${min}° to ${max}°${unit}.`,
      suddenRainTitle: "Sudden Rain Approaching",
      suddenRainDetail: (start, end, time) => `Precipitation probability surges from ${start}% to ${end}% at approximately ${time}.`,
      suddenRainAction: "Take an umbrella and plan for wet transit conditions.",
      rapidCoolingTitle: "Rapid Thermal Drop Anticipated",
      rapidCoolingDetail: (drop, unit, hours) => `Temperatures will drop by ${drop}°${unit} within ${hours} hours.`,
      rapidCoolingAction: "Carry a sweater or jacket if staying out past twilight.",
      windSurgeTitle: "Sudden Wind Velocity Surge",
      windSurgeDetail: (gust, time) => `Strong wind gusts up to ${gust} m/s detected around ${time}.`,
      windSurgeAction: "Secure outdoor furniture and watch for crosswinds during highway transit.",
      tomorrowConsistent: "Consistent temperature",
      tomorrowWarmer: (diff, unit) => `${diff}°${unit} warmer`,
      tomorrowCooler: (diff, unit) => `${diff}°${unit} cooler`,
      tomorrowRainChance: (pop) => `${pop}% chance of rain`,
      tomorrowMainlyDry: "Mainly dry",
      tomorrowPeriod: "TOMORROW",
      weekendPeriod: "WEEKEND",
      weekendHeadline: "Weekend Climatological Outlook",
      weekendSummaryRain: (temp, unit) => `Expect sporadic precipitation with temperatures hovering around ${temp}°${unit}.`,
      weekendSummaryDry: (temp, unit) => `Expect favorable synoptic stability with temperatures hovering around ${temp}°${unit}.`,
      weekendHighsNear: (temp, unit) => `Highs near ${temp}°${unit}`,
      weekendPrecipProbable: "Precipitation probable",
      weekendPrecipMinimal: "Minimal precipitation risk",
      clothingMild: "Light layers with comfortable breathable clothing.",
      clothingCold: "Thermal insulated jacket, scarf, and layered garments advised.",
      clothingHot: "Ultra-light breathable fabrics, wide-brim hat, and sunglasses recommended.",
      clothingRain: " Waterproof outer shell or compact umbrella essential.",
      sportSuperb: "Superb conditions for outdoor running, cycling, or recreation.",
      sportAcceptable: "Acceptable outdoor conditions; schedule activities before precipitation onset.",
      sportAdverse: "Adverse meteorological conditions; indoor training recommended.",
      commuteRain: "Expect vehicular congestion and slick pavement during peak transit intervals.",
      commuteDry: "Dry conditions with nominal transit predictability across the city grid.",
      summarySteady: "Atmospheric equilibrium is currently steady across the short-range trajectory.",
      timingAround: (time) => `Around ${time}`,
      timingBy: (time) => `By ${time}`,
    },
    notifications: {
      title: "Notification Center",
      activeCount: (count) => `${count} Active`,
      currentBulletins: "Current Station Bulletins",
      dismiss: "Dismiss",
      allClearTitle: "All Systems Clear",
      allClearDesc: (cityName) => `No active weather bulletins or severe advisories for ${cityName}.`,
    },
    pinned: {
      title: "Pinned Weather Stations",
      desc: "Persistent quick-access telemetry locations",
      stationCount: (count) => count === 1 ? "1 Station" : `${count} Stations`,
      loadingTelemetry: "Loading telemetry…",
      unpinStation: "Unpin station",
    },
    airQualityDeep: {
      whoSubtitle: "WHO European & Global particulate concentration telemetry",
      aqiTitle: "Air Quality Index",
      scaleDesc: "/ 5 (Clean to Hazardous)",
      generalPublic: "General Public: Minimal risk",
      outdoorActivity: "Outdoor Activity: Ideal conditions",
      sensitiveGroups: "Sensitive Groups: Normal caution",
      pm25: "Fine Particulate (PM2.5)",
      pm10: "Coarse Particulate (PM10)",
      o3: "Tropospheric Ozone (O₃)",
      no2: "Nitrogen Dioxide (NO₂)",
      so2: "Sulphur Dioxide (SO₂)",
      co: "Carbon Monoxide (CO)",
      percentOfLimit: (percent) => `${percent}% of limit`,
    },
    climate: {
      yearBaseline: (years) => `${years}-Year Baseline`,
      benchmarkDesc: (date) => `Climatological benchmark against historical observations for ${date}`,
      todaysDelta: "Today's Delta",
      twelveMonthCycle: "12-Month Cycle",
      thermalDeparture: "Thermal Departure from Normal",
      aboveClimateNormal: "Above Climate Normal",
      belowClimateNormal: "Below Climate Normal",
      currentVsExpected: "Current vs Expected",
      observed: "Observed",
      avgHigh: "Avg High",
      histAvgHigh: "Historical Average High",
      thirtyDayBaseline: "30-day baseline",
      histAvgLow: "Historical Average Low",
      diurnalMinimum: "diurnal minimum",
      recordHigh: "All-Time Record High",
      recordedIn: (year) => `Recorded in ${year}`,
      recordLow: "All-Time Record Low",
      annualCurve: "Annual Thermal & Precipitation Normal Curve",
      highsVsLows: (unit) => `Highs vs Lows (°${unit})`,
      normalHigh: "Normal High:",
      normalLow: "Normal Low:",
      monthlyRainfall: "Monthly Rainfall:",
    },
    charts: {
      twentyFourHour: "24-Hour Graph",
      interactiveDesc: "Interactive multi-sensor trend lines & probability matrices",
      tempTab: "Temp",
      ambient: "Ambient:",
      apparent: "Apparent:",
      precipProbability: "Precip Probability:",
      windSpeed: "Wind Speed:",
      relativeHumidity: "Relative Humidity:",
      uvRadiation: "UV Radiation:",
    },
    radar: {
      desc: "Live precipitation Doppler scan & multi-source base maps",
      dark: "Dark",
      light: "Light",
      radarLayer: "Radar",
      cloudsLayer: "Clouds",
      clearLayer: "Clear",
      playbackSpeed: "Playback Speed",
      toggleFullscreen: "Toggle Fullscreen",
      openFullRadar: "Open Full Radar Tab",
      fullRadar: "Full Radar",
      precipDbz: "Precipitation dBZ",
      drizzle: "Drizzle",
      heavy: "Heavy",
      pause: "PAUSE",
      playLoop: "PLAY LOOP",
      frame: "Frame",
      stationPopup: (cityName) => `${cityName} Station`,
    },
    compare: {
      desc: "Direct variance analysis between primary station and global metropolises",
      primaryStation: "PRIMARY STATION",
      targetStation: "TARGET STATION",
      active: "Active",
      syncingTelemetry: "Syncing telemetry…",
      connected: "Connected",
      switchDashboard: "Switch Dashboard",
      atmosphericMetric: "ATMOSPHERIC METRIC",
      spreadDelta: "SPREAD DELTA",
      temperature: "Temperature",
      humidity: "Relative Humidity",
      windVelocity: "Wind Velocity",
      pressure: "Barometric Pressure",
      airQuality: "Air Quality Index",
    },
    alerts: {
      bulletinTitle: "Meteorological Advisory Bulletin",
      activeAlerts: (count) => `${count} Active ${count === 1 ? "Alert" : "Alerts"}`,
      bulletinDesc: (cityName) => `Official severe weather warning & public safety directives for ${cityName}`,
      soundChime: "Sound Chime",
      collapse: "Collapse",
      expand: "Expand Directives",
      expires: "Expires:",
      safetyProtocol: "Safety Protocol:",
      acknowledged: "Acknowledged",
      actionRequired: "Action Required",
      nominal: "NOMINAL",
    },
  },

};

import enMessages from "@/messages/en.json";
import esMessages from "@/messages/es.json";
import frMessages from "@/messages/fr.json";
import deMessages from "@/messages/de.json";
import itMessages from "@/messages/it.json";
import ptMessages from "@/messages/pt.json";
import ruMessages from "@/messages/ru.json";
import jaMessages from "@/messages/ja.json";
import koMessages from "@/messages/ko.json";
import zhMessages from "@/messages/zh.json";
import hiMessages from "@/messages/hi.json";
import arMessages from "@/messages/ar.json";
import bnMessages from "@/messages/bn.json";
import idMessages from "@/messages/id.json";
import nlMessages from "@/messages/nl.json";
import trMessages from "@/messages/tr.json";
import plMessages from "@/messages/pl.json";
import viMessages from "@/messages/vi.json";
import thMessages from "@/messages/th.json";
import svMessages from "@/messages/sv.json";
import daMessages from "@/messages/da.json";
import nbMessages from "@/messages/nb.json";
import fiMessages from "@/messages/fi.json";
import elMessages from "@/messages/el.json";
import csMessages from "@/messages/cs.json";
import ukMessages from "@/messages/uk.json";
import roMessages from "@/messages/ro.json";
import huMessages from "@/messages/hu.json";
import heMessages from "@/messages/he.json";
import msMessages from "@/messages/ms.json";
import filMessages from "@/messages/fil.json";

export const ALL_LOCALE_MESSAGES: Record<SupportedLanguage, Record<string, unknown>> = {
  en: enMessages,
  es: esMessages,
  fr: frMessages,
  de: deMessages,
  it: itMessages,
  pt: ptMessages,
  ru: ruMessages,
  ja: jaMessages,
  ko: koMessages,
  zh: zhMessages,
  hi: hiMessages,
  ar: arMessages,
  bn: bnMessages,
  id: idMessages,
  nl: nlMessages,
  tr: trMessages,
  pl: plMessages,
  vi: viMessages,
  th: thMessages,
  sv: svMessages,
  da: daMessages,
  nb: nbMessages,
  fi: fiMessages,
  el: elMessages,
  cs: csMessages,
  uk: ukMessages,
  ro: roMessages,
  hu: huMessages,
  he: heMessages,
  ms: msMessages,
  fil: filMessages,
};

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

function adaptMessages(messages: unknown, fallback: unknown, currentPath = ""): unknown {
  if (!messages) return fallback;
  if (typeof messages === "string") {
    const params = FUNCTION_PARAM_MAP[currentPath];
    if (params) {
      return (...args: unknown[]) => {
        let res = messages;
        params.forEach((param, i) => {
          const val = args[i] !== undefined ? String(args[i]) : "";
          res = res.replace(new RegExp(`\\{${param}\\}`, "g"), val);
        });
        return res;
      };
    }
    return messages;
  }
  if (typeof messages === "object" && messages !== null) {
    const res: Record<string, unknown> = {};
    const fallbackObj = (typeof fallback === "object" && fallback !== null ? fallback : {}) as Record<string, unknown>;
    const messagesObj = messages as Record<string, unknown>;
    const keys = new Set([...Object.keys(fallbackObj), ...Object.keys(messagesObj)]);
    for (const k of keys) {
      const p = currentPath ? `${currentPath}.${k}` : k;
      res[k] = adaptMessages(messagesObj[k], fallbackObj[k], p);
    }
    return res;
  }
  return messages;
}

export function getMessagesForLocale(lang?: string): Record<string, unknown> {
  const resolved = resolveUiLanguage(lang) ?? "en";
  return ALL_LOCALE_MESSAGES[resolved] ?? ALL_LOCALE_MESSAGES.en;
}

/** Resolves a BCP-47 tag ("it-IT", "pt-BR", "ru") to a UI language we ship translations for, if any. */
export function resolveUiLanguage(lang?: string): SupportedLanguage | null {
  const base = (lang || "").split(/[-_]/)[0].toLowerCase();
  return (SUPPORTED_UI_LANGUAGES as readonly string[]).includes(base)
    ? (base as SupportedLanguage)
    : null;
}

const ADAPTED_CACHE: Partial<Record<SupportedLanguage, Translations>> = {};

export function getTranslation(lang: string = "en"): Translations {
  const resolved = resolveUiLanguage(lang) ?? "en";
  if (!ADAPTED_CACHE[resolved]) {
    if (resolved === "en") {
      ADAPTED_CACHE[resolved] = TRANSLATIONS.en!;
    } else {
      const msgs = ALL_LOCALE_MESSAGES[resolved] ?? ALL_LOCALE_MESSAGES.en;
      ADAPTED_CACHE[resolved] = adaptMessages(msgs, TRANSLATIONS.en!) as Translations;
    }
  }
  return ADAPTED_CACHE[resolved]!;
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
  const enConditions = TRANSLATIONS.en?.conditions || {};
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
