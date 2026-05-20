"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { use } from "react";
import { DialogOverlay } from "@/components/ui/dialog-overlay";
import { WeatherData } from "@/lib/weather";

export default function WeatherDetailsModal({
  params,
}: {
  params: Promise<{ city: string }>;
}) {
  const router = useRouter();
  const { city: rawCity } = use(params);
  const city = decodeURIComponent(rawCity);

  const [data, setData] = useState<WeatherData | null>(null);

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
    <DialogOverlay
      isOpen={true}
      onClose={() => router.back()}
      title={`${city.toUpperCase()} — DEEP METEOROLOGICAL SCAN`}
      indicatorColor="cyan"
    >
      <div className="flex flex-col gap-4 font-mono text-xs">
        <p className="text-text-secondary uppercase">
          ADVANCED ATMOSPHERIC DATA FOR {city.toUpperCase()}
        </p>
        {data ? (
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-surface/50 border border-border-visible rounded-none">
              <span className="text-text-disabled text-[10px]">COORDINATES</span>
              <p className="font-doto font-bold text-lg">
                {data.current.lat.toFixed(2)}, {data.current.lon.toFixed(2)}
              </p>
            </div>
            <div className="p-4 bg-surface/50 border border-border-visible rounded-none">
              <span className="text-text-disabled text-[10px]">ATM PRESSURE</span>
              <p className="font-doto font-bold text-lg">{data.current.pressure} hPa</p>
            </div>
            <div className="p-4 bg-surface/50 border border-border-visible rounded-none">
              <span className="text-text-disabled text-[10px]">CLOUD COVERAGE</span>
              <p className="font-doto font-bold text-lg">{data.current.cloudiness}%</p>
            </div>
            <div className="p-4 bg-surface/50 border border-border-visible rounded-none">
              <span className="text-text-disabled text-[10px]">WIND DEGREE</span>
              <p className="font-doto font-bold text-lg">{data.current.windDeg}°</p>
            </div>
            <div className="p-4 bg-surface/50 border border-border-visible rounded-none">
              <span className="text-text-disabled text-[10px]">TEMPERATURE</span>
              <p className="font-doto font-bold text-lg">{Math.round(data.current.temp)}°C</p>
            </div>
            <div className="p-4 bg-surface/50 border border-border-visible rounded-none">
              <span className="text-text-disabled text-[10px]">HUMIDITY</span>
              <p className="font-doto font-bold text-lg">{data.current.humidity}%</p>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 p-4 text-text-disabled">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 animate-ping" />
            DOWNLOADING SATELLITE TELEMETRY...
          </div>
        )}
      </div>
    </DialogOverlay>
  );
}
