"use client"

import React, { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { useTheme } from "next-themes"
import {
  Search,
  MapPin,
  Sparkles,
  Settings,
  Sun,
  Moon,
  X,
  Compass,
  Radio,
  Menu,
  LocateFixed,
  ChevronRight,
  ArrowRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Kbd } from "@/components/ui/kbd"
import { Popover, PopoverAnchor, PopoverContent } from "@/components/ui/popover"
import { Spinner } from "@/components/ui/spinner"
import { Separator } from "@/components/ui/separator"
import { IconTile } from "@/components/ui/icon-tile"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
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
import { useDisplayPreferences } from "@/components/display-preferences-provider"
import { CONFIG } from "@/lib/config"
import { useCitySearch, useMediaQuery, useScrollLock } from "@/hooks"
import { THEME_OPTIONS } from "@/components/settings/constants"

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
  const prefs = useDisplayPreferences()
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const searchFormRef = useRef<HTMLFormElement>(null)
  // Stateful controls (TTS playback, notifications popover) must mount exactly once
  const isDesktop = useMediaQuery("(min-width: 1024px)")

  const {
    query,
    setQuery,
    isOpen,
    setIsOpen,
    results,
    clearResults,
    isSearching,
    detectedCoords,
    isLocating,
    inputRef,
    handleSearchFocus,
    handleSelect,
    handleFormSubmit,
    clearSearch,
  } = useCitySearch({
    language: settings?.language,
    onSearch,
    onLocate,
  })

  // Freeze the page behind the search dropdown while it's open
  useScrollLock(isOpen)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- theme is only known after hydration
    setMounted(true)
  }, [])

  // The drawer only exists below the lg breakpoint
  const isMenuVisible = isMenuOpen && !isDesktop
  const isDark = mounted && resolvedTheme === "dark"
  const trimmedQuery = query.trim()
  const showPopular = trimmedQuery.length < 2
  const hasSelectableItems = isOpen && (showPopular || results.length > 0)

  /** Closes the mobile menu before running an action, so dialogs don't stack under it. */
  const runFromMenu = (action?: () => void) => () => {
    setIsMenuOpen(false)
    action?.()
  }

  const handleChangeStation = () => {
    if (onChangeStation) {
      onChangeStation()
    } else if (onOpenSettings) {
      onOpenSettings("source")
    }
  }

  const handleLocateFromSearch = () => {
    onLocate()
    clearSearch()
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
  ].filter(Boolean) as {
    id: string
    label: string
    description: string
    icon: React.ElementType
    onSelect: () => void
    disabled?: boolean
  }[]

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
              clearSearch()
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
        <Command
          shouldFilter={false}
          loop
          onKeyDown={(e) => {
            if (e.key === "Escape" && isOpen) {
              e.preventDefault()
              setIsOpen(false)
            } else if (e.key === "Enter" && !hasSelectableItems) {
              // cmdk swallows Enter (preventDefault), which blocks native form submit.
              // With nothing to select, run the free-text search / locate ourselves.
              handleFormSubmit(e)
            }
          }}
          className="size-auto max-w-md min-w-0 flex-1 bg-transparent"
        >
          <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverAnchor asChild>
              <form
                ref={searchFormRef}
                onSubmit={handleFormSubmit}
                role="search"
              >
                <InputGroup>
                  <InputGroupAddon>
                    <Search />
                  </InputGroupAddon>
                  <InputGroupInput
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => {
                      setQuery(e.target.value)
                      setIsOpen(true)
                    }}
                    onFocus={handleSearchFocus}
                    placeholder={t.common.searchPlaceholder}
                    aria-label={t.common.searchPlaceholder}
                    aria-expanded={isOpen}
                    autoComplete="off"
                    className="font-mono text-xs"
                  />
                  <InputGroupAddon align="inline-end" className="gap-0.5">
                    {query && (
                      <InputGroupButton
                        size="icon-xs"
                        variant="warning"
                        onClick={() => {
                          setQuery("")
                          clearResults()
                        }}
                        aria-label={t.common.clear}
                      >
                        <X />
                      </InputGroupButton>
                    )}
                    {/* Idle: shortcut hint. Active (dropdown open): locate action replaces it */}
                    {isOpen ? (
                      <InputGroupButton
                        size="icon-xs"
                        variant="outline"
                        className="bg-muted"
                        onClick={onLocate}
                        disabled={isLoading}
                        aria-label={t.common.locateMe}
                      >
                        <MapPin className="size-3" />
                      </InputGroupButton>
                    ) : (
                      <Kbd>/</Kbd>
                    )}
                  </InputGroupAddon>
                </InputGroup>
              </form>
            </PopoverAnchor>

            {/* Autocomplete Dropdown: anchored to the search field, positioned by Radix */}
            <PopoverContent
              align="start"
              // Keep typing focus in the input; clicks on the input itself aren't "outside"
              onOpenAutoFocus={(e) => e.preventDefault()}
              onCloseAutoFocus={(e) => e.preventDefault()}
              onInteractOutside={(e) => {
                if (searchFormRef.current?.contains(e.target as Node))
                  e.preventDefault()
              }}
              className="w-(--radix-popover-trigger-width) gap-0 p-0"
            >
              <CommandList data-lenis-prevent className="h-auto max-h-fit">
                {/* GPS current station: offered while the user hasn't typed a query */}
                {showPopular && (
                  <>
                    <CommandGroup>
                      <CommandItem
                        value="__locate__"
                        onSelect={handleLocateFromSearch}
                        className="gap-2.5 bg-accent font-mono"
                      >
                        <IconTile variant="soft" size="xs">
                          <MapPin
                            className={cn(isLocating && "animate-pulse")}
                          />
                        </IconTile>
                        <span className="flex min-w-0 flex-1 flex-col">
                          <span className="flex items-center gap-1.5 font-semibold text-foreground">
                            {t.header.currentStationGps}
                            {isLocating ? (
                              <Badge
                                variant="outline"
                                className="animate-pulse border-primary/30 font-mono text-tiny text-primary"
                              >
                                {t.header.detecting}
                              </Badge>
                            ) : detectedCoords ? (
                              <Badge
                                variant="success-light"
                                className="font-mono text-tiny"
                              >
                                {t.header.gpsLocked}
                              </Badge>
                            ) : null}
                          </span>
                          <span className="truncate text-mini text-muted-foreground">
                            {detectedCoords
                              ? `${prefs.coords(detectedCoords.lat, detectedCoords.lon, 3)} • ${t.header.clickToLoadStation}`
                              : t.header.autoDetectStation}
                          </span>
                        </span>
                        <Button
                          size="xs"
                          variant="default"
                          disabled={isLocating || isLoading}
                          className="shrink-0 gap-1 font-mono text-xs"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleLocateFromSearch()
                          }}
                        >
                          {isLocating ? (
                            <>
                              <Spinner className="size-3" />
                              <span>{t.common.locating}</span>
                            </>
                          ) : (
                            <>
                              <MapPin className="size-3" />
                              <span>{t.header.locateAction}</span>
                              <ArrowRight className="size-3" />
                            </>
                          )}
                        </Button>
                      </CommandItem>
                    </CommandGroup>
                    <CommandSeparator className="mx-0" />
                    <CommandGroup heading={t.header.popularHubs}>
                      {CONFIG.location.popularCities.slice(0, 8).map((c) => (
                        <CommandItem
                          key={c}
                          value={`popular:${c}`}
                          onSelect={() => handleSelect(c)}
                          className="font-mono"
                        >
                          <MapPin className="size-3 text-primary" />
                          {c}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </>
                )}

                {!showPopular && results.length > 0 && (
                  <CommandGroup
                    heading={t.header.geocodingMatches}
                    className="h-auto"
                  >
                    {results.map((r, i) => (
                      <CommandItem
                        key={`${r.name}-${r.lat}-${r.lon}-${i}`}
                        value={`result:${r.name}:${r.lat}:${r.lon}:${i}`}
                        onSelect={() => handleSelect(r.name)}
                        className="justify-between"
                      >
                        <span className="flex min-w-0 items-center gap-2">
                          <MapPin className="size-3 text-primary" />
                          <span className="truncate font-medium text-foreground">
                            {r.name}
                          </span>
                          <span className="truncate text-mini text-muted-foreground">
                            {r.state ? `${r.state}, ` : ""}
                            {r.country}
                          </span>
                        </span>
                        <span className="shrink-0 font-mono text-tiny text-muted-foreground">
                          {prefs.coords(r.lat, r.lon, 2)}
                        </span>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}

                {!showPopular && results.length === 0 && (
                  <CommandEmpty className="flex items-center justify-center gap-2 py-4 font-mono text-muted-foreground">
                    {isSearching ? (
                      <>
                        <Spinner className="size-3.5" />
                        {t.header.locatingStations}
                      </>
                    ) : (
                      t.header.noStationFound(trimmedQuery)
                    )}
                  </CommandEmpty>
                )}
              </CommandList>
            </PopoverContent>
          </Popover>
        </Command>

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

        <Drawer open={isMenuVisible} onOpenChange={setIsMenuOpen}>
          <DrawerContent
            side="right"
            aria-describedby={undefined}
            className="lg:hidden"
          >
            <DrawerHeader className="border-b border-border pr-12">
              <DrawerTitle className="flex items-center gap-2">
                <IconTile variant="solid" size="xs">
                  <Compass />
                </IconTile>
                OpenWeather
              </DrawerTitle>
            </DrawerHeader>

            <ItemGroup
              aria-label={t.header.mainMenu}
              className="flex-1 gap-1.5 overflow-y-auto p-3"
            >
              {menuItems.map((item) => {
                const Icon = item.icon
                return (
                  <Item key={item.id} asChild variant="outline" size="sm">
                    <Button
                      variant="ghost"
                      disabled={item.disabled}
                      onClick={runFromMenu(item.onSelect)}
                      className="h-auto flex-nowrap justify-start text-left whitespace-normal"
                    >
                      <ItemMedia>
                        <IconTile variant="soft" size="sm">
                          <Icon />
                        </IconTile>
                      </ItemMedia>
                      <ItemContent className="min-w-0">
                        <ItemTitle className="font-heading">
                          {item.label}
                        </ItemTitle>
                        <ItemDescription className="truncate">
                          {item.description}
                        </ItemDescription>
                      </ItemContent>
                      <ItemActions>
                        <ChevronRight className="size-4 text-muted-foreground" />
                      </ItemActions>
                    </Button>
                  </Item>
                )
              })}
            </ItemGroup>

            <Separator />

            <DrawerFooter className="gap-2 p-3">
              <ItemTitle className="font-mono text-tiny text-muted-foreground uppercase">
                {t.settingsDialog.theme.headerTitle}
              </ItemTitle>
              <ToggleGroup
                type="single"
                variant="outline"
                spacing={1}
                value={mounted ? theme : undefined}
                onValueChange={(value) => {
                  if (value) setTheme(value)
                }}
                disabled={!mounted}
                aria-label={t.settingsDialog.theme.headerTitle}
                className="grid w-full grid-cols-3"
              >
                {THEME_OPTIONS.map((option) => {
                  const Icon = option.icon
                  const label = t.settingsDialog.theme[`${option.id}Title`]
                  return (
                    <ToggleGroupItem
                      key={option.id}
                      value={option.id}
                      aria-label={label}
                      className="h-auto flex-col text-tiny"
                    >
                      <Icon className="size-4" />
                      <span className="truncate">{label}</span>
                    </ToggleGroupItem>
                  )
                })}
              </ToggleGroup>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      </div>
    </header>
  )
}
