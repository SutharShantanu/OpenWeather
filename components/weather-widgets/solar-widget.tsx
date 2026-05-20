import React from "react";
import { Sun, Sunset, Moon } from "lucide-react";

interface SolarWidgetProps {
  sunrise: number; // timestamp
  sunset: number; // timestamp
  dt: number; // current time timestamp
}

export const SolarWidget: React.FC<SolarWidgetProps> = ({ sunrise, sunset, dt }) => {
  // Format timestamps to HH:MM in browser local time
  const formatTime = (ts: number) => {
    try {
      const date = new Date(ts * 1000);
      const hours = String(date.getHours()).padStart(2, "0");
      const minutes = String(date.getMinutes()).padStart(2, "0");
      return `${hours}:${minutes}`;
    } catch {
      return "00:00";
    }
  };

  const isDaytime = dt >= sunrise && dt <= sunset;

  // Calculate trajectory progress (0 to 1)
  let progress = 0;
  if (isDaytime) {
    const totalDaylight = sunset - sunrise;
    const elapsed = dt - sunrise;
    progress = totalDaylight > 0 ? Math.min(1, Math.max(0, elapsed / totalDaylight)) : 0.5;
  } else {
    // Night progress estimation (either before sunrise or after sunset)
    // Assume typical 12-hour night span if full context is missing
    const totalNight = 24 * 3600 - (sunset - sunrise);
    let elapsed = 0;
    if (dt > sunset) {
      elapsed = dt - sunset;
    } else if (dt < sunrise) {
      elapsed = dt + (24 * 3600 - sunset);
    }
    progress = totalNight > 0 ? Math.min(1, Math.max(0, elapsed / totalNight)) : 0.5;
  }

  // Path sizing
  const width = 120;
  const height = 48;
  const startX = 10;
  const endX = width - 10;
  const horizonY = height - 10;
  const peakY = 12;

  // Calculate Sun/Moon coordinates along the quadratic bezier path
  // Arc equation: y = horizonY - 4 * progress * (1 - progress) * (horizonY - peakY)
  const currentX = startX + progress * (endX - startX);
  const currentY = horizonY - 4 * progress * (1 - progress) * (horizonY - peakY);

  // Remaining light hours or hours until sunrise calculation
  const getAstronomyDetails = () => {
    if (isDaytime) {
      const remainingSeconds = sunset - dt;
      const hours = Math.floor(remainingSeconds / 3600);
      const mins = Math.floor((remainingSeconds % 3600) / 60);
      if (hours > 0) {
        return `${hours}H ${mins}M OF LIGHT REMAINING`;
      }
      return `${mins}M OF LIGHT REMAINING`;
    } else {
      let secondsToSunrise = 0;
      if (dt > sunset) {
        secondsToSunrise = (sunrise + 24 * 3600) - dt;
      } else {
        secondsToSunrise = sunrise - dt;
      }
      const hours = Math.floor(secondsToSunrise / 3600);
      const mins = Math.floor((secondsToSunrise % 3600) / 60);
      if (hours > 0) {
        return `SUNRISE IN ${hours}H ${mins}M`;
      }
      return `SUNRISE IN ${mins}M`;
    }
  };

  return (
    <div className="bg-surface border border-border-visible rounded-none p-5 flex flex-col justify-between h-[220px] relative group overflow-hidden">
      {/* Widget Header */}
      <div className="flex items-center justify-between border-b border-border-subtle pb-2 mb-2">
        <div className="flex items-center gap-1.5">
          <Sun size={14} className="text-text-secondary animate-pulse" strokeWidth={1.5} />
          <span className="font-mono text-xs font-bold tracking-[0.15em] text-text-secondary uppercase">
            ASTRONOMY
          </span>
        </div>
        <span className="font-mono text-xs text-text-disabled uppercase">
          SYS_HELIOSTAT
        </span>
      </div>

      {/* Main Content */}
      <div className="flex justify-between items-center gap-2 flex-1">
        {/* Left Side: Readings */}
        <div className="flex flex-col justify-center">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2">
              <Sun size={12} className="text-interactive" strokeWidth={1.5} />
              <div className="flex flex-col leading-none">
                <span className="font-mono text-xs text-text-disabled uppercase">SUNRISE</span>
                <span className="font-doto text-xs font-bold text-text-primary">
                  {formatTime(sunrise)}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 mt-1">
              <Sunset size={12} className="text-interactive" strokeWidth={1.5} />
              <div className="flex flex-col leading-none">
                <span className="font-mono text-xs text-text-disabled uppercase">SUNSET</span>
                <span className="font-doto text-xs font-bold text-text-primary">
                  {formatTime(sunset)}
                </span>
              </div>
            </div>
          </div>

          <div className="font-mono text-xs text-text-secondary tracking-wider uppercase mt-3.5 select-none font-bold">
            {getAstronomyDetails()}
          </div>
        </div>

        {/* Right Side: Graph Parabola */}
        <div className="relative flex flex-col items-center justify-center select-none pt-1">
          <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
            {/* Horizon horizontal line */}
            <line
              x1="0"
              y1={horizonY}
              x2={width}
              y2={horizonY}
              stroke="var(--border-subtle)"
              strokeWidth="1"
              strokeDasharray="3 3"
            />

            {/* Inactive trajectory (full dashed arc) */}
            <path
              d={`M ${startX} ${horizonY} Q ${width / 2} ${peakY - 10} ${endX} ${horizonY}`}
              fill="none"
              stroke="var(--border-subtle)"
              strokeWidth="1.2"
              strokeDasharray="2 2"
            />

            {/* Active trajectory section (solid line up to current position, only during daytime) */}
            {isDaytime && (
              <path
                d={`M ${startX} ${horizonY} Q ${width / 2} ${peakY - 10} ${endX} ${horizonY}`}
                fill="none"
                stroke="var(--text-secondary)"
                strokeWidth="1.2"
                strokeDasharray={`${progress * 100} 100`}
              />
            )}

            {/* Sun or Moon Glowing node */}
            <g transform={`translate(${currentX}, ${currentY})`}>
              {isDaytime ? (
                <>
                  {/* Outer solar LED pulse halo */}
                  <circle
                    cx="0"
                    cy="0"
                    r="6"
                    className="fill-accent/15 stroke-accent/40 animate-ping"
                    style={{ animationDuration: "3s" }}
                  />
                  {/* Inner solar LED node */}
                  <circle cx="0" cy="0" r="3.5" className="fill-accent stroke-surface stroke-[1.2px]" />
                </>
              ) : (
                <>
                  {/* Lunar Glow pulse */}
                  <circle
                    cx="0"
                    cy="0"
                    r="5"
                    className="fill-interactive/10 stroke-interactive/30 animate-pulse"
                  />
                  {/* Moon icon placeholder circle or monoline moon */}
                  <circle cx="0" cy="0" r="3" className="fill-interactive stroke-surface stroke-[1]" />
                </>
              )}
            </g>

            {/* Label nodes for boundaries */}
            <text x={startX} y={horizonY + 10} fontSize="12" className="font-doto fill-text-disabled text-center" textAnchor="middle">
              AM
            </text>
            <text x={endX} y={horizonY + 10} fontSize="12" className="font-doto fill-text-disabled text-center" textAnchor="middle">
              PM
            </text>
          </svg>
        </div>
      </div>
    </div>
  );
};
