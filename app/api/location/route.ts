import { NextRequest, NextResponse } from "next/server";
import { CONFIG } from "@/lib/config";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  // 1. Try Vercel / Cloudflare geolocation headers
  const vercelCity = request.headers.get("x-vercel-ip-city");
  const vercelCountry = request.headers.get("x-vercel-ip-country");
  const vercelLat = request.headers.get("x-vercel-ip-latitude");
  const vercelLon = request.headers.get("x-vercel-ip-longitude");

  const vercelRegion = request.headers.get("x-vercel-ip-country-region");

  if (vercelCity && vercelLat && vercelLon) {
    const lat = parseFloat(vercelLat);
    const lon = parseFloat(vercelLon);
    if (!isNaN(lat) && !isNaN(lon)) {
      return NextResponse.json({
        city: decodeURIComponent(vercelCity),
        region: vercelRegion ? decodeURIComponent(vercelRegion) : "",
        country: vercelCountry ? decodeURIComponent(vercelCountry) : "",
        lat,
        lon,
        source: "vercel_headers",
      });
    }
  }

  const cfCity = request.headers.get("cf-ipcity");
  const cfCountry = request.headers.get("cf-ipcountry");
  const cfLat = request.headers.get("cf-iplatitude");
  const cfLon = request.headers.get("cf-iplongitude");

  const cfRegion = request.headers.get("cf-region");

  if (cfCity && cfLat && cfLon) {
    const lat = parseFloat(cfLat);
    const lon = parseFloat(cfLon);
    if (!isNaN(lat) && !isNaN(lon)) {
      return NextResponse.json({
        city: decodeURIComponent(cfCity),
        region: cfRegion ? decodeURIComponent(cfRegion) : "",
        country: cfCountry ? decodeURIComponent(cfCountry) : "",
        lat,
        lon,
        source: "cloudflare_headers",
      });
    }
  }

  // 2. Query BigDataCloud IP Geolocation API (free, reliable, global coverage)
  try {
    const forwardedFor = request.headers.get("x-forwarded-for");
    const realIp = request.headers.get("x-real-ip");
    let clientIp = "";
    if (forwardedFor) {
      clientIp = forwardedFor.split(",")[0].trim();
    } else if (realIp) {
      clientIp = realIp.trim();
    }

    // Ignore localhost/private IPv4 and IPv6
    const isPrivateIp =
      !clientIp ||
      clientIp === "127.0.0.1" ||
      clientIp === "::1" ||
      clientIp.startsWith("192.168.") ||
      clientIp.startsWith("10.") ||
      clientIp.startsWith("172.16.") ||
      clientIp.startsWith("172.31.");

    const bdcUrl = isPrivateIp
      ? `${CONFIG.api.bigDataCloudGeoBaseUrl}/reverse-geocode-client?localityLanguage=en`
      : `${CONFIG.api.bigDataCloudGeoBaseUrl}/reverse-geocode-client?ip=${encodeURIComponent(
          clientIp
        )}&localityLanguage=en`;

    const res = await fetch(bdcUrl, { signal: AbortSignal.timeout(3000) });
    if (res.ok) {
      const data = await res.json();
      const region = data.principalSubdivision || "";
      const city =
        data.city || data.locality || region || "";
      const country = data.countryName || data.countryCode || "";
      const lat = data.latitude;
      const lon = data.longitude;

      if (lat !== undefined && lon !== undefined && !isNaN(lat) && !isNaN(lon)) {
        return NextResponse.json({
          city,
          region,
          country,
          lat,
          lon,
          source: "bigdatacloud_ip",
        });
      }
    }
  } catch (err) {
    console.warn("IP Geolocation via BigDataCloud failed:", err);
  }

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
