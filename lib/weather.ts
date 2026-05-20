// Weather Service for OpenWeather API & Mock Engine
// Provided API Key: 4483c686af6e2e21072d875ed1e5be27

export interface WeatherCondition {
  id: number;
  main: string;
  description: string;
  icon: string;
  type: "SUNNY" | "CLOUDY" | "RAIN" | "SNOW" | "STORM" | "FOG" | "NIGHT";
}

export interface CurrentWeather {
  cityName: string;
  country: string;
  lat: number;
  lon: number;
  temp: number;
  feelsLike: number;
  tempMin: number;
  tempMax: number;
  humidity: number;
  pressure: number;
  windSpeed: number; // m/s
  windDeg: number;
  cloudiness: number; // %
  sunrise: number; // timestamp
  sunset: number; // timestamp
  condition: WeatherCondition;
  dt: number; // timestamp
  uvIndex: number; // simulated or live (approximate)
  aqi: number; // simulated or live (approximate)
}

export interface HourlyForecastItem {
  time: string; // e.g. "14:00"
  temp: number;
  conditionType: WeatherCondition["type"];
  pop: number; // probability of precipitation (0 to 1)
}

export interface DailyForecastItem {
  day: string; // e.g. "MON"
  tempMin: number;
  tempMax: number;
  conditionType: WeatherCondition["type"];
  description: string;
}

export interface WeatherData {
  current: CurrentWeather;
  hourly: HourlyForecastItem[];
  daily: DailyForecastItem[];
  dataSource: "LIVE_API" | "MOCK_FALLBACK";
}

// Convert OpenWeather API ID to Nothing OS Condition Type
export function mapWeatherIdToType(id: number, isNight: boolean = false): WeatherCondition["type"] {
  if (id >= 200 && id < 300) return "STORM";
  if (id >= 300 && id < 600) return "RAIN";
  if (id >= 600 && id < 700) return "SNOW";
  if (id >= 700 && id < 800) return "FOG";
  if (id === 800) return isNight ? "NIGHT" : "SUNNY";
  if (id > 800) return "CLOUDY";
  return "CLOUDY";
}

const API_KEY = "4483c686af6e2e21072d875ed1e5be27";
const BASE_URL = "https://api.openweathermap.org/data/2.5";

// Mock Data Database
const MOCK_CITIES: Record<string, WeatherData> = {
  london: {
    current: {
      cityName: "London",
      country: "GB",
      lat: 51.5074,
      lon: -0.1278,
      temp: 14.5,
      feelsLike: 13.8,
      tempMin: 11.0,
      tempMax: 16.5,
      humidity: 78,
      pressure: 1014,
      windSpeed: 4.8,
      windDeg: 230,
      cloudiness: 82,
      sunrise: Math.floor(Date.now() / 1000) - 36000, // 10h ago
      sunset: Math.floor(Date.now() / 1000) + 14400, // 4h from now
      condition: { id: 803, main: "Clouds", description: "broken clouds", icon: "04d", type: "CLOUDY" },
      dt: Math.floor(Date.now() / 1000),
      uvIndex: 3.2,
      aqi: 2, // Fair
    },
    hourly: [
      { time: "09:00", temp: 12.0, conditionType: "CLOUDY", pop: 0.1 },
      { time: "12:00", temp: 14.0, conditionType: "CLOUDY", pop: 0.15 },
      { time: "15:00", temp: 14.5, conditionType: "CLOUDY", pop: 0.2 },
      { time: "18:00", temp: 13.0, conditionType: "RAIN", pop: 0.6 },
      { time: "21:00", temp: 11.5, conditionType: "RAIN", pop: 0.8 },
      { time: "00:00", temp: 10.5, conditionType: "NIGHT", pop: 0.3 },
      { time: "03:00", temp: 9.8, conditionType: "NIGHT", pop: 0.1 },
      { time: "06:00", temp: 10.2, conditionType: "CLOUDY", pop: 0.1 },
    ],
    daily: [
      { day: "TODAY", tempMin: 11.0, tempMax: 16.5, conditionType: "CLOUDY", description: "Cloudy & scattered showers" },
      { day: "FRI", tempMin: 10.0, tempMax: 15.0, conditionType: "RAIN", description: "Light rain" },
      { day: "SAT", tempMin: 12.0, tempMax: 17.5, conditionType: "CLOUDY", description: "Partly cloudy" },
      { day: "SUN", tempMin: 13.0, tempMax: 19.0, conditionType: "SUNNY", description: "Clear and sunny skies" },
      { day: "MON", tempMin: 11.5, tempMax: 15.5, conditionType: "CLOUDY", description: "Overcast clouds" },
      { day: "TUE", tempMin: 9.5, tempMax: 14.0, conditionType: "RAIN", description: "Occasional showers" },
    ],
    dataSource: "MOCK_FALLBACK",
  },
  tokyo: {
    current: {
      cityName: "Tokyo",
      country: "JP",
      lat: 35.6762,
      lon: 139.6503,
      temp: 19.2,
      feelsLike: 19.5,
      tempMin: 17.0,
      tempMax: 21.0,
      humidity: 88,
      pressure: 1008,
      windSpeed: 6.2,
      windDeg: 180,
      cloudiness: 95,
      sunrise: Math.floor(Date.now() / 1000) - 43200,
      sunset: Math.floor(Date.now() / 1000) - 7200,
      condition: { id: 501, main: "Rain", description: "moderate rain", icon: "10n", type: "RAIN" },
      dt: Math.floor(Date.now() / 1000),
      uvIndex: 1.1,
      aqi: 1, // Good
    },
    hourly: [
      { time: "18:00", temp: 20.0, conditionType: "RAIN", pop: 0.8 },
      { time: "21:00", temp: 19.2, conditionType: "RAIN", pop: 0.9 },
      { time: "00:00", temp: 18.5, conditionType: "STORM", pop: 0.95 },
      { time: "03:00", temp: 17.8, conditionType: "STORM", pop: 0.9 },
      { time: "06:00", temp: 17.5, conditionType: "RAIN", pop: 0.7 },
      { time: "09:00", temp: 18.8, conditionType: "CLOUDY", pop: 0.4 },
      { time: "12:00", temp: 20.5, conditionType: "CLOUDY", pop: 0.2 },
      { time: "15:00", temp: 21.0, conditionType: "CLOUDY", pop: 0.1 },
    ],
    daily: [
      { day: "TODAY", tempMin: 17.0, tempMax: 21.0, conditionType: "RAIN", description: "Rain showers and storm" },
      { day: "FRI", tempMin: 16.0, tempMax: 22.0, conditionType: "CLOUDY", description: "Clouds clearing out" },
      { day: "SAT", tempMin: 15.0, tempMax: 24.0, conditionType: "SUNNY", description: "Mostly clear & pleasant" },
      { day: "SUN", tempMin: 17.0, tempMax: 26.0, conditionType: "SUNNY", description: "Warm & sunny day" },
      { day: "MON", tempMin: 18.0, tempMax: 23.5, conditionType: "CLOUDY", description: "Partly cloudy" },
      { day: "TUE", tempMin: 16.5, tempMax: 21.0, conditionType: "RAIN", description: "Showers by afternoon" },
    ],
    dataSource: "MOCK_FALLBACK",
  },
  newyork: {
    current: {
      cityName: "New York",
      country: "US",
      lat: 40.7128,
      lon: -74.006,
      temp: 23.0,
      feelsLike: 22.4,
      tempMin: 18.0,
      tempMax: 25.5,
      humidity: 45,
      pressure: 1020,
      windSpeed: 3.5,
      windDeg: 90,
      cloudiness: 10,
      sunrise: Math.floor(Date.now() / 1000) - 32400,
      sunset: Math.floor(Date.now() / 1000) + 18000,
      condition: { id: 800, main: "Clear", description: "clear sky", icon: "01d", type: "SUNNY" },
      dt: Math.floor(Date.now() / 1000),
      uvIndex: 7.8,
      aqi: 3, // Moderate (Ozone)
    },
    hourly: [
      { time: "09:00", temp: 19.5, conditionType: "SUNNY", pop: 0.0 },
      { time: "12:00", temp: 23.0, conditionType: "SUNNY", pop: 0.0 },
      { time: "15:00", temp: 25.0, conditionType: "SUNNY", pop: 0.05 },
      { time: "18:00", temp: 24.2, conditionType: "SUNNY", pop: 0.05 },
      { time: "21:00", temp: 21.0, conditionType: "NIGHT", pop: 0.0 },
      { time: "00:00", temp: 19.5, conditionType: "NIGHT", pop: 0.0 },
      { time: "03:00", temp: 18.5, conditionType: "NIGHT", pop: 0.0 },
      { time: "06:00", temp: 18.0, conditionType: "SUNNY", pop: 0.0 },
    ],
    daily: [
      { day: "TODAY", tempMin: 18.0, tempMax: 25.5, conditionType: "SUNNY", description: "Perfectly clear & sunny" },
      { day: "FRI", tempMin: 19.0, tempMax: 27.0, conditionType: "SUNNY", description: "Warm and bright" },
      { day: "SAT", tempMin: 20.0, tempMax: 29.0, conditionType: "SUNNY", description: "Hot & dry" },
      { day: "SUN", tempMin: 18.0, tempMax: 24.5, conditionType: "CLOUDY", description: "Mild with partial clouds" },
      { day: "MON", tempMin: 16.5, tempMax: 22.0, conditionType: "RAIN", description: "Light morning rain" },
      { day: "TUE", tempMin: 17.0, tempMax: 25.0, conditionType: "SUNNY", description: "Sunny spells return" },
    ],
    dataSource: "MOCK_FALLBACK",
  },
  reykjavik: {
    current: {
      cityName: "Reykjavik",
      country: "IS",
      lat: 64.1466,
      lon: -21.9426,
      temp: -2.0,
      feelsLike: -7.5,
      tempMin: -4.0,
      tempMax: 0.0,
      humidity: 82,
      pressure: 998,
      windSpeed: 8.5,
      windDeg: 350,
      cloudiness: 90,
      sunrise: Math.floor(Date.now() / 1000) - 21600,
      sunset: Math.floor(Date.now() / 1000) + 36000,
      condition: { id: 601, main: "Snow", description: "snowfall", icon: "13d", type: "SNOW" },
      dt: Math.floor(Date.now() / 1000),
      uvIndex: 0.5,
      aqi: 1, // Good
    },
    hourly: [
      { time: "09:00", temp: -3.5, conditionType: "SNOW", pop: 0.8 },
      { time: "12:00", temp: -2.0, conditionType: "SNOW", pop: 0.85 },
      { time: "15:00", temp: -1.5, conditionType: "SNOW", pop: 0.7 },
      { time: "18:00", temp: -2.5, conditionType: "CLOUDY", pop: 0.4 },
      { time: "21:00", temp: -3.0, conditionType: "NIGHT", pop: 0.2 },
      { time: "00:00", temp: -3.5, conditionType: "NIGHT", pop: 0.1 },
      { time: "03:00", temp: -4.0, conditionType: "NIGHT", pop: 0.15 },
      { time: "06:00", temp: -3.8, conditionType: "SNOW", pop: 0.5 },
    ],
    daily: [
      { day: "TODAY", tempMin: -4.0, tempMax: 0.0, conditionType: "SNOW", description: "Active snow and breezy" },
      { day: "FRI", tempMin: -5.0, tempMax: -1.0, conditionType: "SNOW", description: "Scattered light snow" },
      { day: "SAT", tempMin: -6.0, tempMax: -2.0, conditionType: "FOG", description: "Dense fog & icy roads" },
      { day: "SUN", tempMin: -4.0, tempMax: 1.0, conditionType: "CLOUDY", description: "Overcast sky" },
      { day: "MON", tempMin: -2.0, tempMax: 2.5, conditionType: "RAIN", description: "Sleet and cold rain" },
      { day: "TUE", tempMin: -3.5, tempMax: 0.5, conditionType: "SNOW", description: "Light flurries" },
    ],
    dataSource: "MOCK_FALLBACK",
  }
};

// Search Geocoding to retrieve latitude & longitude
export async function searchCoordinates(query: string): Promise<{ lat: number; lon: number; name: string; country: string } | null> {
  const cleanQuery = query.trim().toLowerCase();
  
  // Quick return for mock locations
  if (cleanQuery === "london") return { lat: 51.5074, lon: -0.1278, name: "London", country: "GB" };
  if (cleanQuery === "tokyo") return { lat: 35.6762, lon: 139.6503, name: "Tokyo", country: "JP" };
  if (cleanQuery === "new york" || cleanQuery === "newyork") return { lat: 40.7128, lon: -74.006, name: "New York", country: "US" };
  if (cleanQuery === "reykjavik") return { lat: 64.1466, lon: -21.9426, name: "Reykjavik", country: "IS" };

  try {
    const response = await fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(query)}&limit=1&appid=${API_KEY}`, { signal: AbortSignal.timeout(5000) });
    if (!response.ok) return null;
    const data = await response.json();
    if (data && data.length > 0) {
      return {
        lat: data[0].lat,
        lon: data[0].lon,
        name: data[0].name,
        country: data[0].country,
      };
    }
  } catch (error) {
    console.warn("Geocoding failed, falling back to local resolver", error);
  }

  // Fallback to closest mock match
  for (const key of Object.keys(MOCK_CITIES)) {
    if (key.includes(cleanQuery) || cleanQuery.includes(key)) {
      const target = MOCK_CITIES[key].current;
      return { lat: target.lat, lon: target.lon, name: target.cityName, country: target.country };
    }
  }

  return null;
}

// Fetch Full Weather Report (Live API with complete Mock Engine backup)
export async function fetchWeatherReport(lat: number, lon: number, cityName: string = "Custom Location"): Promise<WeatherData> {
  try {
    // 1. Fetch Current Weather
    const currentRes = await fetch(`${BASE_URL}/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`, { signal: AbortSignal.timeout(5000) });
    if (!currentRes.ok) throw new Error("Current weather API failed");
    const currentRaw = await currentRes.json();

    // 2. Fetch 5-Day Forecast (3-hour slots)
    const forecastRes = await fetch(`${BASE_URL}/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`, { signal: AbortSignal.timeout(5000) });
    if (!forecastRes.ok) throw new Error("Forecast API failed");
    const forecastRaw = await forecastRes.json();

    // Calculate IsNight
    const now = Math.floor(Date.now() / 1000);
    const sunrise = currentRaw.sys?.sunrise || (now - 36000);
    const sunset = currentRaw.sys?.sunset || (now + 14400);
    const isNight = now < sunrise || now > sunset;

    // Normalizing Current Weather
    const mainCondition = currentRaw.weather?.[0] || { id: 800, main: "Clear", description: "clear sky", icon: "01d" };
    const current: CurrentWeather = {
      cityName: currentRaw.name || cityName,
      country: currentRaw.sys?.country || "UN",
      lat: currentRaw.coord?.lat || lat,
      lon: currentRaw.coord?.lon || lon,
      temp: currentRaw.main?.temp ?? 15,
      feelsLike: currentRaw.main?.feels_like ?? 15,
      tempMin: currentRaw.main?.temp_min ?? (currentRaw.main?.temp ?? 15) - 3,
      tempMax: currentRaw.main?.temp_max ?? (currentRaw.main?.temp ?? 15) + 3,
      humidity: currentRaw.main?.humidity ?? 60,
      pressure: currentRaw.main?.pressure ?? 1013,
      windSpeed: currentRaw.wind?.speed ?? 3.0,
      windDeg: currentRaw.wind?.deg ?? 0,
      cloudiness: currentRaw.clouds?.all ?? 40,
      sunrise,
      sunset,
      condition: {
        id: mainCondition.id,
        main: mainCondition.main,
        description: mainCondition.description,
        icon: mainCondition.icon,
        type: mapWeatherIdToType(mainCondition.id, isNight),
      },
      dt: currentRaw.dt || now,
      uvIndex: simulateUVIndex(mainCondition.id, currentRaw.clouds?.all || 40, isNight),
      aqi: simulateAQI(lat, lon),
    };

    // Normalize Hourly Forecast: Slice the first 8 items (representing 24 hours of 3-hour chunks)
    const hourlyList = forecastRaw.list || [];
    const hourly: HourlyForecastItem[] = hourlyList.slice(0, 8).map((item: any) => {
      const dt = item.dt;
      const hourlyIsNight = dt < sunrise || dt > sunset;
      const hCond = item.weather?.[0] || { id: 800, main: "Clear" };
      
      // Parse beautiful readable time string, e.g. "15:00"
      const date = new Date(dt * 1000);
      const hours = String(date.getHours()).padStart(2, '0');
      const timeStr = `${hours}:00`;

      return {
        time: timeStr,
        temp: item.main?.temp ?? 15,
        conditionType: mapWeatherIdToType(hCond.id, hourlyIsNight),
        pop: item.pop ?? 0,
      };
    });

    // Normalize 5-Day Daily Forecast: Group 3-hour slots into days
    const dailyMap: Record<string, { temps: number[]; weatherIds: number[]; desc: string }> = {};
    const daysOfWeek = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

    hourlyList.forEach((slot: any) => {
      const date = new Date(slot.dt * 1000);
      const dayName = daysOfWeek[date.getDay()];
      
      // We skip today to focus on future days, unless today isn't fully represented.
      // But let's register all days, then rename the current day to "TODAY".
      if (!dailyMap[dayName]) {
        dailyMap[dayName] = { temps: [], weatherIds: [], desc: slot.weather?.[0]?.description || "" };
      }
      dailyMap[dayName].temps.push(slot.main?.temp ?? 15);
      dailyMap[dayName].weatherIds.push(slot.weather?.[0]?.id ?? 800);
    });

    const todayName = daysOfWeek[new Date().getDay()];
    const daily: DailyForecastItem[] = Object.keys(dailyMap).map((day) => {
      const item = dailyMap[day];
      const tempMin = Math.min(...item.temps);
      const tempMax = Math.max(...item.temps);
      // Mode frequency weatherId
      const modeId = getMode(item.weatherIds) || 800;
      
      return {
        day: day === todayName ? "TODAY" : day,
        tempMin,
        tempMax,
        conditionType: mapWeatherIdToType(modeId, false),
        description: item.desc,
      };
    }).sort((a, b) => {
      if (a.day === "TODAY") return -1;
      if (b.day === "TODAY") return 1;
      return 0; // maintain api chronological order
    }).slice(0, 6); // standard 6 slots (Today + 5 days)

    return {
      current,
      hourly,
      daily,
      dataSource: "LIVE_API" as const,
    };

  } catch (error) {
    console.warn("OpenWeather Live fetch failed, falling back to mock weather engine", error);
    
    // Find closest matching mock city by name, default to London
    const query = cityName.toLowerCase();
    let selectedMock = MOCK_CITIES.london;
    for (const key of Object.keys(MOCK_CITIES)) {
      if (query.includes(key) || key.includes(query)) {
        selectedMock = MOCK_CITIES[key];
        break;
      }
    }

    // Dynamic adjustment of fallback values slightly to make search responses unique
    const adjustedMock = JSON.parse(JSON.stringify(selectedMock));
    adjustedMock.current.cityName = cityName.charAt(0).toUpperCase() + cityName.slice(1);
    adjustedMock.current.lat = lat;
    adjustedMock.current.lon = lon;
    adjustedMock.dataSource = "MOCK_FALLBACK" as const;

    return adjustedMock;
  }
}

// Helper: Simulate UV Index realistically based on clouds and time of day
function simulateUVIndex(weatherId: number, cloudPercent: number, isNight: boolean): number {
  if (isNight) return 0;
  let baseUV = 10;
  if (cloudPercent > 80) baseUV -= 6;
  else if (cloudPercent > 50) baseUV -= 4;
  else if (cloudPercent > 20) baseUV -= 2;

  if (weatherId >= 200 && weatherId < 600) baseUV -= 5; // rain/storm
  if (weatherId >= 600 && weatherId < 700) baseUV -= 4; // snow
  
  return parseFloat(Math.max(0.2, baseUV).toFixed(1));
}

// Helper: Simulate AQI (Air Quality Index) realistically (1-5 range: Good, Fair, Moderate, Poor, Very Poor)
function simulateAQI(lat: number, lon: number): number {
  // Semi-random hash based on coordinates so it's consistent for the same city
  const hash = Math.abs(Math.sin(lat) * Math.cos(lon));
  return Math.floor(hash * 4) + 1; // 1 to 5
}

// Array Mode finder
function getMode(arr: number[]): number {
  const frequency: Record<number, number> = {};
  let maxFreq = 0;
  let mode = arr[0];
  
  arr.forEach((val) => {
    frequency[val] = (frequency[val] || 0) + 1;
    if (frequency[val] > maxFreq) {
      maxFreq = frequency[val];
      mode = val;
    }
  });
  
  return mode;
}
