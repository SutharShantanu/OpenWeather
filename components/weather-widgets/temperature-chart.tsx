"use client";

import React from "react";
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

interface TemperatureDataPoint {
  time: string;
  temp: number;
}

interface TemperatureChartProps {
  data: TemperatureDataPoint[];
}

export const TemperatureChart: React.FC<TemperatureChartProps> = ({ data }) => {
  return (
    <div className="w-full h-full min-h-[200px] mt-4 relative">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#fff" stopOpacity={0.25} />
              <stop offset="95%" stopColor="#fff" stopOpacity={0} />
            </linearGradient>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
          <XAxis 
            dataKey="time" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 10, fontFamily: "monospace" }} 
            dy={10} 
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 10, fontFamily: "monospace" }} 
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: "#000", 
              border: "1px solid rgba(255,255,255,0.2)", 
              borderRadius: "0px",
              color: "#fff",
              fontFamily: "monospace"
            }} 
            itemStyle={{ color: "#fff" }}
            cursor={{ stroke: 'rgba(255,255,255,0.2)', strokeWidth: 1, strokeDasharray: "2 2" }}
          />
          <Area
            type="monotone"
            dataKey="temp"
            stroke="#ffffff"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorTemp)"
            filter="url(#glow)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
