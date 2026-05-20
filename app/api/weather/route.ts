import { NextResponse } from "next/server";
import { searchCoordinates, fetchWeatherReport } from "@/lib/weather";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const city = searchParams.get("city");
    const latStr = searchParams.get("lat");
    const lonStr = searchParams.get("lon");
    const name = searchParams.get("name") || "Custom Location";

    // 1. If city name is specified, resolve coordinates first
    if (city) {
      const geo = await searchCoordinates(city);
      if (!geo) {
        return NextResponse.json(
          { error: `LOCATION_NOT_FOUND: Could not resolve coordinates for "${city}"` },
          { status: 404 }
        );
      }
      const data = await fetchWeatherReport(geo.lat, geo.lon, geo.name);
      return NextResponse.json(data);
    }

    // 2. If explicit coordinates are specified, fetch directly
    if (latStr && lonStr) {
      const lat = parseFloat(latStr);
      const lon = parseFloat(lonStr);

      if (isNaN(lat) || isNaN(lon)) {
        return NextResponse.json(
          { error: "INVALID_PARAMETERS: Latitude and longitude must be valid floating point numbers." },
          { status: 400 }
        );
      }

      const data = await fetchWeatherReport(lat, lon, name);
      return NextResponse.json(data);
    }

    // 3. Neither specified
    return NextResponse.json(
      { error: "MISSING_PARAMETERS: Please specify either ?city=Name or ?lat=Y&lon=X" },
      { status: 400 }
    );
  } catch (error: any) {
    console.error("Server API Weather retrieval error:", error);
    return NextResponse.json(
      { error: "INTERNAL_SERVER_ERROR", details: error.message || "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
