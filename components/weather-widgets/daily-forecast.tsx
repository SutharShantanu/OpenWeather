"use client";

import React, { useState } from "react";
import { DailyForecastItem } from "@/lib/weather";
import { WeatherIcon } from "./weather-icons";
import { Dialog, DialogContent, DialogClose } from "@/components/ui/dialog";
import { Calendar, X } from "lucide-react";
import { AnimatedNumber } from "@/components/ui/animated-number";

interface DailyForecastProps {
  daily: DailyForecastItem[];
  currentTemp: number;
}

export const DailyForecast: React.FC<DailyForecastProps> = ({
  daily,
  currentTemp,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDayIdx, setSelectedDayIdx] = useState<number>(0);

  // Find absolute maximum and minimum temperature across the entire week's forecast
  const allMins = daily.map((item) => item.tempMin);
  const allMaxs = daily.map((item) => item.tempMax);
  const absoluteMin = Math.min(...allMins);
  const absoluteMax = Math.max(...allMaxs);
  const absoluteRange = absoluteMax - absoluteMin || 1;

  const selectedDay = daily[selectedDayIdx] || daily[0];

  return (
    <>
      <div
        onClick={() => setIsOpen(true)}
        className="relative overflow-hidden rounded-none p-6 flex flex-col justify-between h-[400px] md:h-[420px] cursor-pointer group transition-all duration-300 bg-surface border border-border-visible hover:border-accent hover:shadow-[0_0_20px_rgba(229,26,36,0.12)]"
      >
        {/* Subtle Dot Grid Background Layer */}
        <div className="absolute inset-0 dot-grid-subtle pointer-events-none group-hover:opacity-30 transition-opacity duration-300 opacity-20" />

        {/* Widget Header */}
        <div className="flex items-center justify-between border-b pb-3.5 mb-4 border-border-subtle/50 relative z-10">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-accent active-led" />
            <h2 className="font-mono text-xs font-bold tracking-[0.15em] text-text-secondary uppercase">
              DAILY_FORECAST // WEEKLY_INDEX
            </h2>
          </div>
          <span className="font-mono text-xs text-text-disabled uppercase tracking-widest">
            RANGE_BARS
          </span>
        </div>

        {/* Days Rows */}
        <div className="flex flex-col flex-1 justify-between gap-3 relative z-10">
          {daily.slice(0, 5).map((item, idx) => {
            const tempMinRound = Math.round(item.tempMin);
            const tempMaxRound = Math.round(item.tempMax);

            // Calculate left offset & width percentage for the daily bar compared to the absolute weekly min/max
            const leftPercent = ((item.tempMin - absoluteMin) / absoluteRange) * 100;
            const widthPercent = ((item.tempMax - item.tempMin) / absoluteRange) * 100;

            const showDot = item.day === "TODAY";
            let dotLeftPercent = 50;
            if (showDot) {
              dotLeftPercent = ((currentTemp - absoluteMin) / absoluteRange) * 100;
              dotLeftPercent = Math.max(0, Math.min(100, dotLeftPercent)); // Clamp between 0 and 100
            }

            return (
              <div
                key={idx}
                className="flex items-center justify-between gap-4 py-1.5 group/row border-b border-border-subtle/35 last:border-0"
              >
                {/* Day Label */}
                <span className="font-mono text-xs font-bold text-text-secondary group-hover/row:text-text-primary w-14 transition-colors">
                  {item.day}
                </span>

                {/* Monoline Weather Icon */}
                <div className="text-text-primary group-hover/row:text-text-display transition-colors">
                  <WeatherIcon type={item.conditionType} size={18} />
                </div>

                {/* Graphic Range Slider */}
                <div className="flex-1 flex items-center gap-2">
                  <span className="font-doto text-xs font-bold text-text-disabled text-right w-6">
                    <AnimatedNumber value={tempMinRound} />°
                  </span>

                  {/* Range Bar Graphic */}
                  <div className="relative flex-1 h-1.5 rounded-full overflow-visible bg-surface-raised">
                    {/* Highlighted daily portion */}
                    <div
                      className="absolute h-full rounded-full transition-all duration-300 bg-accent/80 group-hover/row:bg-accent"
                      style={{
                        left: `${leftPercent}%`,
                        width: `${Math.max(8, widthPercent)}%`,
                      }}
                    />

                    {/* Pulsing Red Marker for Today's actual current temp */}
                    {showDot && (
                      <div
                        className="absolute -top-1 w-3.5 h-3.5 bg-accent border-2 border-surface rounded-full active-led transform -translate-x-1/2 transition-all duration-300 shadow-[0_0_8px_rgba(229,26,36,0.6)]"
                        style={{ left: `${dotLeftPercent}%` }}
                      />
                    )}
                  </div>

                  <span className="font-doto text-xs font-bold w-6 text-text-primary">
                    <AnimatedNumber value={tempMaxRound} />°
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Interactive Detail Modal Dialog */}
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
                style={{ background: "#D71921", boxShadow: "0 0 8px 1px rgba(215,25,33,0.5)" }}
              />
              <div className="flex flex-col">
                <span className="font-mono text-xs font-bold text-text-primary tracking-wider uppercase">WEEKLY_WEATHER_SYNOPSIS</span>
                <span className="font-mono text-[9px] text-text-disabled uppercase tracking-widest">STATION_MATRIX // DAILY_CHRONICLE</span>
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
            SELECT A FORECAST DAY TO LOAD DETAILED METEOROLOGICAL TELEMETRY:
          </p>

          {/* Quick horizontal selectors */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-border-subtle scrollbar-none">
            {daily.map((item, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedDayIdx(idx)}
                className={`flex flex-col items-center gap-1.5 px-3 py-2 border rounded-none transition-all shrink-0 min-w-[64px] ${
                  selectedDayIdx === idx
                    ? "bg-text-primary text-background border-text-primary"
                    : "bg-surface border-border-subtle text-text-secondary hover:text-text-primary"
                }`}
              >
                <span className="font-mono text-xs font-bold">{item.day}</span>
                <WeatherIcon type={item.conditionType} size={14} />
              </button>
            ))}
          </div>

          {/* Selected day simulation detail telemetry cards */}
          <div className="p-5 border border-border-subtle bg-surface-raised rounded-none flex flex-col gap-4 animate-fade-in" key={selectedDayIdx}>
            <div className="flex items-center justify-between border-b border-border-subtle/50 pb-2.5">
              <span className="font-mono text-xs font-bold text-accent tracking-wider uppercase">
                {selectedDay.day} METRIC BUNDLE
              </span>
              <span className="font-mono text-xs text-text-disabled">STATUS: STABLE</span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1 p-3 bg-surface border border-border-subtle rounded-none">
                <span className="font-mono text-xs text-text-disabled uppercase">Thermal Spread</span>
                <span className="font-doto text-xs font-bold text-text-primary inline-flex items-center gap-1">
                  <AnimatedNumber value={Math.round(selectedDay.tempMin)} />° to <AnimatedNumber value={Math.round(selectedDay.tempMax)} />°
                </span>
              </div>

              <div className="flex flex-col gap-1 p-3 bg-surface border border-border-subtle rounded-none">
                <span className="font-mono text-xs text-text-disabled uppercase">Condition Class</span>
                <span className="font-mono text-xs font-bold text-text-primary uppercase">
                  {selectedDay.conditionType}
                </span>
              </div>
            </div>

            {/* Simulated environmental recommendations */}
            <div className="p-4 bg-surface border border-border-subtle/70 rounded-none flex items-start gap-3">
              <Calendar size={18} className="text-accent shrink-0 mt-0.5" />
              <div className="flex flex-col gap-0.5">
                <span className="font-mono text-xs font-bold text-text-display uppercase">PREDICTIVE RECOMMENDATION</span>
                <p className="font-mono text-xs text-text-secondary leading-relaxed">
                  {selectedDay.conditionType.toLowerCase().includes("rain")
                    ? "PRECIPITATION IS DETECTED. WE ADVISE RE-SHEDULING WATER-SENSITIVE ACTIVITIES AND RE-CALIBRATING SOLAR FLUX GAGES."
                    : "ATMOSPHERIC CLEARANCE IS HIGH. OUTDOOR FLUX CAPACITORS WILL OPERATE AT PEAK LUX CAPABILITY."}
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
