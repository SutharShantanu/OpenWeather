"use client";

import React, { useState, useEffect, useRef } from "react";
import { useTheme } from "next-themes";
import {
  Search,
  MapPin,
  Sparkles,
  Settings,
  Sun,
  Moon,
  X,
  Compass,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { CurrentWeather, DailyForecastItem, HourlyForecastItem, WeatherAlert } from "@/lib/weather";
import { cn } from "@/lib/utils";
import { WeatherTtsButton } from "@/components/weather-tts-button";
import { NotificationsPopover } from "@/components/notifications-popover";
import { ButtonGroup } from "@/components/ui/button-group";

interface GeocodingResult {
  name: string;
  lat: number;
  lon: number;
  country: string;
  state?: string;
}

interface WeatherHeaderProps {
  onSearch: (city: string) => void;
  onLocate: () => void;
  onOpenAiAdvisor?: () => void;
  onOpenSettings?: () => void;
  showNotifications?: boolean;
  onNotificationsOpenChange?: (open: boolean) => void;
  current?: CurrentWeather;
  daily?: DailyForecastItem[];
  hourly?: HourlyForecastItem[];
  alerts?: WeatherAlert[];
  unit: "C" | "F";
  isLoading?: boolean;
}

export function WeatherHeader({
  onSearch,
  onLocate,
  onOpenAiAdvisor,
  onOpenSettings,
  showNotifications,
  onNotificationsOpenChange,
  current,
  daily,
  hourly,
  alerts = [],
  unit,
  isLoading = false,
}: WeatherHeaderProps) {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState<GeocodingResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [detectedCoords, setDetectedCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Catch user location as soon as search is activated
  const handleSearchFocus = () => {
    setIsOpen(true);
    if (typeof navigator !== "undefined" && navigator.geolocation && !detectedCoords && !isLocating) {
      setIsLocating(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setDetectedCoords({
            lat: pos.coords.latitude,
            lon: pos.coords.longitude,
          });
          setIsLocating(false);
        },
        (err) => {
          console.warn("Geolocation catch on search activation failed:", err);
          setIsLocating(false);
        },
        { timeout: 8000, maximumAge: 60000 }
      );
    }
  };

  // Keyboard shortcut: "/" or "Cmd+K" to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.key === "k" && (e.metaKey || e.ctrlKey)) ||
        (e.key === "/" && document.activeElement !== inputRef.current)
      ) {
        e.preventDefault();
        inputRef.current?.focus();
        handleSearchFocus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [detectedCoords, isLocating]);

  // Close search dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Keyless Geocoding API search via internal Next.js route
  useEffect(() => {
    if (!query.trim() || query.trim().length < 2) {
      setResults([]);
      setIsSearching(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query.trim())}`);
        if (res.ok) {
          const data = await res.json();
          const list: GeocodingResult[] = Array.isArray(data)
            ? data
            : Array.isArray(data?.results)
            ? data.results
            : [];
          setResults(list);
        }
      } catch (err) {
        console.warn("Geocoding lookup error:", err);
      } finally {
        setIsSearching(false);
      }
    }, 280);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = (cityName: string) => {
    onSearch(cityName);
    setQuery("");
    setResults([]);
    setIsOpen(false);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (results.length > 0) {
      handleSelect(results[0].name);
    } else if (query.trim()) {
      handleSelect(query.trim());
    } else {
      // Empty input with Enter: use current location
      onLocate();
      setIsOpen(false);
    }
  };

  return (
    <header className="w-full border-b border-border bg-background sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-3 sm:gap-4">
        {/* Logo & Brand */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          <div className="flex items-center justify-center size-8 bg-primary text-primary-foreground">
            <Compass className="size-4" />
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="font-heading font-medium text-sm text-foreground tracking-tight">
              OpenWeather
            </span>
            <Badge variant="outline" className="text-tiny font-mono font-normal hidden sm:inline-flex">
              Console
            </Badge>
          </div>
        </div>

        {/* Center: Search with integrated GPS pin */}
        <div ref={searchRef} className="relative flex-1 max-w-md">
          <form onSubmit={handleFormSubmit} className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
            <Input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setIsOpen(true);
              }}
              onFocus={handleSearchFocus}
              placeholder="Search station or coordinates… (Press /)"
              className="pl-8 pr-16 text-xs font-mono"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
              {query && (
                <button
                  type="button"
                  onClick={() => {
                    setQuery("");
                    setResults([]);
                  }}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="size-3" />
                </button>
              )}
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    onClick={onLocate}
                    disabled={isLoading}
                    className="text-muted-foreground hover:text-primary transition-colors p-1"
                    title="GPS Auto-Detect"
                  >
                    <MapPin className="size-3.5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>GPS Auto-Detect Location</TooltipContent>
              </Tooltip>
              <kbd className="hidden sm:inline-flex px-1 py-0.5 text-micro font-mono text-muted-foreground border border-border">
                /
              </kbd>
            </div>
          </form>

          {/* Autocomplete Dropdown */}
          {isOpen && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-popover border border-border ring-1 ring-foreground/10 z-50 text-xs shadow-md">
              {/* 0. GPS Current Station (Caught instantly on search activation) */}
              <button
                type="button"
                onClick={() => {
                  onLocate();
                  setIsOpen(false);
                  setQuery("");
                  setResults([]);
                }}
                className="w-full px-3 py-2 text-left flex items-center justify-between hover:bg-muted/80 transition-colors border-b border-border bg-primary/5 text-xs font-mono group"
              >
                <div className="flex items-center gap-2">
                  <div className="size-6 bg-primary/10 border border-primary/30 flex items-center justify-center text-primary shrink-0">
                    <MapPin className={cn("size-3.5", isLocating && "animate-pulse text-primary")} />
                  </div>
                  <div>
                    <div className="font-semibold text-foreground flex items-center gap-1.5">
                      <span>Current Station (GPS)</span>
                      {isLocating ? (
                        <Badge variant="outline" className="text-nano font-mono animate-pulse text-primary border-primary/30 py-0 h-4">
                          Detecting...
                        </Badge>
                      ) : detectedCoords ? (
                        <Badge variant="outline" className="text-nano font-mono text-emerald-600 dark:text-emerald-400 border-emerald-500/30 py-0 h-4">
                          GPS Locked
                        </Badge>
                      ) : null}
                    </div>
                    <div className="text-mini text-muted-foreground">
                      {detectedCoords
                        ? `${detectedCoords.lat.toFixed(3)}°, ${detectedCoords.lon.toFixed(3)}° • Click to load station`
                        : "Auto-detect meteorological station from device sensors"}
                    </div>
                  </div>
                </div>
                <span className="text-tiny text-primary font-bold group-hover:underline">Locate →</span>
              </button>

              {isSearching ? (
                <div className="p-3 text-center text-muted-foreground text-xs font-mono">
                  Locating stations…
                </div>
              ) : results.length > 0 ? (
                <div className="py-1 max-h-64 overflow-y-auto">
                  <div className="px-3 py-1 text-tiny font-mono text-muted-foreground uppercase border-b border-border">
                    Geocoding Matches
                  </div>
                  {results.map((r, i) => (
                    <button
                      key={`${r.name}-${r.lat}-${i}`}
                      onClick={() => handleSelect(r.name)}
                      className="w-full px-3 py-2 text-left flex items-center justify-between hover:bg-muted transition-colors border-b border-border/40 last:border-0"
                    >
                      <div className="flex items-center gap-2">
                        <MapPin className="size-3 text-primary shrink-0" />
                        <div>
                          <span className="font-medium text-foreground">{r.name}</span>
                          <span className="text-muted-foreground ml-1.5 text-mini">
                            {r.state ? `${r.state}, ` : ""}{r.country}
                          </span>
                        </div>
                      </div>
                      <span className="font-mono text-tiny text-muted-foreground">
                        {r.lat.toFixed(2)}°, {r.lon.toFixed(2)}°
                      </span>
                    </button>
                  ))}
                </div>
              ) : query.trim().length >= 2 ? (
                <div className="p-3 text-center text-muted-foreground text-xs font-mono">
                  No meteorological station found for &ldquo;{query}&rdquo;
                </div>
              ) : (
                <div className="p-2.5">
                  <div className="text-tiny font-mono text-muted-foreground uppercase mb-1.5">
                    Popular Hubs
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {["Tokyo", "New York", "London", "Paris", "Sydney", "Dubai", "Singapore"].map((c) => (
                      <Button
                        key={c}
                        variant="secondary"
                        size="xs"
                        onClick={() => handleSelect(c)}
                        className="font-mono text-xs"
                      >
                        {c}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Actions: Decluttered, unified controls */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* 1. Spoken Audio Briefing (Text-to-Speech) */}
          {current && (
            <WeatherTtsButton
              current={current}
              daily={daily}
              hourly={hourly}
              unit={unit}
            />
          )}

          {/* 2. AI Weather Intelligence Advisor */}
          {onOpenAiAdvisor && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onOpenAiAdvisor}
                  className="font-mono text-xs gap-1.5 h-8 px-2.5"
                >
                  <Sparkles className="size-3.5 text-primary" />
                  <span className="hidden md:inline text-mini">AI Advisor</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>AI Synoptic Intelligence & Sudden Shift Analysis</TooltipContent>
            </Tooltip>
          )}

          {/* 3, 4, 5: Actions Button Group */}
          <ButtonGroup>
            {/* Real Notifications Center with Web Push */}
            <NotificationsPopover
              alerts={alerts}
              current={current}
              open={showNotifications}
              onOpenChange={onNotificationsOpenChange}
            />

            {/* Comprehensive Settings Menu */}
            {onOpenSettings && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon-sm"
                    onClick={onOpenSettings}
                    className="size-8"
                    title="Configure Station Settings"
                  >
                    <Settings className="size-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Station & Application Preferences</TooltipContent>
              </Tooltip>
            )}

            {/* Theme Toggle with smooth Sun/Moon transition */}
            <Button
              variant="outline"
              size="icon-sm"
              className="size-8 relative"
              onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
              aria-label={mounted ? `Switch to ${resolvedTheme === "dark" ? "light" : "dark"} mode` : "Toggle theme"}
              title="Toggle Dark / Light Theme"
              disabled={!mounted}
            >
              <Sun
                className={cn(
                  "size-3.5 transition-all duration-300",
                  mounted && resolvedTheme === "dark"
                    ? "scale-0 -rotate-90 opacity-0"
                    : "scale-100 rotate-0 opacity-100"
                )}
              />
              <Moon
                className={cn(
                  "absolute size-3.5 transition-all duration-300",
                  mounted && resolvedTheme === "dark"
                    ? "scale-100 rotate-0 opacity-100"
                    : "scale-0 rotate-90 opacity-0"
                )}
              />
              <span className="sr-only">Toggle theme</span>
            </Button>
          </ButtonGroup>
        </div>
      </div>
    </header>
  );
}
