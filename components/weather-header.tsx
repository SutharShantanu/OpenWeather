"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { useTheme } from "next-themes"
import {
  Sparkles,
  Settings,
  Sun,
  Moon,
  Compass,
  Radio,
  Menu,
  LocateFixed,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { IconTile } from "@/components/ui/icon-tile"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { ButtonGroup } from "@/components/ui/button-group"
import {
  CurrentWeather,
  DailyForecastItem,
  HourlyForecastItem,
  WeatherAlert,
} from "@/lib/weather"
import { cn } from "@/lib/utils"
import { WeatherTtsButton } from "@/components/weather-tts-button"
import { NotificationsPopover } from "@/components/notifications-popover"
import type { ExtendedSettings } from "@/components/settings-dialog"
import { useTranslation } from "@/components/language-provider"
import { useCitySearch, useMediaQuery } from "@/hooks"
import { HeaderSearch } from "@/components/header/header-search"
import {
  HeaderMobileMenu,
  type HeaderMenuItem,
} from "@/components/header/header-mobile-menu"

interface WeatherHeaderProps {
  onSearch: (city: string) => void
  onLocate: () => void
  onHome?: () => void
  onOpenAiAdvisor?: () => void
  onOpenSettings?: (tab?: string) => void
  onChangeStation?: () => void
  showNotifications?: boolean
  onNotificationsOpenChange?: (open: boolean) => void
  current?: CurrentWeather
  daily?: DailyForecastItem[]
  hourly?: HourlyForecastItem[]
  alerts?: WeatherAlert[]
  unit: "C" | "F"
  settings?: ExtendedSettings
  isLoading?: boolean
}

export function WeatherHeader({
  onSearch,
  onLocate,
  onHome,
  onOpenAiAdvisor,
  onOpenSettings,
  onChangeStation,
  showNotifications,
  onNotificationsOpenChange,
  current,
  daily,
  hourly,
  alerts = [],
  unit,
  settings,
  isLoading = false,
}: WeatherHeaderProps) {
  const { t } = useTranslation()
  const { setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  // Stateful controls (TTS playback, notifications popover) must mount exactly once
  const isDesktop = useMediaQuery("(min-width: 1024px)")

  const search = useCitySearch({
    language: settings?.language,
    onSearch,
    onLocate,
  })

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- theme is only known after hydration
    setMounted(true)
  }, [])

  // The drawer only exists below the lg breakpoint
  const isMenuVisible = isMenuOpen && !isDesktop
  const isDark = mounted && resolvedTheme === "dark"

  const handleChangeStation = () => {
    if (onChangeStation) {
      onChangeStation()
    } else if (onOpenSettings) {
      onOpenSettings("source")
    }
  }

  const menuItems = [
    onOpenAiAdvisor && {
      id: "ai",
      label: t.header.aiAdvisor,
      description: t.header.aiAdvisorDesc,
      icon: Sparkles,
      onSelect: onOpenAiAdvisor,
    },
    {
      id: "source",
      label: t.common.source,
      description: t.header.sourceDesc,
      icon: Radio,
      onSelect: handleChangeStation,
    },
    {
      id: "locate",
      label: t.common.locateMe,
      description: t.header.locateDesc,
      icon: LocateFixed,
      onSelect: onLocate,
      disabled: isLoading,
    },
    onOpenSettings && {
      id: "settings",
      label: t.common.settings,
      description: t.settingsDialog.subtitle,
      icon: Settings,
      onSelect: () => onOpenSettings(),
    },
  ].filter(Boolean) as HeaderMenuItem[]

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-2 px-3 sm:gap-3 sm:px-6 lg:gap-4 lg:px-8">
        {/* Logo & Brand: Home route */}
        <Button
          asChild
          variant="ghost"
          className="h-9 shrink-0 gap-2 px-1 hover:bg-transparent hover:opacity-85"
        >
          <Link
            href="/"
            onClick={(e) => {
              search.clearSearch()
              if (onHome) {
                e.preventDefault()
                onHome()
              }
            }}
            aria-label={t.header.home}
          >
            <IconTile variant="solid" size="sm">
              <Compass />
            </IconTile>
            <span className="hidden font-heading text-sm font-medium tracking-tight text-foreground sm:inline">
              OpenWeather
            </span>
          </Link>
        </Button>

        {/* Center: Search with integrated GPS pin. Command provides arrow-key navigation over the results. */}
        <HeaderSearch
          search={search}
          onLocate={onLocate}
          isLoading={isLoading}
        />

        {/* Desktop Actions (lg+) */}
        <div className="hidden shrink-0 items-center gap-1.5 lg:flex">
          <ButtonGroup>
            {isDesktop && (
              <WeatherTtsButton
                size="default"
                current={current}
                daily={daily}
                hourly={hourly}
                unit={unit}
                settings={settings}
              />
            )}

            {onOpenAiAdvisor && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    onClick={onOpenAiAdvisor}
                    className="font-mono"
                  >
                    <Sparkles className="text-primary" />
                    <span className="text-mini">{t.header.aiAdvisor}</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{t.header.aiAdvisorDesc}</TooltipContent>
              </Tooltip>
            )}

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  onClick={handleChangeStation}
                  className="font-mono"
                >
                  <Radio className="text-primary" />
                  <span className="text-mini">{t.common.source}</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>{t.common.source}</TooltipContent>
            </Tooltip>
          </ButtonGroup>

          {isDesktop && (
            <NotificationsPopover
              alerts={alerts}
              current={current}
              open={showNotifications}
              onOpenChange={onNotificationsOpenChange}
            />
          )}

          <ButtonGroup>
            {onOpenSettings && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => onOpenSettings()}
                    aria-label={t.settingsDialog.title}
                  >
                    <Settings />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{t.settingsDialog.title}</TooltipContent>
              </Tooltip>
            )}

            {/* Theme Toggle with smooth Sun/Moon transition */}
            <Button
              variant="outline"
              size="icon"
              className="relative"
              onClick={() => setTheme(isDark ? "light" : "dark")}
              aria-label={
                mounted
                  ? isDark
                    ? t.header.switchToLight
                    : t.header.switchToDark
                  : t.header.toggleTheme
              }
              disabled={!mounted}
            >
              <Sun
                className={cn(
                  "size-3.5 transition-all duration-300",
                  isDark
                    ? "scale-0 -rotate-90 opacity-0"
                    : "scale-100 rotate-0 opacity-100"
                )}
              />
              <Moon
                className={cn(
                  "absolute size-3.5 transition-all duration-300",
                  isDark
                    ? "scale-100 rotate-0 opacity-100"
                    : "scale-0 rotate-90 opacity-0"
                )}
              />
            </Button>
          </ButtonGroup>
        </div>

        {/* Compact Actions (< lg): primary controls stay inline, the rest live in the drawer.
            The briefing stays inline so playback isn't cut off when the drawer closes. */}
        <ButtonGroup className="shrink-0 lg:hidden">
          {!isDesktop && (
            <>
              <WeatherTtsButton
                size="icon"
                current={current}
                daily={daily}
                hourly={hourly}
                unit={unit}
                settings={settings}
              />
              <NotificationsPopover
                alerts={alerts}
                current={current}
                open={showNotifications}
                onOpenChange={onNotificationsOpenChange}
              />
            </>
          )}
          <Button
            variant="outline"
            size="icon"
            onClick={() => setIsMenuOpen(true)}
            aria-label={t.header.openMenu}
            aria-expanded={isMenuVisible}
            aria-haspopup="dialog"
          >
            <Menu />
          </Button>
        </ButtonGroup>

        <HeaderMobileMenu
          open={isMenuVisible}
          onOpenChange={setIsMenuOpen}
          items={menuItems}
          mounted={mounted}
        />
      </div>
    </header>
  )
}
