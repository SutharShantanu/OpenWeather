"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchWeatherReport, WeatherData } from "@/lib/weather";
import { HeaderControls } from "@/components/weather-widgets/header-controls";

export default function WeatherDetailsPage({ params }: { params: { city: string } }) {
  const router = useRouter();
  const [data, setData] = useState<WeatherData | null>(null);
  
  const city = decodeURIComponent(params.city);

  useEffect(() => {
    fetch(`/api/weather?city=${encodeURIComponent(city)}`)
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then(setData)
      .catch(() => {});
  }, [city]);

  return (
    <div className="min-h-screen bg-background text-text-primary p-4 md:p-8">
      <div className="max-w-7xl mx-auto flex flex-col">
        <HeaderControls
          onSearch={(query) => router.push(`/search?q=${encodeURIComponent(query)}`)}
          onLocate={() => router.push("/weather/current")}
          onOpenMap={() => router.push("/weather/london")}
          isLoading={!data}
          dataSource="LIVE_API"
          isEditingLayout={false}
          onToggleEditLayout={() => {}}
          onResetLayout={() => {}}
        />

        <div className="mt-12 bg-surface/50 border border-border-visible rounded-none p-8 max-w-3xl mx-auto w-full">
          <h1 className="font-doto text-3xl font-black mb-2 uppercase">{city} - DEEP SCAN</h1>
          <p className="font-mono text-sm text-text-secondary uppercase mb-8">
            ADVANCED ATMOSPHERIC DATA
          </p>
          
          {data ? (
            <div className="grid grid-cols-2 gap-6">
              <div className="p-6 bg-surface/80 border border-border rounded-none">
                <span className="text-text-disabled text-xs font-mono">COORDINATES</span>
                <p className="font-doto font-bold text-2xl mt-2">{data.current.lat.toFixed(2)}, {data.current.lon.toFixed(2)}</p>
              </div>
              <div className="p-6 bg-surface/80 border border-border rounded-none">
                <span className="text-text-disabled text-xs font-mono">ATM PRESSURE</span>
                <p className="font-doto font-bold text-2xl mt-2">{data.current.pressure} hPa</p>
              </div>
              <div className="p-6 bg-surface/80 border border-border rounded-none">
                <span className="text-text-disabled text-xs font-mono">CLOUD COVERAGE</span>
                <p className="font-doto font-bold text-2xl mt-2">{data.current.cloudiness}%</p>
              </div>
              <div className="p-6 bg-surface/80 border border-border rounded-none">
                <span className="text-text-disabled text-xs font-mono">WIND DEGREE</span>
                <p className="font-doto font-bold text-2xl mt-2">{data.current.windDeg}°</p>
              </div>
            </div>
          ) : (
             <div className="flex items-center gap-2 font-mono text-sm text-text-disabled">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 animate-ping" />
              DOWNLOADING SATELLITE TELEMETRY...
            </div>
          )}
          
          <button 
            onClick={() => router.push(`/weather/${encodeURIComponent(city)}`)}
            className="mt-8 font-mono text-xs text-primary underline"
          >
            RETURN TO DASHBOARD
          </button>
        </div>
      </div>
    </div>
  );
}
