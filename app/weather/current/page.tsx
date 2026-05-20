"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchWeatherReport } from "@/lib/weather";
import { HeaderControls } from "@/components/weather-widgets/header-controls";

export default function CurrentLocationPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError("GEOLOCATION NOT SUPPORTED BY BROWSER");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const data = await fetchWeatherReport(latitude, longitude, "My Location");
          const targetCity = data.current.cityName.toLowerCase();
          router.replace(`/weather/${encodeURIComponent(targetCity)}`);
        } catch (err) {
          setError("COULD NOT RESOLVE CURRENT LOCATION WEATHER");
        }
      },
      (err) => {
        setError("GPS LOCATION ACCESS DENIED");
      },
      { timeout: 7000 }
    );
  }, [router]);

  return (
    <div className="min-h-screen bg-background text-text-primary p-4 md:p-8">
      <div className="max-w-7xl mx-auto flex flex-col">
        <HeaderControls
          onSearch={(query) => router.push(`/search?q=${encodeURIComponent(query)}`)}
          onLocate={() => {}}
          onOpenMap={() => router.push("/weather/london")}
          isLoading={!error}
          dataSource="LIVE_API"
          isEditingLayout={false}
          onToggleEditLayout={() => {}}
          onResetLayout={() => {}}
        />
        {error ? (
          <div className="w-full bg-accent/10 border border-accent rounded-none p-4 mt-12 flex flex-col items-center justify-center font-mono text-xs text-accent max-w-3xl mx-auto gap-4">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-accent animate-ping" />
              <span>SYSTEM_ERROR: {error}</span>
            </div>
            <button
              onClick={() => router.push("/")}
              className="px-4 py-2 border border-accent/50 text-accent rounded-none hover:bg-accent/10 transition-colors"
            >
              RETURN TO HOME
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 border border-dashed border-border rounded-none mt-12 max-w-3xl mx-auto w-full">
            <div className="w-10 h-10 border-2 border-border-visible border-t-accent rounded-full animate-spin mb-4" />
            <span className="font-mono text-xs text-text-disabled uppercase">
              ACQUIRING SATELLITE GPS LOCK...
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
