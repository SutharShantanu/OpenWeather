import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getWeather, setEngineConfig, getEngineConfig } from './weather-engine';

describe('Weather Engine', () => {
  beforeEach(() => {
    // Reset to mock before each test
    setEngineConfig({ mode: 'mock', apiKey: '' });
  });

  it('should return mock data when mode is mock', async () => {
    const data = await getWeather('London');
    expect(data.source).toBe('mock');
    expect(data.city).toBe('London');
    expect(data.current.temp).toBeDefined();
  });

  it('should return API data when mode is live and apiKey is valid', async () => {
    // Mock global fetch for this test
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        name: 'Paris',
        main: { temp: 22.5, humidity: 45 },
        weather: [{ main: 'Clear' }],
        wind: { speed: 5.2, deg: 180 }
      })
    });

    setEngineConfig({ mode: 'live', apiKey: 'test-key' });
    const data = await getWeather('Paris');
    
    expect(data.source).toBe('api');
    expect(data.city).toBe('Paris');
    expect(data.current.temp).toBe(22.5);
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('api.openweathermap.org/data/2.5/weather?q=Paris')
    );
  });

  it('should fallback to mock data if API fails', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 401
    });

    setEngineConfig({ mode: 'live', apiKey: 'invalid-key' });
    const data = await getWeather('Berlin');
    
    // Fallback behavior
    expect(data.source).toBe('mock-fallback');
    expect(data.city).toBe('Berlin');
  });
});
