"use client";

import React, { useState } from "react";
import { HourlyForecastItem } from "@/lib/weather";
import { WeatherIcon } from "./weather-icons";
import { Dialog, DialogContent, DialogClose } from "@/components/ui/dialog";
import { Activity, Clock, Thermometer, Umbrella, X } from "lucide-react";
import { AnimatedNumber } from "@/components/ui/animated-number";
import { TemperatureChart } from "./temperature-chart";

interface HourlyForecastProps {
  hourly: HourlyForecastItem[];
}

export const HourlyForecast: React.FC<HourlyForecastProps> = ({ hourly }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedHourIdx, setSelectedHourIdx] = useState<number>(0);

  // Find min & max temp across hourly forecasts to calculate heights of vertical graph bars
  const temps = hourly.map((item) => item.temp);
  const maxTemp = Math.max(...temps);
  const minTemp = Math.min(...temps);
  const tempRange = maxTemp - minTemp || 1;

  const selectedHour = hourly[selectedHourIdx] || hourly[0];

  return (
    <>
      {/* Recharts Custom Curve Vector Overlay */}
      <div className="w-full h-24 relative z-10 opacity-70 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none select-none my-2">
        <TemperatureChart
          data={hourly.map((item) => ({ time: item.time, temp: item.temp }))}
        />
      </div>

      {/* Horizontal List */}
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none snap-x scroll-smooth relative z-10">
        {hourly.map((item, idx) => {
          const barHeightPct =
            tempRange === 0
              ? 50
              : Math.max(
                  20,
                  Math.min(100, ((item.temp - minTemp) / tempRange) * 100)
                );

          return (
            <div
              key={idx}
              onClick={() => {
                setSelectedHourIdx(idx);
                setIsOpen(true);
              }}
              className="cursor-pointer flex-shrink-0 w-[74px] border rounded-none p-3 flex flex-col items-center justify-between snap-start transition-all duration-150 group/item bg-surface-raised border-border-subtle hover:border-border-visible"
            >
              {/* Time Label */}
              <span className="font-mono text-xs font-bold text-text-secondary group-hover/item:text-text-primary transition-colors">
                {item.time}
              </span>

              {/* Weather Condition Icon */}
              <div className="my-1 text-text-primary group-hover/item:text-text-display transition-colors">
                <WeatherIcon type={item.conditionType} size={18} />
              </div>

              {/* Graphical Bar Column */}
              <div className="w-1.5 h-6 rounded-full flex items-end overflow-hidden my-1 bg-border">
                <div
                  className="w-full rounded-full transition-all duration-300 bg-text-secondary group-hover/item:bg-accent"
                  style={{ height: `${barHeightPct}%` }}
                />
              </div>

              {/* Temp & Rain Prob */}
              <div className="flex flex-col items-center mt-0.5">
                <span className="font-doto text-xs font-bold text-text-primary">
                  <AnimatedNumber value={Math.round(item.temp)} />°
                </span>

                {item.pop > 0.1 ? (
                  <span className="font-doto text-xs text-accent font-medium mt-0.5">
                    <AnimatedNumber value={Math.round(item.pop * 100)} />%
                  </span>
                ) : (
                  <span className="font-mono text-xs text-text-disabled mt-0.5">
                    —
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Hour-by-Hour interactive detail modal dialogue */}
      <Dialog open={isOpen} onOpenChange={(open) => !open && setIsOpen(false)}>
        <DialogContent
          showCloseButton={false}
          className="max-w-lg bg-surface/95 border border-border-visible rounded-none overflow-hidden shadow-2xl backdrop-blur-2xl flex flex-col p-0 max-h-[90vh] md:max-h-[85vh]"
        >
          {/* Nothing OS Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-border-visible shrink-0">
            <div className="flex items-center gap-3">
              <div
                className="w-2 h-2 rounded-full shrink-0"
                style={{ background: "#00E5FF", boxShadow: "0 0 8px 1px rgba(0,229,255,0.5)" }}
              />
              <div className="flex flex-col">
                <span className="font-mono text-xs font-bold text-text-primary tracking-wider uppercase">DIURNAL_24H_TIMELINE</span>
                <span className="font-mono text-[9px] text-text-disabled uppercase tracking-widest">STATION_MATRIX // CHRONO_LOG</span>
              </div>
            </div>
            <DialogClose asChild>
              <button className="flex items-center gap-1.5 px-3 py-1.5 border border-border-visible hover:border-text-primary hover:bg-surface-raised rounded-none transition-all duration-150 group font-mono text-[9px] text-text-secondary hover:text-text-primary font-bold">
                <span>CLOSE</span>
                <X size={10} className="transition-transform group-hover:rotate-90 duration-200" />
              </button>
            </DialogClose>
          </div>
          <div className="overflow-y-auto p-5 flex-1">
        <div className="flex flex-col gap-6 text-text-primary">
          <p className="font-mono text-xs text-text-secondary leading-relaxed">
            CHOOSE AN HOUR INDEX TO PLOT MICRO-CLIMATE WARP COEFFICIENTS:
          </p>

          {/* Quick hour selector dials */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2.5 border-b border-border-subtle scrollbar-none">
            {hourly.map((item, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedHourIdx(idx)}
                className={`flex flex-col items-center gap-1.5 px-3 py-2 border rounded-none transition-all shrink-0 min-w-[64px] ${
                  selectedHourIdx === idx
                    ? "bg-text-primary text-background border-text-primary"
                    : "bg-surface border-border-subtle text-text-secondary hover:text-text-primary"
                }`}
              >
                <span className="font-mono text-xs font-bold">{item.time}</span>
                <span className="font-doto text-xs font-extrabold">
                  <AnimatedNumber value={Math.round(item.temp)} />°
                </span>
              </button>
            ))}
          </div>

          {/* Micro telemetry view */}
          <div
            className="p-5 border border-border-subtle bg-surface-raised rounded-none flex flex-col gap-4 animate-fade-in"
            key={selectedHourIdx}
          >
            <div className="flex items-center justify-between border-b border-border-subtle/50 pb-2.5">
              <span className="font-mono text-xs font-bold text-accent tracking-wider uppercase flex items-center gap-1.5">
                <Clock size={12} />
                HOUR_INDEX: {selectedHour.time}
              </span>
              <span className="font-mono text-xs text-text-disabled uppercase">
                RADIAL_SWEEP
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1 p-3 bg-surface border border-border-subtle rounded-none">
                <div className="flex items-center gap-1.5 text-text-secondary">
                  <Thermometer size={12} />
                  <span className="font-mono text-xs uppercase">
                    Temperature
                  </span>
                </div>
                <span className="font-doto text-sm font-bold text-text-primary">
                  <AnimatedNumber value={Math.round(selectedHour.temp)} />°C
                </span>
              </div>

              <div className="flex flex-col gap-1 p-3 bg-surface border border-border-subtle rounded-none">
                <div className="flex items-center gap-1.5 text-text-secondary">
                  <Umbrella size={12} />
                  <span className="font-mono text-xs uppercase">
                    Rain Probability
                  </span>
                </div>
                <span className="font-doto text-sm font-bold text-accent">
                  <AnimatedNumber
                    value={Math.round(selectedHour.pop * 100)}
                  />
                  %
                </span>
              </div>
            </div>

            {/* Simulated warnings terminal */}
            <div className="p-4 bg-surface border border-border-subtle/70 rounded-none flex items-start gap-3">
              <Activity
                size={18}
                className="text-accent shrink-0 mt-0.5 animate-pulse"
              />
              <div className="flex flex-col gap-0.5">
                <span className="font-mono text-xs font-bold text-text-display uppercase">
                  TIMELINE VECTOR WARNING
                </span>
                <p className="font-mono text-xs text-text-secondary leading-relaxed">
                  {selectedHour.pop > 0.4
                    ? "PRECIPITATION VECTORS DEVIATING HIGH. RADIAL CLOUD GRID DETECTED. PREPARE HUMIDITY BUFFER SYSTEM."
                    : "ATMOSPHERIC FLOW SPEED CALIBRATED AT STANDARD 1.0 ATM. THERMAL GRADIENTS ARE WELL WITHIN RECOVERY THRESHOLDS."}
                </p>
              </div>
            </div>
          </div>
        </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
