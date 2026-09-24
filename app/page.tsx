"use client"

import React, { useCallback, useMemo } from "react"
import { WeatherHeader } from "@/components/weather-header"
import { WeatherHero } from "@/components/weather-hero"
import { HourlyForecast } from "@/components/hourly-forecast"
import { DailyForecast } from "@/components/daily-forecast"
import { WindWidget } from "@/components/widgets/wind-widget"
import { HumidityWidget } from "@/components/widgets/humidity-widget"
import { AirQualityWidget } from "@/components/widgets/air-quality-widget"
import { SolarWidget } from "@/components/widgets/solar-widget"
import { UvWidget } from "@/components/widgets/uv-widget"
import { PinnedLocations } from "@/components/pinned-locations"
import { EmbeddedRadarCard } from "@/components/embedded-radar-card"
import { InlineAlertBanner } from "@/components/inline-alert-banner"
import { InlineComparisonMatrix } from "@/components/inline-comparison-matrix"
import { WeatherChartsCard } from "@/components/weather-charts-card"
import { AirQualityDeepView } from "@/components/air-quality-deep-view"
import { ClimateNormalsCard } from "@/components/climate-normals-card"
import { SettingsDialog } from "@/components/settings-dialog"
import { AiAdvisorBanner } from "@/components/ai-advisor-banner"
import { AiAdvisorDialog } from "@/components/ai-advisor-dialog"
import { LanguageProvider } from "@/components/language-provider"
import { DisplayPreferencesProvider } from "@/components/display-preferences-provider"
import { getTranslation } from "@/lib/translations"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { STORAGE_KEYS } from "@/lib/constants"
import { formatPressure } from "@/lib/weather"
import {
  useSettings,
  usePinnedCities,
  useWeather,
  useUserLocation,
  useUrlSync,
  useScrollLock,
} from "@/hooks"
import {
  RefreshCw,
  Radio,
  LayoutGrid,
  TrendingUp,
  CloudRain,
  Sparkles,
  ArrowRightLeft,
  History,
} from "lucide-react"

export default function WeatherDashboardPage() {
  const { settings, unit, updateSettings, resetSettings } = useSettings()
  const {
    pinnedCities,
    isCityPinned,
    togglePinCity,
    addPinnedCity,
    removePinnedCity,
  } = usePinnedCities()

  const { detectUserLocation } = useUserLocation()

  const {
    weather,
    loading,
    setLoading,
    city,
    setCity,
    coords,
    setCoords,
    fetchWeather,
    refetch,
  } = useWeather({ settings })

  const onLocationChange = useCallback(
    async (target: {
      city?: string
      coords?: { lat: number; lon: number }
      fallbackToGeo?: boolean
    }) => {
      if (target.coords) {
        setCoords(target.coords)
        await fetchWeather(undefined, target.coords)
      } else if (target.city) {
        setCoords(null)
        setCity(target.city)
        await fetchWeather(target.city)
      } else if (target.fallbackToGeo) {
        setLoading(true)
        const loc = await detectUserLocation()
        if (loc) {
          setCoords(loc.coords)
          if (loc.city) setCity(loc.city)
          await fetchWeather(loc.city, loc.coords)
        } else {
          await fetchWeather()
        }
      }
    },
    [setCoords, setCity, fetchWeather, detectUserLocation, setLoading]
  )

  const onUnitRestore = useCallback(
    (urlUnit: "C" | "F") => {
      updateSettings({ tempUnit: urlUnit })
    },
    [updateSettings]
  )

  const {
    activeTab,
    handleTabChange,
    showSettings,
    handleOpenSettings,
    handleCloseSettings,
    settingsTab,
    handleSettingsTabChange,
    showAiAdvisor,
    handleOpenAiAdvisor,
    handleCloseAiAdvisor,
    showNotifications,
    handleNotificationsOpenChange,
    pushLocationUrl,
    buildCurrentUrl,
  } = useUrlSync({
    city,
    coords,
    onLocationChange,
    onUnitRestore,
  })

  // Lock background scroll completely when modal dialogs are open
  useScrollLock(showSettings || showAiAdvisor)

  // GPS Locate with URL update. If location request is denied, cascades to network location.
  const handleLocate = useCallback(async () => {
    setLoading(true)
    const loc = await detectUserLocation({ highAccuracy: true, timeout: 7000 })
    if (loc) {
      setCoords(loc.coords)
      if (loc.city) setCity(loc.city)
      await fetchWeather(loc.city, loc.coords)
      pushLocationUrl({ coords: loc.coords, city: loc.city || null })
    } else if (city) {
      await fetchWeather(city)
    } else {
      setLoading(false)
    }
  }, [detectUserLocation, setLoading, setCoords, setCity, fetchWeather, pushLocationUrl, city])

  // User Actions: City selection with URL history push
  const handleSelectCity = useCallback(
    (newCity: string) => {
      setCoords(null)
      setCity(newCity)
      try {
        localStorage.setItem(STORAGE_KEYS.LAST_CITY, newCity)
        localStorage.setItem(STORAGE_KEYS.USER_SEARCHED, "true")
      } catch {}
      fetchWeather(newCity, undefined)
      // Close the settings dialog first (replaces its history entry), then push
      // the new location with dialog params explicitly cleared. pushLocationUrl
      // would otherwise read the stale `showSettings` state from its closure and
      // bake `dialog=settings` into the pushed entry, so Back would reopen it.
      handleCloseSettings()
      if (typeof window !== "undefined") {
        const nextUrl = buildCurrentUrl({
          city: newCity,
          coords: null,
          dialog: null,
          settingsTab: null,
        })
        window.history.pushState({ city: newCity, coords: null }, "", nextUrl)
      }
    },
    [setCoords, setCity, fetchWeather, handleCloseSettings, buildCurrentUrl]
  )

  // Home navigation resets tabs and returns to user detected position
  const handleHome = useCallback(async () => {
    handleTabChange("overview")
    handleCloseSettings()
    handleCloseAiAdvisor()
    handleNotificationsOpenChange(false)
    try {
      localStorage.removeItem(STORAGE_KEYS.USER_SEARCHED)
      localStorage.removeItem(STORAGE_KEYS.LAST_CITY)
    } catch {}
    if (typeof window !== "undefined") {
      window.history.pushState(null, "", "/")
    }
    setLoading(true)
    const loc = await detectUserLocation()
    if (loc) {
      setCoords(loc.coords)
      if (loc.city) setCity(loc.city)
      await fetchWeather(loc.city, loc.coords)
    } else {
      await fetchWeather()
    }
  }, [
    handleTabChange,
    handleCloseSettings,
    handleCloseAiAdvisor,
    handleNotificationsOpenChange,
    setLoading,
    detectUserLocation,
    setCoords,
    setCity,
    fetchWeather,
  ])

  const isPinned = weather ? isCityPinned(weather.current.cityName) : false
  const t = getTranslation(settings.language || "en")

  const displayPreferences = useMemo(
    () => ({
      windUnit: settings.windUnit,
      pressureUnit: settings.pressureUnit,
      precipUnit: settings.precipUnit,
      timeFormat: settings.timeFormat,
      dateFormat: settings.dateFormat,
      coordinateFormat: settings.coordinateFormat,
      language: settings.language || "en",
    }),
    [
      settings.windUnit,
      settings.pressureUnit,
      settings.precipUnit,
      settings.timeFormat,
      settings.dateFormat,
      settings.coordinateFormat,
      settings.language,
    ]
  )
  const referencePressure = formatPressure(1013.25, settings.pressureUnit)

  return (
    <LanguageProvider language={settings.language || "en"}>
      <DisplayPreferencesProvider preferences={displayPreferences}>
      <div className="flex min-h-screen flex-col bg-background text-foreground transition-colors duration-150">
        <WeatherHeader
          onSearch={handleSelectCity}
          onLocate={handleLocate}
          onHome={handleHome}
          onOpenAiAdvisor={handleOpenAiAdvisor}
          onChangeStation={() => handleOpenSettings("source")}
          onOpenSettings={handleOpenSettings}
          showNotifications={showNotifications}
          onNotificationsOpenChange={handleNotificationsOpenChange}
          current={weather?.current}
          daily={weather?.daily}
          hourly={weather?.hourly}
          alerts={weather?.alerts}
          unit={unit}
          settings={settings}
          isLoading={loading}
        />

        <main className="mx-auto w-full max-w-7xl flex-1 space-y-4 px-4 py-4 sm:px-6 lg:px-8">
          {/* Status Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-2.5 font-mono text-xs text-muted-foreground">
            <div className="flex flex-wrap items-center gap-2">
              <span className="size-2 shrink-0 animate-pulse bg-emerald-500" />
              <span className="font-semibold text-foreground uppercase">
                {t.common.stationTelemetryActive}
              </span>
              <span>•</span>
              <button
                type="button"
                onClick={() => handleOpenSettings("source")}
                className="group inline-flex cursor-pointer items-center gap-1.5 text-left uppercase transition-colors hover:text-foreground"
                title="Click to choose weather data source & forecast station"
              >
                <span className="text-muted-foreground group-hover:text-foreground">
                  {t.common.source}:{" "}
                  <strong className="text-foreground">
                    {weather?.providerName ||
                      (weather?.dataSource === "LIVE_API"
                        ? "Open-Meteo"
                        : "Simulated Sensor")}
                  </strong>
                  {weather?.stationName && (
                    <span className="ml-1 font-semibold text-primary">
                      [{weather.stationName}]
                    </span>
                  )}
                </span>
                <span className="border border-primary/30 bg-primary/10 px-1.5 py-0.5 font-mono text-[10px] font-bold text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  {t.common.change}
                </span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="xs"
                onClick={refetch}
                disabled={loading}
                className="gap-1.5 font-mono text-xs"
              >
                <RefreshCw
                  className={`size-3 ${loading ? "animate-spin text-primary" : ""}`}
                />
                <span>{t.common.refresh}</span>
              </Button>
              <Badge variant="outline" className="font-mono text-tiny">
                <Radio className="mr-1 size-2.5 text-primary" />
                {referencePressure.val} {referencePressure.unitStr}
              </Badge>
            </div>
          </div>

          {/* Inline Active Weather Advisories Banner */}
          {weather && !loading && (
            <InlineAlertBanner
              current={weather.current}
              alerts={weather.alerts}
            />
          )}

          {/* MSN Weather Navigation Tabs */}
          <Tabs
            value={activeTab}
            onValueChange={handleTabChange}
            className="w-full space-y-4"
          >
            <TabsList className="w-full scrollbar-none justify-start overflow-x-auto overflow-y-hidden border-b border-border bg-transparent p-0 [&::-webkit-scrollbar]:hidden">
              <TabsTrigger
                value="overview"
                className="gap-1.5 rounded-none border-b-2 border-transparent px-3 font-heading text-xs font-medium data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground"
              >
                <LayoutGrid className="size-3.5" />
                <span>{t.tabs.overview}</span>
              </TabsTrigger>
              <TabsTrigger
                value="charts"
                className="gap-1.5 rounded-none border-b-2 border-transparent px-3 font-heading text-xs font-medium data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground"
              >
                <TrendingUp className="size-3.5" />
                <span>{t.tabs.charts}</span>
              </TabsTrigger>
              <TabsTrigger
                value="radar"
                className="gap-1.5 rounded-none border-b-2 border-transparent px-3 font-heading text-xs font-medium data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground"
              >
                <CloudRain className="size-3.5" />
                <span>{t.tabs.radar}</span>
              </TabsTrigger>
              <TabsTrigger
                value="air-quality"
                className="gap-1.5 rounded-none border-b-2 border-transparent px-3 font-heading text-xs font-medium data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground"
              >
                <Sparkles className="size-3.5" />
                <span>{t.tabs.airQuality}</span>
              </TabsTrigger>
              <TabsTrigger
                value="climate"
                className="gap-1.5 rounded-none border-b-2 border-transparent px-3 font-heading text-xs font-medium data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground"
              >
                <History className="size-3.5" />
                <span>{t.tabs.climate}</span>
              </TabsTrigger>
              <TabsTrigger
                value="compare"
                className="gap-1.5 rounded-none border-b-2 border-transparent px-3 font-heading text-xs font-medium data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground"
              >
                <ArrowRightLeft className="size-3.5" />
                <span>{t.tabs.compare}</span>
              </TabsTrigger>
            </TabsList>

            {/* TAB 1: OVERVIEW */}
            <TabsContent
              value="overview"
              className="space-y-4 focus-visible:outline-none"
            >
              {/* Hero Current Conditions */}
              {weather && !loading ? (
                <WeatherHero
                  current={weather.current}
                  unit={unit}
                  isPinned={isPinned}
                  onTogglePin={() => togglePinCity(weather.current.cityName)}
                />
              ) : (
                <Skeleton className="h-72 w-full" />
              )}

              {/* AI Synoptic Intelligence & Sudden Alert Advisor */}
              {weather && !loading && (
                <AiAdvisorBanner
                  current={weather.current}
                  hourly={weather.hourly}
                  daily={weather.daily}
                  unit={unit}
                  onOpenDetailedAi={handleOpenAiAdvisor}
                />
              )}

              {/* Hourly Trajectory Sequence */}
              {weather && !loading ? (
                <HourlyForecast hourly={weather.hourly} unit={unit} />
              ) : (
                <Skeleton className="h-44 w-full" />
              )}

              {/* Embedded Live Doppler Radar Card */}
              {weather && !loading && (
                <EmbeddedRadarCard
                  lat={weather.current.lat}
                  lon={weather.current.lon}
                  cityName={weather.current.cityName}
                  heightClass="h-[340px]"
                  onExpand={() => handleTabChange("radar")}
                />
              )}

              {/* Multi-Metric Progression Graph */}
              {weather && !loading ? (
                <WeatherChartsCard hourly={weather.hourly} unit={unit} />
              ) : (
                <Skeleton className="h-64 w-full" />
              )}

              {/* Bento Grid: 10-day outlook + atmospheric sensors */}
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                {/* Left 2 Cols: 10-day Forecast */}
                <div className="lg:col-span-2">
                  {weather && !loading ? (
                    <DailyForecast daily={weather.daily} unit={unit} />
                  ) : (
                    <Skeleton className="h-96 w-full" />
                  )}
                </div>

                {/* Right 1 Col: Telemetry widgets */}
                <div className="space-y-4">
                  {weather && !loading ? (
                    <>
                      <UvWidget
                        uvIndex={weather.current.uvIndex}
                        uvMax={weather.daily[0]?.uvIndexMax}
                      />
                      <WindWidget
                        speed={weather.current.windSpeed}
                        deg={weather.current.windDeg}
                      />
                      <HumidityWidget
                        humidity={weather.current.humidity}
                        tempC={weather.current.temp}
                        unit={unit}
                      />
                      <AirQualityWidget airQuality={weather.current.airQuality} />
                      <SolarWidget
                        sunrise={weather.current.sunrise}
                        sunset={weather.current.sunset}
                        currentDt={weather.current.dt}
                        moon={weather.current.moon}
                      />
                    </>
                  ) : (
                    <Skeleton className="h-96 w-full" />
                  )}
                </div>
              </div>

              {/* Pinned Locations */}
              <PinnedLocations
                pinnedCities={pinnedCities}
                unit={unit}
                onSelectCity={handleSelectCity}
                onUnpinCity={removePinnedCity}
              />
            </TabsContent>

            {/* TAB 2: GRAPHS & TRENDS */}
            <TabsContent
              value="charts"
              className="space-y-4 focus-visible:outline-none"
            >
              {weather && !loading ? (
                <>
                  <WeatherChartsCard hourly={weather.hourly} unit={unit} />
                  <HourlyForecast hourly={weather.hourly} unit={unit} />
                  <ClimateNormalsCard
                    lat={weather.current.lat}
                    lon={weather.current.lon}
                    currentTemp={weather.current.temp}
                    unit={unit}
                  />
                  <DailyForecast daily={weather.daily} unit={unit} />
                </>
              ) : (
                <Skeleton className="h-96 w-full" />
              )}
            </TabsContent>

            {/* TAB 3: RADAR & SATELLITE */}
            <TabsContent
              value="radar"
              className="space-y-4 focus-visible:outline-none"
            >
              {weather && !loading ? (
                <>
                  <EmbeddedRadarCard
                    lat={weather.current.lat}
                    lon={weather.current.lon}
                    cityName={weather.current.cityName}
                    heightClass="h-[560px]"
                  />
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <WindWidget
                      speed={weather.current.windSpeed}
                      deg={weather.current.windDeg}
                    />
                    <HumidityWidget
                      humidity={weather.current.humidity}
                      tempC={weather.current.temp}
                      unit={unit}
                    />
                  </div>
                </>
              ) : (
                <Skeleton className="h-140 w-full" />
              )}
            </TabsContent>

            {/* TAB 4: AIR QUALITY & HEALTH */}
            <TabsContent
              value="air-quality"
              className="space-y-4 focus-visible:outline-none"
            >
              {weather && !loading ? (
                <AirQualityDeepView airQuality={weather.current.airQuality} />
              ) : (
                <Skeleton className="h-96 w-full" />
              )}
            </TabsContent>

            {/* TAB 5: HISTORICAL & CLIMATE */}
            <TabsContent
              value="climate"
              className="space-y-4 focus-visible:outline-none"
            >
              {weather && !loading ? (
                <>
                  <ClimateNormalsCard
                    lat={weather.current.lat}
                    lon={weather.current.lon}
                    currentTemp={weather.current.temp}
                    unit={unit}
                  />
                  <DailyForecast daily={weather.daily} unit={unit} />
                </>
              ) : (
                <Skeleton className="h-96 w-full" />
              )}
            </TabsContent>

            {/* TAB 6: STATION COMPARISON */}
            <TabsContent
              value="compare"
              className="space-y-4 focus-visible:outline-none"
            >
              {weather && !loading ? (
                <>
                  <InlineComparisonMatrix
                    baseCurrent={weather.current}
                    unit={unit}
                    onSwitchCity={handleSelectCity}
                  />
                  <PinnedLocations
                    pinnedCities={pinnedCities}
                    unit={unit}
                    onSelectCity={handleSelectCity}
                    onUnpinCity={removePinnedCity}
                  />
                </>
              ) : (
                <Skeleton className="h-96 w-full" />
              )}
            </TabsContent>
          </Tabs>
        </main>

        {/* AI Synoptic Advisor Interactive Dialog */}
        {weather && (
          <AiAdvisorDialog
            open={showAiAdvisor}
            onOpenChange={(open) => {
              if (open) {
                handleOpenAiAdvisor()
              } else {
                handleCloseAiAdvisor()
              }
            }}
            current={weather.current}
            hourly={weather.hourly}
            daily={weather.daily}
            unit={unit}
          />
        )}

        {/* Extended Station & Application Preferences Dialog */}
        <SettingsDialog
          open={showSettings}
          onOpenChange={(open) => {
            if (open) {
              handleOpenSettings()
            } else {
              handleCloseSettings()
            }
          }}
          activeTab={settingsTab}
          onActiveTabChange={handleSettingsTabChange}
          settings={settings}
          onUpdateSettings={updateSettings}
          onResetSettings={resetSettings}
          pinnedCities={pinnedCities}
          onAddPinnedCity={addPinnedCity}
          onRemovePinnedCity={removePinnedCity}
          onSelectCity={handleSelectCity}
          currentTemp={weather?.current?.temp}
          city={city}
          coords={
            coords ??
            (weather?.current
              ? { lat: weather.current.lat, lon: weather.current.lon }
              : null)
          }
        />

        {/* Footer */}
        <footer className="space-y-1 border-t border-border px-4 py-6 text-center font-mono text-xs text-muted-foreground">
          <p>OpenWeather Precision Meteorological Console</p>
        </footer>
      </div>
      </DisplayPreferencesProvider>
    </LanguageProvider>
  )
}
