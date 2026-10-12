"use client"

import { useState } from "react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { HourlyForecast } from "@/components/hourly-forecast"
import { DailyForecast } from "@/components/daily-forecast"
import { useTranslation } from "@/components/language-provider"
import type { DailyForecastItem, HourlyForecastItem } from "@/lib/weather"

interface ForecastTabsProps {
  hourly: HourlyForecastItem[]
  daily: DailyForecastItem[]
  unit: "C" | "F"
}

/** Hourly trajectory and the 10-day outlook in one slot; the tab switch sits in each card's header. */
export function ForecastTabs({ hourly, daily, unit }: ForecastTabsProps) {
  const { t } = useTranslation()
  const [tab, setTab] = useState("hourly")
  const tabs = (
    <TabsList>
      <TabsTrigger value="hourly">{t.forecast.oneHourPrecision}</TabsTrigger>
      <TabsTrigger value="daily">{t.forecast.tenDayOutlook}</TabsTrigger>
    </TabsList>
  )
  // Both stay mounted so each keeps its own 24H/48H and curve choices when switching.
  return (
    <Tabs value={tab} onValueChange={setTab} className="w-full">
      <div hidden={tab !== "hourly"}>
        <HourlyForecast hourly={hourly} unit={unit} tabs={tabs} />
      </div>
      <div hidden={tab !== "daily"}>
        <DailyForecast daily={daily} unit={unit} tabs={tabs} />
      </div>
    </Tabs>
  )
}
