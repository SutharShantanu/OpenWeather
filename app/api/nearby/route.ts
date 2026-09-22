import { NextRequest, NextResponse } from "next/server";
import { CONFIG } from "@/lib/config";
import { NearbyCity } from "@/lib/weather";
import { haversineDistanceKm } from "@/lib/utils";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const lat = parseFloat(searchParams.get("lat") || "");
  const lon = parseFloat(searchParams.get("lon") || "");

  if (isNaN(lat) || isNaN(lon)) {
    return NextResponse.json({ cities: [] });
  }

  // 1. Reverse-geocode the user's location via BigDataCloud to get current city
  let currentCity = "";
  let currentCountry = "";
  try {
    const bdcUrl = `${CONFIG.api.bigDataCloudGeoBaseUrl}/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`;
    const res = await fetch(bdcUrl, { next: { revalidate: 86400 } });
    if (res.ok) {
      const data = await res.json();
      currentCity =
        data.city || data.locality || data.principalSubdivision || "";
      currentCountry = data.countryName || data.countryCode || "";
    }
  } catch {
    // ignore
  }

  // 2. Use Open-Meteo geocoding to search for cities near the user's location.
  //    Strategy: search with the current city name to get nearby alternatives,
  //    and also search with country/region name for broader results.
  const nearbyCities: NearbyCity[] = [];
  const seen = new Set<string>();

  const searchTerms: string[] = [];
  if (currentCity) searchTerms.push(currentCity);
  if (currentCountry) searchTerms.push(currentCountry);

  // Also try coordinate-offset based searches to find cities in the vicinity
  const offsets = [
    { dlat: 0.5, dlon: 0 },
    { dlat: -0.5, dlon: 0 },
    { dlat: 0, dlon: 0.5 },
    { dlat: 0, dlon: -0.5 },
    { dlat: 0.3, dlon: 0.3 },
    { dlat: -0.3, dlon: -0.3 },
  ];

  // Search each offset coordinate via reverse-geocode to discover nearby city names
  const reversePromises = offsets.map(async ({ dlat, dlon }) => {
    try {
      const bdcUrl = `${CONFIG.api.bigDataCloudGeoBaseUrl}/reverse-geocode-client?latitude=${lat + dlat}&longitude=${lon + dlon}&localityLanguage=en`;
      const res = await fetch(bdcUrl, { next: { revalidate: 86400 } });
      if (res.ok) {
        const data = await res.json();
        const city =
          data.city || data.locality || data.principalSubdivision || "";
        if (city && !searchTerms.includes(city)) {
          searchTerms.push(city);
        }
      }
    } catch {
      // ignore
    }
  });

  await Promise.allSettled(reversePromises);

  // Search Open-Meteo for each discovered term
  const geoPromises = searchTerms.slice(0, 6).map(async (term) => {
    try {
      const url = `${CONFIG.api.openMeteoGeoBaseUrl}/search?name=${encodeURIComponent(term)}&count=10&language=en&format=json`;
      const res = await fetch(url, { next: { revalidate: 3600 } });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.results)) {
          for (const item of data.results) {
            const name = item.name || "";
            const key = `${name.toLowerCase()}-${item.country_code || ""}`;
            if (seen.has(key)) continue;
            // Skip the user's current city
            if (
              name.toLowerCase() === currentCity.toLowerCase() &&
              item.country_code === currentCountry
            )
              continue;
            seen.add(key);

            const dist = haversineDistanceKm(
              lat,
              lon,
              item.latitude,
              item.longitude
            );
            // Only include cities within ~500km radius
            if (dist <= 500 && dist > 5) {
              nearbyCities.push({
                name,
                country: item.country || item.country_code || "",
                state: item.admin1 || "",
                lat: item.latitude,
                lon: item.longitude,
                distance: Math.round(dist),
                population: item.population,
              });
            }
          }
        }
      }
    } catch {
      // ignore
    }
  });

  await Promise.allSettled(geoPromises);

  // Sort by a weighted score: prefer closer, larger cities
  nearbyCities.sort((a, b) => {
    // Primary: distance (closer first)
    const distScore = a.distance - b.distance;
    // Secondary: population (bigger first), only if distance is similar
    const popA = a.population || 0;
    const popB = b.population || 0;
    if (Math.abs(a.distance - b.distance) < 50) {
      return popB - popA;
    }
    return distScore;
  });

  // Return the top 8 unique nearby cities
  const cities = nearbyCities.slice(0, 8);

  return NextResponse.json({
    currentCity,
    currentCountry,
    cities,
  });
}
