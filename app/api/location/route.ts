import { NextRequest, NextResponse } from "next/server";
import { CONFIG } from "@/lib/config";
import { detectLocationFromRequest } from "@/lib/geo";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  // 1-2. Platform geo headers, then IP lookup
  const detected = await detectLocationFromRequest(request);
  if (detected) return NextResponse.json(detected);

  // 3. Fallback: Config default if set
  if (CONFIG.location.defaultCity) {
    return NextResponse.json({
      city: CONFIG.location.defaultCity,
      country: CONFIG.location.defaultCountry,
      lat: CONFIG.location.defaultLat,
      lon: CONFIG.location.defaultLon,
      source: "config_fallback",
    });
  }

  // Default fallback if all else fails
  return NextResponse.json({
    city: "New York",
    country: "United States",
    lat: 40.7128,
    lon: -74.006,
    source: "static_fallback",
  });
}
