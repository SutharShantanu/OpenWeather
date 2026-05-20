"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { HeaderControls } from "@/components/weather-widgets/header-controls";
import { PinnedLocations } from "@/components/weather-widgets/pinned-locations";
import { WeatherParticles } from "@/components/weather-widgets/weather-particles";

export default function HomePage() {
  const router = useRouter();
  const [pinnedCities, setPinnedCities] = useState<string[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
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

  return (
    <div className="min-h-screen bg-background text-text-primary flex flex-col items-center justify-start p-4 md:p-8 transition-colors duration-300 relative overflow-hidden">
      <WeatherParticles condition="CLOUDY" />

      <div className="relative z-10 w-full max-w-7xl flex flex-col">
        <HeaderControls
          onSearch={(query) => router.push(`/search?q=${encodeURIComponent(query)}`)}
          onLocate={() => router.push("/weather/current")}
          onOpenMap={() => router.push("/weather/london")}
          isLoading={false}
          dataSource="LIVE_API"
          isEditingLayout={false}
          onToggleEditLayout={() => {}}
          onResetLayout={() => {}}
        />

        <div className="flex flex-col items-center text-center mt-12 mb-16 max-w-3xl mx-auto">
          <h1 className="font-doto text-4xl md:text-6xl font-black tracking-tighter mb-4 text-text-primary">
            NOTHING WEATHER
          </h1>
          <p className="font-mono text-sm text-text-secondary uppercase">
            ENTER A CITY OR SELECT A PINNED LOCATION TO INITIALIZE THE METEOROLOGICAL CONSOLE.
          </p>
        </div>

        {mounted && (
          <div className="w-full">
            <PinnedLocations
              pinnedCities={pinnedCities}
              activeCity=""
              unit="C"
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
        )}

        <footer className="w-full flex flex-col md:flex-row gap-4 items-center justify-between border-t border-border-subtle pt-6 pb-12 mt-24 text-text-disabled font-mono text-[9px]">
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
