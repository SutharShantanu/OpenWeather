interface EngineConfig {
  mode: 'mock' | 'live';
  apiKey: string;
}

let config: EngineConfig = {
  mode: 'mock',
  apiKey: ''
};

export const setEngineConfig = (newConfig: EngineConfig) => {
  config = { ...config, ...newConfig };
};

export const getEngineConfig = () => config;

export interface WeatherData {
  source: 'mock' | 'api' | 'mock-fallback';
  city: string;
  current: {
    temp: number;
    humidity: number;
    condition: string;
    windSpeed: number;
    windDeg: number;
  };
}

const generateMockData = (city: string, isFallback = false): WeatherData => {
  // Generate deterministic mock data based on city name length
  const baseTemp = 10 + (city.length % 20);
  
  return {
    source: isFallback ? 'mock-fallback' : 'mock',
    city,
    current: {
      temp: baseTemp,
      humidity: 40 + (city.length % 50),
      condition: city.length % 2 === 0 ? 'Clear' : 'Rain',
      windSpeed: 2 + (city.length % 10),
      windDeg: (city.length * 30) % 360
    }
  };
};

export const getWeather = async (city: string): Promise<WeatherData> => {
  if (config.mode === 'mock') {
    return generateMockData(city);
  }

  if (config.mode === 'live' && config.apiKey) {
    try {
      const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${config.apiKey}&units=metric`);
      
      if (!res.ok) {
        throw new Error('API Request Failed');
      }

      const data = await res.json();
      
      return {
        source: 'api',
        city: data.name,
        current: {
          temp: data.main.temp,
          humidity: data.main.humidity,
          condition: data.weather[0]?.main || 'Unknown',
          windSpeed: data.wind.speed,
          windDeg: data.wind.deg
        }
      };
    } catch (error) {
      console.error("Live API failed, falling back to mock data.", error);
      return generateMockData(city, true);
    }
  }

  return generateMockData(city, true);
};
