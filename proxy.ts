import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Per-IP fixed-window rate limit for the public API routes, which proxy paid
// or third-party upstreams (OpenWeatherMap key, Edge TTS, geocoders).
// ponytail: in-memory, so limits are per server instance; move to a shared
// store (e.g. Redis/Upstash) or platform WAF rules when running several instances.
const WINDOW_MS = 60_000
const LIMITS: Record<string, number> = {
  tts: 20,
  advisor: 15, // each call can hit the Gemini API
  default: 60,
}
const MAX_TRACKED = 10_000

const hits = new Map<string, { count: number; resetAt: number }>()

function clientIp(request: NextRequest) {
  // Only trustworthy behind a proxy that overwrites this header (Vercel, Nginx, Cloudflare).
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  )
}

export function proxy(request: NextRequest) {
  const route = request.nextUrl.pathname.split("/")[2] ?? ""
  const bucket = route in LIMITS ? route : "default"
  const limit = LIMITS[bucket]
  const key = `${bucket}:${clientIp(request)}`
  const now = Date.now()

  let entry = hits.get(key)
  if (!entry || entry.resetAt <= now) {
    if (hits.size >= MAX_TRACKED) {
      for (const [k, v] of hits) if (v.resetAt <= now) hits.delete(k)
      if (hits.size >= MAX_TRACKED) hits.clear()
    }
    entry = { count: 0, resetAt: now + WINDOW_MS }
    hits.set(key, entry)
  }
  entry.count++

  if (entry.count > limit) {
    const retryAfter = Math.ceil((entry.resetAt - now) / 1000)
    return NextResponse.json(
      { error: "Too many requests. Please slow down and try again shortly." },
      { status: 429, headers: { "Retry-After": String(retryAfter) } }
    )
  }
  return NextResponse.next()
}

export const config = {
  matcher: "/api/:path*",
}
