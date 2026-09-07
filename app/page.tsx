"use client";

import React, { useState, useEffect, useCallback } from "react";
import { WeatherHeader } from "@/components/weather-header";
import { WeatherHero } from "@/components/weather-hero";
import { HourlyForecast } from "@/components/hourly-forecast";
import { DailyForecast } from "@/components/daily-forecast";
import { WindWidget } from "@/components/widgets/wind-widget";
import { HumidityWidget } from "@/components/widgets/humidity-widget";
import { AirQualityWidget } from "@/components/widgets/air-quality-widget";
import { SolarWidget } from "@/components/widgets/solar-widget";
import { UvWidget } from "@/components/widgets/uv-widget";
import { PinnedLocations } from "@/components/pinned-locations";
import { EmbeddedRadarCard } from "@/components/embedded-radar-card";
import { InlineAlertBanner } from "@/components/inline-alert-banner";
import { InlineComparisonMatrix } from "@/components/inline-comparison-matrix";
import { WeatherChartsCard } from "@/components/weather-charts-card";
import { AirQualityDeepView } from "@/components/air-quality-deep-view";
import { ClimateNormalsCard } from "@/components/climate-normals-card";
import { SettingsDialog, DEFAULT_EXTENDED_SETTINGS, ExtendedSettings } from "@/components/settings-dialog";
import { AiAdvisorBanner } from "@/components/ai-advisor-banner";
import { AiAdvisorDialog } from "@/components/ai-advisor-dialog";
import { WeatherData } from "@/lib/weather";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { RefreshCw, Radio, LayoutGrid, TrendingUp, CloudRain, Sparkles, ArrowRightLeft, History } from "lucide-react";

export default function WeatherDashboardPage() {
  const [city, setCity] = useState("London");
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<ExtendedSettings>(DEFAULT_EXTENDED_SETTINGS);
  const [pinnedCities, setPinnedCities] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState("overview");
  const [showAiAdvisor, setShowAiAdvisor] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const unit = settings.tempUnit;

  // Initialize settings from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("openweather_settings_v2");
      if (saved) {
        setSettings(JSON.parse(saved));
      }
    } catch {
      // ignore
    }
  }, []);

  const handleUpdateSettings = (newPartial: Partial<ExtendedSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newPartial };
      localStorage.setItem("openweather_settings_v2", JSON.stringify(updated));
      return updated;
    });
  };

  const handleResetSettings = () => {
    setSettings(DEFAULT_EXTENDED_SETTINGS);
    localStorage.setItem("openweather_settings_v2", JSON.stringify(DEFAULT_EXTENDED_SETTINGS));
  };

  const toggleUnit = () => {
    handleUpdateSettings({ tempUnit: unit === "C" ? "F" : "C" });
  };

  // Initialize pinned cities from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("openweather_pinned_v2");
      if (saved) {
        setPinnedCities(JSON.parse(saved));
      } else {
        const defaults = ["Tokyo", "New York", "Paris"];
        setPinnedCities(defaults);
        localStorage.setItem("openweather_pinned_v2", JSON.stringify(defaults));
      }
    } catch {
      // ignore
    }
  }, []);

  // Fetch weather data
  const fetchWeather = useCallback(async (targetCity?: string, targetCoords?: { lat: number; lon: number }) => {
    setLoading(true);
    try {
      let url = "";
      if (targetCoords) {
        url = `/api/weather?lat=${targetCoords.lat}&lon=${targetCoords.lon}`;
      } else {
        const query = targetCity || city;
        url = `/api/weather?city=${encodeURIComponent(query)}`;
      }

      const res = await fetch(url);
      if (res.ok) {
        const data: WeatherData = await res.json();
        setWeather(data);
        if (targetCity) setCity(data.current.cityName);
      }
    } catch (err) {
      console.warn("Failed to load meteorological telemetry", err);
    } finally {
      setLoading(false);
    }
  }, [city]);

  useEffect(() => {
    if (coords) {
      fetchWeather(undefined, coords);
    } else {
      fetchWeather(city);
    }
  }, [city, coords, fetchWeather]);

  // GPS Locate
  const handleLocate = () => {
    if (typeof navigator !== "undefined" && navigator.geolocation) {
      setLoading(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCoords({ lat: pos.coords.latitude, lon: pos.coords.longitude });
        },
        (err) => {
          console.warn("Geolocation denied or unavailable", err);
          fetchWeather(city);
        }
      );
    }
  };

  // Pin / Unpin
  const isPinned = weather ? pinnedCities.some((c) => c.toLowerCase() === weather.current.cityName.toLowerCase()) : false;

  const togglePin = () => {
    if (!weather) return;
    const cityName = weather.current.cityName;
    let next: string[];
    if (isPinned) {
      next = pinnedCities.filter((c) => c.toLowerCase() !== cityName.toLowerCase());
    } else {
      next = [...pinnedCities, cityName];
    }
    setPinnedCities(next);
    localStorage.setItem("openweather_pinned_v2", JSON.stringify(next));
  };

  const handleUnpinCity = (unpinnedCity: string) => {
    const next = pinnedCities.filter((c) => c.toLowerCase() !== unpinnedCity.toLowerCase());
    setPinnedCities(next);
    localStorage.setItem("openweather_pinned_v2", JSON.stringify(next));
  };

  const handleAddPinnedCity = (newCity: string) => {
    if (pinnedCities.some((c) => c.toLowerCase() === newCity.toLowerCase())) return;
    const next = [...pinnedCities, newCity];
    setPinnedCities(next);
    localStorage.setItem("openweather_pinned_v2", JSON.stringify(next));
  };

  const handleRemovePinnedCity = (removeCity: string) => {
    handleUnpinCity(removeCity);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors duration-150">
      <WeatherHeader
        onSearch={(newCity) => {
          setCoords(null);
          setCity(newCity);
        }}
        onLocate={handleLocate}
        onOpenAiAdvisor={() => setShowAiAdvisor(true)}
        onOpenSettings={() => setShowSettings(true)}
        current={weather?.current}
        daily={weather?.daily}
        hourly={weather?.hourly}
        alerts={weather?.alerts}
        unit={unit}
        isLoading={loading}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-4">
        {/* Status Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-muted-foreground border-b border-border pb-2.5">
          <div className="flex items-center gap-2">
            <span className="size-2 bg-emerald-500 shrink-0" />
            <span className="font-semibold text-foreground uppercase">Station Telemetry Active</span>
            <span>•</span>
            <span className="uppercase">Source: {weather?.dataSource === "LIVE_API" ? "Open-Meteo & RainViewer Live Feeds" : "Simulated Sensor"}</span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="xs"
              onClick={() => fetchWeather(city, coords || undefined)}
              disabled={loading}
              className="gap-1.5 font-mono text-xs"
            >
              <RefreshCw className={`size-3 ${loading ? "animate-spin text-primary" : ""}`} />
              <span>Refresh</span>
            </Button>
            <Badge variant="outline" className="font-mono text-tiny">
              <Radio className="size-2.5 mr-1 text-primary" />
              1013.25 hPa
            </Badge>
          </div>
        </div>

        {/* Inline Active Weather Advisories Banner */}
        {weather && !loading && (
          <InlineAlertBanner current={weather.current} alerts={weather.alerts} />
        )}

        {/* MSN Weather Navigation Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-4">
          <TabsList className="w-full justify-start overflow-x-auto border-b border-border p-0 bg-transparent">
            <TabsTrigger
              value="overview"
              className="font-heading font-medium text-xs gap-1.5 border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground rounded-none px-3"
            >
              <LayoutGrid className="size-3.5" />
              <span>Overview</span>
            </TabsTrigger>
            <TabsTrigger
              value="charts"
              className="font-heading font-medium text-xs gap-1.5 border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground rounded-none px-3"
            >
              <TrendingUp className="size-3.5" />
              <span>Graphs & Trends</span>
            </TabsTrigger>
            <TabsTrigger
              value="radar"
              className="font-heading font-medium text-xs gap-1.5 border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground rounded-none px-3"
            >
              <CloudRain className="size-3.5" />
              <span>Radar & Satellite</span>
            </TabsTrigger>
            <TabsTrigger
              value="air-quality"
              className="font-heading font-medium text-xs gap-1.5 border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground rounded-none px-3"
            >
              <Sparkles className="size-3.5" />
              <span>Air Quality & Health</span>
            </TabsTrigger>
            <TabsTrigger
              value="climate"
              className="font-heading font-medium text-xs gap-1.5 border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground rounded-none px-3"
            >
              <History className="size-3.5" />
              <span>Historical & Climate</span>
            </TabsTrigger>
            <TabsTrigger
              value="compare"
              className="font-heading font-medium text-xs gap-1.5 border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground rounded-none px-3"
            >
              <ArrowRightLeft className="size-3.5" />
              <span>Station Comparison</span>
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: OVERVIEW */}
          <TabsContent value="overview" className="space-y-4 focus-visible:outline-none">
            {/* Hero Current Conditions */}
            {weather && !loading ? (
              <WeatherHero
                current={weather.current}
                unit={unit}
                isPinned={isPinned}
                onTogglePin={togglePin}
              />
            ) : (
              <Skeleton className="w-full h-72" />
            )}

            {/* AI Synoptic Intelligence & Sudden Alert Advisor */}
            {weather && !loading && (
              <AiAdvisorBanner
                current={weather.current}
                hourly={weather.hourly}
                daily={weather.daily}
                unit={unit}
                onOpenDetailedAi={() => setShowAiAdvisor(true)}
              />
            )}

            {/* Hourly Trajectory Sequence */}
            {weather && !loading ? (
              <HourlyForecast hourly={weather.hourly} unit={unit} />
            ) : (
              <Skeleton className="w-full h-44" />
            )}

            {/* Embedded Live Doppler Radar Card */}
            {weather && !loading && (
              <EmbeddedRadarCard
                lat={weather.current.lat}
                lon={weather.current.lon}
                cityName={weather.current.cityName}
                heightClass="h-[340px]"
                onExpand={() => setActiveTab("radar")}
              />
            )}

            {/* Multi-Metric Progression Graph */}
            {weather && !loading ? (
              <WeatherChartsCard hourly={weather.hourly} unit={unit} />
            ) : (
              <Skeleton className="w-full h-64" />
            )}

            {/* Bento Grid: 10-day outlook + atmospheric sensors */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Left 2 Cols: 10-day Forecast */}
              <div className="lg:col-span-2">
                {weather && !loading ? (
                  <DailyForecast daily={weather.daily} unit={unit} />
                ) : (
                  <Skeleton className="w-full h-96" />
                )}
              </div>

              {/* Right 1 Col: Telemetry widgets */}
              <div className="space-y-4">
                {weather && !loading ? (
                  <>
                    <UvWidget uvIndex={weather.current.uvIndex} uvMax={weather.daily[0]?.uvIndexMax} />
                    <WindWidget speed={weather.current.windSpeed} deg={weather.current.windDeg} />
                    <HumidityWidget
                      humidity={weather.current.humidity}
                      tempC={weather.current.temp}
                      unit={unit}
                    />
                    <AirQualityWidget airQuality={weather.current.airQuality} />
                    <SolarWidget
                      sunrise={weather.current.sunrise}
                      sunset={weather.current.sunset}
                      currentDt={weather.current.dt}
                      moon={weather.current.moon}
                    />
                  </>
                ) : (
                  <Skeleton className="w-full h-96" />
                )}
              </div>
            </div>

            {/* Pinned Locations */}
            <PinnedLocations
              pinnedCities={pinnedCities}
              unit={unit}
              onSelectCity={(selected) => {
                setCoords(null);
                setCity(selected);
              }}
              onUnpinCity={handleUnpinCity}
            />
          </TabsContent>

          {/* TAB 2: GRAPHS & TRENDS */}
          <TabsContent value="charts" className="space-y-4 focus-visible:outline-none">
            {weather && !loading ? (
              <>
                <WeatherChartsCard hourly={weather.hourly} unit={unit} />
                <HourlyForecast hourly={weather.hourly} unit={unit} />
                <ClimateNormalsCard
                  lat={weather.current.lat}
                  lon={weather.current.lon}
                  currentTemp={weather.current.temp}
                  unit={unit}
                />
                <DailyForecast daily={weather.daily} unit={unit} />
              </>
            ) : (
              <Skeleton className="w-full h-96" />
            )}
          </TabsContent>

          {/* TAB 3: RADAR & SATELLITE */}
          <TabsContent value="radar" className="space-y-4 focus-visible:outline-none">
            {weather && !loading ? (
              <>
                <EmbeddedRadarCard
                  lat={weather.current.lat}
                  lon={weather.current.lon}
                  cityName={weather.current.cityName}
                  heightClass="h-[560px]"
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <WindWidget speed={weather.current.windSpeed} deg={weather.current.windDeg} />
                  <HumidityWidget
                    humidity={weather.current.humidity}
                    tempC={weather.current.temp}
                    unit={unit}
                  />
                </div>
              </>
            ) : (
              <Skeleton className="w-full h-[560px]" />
            )}
          </TabsContent>

          {/* TAB 4: AIR QUALITY & HEALTH */}
          <TabsContent value="air-quality" className="space-y-4 focus-visible:outline-none">
            {weather && !loading ? (
              <AirQualityDeepView airQuality={weather.current.airQuality} />
            ) : (
              <Skeleton className="w-full h-96" />
            )}
          </TabsContent>

          {/* TAB 5: HISTORICAL & CLIMATE */}
          <TabsContent value="climate" className="space-y-4 focus-visible:outline-none">
            {weather && !loading ? (
              <>
                <ClimateNormalsCard
                  lat={weather.current.lat}
                  lon={weather.current.lon}
                  currentTemp={weather.current.temp}
                  unit={unit}
                />
                <DailyForecast daily={weather.daily} unit={unit} />
              </>
            ) : (
              <Skeleton className="w-full h-96" />
            )}
          </TabsContent>

          {/* TAB 5: STATION COMPARISON */}
          <TabsContent value="compare" className="space-y-4 focus-visible:outline-none">
            {weather && !loading ? (
              <>
                <InlineComparisonMatrix
                  baseCurrent={weather.current}
                  unit={unit}
                  onSwitchCity={(newCity) => {
                    setCoords(null);
                    setCity(newCity);
                  }}
                />
                <PinnedLocations
                  pinnedCities={pinnedCities}
                  unit={unit}
                  onSelectCity={(selected) => {
                    setCoords(null);
                    setCity(selected);
                  }}
                  onUnpinCity={handleUnpinCity}
                />
              </>
            ) : (
              <Skeleton className="w-full h-96" />
            )}
          </TabsContent>
        </Tabs>
      </main>

      {/* AI Synoptic Advisor Interactive Dialog */}
      {weather && (
        <AiAdvisorDialog
          open={showAiAdvisor}
          onOpenChange={setShowAiAdvisor}
          current={weather.current}
          hourly={weather.hourly}
          daily={weather.daily}
          unit={unit}
        />
      )}

      {/* Extended Station & Application Preferences Dialog */}
      <SettingsDialog
        open={showSettings}
        onOpenChange={setShowSettings}
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
        onResetSettings={handleResetSettings}
        pinnedCities={pinnedCities}
        onAddPinnedCity={handleAddPinnedCity}
        onRemovePinnedCity={handleRemovePinnedCity}
        onSelectCity={(selected) => {
          setCoords(null);
          setCity(selected);
        }}
      />

      {/* Footer */}
      <footer className="border-t border-border py-6 px-4 text-center text-xs font-mono text-muted-foreground space-y-1">
        <p>OpenWeather Precision Meteorological Console // Lyra Style / Olive Base (Preset b3x6aEtpli)</p>
        <p>All UI Components rendered using official shadcn Radix-Lyra primitives with zero border-radius.</p>
      </footer>
    </div>
  );
}
