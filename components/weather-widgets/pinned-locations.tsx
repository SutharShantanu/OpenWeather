"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, Pin, TrendingUp, Cloud, Sun, CloudRain, Snowflake, CloudLightning, HelpCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { AnimatedNumber } from "@/components/ui/animated-number";
import { WeatherData } from "@/lib/weather";

interface PinnedLocationsProps {
  pinnedCities: string[];
  activeCity: string;
  unit: "C" | "F";
  onSelectCity: (cityName: string) => void;
  onUnpinCity: (cityName: string) => void;
}

export function PinnedLocations({
  pinnedCities,
  activeCity,
  unit,
  onSelectCity,
  onUnpinCity,
}: PinnedLocationsProps) {
  const [weatherCache, setWeatherCache] = useState<Record<string, WeatherData>>({});
  const [loadingCities, setLoadingCities] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, boolean>>({});

  // Helper to convert Celsius to Fahrenheit
  const convertTemp = (tempC: number) => {
    return unit === "C" ? tempC : (tempC * 1.8) + 32;
  };

  // Fetch weather data for pinned cities
  useEffect(() => {
    pinnedCities.forEach((city) => {
      const cacheKey = city.toLowerCase().trim();
      if (weatherCache[cacheKey]) return; // already fetched

      setLoadingCities((prev) => ({ ...prev, [cacheKey]: true }));
      
      fetch(`/api/weather?city=${encodeURIComponent(city)}`)
        .then((res) => {
          if (!res.ok) throw new Error("Failed to fetch");
          return res.json();
        })
        .then((data: WeatherData) => {
          setWeatherCache((prev) => ({ ...prev, [cacheKey]: data }));
          setErrors((prev) => ({ ...prev, [cacheKey]: false }));
        })
        .catch(() => {
          setErrors((prev) => ({ ...prev, [cacheKey]: true }));
        })
        .finally(() => {
          setLoadingCities((prev) => ({ ...prev, [cacheKey]: false }));
        });
    });
  }, [pinnedCities, weatherCache]);

  const getWeatherIcon = (type: string) => {
    switch (type) {
      case "SUNNY":
        return <Sun className="h-5 w-5 text-amber-500 animate-spin-slow" />;
      case "RAIN":
        return <CloudRain className="h-5 w-5 text-blue-500 animate-bounce-slow" />;
      case "SNOW":
        return <Snowflake className="h-5 w-5 text-sky-300 animate-pulse" />;
      case "STORM":
        return <CloudLightning className="h-5 w-5 text-purple-500" />;
      case "CLOUDY":
      default:
        return <Cloud className="h-5 w-5 text-gray-400" />;
    }
  };

  // Helper to construct a smooth SVG bezier path for sparkline
  const generateSparklinePath = (temps: number[], width: number, height: number) => {
    if (temps.length < 2) return "";
    const min = Math.min(...temps);
    const max = Math.max(...temps);
    const range = max - min === 0 ? 1 : max - min;

    const points = temps.map((temp, index) => {
      const x = (index / (temps.length - 1)) * width;
      // Invert Y so higher temp is higher on screen (smaller Y value)
      const y = height - ((temp - min) / range) * (height - 8) - 4;
      return { x, y };
    });

    // Generate smooth bezier curve path
    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i];
      const p1 = points[i + 1];
      const cpX1 = p0.x + (p1.x - p0.x) / 3;
      const cpY1 = p0.y;
      const cpX2 = p0.x + (2 * (p1.x - p0.x)) / 3;
      const cpY2 = p1.y;
      d += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${p1.x} ${p1.y}`;
    }

    // Generate area path that closes at bottom
    const areaD = `${d} L ${width} ${height} L 0 ${height} Z`;

    return { lineD: d, areaD, points };
  };

  if (pinnedCities.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 px-1">
        <Pin className="h-4 w-4 text-primary" />
        <h2 className="text-xs font-bold tracking-widest text-text-secondary uppercase font-mono">
          Pinned Locations
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence mode="popLayout">
          {pinnedCities.map((city) => {
            const cacheKey = city.toLowerCase().trim();
            const weather = weatherCache[cacheKey];
            const isLoading = loadingCities[cacheKey];
            const hasError = errors[cacheKey];
            const isActive = activeCity.toLowerCase().trim() === cacheKey;

            return (
              <motion.div
                key={city}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="relative group"
              >
                {isLoading ? (
                  <Card className="glass-panel p-4 h-[120px] flex flex-col justify-between overflow-hidden relative">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-28" />
                        <Skeleton className="h-3 w-16" />
                      </div>
                      <Skeleton className="h-8 w-8 rounded-full" />
                    </div>
                    <div className="flex justify-between items-end">
                      <Skeleton className="h-8 w-14" />
                      <Skeleton className="h-8 w-24" />
                    </div>
                  </Card>
                ) : hasError || !weather ? (
                  <Card className="glass-panel p-4 h-[120px] flex flex-col justify-between border-red-500/30">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-mono text-xs font-bold text-red-500 uppercase">{city}</h3>
                        <p className="text-xs text-text-secondary font-mono mt-1">Unable to load weather</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 rounded-full text-text-secondary hover:text-red-500 hover:bg-red-500/10"
                        onClick={(e) => {
                          e.stopPropagation();
                          onUnpinCity(city);
                        }}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-xs font-bold uppercase font-mono mt-2 self-start h-6 border-red-500/20 text-red-500 hover:bg-red-500/10"
                      onClick={() => {
                        // Retry fetching
                        setLoadingCities((prev) => ({ ...prev, [cacheKey]: true }));
                        fetch(`/api/weather?city=${encodeURIComponent(city)}`)
                          .then((res) => {
                            if (!res.ok) throw new Error("Failed");
                            return res.json();
                          })
                          .then((data) => {
                            setWeatherCache((prev) => ({ ...prev, [cacheKey]: data }));
                            setErrors((prev) => ({ ...prev, [cacheKey]: false }));
                          })
                          .catch(() => {
                            setErrors((prev) => ({ ...prev, [cacheKey]: true }));
                          })
                          .finally(() => {
                            setLoadingCities((prev) => ({ ...prev, [cacheKey]: false }));
                          });
                      }}
                    >
                      Retry Connection
                    </Button>
                  </Card>
                ) : (
                  <Card
                    onClick={() => onSelectCity(weather.current.cityName)}
                    className={`glass-panel p-4 h-[120px] flex flex-col justify-between overflow-hidden relative cursor-pointer group hover:scale-[1.01] hover:shadow-lg transition-all duration-300 select-none ${
                      isActive ? "border-primary/50 ring-1 ring-primary/20 bg-primary/[0.02]" : ""
                    }`}
                  >
                    {/* Background SVG Sparkline */}
                    <div className="absolute inset-0 z-0 opacity-15 dark:opacity-20 group-hover:opacity-30 dark:group-hover:opacity-35 transition-opacity duration-300 pointer-events-none">
                      {(() => {
                        const temps = weather.hourly.map((h) => convertTemp(h.temp));
                        const width = 340;
                        const height = 120;
                        const paths = generateSparklinePath(temps, width, height);
                        if (!paths) return null;

                        // Calculate average temp to pick a color
                        const avgTemp = temps.reduce((a, b) => a + b, 0) / temps.length;
                        const gradientId = `spark-grad-${cacheKey}`;
                        const strokeColor = avgTemp > (unit === "C" ? 22 : 71.6)
                          ? "rgb(249, 115, 22)" // Orange
                          : avgTemp > (unit === "C" ? 10 : 50)
                            ? "rgb(234, 179, 8)" // Yellow/Gold
                            : "rgb(14, 165, 233)"; // Sky Blue

                        return (
                          <svg className="w-full h-full" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
                            <defs>
                              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor={strokeColor} stopOpacity="0.4" />
                                <stop offset="100%" stopColor={strokeColor} stopOpacity="0" />
                              </linearGradient>
                            </defs>
                            {/* Gradient Fill */}
                            <path d={paths.areaD} fill={`url(#${gradientId})`} />
                            {/* Stroke Line */}
                            <path
                              d={paths.lineD}
                              fill="none"
                              stroke={strokeColor}
                              strokeWidth="2"
                              strokeLinecap="round"
                            />
                            {/* Pulsing dot at current point */}
                            {paths.points.length > 0 && (
                              <circle
                                cx={paths.points[paths.points.length - 1].x}
                                cy={paths.points[paths.points.length - 1].y}
                                r="3"
                                fill={strokeColor}
                                className="animate-pulse"
                              />
                            )}
                          </svg>
                        );
                      })()}
                    </div>

                    {/* Content Layer (z-10 to stay above background graph) */}
                    <div className="flex justify-between items-start z-10 relative">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          <h3 className="font-mono text-xs font-bold tracking-tight text-text-primary group-hover:text-primary transition-colors duration-200 uppercase">
                            {weather.current.cityName}
                          </h3>
                          <span className="text-xs text-text-secondary font-mono border border-border-visible px-1 rounded bg-surface/50">
                            {weather.current.country}
                          </span>
                        </div>
                        <p className="text-xs text-text-secondary font-mono capitalize">
                          {weather.current.condition.description}
                        </p>
                      </div>

                      <div className="flex items-center gap-1">
                        <div className="bg-surface/60 border border-border-visible p-1.5 rounded-full shadow-sm">
                          {getWeatherIcon(weather.current.condition.type)}
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 rounded-full text-text-secondary opacity-0 group-hover:opacity-100 focus:opacity-100 hover:text-red-500 hover:bg-red-500/10 transition-all duration-200"
                          onClick={(e) => {
                            e.stopPropagation();
                            onUnpinCity(city);
                          }}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>

                    <div className="flex justify-between items-end z-10 relative">
                      <div className="flex items-baseline font-doto">
                        <span className="text-3xl font-black tracking-tighter">
                          <AnimatedNumber value={Math.round(convertTemp(weather.current.temp))} />
                        </span>
                        <span className="text-sm font-bold text-text-secondary font-mono">°{unit}</span>
                      </div>

                      <div className="flex items-center gap-2 text-xs font-mono text-text-secondary bg-surface/60 border border-border-visible px-2 py-1 rounded">
                        <TrendingUp className="h-3 w-3 text-primary animate-pulse" />
                        <span className="font-doto">H: <AnimatedNumber value={Math.round(convertTemp(weather.current.tempMax))} />°</span>
                        <span className="opacity-40">|</span>
                        <span className="font-doto">L: <AnimatedNumber value={Math.round(convertTemp(weather.current.tempMin))} />°</span>
                      </div>
                    </div>
                  </Card>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
