import type { NextConfig } from "next"
import createNextIntlPlugin from "next-intl/plugin"

const withNextIntl = createNextIntlPlugin("./i18n/request.ts")

// ponytail: no Content-Security-Policy yet; the map pulls tiles from several
// hosts and Next injects inline scripts, so a CSP needs nonces and testing.
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(self)" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
]

const nextConfig: NextConfig = {
  poweredByHeader: false,
  headers() {
    return [{ source: "/:path*", headers: securityHeaders }]
  },
}

export default withNextIntl(nextConfig)
