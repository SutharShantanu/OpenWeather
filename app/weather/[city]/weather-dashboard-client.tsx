"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { HeaderControls } from "@/components/weather-widgets/header-controls";
import { WeatherHero } from "@/components/weather-widgets/weather-hero";
import { HourlyForecast } from "@/components/weather-widgets/hourly-forecast";
import { DailyForecast } from "@/components/weather-widgets/daily-forecast";
import { WindWidget } from "@/components/weather-widgets/wind-widget";
import { HumidityWidget } from "@/components/weather-widgets/humidity-widget";
import { SolarWidget } from "@/components/weather-widgets/solar-widget";
import { DiagnosticsWidget } from "@/components/weather-widgets/diagnostics-widget";
import { WeatherParticles } from "@/components/weather-widgets/weather-particles";
import { AlertTicker } from "@/components/weather-widgets/alert-ticker";
import { PinnedLocations } from "@/components/weather-widgets/pinned-locations";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Reorder } from "framer-motion";
import { WeatherData, fetchWeatherReport, searchCoordinates } from "@/lib/weather";
import { Info, Settings2, X } from "lucide-react";
import { Dialog, DialogContent, DialogClose } from "@/components/ui/dialog";
import { MapPickerDialog } from "@/components/weather-widgets/map-picker-dialog";

export function WeatherDashboardClient({ city }: { city: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [unit, setUnit] = useState<"C" | "F">("C");
  const [pinnedCities, setPinnedCities] = useState<string[]>([]);

  // Modals & Tabs from URL
  const activeTab = searchParams.get("tab") || "hourly";
  const showAlert = searchParams.get("alert") === "true";
  const showSettings = searchParams.get("settings") === "open";
  const compareCity = searchParams.get("compare");

  // Layout customization states
  const [isEditingLayout, setIsEditingLayout] = useState(false);
  const [layoutOrder, setLayoutOrder] = useState<string[]>([
    "wind",
    "humidity",
    "solar",
    "diagnostics",
  ]);

  // Spotlight mouse tracking coordinates
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isMapOpen, setIsMapOpen] = useState(false);

  useEffect(() => {
    // Sync layout state
    const savedLayout = localStorage.getItem("weather-bento-layout-v1");
    if (savedLayout) {
      try {
        const parsed = JSON.parse(savedLayout);
        if (Array.isArray(parsed) && parsed.length === 4) {
          setLayoutOrder(parsed);
        }
      } catch (e) {}
    }

    // Sync pinned locations
    const savedPins = localStorage.getItem("weather-pinned-cities-v1");
    if (savedPins) {
      try {
        const parsed = JSON.parse(savedPins);
        if (Array.isArray(parsed)) {
          setPinnedCities(parsed);
        }
      } catch (e) {}
    } else {
      const defaultPins = ["London", "New York", "Tokyo"];
      setPinnedCities(defaultPins);
      localStorage.setItem("weather-pinned-cities-v1", JSON.stringify(defaultPins));
    }
  }, []);

  useEffect(() => {
    if (city) {
      handleLoadCity(city);
    }
  }, [city]);

  const handleLoadCity = async (cityName: string) => {
    setLoading(true);
    setError(null);
    try {
      const geo = await searchCoordinates(cityName);
      if (!geo) {
        throw new Error("LOCATION NOT FOUND");
      }
      const data = await fetchWeatherReport(geo.lat, geo.lon, geo.name);
      setWeatherData(data);
    } catch (err: any) {
      setError(err.message || "COULD NOT FETCH WEATHER DATA");
    } finally {
      setLoading(false);
    }
  };

  const handleMapLocationSelect = async (lat: number, lon: number, displayName: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchWeatherReport(lat, lon, displayName);
      setWeatherData(data);
      // Update URL to reflect the picked city
      router.push(`/weather/${encodeURIComponent(displayName.toLowerCase())}`);
    } catch (err: any) {
      setError(err.message || "COULD NOT FETCH WEATHER DATA FOR SELECTED LOCATION");
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePin = () => {
    if (!weatherData) return;
    const targetCity = weatherData.current.cityName;
    setPinnedCities((prev) => {
      let next: string[];
      const isAlreadyPinned = prev.some(
        (c) => c.toLowerCase().trim() === targetCity.toLowerCase().trim()
      );
      if (isAlreadyPinned) {
        next = prev.filter(
          (c) => c.toLowerCase().trim() !== targetCity.toLowerCase().trim()
        );
      } else {
        next = [...prev, targetCity];
      }
      localStorage.setItem("weather-pinned-cities-v1", JSON.stringify(next));
      return next;
    });
  };

  const handleToggleEditLayout = () => {
    setIsEditingLayout((prev) => {
      const next = !prev;
      if (!next) {
        localStorage.setItem("weather-bento-layout-v1", JSON.stringify(layoutOrder));
      }
      return next;
    });
  };

  const handleResetLayout = () => {
    const defaultLayout = ["wind", "humidity", "solar", "diagnostics"];
    setLayoutOrder(defaultLayout);
    localStorage.setItem("weather-bento-layout-v1", JSON.stringify(defaultLayout));
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setMousePos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }
  };

  const toFahrenheit = (c: number) => (c * 1.8) + 32;

  const getDisplayData = (): WeatherData | null => {
    if (!weatherData) return null;
    if (unit === "C") return weatherData;

    return {
      ...weatherData,
      current: {
        ...weatherData.current,
        temp: toFahrenheit(weatherData.current.temp),
        feelsLike: toFahrenheit(weatherData.current.feelsLike),
        tempMin: toFahrenheit(weatherData.current.tempMin),
        tempMax: toFahrenheit(weatherData.current.tempMax),
      },
      hourly: weatherData.hourly.map((item) => ({
        ...item,
        temp: toFahrenheit(item.temp),
      })),
      daily: weatherData.daily.map((item) => ({
        ...item,
        tempMin: toFahrenheit(item.tempMin),
        tempMax: toFahrenheit(item.tempMax),
      })),
    };
  };

  const displayData = getDisplayData();

  // Tab switching using Next.js router
  const updateTab = (newTab: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", newTab);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const closeDialog = (paramToRemove: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete(paramToRemove);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="min-h-screen bg-background text-text-primary flex flex-col items-center justify-start p-4 md:p-8 transition-colors duration-300 relative overflow-hidden"
      style={
        {
          "--mouse-x": `${mousePos.x}px`,
          "--mouse-y": `${mousePos.y}px`,
        } as React.CSSProperties
      }
    >
      {displayData && (
        <WeatherParticles condition={displayData.current.condition.type} />
      )}

      <div className="absolute inset-0 pointer-events-none z-0 transition-opacity duration-500 bg-[radial-gradient(500px_circle_at_var(--mouse-x)_var(--mouse-y),rgba(229,26,36,0.025),transparent_80%)] dark:bg-[radial-gradient(500px_circle_at_var(--mouse-x)_var(--mouse-y),rgba(229,26,36,0.035),transparent_80%)]" />

      <div className="relative z-10 w-full max-w-7xl flex flex-col">
        <HeaderControls
          onSearch={(query) => router.push(`/search?q=${encodeURIComponent(query)}`)}
          onLocate={() => router.push("/weather/current")}
          onOpenMap={() => setIsMapOpen(true)}
          isLoading={loading}
          dataSource={weatherData?.dataSource || "MOCK_FALLBACK"}
          isEditingLayout={isEditingLayout}
          onToggleEditLayout={handleToggleEditLayout}
          onResetLayout={handleResetLayout}
          activeCityName={weatherData?.current.cityName}
        />

        {error && (
          <div className="w-full bg-accent/10 border border-accent rounded-none p-4 mb-6 flex items-center justify-between font-mono text-xs text-accent">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-accent animate-ping" />
              <span>SYSTEM_ERROR: {error}</span>
            </div>
            <button
              onClick={() => setError(null)}
              className="px-2 py-1 bg-accent/20 rounded hover:bg-accent/30 text-[10px]"
            >
              DISMISS
            </button>
          </div>
        )}

        <div className="w-full flex items-center justify-between border-b border-border-subtle pb-4 mb-6">
          <div className="flex items-center gap-2 font-mono text-[10px] text-text-disabled uppercase">
            <Settings2 size={12} />
            <span>GEO_COORDINATION_GRID_CALIBRATED</span>
          </div>

          <Tabs value={unit} onValueChange={(val) => setUnit(val as "C" | "F")}>
            <TabsList>
              <TabsTrigger value="C">METRIC (°C)</TabsTrigger>
              <TabsTrigger value="F">IMPERIAL (°F)</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {displayData && (
          <div className="mb-6 w-full">
            <AlertTicker
              temp={weatherData ? weatherData.current.temp : displayData.current.temp}
              windSpeed={displayData.current.windSpeed}
              humidity={displayData.current.humidity}
              cloudiness={displayData.current.cloudiness}
              condition={displayData.current.condition.type}
            />
          </div>
        )}

        {loading && !displayData ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="w-10 h-10 border-2 border-border-visible border-t-accent rounded-full animate-spin" />
            <span className="font-mono text-xs tracking-widest text-text-secondary uppercase">
              INITIALIZING_METEOROLOGICAL_SHELL...
            </span>
          </div>
        ) : displayData ? (
          <div className="flex flex-col gap-6">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
              <div className="md:col-span-7 lg:col-span-8 cursor-pointer group" onClick={() => router.push(`${pathname}/details`)}>
                <WeatherHero
                  current={displayData.current}
                  unit={unit}
                  isPinned={
                    weatherData
                      ? pinnedCities.some(
                          (c) => c.toLowerCase().trim() === weatherData.current.cityName.toLowerCase().trim()
                        )
                      : false
                  }
                  onTogglePin={() => {
                    handleTogglePin();
                  }}
                />
              </div>

              <div className="md:col-span-5 lg:col-span-4">
                <DailyForecast
                  daily={displayData.daily}
                  currentTemp={displayData.current.temp}
                />
              </div>
            </div>

            <div className="w-full flex justify-center mb-2">
              <Tabs value={activeTab} onValueChange={updateTab} className="w-auto">
                <TabsList>
                  <TabsTrigger value="hourly">HOURLY VIEW</TabsTrigger>
                  <TabsTrigger value="weekly">WEEKLY TRENDS</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {/* Conditionally render based on the tab query parameter */}
            {activeTab === "hourly" && (
              <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
                <HourlyForecast hourly={displayData.hourly} />
              </div>
            )}
            
            {activeTab === "weekly" && (
              <div className="w-full bg-surface/30 border border-border-visible rounded-none p-6 md:p-8 flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                 <h3 className="font-mono text-sm tracking-widest text-text-secondary uppercase">7-DAY EXTENDED METRICS</h3>
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                   {displayData.daily.map((day, i) => (
                     <div key={i} className="flex justify-between items-center p-4 bg-surface/50 rounded-none border border-border">
                       <span className="font-mono text-xs font-bold text-primary">{day.day}</span>
                       <span className="font-mono text-[10px] text-text-secondary uppercase truncate ml-2 max-w-[100px]">{day.description}</span>
                       <span className="font-doto font-bold text-lg">{Math.round(day.tempMax)}°</span>
                     </div>
                   ))}
                 </div>
              </div>
            )}

            <div className="w-full">
              <PinnedLocations
                pinnedCities={pinnedCities}
                activeCity={weatherData?.current.cityName || ""}
                unit={unit}
                onSelectCity={(c) => router.push(`/weather/${encodeURIComponent(c.toLowerCase())}`)}
                onUnpinCity={(cityToUnpin) => {
                  setPinnedCities((prev) => {
                    const next = prev.filter(
                      (c) => c.toLowerCase().trim() !== cityToUnpin.toLowerCase().trim()
                    );
                    localStorage.setItem("weather-pinned-cities-v1", JSON.stringify(next));
                    return next;
                  });
                }}
              />
            </div>

            <Reorder.Group
              axis="y"
              values={layoutOrder}
              onReorder={setLayoutOrder}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full mb-12"
            >
              {layoutOrder.map((key) => {
                const itemClassName = `relative h-full select-none ${
                  isEditingLayout ? "animate-wiggle" : ""
                }`;

                return (
                  <Reorder.Item
                    key={key}
                    value={key}
                    dragListener={isEditingLayout}
                    className={itemClassName}
                  >
                    {isEditingLayout && (
                      <div className="absolute inset-0 bg-accent/5 hover:bg-accent/10 border border-dashed border-accent/40 rounded-none flex flex-col items-center justify-center cursor-grab active:cursor-grabbing z-20 pointer-events-auto backdrop-blur-[1px]">
                        <span className="font-mono text-[9px] font-bold text-accent px-2.5 py-1.5 bg-background border border-accent/30 rounded-none shadow-lg uppercase tracking-wider flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-accent animate-ping" />
                          DRAG_MOVE: {key}
                        </span>
                      </div>
                    )}

                    {key === "wind" && (
                      <WindWidget
                        speed={displayData.current.windSpeed}
                        deg={displayData.current.windDeg}
                      />
                    )}
                    {key === "humidity" && (
                      <HumidityWidget
                        humidity={displayData.current.humidity}
                        temp={
                          weatherData
                            ? weatherData.current.temp
                            : displayData.current.temp
                        }
                        unit={unit}
                      />
                    )}
                    {key === "solar" && (
                      <SolarWidget
                        sunrise={displayData.current.sunrise}
                        sunset={displayData.current.sunset}
                        dt={displayData.current.dt}
                      />
                    )}
                    {key === "diagnostics" && (
                      <DiagnosticsWidget
                        lat={displayData.current.lat}
                        lon={displayData.current.lon}
                        pressure={displayData.current.pressure}
                        clouds={displayData.current.cloudiness}
                        dataSource={displayData.dataSource}
                      />
                    )}
                  </Reorder.Item>
                );
              })}
            </Reorder.Group>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 border border-dashed border-border rounded-none">
            <Info className="text-text-disabled mb-3" size={24} />
            <span className="font-mono text-xs text-text-disabled uppercase">
              NO METEOROLOGICAL CONSOLE FOUND. RE-SEARCH OR PIN TO GPS CORDS.
            </span>
          </div>
        )}

        {/* URL-Driven Modals — Alert */}
        <Dialog open={showAlert} onOpenChange={(open) => !open && closeDialog("alert")}>
          <DialogContent showCloseButton={false} className="max-w-lg bg-surface/95 border border-border-visible rounded-none overflow-hidden shadow-2xl backdrop-blur-2xl flex flex-col p-0">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border-visible shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full shrink-0" style={{ background: "#FF9100", boxShadow: "0 0 8px 1px rgba(255,145,0,0.5)" }} />
                <span className="font-mono text-xs font-bold text-text-primary tracking-wider uppercase">SYSTEM ALERT</span>
              </div>
              <DialogClose asChild>
                <button className="flex items-center gap-1.5 px-3 py-1.5 border border-border-visible hover:border-text-primary hover:bg-surface-raised rounded-none transition-all duration-150 group font-mono text-[9px] text-text-secondary hover:text-text-primary font-bold">
                  <span>CLOSE</span><X size={10} className="transition-transform group-hover:rotate-90 duration-200" />
                </button>
              </DialogClose>
            </div>
            <div className="p-5 font-mono text-sm text-text-primary">
              <p className="mb-4 text-warning">WARNING: EXTREME WEATHER CONDITIONS DETECTED IN THE VICINITY.</p>
              <p className="text-text-secondary">Please exercise caution and follow local meteorological guidelines. This is a simulated alert triggered by URL parameters.</p>
            </div>
          </DialogContent>
        </Dialog>

        {/* URL-Driven Modals — Settings */}
        <Dialog open={showSettings} onOpenChange={(open) => !open && closeDialog("settings")}>
          <DialogContent showCloseButton={false} className="max-w-lg bg-surface/95 border border-border-visible rounded-none overflow-hidden shadow-2xl backdrop-blur-2xl flex flex-col p-0">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border-visible shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full shrink-0" style={{ background: "#00E5FF", boxShadow: "0 0 8px 1px rgba(0,229,255,0.5)" }} />
                <span className="font-mono text-xs font-bold text-text-primary tracking-wider uppercase">SYSTEM SETTINGS</span>
              </div>
              <DialogClose asChild>
                <button className="flex items-center gap-1.5 px-3 py-1.5 border border-border-visible hover:border-text-primary hover:bg-surface-raised rounded-none transition-all duration-150 group font-mono text-[9px] text-text-secondary hover:text-text-primary font-bold">
                  <span>CLOSE</span><X size={10} className="transition-transform group-hover:rotate-90 duration-200" />
                </button>
              </DialogClose>
            </div>
            <div className="p-5 font-mono text-sm text-text-primary">
              <p className="mb-4">METEOROLOGICAL CONSOLE CONFIGURATION</p>
              <p className="text-text-secondary">Additional settings can be configured here. This dialog is driven by the ?settings=open query parameter.</p>
            </div>
          </DialogContent>
        </Dialog>

        {/* URL-Driven Modals — Compare */}
        <Dialog open={!!compareCity} onOpenChange={(open) => !open && closeDialog("compare")}>
          <DialogContent showCloseButton={false} className="max-w-lg bg-surface/95 border border-border-visible rounded-none overflow-hidden shadow-2xl backdrop-blur-2xl flex flex-col p-0">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border-visible shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full shrink-0" style={{ background: "#5B9BF6", boxShadow: "0 0 8px 1px rgba(91,155,246,0.5)" }} />
                <span className="font-mono text-xs font-bold text-text-primary tracking-wider uppercase">COMPARING WITH {(compareCity || "").toUpperCase()}</span>
              </div>
              <DialogClose asChild>
                <button className="flex items-center gap-1.5 px-3 py-1.5 border border-border-visible hover:border-text-primary hover:bg-surface-raised rounded-none transition-all duration-150 group font-mono text-[9px] text-text-secondary hover:text-text-primary font-bold">
                  <span>CLOSE</span><X size={10} className="transition-transform group-hover:rotate-90 duration-200" />
                </button>
              </DialogClose>
            </div>
            <div className="p-5 font-mono text-sm text-text-primary">
              <p className="mb-4">COMPARATIVE ANALYSIS INITIALIZED</p>
              <p className="text-text-secondary">Currently comparing {weatherData?.current.cityName || city} with {compareCity}. (Simulated view)</p>
            </div>
          </DialogContent>
        </Dialog>

        {/* Map Pinpoint Dialog */}
        <MapPickerDialog
          isOpen={isMapOpen}
          onClose={() => setIsMapOpen(false)}
          onLocationSelect={handleMapLocationSelect}
        />

        <footer className="w-full flex flex-col md:flex-row gap-4 items-center justify-between border-t border-border-subtle pt-6 pb-12 mt-12 text-text-disabled font-mono text-[9px]">
          <div className="flex flex-col gap-1 items-center md:items-start">
            <span>NOTHING TECHNOLOGY WEATHER OS INSTRUMENT BOARD v2.5.0</span>
            <span>HARDWARE STATIONS REGISTERED WITH GLOBAL WEATHER INDEX</span>
          </div>
          <div className="flex flex-col gap-1 items-center md:items-end">
            <span>ALL SYSTEM CALIBRATIONS STABLE. PRESSURE BARO 1ATM.</span>
            <span>
              © {new Date().getFullYear()} NOTHING OS WEATHER. ALL RIGHTS RESERVED.
            </span>
          </div>
        </footer>
      </div>
    </div>
  );
}
