"use client";

import React, { useState, useEffect } from "react";
import NumberFlow from "@number-flow/react";
import {
  History,
  TrendingUp,
  TrendingDown,
  ArrowUp,
  ArrowDown,
  CloudRain,
  Calendar,
  Sparkles,
  BarChart3,
} from "lucide-react";
import {
  AreaChart,
  Area,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { Card, CardHeader, CardTitle, CardDescription, CardAction, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatTemperature } from "@/lib/weather";

interface ClimateRecord {
  temp: number;
  year: string;
}

interface MonthlyAverage {
  month: string;
  avgHigh: number;
  avgLow: number;
  avgRainfall: number;
}

interface ClimateData {
  date: string;
  monthName: string;
  sampleYears: number;
  avgHigh: number;
  avgLow: number;
  avgPrecipitation: number;
  recordHigh: ClimateRecord;
  recordLow: ClimateRecord;
  monthlyAverages: MonthlyAverage[];
}

interface ClimateNormalsCardProps {
  lat: number;
  lon: number;
  currentTemp: number;
  unit: "C" | "F";
}

export function ClimateNormalsCard({
  lat,
  lon,
  currentTemp,
  unit,
}: ClimateNormalsCardProps) {
  const [data, setData] = useState<ClimateData | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"daily" | "annual">("daily");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    fetch(`/api/climate?lat=${lat}&lon=${lon}`)
      .then((res) => res.json())
      .then((json) => {
        if (!cancelled) {
          setData(json);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.warn("Failed to load climate data", err);
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [lat, lon]);

  if (loading || !data) {
    return (
      <Card className="w-full">
        <CardHeader className="border-b border-border pb-3">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-4 w-72 mt-1" />
        </CardHeader>
        <CardContent className="pt-4">
          <Skeleton className="h-48 w-full" />
        </CardContent>
      </Card>
    );
  }

  const dispCurrent = formatTemperature(currentTemp, unit);
  const dispAvgHigh = formatTemperature(data.avgHigh, unit);
  const dispAvgLow = formatTemperature(data.avgLow, unit);
  const dispRecHigh = formatTemperature(data.recordHigh.temp, unit);
  const dispRecLow = formatTemperature(data.recordLow.temp, unit);

  // Departure from normal average high
  const anomaly = currentTemp - data.avgHigh;
  const isAboveNormal = anomaly >= 0;
  const dispAnomaly = Math.abs(Math.round(anomaly * 10) / 10);

  const chartData = data.monthlyAverages.map((m) => ({
    month: m.month,
    high: formatTemperature(m.avgHigh, unit),
    low: formatTemperature(m.avgLow, unit),
    rainfall: m.avgRainfall,
  }));

  return (
    <Card className="w-full">
      <CardHeader className="border-b border-border pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <History className="size-3.5 text-primary" />
            <CardTitle className="text-sm font-heading font-semibold tracking-tight">
              Historical Climate & Normals
            </CardTitle>
            <Badge variant="outline" className="font-mono text-tiny">
              {data.sampleYears}-Year Baseline
            </Badge>
          </div>
          <CardDescription className="text-xs">
            Climatological benchmark against historical observations for {data.date}
          </CardDescription>
        </div>

        <CardAction className="flex items-center gap-1.5">
          <div className="flex items-center border border-border p-0.5 text-xs font-mono">
            <Button
              variant={viewMode === "daily" ? "default" : "ghost"}
              size="xs"
              onClick={() => setViewMode("daily")}
              className="h-6 px-2 font-mono text-tiny"
            >
              Today's Delta
            </Button>
            <Button
              variant={viewMode === "annual" ? "default" : "ghost"}
              size="xs"
              onClick={() => setViewMode("annual")}
              className="h-6 px-2 font-mono text-tiny"
            >
              12-Month Cycle
            </Button>
          </div>
        </CardAction>
      </CardHeader>

      <CardContent className="pt-4 space-y-4">
        {viewMode === "daily" ? (
          <>
            {/* Climatological Comparison Banner */}
            <div className="p-3 bg-muted/20 border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div
                  className={`size-9 border border-border flex items-center justify-center shrink-0 ${
                    isAboveNormal
                      ? "bg-amber-500/10 text-amber-500"
                      : "bg-sky-500/10 text-sky-500"
                  }`}
                >
                  {isAboveNormal ? (
                    <TrendingUp className="size-4" />
                  ) : (
                    <TrendingDown className="size-4" />
                  )}
                </div>

                <div>
                  <div className="text-xs font-mono text-muted-foreground uppercase">
                    Thermal Departure from Normal
                  </div>
                  <div className="text-base font-heading font-bold text-foreground flex items-center gap-1.5">
                    <span>
                      {isAboveNormal ? "+" : "-"}
                      {dispAnomaly}°{unit}
                    </span>
                    <Badge
                      variant="outline"
                      className={`text-tiny font-mono ${
                        isAboveNormal ? "text-amber-500" : "text-sky-500"
                      }`}
                    >
                      {isAboveNormal ? "Above Climate Normal" : "Below Climate Normal"}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="text-right sm:border-l sm:border-border sm:pl-4">
                <div className="text-tiny font-mono text-muted-foreground uppercase">
                  Current vs Expected
                </div>
                <div className="text-xs font-mono font-semibold text-foreground">
                  Observed <span className="text-primary font-bold">{dispCurrent}°{unit}</span> | Avg High{" "}
                  <span className="text-foreground">{dispAvgHigh}°{unit}</span>
                </div>
              </div>
            </div>

            {/* 4-Box Historical Records Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 text-xs font-mono">
              <div className="p-2.5 bg-muted/20 border border-border">
                <span className="text-micro text-muted-foreground uppercase block mb-1">
                  Historical Average High
                </span>
                <div className="flex items-center gap-1 text-base font-bold text-foreground">
                  <ArrowUp className="size-3 text-amber-500" />
                  <span>{dispAvgHigh}°{unit}</span>
                </div>
                <span className="text-micro text-muted-foreground">30-day baseline</span>
              </div>

              <div className="p-2.5 bg-muted/20 border border-border">
                <span className="text-micro text-muted-foreground uppercase block mb-1">
                  Historical Average Low
                </span>
                <div className="flex items-center gap-1 text-base font-bold text-foreground">
                  <ArrowDown className="size-3 text-sky-500" />
                  <span>{dispAvgLow}°{unit}</span>
                </div>
                <span className="text-micro text-muted-foreground">diurnal minimum</span>
              </div>

              <div className="p-2.5 bg-muted/20 border border-border">
                <span className="text-micro text-muted-foreground uppercase block mb-1">
                  All-Time Record High
                </span>
                <div className="flex items-center gap-1 text-base font-bold text-rose-500">
                  <ArrowUp className="size-3 text-rose-500" />
                  <span>{dispRecHigh}°{unit}</span>
                </div>
                <span className="text-micro text-muted-foreground">
                  Recorded in {data.recordHigh.year}
                </span>
              </div>

              <div className="p-2.5 bg-muted/20 border border-border">
                <span className="text-micro text-muted-foreground uppercase block mb-1">
                  All-Time Record Low
                </span>
                <div className="flex items-center gap-1 text-base font-bold text-indigo-400">
                  <ArrowDown className="size-3 text-indigo-400" />
                  <span>{dispRecLow}°{unit}</span>
                </div>
                <span className="text-micro text-muted-foreground">
                  Recorded in {data.recordLow.year}
                </span>
              </div>
            </div>
          </>
        ) : (
          <div className="space-y-3">
            <div className="flex justify-between items-center text-xs font-mono text-muted-foreground px-1">
              <span>Annual Thermal & Precipitation Normal Curve</span>
              <span className="text-tiny">Highs vs Lows (°{unit})</span>
            </div>

            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="climateHighGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="var(--primary)" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" strokeOpacity={0.08} />
                  <XAxis dataKey="month" stroke="currentColor" className="text-tiny font-mono text-muted-foreground" tickLine={false} axisLine={false} />
                  <YAxis stroke="currentColor" className="text-tiny font-mono text-muted-foreground" tickLine={false} axisLine={false} tickFormatter={(val) => `${val}°`} />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const d = payload[0].payload;
                        return (
                          <div className="bg-popover border border-border p-2.5 shadow-md text-xs font-mono">
                            <div className="font-semibold text-foreground">{d.month}</div>
                            <div className="text-amber-500">Normal High: {d.high}°{unit}</div>
                            <div className="text-sky-500">Normal Low: {d.low}°{unit}</div>
                            <div className="text-muted-foreground text-tiny">Monthly Rainfall: ~{d.rainfall} mm</div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Area type="monotone" dataKey="high" stroke="var(--primary)" strokeWidth={2} fillOpacity={1} fill="url(#climateHighGrad)" />
                  <Line type="monotone" dataKey="low" stroke="#0ea5e9" strokeWidth={2} dot={{ r: 2 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
