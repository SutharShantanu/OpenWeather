import type { NextRequest } from "next/server"
import { CONFIG } from "@/lib/config"

export interface RequestLocation {
  city: string
  region: string
  country: string
  lat: number
  lon: number
  source: "vercel_headers" | "cloudflare_headers" | "bigdatacloud_ip"
}

/** Header values are URL-encoded by the edge; a malformed one must not throw. */
function safeDecode(value: string | null) {
  if (!value) return ""
  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}

function fromHeaders(
  request: NextRequest,
  names: {
    city: string
    region: string
    country: string
    lat: string
    lon: string
  },
  source: RequestLocation["source"]
): RequestLocation | null {
  const city = request.headers.get(names.city)
  const lat = parseFloat(request.headers.get(names.lat) ?? "")
  const lon = parseFloat(request.headers.get(names.lon) ?? "")
  if (!city || isNaN(lat) || isNaN(lon)) return null
  return {
    city: safeDecode(city),
    region: safeDecode(request.headers.get(names.region)),
    country: safeDecode(request.headers.get(names.country)),
    lat,
    lon,
    source,
  }
}

function isPrivateIp(ip: string) {
  return (
    !ip ||
    ip === "::1" ||
    ip.startsWith("127.") ||
    ip.startsWith("10.") ||
    ip.startsWith("192.168.") ||
    /^172\.(1[6-9]|2\d|3[01])\./.test(ip) ||
    /^f[cd]/i.test(ip) // IPv6 unique-local
  )
}

/**
 * Approximate location of the caller: platform geo headers (Vercel, Cloudflare)
 * first, then BigDataCloud IP lookup. Returns null when nothing works.
 */
export async function detectLocationFromRequest(
  request: NextRequest
): Promise<RequestLocation | null> {
  const platform =
    fromHeaders(
      request,
      {
        city: "x-vercel-ip-city",
        region: "x-vercel-ip-country-region",
        country: "x-vercel-ip-country",
        lat: "x-vercel-ip-latitude",
        lon: "x-vercel-ip-longitude",
      },
      "vercel_headers"
    ) ??
    fromHeaders(
      request,
      {
        city: "cf-ipcity",
        region: "cf-region",
        country: "cf-ipcountry",
        lat: "cf-iplatitude",
        lon: "cf-iplongitude",
      },
      "cloudflare_headers"
    )
  if (platform) return platform

  try {
    const clientIp = (
      request.headers.get("x-forwarded-for")?.split(",")[0] ??
      request.headers.get("x-real-ip") ??
      ""
    ).trim()
    const ipParam = isPrivateIp(clientIp)
      ? ""
      : `ip=${encodeURIComponent(clientIp)}&`
    const res = await fetch(
      `${CONFIG.api.bigDataCloudGeoBaseUrl}/reverse-geocode-client?${ipParam}localityLanguage=en`,
      { signal: AbortSignal.timeout(3000) }
    )
    if (res.ok) {
      const data = await res.json()
      const region = data.principalSubdivision || ""
      const lat = data.latitude
      const lon = data.longitude
      if (
        typeof lat === "number" &&
        typeof lon === "number" &&
        !isNaN(lat) &&
        !isNaN(lon)
      ) {
        return {
          city: data.city || data.locality || region || "",
          region,
          country: data.countryName || data.countryCode || "",
          lat,
          lon,
          source: "bigdatacloud_ip",
        }
      }
    }
  } catch (err) {
    console.warn("IP geolocation via BigDataCloud failed:", err)
  }
  return null
}
