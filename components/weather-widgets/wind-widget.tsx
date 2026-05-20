"use client";

import React, { useState } from "react";
import { Compass, Cpu, ShieldAlert, X } from "lucide-react";
import { Dialog, DialogContent, DialogClose } from "@/components/ui/dialog";
import { AnimatedNumber } from "@/components/ui/animated-number";

interface WindWidgetProps {
  speed: number; // m/s
  deg: number; // degrees
  aestheticMode?: "mono" | "hybrid" | "solid";
}

export const WindWidget: React.FC<WindWidgetProps> = ({
  speed,
  deg,
  aestheticMode = "mono",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [simSpeed, setSimSpeed] = useState<number | null>(null);

  const activeSpeed = simSpeed !== null ? simSpeed : speed;
  const speedKmh = parseFloat((activeSpeed * 3.6).toFixed(1));
  const speedMps = parseFloat(activeSpeed.toFixed(1));

  // Determine compass direction text (N, NNE, NE, etc.)
  const getDirectionText = (degree: number) => {
    const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
    const index = Math.round(((degree % 360) / 45)) % 8;
    return directions[index];
  };

  // Dynamic animation duration for wind turbine blades
  const duration = activeSpeed <= 0.2 ? 0 : Math.max(0.2, Math.min(8, 20 / activeSpeed));

  // Get Beaufort Scale
  const getBeaufort = (mps: number) => {
    if (mps < 0.5) return { force: 0, desc: "CALM", effect: "Smoke rises vertically" };
    if (mps < 1.6) return { force: 1, desc: "LIGHT AIR", effect: "Direction shown by smoke drift" };
    if (mps < 3.4) return { force: 2, desc: "LIGHT BREEZE", effect: "Wind felt on face; leaves rustle" };
    if (mps < 5.5) return { force: 3, desc: "GENTLE BREEZE", effect: "Leaves & twigs in constant motion" };
    if (mps < 8.0) return { force: 4, desc: "MODERATE BREEZE", effect: "Raises dust and loose paper" };
    if (mps < 10.8) return { force: 5, desc: "FRESH BREEZE", effect: "Small trees in leaf begin to sway" };
    if (mps < 13.9) return { force: 6, desc: "STRONG BREEZE", effect: "Large branches in motion; umbrellas difficult" };
    if (mps < 17.2) return { force: 7, desc: "HIGH WIND", effect: "Whole trees in motion; resistance walking" };
    if (mps < 20.8) return { force: 8, desc: "GALE", effect: "Twigs break off trees; progress impeded" };
    if (mps < 24.5) return { force: 9, desc: "STRONG GALE", effect: "Slight structural damage occurs" };
    if (mps < 28.5) return { force: 10, desc: "STORM", effect: "Considerable structural damage" };
    if (mps < 32.7) return { force: 11, desc: "VIOLENT STORM", effect: "Widespread devastation occurs" };
    return { force: 12, desc: "HURRICANE", effect: "Severe structural failure & destruction" };
  };

  const beaufort = getBeaufort(activeSpeed);

  // Structural diagnostics (simulated flex and load)
  const rotorLoad = parseFloat((activeSpeed * activeSpeed * 0.12).toFixed(2)); // kN
  const bladeFlex = parseFloat((activeSpeed * 1.6).toFixed(1)); // % flex
  const stressLevel = activeSpeed > 25 ? "CRITICAL" : activeSpeed > 15 ? "WARNING" : "STABLE";

  // Dynamic aesthetic mode coloring
  const getBorderColor = () => {
    if (aestheticMode === "hybrid") return "border-accent shadow-[0_0_15px_rgba(215,25,33,0.08)]";
    return "border-border-visible";
  };

  const getSolidBackgroundClass = () => {
    return "bg-gradient-to-br from-[#1C1A2E] to-[#12111C] border-transparent text-white shadow-[0_10px_30px_rgba(0,0,0,0.4)]";
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
            <Compass
              size={14}
              className={aestheticMode === "solid" ? "text-[#00E5FF]" : aestheticMode === "hybrid" ? "text-accent" : "text-text-secondary"}
              strokeWidth={1.5}
            />
            <span className="font-mono text-xs font-bold tracking-[0.15em] text-text-secondary uppercase">
              WIND_VECTOR
            </span>
          </div>
          <span className="font-mono text-xs text-text-disabled uppercase">
            SYS_ANEMOMETER
          </span>
        </div>

        {/* Main Content Area */}
        <div className="flex items-center justify-between flex-1 gap-2 z-10">
          {/* Anemometer Readout */}
          <div className="flex flex-col">
            <div className="flex items-baseline">
              <span className={`font-doto text-3xl font-extrabold select-none tracking-tight ${aestheticMode === "solid" ? "text-white" : "text-text-display"}`}>
                <AnimatedNumber value={speedMps} decimals={1} />
              </span>
              <span className="font-mono text-xs font-bold text-accent uppercase tracking-wider ml-1">
                M/S
              </span>
            </div>
            <span className={`font-mono text-xs mt-1 ${aestheticMode === "solid" ? "text-white/60" : "text-text-secondary"}`}>
              CONV: <span className="font-doto"><AnimatedNumber value={speedKmh} decimals={1} /></span> KM/H
            </span>
            <div className="flex items-center gap-1.5 mt-2.5">
              <span className={`font-mono text-xs font-bold uppercase px-2 py-0.5 rounded ${
                aestheticMode === "solid" ? "bg-white/10 text-[#00E5FF] border border-white/10" : "bg-surface-raised border border-border-subtle text-text-primary"
              }`}>
                DIR: {getDirectionText(deg)}
              </span>
              <span className="font-doto text-xs text-text-disabled">
                {deg}°
              </span>
            </div>
          </div>

          {/* Graphical Representation: Rotating Compass & Spinning Fan */}
          <div className="flex items-center gap-3">
            {/* Compass Graphic */}
            <div className={`relative w-11 h-11 rounded-full border flex items-center justify-center select-none ${
              aestheticMode === "solid" ? "border-white/15 bg-white/5" : "border-border-visible bg-surface-raised"
            }`}>
              <span className="absolute top-0.5 text-xs font-mono font-bold text-text-disabled">N</span>
              <span className="absolute bottom-0.5 text-xs font-mono font-bold text-text-disabled">S</span>
              {/* Arrow */}
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                className={`transition-transform duration-500 ease-out ${aestheticMode === "solid" ? "text-[#00E5FF]" : "text-accent"}`}
                style={{ transform: `rotate(${deg}deg)` }}
              >
                <path
                  d="M12 3l4 8H8l4-8z M12 21v-10"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            {/* Mechanical Wind Turbine Graphic */}
            <div className="relative w-12 h-14 flex flex-col items-center justify-end select-none">
              {/* Pole */}
              <div className={`w-0.5 h-9 absolute bottom-0 ${aestheticMode === "solid" ? "bg-white/30" : "bg-text-disabled"}`} />
              {/* Generator Hub */}
              <div className={`w-1.5 h-1.5 rounded-full absolute bottom-9 ${aestheticMode === "solid" ? "bg-[#00E5FF]" : "bg-text-secondary"}`} />
              
              {/* Spinning Blades */}
              <svg
                width="24"
                height="24"
                viewBox="0 0 28 28"
                className={`absolute bottom-[23px] ${
                  aestheticMode === "solid" ? "text-white" : "text-text-primary"
                }`}
                style={{
                  animation: duration > 0 ? `spin ${duration}s linear infinite` : "none",
                  transformOrigin: "14px 14px",
                }}
              >
                {/* Center Hub */}
                <circle cx="14" cy="14" r="1.5" fill="currentColor" />
                {/* Blade 1 (Top) */}
                <path
                  d="M14 14v-11c0-.5.4-.5.4 0v11"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                />
                {/* Blade 2 (Bottom-Left) */}
                <path
                  d="M14 14l-9.52 5.5c-.43.25-.23.6.2.35l9.32-5.85"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                />
                {/* Blade 3 (Bottom-Right) */}
                <path
                  d="M14 14l9.52 5.5c.43.25.23.6-.2.35l-9.32-5.85"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Dynamic decorative LED indicator */}
        <div className="absolute bottom-2.5 right-2.5 flex items-center gap-1 opacity-40 group-hover:opacity-100 transition-opacity">
          <span className={`w-1.5 h-1.5 rounded-full ${activeSpeed > 15 ? "bg-accent animate-pulse" : "bg-[#00FF66]"}`} />
          <span className="font-mono text-xs text-text-disabled">CALIBRATED</span>
        </div>
      </div>

      {/* Wind tunnel slider simulation overlay */}
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
                <span className="font-mono text-xs font-bold text-text-primary tracking-wider uppercase">SYS_WIND_TUNNEL_SIMULATOR</span>
                <span className="font-mono text-[9px] text-text-disabled uppercase tracking-widest">STATION_VECTOR_LOAD // ANEMOMETER_CALIBRATOR</span>
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
          <div className="p-4 bg-surface-raised border border-border-subtle rounded-none flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-accent uppercase tracking-wider flex items-center gap-1.5">
                <Cpu size={12} />
                LIVE_CALIBRATION_INPUT
              </span>
              <button
                onClick={() => setSimSpeed(null)}
                disabled={simSpeed === null}
                className="font-mono text-xs font-bold uppercase bg-surface border border-border-subtle px-2 py-1 rounded hover:border-accent hover:text-accent transition-all disabled:opacity-40"
              >
                RESET_TO_LIVE
              </button>
            </div>

            {/* Slider control */}
            <div className="flex flex-col gap-2.5 my-2">
              <div className="flex items-baseline justify-between">
                <span className="font-mono text-xs text-text-secondary uppercase">Anemometer Velocity</span>
                <span className="font-doto text-lg font-extrabold text-accent">
                  <AnimatedNumber value={speedMps} decimals={1} /> <span className="font-mono text-xs font-bold uppercase">M/S</span>
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="50"
                step="0.5"
                value={activeSpeed}
                onChange={(e) => setSimSpeed(parseFloat(e.target.value))}
                className="w-full accent-accent bg-surface border border-border-subtle h-2.5 rounded-none appearance-none cursor-pointer"
              />
              <div className="flex justify-between font-mono text-xs text-text-disabled px-0.5">
                <span>0 M/S (CALM)</span>
                <span>15 M/S (WARNING)</span>
                <span>30 M/S (STORM)</span>
                <span>50 M/S (HURRICANE)</span>
              </div>
            </div>
          </div>

          {/* Telemetry output cards */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-surface-raised border border-border-subtle rounded-none flex flex-col justify-between">
              <div className="flex items-center justify-between border-b border-border-subtle/50 pb-1.5 mb-2">
                <span className="font-mono text-xs text-text-disabled uppercase">BEAUFORT FORCE</span>
                <span className="font-mono text-xs font-bold text-[#00FF66]">F-<span className="font-doto">{beaufort.force}</span></span>
              </div>
              <span className="font-mono text-sm font-bold text-text-primary uppercase tracking-tight">{beaufort.desc}</span>
              <p className="font-mono text-xs text-text-secondary leading-normal mt-1.5">{beaufort.effect}</p>
            </div>

            <div className="p-4 bg-surface-raised border border-border-subtle rounded-none flex flex-col justify-between">
              <div className="flex items-center justify-between border-b border-border-subtle/50 pb-1.5 mb-2">
                <span className="font-mono text-xs text-text-disabled uppercase">STRUCTURAL DIAG</span>
                <span className={`font-mono text-xs font-bold px-1.5 py-0.5 rounded ${
                  stressLevel === "CRITICAL" ? "bg-accent/15 text-accent animate-pulse" : stressLevel === "WARNING" ? "bg-warning/15 text-warning" : "bg-[#00FF66]/15 text-[#00FF66]"
                }`}>{stressLevel}</span>
              </div>
              <div className="flex flex-col gap-1 mt-1">
                <div className="flex justify-between font-mono text-xs">
                  <span className="text-text-secondary">Rotor Load:</span>
                  <span className="font-doto font-bold text-text-primary">{rotorLoad} kN</span>
                </div>
                <div className="flex justify-between font-mono text-xs">
                  <span className="text-text-secondary">Blade Flex:</span>
                  <span className="font-doto font-bold text-text-primary">{bladeFlex}%</span>
                </div>
              </div>
              {activeSpeed > 25 && (
                <div className="flex items-center gap-1.5 text-accent mt-2 animate-pulse">
                  <ShieldAlert size={10} />
                  <span className="font-mono text-xs font-bold">STALL_AUTO_BRAKE_ACTIVE</span>
                </div>
              )}
            </div>
          </div>
        </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
