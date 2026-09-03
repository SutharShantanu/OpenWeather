import React from "react";
import {
  Sun,
  Moon,
  Cloud,
  CloudSun,
  CloudMoon,
  CloudRain,
  CloudLightning,
  CloudSnow,
  CloudFog,
  Wind,
} from "lucide-react";
import { WeatherConditionType } from "@/lib/weather";

interface WeatherIconProps extends React.SVGProps<SVGSVGElement> {
  type: WeatherConditionType;
  size?: number;
  className?: string;
}

export function WeatherIcon({ type, size = 24, className = "", ...props }: WeatherIconProps) {
  switch (type) {
    case "SUNNY":
      return <Sun size={size} className={`text-amber-500 ${className}`} strokeWidth={1.8} {...props} />;
    case "CLEAR_NIGHT":
      return <Moon size={size} className={`text-indigo-400 ${className}`} strokeWidth={1.8} {...props} />;
    case "PARTLY_CLOUDY_DAY":
      return <CloudSun size={size} className={`text-amber-500 ${className}`} strokeWidth={1.8} {...props} />;
    case "PARTLY_CLOUDY_NIGHT":
      return <CloudMoon size={size} className={`text-indigo-300 ${className}`} strokeWidth={1.8} {...props} />;
    case "CLOUDY":
      return <Cloud size={size} className={`text-muted-foreground ${className}`} strokeWidth={1.8} {...props} />;
    case "RAIN":
    case "HEAVY_RAIN":
      return <CloudRain size={size} className={`text-sky-500 ${className}`} strokeWidth={1.8} {...props} />;
    case "SNOW":
      return <CloudSnow size={size} className={`text-cyan-300 ${className}`} strokeWidth={1.8} {...props} />;
    case "STORM":
      return <CloudLightning size={size} className={`text-purple-500 ${className}`} strokeWidth={1.8} {...props} />;
    case "FOG":
      return <CloudFog size={size} className={`text-muted-foreground ${className}`} strokeWidth={1.8} {...props} />;
    case "WINDY":
      return <Wind size={size} className={`text-teal-400 ${className}`} strokeWidth={1.8} {...props} />;
    default:
      return <Sun size={size} className={`text-amber-500 ${className}`} strokeWidth={1.8} {...props} />;
  }
}
