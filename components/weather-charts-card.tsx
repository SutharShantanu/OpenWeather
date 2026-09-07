"use client";

import React, { useState } from "react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { HourlyForecastItem, formatTemperature } from "@/lib/weather";
import { TrendingUp, CloudRain, Wind, Droplets, SunMedium } from "lucide-react";

interface WeatherChartsCardProps {
  hourly: HourlyForecastItem[];
  unit: "C" | "F";
}

export function WeatherChartsCard({ hourly, unit }: WeatherChartsCardProps) {
  const [metric, setMetric] = useState<"temp" | "precip" | "wind" | "humidity" | "uv">("temp");

  const chartData = hourly.slice(0, 24).map((item) => ({
    time: item.time,
    temp: formatTemperature(item.temp, unit),
    feelsLike: formatTemperature(item.feelsLike, unit),
    precip: Math.round(item.pop * 100),
    wind: parseFloat(item.windSpeed.toFixed(1)),
    humidity: item.humidity,
    uv: item.uvIndex ?? 0,
  }));

  return (
    <Card className="w-full">
      <CardHeader className="border-b border-border pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp className="size-3.5 text-primary" />
            <CardTitle className="text-sm font-heading font-semibold tracking-tight">
              Atmospheric Progression Analytics
            </CardTitle>
            <Badge variant="outline" className="text-tiny font-mono">
              24-Hour Graph
            </Badge>
          </div>
          <CardDescription className="text-xs">
            Interactive multi-sensor trend lines & probability matrices
          </CardDescription>
        </div>

        {/* Metric Selector Tabs */}
        <CardAction>
          <div className="flex items-center border border-border p-0.5 text-xs font-mono overflow-x-auto">
            <Button
              variant={metric === "temp" ? "default" : "ghost"}
              size="xs"
              onClick={() => setMetric("temp")}
              className="gap-1 font-mono text-xs h-6 px-2"
            >
              <TrendingUp className="size-3" />
              <span>Temp</span>
            </Button>
            <Button
              variant={metric === "precip" ? "default" : "ghost"}
              size="xs"
              onClick={() => setMetric("precip")}
              className="gap-1 font-mono text-xs h-6 px-2"
            >
              <CloudRain className="size-3" />
              <span>Precip</span>
            </Button>
            <Button
              variant={metric === "wind" ? "default" : "ghost"}
              size="xs"
              onClick={() => setMetric("wind")}
              className="gap-1 font-mono text-xs h-6 px-2"
            >
              <Wind className="size-3" />
              <span>Wind</span>
            </Button>
            <Button
              variant={metric === "humidity" ? "default" : "ghost"}
              size="xs"
              onClick={() => setMetric("humidity")}
              className="gap-1 font-mono text-xs h-6 px-2"
            >
              <Droplets className="size-3" />
              <span>Moisture</span>
            </Button>
            <Button
              variant={metric === "uv" ? "default" : "ghost"}
              size="xs"
              onClick={() => setMetric("uv")}
              className="gap-1 font-mono text-xs h-6 px-2"
            >
              <SunMedium className="size-3" />
              <span>UV</span>
            </Button>
          </div>
        </CardAction>
      </CardHeader>

      <CardContent className="pt-4">
        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            {metric === "temp" ? (
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="chartTempGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" strokeOpacity={0.08} />
                <XAxis dataKey="time" stroke="currentColor" className="text-tiny font-mono text-muted-foreground" tickLine={false} axisLine={false} />
                <YAxis stroke="currentColor" className="text-tiny font-mono text-muted-foreground" tickLine={false} axisLine={false} tickFormatter={(val) => `${val}°`} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-popover border border-border p-2.5 shadow-md text-xs font-mono">
                          <div className="font-semibold text-foreground">{data.time}</div>
                          <div className="text-primary font-bold">Ambient: {data.temp}°{unit}</div>
                          <div className="text-muted-foreground">Apparent: {data.feelsLike}°{unit}</div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area type="monotone" dataKey="temp" stroke="var(--primary)" strokeWidth={2} fillOpacity={1} fill="url(#chartTempGrad)" />
                <Line type="monotone" dataKey="feelsLike" stroke="currentColor" strokeOpacity={0.4} strokeDasharray="3 3" dot={false} strokeWidth={1.5} />
              </AreaChart>
            ) : metric === "precip" ? (
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" strokeOpacity={0.08} />
                <XAxis dataKey="time" stroke="currentColor" className="text-tiny font-mono text-muted-foreground" tickLine={false} axisLine={false} />
                <YAxis stroke="currentColor" className="text-tiny font-mono text-muted-foreground" domain={[0, 100]} tickLine={false} axisLine={false} tickFormatter={(val) => `${val}%`} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-popover border border-border p-2.5 shadow-md text-xs font-mono">
                          <div className="font-semibold text-foreground">{data.time}</div>
                          <div className="text-sky-500 font-bold">Precip Probability: {data.precip}%</div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="precip" fill="#0ea5e9" radius={0} />
              </BarChart>
            ) : metric === "wind" ? (
              <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" strokeOpacity={0.08} />
                <XAxis dataKey="time" stroke="currentColor" className="text-tiny font-mono text-muted-foreground" tickLine={false} axisLine={false} />
                <YAxis stroke="currentColor" className="text-tiny font-mono text-muted-foreground" tickLine={false} axisLine={false} tickFormatter={(val) => `${val}m/s`} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-popover border border-border p-2.5 shadow-md text-xs font-mono">
                          <div className="font-semibold text-foreground">{data.time}</div>
                          <div className="text-teal-500 font-bold">Wind Speed: {data.wind} m/s</div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Line type="monotone" dataKey="wind" stroke="#14b8a6" strokeWidth={2} dot={{ r: 3, fill: "#14b8a6" }} />
              </LineChart>
            ) : metric === "humidity" ? (
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="humidityGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" strokeOpacity={0.08} />
                <XAxis dataKey="time" stroke="currentColor" className="text-tiny font-mono text-muted-foreground" tickLine={false} axisLine={false} />
                <YAxis stroke="currentColor" className="text-tiny font-mono text-muted-foreground" tickLine={false} axisLine={false} tickFormatter={(val) => `${val}%`} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-popover border border-border p-2.5 shadow-md text-xs font-mono">
                          <div className="font-semibold text-foreground">{data.time}</div>
                          <div className="text-sky-500 font-bold">Relative Humidity: {data.humidity}%</div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area type="monotone" dataKey="humidity" stroke="#0ea5e9" strokeWidth={2} fillOpacity={1} fill="url(#humidityGradient)" />
              </AreaChart>
            ) : (
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" strokeOpacity={0.08} />
                <XAxis dataKey="time" stroke="currentColor" className="text-tiny font-mono text-muted-foreground" tickLine={false} axisLine={false} />
                <YAxis stroke="currentColor" className="text-tiny font-mono text-muted-foreground" domain={[0, 12]} tickLine={false} axisLine={false} tickFormatter={(val) => `UV ${val}`} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-popover border border-border p-2.5 shadow-md text-xs font-mono">
                          <div className="font-semibold text-foreground">{data.time}</div>
                          <div className="text-amber-500 font-bold">UV Radiation: {data.uv}</div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="uv" fill="#f59e0b" radius={0} />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
