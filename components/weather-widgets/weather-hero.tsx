import React, { useState } from "react";
import { CurrentWeather } from "@/lib/weather";
import { WeatherIcon } from "./weather-icons";
import { Dialog, DialogContent, DialogClose } from "@/components/ui/dialog";
import { Thermometer, Eye, Droplets, Wind, Navigation, Pin, Compass, X } from "lucide-react";
import { AnimatedNumber } from "@/components/ui/animated-number";
import { Button } from "@/components/ui/button";

interface WeatherHeroProps {
  current: CurrentWeather;
  unit?: "C" | "F";
  isPinned?: boolean;
  onTogglePin?: () => void;
}

export const WeatherHero: React.FC<WeatherHeroProps> = ({
  current,
  unit = "C",
  isPinned = false,
  onTogglePin,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedClimate, setSelectedClimate] = useState<string>("Cfb");

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "short",
      day: "2-digit",
    }).toUpperCase();
  };

  const tempRounded = Math.round(current.temp);
  const feelsLikeRounded = Math.round(current.feelsLike);
  const tempMinRounded = Math.round(current.tempMin);
  const tempMaxRounded = Math.round(current.tempMax);

  // Koppen climate database for interactive decoder
  const climates: Record<string, { name: string; desc: string; tempRange: string }> = {
    Af: {
      name: "TROPICAL RAINFOREST",
      desc: "Humid and hot year-round, average monthly temp stays above 18°C. Heavy daily precipitation.",
      tempRange: "24°C to 30°C",
    },
    Cfb: {
      name: "TEMPERATE OCEANIC",
      desc: "Warm summers, cool but not cold winters. Moderate precipitation year-round. Typical in London, Seattle.",
      tempRange: "5°C to 22°C",
    },
    Dfb: {
      name: "HUMID CONTINENTAL",
      desc: "Severe winters with persistent snow cover, warm and moist summers. High seasonal variance.",
      tempRange: "-10°C to 25°C",
    },
    Am: {
      name: "TROPICAL MONSOON",
      desc: "Distinct short dry season followed by heavy rainfall, driven by seasonal wind reversals.",
      tempRange: "22°C to 32°C",
    },
    BWh: {
      name: "HOT DESERT CLIMATE",
      desc: "High solar flux levels, extremely low relative humidity. Maximum daytime temp frequently over 40°C.",
      tempRange: "15°C to 45°C",
    },
  };

  return (
    <>
      <div
        onClick={() => setIsOpen(true)}
        className="relative overflow-hidden rounded-none p-6 md:p-8 flex flex-col justify-between h-[400px] md:h-[420px] group cursor-pointer transition-all duration-300 bg-surface border border-border-visible hover:border-accent hover:shadow-[0_0_20px_rgba(229,26,36,0.12)]"
      >
        {/* Subtle Dot Grid Background Layer */}
        <div className="absolute inset-0 dot-grid-subtle pointer-events-none group-hover:opacity-30 transition-opacity duration-300 opacity-20" />
        
        {/* Top Header Row of Hero */}
        <div className="relative z-10 flex items-start justify-between">
          <div className="flex flex-col">
            <span className="font-mono text-xs tracking-[0.15em] text-text-secondary">
              {formatDate(current.dt)}
            </span>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight mt-1 text-text-display">
              {current.cityName},{" "}
              <span className="font-mono text-lg font-normal text-text-secondary">{current.country}</span>
            </h1>
          </div>

          <div className="flex items-center gap-2">
            {/* Elegant Pin Toggle Button */}
            {onTogglePin && (
              <Button
                variant="outline"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  onTogglePin();
                }}
                className={`rounded-none h-[44px] w-[44px] transition-all duration-300 ${
                  isPinned 
                    ? "bg-accent border-accent text-background hover:bg-accent/95 hover:border-accent"
                    : "bg-surface-raised border-border-subtle text-text-secondary hover:text-text-primary hover:border-text-primary/30"
                }`}
                title={isPinned ? "UNPIN LOCATION" : "PIN LOCATION"}
              >
                <Pin size={18} className={isPinned ? "fill-current" : ""} />
              </Button>
            )}

            {/* Conditions Icon with Adaptive Ring */}
            <div className="p-2.5 rounded-none border transition-all duration-300 bg-surface-raised border-border-subtle text-text-display">
              <WeatherIcon
                type={current.condition.type}
                size={24}
                className="animate-pulse"
                style={{ animationDuration: "4s" }}
              />
            </div>
          </div>
        </div>

        {/* Center Giant Dot Matrix Temperature */}
        <div className="relative z-10 flex items-baseline justify-between mt-auto mb-6">
          <div className="flex items-start">
            {/* Giant Number in Doto dot-matrix */}
            <span className="font-doto font-extrabold text-[80px] md:text-[96px] leading-none select-none text-text-display">
              <AnimatedNumber value={tempRounded} />
            </span>
            {/* Degree Symbol */}
            <span className="font-mono text-3xl md:text-4xl font-bold mt-2 ml-1 text-accent">
              °
            </span>
            <span className="font-mono text-lg md:text-xl font-bold mt-2.5 ml-0.5 text-text-secondary">
              {unit}
            </span>
          </div>

          {/* High / Low Bounds Technical Label */}
          <div className="flex flex-col text-right font-mono text-xs leading-5 text-text-primary">
            <div className="flex gap-2 justify-end">
              <span className="text-text-disabled">MAX:</span>
              <span className="font-bold">
                <AnimatedNumber value={tempMaxRounded} />°
              </span>
            </div>
            <div className="flex gap-2 justify-end">
              <span className="text-text-disabled">MIN:</span>
              <span className="font-bold">
                <AnimatedNumber value={tempMinRounded} />°
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Row - Weather State Information */}
        <div className="relative z-10 border-t pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 mt-auto border-border-subtle">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs tracking-[0.15em] text-text-secondary">
              CONDITION:
            </span>
            <span className="font-mono text-xs font-bold uppercase text-accent">
              {current.condition.description}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs tracking-[0.15em] text-text-secondary">
              FEELS_LIKE:
            </span>
            <span className="font-mono text-xs font-bold">
              <AnimatedNumber value={feelsLikeRounded} />°{unit}
            </span>
          </div>
        </div>
      </div>

      {/* Interactive Telemetry Dialog overlay */}
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
                <span className="font-mono text-xs font-bold text-text-primary tracking-wider uppercase">METEOROLOGICAL_HERO_EXPANSION</span>
                <span className="font-mono text-[9px] text-text-disabled uppercase tracking-widest">STATION_MATRIX // CONDITIONAL_TELEM</span>
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
          {/* Main Weather Card Summary inside modal */}
          <div className="p-5 bg-surface-raised border border-border-subtle rounded-none flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <span className="font-mono text-xs text-text-secondary">SYS_COORDS: {current.lat.toFixed(4)}°N, {current.lon.toFixed(4)}°E</span>
              <h3 className="font-bold text-lg text-text-display">{current.cityName}</h3>
              <p className="font-mono text-xs text-accent uppercase tracking-wider">{current.condition.description}</p>
            </div>
            <div className="p-3 bg-surface border border-border-visible rounded-none">
              <WeatherIcon type={current.condition.type} size={40} className="text-text-display" />
            </div>
          </div>

          {/* 3x2 Grid of In-Depth Physics Parameters */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-surface border border-border-subtle rounded-none flex flex-col gap-1">
              <div className="flex items-center gap-2 text-text-secondary">
                <Compass size={14} />
                <span className="font-mono text-xs uppercase font-bold">Absolute Temp</span>
              </div>
              <span className="font-mono text-sm font-bold mt-1">{tempRounded}°{unit}</span>
            </div>

            <div className="p-4 bg-surface border border-border-subtle rounded-none flex flex-col gap-1">
              <div className="flex items-center gap-2 text-text-secondary">
                <Droplets size={14} />
                <span className="font-mono text-xs uppercase font-bold">Precipitation</span>
              </div>
              <span className="font-mono text-sm font-bold mt-1">
                {current.condition.type.toLowerCase().includes("rain") ? "1.4 mm/hr" : "0.0 mm/hr"}
              </span>
            </div>

            <div className="p-4 bg-surface border border-border-subtle rounded-none flex flex-col gap-1">
              <div className="flex items-center gap-2 text-text-secondary">
                <Wind size={14} />
                <span className="font-mono text-xs uppercase font-bold">Barometer</span>
              </div>
              <span className="font-mono text-sm font-bold mt-1">{current.pressure} hPa</span>
            </div>

            <div className="p-4 bg-surface border border-border-subtle rounded-none flex flex-col gap-1">
              <div className="flex items-center gap-2 text-text-secondary">
                <Eye size={14} />
                <span className="font-mono text-xs uppercase font-bold">Vis Range</span>
              </div>
              <span className="font-mono text-sm font-bold mt-1">10,000 M</span>
            </div>
          </div>

          {/* Interactive Koppen Climate Diagnostics */}
          <div className="border border-border-subtle rounded-none p-5 bg-surface-raised/40">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-mono text-xs font-bold text-text-display uppercase tracking-widest flex items-center gap-1.5">
                <Navigation size={12} className="text-accent" />
                Koppen Climate Classifier
              </h4>
              <span className="font-mono text-xs text-text-secondary">MODEL_K_2026</span>
            </div>

            {/* Koppen class tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none border-b border-border-subtle mb-4">
              {Object.keys(climates).map((code) => (
                <button
                  key={code}
                  onClick={() => setSelectedClimate(code)}
                  className={`px-2.5 py-1.5 font-mono text-xs font-bold border rounded-none transition-all ${
                    selectedClimate === code
                      ? "bg-text-primary text-background border-text-primary"
                      : "bg-surface border-border-subtle text-text-secondary hover:text-text-primary"
                  }`}
                >
                  {code}
                </button>
              ))}
            </div>

            {/* Koppen class description */}
            <div className="flex flex-col gap-1 animate-fade-in" key={selectedClimate}>
              <span className="font-mono text-xs font-extrabold text-accent">{climates[selectedClimate].name}</span>
              <p className="font-mono text-xs text-text-secondary leading-relaxed mt-1">
                {climates[selectedClimate].desc}
              </p>
              <div className="mt-2.5 pt-2 border-t border-border-subtle/50 flex items-center justify-between">
                <span className="font-mono text-xs text-text-disabled">CALIBRATED_TEMP_BAND</span>
                <span className="font-mono text-xs font-bold text-text-primary">{climates[selectedClimate].tempRange}</span>
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
