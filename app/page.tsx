"use client"

import React, { useCallback, useMemo, useRef } from "react"
import dynamic from "next/dynamic"
import { WeatherHeader } from "@/components/weather-header"
import { InlineAlertBanner } from "@/components/inline-alert-banner"
import {
  LanguageProvider,
  useActiveLocale,
} from "@/components/language-provider"
import { DisplayPreferencesProvider } from "@/components/display-preferences-provider"
import { getTranslation } from "@/lib/translations"
import { Button } from "@/components/ui/button"
import { STORAGE_KEYS } from "@/lib/constants"
import {
  useSettings,
  usePinnedCities,
  useWeather,
  useUserLocation,
  useUrlSync,
  useScrollLock,
  useOnlineStatus,
} from "@/hooks"
import { RefreshCw, CloudOff, MapPinOff, WifiOff, X } from "lucide-react"
import { EmptyState } from "@/components/empty-state"
import { StatusBar } from "@/components/dashboard/status-bar"
import { DashboardTabs } from "@/components/dashboard/dashboard-tabs"
import {
  Alert,
  AlertTitle,
  AlertDescription,
  AlertAction,
} from "@/components/ui/alert"

// Code-split: the dialogs are large and not needed for first paint.
const SettingsDialog = dynamic(() =>
  import("@/components/settings-dialog").then((m) => m.SettingsDialog)
)
const AiAdvisorDialog = dynamic(() =>
  import("@/components/ai-advisor-dialog").then((m) => m.AiAdvisorDialog)
)

export default function WeatherDashboardPage() {
  const { settings, unit, updateSettings, resetSettings } = useSettings()
  const {
    pinnedCities,
    isCityPinned,
    togglePinCity,
    addPinnedCity,
    removePinnedCity,
  } = usePinnedCities()

  const { detectUserLocation, locationError, clearLocationError } =
    useUserLocation({
      language: settings.language,
    })

  // Each location change bumps this id. A geolocation lookup can take seconds
  // (permission prompt), so its result is dropped if the user picked another
  // location in the meantime.
  const locationRequestRef = useRef(0)
  const online = useOnlineStatus()

  const {
    weather,
    loading,
    error,
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
      const requestId = ++locationRequestRef.current
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
        if (requestId !== locationRequestRef.current) return
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

  // Lock background scroll while settings or the AI advisor panel is open
  useScrollLock(showSettings || showAiAdvisor)

  // GPS Locate with URL update. If location request is denied, cascades to network location.
  const handleLocate = useCallback(async () => {
    const requestId = ++locationRequestRef.current
    setLoading(true)
    const loc = await detectUserLocation({ highAccuracy: true, timeout: 7000 })
    if (requestId !== locationRequestRef.current) return
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
  }, [
    detectUserLocation,
    setLoading,
    setCoords,
    setCity,
    fetchWeather,
    pushLocationUrl,
    city,
  ])

  // User Actions: City selection with URL history push
  const handleSelectCity = useCallback(
    (newCity: string) => {
      locationRequestRef.current++
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
    const requestId = ++locationRequestRef.current
    setLoading(true)
    const loc = await detectUserLocation()
    if (requestId !== locationRequestRef.current) return
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
  const t = getTranslation(useActiveLocale(settings.language || "en"))

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

  return (
    <LanguageProvider language={settings.language || "en"}>
      <DisplayPreferencesProvider preferences={displayPreferences}>
        <div className="flex min-h-screen flex-col text-foreground transition-all ease-in-out">
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
            onUnitChange={(tempUnit) => updateSettings({ tempUnit })}
          />

          <main className="mx-auto w-full max-w-7xl flex-1 space-y-4 px-4 py-4 sm:px-6 lg:px-8">
            <StatusBar
              weather={weather}
              error={error}
              loading={loading}
              onRefresh={refetch}
              onChangeSource={() => handleOpenSettings("source")}
              pressureUnit={settings.pressureUnit}
            />

            {/* Last request failed while older data is still shown */}
            {error && weather && !loading && online && (
              <Alert variant="warning" role="alert">
                <CloudOff />
                <AlertTitle>{t.common.weatherUnavailableTitle}</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {!online && (
              <Alert variant="warning" role="status">
                <WifiOff />
                <AlertDescription>{t.common.offline}</AlertDescription>
              </Alert>
            )}

            {/* GPS denied or timed out: data is for an IP-based location */}
            {locationError && (
              <Alert role="status">
                <MapPinOff />
                <AlertDescription>
                  {t.common.approximateLocation}
                </AlertDescription>
                <AlertAction>
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={clearLocationError}
                    aria-label={t.notifications.dismiss}
                  >
                    <X />
                  </Button>
                </AlertAction>
              </Alert>
            )}

            {/* Inline Active Weather Advisories Banner */}
            {weather && !loading && (
              <InlineAlertBanner
                current={weather.current}
                alerts={weather.alerts}
              />
            )}

            {/* MSN Weather Navigation Tabs */}
            {error && !weather && !loading ? (
              <EmptyState
                role="alert"
                icon={CloudOff}
                title={t.common.weatherUnavailableTitle}
                description={t.common.weatherUnavailableDesc}
                primaryAction={{
                  label: t.common.retry,
                  icon: RefreshCw,
                  onClick: () => void refetch(),
                }}
              />
            ) : (
              <DashboardTabs
                weather={weather && !loading ? weather : null}
                unit={unit}
                activeTab={activeTab}
                onTabChange={handleTabChange}
                isPinned={isPinned}
                onTogglePin={() =>
                  weather && togglePinCity(weather.current.cityName)
                }
                onOpenAiAdvisor={handleOpenAiAdvisor}
                onSelectCity={handleSelectCity}
                pinnedCities={pinnedCities}
                onUnpinCity={removePinnedCity}
                customCartoApiKey={settings.customCartoApiKey}
              />
            )}
          </main>

          {/* Global AI advisor: floating bot button + chat panel */}
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
              alerts={weather.alerts}
              unit={unit}
              buttonPosition={settings.aiButtonPosition}
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
            <p>{t.common.consoleFooter}</p>
          </footer>
        </div>
      </DisplayPreferencesProvider>
    </LanguageProvider>
  )
}
