import React from "react"
import {
  Server,
  CloudLightning,
  Globe,
  Cpu,
  ShieldCheck,
} from "lucide-react"
import type { WeatherDataSource } from "@/lib/weather"

export function getProviderIcon(id: WeatherDataSource) {
  switch (id) {
    case "open-meteo":
      return <CloudLightning className="size-3.5 text-sky-500" />
    case "openweathermap":
      return <Globe className="size-3.5 text-amber-500" />
    case "simulation":
      return <Cpu className="size-3.5 text-purple-500" />
    case "auto":
      return <ShieldCheck className="size-3.5 text-emerald-500" />
    default:
      return <Server className="size-3.5 text-primary" />
  }
}
