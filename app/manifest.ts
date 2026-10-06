import type { MetadataRoute } from "next"

// Installable PWA. The icons are full-bleed squares with the glyph inside the
// maskable safe zone, so one file serves both purposes.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "OpenWeather — Precision Weather Console",
    short_name: "OpenWeather",
    description:
      "Live weather, hourly and 7-day forecasts, precipitation radar, air quality and climate normals for any city.",
    start_url: "/",
    display: "standalone",
    background_color: "#1b1c17",
    theme_color: "#1b1c17",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  }
}
