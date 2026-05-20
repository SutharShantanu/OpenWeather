import React, { useState, useEffect } from "react";
import { Terminal } from "lucide-react";
import { AnimatedNumber } from "@/components/ui/animated-number";

interface DiagnosticsWidgetProps {
  lat: number;
  lon: number;
  pressure: number; // hPa
  clouds: number; // %
  dataSource: "LIVE_API" | "MOCK_FALLBACK";
}

export const DiagnosticsWidget: React.FC<DiagnosticsWidgetProps> = ({
  lat,
  lon,
  pressure,
  clouds,
  dataSource,
}) => {
  const [latency, setLatency] = useState<number>(34);

  // Slightly randomize latency on an interval to make it feel extremely responsive and real
  useEffect(() => {
    const interval = setInterval(() => {
      setLatency((prev) => {
        const delta = Math.floor(Math.random() * 15) - 7;
        const target = dataSource === "LIVE_API" ? 120 : 15; // API has longer response, local mock is extremely fast
        const next = prev + delta;
        return Math.min(target + 30, Math.max(target - 10, next));
      });
    }, 3000);
    return () => clearInterval(interval);
  }, [dataSource]);

  // Format Coordinates beautifully
  const formatCoord = (val: number, isLat: boolean) => {
    const suffix = isLat ? (val >= 0 ? "N" : "S") : val >= 0 ? "E" : "W";
    return `${Math.abs(val).toFixed(4)}°_${suffix}`;
  };

  return (
    <div className="bg-surface border border-border-visible rounded-none p-5 flex flex-col justify-between h-[220px] relative group overflow-hidden">
      {/* Widget Header */}
      <div className="flex items-center justify-between border-b border-b-border-subtle pb-2 mb-2">
        <div className="flex items-center gap-1.5">
          <Terminal size={14} className="text-text-secondary" strokeWidth={1.5} />
          <span className="font-mono text-xs font-bold tracking-[0.15em] text-text-secondary uppercase">
            DIAGNOSTICS
          </span>
        </div>
        <span className="font-mono text-xs text-text-disabled uppercase">
          SYS_LOG_SHELL
        </span>
      </div>

      {/* Grid Content Area */}
      <div className="flex items-center justify-between gap-3 flex-1">
        {/* Readings Console Column */}
        <div className="flex flex-col gap-1.5 text-left font-mono">
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-text-disabled uppercase">COORDS:</span>
            <span className="font-doto text-xs font-bold text-text-primary uppercase tracking-wider">
              {formatCoord(lat, true)} / {formatCoord(lon, false)}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-xs text-text-disabled uppercase">FEED_SRC:</span>
            <span
              className={`font-mono text-xs font-bold px-1.5 py-0.5 rounded text-black font-extrabold tracking-wider ${
                dataSource === "LIVE_API" ? "bg-interactive" : "bg-accent text-white"
              }`}
            >
              {dataSource}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-xs text-text-disabled uppercase">LATENCY:</span>
            <span className="font-doto text-xs font-bold text-text-primary">
              <AnimatedNumber value={latency} />ms
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-xs text-text-disabled uppercase">BAROMETER:</span>
            <span className="font-doto text-xs font-bold text-text-primary">
              <AnimatedNumber value={pressure} /> hPa
            </span>
          </div>
        </div>

        {/* Oscilloscope Scanning CRT Graphic */}
        <div className="relative w-24 h-20 bg-black/10 dark:bg-black/40 border border-border-subtle rounded-none flex flex-col justify-center items-center overflow-hidden">
          {/* Micro scanline background overlay */}
          <div className="absolute inset-0 bg-scanline pointer-events-none opacity-25" />
          
          <svg width="84" height="60" viewBox="0 0 84 60" className="overflow-visible select-none">
            {/* Horizontal Grid center guidelines */}
            <line x1="0" y1="30" x2="84" y2="30" stroke="var(--border-subtle)" strokeWidth="0.8" strokeDasharray="1 3" />
            <line x1="42" y1="0" x2="42" y2="60" stroke="var(--border-subtle)" strokeWidth="0.8" strokeDasharray="1 3" />

            {/* Simulated Live wave representing weather streams */}
            {/* Custom SVG path with clean CSS scanning scroll offset animation */}
            <path
              d="M 0,30 Q 10,15 21,30 T 42,30 T 63,30 T 84,30"
              fill="none"
              stroke="var(--accent)"
              strokeWidth="1.2"
              className="animate-oscilloscope"
            />
            
            {/* Glitch sub-waveform layer with slight offset */}
            <path
              d="M 0,30 Q 10,20 21,30 T 42,30 T 63,40 T 84,30"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.5"
              className="text-text-disabled/40 animate-oscilloscope"
              style={{ animationDelay: "-1s", animationDuration: "4s" }}
            />
          </svg>

          {/* Tiny blinking green/red sensor LED in top corner */}
          <div className="absolute top-1.5 right-1.5 flex items-center gap-1">
            <span className="text-xs font-mono font-bold text-text-disabled scale-[0.8] uppercase">
              CRT_SCAN
            </span>
            <span className={`w-1 h-1 rounded-full ${dataSource === "LIVE_API" ? "bg-interactive animate-pulse" : "bg-accent animate-pulse"}`} />
          </div>
        </div>
      </div>
    </div>
  );
};
