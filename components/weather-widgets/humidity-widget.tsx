"use client";

import React, { useState } from "react";
import { Droplets, Cpu, Thermometer, Smile, X } from "lucide-react";
import { Dialog, DialogContent, DialogClose } from "@/components/ui/dialog";
import { AnimatedNumber } from "@/components/ui/animated-number";

interface HumidityWidgetProps {
  humidity: number; // percentage (e.g. 78)
  temp: number; // celsius (for dew point calculation)
  unit?: "C" | "F";
  aestheticMode?: "mono" | "hybrid" | "solid";
}

export const HumidityWidget: React.FC<HumidityWidgetProps> = ({
  humidity,
  temp,
  unit = "C",
  aestheticMode = "mono",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [simHumidity, setSimHumidity] = useState<number | null>(null);
  const [simTemp, setSimTemp] = useState<number | null>(null);

  const activeHumidity = simHumidity !== null ? simHumidity : humidity;
  const activeTemp = simTemp !== null ? simTemp : temp;

  // Approximate Dew Point using standard formula: Td = T - ((100 - RH)/5)
  const dewPointC = activeTemp - (100 - activeHumidity) / 5;
  const displayDewPoint = unit === "F"
    ? parseFloat(((dewPointC * 1.8) + 32).toFixed(1))
    : parseFloat(dewPointC.toFixed(1));

  const displayTemp = unit === "F"
    ? parseFloat(((activeTemp * 1.8) + 32).toFixed(1))
    : parseFloat(activeTemp.toFixed(1));

  // Determine comfort index
  const getComfortIndex = (h: number) => {
    if (h < 30) return { label: "DRY_AIR", color: "text-[#00E5FF]", desc: "Air is dry. Risk of skin irritation." };
    if (h >= 30 && h <= 55) return { label: "COMFORT_OPTIMAL", color: "text-[#00FF66]", desc: "Optimal moisture balance. Most comfortable." };
    if (h > 55 && h <= 75) return { label: "MOIST_MODERATE", color: "text-warning", desc: "Slightly sticky atmosphere. High humidity felt." };
    return { label: "HUMID_HIGH", color: "text-accent", desc: "Extremely muggy. Heavy air moisture." };
  };

  const comfort = getComfortIndex(activeHumidity);

  // Apparent Heat Index (Approximation formula)
  const calculateHeatIndex = (t: number, rh: number) => {
    if (t < 20) return t; // HI only applies above 20 C
    const hi = t + 0.5 * (t + 61.0 + ((t - 68.0) * 1.2) + (rh * 0.094));
    return parseFloat(((hi + t) / 2).toFixed(1));
  };

  const heatIndexC = calculateHeatIndex(activeTemp, activeHumidity);
  const displayHeatIndex = unit === "F"
    ? parseFloat(((heatIndexC * 1.8) + 32).toFixed(1))
    : parseFloat(heatIndexC.toFixed(1));

  const getHeatIndexAlert = (hiC: number) => {
    if (hiC < 27) return { zone: "NORMAL / SAFE", color: "bg-[#00FF66]/15 text-[#00FF66] border-[#00FF66]/30", level: "SAFE" };
    if (hiC < 32) return { zone: "CAUTION (FATIGUE POSSIBLE)", color: "bg-warning/15 text-warning border-warning/30", level: "CAUTION" };
    if (hiC < 41) return { zone: "EXTREME CAUTION (CRAL LOADS)", color: "bg-orange-500/15 text-orange-500 border-orange-500/30", level: "EXTREME CAUTION" };
    return { zone: "HEAT DANGER (STROKE RISK)", color: "bg-accent/15 text-accent border-accent/30 animate-pulse", level: "DANGER" };
  };

  const hiAlert = getHeatIndexAlert(heatIndexC);

  // Dynamic aesthetic mode styling
  const getBorderColor = () => {
    if (aestheticMode === "hybrid") return "border-accent shadow-[0_0_15px_rgba(215,25,33,0.08)]";
    return "border-border-visible";
  };

  const getSolidBackgroundClass = () => {
    return "bg-gradient-to-br from-[#121A2E] to-[#0A101C] border-transparent text-white shadow-[0_10px_30px_rgba(0,0,0,0.4)]";
  };

  return (
    <>
      <div
        onClick={() => setIsOpen(true)}
        className={`rounded-none p-5 flex flex-col justify-between h-[220px] relative group overflow-hidden cursor-pointer transition-all duration-300 ${
          aestheticMode === "solid"
            ? getSolidBackgroundClass()
            : `bg-surface border ${getBorderColor()}`
        }`}
      >
        {/* Widget Header */}
        <div className="flex items-center justify-between border-b pb-2 mb-3 border-border-subtle/50 z-10">
          <div className="flex items-center gap-1.5">
            <Droplets
              size={14}
              className={aestheticMode === "solid" ? "text-[#3F8EFF]" : aestheticMode === "hybrid" ? "text-accent" : "text-text-secondary"}
              strokeWidth={1.5}
            />
            <span className="font-mono text-xs font-bold tracking-[0.15em] text-text-secondary uppercase">
              HUMIDITY
            </span>
          </div>
          <span className="font-mono text-xs text-text-disabled uppercase">
            SYS_HYGROMETER
          </span>
        </div>

        {/* Main Content Area */}
        <div className="flex items-center justify-between flex-1 gap-2 z-10">
          {/* Humidity Percent Readout */}
          <div className="flex flex-col">
            <div className="flex items-baseline">
              <span className={`font-doto text-3xl font-extrabold select-none ${aestheticMode === "solid" ? "text-white" : "text-text-display"}`}>
                <AnimatedNumber value={activeHumidity} />
              </span>
              <span className="font-mono text-lg font-bold text-interactive ml-0.5">%</span>
            </div>
            <span className={`font-mono text-xs mt-1 uppercase ${aestheticMode === "solid" ? "text-white/60" : "text-text-secondary"}`}>
              STATUS: <span className={`font-bold ${comfort.color}`}>{comfort.label}</span>
            </span>
            <div className="flex items-center gap-1.5 mt-3">
              <span className="font-mono text-xs text-text-disabled uppercase">
                DEW_POINT:
              </span>
              <span className={`font-doto text-xs font-bold ${aestheticMode === "solid" ? "text-white" : "text-text-primary"}`}>
                <AnimatedNumber value={displayDewPoint} decimals={1} />°{unit}
              </span>
            </div>
          </div>

          {/* Graphical Representation: Droplet with Dot-Grid Fill */}
          <div className="relative w-12 h-14 flex items-center justify-center select-none">
            <svg width="42" height="48" viewBox="0 0 24 28" className={aestheticMode === "solid" ? "text-white/20" : "text-text-disabled"}>
              <defs>
                <pattern id="droplet-grid" width="4" height="4" patternUnits="userSpaceOnUse">
                  <circle cx="2" cy="2" r="0.8" fill="currentColor" className={aestheticMode === "solid" ? "text-[#3F8EFF]" : "text-text-primary"} />
                </pattern>
                
                {/* Droplet Clipping Path */}
                <clipPath id="droplet-clip">
                  <path d="M12 2C12 2 4 11.2 4 17.5C4 21.9 7.6 25.5 12 25.5C16.4 25.5 20 21.9 20 17.5C20 11.2 12 2 12 2Z" />
                </clipPath>
              </defs>

              {/* Background Base Droplet (Monoline Outline) */}
              <path
                d="M12 2C12 2 4 11.2 4 17.5C4 21.9 7.6 25.5 12 25.5C16.4 25.5 20 21.9 20 17.5C20 11.2 12 2 12 2Z"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeLinejoin="round"
              />

              {/* Droplet Internal Fill (Clipped to Teardrop Shape) */}
              <g clipPath="url(#droplet-clip)">
                {/* Dynamic Fill level rising from bottom based on humidity */}
                <rect
                  x="0"
                  y={28 - (activeHumidity / 100) * 26}
                  width="24"
                  height="28"
                  fill="url(#droplet-grid)"
                  className="transition-all duration-500 ease-out text-text-primary"
                />
                
                {/* Fill boundary divider line */}
                <line
                  x1="0"
                  y1={28 - (activeHumidity / 100) * 26}
                  x2="24"
                  y2={28 - (activeHumidity / 100) * 26}
                  stroke={aestheticMode === "solid" ? "#3F8EFF" : "var(--accent)"}
                  strokeWidth="1"
                  className="transition-all duration-500 ease-out"
                />
              </g>
            </svg>
          </div>
        </div>

        {/* Touch feedback calibration */}
        <div className="absolute bottom-2.5 right-2.5 flex items-center gap-1 opacity-40 group-hover:opacity-100 transition-opacity">
          <span className="w-1.5 h-1.5 rounded-full bg-[#00E5FF]" />
          <span className="font-mono text-xs text-text-disabled">HYGR_CAL</span>
        </div>
      </div>

      {/* Humidity interactive detail dialog */}
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
                style={{ background: "#5B9BF6", boxShadow: "0 0 8px 1px rgba(91,155,246,0.5)" }}
              />
              <div className="flex flex-col">
                <span className="font-mono text-xs font-bold text-text-primary tracking-wider uppercase">SYS_HYGROMETER_HEAT_INDEX</span>
                <span className="font-mono text-[9px] text-text-disabled uppercase tracking-widest">STATION_HUMID_INDEX // COMFORT_MATRIX</span>
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
        <div className="flex flex-col gap-5 text-text-primary">
          <div className="p-4 bg-surface-raised border border-border-subtle rounded-none flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-border-subtle/50 pb-2">
              <span className="font-mono text-xs font-bold text-[#00E5FF] uppercase tracking-wider flex items-center gap-1.5">
                <Cpu size={12} />
                ATMOSPHERIC_SIMULATOR_PARAMS
              </span>
              <button
                onClick={() => {
                  setSimHumidity(null);
                  setSimTemp(null);
                }}
                disabled={simHumidity === null && simTemp === null}
                className="font-mono text-xs font-bold uppercase bg-surface border border-border-subtle px-2 py-1 rounded hover:border-accent hover:text-accent transition-all disabled:opacity-40"
              >
                RESET_TO_LIVE
              </button>
            </div>

            {/* Slider 1: Relative Humidity */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between font-mono text-xs">
                <span className="text-text-secondary uppercase">Relative Humidity</span>
                <span className="font-doto font-bold text-[#00E5FF]"><AnimatedNumber value={activeHumidity} />%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={activeHumidity}
                onChange={(e) => setSimHumidity(parseInt(e.target.value))}
                className="w-full accent-[#00E5FF] bg-surface border border-border-subtle h-2 rounded-none appearance-none cursor-pointer"
              />
            </div>

            {/* Slider 2: Air Temperature */}
            <div className="flex flex-col gap-1.5 mt-1">
              <div className="flex justify-between font-mono text-xs">
                <span className="text-text-secondary uppercase">Air Temperature</span>
                <span className="font-doto font-bold text-accent">
                  <AnimatedNumber value={displayTemp} decimals={1} />°{unit}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="50"
                step="0.5"
                value={activeTemp}
                onChange={(e) => setSimTemp(parseFloat(e.target.value))}
                className="w-full accent-accent bg-surface border border-border-subtle h-2 rounded-none appearance-none cursor-pointer"
              />
            </div>
          </div>

          {/* Telemetry Output Blocks */}
          <div className="grid grid-cols-2 gap-4">
            {/* Comfort Matrix */}
            <div className="p-4 bg-surface-raised border border-border-subtle rounded-none flex flex-col justify-between">
              <div className="flex items-center justify-between border-b border-border-subtle/50 pb-1.5 mb-2">
                <span className="font-mono text-xs text-text-disabled uppercase flex items-center gap-1">
                  <Smile size={10} />
                  COMFORT RATING
                </span>
                <span className={`font-mono text-xs font-bold uppercase ${comfort.color}`}>{comfort.label}</span>
              </div>
              <p className="font-mono text-xs text-text-primary leading-normal">{comfort.desc}</p>
              <div className="mt-3 flex items-center gap-1.5 bg-surface border border-border-subtle rounded-none p-2 font-mono text-xs text-text-secondary">
                <span>Dew Point:</span>
                <span className="font-doto font-bold text-text-primary"><AnimatedNumber value={displayDewPoint} decimals={1} />°{unit}</span>
              </div>
            </div>

            {/* Apparent Temp / Heat Index */}
            <div className="p-4 bg-surface-raised border border-border-subtle rounded-none flex flex-col justify-between">
              <div className="flex items-center justify-between border-b border-border-subtle/50 pb-1.5 mb-2">
                <span className="font-mono text-xs text-text-disabled uppercase flex items-center gap-1">
                  <Thermometer size={10} />
                  APPARENT INDEX
                </span>
                <span className="font-mono text-xs font-bold text-accent">HEAT_IDX</span>
              </div>
              <div className="flex items-baseline">
                <span className="font-doto text-2xl font-extrabold text-text-display">
                  <AnimatedNumber value={displayHeatIndex} decimals={1} />°
                </span>
                <span className="font-mono text-xs font-bold text-accent uppercase tracking-wider ml-1">{unit}</span>
              </div>
              <div className={`mt-2.5 font-mono text-xs font-bold px-2.5 py-1.5 rounded-none border text-center uppercase tracking-wide ${hiAlert.color}`}>
                {hiAlert.zone}
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
