"use client";

import React from "react";
import { motion } from "framer-motion";
import { AlertTriangle, ShieldCheck } from "lucide-react";

interface AlertTickerProps {
  temp: number; // Celsius
  windSpeed: number;
  humidity: number;
  cloudiness: number;
  condition: string;
}

export const AlertTicker: React.FC<AlertTickerProps> = ({
  temp,
  windSpeed,
  humidity,
  cloudiness,
  condition,
}) => {
  const getAlerts = (): { text: string; isCrit: boolean }[] => {
    const list: { text: string; isCrit: boolean }[] = [];
    const condType = condition.toLowerCase();

    // 1. Storm alert
    if (condType.includes("storm") || condType.includes("thunder")) {
      list.push({
        text: "CRITICAL_ALERT: CONVECTIVE LIGHTNING CELLS IN DIRECT COORDINATE VECTOR. SECURE EXTERNAL DIALS.",
        isCrit: true,
      });
    }

    // 2. High Heat
    if (temp > 35) {
      list.push({
        text: "THERMAL_WARNING: CRITICAL AMBIENT TEMPERATURE DETECTED. SYSTEM BAROMETER REGISTERING HEAT FLUX.",
        isCrit: true,
      });
    }

    // 3. Sub-zero
    if (temp < 0) {
      list.push({
        text: "CRYOPRESSURE_WARNING: SUB-ZERO FREEZING FIELD ESTABLISHED. PERMAFROST CALIBRATIONS UNDERWAY.",
        isCrit: true,
      });
    }

    // 4. Strong winds
    if (windSpeed > 15) {
      list.push({
        text: "ATMOSPHERIC_ALERT: SEVERE HIGH WIND FORCE EXCEEDING 15M/S. MECHANICAL WIND TURBINE BRAKES ENGAGED.",
        isCrit: true,
      });
    }

    // 5. Aridity
    if (humidity < 25) {
      list.push({
        text: "HUMIDITY_DEVIATION: LOW WATER HYDRO-RATIO. AIR COMFORT ENVELOPE BELOW TOLERANCE THRESHOLDS.",
        isCrit: false,
      });
    }

    // 6. High Moisture
    if (humidity > 90) {
      list.push({
        text: "SATURATION_WARNING: WATER MOISTURE PEAK AT 90%+. DEWPOINT CONDENSATION RATIO CRITICAL.",
        isCrit: false,
      });
    }

    // 7. Cloudiness
    if (cloudiness > 85) {
      list.push({
        text: "VISIBILITY_DEVIATION: OVERCAST SOLAR SHIELD ENGAGED. TOTAL RADIATION INTENSITY BLOCKED.",
        isCrit: false,
      });
    }

    // Default status if list empty
    if (list.length === 0) {
      list.push({
        text: "SYS_STATUS: MECHANICAL METEOROLOGICAL CONSOLE NOMINAL. BARO SENSORS STEADY AT 1013.25HPA.",
        isCrit: false,
      });
      list.push({
        text: "SAT_LINK: STATION RESOLUTION HIGH. ANTENNA MAST THERMALLY REGULATED. SYSTEM OK.",
        isCrit: false,
      });
    }

    return list;
  };

  const alerts = getAlerts();
  const alertTextString = alerts.map((a) => a.text).join("  ///  ");
  const isAnyCritical = alerts.some((a) => a.isCrit);

  // Border and text styling adaptation
  const getBannerStyles = () => {
    if (isAnyCritical) {
      return "bg-error/15 text-error border-error/40 shadow-[0_0_15px_rgba(229,26,36,0.15)]";
    }
    return "glass-panel border-white/5 text-text-primary";
  };

  return (
    <div
      className={`w-full overflow-hidden border rounded-none h-10 flex items-center relative select-none transition-all duration-300 ${getBannerStyles()}`}
    >
      {/* Absolute Static Status Tag */}
      <div className={`relative z-20 h-full px-4.5 flex items-center gap-2 text-[9px] font-mono font-bold border-r ${
        isAnyCritical 
          ? "bg-accent text-white border-accent shadow-[0_0_8px_rgba(229,26,36,0.4)]" 
          : "bg-white/5 border-white/5 text-text-secondary"
      }`}>
        {isAnyCritical ? (
          <>
            <AlertTriangle size={11} className="animate-bounce" />
            <span>CRIT_ALERT</span>
          </>
        ) : (
          <>
            <ShieldCheck size={11} />
            <span>SYS_OK</span>
          </>
        )}
      </div>

      {/* Infinite Horizontal Marquee Container */}
      <div className="flex-1 overflow-hidden relative flex items-center h-full">
        <motion.div
          className="flex whitespace-nowrap text-[9px] font-mono uppercase tracking-[0.15em] font-semibold pl-4 text-text-secondary"
          animate={{ x: [0, -1000] }}
          transition={{
            ease: "linear",
            duration: 26,
            repeat: Infinity,
          }}
        >
          <span className="mr-12">{alertTextString}</span>
          <span className="mr-12">{alertTextString}</span>
          <span className="mr-12">{alertTextString}</span>
          <span className="mr-12">{alertTextString}</span>
        </motion.div>
      </div>
    </div>
  );
};
