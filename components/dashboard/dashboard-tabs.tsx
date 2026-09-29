"use client"

import type React from "react"
import dynamic from "next/dynamic"
import {
  LayoutGrid,
  TrendingUp,
  CloudRain,
  Sparkles,
  ArrowRightLeft,
  History,
} from "lucide-react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { WeatherHero } from "@/components/weather-hero"
import { DailyForecast } from "@/components/daily-forecast"
import { WindWidget } from "@/components/widgets/wind-widget"
import { HumidityWidget } from "@/components/widgets/humidity-widget"
import { AirQualityWidget } from "@/components/widgets/air-quality-widget"
import { SolarWidget } from "@/components/widgets/solar-widget"
import { UvWidget } from "@/components/widgets/uv-widget"
import { PinnedLocations } from "@/components/pinned-locations"
import { EmbeddedRadarCard } from "@/components/embedded-radar-card"
import { AiAdvisorBanner } from "@/components/ai-advisor-banner"
import { useTranslation } from "@/components/language-provider"
import type { WeatherData } from "@/lib/weather"
import type { AppTab } from "@/lib/constants"

// Code-split: recharts (charts, hourly, climate) and the secondary tabs are
// large and not needed for first paint; weather data takes longer than these chunks.
const cardFallback = () => <Skeleton className="h-64 w-full" />
const HourlyForecast = dynamic(
  () => import("@/components/hourly-forecast").then((m) => m.HourlyForecast),
  { loading: cardFallback }
)
const WeatherChartsCard = dynamic(
  () =>
    import("@/components/weather-charts-card").then((m) => m.WeatherChartsCard),
  { loading: cardFallback }
)
const InlineComparisonMatrix = dynamic(
  () =>
    import("@/components/inline-comparison-matrix").then(
      (m) => m.InlineComparisonMatrix
    ),
  { loading: cardFallback }
)
const AirQualityDeepView = dynamic(
  () =>
    import("@/components/air-quality-deep-view").then(
      (m) => m.AirQualityDeepView
    ),
  { loading: cardFallback }
)
const ClimateNormalsCard = dynamic(
  () =>
    import("@/components/climate-normals-card").then(
      (m) => m.ClimateNormalsCard
    ),
  { loading: cardFallback }
)

const TABS = [
  { value: "overview", icon: LayoutGrid },
  { value: "charts", icon: TrendingUp },
  { value: "radar", icon: CloudRain },
  { value: "air-quality", icon: Sparkles },
  { value: "climate", icon: History },
  { value: "compare", icon: ArrowRightLeft },
] as const

const TAB_LABEL_KEY = {
  overview: "overview",
  charts: "charts",
  radar: "radar",
  "air-quality": "airQuality",
  climate: "climate",
  compare: "compare",
} as const

interface DashboardTabsProps {
  /** null while loading: sections render skeletons. */
  weather: WeatherData | null
  unit: "C" | "F"
  activeTab: AppTab
  onTabChange: (tab: AppTab) => void
  isPinned: boolean
  onTogglePin: () => void
  onOpenAiAdvisor: () => void
  onSelectCity: (city: string) => void
  pinnedCities: string[]
  onUnpinCity: (city: string) => void
  customCartoApiKey?: string
}

export function DashboardTabs({
  weather,
  unit,
  activeTab,
  onTabChange,
  isPinned,
  onTogglePin,
  onOpenAiAdvisor,
  onSelectCity,
  pinnedCities,
  onUnpinCity,
  customCartoApiKey,
}: DashboardTabsProps) {
  const { t } = useTranslation()

  /** Renders a section once data is ready, a skeleton of `height` before (or nothing). */
  const section = (
    render: (w: WeatherData) => React.ReactNode,
    height?: string
  ) =>
    weather ? (
      render(weather)
    ) : height ? (
      <Skeleton className={`${height} w-full`} />
    ) : null

  const pinned = (
    <PinnedLocations
      pinnedCities={pinnedCities}
      unit={unit}
      onSelectCity={onSelectCity}
      onUnpinCity={onUnpinCity}
    />
  )

  return (
    <Tabs
      value={activeTab}
      onValueChange={(value) => onTabChange(value as AppTab)}
      className="w-full space-y-4"
    >
      <TabsList className="w-full justify-start overflow-x-auto overflow-y-hidden">
        {TABS.map(({ value, icon: Icon }) => (
          <TabsTrigger key={value} value={value} className="gap-1.5">
            <Icon className="size-3.5" />
            <span>{t.tabs[TAB_LABEL_KEY[value]]}</span>
          </TabsTrigger>
        ))}
      </TabsList>

      <TabsContent value="overview" className="space-y-4">
        {section(
          (w) => (
            <WeatherHero
              current={w.current}
              unit={unit}
              isPinned={isPinned}
              onTogglePin={onTogglePin}
            />
          ),
          "h-72"
        )}
        {section((w) => (
          <AiAdvisorBanner
            current={w.current}
            hourly={w.hourly}
            daily={w.daily}
            unit={unit}
            onOpenDetailedAi={onOpenAiAdvisor}
          />
        ))}
        {section(
          (w) => (
            <HourlyForecast hourly={w.hourly} unit={unit} />
          ),
          "h-44"
        )}
        {section((w) => (
          <EmbeddedRadarCard
            lat={w.current.lat}
            lon={w.current.lon}
            cityName={w.current.cityName}
            heightClass="h-[340px]"
            onExpand={() => onTabChange("radar")}
            customCartoApiKey={customCartoApiKey}
          />
        ))}
        {section(
          (w) => (
            <WeatherChartsCard hourly={w.hourly} unit={unit} />
          ),
          "h-64"
        )}

        {/* Bento grid: 10-day outlook + atmospheric sensors */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2">
            {section(
              (w) => (
                <DailyForecast daily={w.daily} unit={unit} />
              ),
              "h-96"
            )}
          </div>
          <div className="space-y-4">
            {section(
              (w) => (
                <>
                  <UvWidget
                    uvIndex={w.current.uvIndex}
                    uvMax={w.daily[0]?.uvIndexMax}
                  />
                  <WindWidget
                    speed={w.current.windSpeed}
                    deg={w.current.windDeg}
                  />
                  <HumidityWidget
                    humidity={w.current.humidity}
                    tempC={w.current.temp}
                    unit={unit}
                  />
                  <AirQualityWidget airQuality={w.current.airQuality} />
                  <SolarWidget
                    sunrise={w.current.sunrise}
                    sunset={w.current.sunset}
                    currentDt={w.current.dt}
                    moon={w.current.moon}
                  />
                </>
              ),
              "h-96"
            )}
          </div>
        </div>

        {pinned}
      </TabsContent>

      <TabsContent
        value="charts"
        className="space-y-4 focus-visible:outline-none"
      >
        {section(
          (w) => (
            <>
              <WeatherChartsCard hourly={w.hourly} unit={unit} />
              <HourlyForecast hourly={w.hourly} unit={unit} />
              <ClimateNormalsCard
                lat={w.current.lat}
                lon={w.current.lon}
                currentTemp={w.current.temp}
                unit={unit}
              />
              <DailyForecast daily={w.daily} unit={unit} />
            </>
          ),
          "h-96"
        )}
      </TabsContent>

      <TabsContent
        value="radar"
        className="space-y-4 focus-visible:outline-none"
      >
        {section(
          (w) => (
            <>
              <EmbeddedRadarCard
                lat={w.current.lat}
                lon={w.current.lon}
                cityName={w.current.cityName}
                heightClass="h-[60svh] min-h-80 md:h-[560px]"
                customCartoApiKey={customCartoApiKey}
              />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <WindWidget
                  speed={w.current.windSpeed}
                  deg={w.current.windDeg}
                />
                <HumidityWidget
                  humidity={w.current.humidity}
                  tempC={w.current.temp}
                  unit={unit}
                />
              </div>
            </>
          ),
          "h-140"
        )}
      </TabsContent>

      <TabsContent
        value="air-quality"
        className="space-y-4 focus-visible:outline-none"
      >
        {section(
          (w) => (
            <AirQualityDeepView airQuality={w.current.airQuality} />
          ),
          "h-96"
        )}
      </TabsContent>

      <TabsContent
        value="climate"
        className="space-y-4 focus-visible:outline-none"
      >
        {section(
          (w) => (
            <>
              <ClimateNormalsCard
                lat={w.current.lat}
                lon={w.current.lon}
                currentTemp={w.current.temp}
                unit={unit}
              />
              <DailyForecast daily={w.daily} unit={unit} />
            </>
          ),
          "h-96"
        )}
      </TabsContent>

      <TabsContent
        value="compare"
        className="space-y-4 focus-visible:outline-none"
      >
        {section(
          (w) => (
            <>
              <InlineComparisonMatrix
                baseCurrent={w.current}
                unit={unit}
                onSwitchCity={onSelectCity}
              />
              {pinned}
            </>
          ),
          "h-96"
        )}
      </TabsContent>
    </Tabs>
  )
}
