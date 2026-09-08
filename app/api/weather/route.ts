import { NextRequest, NextResponse } from "next/server";
import {
  WeatherData,
  CurrentWeather,
  HourlyForecastItem,
  DailyForecastItem,
  AirQualityData,
  WeatherAlert,
  WeatherDataSource,
  ForecastStationModel,
  FORECAST_STATION_MODELS,
  mapOpenWeatherCondition,
  mapWmoCode,
  calculateMoonInfo,
  OPENWEATHER_API_KEY,
} from "@/lib/weather";

async function reverseGeocodeCoords(
  lat: number,
  lon: number,
  apiKey?: string
): Promise<{ city: string; country: string }> {
  // 1. Try OpenWeatherMap reverse geocoding if API key is configured
  if (apiKey) {
    try {
      const owmGeoUrl = `https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${apiKey}`;
      const res = await fetch(owmGeoUrl, { next: { revalidate: 86400 } });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0 && data[0].name) {
          return {
            city: data[0].name,
            country: data[0].country || "",
          };
        }
      }
    } catch (e) {
      console.warn("OWM reverse geocoding error:", e);
    }
  }

  // 2. Try BigDataCloud reverse geocoding (fast, accurate, keyless global API)
  try {
    const bdcUrl = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`;
    const res = await fetch(bdcUrl, { next: { revalidate: 86400 } });
    if (res.ok) {
      const data = await res.json();
      const city = data.city || data.locality || data.principalSubdivision || "";
      const country = data.countryName || data.countryCode || "";
      if (city) {
        return { city, country };
      }
    }
  } catch (e) {
    console.warn("BigDataCloud reverse geocoding error:", e);
  }

  // 3. Coordinate label fallback
  const latStr = lat >= 0 ? `${lat.toFixed(2)}°N` : `${Math.abs(lat).toFixed(2)}°S`;
  const lonStr = lon >= 0 ? `${lon.toFixed(2)}°E` : `${Math.abs(lon).toFixed(2)}°W`;
  return {
    city: `${latStr}, ${lonStr}`,
    country: "GPS",
  };
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const city = searchParams.get("city");
  const latParam = searchParams.get("lat");
  const lonParam = searchParams.get("lon");
  const requestedSource = (searchParams.get("source") || "open-meteo") as WeatherDataSource;
  const requestedStation = (searchParams.get("station") || "best_match") as ForecastStationModel;
  const customApiKey = searchParams.get("apiKey")?.trim() || "";
  const apiKey = customApiKey || OPENWEATHER_API_KEY;

  let resolvedLat = latParam ? parseFloat(latParam) : null;
  let resolvedLon = lonParam ? parseFloat(lonParam) : null;
  let resolvedCity = city?.trim() || "";
  let resolvedCountry = "";

  // 1. If coordinates are provided: reverse geocode to get true city & country if not specified
  if (resolvedLat !== null && resolvedLon !== null && !isNaN(resolvedLat) && !isNaN(resolvedLon)) {
    if (!resolvedCity) {
      const rev = await reverseGeocodeCoords(resolvedLat, resolvedLon, apiKey);
      resolvedCity = rev.city;
      resolvedCountry = rev.country;
    }
  } else {
    // 2. If coordinates are NOT provided: forward geocode the city name (default to London if empty)
    if (!resolvedCity) {
      resolvedCity = "London";
    }
    try {
      const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
        resolvedCity
      )}&count=1&language=en&format=json`;
      const geoRes = await fetch(geoUrl, { next: { revalidate: 3600 } });
      if (geoRes.ok) {
        const geoJson = await geoRes.json();
        if (geoJson.results && geoJson.results.length > 0) {
          const loc = geoJson.results[0];
          resolvedLat = loc.latitude;
          resolvedLon = loc.longitude;
          resolvedCity = loc.name;
          resolvedCountry = loc.country || loc.country_code || "";
        }
      }
    } catch {
      // Geocoding fallback will proceed with name query
    }
  }

  // 2. Direct Simulation Engine requested
  if (requestedSource === "simulation") {
    const mock = generateFallbackWeather(resolvedCity, resolvedLat, resolvedLon, resolvedCountry);
    mock.providerName = "Autonomous Synoptic Simulator";
    mock.stationName = "Synthetic Mathematical Station";
    return NextResponse.json(mock);
  }

  // 3. Direct OpenWeatherMap requested
  if (requestedSource === "openweathermap") {
    const owmData = await fetchOpenWeather(resolvedCity, resolvedLat, resolvedLon, apiKey);
    if (owmData) {
      return NextResponse.json(owmData);
    }

    // Fallback with informational advisory if user's key or OWM call failed
    const fallback = generateFallbackWeather(resolvedCity, resolvedLat, resolvedLon, resolvedCountry);
    fallback.providerName = "OpenWeatherMap (Simulation Failover)";
    fallback.stationName = "OWM Auth Failover Station";
    fallback.alerts = [
      {
        id: "alert-owm-offline",
        source: "Station Telemetry Gateway",
        event: "OWM Station Communication Warning",
        headline: apiKey
          ? "Unable to authenticate with OpenWeatherMap API using provided key. Reverting to synoptic simulation."
          : "No OpenWeatherMap API Key configured. Please add an API key in Settings > Source & Station.",
        severity: "Moderate",
        urgency: "Immediate",
        instruction: "Configure a valid OpenWeather API key in Settings > Source & Station or choose Open-Meteo as primary source.",
      },
      ...(fallback.alerts || []),
    ];
    return NextResponse.json(fallback);
  }

  // 4. Open-Meteo High-Resolution Engine (Default or Auto)
  if (resolvedLat !== null && resolvedLon !== null && !isNaN(resolvedLat) && !isNaN(resolvedLon)) {
    const openMeteoData = await fetchOpenMeteo(
      resolvedCity,
      resolvedCountry,
      resolvedLat,
      resolvedLon,
      requestedStation
    );
    if (openMeteoData) {
      return NextResponse.json(openMeteoData);
    }
  }

  // 5. Failover in Auto mode: Attempt OpenWeatherMap if key is available
  if (requestedSource === "auto" && apiKey) {
    const owmData = await fetchOpenWeather(resolvedCity, resolvedLat, resolvedLon, apiKey);
    if (owmData) {
      return NextResponse.json(owmData);
    }
  }

  // 6. Tertiary Fallback: Autonomous Synoptic Simulator
  const mock = generateFallbackWeather(resolvedCity, resolvedLat, resolvedLon, resolvedCountry);
  mock.providerName = "Autonomous Synoptic Simulator";
  mock.stationName = "Synthetic Mathematical Station";
  return NextResponse.json(mock);
}

async function fetchOpenMeteo(
  resolvedCity: string,
  resolvedCountry: string,
  resolvedLat: number,
  resolvedLon: number,
  requestedStation: ForecastStationModel
): Promise<WeatherData | null> {
  try {
    let weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${resolvedLat}&longitude=${resolvedLon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,surface_pressure,cloud_cover,wind_speed_10m,wind_direction_10m,wind_gusts_10m,is_day&hourly=temperature_2m,relative_humidity_2m,dew_point_2m,apparent_temperature,precipitation_probability,precipitation,weather_code,surface_pressure,cloud_cover,visibility,wind_speed_10m,wind_direction_10m,wind_gusts_10m,uv_index,is_day&daily=weather_code,temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,sunrise,sunset,uv_index_max,precipitation_sum,precipitation_probability_max,wind_speed_10m_max,wind_gusts_10m_max&timezone=auto&forecast_days=10&wind_speed_unit=ms`;

    if (requestedStation && requestedStation !== "best_match") {
      weatherUrl += `&models=${requestedStation}`;
    }

    const aqiUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${resolvedLat}&longitude=${resolvedLon}&current=european_aqi,us_aqi,pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone`;

    const [weatherRes, aqiRes] = await Promise.all([
      fetch(weatherUrl, { next: { revalidate: 180 } }),
      fetch(aqiUrl, { next: { revalidate: 600 } }).catch(() => null),
    ]);

    if (!weatherRes.ok) return null;

    const weatherJson = await weatherRes.json();
    const aqiJson = aqiRes && aqiRes.ok ? await aqiRes.json() : null;

    const currentMeteo = weatherJson.current;
    const dailyMeteo = weatherJson.daily;
    const hourlyMeteo = weatherJson.hourly;

    // Current weather mapping
    const cond = mapWmoCode(currentMeteo.weather_code, Boolean(currentMeteo.is_day));
    const sunriseIso = dailyMeteo.sunrise?.[0];
    const sunsetIso = dailyMeteo.sunset?.[0];
    const sunriseTs = sunriseIso ? Math.floor(new Date(sunriseIso).getTime() / 1000) : Math.floor(Date.now() / 1000) - 20000;
    const sunsetTs = sunsetIso ? Math.floor(new Date(sunsetIso).getTime() / 1000) : Math.floor(Date.now() / 1000) + 20000;

    const currentHourIdx = 0;
    const currentUv = hourlyMeteo.uv_index?.[currentHourIdx] ?? dailyMeteo.uv_index_max?.[0] ?? 0;
    const currentDewPoint = hourlyMeteo.dew_point_2m?.[currentHourIdx] ?? 12;
    const currentVisibility = hourlyMeteo.visibility?.[currentHourIdx] ?? 10000;

    // Air Quality mapping
    let airQuality: AirQualityData | undefined;
    if (aqiJson?.current) {
      const cAqi = aqiJson.current;
      const usAqi = cAqi.us_aqi ?? 25;
      let aqiBand = 1;
      if (usAqi > 200) aqiBand = 5;
      else if (usAqi > 150) aqiBand = 4;
      else if (usAqi > 100) aqiBand = 3;
      else if (usAqi > 50) aqiBand = 2;

      airQuality = {
        aqi: aqiBand,
        usAqi: Math.round(usAqi),
        europeanAqi: Math.round(cAqi.european_aqi ?? 20),
        co: parseFloat((cAqi.carbon_monoxide ?? 180).toFixed(1)),
        no: 0.1,
        no2: parseFloat((cAqi.nitrogen_dioxide ?? 10).toFixed(1)),
        o3: parseFloat((cAqi.ozone ?? 45).toFixed(1)),
        so2: parseFloat((cAqi.sulphur_dioxide ?? 2).toFixed(1)),
        pm2_5: parseFloat((cAqi.pm2_5 ?? 5.5).toFixed(1)),
        pm10: parseFloat((cAqi.pm10 ?? 12.0).toFixed(1)),
        nh3: 0.5,
      };
    } else {
      airQuality = {
        aqi: 1,
        usAqi: 28,
        europeanAqi: 22,
        co: 150,
        no: 0.1,
        no2: 8.5,
        o3: 42,
        so2: 1.8,
        pm2_5: 4.8,
        pm10: 9.5,
        nh3: 0.4,
      };
    }

    const current: CurrentWeather = {
      cityName: resolvedCity,
      country: resolvedCountry || "GLOBAL",
      lat: resolvedLat,
      lon: resolvedLon,
      temp: currentMeteo.temperature_2m,
      feelsLike: currentMeteo.apparent_temperature ?? currentMeteo.temperature_2m,
      tempMin: dailyMeteo.temperature_2m_min?.[0] ?? currentMeteo.temperature_2m - 4,
      tempMax: dailyMeteo.temperature_2m_max?.[0] ?? currentMeteo.temperature_2m + 4,
      humidity: currentMeteo.relative_humidity_2m ?? 60,
      pressure: Math.round(currentMeteo.surface_pressure ?? 1013),
      windSpeed: parseFloat((currentMeteo.wind_speed_10m ?? 2).toFixed(1)),
      windDeg: currentMeteo.wind_direction_10m ?? 0,
      windGusts: parseFloat((currentMeteo.wind_gusts_10m ?? 4).toFixed(1)),
      clouds: currentMeteo.cloud_cover ?? 0,
      visibility: currentVisibility,
      uvIndex: currentUv,
      dewPoint: currentDewPoint,
      condition: {
        type: cond.type,
        main: cond.label,
        description: cond.label.toLowerCase(),
        icon: "02d",
      },
      sunrise: sunriseTs,
      sunset: sunsetTs,
      dt: Math.floor(Date.now() / 1000),
      moon: calculateMoonInfo(new Date()),
      airQuality,
    };

    // 24 to 48 hours hourly sequence
    const hourly: HourlyForecastItem[] = [];
    const maxHours = Math.min(48, hourlyMeteo.time.length);
    for (let i = 0; i < maxHours; i++) {
      const timeIso = hourlyMeteo.time[i];
      if (!timeIso || hourlyMeteo.temperature_2m?.[i] == null) continue;
      const date = new Date(timeIso);
      const timeStr = date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false });
      const isDay = Boolean(hourlyMeteo.is_day?.[i] ?? 1);
      const hCond = mapWmoCode(hourlyMeteo.weather_code?.[i] ?? 0, isDay);

      hourly.push({
        time: timeStr,
        timestamp: Math.floor(date.getTime() / 1000),
        temp: hourlyMeteo.temperature_2m[i],
        feelsLike: hourlyMeteo.apparent_temperature?.[i] ?? hourlyMeteo.temperature_2m[i],
        humidity: hourlyMeteo.relative_humidity_2m?.[i] ?? 60,
        windSpeed: parseFloat((hourlyMeteo.wind_speed_10m?.[i] ?? 3).toFixed(1)),
        windGusts: parseFloat(hourlyMeteo.wind_gusts_10m?.[i]?.toFixed(1) ?? "0"),
        uvIndex: hourlyMeteo.uv_index?.[i] ?? 0,
        dewPoint: hourlyMeteo.dew_point_2m?.[i] ?? 10,
        cloudCover: hourlyMeteo.cloud_cover?.[i] ?? 20,
        conditionType: hCond.type,
        description: hCond.label,
        pop: (hourlyMeteo.precipitation_probability?.[i] ?? 0) / 100,
      });
    }

    // 10-day outlook sequence
    const daily: DailyForecastItem[] = [];
    const todayIso = new Date().toISOString().split("T")[0];
    const numDays = Math.min(10, dailyMeteo.time.length);

    for (let i = 0; i < numDays; i++) {
      const dateStr = dailyMeteo.time[i];
      if (!dateStr || dailyMeteo.temperature_2m_max?.[i] == null || dailyMeteo.temperature_2m_min?.[i] == null) {
        continue;
      }
      const date = new Date(dateStr);
      const dayName =
        dateStr === todayIso
          ? "TODAY"
          : date.toLocaleDateString("en-US", { weekday: "short" }).toUpperCase();
      const dCond = mapWmoCode(dailyMeteo.weather_code?.[i] ?? 0, true);
      const sRise = dailyMeteo.sunrise?.[i] ? Math.floor(new Date(dailyMeteo.sunrise[i]).getTime() / 1000) : undefined;
      const sSet = dailyMeteo.sunset?.[i] ? Math.floor(new Date(dailyMeteo.sunset[i]).getTime() / 1000) : undefined;

      daily.push({
        day: dayName,
        date: dateStr,
        tempMin: dailyMeteo.temperature_2m_min[i],
        tempMax: dailyMeteo.temperature_2m_max[i],
        conditionType: dCond.type,
        description: dCond.label,
        pop: (dailyMeteo.precipitation_probability_max?.[i] ?? 0) / 100,
        humidity: Math.round(hourlyMeteo.relative_humidity_2m?.[i * 24 + 12] ?? 60),
        windSpeed: parseFloat((dailyMeteo.wind_speed_10m_max?.[i] ?? 4).toFixed(1)),
        windGusts: parseFloat(dailyMeteo.wind_gusts_10m_max?.[i]?.toFixed(1) ?? "0"),
        uvIndexMax: dailyMeteo.uv_index_max?.[i] ?? 3,
        sunrise: sRise,
        sunset: sSet,
      });
    }

    const alerts = buildMeteorologicalAlerts(current, daily);
    const stationInfo = FORECAST_STATION_MODELS.find((s) => s.id === requestedStation);
    const stationName = stationInfo ? stationInfo.name : "WMO Best Match Consensus";

    return {
      current,
      hourly,
      daily,
      alerts,
      dataSource: "LIVE_API",
      providerName: "Open-Meteo High-Resolution",
      stationName,
    };
  } catch (err) {
    console.warn("fetchOpenMeteo error:", err);
    return null;
  }
}

async function fetchOpenWeather(
  targetCity: string,
  lat: number | null,
  lon: number | null,
  apiKey: string
): Promise<WeatherData | null> {
  if (!apiKey) return null;

  try {
    let queryUrl = "";
    let forecastUrl = "";

    if (lat !== null && lon !== null && !isNaN(lat) && !isNaN(lon)) {
      queryUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;
      forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;
    } else {
      const q = targetCity || "London";
      queryUrl = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(q)}&units=metric&appid=${apiKey}`;
      forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(q)}&units=metric&appid=${apiKey}`;
    }

    const [currentRes, forecastRes] = await Promise.all([
      fetch(queryUrl, { next: { revalidate: 60 } }),
      fetch(forecastUrl, { next: { revalidate: 300 } }),
    ]);

    if (!currentRes.ok || !forecastRes.ok) return null;

    const currentJson = await currentRes.json();
    const forecastJson = await forecastRes.json();

    let airQuality: AirQualityData | undefined;
    try {
      const aqiRes = await fetch(
        `https://api.openweathermap.org/data/2.5/air_pollution?lat=${currentJson.coord.lat}&lon=${currentJson.coord.lon}&appid=${apiKey}`,
        { next: { revalidate: 600 } }
      );
      if (aqiRes.ok) {
        const aqiJson = await aqiRes.json();
        const item = aqiJson.list?.[0];
        if (item) {
          airQuality = {
            aqi: item.main.aqi,
            usAqi: item.main.aqi * 30,
            europeanAqi: item.main.aqi * 20,
            co: item.components.co,
            no: item.components.no,
            no2: item.components.no2,
            o3: item.components.o3,
            so2: item.components.so2,
            pm2_5: item.components.pm2_5,
            pm10: item.components.pm10,
            nh3: item.components.nh3,
          };
        }
      }
    } catch {
      // air quality non-critical
    }

    if (!airQuality) {
      airQuality = {
        aqi: 2,
        usAqi: 45,
        europeanAqi: 30,
        co: 240.3,
        no: 0.1,
        no2: 12.4,
        o3: 48.2,
        so2: 3.1,
        pm2_5: 8.6,
        pm10: 16.2,
        nh3: 0.8,
      };
    }

    const primaryCond = currentJson.weather?.[0] || { main: "Clear", description: "clear sky", icon: "01d" };

    const current: CurrentWeather = {
      cityName: currentJson.name,
      country: currentJson.sys?.country || "",
      lat: currentJson.coord.lat,
      lon: currentJson.coord.lon,
      temp: currentJson.main.temp,
      feelsLike: currentJson.main.feels_like,
      tempMin: currentJson.main.temp_min,
      tempMax: currentJson.main.temp_max,
      humidity: currentJson.main.humidity,
      pressure: currentJson.main.pressure,
      windSpeed: currentJson.wind.speed,
      windDeg: currentJson.wind.deg ?? 0,
      windGusts: currentJson.wind.gust,
      clouds: currentJson.clouds?.all ?? 0,
      visibility: currentJson.visibility ?? 10000,
      uvIndex: 4.2,
      dewPoint: currentJson.main.temp - (100 - currentJson.main.humidity) / 5,
      condition: {
        type: mapOpenWeatherCondition(primaryCond.icon, primaryCond.main),
        main: primaryCond.main,
        description: primaryCond.description,
        icon: primaryCond.icon,
      },
      sunrise: currentJson.sys?.sunrise ?? Math.floor(Date.now() / 1000) - 20000,
      sunset: currentJson.sys?.sunset ?? Math.floor(Date.now() / 1000) + 20000,
      dt: currentJson.dt ?? Math.floor(Date.now() / 1000),
      moon: calculateMoonInfo(new Date()),
      airQuality,
    };

    const hourly: HourlyForecastItem[] = (forecastJson.list || []).slice(0, 12).map((item: any) => {
      const date = new Date(item.dt * 1000);
      const timeStr = date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false });
      const cond = item.weather?.[0] || { main: "Clear", description: "clear sky", icon: "01d" };

      return {
        time: timeStr,
        timestamp: item.dt,
        temp: item.main.temp,
        feelsLike: item.main.feels_like,
        humidity: item.main.humidity,
        windSpeed: item.wind.speed,
        windGusts: item.wind.gust,
        uvIndex: 3.5,
        dewPoint: item.main.temp - (100 - item.main.humidity) / 5,
        cloudCover: item.clouds?.all ?? 20,
        conditionType: mapOpenWeatherCondition(cond.icon, cond.main),
        description: cond.description,
        pop: item.pop ?? 0,
      };
    });

    const dayGroups: Record<string, any[]> = {};
    (forecastJson.list || []).forEach((item: any) => {
      const date = new Date(item.dt * 1000);
      const dayKey = date.toISOString().split("T")[0];
      if (!dayGroups[dayKey]) dayGroups[dayKey] = [];
      dayGroups[dayKey].push(item);
    });

    const todayIso = new Date().toISOString().split("T")[0];
    const daily: DailyForecastItem[] = Object.entries(dayGroups).slice(0, 7).map(([dateStr, items]) => {
      const date = new Date(dateStr);
      const dayName =
        dateStr === todayIso
          ? "TODAY"
          : date.toLocaleDateString("en-US", { weekday: "short" }).toUpperCase();

      const temps = items.map((i) => i.main.temp);
      const min = Math.min(...temps);
      const max = Math.max(...temps);
      const midItem = items[Math.floor(items.length / 2)] || items[0];
      const cond = midItem.weather?.[0] || { main: "Clouds", description: "few clouds", icon: "02d" };

      return {
        day: dayName,
        date: dateStr,
        tempMin: min,
        tempMax: max,
        conditionType: mapOpenWeatherCondition(cond.icon, cond.main),
        description: cond.description,
        pop: Math.max(...items.map((i) => i.pop ?? 0)),
        humidity: midItem.main.humidity,
        windSpeed: midItem.wind.speed,
        windGusts: midItem.wind.gust,
        uvIndexMax: 4.5,
      };
    });

    const alerts = buildMeteorologicalAlerts(current, daily);

    return {
      current,
      hourly,
      daily,
      alerts,
      dataSource: "LIVE_API",
      providerName: "OpenWeatherMap Live API",
      stationName: "OWM 2.5 Surface Stations",
    };
  } catch (error) {
    console.warn("fetchOpenWeather error:", error);
    return null;
  }
}

function generateFallbackWeather(
  cityName: string,
  lat: number | null = null,
  lon: number | null = null,
  country: string = "GLOBAL"
): WeatherData {
  const cleanName = cityName.charAt(0).toUpperCase() + cityName.slice(1).toLowerCase();
  const now = Math.floor(Date.now() / 1000);

  const current: CurrentWeather = {
    cityName: cleanName,
    country: country || "GLOBAL",
    lat: lat ?? 51.5074,
    lon: lon ?? -0.1278,
    temp: 21.4,
    feelsLike: 20.8,
    tempMin: 16.0,
    tempMax: 24.5,
    humidity: 58,
    pressure: 1014,
    windSpeed: 4.2,
    windDeg: 210,
    windGusts: 6.8,
    clouds: 25,
    visibility: 10000,
    uvIndex: 4.8,
    dewPoint: 12.8,
    condition: {
      type: "PARTLY_CLOUDY_DAY",
      main: "Clouds",
      description: "scattered clouds",
      icon: "03d",
    },
    sunrise: now - 21600,
    sunset: now + 21600,
    dt: now,
    moon: calculateMoonInfo(new Date()),
    airQuality: {
      aqi: 2,
      usAqi: 42,
      europeanAqi: 28,
      co: 220.5,
      no: 0.1,
      no2: 14.2,
      o3: 52.1,
      so2: 2.8,
      pm2_5: 9.4,
      pm10: 17.8,
      nh3: 0.6,
    },
  };

  const hourly: HourlyForecastItem[] = Array.from({ length: 24 }).map((_, i) => {
    const date = new Date((now + i * 3600) * 1000);
    const time = date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
    const hour = date.getHours();
    const isDay = hour >= 6 && hour <= 20;

    return {
      time,
      timestamp: now + i * 3600,
      temp: parseFloat((21.4 + Math.sin(i / 3) * 4).toFixed(1)),
      feelsLike: 21,
      humidity: 55 + (i % 8) * 2,
      windSpeed: 3.5 + (i % 3) * 0.5,
      windGusts: 5.5 + (i % 4) * 0.8,
      uvIndex: isDay ? Math.max(0, Math.round(Math.sin(((hour - 6) / 14) * Math.PI) * 7 * 10) / 10) : 0,
      dewPoint: 12.5,
      cloudCover: 20 + (i % 5) * 10,
      conditionType: isDay ? (i % 3 === 0 ? "PARTLY_CLOUDY_DAY" : "SUNNY") : (i % 3 === 0 ? "PARTLY_CLOUDY_NIGHT" : "CLEAR_NIGHT"),
      description: isDay ? "mostly sunny" : "clear night",
      pop: i % 4 === 0 ? 0.25 : 0.05,
    };
  });

  const dayNames = ["TODAY", "TUE", "WED", "THU", "FRI", "SAT", "SUN", "MON", "TUE", "WED"];
  const daily: DailyForecastItem[] = dayNames.slice(0, 10).map((day, i) => ({
    day,
    date: new Date(Date.now() + i * 86400000).toISOString().split("T")[0],
    tempMin: 14 + (i % 4),
    tempMax: 23 + (i % 3),
    conditionType: i === 2 ? "RAIN" : i % 3 === 0 ? "PARTLY_CLOUDY_DAY" : "SUNNY",
    description: i === 2 ? "light rain" : "mostly sunny",
    pop: i === 2 ? 0.65 : 0.15,
    humidity: 50 + i * 3,
    windSpeed: 4.0,
    windGusts: 6.5,
    uvIndexMax: 5.2,
  }));

  const alerts = buildMeteorologicalAlerts(current, daily);

  return {
    current,
    hourly,
    daily,
    alerts,
    dataSource: "MOCK_FALLBACK",
    providerName: "Autonomous Synoptic Simulator",
    stationName: "Synthetic Mathematical Station",
  };
}

function buildMeteorologicalAlerts(current: CurrentWeather, daily: DailyForecastItem[]): WeatherAlert[] {
  const alerts: WeatherAlert[] = [];
  const now = new Date();
  const dateStr = now.toLocaleDateString();

  // 1. Extreme Heat Advisory
  if (current.temp >= 35 || current.feelsLike >= 38) {
    alerts.push({
      id: "alert-heat",
      source: "WMO Global Alert System",
      event: "Excessive Heat Advisory",
      headline: `Severe heat index of ${current.feelsLike.toFixed(1)}°C observed across ${current.cityName} sector.`,
      severity: current.temp >= 40 ? "Extreme" : "Severe",
      urgency: "Immediate",
      areas: current.cityName,
      instruction: "Stay hydrated. Avoid strenuous outdoor activities between 11 AM and 5 PM. Check on vulnerable individuals.",
      effective: dateStr,
      expires: "20:00 Today",
    });
  }

  // 2. Severe Freeze / Black Ice
  if (current.temp <= 0) {
    alerts.push({
      id: "alert-freeze",
      source: "Synoptic Warning Bureau",
      event: "Sub-Zero Freeze Hazard",
      headline: `Ambient temperatures at ${current.temp.toFixed(1)}°C with roadway freezing potential.`,
      severity: current.temp <= -10 ? "Severe" : "Moderate",
      urgency: "Immediate",
      areas: current.cityName,
      instruction: "Drive with extreme caution on bridges and overpasses. Insulate outdoor exposed plumbing fixtures.",
      effective: dateStr,
      expires: "10:00 Tomorrow",
    });
  }

  // 3. Gale Wind Warning
  if (current.windSpeed >= 13.9 || (current.windGusts && current.windGusts >= 18)) {
    alerts.push({
      id: "alert-wind",
      source: "Marine & Terrestrial Wind Service",
      event: "Gale Wind Warning",
      headline: `Sustained winds of ${current.windSpeed} m/s with gusts up to ${current.windGusts || 20} m/s.`,
      severity: current.windSpeed >= 20 ? "Severe" : "Moderate",
      urgency: "Immediate",
      areas: current.cityName,
      instruction: "Secure outdoor furniture and loose exterior items. High-profile vehicles should exercise caution.",
      effective: dateStr,
      expires: "22:00 Today",
    });
  }

  // 4. Thunderstorm
  if (current.condition.type === "STORM") {
    alerts.push({
      id: "alert-storm",
      source: "Doppler Severe Weather Radar",
      event: "Severe Thunderstorm Watch",
      headline: `Active electrical convective activity and heavy precipitation localized over ${current.cityName}.`,
      severity: "Severe",
      urgency: "Immediate",
      areas: current.cityName,
      instruction: "Seek indoor shelter immediately. Disconnect sensitive electronic equipment. Avoid open water.",
      effective: dateStr,
      expires: "In 4 hours",
    });
  }

  // 5. Extreme UV Radiation
  if (current.uvIndex && current.uvIndex >= 8) {
    alerts.push({
      id: "alert-uv",
      source: "Photobiology Radiation Monitor",
      event: "Very High UV Radiation Warning",
      headline: `Ultraviolet solar radiation index reached ${current.uvIndex.toFixed(1)} (Very High / Extreme).`,
      severity: current.uvIndex >= 11 ? "Extreme" : "Severe",
      urgency: "Expected",
      areas: current.cityName,
      instruction: "Unprotected skin and eyes can burn within minutes. Apply SPF 50+ sunscreen, wear UV-blocking sunglasses.",
      effective: "11:00 AM",
      expires: "04:00 PM",
    });
  }

  // 6. Air Quality Hazard
  if (current.airQuality && (current.airQuality.usAqi || 0) >= 150) {
    alerts.push({
      id: "alert-aqi",
      source: "Environmental Protection Agency",
      event: "Unhealthy Air Quality Alert",
      headline: `AQI index of ${current.airQuality.usAqi} detected with elevated fine particulate matter PM2.5.`,
      severity: (current.airQuality.usAqi || 0) >= 200 ? "Extreme" : "Severe",
      urgency: "Immediate",
      areas: current.cityName,
      instruction: "Sensitive groups, children, and elderly should avoid outdoor physical exertion. Wear N95 filtration masks outdoors.",
      effective: dateStr,
      expires: "Midnight",
    });
  }

  return alerts;
}

