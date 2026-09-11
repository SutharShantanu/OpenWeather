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
    };
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
      tabSource: "Source & Station",
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
      },
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
      },
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
      },
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
      },
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
      },
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
      },
    },
  },
};

export function getTranslation(lang: string = "en"): Translations {
  const normalized = (lang?.toLowerCase() || "en") as SupportedLanguage;
  return TRANSLATIONS[normalized] || TRANSLATIONS.en;
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
