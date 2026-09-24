export type SupportedLanguage = "en" | "es" | "fr" | "de" | "ja" | "hi";

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
}

export const TRANSLATIONS: Record<SupportedLanguage, Translations> = {
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
      locateAction: "Locate →",
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
  },

  hi: {
    common: {
      stationTelemetryActive: "स्टेशन टेलीमेट्री सक्रिय",
      source: "स्रोत",
      change: "बदलें",
      refresh: "ताज़ा करें",
      pressure: "वायुदाब",
      feelsLike: "महसूस होता है",
      synopticTime: "स्थानीय समय",
      stationTelemetry: "स्टेशन टेलीमेट्री",
      loading: "मौसम डेटा लोड हो रहा है...",
      searchPlaceholder: "शहर, हवाई अड्डा या निर्देशांक खोजें...",
      briefing: "मौसम ब्रिफिंग",
      playing: "चल रहा है...",
      preparing: "तैयार हो रहा है...",
      settings: "सेटिंग्स",
      locateMe: "मेरा स्थान",
      locating: "खोज रहा है...",
      clear: "साफ़ करें",
      reset: "रीसेट करें",
      done: "पूर्ण",
      save: "सहेजें",
      saved: "सहेजा गया",
      cancel: "रद्द करें",
      today: "आज",
      now: "अभी",
      high: "अधिकतम",
      low: "न्यूनतम",
      shareStation: "स्टेशन साझा करें",
      copied: "लिंक क्लिपबोर्ड पर कॉपी हो गया!",
      advisorySystem: "मौसम विज्ञान संबंधी सलाह प्रणाली",
      noActiveAlerts: "अवलोकन क्षेत्र में वायुमंडलीय स्थिति सामान्य है।",
      activeBulletin: "सक्रिय बुलेटिन",
      precip: "बारिश",
    },
    tabs: {
      overview: "अवलोकन",
      charts: "ग्राफ़ और रुझान",
      radar: "रडार और उपग्रह",
      airQuality: "वायु गुणवत्ता और स्वास्थ्य",
      climate: "जलवायु और इतिहास",
      compare: "स्टेशन तुलना",
    },
    hero: {
      min: "न्यूनतम",
      max: "अधिकतम",
      wind: "हवा",
      humidity: "आर्द्रता",
      barometer: "दबाव",
      visibility: "दृश्यता",
      dewPoint: "ओस बिंदु",
      uvIndex: "यूवी सूचकांक",
      clouds: "बादल",
    },
    forecast: {
      hourlyTitle: "प्रति घंटा मौसम पूर्वानुमान",
      hourlyDesc: "48-घंटे का उच्च-सटीकता ताप और वर्षा वक्र",
      dailyTitle: "दैनिक मौसम दृष्टिकोण",
      dailyDesc: "विस्तृत साप्ताहिक वायुमंडलीय दृष्टिकोण",
      tenDayOutlook: "10-दिवसीय आउटलुक",
      pop: "वर्षा",
    },
    days: {
      MON: "सोम",
      TUE: "मंगल",
      WED: "बुध",
      THU: "गुरु",
      FRI: "शुक्र",
      SAT: "शनि",
      SUN: "रवि",
      TODAY: "आज",
    },
    conditions: {
      SUNNY: "साफ़ आसमान",
      CLEAR_NIGHT: "साफ़ रात",
      PARTLY_CLOUDY_DAY: "आंशिक रूप से बादल",
      PARTLY_CLOUDY_NIGHT: "आंशिक रूप से बादल",
      CLOUDY: "बादल छाए रहेंगे",
      FOG: "कोहरा और धुंध",
      RAIN: "बारिश",
      HEAVY_RAIN: "भारी बारिश",
      SNOW: "बर्फबारी",
      STORM: "आंधी-तूफान",
      WINDY: "तेज़ हवाएँ",
      "Clear Sky": "साफ़ आकाश",
      "Mainly Clear": "मुख्यतः साफ़",
      "Partly Cloudy": "आंशिक रूप से बादल",
      Overcast: "घने बादल",
      Drizzle: "बूंदाबांदी",
      "Freezing Drizzle": "शीतकालीन बूंदाबांदी",
      "Rain Showers": "वर्षा की फुहारें",
      "Violent Rain Showers": "मूसलाधार बारिश",
      "Snow Showers": "बर्फबारी की फुहारें",
      "Severe Thunderstorm": "भीषण आंधी-तूफान",
      "Fog & Depositing Rime": "घना कोहरा",
    },
    widgets: {
      wind: {
        title: "हवा टेलीमेट्री",
        subtitle: "वायुमंडलीय हवा गति एवं दिशा विश्लेषण",
        speed: "हवा की गति",
        gusts: "हवा के झोंके",
        direction: "हवा की दिशा",
        calm: "शांत",
        lightBreeze: "हल्की हवा",
        moderateBreeze: "मध्यम हवा",
        freshBreeze: "ताज़ा हवा",
        strongBreeze: "तेज़ हवा",
        gale: "तूफ़ानी हवा",
        storm: "भीषण तूफ़ान",
      },
      humidity: {
        title: "सापेक्ष आर्द्रता",
        subtitle: "वायुमंडलीय नमी और ओस संतृप्ति",
        relativeHumidity: "सापेक्ष आर्द्रता",
        dewPoint: "ओस बिंदु",
        dry: "शुष्क",
        comfortable: "आरामदायक",
        humid: "आर्द्र",
        veryHumid: "अत्यधिक नम",
      },
      airQuality: {
        title: "वायु गुणवत्ता सूचकांक",
        subtitle: "धूल कण एवं क्षोभमंडलीय प्रदूषक सांद्रता",
        index: "AQI",
        good: "अच्छा",
        moderate: "मध्यम",
        sensitive: "संवेदनशील वर्ग हेतु अस्वस्थ",
        unhealthy: "अस्वस्थ",
        veryUnhealthy: "अत्यंत अस्वस्थ",
        hazardous: "खतरनाक",
      },
      solar: {
        title: "सौर स्थिति एवं समय",
        subtitle: "सूर्य गति एवं दिन की अवधि",
        sunrise: "सूर्योदय",
        sunset: "सूर्यास्त",
        dayLength: "दिन की लंबाई",
        solarNoon: "दोपहर (मध्याह्न)",
        dawn: "भोर",
        dusk: "गोधूलि",
      },
      uv: {
        title: "पराबैंगनी (UV) विकिरण",
        subtitle: "सौर पराबैंगनी विकिरण सूचकांक",
        low: "कम",
        moderate: "मध्यम",
        high: "अधिक",
        veryHigh: "बहुत अधिक",
        extreme: "अत्यधिक गंभीर",
        protectionRequired: "दोपहर के समय धूप से बचाव आवश्यक है",
      },
    },
    settingsDialog: {
      title: "स्टेशन एवं एप्लिकेशन प्राथमिकताएं",
      subtitle: "मौसम संबंधी डेटा फीड, संख्यात्मक पूर्वानुमान मॉडल, माप मानक एवं ध्वनि टेलीमेट्री कॉन्फ़िगर करें",
      tabSource: "स्रोत एवं स्टेशन",
      tabLocations: "स्थान",
      tabApi: "एपीआई कुंजी",
      tabUnits: "इकाइयाँ",
      tabFavorites: "पसंदीदा",
      tabRegional: "क्षेत्रीय",
      tabSpeech: "ध्वनि एवं ऑडियो",
      tabTheme: "थीम",
      resetDefaults: "डिफ़ॉल्ट पर रीसेट करें",
      done: "पूर्ण",
      regional: {
        headerTitle: "सक्रिय क्षेत्रीय टेलीमेट्री एवं भाषा",
        headerSubtitle: "बहु-भाषा अनुवाद, समय एवं खगोलीय मानक",
        langTitle: "भाषा एवं क्षेत्रीय बोली",
        langDesc: "इंटरफ़ेस भाषा और स्थानीय मौसम शब्दावली चुनें",
        selectLanguagePlaceholder: "भाषा चुनें",
        timeTitle: "समय प्रारूप",
        timeDesc: "प्रति घंटा चार्ट एवं सौर स्थिति हेतु प्रारूप",
        time24Label: "24-घंटे का प्रारूप (सैन्य/विमानन)",
        time24Desc: "(00:00 – 23:59, सिनॉप्टिक ज़ुलु)",
        time12Label: "12-घंटे का मानक प्रारूप",
        time12Desc: "(नागरिक AM / PM)",
        dateTitle: "दिनांक प्रदर्शन मानक",
        dateDesc: "7-दिवसीय पूर्वानुमान एवं रडार लॉग हेतु कैलेंडर प्रारूप",
        coordTitle: "निर्देशांक एवं भूगणित",
        coordDesc: "अक्षांश एवं देशांतर सटीकता प्रारूप",
        clock: "घड़ी",
        zulu: "ज़ुलु",
        pattern: "प्रारूप",
        preview: "पूर्वावलोकन",
        system: "प्रणाली",
        sample: "नमूना",
        searchLanguagePlaceholder: "भाषा खोजें...",
        noLanguageFound: "कोई भाषा नहीं मिली।",
        voiceOnly: "केवल आवाज़",
        uiFallbackNotice: (languageName) =>
          `इंटरफ़ेस अंग्रेज़ी में दिखाया गया है; वॉइस ब्रीफ़िंग ${languageName} में होगी।`,
        dateFormats: {
          iso: "ISO 8601 (सिनॉप्टिक)",
          intl: "अंतरराष्ट्रीय मानक",
          us: "उत्तर अमेरिकी",
        },
        coordFormats: {
          decimal: "दशमलव डिग्री (DD)",
          dms: "डिग्री, मिनट, सेकंड (DMS)",
        },
      },
      units: {
        headerTitle: "मापन मानक",
        headerSubtitle: "वैश्विक मीट्रिक, इंपीरियल एवं मौसम विज्ञान इकाइयाँ",
        tempTitle: "तापमान इकाई",
        tempDesc: "थर्मोडायनामिक टेलीमेट्री हेतु प्रदर्शन मानक",
        windTitle: "हवा गति इकाई",
        windDesc: "हवा की गति मापने की मानक इकाई",
        pressureTitle: "दबाव इकाई",
        pressureDesc: "वायुमंडलीय दबाव मापन मानक",
        precipTitle: "वर्षा इकाई",
        precipDesc: "वर्षा संचय गहराई मानक",
        presets: { metric: "मीट्रिक", imperial: "इंपीरियल", custom: "कस्टम" },
        selectTempPlaceholder: "तापमान इकाई चुनें",
        selectWindPlaceholder: "हवा की इकाई चुनें",
        selectPressurePlaceholder: "दबाव इकाई चुनें",
        selectPrecipPlaceholder: "वर्षा इकाई चुनें",
        options: {
          temp: { C: "सेल्सियस (°C)", F: "फ़ारेनहाइट (°F)" },
          wind: {
            "m/s": "मीटर प्रति सेकंड (m/s)",
            "km/h": "किलोमीटर प्रति घंटा (km/h)",
            mph: "मील प्रति घंटा (mph)",
            knots: "नॉट (knots)",
          },
          pressure: {
            hPa: "हेक्टोपास्कल (hPa)",
            inHg: "पारे के इंच (inHg)",
            mmHg: "पारे के मिलीमीटर (mmHg)",
          },
          precip: { mm: "मिलीमीटर (mm)", in: "इंच (in)" },
        },
      },
      theme: {
        headerTitle: "डिस्प्ले थीम",
        headerSubtitle: "विज़ुअल कंट्रास्ट एवं OLED डिस्प्ले अनुकूलन",
        darkTitle: "गहरा (डार्क सिनॉप्टिक)",
        darkDesc: "रडार अवलोकन एवं कम रोशनी हेतु सर्वोत्तम",
        lightTitle: "हल्का (दिन का उजाला)",
        lightDesc: "तेज़ धूप में स्पष्ट दृश्यता हेतु उच्च कंट्रास्ट",
        systemTitle: "सिस्टम स्वचालित",
        systemDesc: "ऑपरेटिंग सिस्टम के रंग रूप का स्वतः अनुसरण करता है",
        darkSubtitle: "रात्रि रडार",
        darkBadge: "OLED ब्लैक",
        lightSubtitle: "उच्च कंट्रास्ट",
        lightBadge: "दिन का उजाला",
        systemSubtitle: "सिस्टम के अनुसार",
        systemBadge: "अनुकूली",
      },
      tabDescriptions: {
        locations: "पसंदीदा मौसम स्टेशन और पिन किए गए टेलीमेट्री बिंदु",
        source: "संख्यात्मक मौसम पूर्वानुमान इंजन और रडार टेलीमेट्री फ़ीड",
        api: "OpenWeatherMap API क्रेडेंशियल",
        units: "वायुमंडलीय, तापीय और हवा की गति की माप इकाइयाँ",
        localization: "इंटरफ़ेस भाषा, 24-घंटे की घड़ी और भू-निर्देशांक",
        speech: "बहुभाषी न्यूरल आवाज़ का स्वर, गति, पिच और EQ",
        appearance: "डार्क रडार थीम और इंटरफ़ेस की दृश्य शैली",
      },
      autoSourceBadge: "स्वतः",
      resetConfirmTitle: "सभी प्राथमिकताएँ रीसेट करें?",
      resetConfirmDesc:
        "इकाइयाँ, भाषा, डेटा स्रोत, आवाज़ सेटिंग्स और सहेजी गई API कुंजियाँ डिफ़ॉल्ट पर लौट जाएँगी। पिन किए गए स्थान बने रहेंगे।",
      scrollTabsLeft: "टैब बाईं ओर स्क्रॉल करें",
      scrollTabsRight: "टैब दाईं ओर स्क्रॉल करें",
      sectionPicker: "सेटिंग्स अनुभाग",
      source: {
        feedTitle: "सक्रिय टेलीमेट्री फ़ीड",
        live: "लाइव",
        feedDesc: "रीयल-टाइम वायुमंडलीय मॉडलिंग और अवलोकन सिंक्रोनाइज़र",
        model: "मॉडल",
        providerTitle: "मौसम डेटा प्रदाता (स्रोत)",
        providerDesc: "अवलोकन और मुख्य सिनॉप्टिक डेटा प्रदाता चुनें",
        providerAria: "मौसम डेटा प्रदाता",
        apiKeyRequired: "API कुंजी आवश्यक",
        keyless: "बिना कुंजी",
        customOwmKeyActive: "कस्टम OpenWeatherMap API कुंजी सक्रिय है।",
        sharedServerKey: "साझा सर्वर कुंजी का उपयोग हो रहा है।",
        configuredInApiTab: "API कुंजियाँ टैब में कॉन्फ़िगर करें",
        nwpTitle: "संख्यात्मक मौसम पूर्वानुमान (NWP) मॉडल",
        nwpDesc: "पूर्वानुमान के लिए वायुमंडलीय भौतिकी सिमुलेशन मॉडल चुनें",
        stationNoticeTitle: "मॉडल संबंधी सूचना",
        stationNoticeDesc:
          "OpenWeatherMap, OWM स्टेशन सहमति का उपयोग करता है। नीचे चुना गया मॉडल तब लागू होता है जब Open-Meteo या ऑटो फ़ेलओवर सक्रिय हो।",
        selectNwpPlaceholder: "NWP मॉडल चुनें",
      },
      apiKeys: {
        headerTitle: "API प्रमाणीकरण और कोटा",
        credentialsBadge: "क्रेडेंशियल",
        headerDesc:
          "समर्पित हाई-फ़्रीक्वेंसी टेलीमेट्री और न्यूरल आवाज़ के लिए अपनी API कुंजियाँ प्रबंधित करें",
        customSetCount: (count, total) => `${count} / ${total} कस्टम सेट`,
        customSet: "कस्टम सेट",
        serverShared: "सर्वर साझा",
        studioShared: "Studio साझा",
        showKey: "कुंजी दिखाएँ",
        hideKey: "कुंजी छिपाएँ",
        enterKeyToTest: "जाँचने के लिए कुंजी दर्ज करें",
        owmTitle: "OpenWeatherMap API कुंजी",
        owmDesc:
          "वर्तमान मौसम अवलोकन, हर 3 घंटे का पूर्वानुमान और जियोकोडिंग सेवाएँ प्रदान करती है।",
        owmPlaceholder: "उदा. 32-अक्षरों की OpenWeatherMap कुंजी",
        showOwmKey: "OpenWeatherMap कुंजी दिखाएँ",
        hideOwmKey: "OpenWeatherMap कुंजी छिपाएँ",
        testConnection: "कनेक्शन जाँचें",
        owmHelp:
          "साझा सर्वर कुंजी उपयोग करने के लिए खाली छोड़ें। अपनी API कुंजी यहाँ से प्राप्त करें:",
        testKey: "कुंजी जाँचें",
        keyVerified: "कुंजी सत्यापित",
        keyTestFailed: "कुंजी जाँच विफल",
        testingKey: "कुंजी जाँची जा रही है...",
        contactingOwm: "OpenWeatherMap से संपर्क किया जा रहा है...",
        owmAccepted: "OpenWeatherMap ने कुंजी स्वीकार कर ली।",
        testLocationFallback: "परीक्षण स्थान",
        liveReading: (place, reading) => `${place} की लाइव रीडिंग: ${reading}।`,
        humidityValue: (percent) => `${percent}% आर्द्रता`,
        testFailedHttp: (status) => `कुंजी जाँच विफल (HTTP ${status})।`,
        testTimedOut: (seconds) => `जाँच ${seconds} सेकंड बाद टाइम आउट हो गई।`,
        networkError: "कुंजी जाँचते समय नेटवर्क त्रुटि हुई।",
      },
      locations: {
        activeStation: "सक्रिय मौसम स्टेशन",
        liveSync: "लाइव सिंक",
        monitoringLabel: "लाइव टेलीमेट्री की निगरानी:",
        savedCount: (count, max) => `${count}/${max} सहेजे गए`,
        addTitle: "स्टेशन जोड़ें और खोजें",
        addDesc:
          "दुनिया भर के अवलोकन स्थल खोजें या क्षेत्रीय और प्रमुख मौसम केंद्र देखें।",
        pinnedCount: (count, max) => `${count}/${max} पिन किए गए`,
        limitCount: (count, max) => `${count}/${max} सीमा`,
        searchAria: "पिन करने के लिए स्टेशन खोजें",
        searchPlaceholder:
          "शहर, हवाई अड्डा या निर्देशांक खोजें (उदा. Madrid, Zurich, 28.65, 77.23)...",
        maxPinnedPlaceholder: (max) => `अधिकतम ${max} स्टेशन पिन हैं (सीमा पूरी)...`,
        clearSearch: "खोज साफ़ करें",
        resultsTitle: "स्टेशन खोज परिणाम",
        resultsAria: "स्टेशन खोज परिणाम",
        searching: "खोजा जा रहा है...",
        foundCount: (count) => `${count} मिले`,
        locatingStations: "मौसम स्टेशन खोजे जा रहे हैं…",
        pinned: "पिन किया गया",
        limitBadge: (max) => `सीमा ${max}/${max}`,
        pin: "पिन करें",
        noStationTitle: "कोई स्टेशन नहीं मिला",
        noStationDesc: (query) =>
          `“${query}” के लिए कोई स्टेशन नहीं मिला। अलग वर्तनी या पास का कोई बड़ा शहर आज़माएँ।`,
        feedbackNoMatch: "कोई मेल खाता स्टेशन नहीं मिला। पिन करने के लिए सूची से कोई परिणाम चुनें।",
        feedbackAllPinned: "सभी मेल खाते स्टेशन पहले से पिन हैं।",
        nearbyTab: "आस-पास के स्टेशन",
        popularTab: "लोकप्रिय केंद्र",
        near: (city) => `${city} के पास`,
        scanningNearby: "क्षेत्रीय टेलीमेट्री स्टेशन खोजे जा रहे हैं...",
        pinNearbyAria: (city, distanceKm) => `${city} पिन करें, ${distanceKm} किमी दूर`,
        pinAria: (city) => `${city} पिन करें`,
        nearbyErrorTitle: "आस-पास के स्टेशन लोड नहीं हो सके",
        nearbyErrorDesc: "क्षेत्रीय स्टेशन खोज विफल रही। अपना कनेक्शन जाँचें और फिर से प्रयास करें।",
        retry: "फिर से प्रयास करें",
        locationUnknownTitle: "स्थान अज्ञात",
        locationUnknownDesc:
          "वर्तमान निर्देशांक अभी उपलब्ध नहीं हैं। लोकप्रिय केंद्र देखें या ऊपर खोजें।",
        allNearbySavedTitle: "सभी आस-पास के स्टेशन सहेजे गए",
        allNearbySavedDesc: "इस दायरे के सभी क्षेत्रीय टेलीमेट्री स्टेशन पहले से आपके पसंदीदा में हैं।",
        noRegionalTitle: "कोई क्षेत्रीय स्टेशन नहीं मिला",
        noRegionalDesc:
          "वर्तमान निर्देशांक के पास कोई क्षेत्रीय स्टेशन नहीं मिला। लोकप्रिय केंद्र देखें या ऊपर खोजें।",
        allPopularAddedTitle: "सभी लोकप्रिय केंद्र जोड़े गए",
        allPopularAddedDesc: "सभी डिफ़ॉल्ट प्रमुख क्षेत्रीय केंद्र पहले से आपके पसंदीदा में हैं।",
        noPinnedTitle: "कोई पिन किया गया स्टेशन नहीं",
        noPinnedDesc:
          "एक क्लिक में पहुँच के लिए ऊपर से अपने अक्सर देखे जाने वाले स्थान या वेधशालाएँ जोड़ें।",
        savedTitle: "सहेजे गए स्टेशन",
        savedDesc: (count, max) =>
          `त्वरित टेलीमेट्री पहुँच के लिए ${count} / ${max} स्टेशन सहेजे गए`,
        groundStation: "भू-स्टेशन टेलीमेट्री",
        selectStation: "स्टेशन चुनें",
        showWeatherFor: (city) => `${city} का मौसम दिखाएँ`,
        removeFromFavorites: "पसंदीदा से हटाएँ",
        removeAria: (city) => `${city} को पसंदीदा से हटाएँ`,
      },
      speech: {
        engineTitle: "Edge न्यूरल टेक्स्ट-टू-स्पीच इंजन",
        personaTitle: "वाचक की आवाज़ और स्वर",
        personaDesc: "बहुभाषी न्यूरल वाचक चुनें और उसकी आवाज़ का नमूना सुनें।",
        recentVoices: "हाल की आवाज़ें",
        filterByTone: "टोन के अनुसार फ़िल्टर करें",
        allTonesShort: "सभी",
        allTones: "सभी टोन",
        allVoices: "सभी आवाज़ें",
        maleVoices: "पुरुष आवाज़ें",
        femaleVoices: "महिला आवाज़ें",
        noVoicesWithTone: (tone) => `“${tone}” टोन वाली कोई आवाज़ नहीं मिली`,
        noMaleVoicesWithTone: (tone) => `“${tone}” टोन वाली कोई पुरुष आवाज़ नहीं`,
        noFemaleVoicesWithTone: (tone) => `“${tone}” टोन वाली कोई महिला आवाज़ नहीं`,
        male: "पुरुष",
        female: "महिला",
        playPreview: "आवाज़ का नमूना चलाएँ",
        pausePreview: "आवाज़ का नमूना रोकें",
        resumePreview: "आवाज़ का नमूना फिर से चलाएँ",
        loading: "लोड हो रहा है...",
        pause: "रोकें",
        resume: "जारी रखें",
        stop: "बंद करें",
        playAudition: "नमूना सुनें",
        script: "पाठ:",
        genericVoiceNotice: (voiceName) =>
          `मुफ़्त Edge न्यूरल आवाज़ सेवा तक पहुँचा नहीं जा सका, इसलिए इस नमूने में ${voiceName} के बजाय आपके ब्राउज़र की अंतर्निहित आवाज़ का उपयोग हुआ। कुछ देर बाद फिर से प्रयास करें।`,
        velocityTitle: "बोलने की गति",
        velocityDesc:
          "तैयार ऑडियो पर लागू ब्राउज़र प्लेबैक गति (आवाज़ स्वयं सामान्य गति पर तैयार होती है)",
        velocityValueText: (rate) => `${rate} गुना प्लेबैक गति`,
        pitchTitle: "आवाज़ की पिच",
        pitchDesc:
          "सेमीटोन में पिच बदलाव। केवल ब्राउज़र की बैकअप आवाज़ में उपयोग होता है; न्यूरल आवाज़ें इसे अनदेखा करती हैं।",
        pitchValueText: (semitones) =>
          `${semitones > 0 ? "प्लस " : semitones < 0 ? "माइनस " : ""}${Math.abs(semitones).toFixed(1)} सेमीटोन`,
        volumeTitle: "वॉल्यूम गेन अंशांकन",
        volumeDesc: "ब्राउज़र में लागू प्लेबैक वॉल्यूम, डेसिबल में (0 dB = पूरा वॉल्यूम)",
        volumeValueText: (decibels) => `${decibels} डेसिबल`,
        autoBriefingTitle: "स्वचालित ऑडियो मौसम ब्रीफ़िंग",
        autoBriefingDesc: "स्टेशन चुनने या ऐप शुरू होने पर सारांश अपने आप पढ़कर सुनाता है।",
        deliveryTitle: "बोलने की शैली",
        deliveryDesc:
          "मूड के अनुसार न्यूरल आवाज़ की गति और पिच समायोजित करता है। ब्राउज़र की बैकअप आवाज़ पर लागू नहीं होता।",
        deliveryStyles: {
          meteorological: "समाचार वाचक",
          calm: "शांत",
          cheerful: "प्रसन्न",
          energetic: "ऊर्जावान",
          authoritative: "आधिकारिक",
        },
        tones: {
          Firm: "दृढ़",
          Upbeat: "उत्साही",
          Informative: "जानकारीपूर्ण",
          Bright: "जीवंत",
          Smooth: "मधुर",
          Excitable: "उत्तेजक",
          Youthful: "युवा",
          Breezy: "हल्का-फुल्का",
          "Easy-going": "सहज",
          Breathy: "श्वासमय",
          Clear: "स्पष्ट",
          Gravelly: "खुरदुरा",
          Soft: "कोमल",
          Even: "संतुलित",
          Mature: "परिपक्व",
          Forward: "प्रखर",
          Friendly: "मैत्रीपूर्ण",
          Casual: "अनौपचारिक",
          Gentle: "सौम्य",
          Lively: "जोशीला",
          Knowledgeable: "जानकार",
          Warm: "गर्मजोशी भरा",
        },
        visualizer: {
          live: "लाइव ध्वनिक टेलीमेट्री",
          paused: "प्लेबैक रुका हुआ",
          synthesizing: "न्यूरल ऑडियो तैयार हो रहा है...",
          idle: "ध्वनिक स्पेक्ट्रम मॉनिटर",
          tone: "टोन",
          pitch: "पिच",
          rate: "गति",
          positionAria: "ऑडियो प्लेबैक स्थिति",
          positionText: (current, total) => `${total} में से ${current}`,
          noAudio: "कोई ऑडियो लोड नहीं है",
        },
      },
    },
    header: {
      home: "OpenWeather होम",
      currentStationGps: "वर्तमान स्टेशन (GPS)",
      detecting: "पता लगाया जा रहा है...",
      gpsLocked: "GPS लॉक",
      clickToLoadStation: "स्टेशन लोड करने के लिए क्लिक करें",
      autoDetectStation: "डिवाइस सेंसर से मौसम स्टेशन का स्वतः पता लगाएँ",
      locateAction: "स्थान खोजें →",
      locatingStations: "स्टेशन खोजे जा रहे हैं…",
      geocodingMatches: "जियोकोडिंग परिणाम",
      noStationFound: (query) => `“${query}” के लिए कोई मौसम स्टेशन नहीं मिला`,
      popularHubs: "लोकप्रिय केंद्र",
      aiAdvisor: "AI सलाहकार",
      aiAdvisorDesc: "AI सिनॉप्टिक विश्लेषण और अचानक बदलावों की पहचान",
      sourceDesc: "मौसम डेटा प्रदाता और पूर्वानुमान मॉडल",
      locateDesc: "अपने वर्तमान स्थान का मौसम लोड करें",
      openMenu: "मेनू खोलें",
      mainMenu: "मुख्य मेनू",
      switchToLight: "लाइट मोड पर जाएँ",
      switchToDark: "डार्क मोड पर जाएँ",
      toggleTheme: "थीम बदलें",
    },
  },

  es: {
    common: {
      stationTelemetryActive: "Telemetría de Estación Activa",
      source: "Fuente",
      change: "CAMBIAR",
      refresh: "Actualizar",
      pressure: "Presión",
      feelsLike: "Sensación térmica",
      synopticTime: "Hora Sinóptica",
      stationTelemetry: "Telemetría de Estación",
      loading: "Cargando datos meteorológicos...",
      searchPlaceholder: "Buscar ciudad, aeropuerto, coordenadas...",
      briefing: "Informe",
      playing: "Reproduciendo...",
      preparing: "Preparando...",
      settings: "Configuración",
      locateMe: "Mi Ubicación",
      locating: "Ubicando...",
      clear: "Limpiar",
      reset: "Restablecer",
      done: "Listo",
      save: "Guardar",
      saved: "Guardado",
      cancel: "Cancelar",
      today: "Hoy",
      now: "Ahora",
      high: "Máx",
      low: "Mín",
      shareStation: "Compartir Estación",
      copied: "¡Enlace copiado al portapapeles!",
      advisorySystem: "Sistema de Asesoramiento Meteorológico",
      noActiveAlerts: "Condiciones atmosféricas normales en el sector de observación.",
      activeBulletin: "Boletín Activo",
      precip: "lluvia",
    },
    tabs: {
      overview: "Vista General",
      charts: "Gráficos y Tendencias",
      radar: "Radar y Satélite",
      airQuality: "Calidad del Aire",
      climate: "Histórico y Clima",
      compare: "Comparación de Estaciones",
    },
    hero: {
      min: "Mín",
      max: "Máx",
      wind: "Viento",
      humidity: "Humedad",
      barometer: "Presión",
      visibility: "Visibilidad",
      dewPoint: "Punto de rocío",
      uvIndex: "Índice UV",
      clouds: "Nubes",
    },
    forecast: {
      hourlyTitle: "Telemetría Horaria",
      hourlyDesc: "Curva de pronóstico termodinámico de 48 horas",
      dailyTitle: "Pronóstico Meteorológico Diario",
      dailyDesc: "Perspectiva sinóptica extendida y trayectoria térmica",
      tenDayOutlook: "Pronóstico 10 Días",
      pop: "prob. lluvia",
    },
    days: {
      MON: "Lun",
      TUE: "Mar",
      WED: "Mié",
      THU: "Jue",
      FRI: "Vie",
      SAT: "Sáb",
      SUN: "Dom",
      TODAY: "Hoy",
    },
    conditions: {
      SUNNY: "Despejado",
      CLEAR_NIGHT: "Noche Despejada",
      PARTLY_CLOUDY_DAY: "Parcialmente Nublado",
      PARTLY_CLOUDY_NIGHT: "Parcialmente Nublado",
      CLOUDY: "Nublado",
      FOG: "Niebla y Bruma",
      RAIN: "Lluvia",
      HEAVY_RAIN: "Lluvia Fuerte",
      SNOW: "Nieve",
      STORM: "Tormenta Eléctrica",
      WINDY: "Viento Fuerte",
      "Clear Sky": "Cielo Despejado",
      "Mainly Clear": "Mayormente Despejado",
      "Partly Cloudy": "Parcialmente Nublado",
      Overcast: "Cubierto",
      Drizzle: "Llovizna",
      "Freezing Drizzle": "Llovizna Helada",
      "Rain Showers": "Chubascos",
      "Violent Rain Showers": "Chubascos Torrenciales",
      "Snow Showers": "Chubascos de Nieve",
      "Severe Thunderstorm": "Tormenta Severa",
      "Fog & Depositing Rime": "Niebla Densa",
    },
    widgets: {
      wind: {
        title: "Telemetría del Viento",
        subtitle: "Vector atmosférico y registro de ráfagas",
        speed: "Velocidad del Viento",
        gusts: "Ráfagas",
        direction: "Dirección",
        calm: "Calma",
        lightBreeze: "Brisa Ligera",
        moderateBreeze: "Brisa Moderada",
        freshBreeze: "Brisa Fresca",
        strongBreeze: "Viento Fuerte",
        gale: "Temporal",
        storm: "Tormenta Violenta",
      },
      humidity: {
        title: "Humedad Relativa",
        subtitle: "Humedad atmosférica y saturación de rocío",
        relativeHumidity: "Humedad Relativa",
        dewPoint: "Punto de Rocío",
        dry: "Seco",
        comfortable: "Confortable",
        humid: "Húmedo",
        veryHumid: "Muy Húmedo",
      },
      airQuality: {
        title: "Calidad del Aire",
        subtitle: "Partículas en suspensión y contaminantes",
        index: "ICA",
        good: "Buena",
        moderate: "Moderada",
        sensitive: "Insalubre para Sensibles",
        unhealthy: "Insalubre",
        veryUnhealthy: "Muy Insalubre",
        hazardous: "Peligrosa",
      },
      solar: {
        title: "Efemérides Solares",
        subtitle: "Arco celeste y trayectoria de luz diurna",
        sunrise: "Amanecer",
        sunset: "Atardecer",
        dayLength: "Duración del Día",
        solarNoon: "Mediodía Solar",
        dawn: "Amanecer",
        dusk: "Ocaso",
      },
      uv: {
        title: "Radiación UV",
        subtitle: "Exposición a radiación solar ultravioleta",
        low: "Bajo",
        moderate: "Moderado",
        high: "Alto",
        veryHigh: "Muy Alto",
        extreme: "Extremo",
        protectionRequired: "Protección recomendada durante el mediodía",
      },
    },
    settingsDialog: {
      title: "Preferencias de la Estación y Aplicación",
      subtitle: "Configurar fuentes meteorológicas, modelos numéricos, unidades de medida y telemetría de voz",
      tabSource: "Fuente y Estación",
      tabLocations: "Ubicaciones",
      tabApi: "Claves API",
      tabUnits: "Unidades",
      tabFavorites: "Favoritos",
      tabRegional: "Regional",
      tabSpeech: "Voz y Audio",
      tabTheme: "Tema",
      resetDefaults: "Restablecer Valores",
      done: "Listo",
      regional: {
        headerTitle: "TELEMETRÍA REGIONAL ACTIVA",
        headerSubtitle: "Traducción multiidioma, cronometría y estándares astronómicos",
        langTitle: "Idioma y Dialecto Regional",
        langDesc: "Seleccionar idioma de interfaz y terminología localizada",
        selectLanguagePlaceholder: "Seleccionar idioma",
        timeTitle: "Representación del Tiempo",
        timeDesc: "Formato en gráficos horarios y efemérides",
        time24Label: "Formato Militar 24 Horas",
        time24Desc: "(00:00 – 23:59, Sinóptico Zulu)",
        time12Label: "Formato Estándar 12 Horas",
        time12Desc: "(Civil AM / PM)",
        dateTitle: "Estándar de Fecha",
        dateDesc: "Formato de calendario para pronósticos de 7 días y radares",
        coordTitle: "Coordenadas y Geodesia",
        coordDesc: "Formato de precisión de latitud y longitud",
        clock: "Reloj",
        zulu: "Zulu",
        pattern: "Patrón",
        preview: "Vista",
        system: "Sistema",
        sample: "Muestra",
        searchLanguagePlaceholder: "Buscar idioma...",
        noLanguageFound: "No se encontró ningún idioma.",
        voiceOnly: "Solo voz",
        uiFallbackNotice: (languageName) =>
          `La interfaz se muestra en inglés; los boletines de voz usan ${languageName}.`,
        dateFormats: {
          iso: "ISO 8601 (Sinóptico)",
          intl: "Estándar internacional",
          us: "Norteamericano",
        },
        coordFormats: {
          decimal: "Grados decimales (DD)",
          dms: "Grados, minutos y segundos (DMS)",
        },
      },
      units: {
        headerTitle: "ESTÁNDARES DE MEDICIÓN",
        headerSubtitle: "Unidades métricas, imperiales y sinópticas internacionales",
        tempTitle: "Unidad de Temperatura",
        tempDesc: "Estándar de visualización termodinámica",
        windTitle: "Unidad de Viento",
        windDesc: "Medición de velocidad para telemetría vectorial",
        pressureTitle: "Unidad de Presión",
        pressureDesc: "Estándar de presión atmosférica barométrica",
        precipTitle: "Unidad de Precipitación",
        precipDesc: "Estándar de acumulación pluviométrica",
        presets: { metric: "Métrico", imperial: "Imperial", custom: "Personalizado" },
        selectTempPlaceholder: "Selecciona la unidad de temperatura",
        selectWindPlaceholder: "Selecciona la unidad de viento",
        selectPressurePlaceholder: "Selecciona la unidad de presión",
        selectPrecipPlaceholder: "Selecciona la unidad de precipitación",
        options: {
          temp: { C: "Celsius (°C)", F: "Fahrenheit (°F)" },
          wind: {
            "m/s": "Metros por segundo (m/s)",
            "km/h": "Kilómetros por hora (km/h)",
            mph: "Millas por hora (mph)",
            knots: "Nudos (knots)",
          },
          pressure: {
            hPa: "Hectopascales (hPa)",
            inHg: "Pulgadas de mercurio (inHg)",
            mmHg: "Milímetros de mercurio (mmHg)",
          },
          precip: { mm: "Milímetros (mm)", in: "Pulgadas (in)" },
        },
      },
      theme: {
        headerTitle: "TEMA DE PANTALLA",
        headerSubtitle: "Calibración de contraste y optimización para pantallas OLED",
        darkTitle: "Oscuro Sinóptico",
        darkDesc: "Óptimo para observación de radar y descanso visual",
        lightTitle: "Luz Diurna",
        lightDesc: "Contraste nítido para entornos con luz brillante",
        systemTitle: "Dinámico del Sistema",
        systemDesc: "Sigue automáticamente el modo del sistema operativo",
        darkSubtitle: "Radar nocturno",
        darkBadge: "Negro OLED",
        lightSubtitle: "Alto contraste",
        lightBadge: "Luz diurna",
        systemSubtitle: "Según el sistema",
        systemBadge: "Adaptativo",
      },
      tabDescriptions: {
        locations: "Estaciones meteorológicas favoritas y puntos de telemetría fijados",
        source: "Motores de predicción numérica y fuente de telemetría de radar",
        api: "Credenciales de API de OpenWeatherMap",
        units: "Unidades de medida atmosféricas, térmicas y de velocidad del viento",
        localization: "Idioma de la interfaz, reloj sinóptico de 24 h y cuadrícula geodésica",
        speech:
          "Timbre, velocidad, tono y ecualización de la voz neuronal multilingüe",
        appearance: "Tema oscuro de radar y estilo visual de la interfaz",
      },
      autoSourceBadge: "Auto",
      resetConfirmTitle: "¿Restablecer todas las preferencias?",
      resetConfirmDesc:
        "Las unidades, el idioma, la fuente de datos, los ajustes de voz y las claves API guardadas volverán a sus valores predeterminados. Las ubicaciones fijadas se conservan.",
      scrollTabsLeft: "Desplazar pestañas a la izquierda",
      scrollTabsRight: "Desplazar pestañas a la derecha",
      sectionPicker: "Sección de ajustes",
      source: {
        feedTitle: "Fuente de telemetría activa",
        live: "EN VIVO",
        feedDesc: "Sincronizador de modelado atmosférico y observaciones en tiempo real",
        model: "Modelo",
        providerTitle: "Proveedor de datos meteorológicos (fuente)",
        providerDesc: "Selecciona el proveedor principal de observaciones y datos sinópticos",
        providerAria: "Proveedor de datos meteorológicos",
        apiKeyRequired: "Requiere clave API",
        keyless: "Sin clave",
        customOwmKeyActive: "Clave API personalizada de OpenWeatherMap activa.",
        sharedServerKey: "Usando la clave compartida del servidor.",
        configuredInApiTab: "Se configura en la pestaña Claves API",
        nwpTitle: "Estación de pronóstico de predicción numérica (NWP)",
        nwpDesc: "Elige el modelo de simulación física atmosférica para el pronóstico",
        stationNoticeTitle: "Aviso sobre el modelo",
        stationNoticeDesc:
          "OpenWeatherMap usa el consenso de estaciones de OWM. La selección de modelo de abajo se aplica cuando Open-Meteo o la conmutación automática están activos.",
        selectNwpPlaceholder: "Selecciona un modelo NWP",
      },
      apiKeys: {
        headerTitle: "Autenticación y cuotas de API",
        credentialsBadge: "CREDENCIALES",
        headerDesc:
          "Gestiona tus claves API personales para telemetría de alta frecuencia y voces neuronales dedicadas",
        customSetCount: (count, total) => `${count} / ${total} personalizadas`,
        customSet: "Personalizada",
        serverShared: "Compartida del servidor",
        studioShared: "Compartida de Studio",
        showKey: "Mostrar clave",
        hideKey: "Ocultar clave",
        enterKeyToTest: "Introduce una clave para probarla",
        owmTitle: "Clave API de OpenWeatherMap",
        owmDesc:
          "Proporciona observaciones actuales, pronósticos cada 3 horas y servicios de geocodificación.",
        owmPlaceholder: "p. ej., clave de OpenWeatherMap de 32 caracteres",
        showOwmKey: "Mostrar clave de OpenWeatherMap",
        hideOwmKey: "Ocultar clave de OpenWeatherMap",
        testConnection: "Probar conexión",
        owmHelp:
          "Déjala en blanco para usar la clave compartida del servidor. Obtén una clave API propia en",
        testKey: "Probar clave",
        keyVerified: "Clave verificada",
        keyTestFailed: "La prueba de la clave falló",
        testingKey: "Probando clave...",
        contactingOwm: "Contactando con OpenWeatherMap...",
        owmAccepted: "OpenWeatherMap aceptó la clave.",
        testLocationFallback: "la ubicación de prueba",
        liveReading: (place, reading) => `Lectura en vivo para ${place}: ${reading}.`,
        humidityValue: (percent) => `${percent}% de humedad`,
        testFailedHttp: (status) => `La prueba de la clave falló (HTTP ${status}).`,
        testTimedOut: (seconds) => `La prueba superó el tiempo límite de ${seconds} segundos.`,
        networkError: "Error de red al probar la clave.",
      },
      locations: {
        activeStation: "Estación meteorológica activa",
        liveSync: "SINCRONIZACIÓN EN VIVO",
        monitoringLabel: "Monitoreando telemetría en vivo de",
        savedCount: (count, max) => `${count}/${max} guardadas`,
        addTitle: "Añadir y descubrir estaciones",
        addDesc:
          "Busca puntos de observación de todo el mundo o descubre centros meteorológicos regionales y principales.",
        pinnedCount: (count, max) => `${count}/${max} fijadas`,
        limitCount: (count, max) => `${count}/${max} límite`,
        searchAria: "Buscar estaciones para fijar",
        searchPlaceholder:
          "Busca ciudad, aeropuerto o coordenadas (p. ej., Madrid, Zúrich, 28.65, 77.23)...",
        maxPinnedPlaceholder: (max) => `Máximo de ${max} estaciones fijadas (límite alcanzado)...`,
        clearSearch: "Borrar búsqueda",
        resultsTitle: "Resultados de la búsqueda",
        resultsAria: "Resultados de búsqueda de estaciones",
        searching: "Buscando...",
        foundCount: (count) => `${count} encontradas`,
        locatingStations: "Localizando estaciones meteorológicas…",
        pinned: "Fijada",
        limitBadge: (max) => `Límite ${max}/${max}`,
        pin: "Fijar",
        noStationTitle: "No se encontró ninguna estación",
        noStationDesc: (query) =>
          `No se encontró ninguna estación para «${query}». Prueba otra ortografía o una ciudad más grande cercana.`,
        feedbackNoMatch:
          "No hay ninguna estación coincidente. Elige un resultado de la lista para fijarlo.",
        feedbackAllPinned: "Todas las estaciones coincidentes ya están fijadas.",
        nearbyTab: "Estaciones cercanas",
        popularTab: "Centros populares",
        near: (city) => `Cerca de ${city}`,
        scanningNearby: "Buscando estaciones de telemetría regionales...",
        pinNearbyAria: (city, distanceKm) => `Fijar ${city}, a ${distanceKm} km`,
        pinAria: (city) => `Fijar ${city}`,
        nearbyErrorTitle: "No se pudieron cargar las estaciones cercanas",
        nearbyErrorDesc:
          "Falló la búsqueda de estaciones regionales. Comprueba tu conexión e inténtalo de nuevo.",
        retry: "Reintentar",
        locationUnknownTitle: "Ubicación desconocida",
        locationUnknownDesc:
          "Las coordenadas actuales aún no están disponibles. Prueba con Centros populares o busca arriba.",
        allNearbySavedTitle: "Todas las estaciones cercanas guardadas",
        allNearbySavedDesc:
          "Todas las estaciones de telemetría regionales de esta zona ya están en tus favoritos.",
        noRegionalTitle: "No se detectaron estaciones regionales",
        noRegionalDesc:
          "No hay estaciones regionales cerca de las coordenadas actuales. Prueba con Centros populares o busca arriba.",
        allPopularAddedTitle: "Todos los centros populares añadidos",
        allPopularAddedDesc:
          "Todos los centros regionales principales predeterminados ya están en tus favoritos.",
        noPinnedTitle: "No hay estaciones fijadas",
        noPinnedDesc:
          "Añade arriba tus ubicaciones frecuentes u observatorios para acceder a ellos con un solo clic.",
        savedTitle: "Estaciones guardadas",
        savedDesc: (count, max) =>
          `${count} / ${max} estaciones guardadas para acceso rápido a la telemetría`,
        groundStation: "Telemetría de estación terrestre",
        selectStation: "Seleccionar estación",
        showWeatherFor: (city) => `Ver el tiempo en ${city}`,
        removeFromFavorites: "Quitar de favoritos",
        removeAria: (city) => `Quitar ${city} de favoritos`,
      },
      speech: {
        engineTitle: "Motor neuronal de texto a voz de Edge",
        personaTitle: "Voz y timbre del narrador",
        personaDesc:
          "Elige un narrador neuronal multilingüe y escucha una muestra de su voz.",
        recentVoices: "Voces recientes",
        filterByTone: "Filtrar por tono",
        allTonesShort: "Todos",
        allTones: "Todos los tonos",
        allVoices: "Todas las voces",
        maleVoices: "Voces masculinas",
        femaleVoices: "Voces femeninas",
        noVoicesWithTone: (tone) => `No hay voces con el tono «${tone}»`,
        noMaleVoicesWithTone: (tone) => `No hay voces masculinas con el tono «${tone}»`,
        noFemaleVoicesWithTone: (tone) => `No hay voces femeninas con el tono «${tone}»`,
        male: "Masculina",
        female: "Femenina",
        playPreview: "Reproducir muestra de voz",
        pausePreview: "Pausar muestra de voz",
        resumePreview: "Reanudar muestra de voz",
        loading: "Cargando...",
        pause: "Pausar",
        resume: "Reanudar",
        stop: "Detener",
        playAudition: "Escuchar muestra",
        script: "Guion:",
        genericVoiceNotice: (voiceName) =>
          `No se pudo acceder al servicio gratuito de voces neuronales de Edge, así que esta muestra usó la voz integrada de tu navegador en lugar de ${voiceName}. Inténtalo de nuevo en un momento.`,
        velocityTitle: "Velocidad de la voz",
        velocityDesc:
          "Velocidad de reproducción del navegador aplicada al audio generado (la voz se sintetiza a velocidad normal)",
        velocityValueText: (rate) => `velocidad de reproducción ${rate} veces`,
        pitchTitle: "Modulación del tono de voz",
        pitchDesc:
          "Cambio de tono en semitonos. Solo lo usa la voz de respaldo del navegador; las voces neuronales lo ignoran.",
        pitchValueText: (semitones) =>
          `${semitones > 0 ? "más " : semitones < 0 ? "menos " : ""}${Math.abs(semitones).toFixed(1)} semitonos`,
        volumeTitle: "Calibración de ganancia de volumen",
        volumeDesc: "Volumen de reproducción en decibelios, aplicado en el navegador (0 dB = volumen máximo)",
        volumeValueText: (decibels) => `${decibels} decibelios`,
        autoBriefingTitle: "Boletín meteorológico de audio automático",
        autoBriefingDesc:
          "Lee en voz alta el resumen automáticamente al seleccionar una estación o al iniciar.",
        deliveryTitle: "Estilo de locución",
        deliveryDesc:
          "Ajusta el ritmo y el tono de la voz neuronal según el estado de ánimo. No se aplica a la voz de respaldo del navegador.",
        deliveryStyles: {
          meteorological: "Noticiero",
          calm: "Tranquilo",
          cheerful: "Alegre",
          energetic: "Enérgico",
          authoritative: "Autoritario",
        },
        tones: {
          Firm: "Firme",
          Upbeat: "Animado",
          Informative: "Informativo",
          Bright: "Brillante",
          Smooth: "Suave",
          Excitable: "Enérgico",
          Youthful: "Juvenil",
          Breezy: "Desenfadado",
          "Easy-going": "Relajado",
          Breathy: "Susurrante",
          Clear: "Claro",
          Gravelly: "Ronco",
          Soft: "Suave y tenue",
          Even: "Equilibrado",
          Mature: "Maduro",
          Forward: "Directo",
          Friendly: "Amigable",
          Casual: "Informal",
          Gentle: "Amable",
          Lively: "Vivaz",
          Knowledgeable: "Experto",
          Warm: "Cálido",
        },
        visualizer: {
          live: "Telemetría acústica en vivo",
          paused: "Reproducción en pausa",
          synthesizing: "Sintetizando audio neuronal...",
          idle: "Monitor de espectro acústico",
          tone: "Tono",
          pitch: "Altura",
          rate: "Velocidad",
          positionAria: "Posición de reproducción del audio",
          positionText: (current, total) => `${current} de ${total}`,
          noAudio: "No hay audio cargado",
        },
      },
    },
    header: {
      home: "Inicio de OpenWeather",
      currentStationGps: "Estación actual (GPS)",
      detecting: "Detectando...",
      gpsLocked: "GPS fijado",
      clickToLoadStation: "Haz clic para cargar la estación",
      autoDetectStation: "Detecta automáticamente la estación meteorológica con los sensores del dispositivo",
      locateAction: "Localizar →",
      locatingStations: "Localizando estaciones…",
      geocodingMatches: "Coincidencias de geocodificación",
      noStationFound: (query) => `No se encontró ninguna estación meteorológica para «${query}»`,
      popularHubs: "Centros populares",
      aiAdvisor: "Asesor IA",
      aiAdvisorDesc: "Inteligencia sinóptica con IA y análisis de cambios bruscos",
      sourceDesc: "Proveedor de datos meteorológicos y modelo de pronóstico",
      locateDesc: "Carga el tiempo de tu ubicación actual",
      openMenu: "Abrir menú",
      mainMenu: "Menú principal",
      switchToLight: "Cambiar al modo claro",
      switchToDark: "Cambiar al modo oscuro",
      toggleTheme: "Cambiar tema",
    },
  },

  fr: {
    common: {
      stationTelemetryActive: "Télémétrie de Station Active",
      source: "Source",
      change: "CHANGER",
      refresh: "Actualiser",
      pressure: "Pression",
      feelsLike: "Ressenti",
      synopticTime: "Heure Locale",
      stationTelemetry: "Télémétrie de station",
      loading: "Chargement des données météo...",
      searchPlaceholder: "Rechercher une ville, un aéroport, coordonnées...",
      briefing: "Briefing",
      playing: "Lecture...",
      preparing: "Préparation...",
      settings: "Paramètres",
      locateMe: "Me Localiser",
      locating: "Localisation...",
      clear: "Effacer",
      reset: "Réinitialiser",
      done: "Terminé",
      save: "Enregistrer",
      saved: "Enregistré",
      cancel: "Annuler",
      today: "Aujourd'hui",
      now: "Maintenant",
      high: "Max",
      low: "Min",
      shareStation: "Partager la station",
      copied: "Lien copié dans le presse-papiers !",
      advisorySystem: "Système d'Alerte Météorologique",
      noActiveAlerts: "Conditions atmosphériques stables dans le secteur d'observation.",
      activeBulletin: "Bulletin Actif",
      precip: "précip.",
    },
    tabs: {
      overview: "Vue d'ensemble",
      charts: "Graphiques & Tendances",
      radar: "Radar & Satellite",
      airQuality: "Qualité de l'Air",
      climate: "Historique & Climat",
      compare: "Comparaison des Stations",
    },
    hero: {
      min: "Min",
      max: "Max",
      wind: "Vent",
      humidity: "Humidité",
      barometer: "Pression",
      visibility: "Visibilité",
      dewPoint: "Point de rosée",
      uvIndex: "Indice UV",
      clouds: "Nuages",
    },
    forecast: {
      hourlyTitle: "Télémétrie Horaire",
      hourlyDesc: "Courbe de prévision thermodynamique sur 48 heures",
      dailyTitle: "Perspectives Météorologiques Quotidiennes",
      dailyDesc: "Trajectoire thermique et perspectives synoptiques",
      tenDayOutlook: "Aperçu 10 Jours",
      pop: "précip.",
    },
    days: {
      MON: "Lun",
      TUE: "Mar",
      WED: "Mer",
      THU: "Jeu",
      FRI: "Ven",
      SAT: "Sam",
      SUN: "Dim",
      TODAY: "Aujourd'hui",
    },
    conditions: {
      SUNNY: "Ciel Dégagé",
      CLEAR_NIGHT: "Nuit Claire",
      PARTLY_CLOUDY_DAY: "Partiellement Nuageux",
      PARTLY_CLOUDY_NIGHT: "Partiellement Nuageux",
      CLOUDY: "Couvert",
      FOG: "Brouillard & Brume",
      RAIN: "Pluie",
      HEAVY_RAIN: "Forte Pluie",
      SNOW: "Neige",
      STORM: "Orage",
      WINDY: "Vents Forts",
      "Clear Sky": "Ciel Dégagé",
      "Mainly Clear": "Généralement Dégagé",
      "Partly Cloudy": "Partiellement Nuageux",
      Overcast: "Ciel Couvert",
      Drizzle: "Bruine",
      "Freezing Drizzle": "Bruine Verglaçante",
      "Rain Showers": "Averses",
      "Violent Rain Showers": "Averses Violentes",
      "Snow Showers": "Averses de Neige",
      "Severe Thunderstorm": "Orage Violent",
      "Fog & Depositing Rime": "Brouillard Givrant",
    },
    widgets: {
      wind: {
        title: "Télémétrie du Vent",
        subtitle: "Vecteur atmosphérique et suivi des rafales",
        speed: "Vitesse du Vent",
        gusts: "Rafales",
        direction: "Direction",
        calm: "Calme",
        lightBreeze: "Très Légère Brise",
        moderateBreeze: "Brise Modérée",
        freshBreeze: "Bonne Brise",
        strongBreeze: "Vent Frais",
        gale: "Coup de Vent",
        storm: "Tempête",
      },
      humidity: {
        title: "Humidité Relative",
        subtitle: "Humidité de l'air et saturation du point de rosée",
        relativeHumidity: "Humidité Relative",
        dewPoint: "Point de Rosée",
        dry: "Sec",
        comfortable: "Confortable",
        humid: "Humide",
        veryHumid: "Très Humide",
      },
      airQuality: {
        title: "Qualité de l'Air",
        subtitle: "Particules fines et polluants troposphériques",
        index: "IQA",
        good: "Bonne",
        moderate: "Moyenne",
        sensitive: "Dégradée pour Sensibles",
        unhealthy: "Mauvaise",
        veryUnhealthy: "Très Mauvaise",
        hazardous: "Dangereuse",
      },
      solar: {
        title: "Éphéméride Solaire",
        subtitle: "Trajectoire céleste et durée du jour",
        sunrise: "Lever du Soleil",
        sunset: "Coucher du Soleil",
        dayLength: "Durée du Jour",
        solarNoon: "Midi Solaire",
        dawn: "Aube",
        dusk: "Crépuscule",
      },
      uv: {
        title: "Rayonnement UV",
        subtitle: "Indice d'exposition au rayonnement ultraviolet",
        low: "Faible",
        moderate: "Modéré",
        high: "Élevé",
        veryHigh: "Très Élevé",
        extreme: "Extrême",
        protectionRequired: "Protection nécessaire aux heures de pointe",
      },
    },
    settingsDialog: {
      title: "Préférences de la Station et de l'Application",
      subtitle: "Configurer les flux météo, les modèles numériques, les unités et la synthèse vocale",
      tabSource: "Source & Station",
      tabLocations: "Emplacements",
      tabApi: "Clés API",
      tabUnits: "Unités",
      tabFavorites: "Favoris",
      tabRegional: "Régional",
      tabSpeech: "Voix & Audio",
      tabTheme: "Thème",
      resetDefaults: "Réinitialiser",
      done: "Terminé",
      regional: {
        headerTitle: "TÉLÉMÉTRIE RÉGIONALE ACTIVE",
        headerSubtitle: "Traduction multilingue, chronométrie et normes d'éphémérides",
        langTitle: "Langue & Dialecte Régional",
        langDesc: "Sélectionner la langue de l'interface et le vocabulaire local",
        selectLanguagePlaceholder: "Sélectionner la langue",
        timeTitle: "Format de l'Heure",
        timeDesc: "Format pour graphiques horaires et éphémérides",
        time24Label: "Format 24 Heures (Aviation)",
        time24Desc: "(00:00 – 23:59, Synoptique Zulu)",
        time12Label: "Format 12 Heures Standard",
        time12Desc: "(Civil AM / PM)",
        dateTitle: "Format de Date",
        dateDesc: "Affichage du calendrier pour prévisions à 7 jours",
        coordTitle: "Coordonnées & Géodésie",
        coordDesc: "Format de précision de latitude et longitude",
        clock: "Horloge",
        zulu: "Zulu",
        pattern: "Modèle",
        preview: "Aperçu",
        system: "Système",
        sample: "Échantillon",
        searchLanguagePlaceholder: "Rechercher une langue...",
        noLanguageFound: "Aucune langue trouvée.",
        voiceOnly: "Voix uniquement",
        uiFallbackNotice: (languageName) =>
          `Interface affichée en anglais ; les bulletins vocaux utilisent ${languageName}.`,
        dateFormats: {
          iso: "ISO 8601 (Synoptique)",
          intl: "Standard international",
          us: "Nord-américain",
        },
        coordFormats: {
          decimal: "Degrés décimaux (DD)",
          dms: "Degrés, minutes, secondes (DMS)",
        },
      },
      units: {
        headerTitle: "NORMES DE MESURE",
        headerSubtitle: "Unités métriques, impériales et météorologiques",
        tempTitle: "Unité de Température",
        tempDesc: "Norme d'affichage thermodynamique",
        windTitle: "Unité de Vitesse du Vent",
        windDesc: "Mesure de la vitesse vectorielle du vent",
        pressureTitle: "Unité de Pression",
        pressureDesc: "Norme barométrique de pression atmosphérique",
        precipTitle: "Unité de Précipitations",
        precipDesc: "Norme d'accumulation des précipitations",
        presets: { metric: "Métrique", imperial: "Impérial", custom: "Personnalisé" },
        selectTempPlaceholder: "Choisir l'unité de température",
        selectWindPlaceholder: "Choisir l'unité de vent",
        selectPressurePlaceholder: "Choisir l'unité de pression",
        selectPrecipPlaceholder: "Choisir l'unité de précipitations",
        options: {
          temp: { C: "Celsius (°C)", F: "Fahrenheit (°F)" },
          wind: {
            "m/s": "Mètres par seconde (m/s)",
            "km/h": "Kilomètres par heure (km/h)",
            mph: "Miles par heure (mph)",
            knots: "Nœuds (knots)",
          },
          pressure: {
            hPa: "Hectopascals (hPa)",
            inHg: "Pouces de mercure (inHg)",
            mmHg: "Millimètres de mercure (mmHg)",
          },
          precip: { mm: "Millimètres (mm)", in: "Pouces (in)" },
        },
      },
      theme: {
        headerTitle: "THÈME VISUEL",
        headerSubtitle: "Étalonnage du contraste et optimisation OLED",
        darkTitle: "Sombre Synoptique",
        darkDesc: "Optimal pour radar et faible luminosité",
        lightTitle: "Clair Diurne",
        lightDesc: "Contraste net adapté aux fortes luminosités",
        systemTitle: "Système Dynamique",
        systemDesc: "Suit automatiquement les réglages du système d'exploitation",
        darkSubtitle: "Radar nocturne",
        darkBadge: "Noir OLED",
        lightSubtitle: "Contraste élevé",
        lightBadge: "Plein jour",
        systemSubtitle: "Suit le système",
        systemBadge: "Adaptatif",
      },
      tabDescriptions: {
        locations: "Stations météo favorites et points de télémétrie épinglés",
        source: "Moteurs de prévision numérique et flux de télémétrie radar",
        api: "Identifiants API OpenWeatherMap",
        units: "Unités de mesure atmosphériques, thermiques et de vitesse du vent",
        localization: "Langue de l'interface, horloge synoptique 24 h et grille géodésique",
        speech:
          "Timbre, débit, hauteur et égalisation de la voix neuronale multilingue",
        appearance: "Thème radar sombre et style visuel de l'interface",
      },
      autoSourceBadge: "Auto",
      resetConfirmTitle: "Réinitialiser toutes les préférences ?",
      resetConfirmDesc:
        "Les unités, la langue, la source de données, les réglages vocaux et les clés API enregistrées reviendront à leurs valeurs par défaut. Les lieux épinglés sont conservés.",
      scrollTabsLeft: "Faire défiler les onglets vers la gauche",
      scrollTabsRight: "Faire défiler les onglets vers la droite",
      sectionPicker: "Section des paramètres",
      source: {
        feedTitle: "Flux de télémétrie actif",
        live: "EN DIRECT",
        feedDesc: "Synchronisation en temps réel de la modélisation atmosphérique et des observations",
        model: "Modèle",
        providerTitle: "Fournisseur de données météo (source)",
        providerDesc: "Choisissez le fournisseur principal d'observations et de données synoptiques",
        providerAria: "Fournisseur de données météo",
        apiKeyRequired: "Clé API requise",
        keyless: "Sans clé",
        customOwmKeyActive: "Clé API OpenWeatherMap personnalisée active.",
        sharedServerKey: "Utilisation de la clé partagée du serveur.",
        configuredInApiTab: "À configurer dans l'onglet Clés API",
        nwpTitle: "Station de prévision numérique du temps (NWP)",
        nwpDesc: "Choisissez le modèle de simulation physique de l'atmosphère utilisé pour les prévisions",
        stationNoticeTitle: "Remarque sur le modèle",
        stationNoticeDesc:
          "OpenWeatherMap utilise le consensus des stations OWM. Le choix du modèle ci-dessous s'applique lorsque Open-Meteo ou le basculement automatique est actif.",
        selectNwpPlaceholder: "Choisir un modèle NWP",
      },
      apiKeys: {
        headerTitle: "Authentification et quotas API",
        credentialsBadge: "IDENTIFIANTS",
        headerDesc:
          "Gérez vos clés API personnelles pour une télémétrie haute fréquence et des voix neuronales dédiées",
        customSetCount: (count, total) => `${count} / ${total} personnalisées`,
        customSet: "Personnalisée",
        serverShared: "Partagée (serveur)",
        studioShared: "Partagée (Studio)",
        showKey: "Afficher la clé",
        hideKey: "Masquer la clé",
        enterKeyToTest: "Saisissez une clé pour la tester",
        owmTitle: "Clé API OpenWeatherMap",
        owmDesc:
          "Fournit les observations actuelles, les prévisions toutes les 3 heures et les services de géocodage.",
        owmPlaceholder: "ex. clé OpenWeatherMap de 32 caractères",
        showOwmKey: "Afficher la clé OpenWeatherMap",
        hideOwmKey: "Masquer la clé OpenWeatherMap",
        testConnection: "Tester la connexion",
        owmHelp:
          "Laissez vide pour utiliser la clé partagée du serveur. Obtenez une clé API dédiée sur",
        testKey: "Tester la clé",
        keyVerified: "Clé vérifiée",
        keyTestFailed: "Échec du test de la clé",
        testingKey: "Test de la clé...",
        contactingOwm: "Connexion à OpenWeatherMap...",
        owmAccepted: "OpenWeatherMap a accepté la clé.",
        testLocationFallback: "le lieu de test",
        liveReading: (place, reading) => `Relevé en direct pour ${place} : ${reading}.`,
        humidityValue: (percent) => `${percent} % d'humidité`,
        testFailedHttp: (status) => `Échec du test de la clé (HTTP ${status}).`,
        testTimedOut: (seconds) => `Le test a expiré après ${seconds} secondes.`,
        networkError: "Erreur réseau lors du test de la clé.",
      },
      locations: {
        activeStation: "Station météo active",
        liveSync: "SYNCHRO EN DIRECT",
        monitoringLabel: "Télémétrie en direct suivie pour",
        savedCount: (count, max) => `${count}/${max} enregistrées`,
        addTitle: "Ajouter et découvrir des stations",
        addDesc:
          "Recherchez des sites d'observation dans le monde entier ou découvrez les principaux pôles météo régionaux.",
        pinnedCount: (count, max) => `${count}/${max} épinglées`,
        limitCount: (count, max) => `${count}/${max} limite`,
        searchAria: "Rechercher des stations à épingler",
        searchPlaceholder:
          "Rechercher une ville, un aéroport ou des coordonnées (ex. Madrid, Zurich, 28.65, 77.23)...",
        maxPinnedPlaceholder: (max) => `Maximum de ${max} stations épinglées (limite atteinte)...`,
        clearSearch: "Effacer la recherche",
        resultsTitle: "Résultats de recherche",
        resultsAria: "Résultats de recherche de stations",
        searching: "Recherche...",
        foundCount: (count) => `${count} trouvée(s)`,
        locatingStations: "Localisation des stations météo…",
        pinned: "Épinglée",
        limitBadge: (max) => `Limite ${max}/${max}`,
        pin: "Épingler",
        noStationTitle: "Aucune station trouvée",
        noStationDesc: (query) =>
          `Aucune station trouvée pour « ${query} ». Essayez une autre orthographe ou une grande ville voisine.`,
        feedbackNoMatch:
          "Aucune station correspondante. Choisissez un résultat dans la liste pour l'épingler.",
        feedbackAllPinned: "Toutes les stations correspondantes sont déjà épinglées.",
        nearbyTab: "Stations proches",
        popularTab: "Pôles populaires",
        near: (city) => `Près de ${city}`,
        scanningNearby: "Recherche des stations de télémétrie régionales...",
        pinNearbyAria: (city, distanceKm) => `Épingler ${city}, à ${distanceKm} km`,
        pinAria: (city) => `Épingler ${city}`,
        nearbyErrorTitle: "Impossible de charger les stations proches",
        nearbyErrorDesc:
          "La recherche des stations régionales a échoué. Vérifiez votre connexion et réessayez.",
        retry: "Réessayer",
        locationUnknownTitle: "Position inconnue",
        locationUnknownDesc:
          "Les coordonnées actuelles ne sont pas encore disponibles. Essayez les pôles populaires ou la recherche ci-dessus.",
        allNearbySavedTitle: "Toutes les stations proches sont enregistrées",
        allNearbySavedDesc:
          "Toutes les stations de télémétrie régionales de cette zone sont déjà dans vos favoris.",
        noRegionalTitle: "Aucune station régionale détectée",
        noRegionalDesc:
          "Aucune station régionale près des coordonnées actuelles. Essayez les pôles populaires ou la recherche ci-dessus.",
        allPopularAddedTitle: "Tous les pôles populaires sont ajoutés",
        allPopularAddedDesc:
          "Tous les grands pôles régionaux par défaut sont déjà dans vos favoris.",
        noPinnedTitle: "Aucune station épinglée",
        noPinnedDesc:
          "Ajoutez ci-dessus vos lieux fréquents ou des observatoires pour y accéder en un clic.",
        savedTitle: "Stations enregistrées",
        savedDesc: (count, max) =>
          `${count} / ${max} stations enregistrées pour un accès rapide à la télémétrie`,
        groundStation: "Télémétrie de station au sol",
        selectStation: "Sélectionner la station",
        showWeatherFor: (city) => `Afficher la météo de ${city}`,
        removeFromFavorites: "Retirer des favoris",
        removeAria: (city) => `Retirer ${city} des favoris`,
      },
      speech: {
        engineTitle: "Moteur de synthèse vocale neuronale Edge",
        personaTitle: "Voix et timbre du narrateur",
        personaDesc:
          "Choisissez un narrateur neuronal multilingue et écoutez un extrait de sa voix.",
        recentVoices: "Voix récentes",
        filterByTone: "Filtrer par ton",
        allTonesShort: "Tous",
        allTones: "Tous les tons",
        allVoices: "Toutes les voix",
        maleVoices: "Voix masculines",
        femaleVoices: "Voix féminines",
        noVoicesWithTone: (tone) => `Aucune voix au ton « ${tone} »`,
        noMaleVoicesWithTone: (tone) => `Aucune voix masculine au ton « ${tone} »`,
        noFemaleVoicesWithTone: (tone) => `Aucune voix féminine au ton « ${tone} »`,
        male: "Masculine",
        female: "Féminine",
        playPreview: "Écouter l'aperçu de la voix",
        pausePreview: "Mettre l'aperçu en pause",
        resumePreview: "Reprendre l'aperçu",
        loading: "Chargement...",
        pause: "Pause",
        resume: "Reprendre",
        stop: "Arrêter",
        playAudition: "Écouter l'extrait",
        script: "Texte :",
        genericVoiceNotice: (voiceName) =>
          `Le service gratuit de voix neuronales Edge était injoignable : cet aperçu a donc utilisé la voix intégrée de votre navigateur au lieu de ${voiceName}. Réessayez dans un instant.`,
        velocityTitle: "Débit de parole",
        velocityDesc:
          "Vitesse de lecture du navigateur appliquée à l'audio généré (la voix est synthétisée à vitesse normale)",
        velocityValueText: (rate) => `vitesse de lecture ${rate} fois`,
        pitchTitle: "Modulation de la hauteur de voix",
        pitchDesc:
          "Décalage de hauteur en demi-tons. Utilisé uniquement par la voix de secours du navigateur ; les voix neuronales l'ignorent.",
        pitchValueText: (semitones) =>
          `${semitones > 0 ? "plus " : semitones < 0 ? "moins " : ""}${Math.abs(semitones).toFixed(1)} demi-tons`,
        volumeTitle: "Calibrage du gain de volume",
        volumeDesc: "Volume de lecture en décibels, appliqué dans le navigateur (0 dB = volume maximal)",
        volumeValueText: (decibels) => `${decibels} décibels`,
        autoBriefingTitle: "Bulletin météo audio automatique",
        autoBriefingDesc:
          "Lit automatiquement la synthèse à voix haute lors de la sélection d'une station ou au démarrage.",
        deliveryTitle: "Style de diction",
        deliveryDesc:
          "Ajuste le débit et la hauteur de la voix neuronale selon l'ambiance. Non appliqué à la voix de secours du navigateur.",
        deliveryStyles: {
          meteorological: "Présentateur",
          calm: "Calme",
          cheerful: "Enjoué",
          energetic: "Énergique",
          authoritative: "Autoritaire",
        },
        tones: {
          Firm: "Ferme",
          Upbeat: "Entraînant",
          Informative: "Informatif",
          Bright: "Lumineux",
          Smooth: "Doux",
          Excitable: "Vif",
          Youthful: "Juvénile",
          Breezy: "Léger",
          "Easy-going": "Décontracté",
          Breathy: "Soufflé",
          Clear: "Clair",
          Gravelly: "Rocailleux",
          Soft: "Feutré",
          Even: "Égal",
          Mature: "Mûr",
          Forward: "Affirmé",
          Friendly: "Amical",
          Casual: "Décontracté",
          Gentle: "Doux et bienveillant",
          Lively: "Enjoué",
          Knowledgeable: "Érudit",
          Warm: "Chaleureux",
        },
        visualizer: {
          live: "Télémétrie acoustique en direct",
          paused: "Lecture en pause",
          synthesizing: "Synthèse de l'audio neuronal...",
          idle: "Moniteur de spectre acoustique",
          tone: "Ton",
          pitch: "Hauteur",
          rate: "Débit",
          positionAria: "Position de lecture audio",
          positionText: (current, total) => `${current} sur ${total}`,
          noAudio: "Aucun audio chargé",
        },
      },
    },
    header: {
      home: "Accueil OpenWeather",
      currentStationGps: "Station actuelle (GPS)",
      detecting: "Détection...",
      gpsLocked: "GPS verrouillé",
      clickToLoadStation: "Cliquez pour charger la station",
      autoDetectStation: "Détecter automatiquement la station météo via les capteurs de l'appareil",
      locateAction: "Localiser →",
      locatingStations: "Localisation des stations…",
      geocodingMatches: "Correspondances de géocodage",
      noStationFound: (query) => `Aucune station météo trouvée pour « ${query} »`,
      popularHubs: "Pôles populaires",
      aiAdvisor: "Conseiller IA",
      aiAdvisorDesc: "Intelligence synoptique par IA et analyse des changements brusques",
      sourceDesc: "Fournisseur de données météo et modèle de prévision",
      locateDesc: "Charger la météo de votre position actuelle",
      openMenu: "Ouvrir le menu",
      mainMenu: "Menu principal",
      switchToLight: "Passer en mode clair",
      switchToDark: "Passer en mode sombre",
      toggleTheme: "Changer de thème",
    },
  },

  de: {
    common: {
      stationTelemetryActive: "Stationstelemetrie Aktiv",
      source: "Quelle",
      change: "ÄNDERN",
      refresh: "Aktualisieren",
      pressure: "Druck",
      feelsLike: "Gefühlt",
      synopticTime: "Ortszeit",
      stationTelemetry: "Stationstelemetrie",
      loading: "Wetterdaten werden geladen...",
      searchPlaceholder: "Stadt, Flughafen, Koordinaten suchen...",
      briefing: "Wetterbericht",
      playing: "Wiedergabe...",
      preparing: "Wird vorbereitet...",
      settings: "Einstellungen",
      locateMe: "Standort",
      locating: "Lokalisiere...",
      clear: "Löschen",
      reset: "Zurücksetzen",
      done: "Fertig",
      save: "Speichern",
      saved: "Gespeichert",
      cancel: "Abbrechen",
      today: "Heute",
      now: "Jetzt",
      high: "Max",
      low: "Min",
      shareStation: "Station teilen",
      copied: "Link in die Zwischenablage kopiert!",
      advisorySystem: "Meteorologisches Warnsystem",
      noActiveAlerts: "Normale atmosphärische Bedingungen im Beobachtungsbereich.",
      activeBulletin: "Aktive Meldung",
      precip: "Niederschl.",
    },
    tabs: {
      overview: "Übersicht",
      charts: "Diagramme & Trends",
      radar: "Radar & Satellit",
      airQuality: "Luftqualität",
      climate: "Historie & Klima",
      compare: "Stationsvergleich",
    },
    hero: {
      min: "Min",
      max: "Max",
      wind: "Wind",
      humidity: "Feuchtigkeit",
      barometer: "Luftdruck",
      visibility: "Sichtweite",
      dewPoint: "Taupunkt",
      uvIndex: "UV-Index",
      clouds: "Bewölkung",
    },
    forecast: {
      hourlyTitle: "Stündliche Telemetrie",
      hourlyDesc: "48-Stunden Vorhersagekurve",
      dailyTitle: "Täglicher Wetterausblick",
      dailyDesc: "Erweiterter synoptischer Trend & Temperaturverlauf",
      tenDayOutlook: "10-Tage-Ausblick",
      pop: "Regenwahrsch.",
    },
    days: {
      MON: "Mo",
      TUE: "Di",
      WED: "Mi",
      THU: "Do",
      FRI: "Fr",
      SAT: "Sa",
      SUN: "So",
      TODAY: "Heute",
    },
    conditions: {
      SUNNY: "Klarer Himmel",
      CLEAR_NIGHT: "Klare Nacht",
      PARTLY_CLOUDY_DAY: "Teilweise Bewölkt",
      PARTLY_CLOUDY_NIGHT: "Teilweise Bewölkt",
      CLOUDY: "Bedeckt",
      FOG: "Nebel & Dunst",
      RAIN: "Regen",
      HEAVY_RAIN: "Starker Regen",
      SNOW: "Schnee",
      STORM: "Gewitter",
      WINDY: "Stürmisch",
      "Clear Sky": "Klarer Himmel",
      "Mainly Clear": "Weitgehend Klar",
      "Partly Cloudy": "Teilweise Bewölkt",
      Overcast: "Bedeckt",
      Drizzle: "Nieselregen",
      "Freezing Drizzle": "Gefrierender Nieselregen",
      "Rain Showers": "Regenschauer",
      "Violent Rain Showers": "Wolkenbruchartiger Regen",
      "Snow Showers": "Schneeschauer",
      "Severe Thunderstorm": "Schweres Unwetter",
      "Fog & Depositing Rime": "Dichter Nebel",
    },
    widgets: {
      wind: {
        title: "Wind-Telemetrie",
        subtitle: "Atmosphärischer Vektor und Böenerfassung",
        speed: "Windgeschwindigkeit",
        gusts: "Windböen",
        direction: "Windrichtung",
        calm: "Windstill",
        lightBreeze: "Leichte Brise",
        moderateBreeze: "Mäßige Brise",
        freshBreeze: "Frische Brise",
        strongBreeze: "Starker Wind",
        gale: "Sturmstärke",
        storm: "Schwerer Sturm",
      },
      humidity: {
        title: "Relative Luftfeuchtigkeit",
        subtitle: "Atmosphärische Feuchte und Taupunktsättigung",
        relativeHumidity: "Relative Luftfeuchte",
        dewPoint: "Taupunkt",
        dry: "Trocken",
        comfortable: "Angenehm",
        humid: "Feucht",
        veryHumid: "Sehr Feucht",
      },
      airQuality: {
        title: "Luftqualitätsindex",
        subtitle: "Feinstaub und troposphärische Schadstoffe",
        index: "LQI",
        good: "Gut",
        moderate: "Mäßig",
        sensitive: "Ungesund für Empfindliche",
        unhealthy: "Ungesund",
        veryUnhealthy: "Sehr Ungesund",
        hazardous: "Gefährlich",
      },
      solar: {
        title: "Sonnenephimeriden",
        subtitle: "Sonnenverlauf und Tageslichtdauer",
        sunrise: "Sonnenaufgang",
        sunset: "Sonnenuntergang",
        dayLength: "Tageslänge",
        solarNoon: "Sonnenhöchststand",
        dawn: "Dämmerung",
        dusk: "Abenddämmerung",
      },
      uv: {
        title: "UV-Strahlung",
        subtitle: "Solare Ultraviolett-Exposition",
        low: "Niedrig",
        moderate: "Mäßig",
        high: "Hoch",
        veryHigh: "Sehr Hoch",
        extreme: "Extrem",
        protectionRequired: "Sonnenschutz um die Mittagszeit empfohlen",
      },
    },
    settingsDialog: {
      title: "Stations- & Anwendungseinstellungen",
      subtitle: "Konfigurieren Sie Wetterdatenquellen, Vorhersagemodelle, Einheiten und Sprachtelemetrie",
      tabSource: "Quelle & Station",
      tabLocations: "Standorte",
      tabApi: "API-Schlüssel",
      tabUnits: "Einheiten",
      tabFavorites: "Favoriten",
      tabRegional: "Regional",
      tabSpeech: "Sprache & Audio",
      tabTheme: "Design",
      resetDefaults: "Zurücksetzen",
      done: "Fertig",
      regional: {
        headerTitle: "AKTIVE REGIONALTELEMETRIE",
        headerSubtitle: "Mehrsprachige Übersetzung, Zeit- und Ephemeridenstandards",
        langTitle: "Sprache & Regionaler Dialekt",
        langDesc: "Oberflächensprache & lokalisierte Wetterbegriffe auswählen",
        selectLanguagePlaceholder: "Sprache auswählen",
        timeTitle: "Zeitdarstellung",
        timeDesc: "Format für stündliche Diagramme und Sonnenstand",
        time24Label: "24-Stunden Militär-/Aviation-Format",
        time24Desc: "(00:00 – 23:59, Synoptisch Zulu)",
        time12Label: "12-Stunden Standardformat",
        time12Desc: "(Zivil AM / PM)",
        dateTitle: "Datumsformat",
        dateDesc: "Kalenderformat für 7-Tage-Aussichten und Radar",
        coordTitle: "Koordinaten & Geodäsie",
        coordDesc: "Präzisionsformat für Breiten- und Längengrade",
        clock: "Uhr",
        zulu: "Zulu",
        pattern: "Muster",
        preview: "Vorschau",
        system: "System",
        sample: "Beispiel",
        searchLanguagePlaceholder: "Sprache suchen...",
        noLanguageFound: "Keine Sprache gefunden.",
        voiceOnly: "Nur Sprachausgabe",
        uiFallbackNotice: (languageName) =>
          `Die Oberfläche wird auf Englisch angezeigt; Sprachberichte verwenden ${languageName}.`,
        dateFormats: {
          iso: "ISO 8601 (Synoptisch)",
          intl: "Internationaler Standard",
          us: "Nordamerikanisch",
        },
        coordFormats: {
          decimal: "Dezimalgrad (DD)",
          dms: "Grad, Minuten, Sekunden (DMS)",
        },
      },
      units: {
        headerTitle: "MESSSTANDARDS",
        headerSubtitle: "Metrische, imperiale und synoptische meteorologische Einheiten",
        tempTitle: "Temperatureinheit",
        tempDesc: "Standard für thermodynamische Telemetrie",
        windTitle: "Windgeschwindigkeitseinheit",
        windDesc: "Geschwindigkeitsmessung für Windtelemetrie",
        pressureTitle: "Luftdruckeinheit",
        pressureDesc: "Atmosphärischer Barometerstandard",
        precipTitle: "Niederschlagseinheit",
        precipDesc: "Akkumulationsstandard für Niederschläge",
        presets: { metric: "Metrisch", imperial: "Imperial", custom: "Benutzerdefiniert" },
        selectTempPlaceholder: "Temperatureinheit wählen",
        selectWindPlaceholder: "Windeinheit wählen",
        selectPressurePlaceholder: "Druckeinheit wählen",
        selectPrecipPlaceholder: "Niederschlagseinheit wählen",
        options: {
          temp: { C: "Celsius (°C)", F: "Fahrenheit (°F)" },
          wind: {
            "m/s": "Meter pro Sekunde (m/s)",
            "km/h": "Kilometer pro Stunde (km/h)",
            mph: "Meilen pro Stunde (mph)",
            knots: "Knoten (knots)",
          },
          pressure: {
            hPa: "Hektopascal (hPa)",
            inHg: "Zoll Quecksilbersäule (inHg)",
            mmHg: "Millimeter Quecksilbersäule (mmHg)",
          },
          precip: { mm: "Millimeter (mm)", in: "Zoll (in)" },
        },
      },
      theme: {
        headerTitle: "BILDSCHIRMDESIGN",
        headerSubtitle: "Kontrastabstimmung & OLED-Optimierung",
        darkTitle: "Dunkel Synoptisch",
        darkDesc: "Optimal für Radarbeobachtung bei Dunkelheit",
        lightTitle: "Tageslicht Hell",
        lightDesc: "Klarer Kontrast für helle Umgebungen",
        systemTitle: "Systemdynamisch",
        systemDesc: "Folgt automatisch dem Systemmodus des Betriebssystems",
        darkSubtitle: "Nachtradar",
        darkBadge: "OLED-Schwarz",
        lightSubtitle: "Hoher Kontrast",
        lightBadge: "Tageslicht",
        systemSubtitle: "Folgt dem System",
        systemBadge: "Adaptiv",
      },
      tabDescriptions: {
        locations: "Favorisierte Wetterstationen und angeheftete Messpunkte",
        source: "Numerische Vorhersagemodelle und Radar-Telemetrie",
        api: "API-Zugangsdaten für OpenWeatherMap",
        units: "Maßeinheiten für Atmosphäre, Temperatur und Windgeschwindigkeit",
        localization: "Oberflächensprache, synoptische 24-h-Uhr und geodätisches Raster",
        speech:
          "Klangfarbe, Tempo, Tonhöhe und EQ der mehrsprachigen neuronalen Stimme",
        appearance: "Dunkles Radar-Design und visuelle Gestaltung der Oberfläche",
      },
      autoSourceBadge: "Auto",
      resetConfirmTitle: "Alle Einstellungen zurücksetzen?",
      resetConfirmDesc:
        "Einheiten, Sprache, Datenquelle, Spracheinstellungen und gespeicherte API-Schlüssel werden auf die Standardwerte zurückgesetzt. Angeheftete Orte bleiben erhalten.",
      scrollTabsLeft: "Tabs nach links scrollen",
      scrollTabsRight: "Tabs nach rechts scrollen",
      sectionPicker: "Einstellungsbereich",
      source: {
        feedTitle: "Aktiver Telemetrie-Feed",
        live: "LIVE",
        feedDesc: "Echtzeit-Synchronisierung von Atmosphärenmodellen und Beobachtungen",
        model: "Modell",
        providerTitle: "Wetterdatenanbieter (Quelle)",
        providerDesc: "Wählen Sie den primären Anbieter für Beobachtungen und synoptische Daten",
        providerAria: "Wetterdatenanbieter",
        apiKeyRequired: "API-Schlüssel erforderlich",
        keyless: "Ohne Schlüssel",
        customOwmKeyActive: "Eigener OpenWeatherMap-API-Schlüssel aktiv.",
        sharedServerKey: "Gemeinsamer Server-Schlüssel wird verwendet.",
        configuredInApiTab: "Im Tab API-Schlüssel konfiguriert",
        nwpTitle: "Vorhersagestation für numerische Wettervorhersage (NWP)",
        nwpDesc: "Wählen Sie das physikalische Atmosphärenmodell für die Vorhersage",
        stationNoticeTitle: "Hinweis zum Modell",
        stationNoticeDesc:
          "OpenWeatherMap verwendet den OWM-Stationskonsens. Die Modellauswahl unten gilt, wenn Open-Meteo oder das automatische Failover aktiv ist.",
        selectNwpPlaceholder: "NWP-Modell wählen",
      },
      apiKeys: {
        headerTitle: "API-Authentifizierung und Kontingente",
        credentialsBadge: "ZUGANGSDATEN",
        headerDesc:
          "Verwalten Sie persönliche API-Schlüssel für eigene hochfrequente Telemetrie und neuronale Sprachausgabe",
        customSetCount: (count, total) => `${count} / ${total} eigene`,
        customSet: "Eigener Schlüssel",
        serverShared: "Server (geteilt)",
        studioShared: "Studio (geteilt)",
        showKey: "Schlüssel anzeigen",
        hideKey: "Schlüssel verbergen",
        enterKeyToTest: "Geben Sie einen Schlüssel ein, um ihn zu testen",
        owmTitle: "OpenWeatherMap-API-Schlüssel",
        owmDesc:
          "Liefert aktuelle Wetterbeobachtungen, 3-stündliche Vorhersagen und Geokodierungsdienste.",
        owmPlaceholder: "z. B. 32-stelliger OpenWeatherMap-Schlüssel",
        showOwmKey: "OpenWeatherMap-Schlüssel anzeigen",
        hideOwmKey: "OpenWeatherMap-Schlüssel verbergen",
        testConnection: "Verbindung testen",
        owmHelp:
          "Leer lassen, um den gemeinsamen Server-Schlüssel zu verwenden. Einen eigenen API-Schlüssel erhalten Sie auf",
        testKey: "Schlüssel testen",
        keyVerified: "Schlüssel bestätigt",
        keyTestFailed: "Schlüsseltest fehlgeschlagen",
        testingKey: "Schlüssel wird getestet...",
        contactingOwm: "Verbindung zu OpenWeatherMap wird hergestellt...",
        owmAccepted: "OpenWeatherMap hat den Schlüssel akzeptiert.",
        testLocationFallback: "den Testort",
        liveReading: (place, reading) => `Live-Messwert für ${place}: ${reading}.`,
        humidityValue: (percent) => `${percent} % Luftfeuchtigkeit`,
        testFailedHttp: (status) => `Schlüsseltest fehlgeschlagen (HTTP ${status}).`,
        testTimedOut: (seconds) => `Der Test wurde nach ${seconds} Sekunden abgebrochen.`,
        networkError: "Netzwerkfehler beim Testen des Schlüssels.",
      },
      locations: {
        activeStation: "Aktive Wetterstation",
        liveSync: "LIVE-SYNC",
        monitoringLabel: "Live-Telemetrie wird überwacht für",
        savedCount: (count, max) => `${count}/${max} gespeichert`,
        addTitle: "Stationen hinzufügen und entdecken",
        addDesc:
          "Durchsuchen Sie Beobachtungsstandorte weltweit oder entdecken Sie regionale und große Wetterzentren.",
        pinnedCount: (count, max) => `${count}/${max} angeheftet`,
        limitCount: (count, max) => `${count}/${max} Limit`,
        searchAria: "Stationen zum Anheften suchen",
        searchPlaceholder:
          "Stadt, Flughafen oder Koordinaten suchen (z. B. Madrid, Zürich, 28.65, 77.23)...",
        maxPinnedPlaceholder: (max) => `Maximal ${max} Stationen angeheftet (Limit erreicht)...`,
        clearSearch: "Suche löschen",
        resultsTitle: "Suchergebnisse",
        resultsAria: "Suchergebnisse für Stationen",
        searching: "Suche läuft...",
        foundCount: (count) => `${count} gefunden`,
        locatingStations: "Wetterstationen werden gesucht…",
        pinned: "Angeheftet",
        limitBadge: (max) => `Limit ${max}/${max}`,
        pin: "Anheften",
        noStationTitle: "Keine Station gefunden",
        noStationDesc: (query) =>
          `Keine Station für „${query}“ gefunden. Versuchen Sie eine andere Schreibweise oder eine größere Stadt in der Nähe.`,
        feedbackNoMatch:
          "Keine passende Station gefunden. Wählen Sie ein Ergebnis aus der Liste, um es anzuheften.",
        feedbackAllPinned: "Alle passenden Stationen sind bereits angeheftet.",
        nearbyTab: "Stationen in der Nähe",
        popularTab: "Beliebte Zentren",
        near: (city) => `In der Nähe von ${city}`,
        scanningNearby: "Regionale Messstationen werden gesucht...",
        pinNearbyAria: (city, distanceKm) => `${city} anheften, ${distanceKm} km entfernt`,
        pinAria: (city) => `${city} anheften`,
        nearbyErrorTitle: "Stationen in der Nähe konnten nicht geladen werden",
        nearbyErrorDesc:
          "Die Suche nach regionalen Stationen ist fehlgeschlagen. Prüfen Sie Ihre Verbindung und versuchen Sie es erneut.",
        retry: "Erneut versuchen",
        locationUnknownTitle: "Standort unbekannt",
        locationUnknownDesc:
          "Die aktuellen Koordinaten sind noch nicht verfügbar. Probieren Sie Beliebte Zentren oder die Suche oben.",
        allNearbySavedTitle: "Alle Stationen in der Nähe gespeichert",
        allNearbySavedDesc:
          "Alle regionalen Messstationen in diesem Umkreis sind bereits in Ihren Favoriten.",
        noRegionalTitle: "Keine regionalen Stationen gefunden",
        noRegionalDesc:
          "In der Nähe der aktuellen Koordinaten wurden keine regionalen Stationen gefunden. Probieren Sie Beliebte Zentren oder die Suche oben.",
        allPopularAddedTitle: "Alle beliebten Zentren hinzugefügt",
        allPopularAddedDesc:
          "Alle großen regionalen Standardzentren sind bereits in Ihren Favoriten.",
        noPinnedTitle: "Keine angehefteten Stationen",
        noPinnedDesc:
          "Fügen Sie oben häufig genutzte Orte oder Observatorien hinzu, um sie mit einem Klick aufzurufen.",
        savedTitle: "Gespeicherte Stationen",
        savedDesc: (count, max) =>
          `${count} / ${max} Stationen für den schnellen Telemetriezugriff gespeichert`,
        groundStation: "Bodenstations-Telemetrie",
        selectStation: "Station auswählen",
        showWeatherFor: (city) => `Wetter für ${city} anzeigen`,
        removeFromFavorites: "Aus Favoriten entfernen",
        removeAria: (city) => `${city} aus Favoriten entfernen`,
      },
      speech: {
        engineTitle: "Neuronale Edge-Sprachsynthese",
        personaTitle: "Sprecherstimme und Klangfarbe",
        personaDesc:
          "Wählen Sie eine mehrsprachige neuronale Sprecherstimme und hören Sie eine Probe an.",
        recentVoices: "Zuletzt verwendete Stimmen",
        filterByTone: "Nach Tonfall filtern",
        allTonesShort: "Alle",
        allTones: "Alle Tonfälle",
        allVoices: "Alle Stimmen",
        maleVoices: "Männliche Stimmen",
        femaleVoices: "Weibliche Stimmen",
        noVoicesWithTone: (tone) => `Keine Stimmen mit dem Tonfall „${tone}“`,
        noMaleVoicesWithTone: (tone) => `Keine männlichen Stimmen mit dem Tonfall „${tone}“`,
        noFemaleVoicesWithTone: (tone) => `Keine weiblichen Stimmen mit dem Tonfall „${tone}“`,
        male: "Männlich",
        female: "Weiblich",
        playPreview: "Stimmprobe abspielen",
        pausePreview: "Stimmprobe pausieren",
        resumePreview: "Stimmprobe fortsetzen",
        loading: "Wird geladen...",
        pause: "Pause",
        resume: "Fortsetzen",
        stop: "Stopp",
        playAudition: "Probe abspielen",
        script: "Text:",
        genericVoiceNotice: (voiceName) =>
          `Der kostenlose neuronale Edge-Sprachdienst war nicht erreichbar, daher wurde für diese Probe die integrierte Stimme Ihres Browsers statt ${voiceName} verwendet. Versuchen Sie es gleich noch einmal.`,
        velocityTitle: "Sprechtempo",
        velocityDesc:
          "Wiedergabegeschwindigkeit des Browsers für das erzeugte Audio (die Stimme selbst wird mit normalem Tempo synthetisiert)",
        velocityValueText: (rate) => `${rate}-fache Wiedergabegeschwindigkeit`,
        pitchTitle: "Tonhöhenmodulation",
        pitchDesc:
          "Tonhöhenverschiebung in Halbtönen. Wird nur von der Browser-Sprachausgabe genutzt; neuronale Stimmen ignorieren sie.",
        pitchValueText: (semitones) =>
          `${semitones > 0 ? "plus " : semitones < 0 ? "minus " : ""}${Math.abs(semitones).toFixed(1)} Halbtöne`,
        volumeTitle: "Lautstärkeanpassung",
        volumeDesc: "Wiedergabelautstärke in Dezibel, im Browser angewendet (0 dB = volle Lautstärke)",
        volumeValueText: (decibels) => `${decibels} Dezibel`,
        autoBriefingTitle: "Automatischer Wetterbericht per Sprachausgabe",
        autoBriefingDesc:
          "Liest die Zusammenfassung automatisch vor, sobald eine Station gewählt oder die App gestartet wird.",
        deliveryTitle: "Sprechstil",
        deliveryDesc:
          "Passt Tempo und Tonhöhe der neuronalen Stimme an die Stimmung an. Gilt nicht für die Browser-Ersatzstimme.",
        deliveryStyles: {
          meteorological: "Nachrichtensprecher",
          calm: "Ruhig",
          cheerful: "Fröhlich",
          energetic: "Energisch",
          authoritative: "Bestimmt",
        },
        tones: {
          Firm: "Bestimmt",
          Upbeat: "Beschwingt",
          Informative: "Sachlich",
          Bright: "Hell",
          Smooth: "Sanft",
          Excitable: "Aufgeweckt",
          Youthful: "Jugendlich",
          Breezy: "Luftig",
          "Easy-going": "Entspannt",
          Breathy: "Hauchig",
          Clear: "Klar",
          Gravelly: "Rau",
          Soft: "Weich",
          Even: "Ausgeglichen",
          Mature: "Reif",
          Forward: "Direkt",
          Friendly: "Freundlich",
          Casual: "Locker",
          Gentle: "Behutsam",
          Lively: "Lebhaft",
          Knowledgeable: "Kenntnisreich",
          Warm: "Warm",
        },
        visualizer: {
          live: "Live-Akustiktelemetrie",
          paused: "Wiedergabe pausiert",
          synthesizing: "Neuronales Audio wird erzeugt...",
          idle: "Akustischer Spektrumsmonitor",
          tone: "Tonfall",
          pitch: "Tonhöhe",
          rate: "Tempo",
          positionAria: "Wiedergabeposition",
          positionText: (current, total) => `${current} von ${total}`,
          noAudio: "Kein Audio geladen",
        },
      },
    },
    header: {
      home: "OpenWeather-Startseite",
      currentStationGps: "Aktuelle Station (GPS)",
      detecting: "Wird ermittelt...",
      gpsLocked: "GPS erfasst",
      clickToLoadStation: "Klicken, um die Station zu laden",
      autoDetectStation: "Wetterstation automatisch über die Gerätesensoren ermitteln",
      locateAction: "Orten →",
      locatingStations: "Stationen werden gesucht…",
      geocodingMatches: "Geokodierungstreffer",
      noStationFound: (query) => `Keine Wetterstation für „${query}“ gefunden`,
      popularHubs: "Beliebte Zentren",
      aiAdvisor: "KI-Berater",
      aiAdvisorDesc: "Synoptische KI-Analyse und Erkennung plötzlicher Wetterumschwünge",
      sourceDesc: "Wetterdatenanbieter und Vorhersagemodell",
      locateDesc: "Wetter für Ihren aktuellen Standort laden",
      openMenu: "Menü öffnen",
      mainMenu: "Hauptmenü",
      switchToLight: "Zum hellen Modus wechseln",
      switchToDark: "Zum dunklen Modus wechseln",
      toggleTheme: "Design wechseln",
    },
  },

  ja: {
    common: {
      stationTelemetryActive: "観測ステーション稼働中",
      source: "データ元",
      change: "変更",
      refresh: "更新",
      pressure: "気圧",
      feelsLike: "体感温度",
      synopticTime: "観測時刻",
      stationTelemetry: "ステーション情報",
      loading: "気象データを読み込み中...",
      searchPlaceholder: "都市、空港、座標を検索...",
      briefing: "音声概況",
      playing: "再生中...",
      preparing: "準備中...",
      settings: "設定",
      locateMe: "現在地",
      locating: "測位中...",
      clear: "クリア",
      reset: "初期化",
      done: "完了",
      save: "保存",
      saved: "保存完了",
      cancel: "キャンセル",
      today: "今日",
      now: "現在",
      high: "最高",
      low: "最低",
      shareStation: "ステーションを共有",
      copied: "リンクをクリップボードにコピーしました！",
      advisorySystem: "気象アドバイザリーシステム",
      noActiveAlerts: "観測エリア内の大気状況は正常です。",
      activeBulletin: "気象警報・注意報",
      precip: "降水",
    },
    tabs: {
      overview: "概要",
      charts: "グラフと推移",
      radar: "レーダーと衛星",
      airQuality: "大気質と健康",
      climate: "気候と履歴",
      compare: "ステーション比較",
    },
    hero: {
      min: "最低",
      max: "最高",
      wind: "風速",
      humidity: "湿度",
      barometer: "気圧",
      visibility: "視程",
      dewPoint: "露点温度",
      uvIndex: "UV指数",
      clouds: "雲量",
    },
    forecast: {
      hourlyTitle: "1時間ごとの気象予測",
      hourlyDesc: "48時間の熱力学的予報カーブ",
      dailyTitle: "週間気象見通し",
      dailyDesc: "週間概況および気温変化傾向",
      tenDayOutlook: "10日間見通し",
      pop: "降水確率",
    },
    days: {
      MON: "月",
      TUE: "火",
      WED: "水",
      THU: "木",
      FRI: "金",
      SAT: "土",
      SUN: "日",
      TODAY: "今日",
    },
    conditions: {
      SUNNY: "快晴",
      CLEAR_NIGHT: "快晴（夜間）",
      PARTLY_CLOUDY_DAY: "時々曇り",
      PARTLY_CLOUDY_NIGHT: "時々曇り",
      CLOUDY: "曇り",
      FOG: "濃霧・霧",
      RAIN: "雨",
      HEAVY_RAIN: "大雨",
      SNOW: "雪",
      STORM: "雷雨",
      WINDY: "強風",
      "Clear Sky": "快晴",
      "Mainly Clear": "おおむね晴れ",
      "Partly Cloudy": "時々曇り",
      Overcast: "本曇り",
      Drizzle: "霧雨",
      "Freezing Drizzle": "着氷性の霧雨",
      "Rain Showers": "にわか雨",
      "Violent Rain Showers": "猛烈な雨",
      "Snow Showers": "にわか雪",
      "Severe Thunderstorm": "激しい雷雨",
      "Fog & Depositing Rime": "着氷性の霧",
    },
    widgets: {
      wind: {
        title: "風速テレメトリ",
        subtitle: "大気風向ベクトルおよび突風計測",
        speed: "風速",
        gusts: "最大瞬間風速",
        direction: "風向",
        calm: "静穏",
        lightBreeze: "至軽風",
        moderateBreeze: "和風",
        freshBreeze: "疾風",
        strongBreeze: "雄風",
        gale: "強風",
        storm: "暴風",
      },
      humidity: {
        title: "相対湿度",
        subtitle: "大気水分量および露点飽和度",
        relativeHumidity: "相対湿度",
        dewPoint: "露点温度",
        dry: "乾燥",
        comfortable: "快適",
        humid: "多湿",
        veryHumid: "極めて多湿",
      },
      airQuality: {
        title: "大気質指数 (AQI)",
        subtitle: "微小粒子状物質および対流圏汚染物質",
        index: "AQI",
        good: "良い",
        moderate: "普通",
        sensitive: "敏感な層に悪影響",
        unhealthy: "健康に悪い",
        veryUnhealthy: "極めて悪い",
        hazardous: "危険",
      },
      solar: {
        title: "太陽暦および位置",
        subtitle: "太陽軌道と日照時間",
        sunrise: "日の出",
        sunset: "日の入り",
        dayLength: "昼の長さ",
        solarNoon: "南中時刻",
        dawn: "夜明け",
        dusk: "日没",
      },
      uv: {
        title: "紫外線放射 (UV)",
        subtitle: "地上到達紫外線放射指数",
        low: "弱い",
        moderate: "中程度",
        high: "強い",
        veryHigh: "非常に強い",
        extreme: "極端に強い",
        protectionRequired: "日中の外出には日焼け止めや日傘を推奨",
      },
    },
    settingsDialog: {
      title: "観測局およびアプリケーション設定",
      subtitle: "気象データフィード、数値予報モデル、単位基準、音声テレメトリの設定",
      tabSource: "ソースと局",
      tabLocations: "地域",
      tabApi: "APIキー",
      tabUnits: "単位系",
      tabFavorites: "お気に入り",
      tabRegional: "地域と言語",
      tabSpeech: "音声と音響",
      tabTheme: "テーマ",
      resetDefaults: "初期設定に戻す",
      done: "完了",
      regional: {
        headerTitle: "アクティブ地域テレメトリおよびロケール",
        headerSubtitle: "多言語翻訳、計時標準、天文天体暦基準",
        langTitle: "言語と地域方言",
        langDesc: "インターフェース表示言語と気象用語を選択",
        selectLanguagePlaceholder: "言語を選択",
        timeTitle: "時間表示形式",
        timeDesc: "時間別グラフおよび太陽軌道の時間形式",
        time24Label: "24時間表記（航空・軍事規格）",
        time24Desc: "(00:00 – 23:59、グリニッジ標準時対応)",
        time12Label: "12時間表記（標準民間規格）",
        time12Desc: "(午前 / 午後表記)",
        dateTitle: "日付表示形式",
        dateDesc: "週間予報およびレーダーログのカレンダー形式",
        coordTitle: "座標系および測地系",
        coordDesc: "緯度および経度の精度表記形式",
        clock: "時計",
        zulu: "Zulu",
        pattern: "パターン",
        preview: "プレビュー",
        system: "システム",
        sample: "サンプル",
        searchLanguagePlaceholder: "言語を検索...",
        noLanguageFound: "該当する言語がありません。",
        voiceOnly: "音声のみ",
        uiFallbackNotice: (languageName) =>
          `画面は英語で表示されます。音声ブリーフィングは${languageName}で再生されます。`,
        dateFormats: {
          iso: "ISO 8601（気象観測標準）",
          intl: "国際標準",
          us: "北米式",
        },
        coordFormats: {
          decimal: "10進数表記 (DD)",
          dms: "度・分・秒 (DMS)",
        },
      },
      units: {
        headerTitle: "観測測定基準",
        headerSubtitle: "国際メートル法、ヤード・ポンド法、気象観測基準",
        tempTitle: "温度単位",
        tempDesc: "熱力学的気温テレメトリの表示基準",
        windTitle: "風速単位",
        windDesc: "大気ベクトル風速の測定単位",
        pressureTitle: "気圧単位",
        pressureDesc: "大気圧バロメーター測定標準",
        precipTitle: "降水量単位",
        precipDesc: "水象降水蓄積深度基準",
        presets: { metric: "メートル法", imperial: "ヤード・ポンド法", custom: "カスタム" },
        selectTempPlaceholder: "温度単位を選択",
        selectWindPlaceholder: "風速単位を選択",
        selectPressurePlaceholder: "気圧単位を選択",
        selectPrecipPlaceholder: "降水量単位を選択",
        options: {
          temp: { C: "摂氏 (°C)", F: "華氏 (°F)" },
          wind: {
            "m/s": "メートル毎秒 (m/s)",
            "km/h": "キロメートル毎時 (km/h)",
            mph: "マイル毎時 (mph)",
            knots: "ノット (knots)",
          },
          pressure: {
            hPa: "ヘクトパスカル (hPa)",
            inHg: "水銀柱インチ (inHg)",
            mmHg: "水銀柱ミリメートル (mmHg)",
          },
          precip: { mm: "ミリメートル (mm)", in: "インチ (in)" },
        },
      },
      theme: {
        headerTitle: "表示画面テーマ",
        headerSubtitle: "コントラスト校正およびOLEDディスプレイ最適化",
        darkTitle: "ダーク（気象レーダー）",
        darkDesc: "暗所でのレーダー観測および目の疲労軽減に最適",
        lightTitle: "ライト（日中日光）",
        lightDesc: "明るい屋外環境でも視認性の高いハイコントラスト",
        systemTitle: "システム連動",
        systemDesc: "お使いのOSのカラーモード設定に自動追従します",
        darkSubtitle: "夜間レーダー",
        darkBadge: "OLEDブラック",
        lightSubtitle: "ハイコントラスト",
        lightBadge: "日中",
        systemSubtitle: "OSに連動",
        systemBadge: "自動切替",
      },
      tabDescriptions: {
        locations: "お気に入りの観測所と固定したテレメトリ地点",
        source: "数値予報エンジンとレーダーテレメトリの配信元",
        api: "OpenWeatherMap の API 認証情報",
        units: "気圧・温度・風速の測定単位",
        localization: "表示言語、24時間表記の時計、測地座標",
        speech: "多言語ニューラル音声の声質・速度・ピッチ・イコライザー",
        appearance: "ダークレーダーテーマと画面の外観",
      },
      autoSourceBadge: "自動",
      resetConfirmTitle: "すべての設定をリセットしますか？",
      resetConfirmDesc:
        "単位、言語、データソース、音声設定、保存済みの API キーが初期値に戻ります。固定した地点はそのまま残ります。",
      scrollTabsLeft: "タブを左にスクロール",
      scrollTabsRight: "タブを右にスクロール",
      sectionPicker: "設定セクション",
      source: {
        feedTitle: "稼働中のテレメトリフィード",
        live: "ライブ",
        feedDesc: "大気モデルと観測データをリアルタイムで同期",
        model: "モデル",
        providerTitle: "気象データプロバイダー（ソース）",
        providerDesc: "観測データと主要な総観データの提供元を選択",
        providerAria: "気象データプロバイダー",
        apiKeyRequired: "API キーが必要",
        keyless: "キー不要",
        customOwmKeyActive: "独自の OpenWeatherMap API キーを使用中です。",
        sharedServerKey: "サーバー共有キーを使用中です。",
        configuredInApiTab: "API キータブで設定",
        nwpTitle: "数値予報 (NWP) モデル",
        nwpDesc: "予報に使用する大気物理シミュレーションモデルを選択",
        stationNoticeTitle: "モデルに関する注意",
        stationNoticeDesc:
          "OpenWeatherMap は OWM の観測所コンセンサスを使用します。下のモデル選択は Open-Meteo または自動フェイルオーバーが有効な場合に適用されます。",
        selectNwpPlaceholder: "NWP モデルを選択",
      },
      apiKeys: {
        headerTitle: "API 認証と利用枠",
        credentialsBadge: "認証情報",
        headerDesc:
          "高頻度テレメトリとニューラル音声を専用で利用するための個人 API キーを管理します",
        customSetCount: (count, total) => `独自キー ${count} / ${total} 件設定済み`,
        customSet: "独自キー",
        serverShared: "サーバー共有",
        studioShared: "Studio 共有",
        showKey: "キーを表示",
        hideKey: "キーを隠す",
        enterKeyToTest: "テストするキーを入力してください",
        owmTitle: "OpenWeatherMap API キー",
        owmDesc:
          "現在の気象観測、3時間ごとの予報、ジオコーディングサービスを提供します。",
        owmPlaceholder: "例: 32文字の OpenWeatherMap キー",
        showOwmKey: "OpenWeatherMap キーを表示",
        hideOwmKey: "OpenWeatherMap キーを隠す",
        testConnection: "接続をテスト",
        owmHelp:
          "空欄の場合はサーバー共有キーを使用します。専用の API キーの取得先:",
        testKey: "キーをテスト",
        keyVerified: "キーを確認しました",
        keyTestFailed: "キーのテストに失敗しました",
        testingKey: "キーをテスト中...",
        contactingOwm: "OpenWeatherMap に接続中...",
        owmAccepted: "OpenWeatherMap がキーを受け入れました。",
        testLocationFallback: "テスト地点",
        liveReading: (place, reading) => `${place}の現在値: ${reading}。`,
        humidityValue: (percent) => `湿度 ${percent}%`,
        testFailedHttp: (status) => `キーのテストに失敗しました (HTTP ${status})。`,
        testTimedOut: (seconds) => `テストが${seconds}秒でタイムアウトしました。`,
        networkError: "キーのテスト中にネットワークエラーが発生しました。",
      },
      locations: {
        activeStation: "現在の観測所",
        liveSync: "ライブ同期",
        monitoringLabel: "ライブテレメトリを監視中:",
        savedCount: (count, max) => `${count}/${max} 件保存済み`,
        addTitle: "観測所の追加と検索",
        addDesc:
          "世界中の観測地点を検索したり、地域や主要な気象拠点を見つけたりできます。",
        pinnedCount: (count, max) => `${count}/${max} 件固定`,
        limitCount: (count, max) => `${count}/${max} 上限`,
        searchAria: "固定する観測所を検索",
        searchPlaceholder:
          "都市名・空港・座標で検索（例: Madrid, Zurich, 28.65, 77.23）...",
        maxPinnedPlaceholder: (max) => `最大 ${max} 件まで固定済みです（上限に達しました）...`,
        clearSearch: "検索をクリア",
        resultsTitle: "観測所の検索結果",
        resultsAria: "観測所の検索結果",
        searching: "検索中...",
        foundCount: (count) => `${count} 件`,
        locatingStations: "気象観測所を検索中…",
        pinned: "固定済み",
        limitBadge: (max) => `上限 ${max}/${max}`,
        pin: "固定",
        noStationTitle: "観測所が見つかりません",
        noStationDesc: (query) =>
          `「${query}」に該当する観測所はありません。別の表記や近くの大きな都市で試してください。`,
        feedbackNoMatch: "一致する観測所がありません。リストから結果を選んで固定してください。",
        feedbackAllPinned: "一致する観測所はすべて固定済みです。",
        nearbyTab: "近くの観測所",
        popularTab: "人気の拠点",
        near: (city) => `${city}付近`,
        scanningNearby: "周辺の観測所を検索中...",
        pinNearbyAria: (city, distanceKm) => `${city}（${distanceKm} km）を固定`,
        pinAria: (city) => `${city}を固定`,
        nearbyErrorTitle: "近くの観測所を読み込めませんでした",
        nearbyErrorDesc:
          "周辺観測所の検索に失敗しました。接続を確認してもう一度お試しください。",
        retry: "再試行",
        locationUnknownTitle: "現在地が不明です",
        locationUnknownDesc:
          "現在の座標はまだ取得できていません。人気の拠点を見るか、上で検索してください。",
        allNearbySavedTitle: "近くの観測所はすべて保存済み",
        allNearbySavedDesc: "この範囲の周辺観測所はすべてお気に入りに登録済みです。",
        noRegionalTitle: "周辺の観測所が見つかりません",
        noRegionalDesc:
          "現在の座標の近くに観測所はありません。人気の拠点を見るか、上で検索してください。",
        allPopularAddedTitle: "人気の拠点はすべて追加済み",
        allPopularAddedDesc: "既定の主要拠点はすべてお気に入りに登録済みです。",
        noPinnedTitle: "固定した観測所はありません",
        noPinnedDesc:
          "よく見る地点や観測所を上から追加すると、ワンクリックで切り替えられます。",
        savedTitle: "保存した観測所",
        savedDesc: (count, max) =>
          `${count} / ${max} 件の観測所をすぐに参照できるよう保存しています`,
        groundStation: "地上観測所テレメトリ",
        selectStation: "観測所を選択",
        showWeatherFor: (city) => `${city}の天気を表示`,
        removeFromFavorites: "お気に入りから削除",
        removeAria: (city) => `${city}をお気に入りから削除`,
      },
      speech: {
        engineTitle: "Edge ニューラル音声合成エンジン",
        personaTitle: "ナレーターの声と声質",
        personaDesc: "多言語ニューラルナレーターを選び、声を試聴できます。",
        recentVoices: "最近使った音声",
        filterByTone: "トーンで絞り込む",
        allTonesShort: "すべて",
        allTones: "すべてのトーン",
        allVoices: "すべての音声",
        maleVoices: "男性の音声",
        femaleVoices: "女性の音声",
        noVoicesWithTone: (tone) => `トーン「${tone}」の音声はありません`,
        noMaleVoicesWithTone: (tone) => `トーン「${tone}」の男性音声はありません`,
        noFemaleVoicesWithTone: (tone) => `トーン「${tone}」の女性音声はありません`,
        male: "男性",
        female: "女性",
        playPreview: "音声を試聴",
        pausePreview: "試聴を一時停止",
        resumePreview: "試聴を再開",
        loading: "読み込み中...",
        pause: "一時停止",
        resume: "再開",
        stop: "停止",
        playAudition: "試聴する",
        script: "原稿:",
        genericVoiceNotice: (voiceName) =>
          `無料の Edge ニューラル音声サービスに接続できなかったため、この試聴では${voiceName}ではなくブラウザー内蔵の音声を使用しました。しばらくしてからもう一度お試しください。`,
        velocityTitle: "読み上げ速度",
        velocityDesc:
          "生成した音声にブラウザー側で適用する再生速度です（音声自体は標準速度で合成されます）",
        velocityValueText: (rate) => `再生速度 ${rate} 倍`,
        pitchTitle: "ピッチ調整",
        pitchDesc: "半音単位のピッチ変更です。ブラウザーの代替音声でのみ使用され、ニューラル音声では無視されます。",
        pitchValueText: (semitones) =>
          `${semitones > 0 ? "プラス " : semitones < 0 ? "マイナス " : ""}${Math.abs(semitones).toFixed(1)} 半音`,
        volumeTitle: "音量ゲイン調整",
        volumeDesc: "ブラウザーで適用する再生音量（デシベル、0 dB = 最大音量）",
        volumeValueText: (decibels) => `${decibels} デシベル`,
        autoBriefingTitle: "気象ブリーフィングの自動読み上げ",
        autoBriefingDesc: "観測所の選択時や起動時に概要を自動で読み上げます。",
        deliveryTitle: "話し方スタイル",
        deliveryDesc: "雰囲気に合わせてニューラル音声の速さとピッチを調整します。ブラウザーの代替音声には適用されません。",
        deliveryStyles: {
          meteorological: "ニュース調",
          calm: "穏やか",
          cheerful: "明るい",
          energetic: "エネルギッシュ",
          authoritative: "威厳のある",
        },
        tones: {
          Firm: "力強い",
          Upbeat: "快活",
          Informative: "解説調",
          Bright: "明るい",
          Smooth: "滑らか",
          Excitable: "躍動的",
          Youthful: "若々しい",
          Breezy: "軽やか",
          "Easy-going": "気さく",
          Breathy: "息づかい豊か",
          Clear: "明瞭",
          Gravelly: "しゃがれ声",
          Soft: "柔らかい",
          Even: "落ち着いた",
          Mature: "大人びた",
          Forward: "はっきり",
          Friendly: "親しみやすい",
          Casual: "カジュアル",
          Gentle: "優しい",
          Lively: "生き生き",
          Knowledgeable: "博識",
          Warm: "温かい",
        },
        visualizer: {
          live: "ライブ音響テレメトリ",
          paused: "一時停止中",
          synthesizing: "ニューラル音声を合成中...",
          idle: "音響スペクトラムモニター",
          tone: "トーン",
          pitch: "ピッチ",
          rate: "速度",
          positionAria: "音声の再生位置",
          positionText: (current, total) => `${current} / ${total}`,
          noAudio: "音声が読み込まれていません",
        },
      },
    },
    header: {
      home: "OpenWeather ホーム",
      currentStationGps: "現在地の観測所 (GPS)",
      detecting: "検出中...",
      gpsLocked: "GPS 測位済み",
      clickToLoadStation: "クリックして観測所を読み込む",
      autoDetectStation: "端末のセンサーから気象観測所を自動検出",
      locateAction: "現在地へ →",
      locatingStations: "観測所を検索中…",
      geocodingMatches: "ジオコーディング結果",
      noStationFound: (query) => `「${query}」に該当する気象観測所はありません`,
      popularHubs: "人気の拠点",
      aiAdvisor: "AI アドバイザー",
      aiAdvisorDesc: "AI による総観気象分析と急変の検知",
      sourceDesc: "気象データプロバイダーと予報モデル",
      locateDesc: "現在地の天気を読み込む",
      openMenu: "メニューを開く",
      mainMenu: "メインメニュー",
      switchToLight: "ライトモードに切り替え",
      switchToDark: "ダークモードに切り替え",
      toggleTheme: "テーマを切り替え",
    },
  },
};

/** Resolves a BCP-47 tag ("es-ES", "fr") to a UI language we ship translations for, if any. */
export function resolveUiLanguage(lang?: string): SupportedLanguage | null {
  const base = (lang || "").split(/[-_]/)[0].toLowerCase();
  return base in TRANSLATIONS ? (base as SupportedLanguage) : null;
}

export function getTranslation(lang: string = "en"): Translations {
  return TRANSLATIONS[resolveUiLanguage(lang) ?? "en"];
}

export function translateCondition(condition: string, lang: string = "en"): string {
  const t = getTranslation(lang);
  if (t.conditions[condition]) {
    return t.conditions[condition];
  }
  // Try case-insensitive matching
  const lower = condition.toLowerCase();
  for (const [k, v] of Object.entries(t.conditions)) {
    if (k.toLowerCase() === lower) return v;
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
