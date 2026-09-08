import { NextRequest, NextResponse } from "next/server";
import { OPENWEATHER_API_KEY } from "@/lib/weather";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim();

  if (!q || q.length < 2) {
    return NextResponse.json({ results: [] });
  }

  // 0. Coordinate query support (e.g. "28.65, 77.23" or "28.65 77.23")
  const coordMatch = q.match(/^(-?\d+(?:\.\d+)?)[,\s]+(-?\d+(?:\.\d+)?)$/);
  if (coordMatch) {
    const lat = parseFloat(coordMatch[1]);
    const lon = parseFloat(coordMatch[2]);
    if (!isNaN(lat) && !isNaN(lon) && Math.abs(lat) <= 90 && Math.abs(lon) <= 180) {
      return NextResponse.json({
        results: [
          {
            name: `${lat >= 0 ? lat.toFixed(2) + "°N" : Math.abs(lat).toFixed(2) + "°S"}, ${
              lon >= 0 ? lon.toFixed(2) + "°E" : Math.abs(lon).toFixed(2) + "°W"
            }`,
            country: "Coordinates",
            state: "Custom Station",
            lat,
            lon,
          },
        ],
      });
    }
  }

  // 1. Try Open-Meteo Geocoding (Fast, zero API keys required, global coverage)
  try {
    const openMeteoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
      q
    )}&count=6&language=en&format=json`;
    const res = await fetch(openMeteoUrl, { next: { revalidate: 3600 } });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.results) && data.results.length > 0) {
        const results = data.results.map((item: any) => ({
          name: item.name,
          country: item.country || item.country_code || "",
          state: item.admin1 || "",
          lat: item.latitude,
          lon: item.longitude,
          population: item.population,
        }));
        return NextResponse.json({ results });
      }
    }
  } catch (err) {
    console.warn("Open-Meteo geocoding search failed, trying fallback", err);
  }

  // 2. Fallback to OpenWeather Geocoding
  try {
    const owUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(
      q
    )}&limit=5&appid=${OPENWEATHER_API_KEY}`;
    const res = await fetch(owUrl, { next: { revalidate: 3600 } });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) {
        const results = data.map((item: any) => ({
          name: item.name,
          country: item.country || "",
          state: item.state || "",
          lat: item.lat,
          lon: item.lon,
        }));
        return NextResponse.json({ results });
      }
    }
  } catch (err) {
    console.warn("OpenWeather geocoding fallback failed", err);
  }

  return NextResponse.json({ results: [] });
}
