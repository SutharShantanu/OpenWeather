"use client"

import * as React from "react"
import {
  Settings,
  RotateCcw,
  Check,
  MapPin,
  Server,
  KeyRound,
  Compass,
  Globe,
  Volume2,
  Palette,
  Search,
  X,
} from "lucide-react"
import { Tabs, TabsList } from "@/components/ui/tabs"
import { Dot } from "@/components/ui/dot"
import { Button } from "@/components/ui/button"
import { useTheme } from "next-themes"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useDebounce } from "@/hooks/use-debounce"
import { UniversalDialog } from "@/components/universal-dialog"
import { useTranslation } from "@/components/language-provider"

// Public types consumed across the app (weather hooks, header, TTS button)
export type * from "./settings/types"

import type { ExtendedSettings } from "./settings/types"
import {
  SettingsTabTrigger,
  SettingsTabPanel,
  LocationsTabContent,
  SourceTabContent,
  ApiKeysTabContent,
  UnitsTabContent,
  RegionalTabContent,
  SpeechTabContent,
  AppearanceTabContent,
  SettingsSearchResults,
  searchSettings,
  type SettingsSearchEntry,
} from "./settings/components"

export interface SettingsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  activeTab?: string
  onActiveTabChange?: (tab: string) => void
  settings: ExtendedSettings
  onUpdateSettings: (newSettings: Partial<ExtendedSettings>) => void
  onResetSettings: () => void
  pinnedCities: string[]
  onAddPinnedCity: (city: string) => void
  onRemovePinnedCity: (city: string) => void
  onSelectCity: (city: string) => void
  currentTemp?: number
  city?: string
  coords?: { lat: number; lon: number } | null
}

const TAB_ALIASES: Record<string, string> = {
  favorites: "locations",
  location: "locations",
  keys: "api",
  apis: "api",
  regional: "localization",
  theme: "appearance",
}

type SettingsGroup = "preferences" | "data" | "voice" | "advanced"

/** Sidebar order: groups, and the pages inside each. */
const GROUP_ORDER: SettingsGroup[] = [
  "preferences",
  "data",
  "voice",
  "advanced",
]

/** How long a search result's section stays highlighted after jumping to it. */
const HIGHLIGHT_MS = 1600
const HIGHLIGHT_CLASSES = [
  "ring-2",
  "ring-primary",
  "ring-offset-2",
  "ring-offset-background",
]

export function SettingsDialog({
  open,
  onOpenChange,
  activeTab = "source",
  onActiveTabChange,
  settings,
  onUpdateSettings,
  onResetSettings,
  pinnedCities,
  onAddPinnedCity,
  onRemovePinnedCity,
  onSelectCity,
  currentTemp,
  city,
  coords,
}: SettingsDialogProps) {
  const { t } = useTranslation()
  const { theme } = useTheme()
  const [isResetConfirmOpen, setIsResetConfirmOpen] = React.useState(false)

  const currentTab = TAB_ALIASES[activeTab] ?? activeTab

  // Track initial snapshot when dialog opens to detect tab changes/updates
  const [lastOpen, setLastOpen] = React.useState(open)
  const [initialSnapshot, setInitialSnapshot] = React.useState<{
    settings: ExtendedSettings
    pinnedCities: string[]
    theme?: string
  } | null>(
    open
      ? { settings: { ...settings }, pinnedCities: [...pinnedCities], theme }
      : null
  )

  if (open !== lastOpen) {
    setLastOpen(open)
    if (open) {
      setInitialSnapshot({
        settings: { ...settings },
        pinnedCities: [...pinnedCities],
        theme,
      })
    } else {
      setInitialSnapshot(null)
    }
  }

  const initial = initialSnapshot

  const isLocationsChanged = Boolean(
    initial &&
    (pinnedCities.length !== initial.pinnedCities.length ||
      pinnedCities.some((c, i) => c !== initial.pinnedCities[i]))
  )

  const isSourceChanged = Boolean(
    initial &&
    (settings.weatherSource !== initial.settings.weatherSource ||
      settings.forecastStation !== initial.settings.forecastStation)
  )

  const isApiChanged = Boolean(
    initial &&
    ((settings.customApiKey ?? "") !== (initial.settings.customApiKey ?? "") ||
      (settings.customCartoApiKey ?? "") !==
        (initial.settings.customCartoApiKey ?? ""))
  )

  const isUnitsChanged = Boolean(
    initial &&
    (settings.tempUnit !== initial.settings.tempUnit ||
      settings.windUnit !== initial.settings.windUnit ||
      settings.pressureUnit !== initial.settings.pressureUnit ||
      settings.precipUnit !== initial.settings.precipUnit)
  )

  const isRegionalChanged = Boolean(
    initial &&
    (settings.language !== initial.settings.language ||
      settings.timeFormat !== initial.settings.timeFormat ||
      settings.dateFormat !== initial.settings.dateFormat ||
      settings.coordinateFormat !== initial.settings.coordinateFormat)
  )

  const isSpeechChanged = Boolean(
    initial &&
    (settings.ttsVoice !== initial.settings.ttsVoice ||
      settings.speechRate !== initial.settings.speechRate ||
      settings.autoSpeakOnLoad !== initial.settings.autoSpeakOnLoad ||
      settings.googleTtsPitch !== initial.settings.googleTtsPitch ||
      settings.googleTtsVolumeGain !== initial.settings.googleTtsVolumeGain ||
      settings.speechDeliveryStyle !== initial.settings.speechDeliveryStyle)
  )

  const isAppearanceChanged = Boolean(
    (initial?.theme && theme && theme !== initial.theme) ||
    (initial && settings.aiButtonPosition !== initial.settings.aiButtonPosition)
  )

  const renderTabDot = (changed: boolean) =>
    changed ? <Dot variant="primary" size="sm" pulse /> : null

  const handleConfirmReset = () => {
    onResetSettings()
    setIsResetConfirmOpen(false)
  }

  // Reusable Tab Configurations
  const tabs: {
    id: string
    group: SettingsGroup
    label: string
    icon: React.ElementType
    description: string
    badge?: React.ReactNode
    content: React.ReactNode
  }[] = [
    {
      id: "locations",
      group: "data",
      label: t.settingsDialog.tabLocations,
      icon: MapPin,
      description: t.settingsDialog.tabDescriptions.locations,
      badge: renderTabDot(isLocationsChanged),
      content: (
        <LocationsTabContent
          pinnedCities={pinnedCities}
          onAddPinnedCity={onAddPinnedCity}
          onRemovePinnedCity={onRemovePinnedCity}
          onSelectCity={onSelectCity}
          onCloseDialog={() => onOpenChange(false)}
          coords={coords}
          city={city}
        />
      ),
    },
    {
      id: "source",
      group: "data",
      label: t.settingsDialog.tabSource,
      icon: Server,
      description: t.settingsDialog.tabDescriptions.source,
      badge: renderTabDot(isSourceChanged),
      content: (
        <SourceTabContent
          settings={settings}
          onUpdateSettings={onUpdateSettings}
          city={city}
        />
      ),
    },
    {
      id: "api",
      group: "advanced",
      label: t.settingsDialog.tabApi,
      icon: KeyRound,
      description: t.settingsDialog.tabDescriptions.api,
      badge: renderTabDot(isApiChanged),
      content: (
        <ApiKeysTabContent
          settings={settings}
          onUpdateSettings={onUpdateSettings}
          city={city}
        />
      ),
    },
    {
      id: "units",
      group: "preferences",
      label: t.settingsDialog.tabUnits,
      icon: Compass,
      description: t.settingsDialog.tabDescriptions.units,
      badge: renderTabDot(isUnitsChanged),
      content: (
        <UnitsTabContent
          settings={settings}
          onUpdateSettings={onUpdateSettings}
          currentTemp={currentTemp}
        />
      ),
    },
    {
      id: "localization",
      group: "preferences",
      label: t.settingsDialog.tabRegional,
      icon: Globe,
      description: t.settingsDialog.tabDescriptions.localization,
      badge: renderTabDot(isRegionalChanged),
      content: (
        <RegionalTabContent
          settings={settings}
          onUpdateSettings={onUpdateSettings}
          coords={coords}
        />
      ),
    },
    {
      id: "speech",
      group: "voice",
      label: t.settingsDialog.tabSpeech,
      icon: Volume2,
      description: t.settingsDialog.tabDescriptions.speech,
      badge: renderTabDot(isSpeechChanged),
      content: (
        <SpeechTabContent
          settings={settings}
          onUpdateSettings={onUpdateSettings}
        />
      ),
    },
    {
      id: "appearance",
      group: "preferences",
      label: t.settingsDialog.tabTheme,
      icon: Palette,
      description: t.settingsDialog.tabDescriptions.appearance,
      badge: renderTabDot(isAppearanceChanged),
      content: (
        <AppearanceTabContent
          settings={settings}
          onUpdateSettings={onUpdateSettings}
        />
      ),
    },
  ]

  const activeTabObj = tabs.find((tab) => tab.id === currentTab) || tabs[0]
  const ActiveIcon = activeTabObj.icon

  const nav = t.settingsDialog.nav
  const groupLabels: Record<SettingsGroup, string> = {
    preferences: nav.groupPreferences,
    data: nav.groupWeatherData,
    voice: nav.groupVoice,
    advanced: nav.groupAdvanced,
  }
  const groupedTabs = GROUP_ORDER.map((group) => ({
    group,
    label: groupLabels[group],
    tabs: tabs.filter((tab) => tab.group === group),
  }))

  // ---- Settings search -------------------------------------------------
  // Every card title is searchable, plus English keywords for synonyms and
  // unit names that don't appear in the (translated) titles.
  const sd = t.settingsDialog
  const tabById = new Map(tabs.map((tab) => [tab.id, tab]))
  const entry = (
    tab: string,
    title: string,
    keywords?: string
  ): SettingsSearchEntry => ({
    tab,
    title,
    keywords,
    tabLabel: `${groupLabels[tabById.get(tab)!.group]} › ${tabById.get(tab)!.label}`,
    icon: tabById.get(tab)!.icon,
  })
  const searchEntries: SettingsSearchEntry[] = [
    entry(
      "appearance",
      sd.theme.headerTitle,
      "theme dark light mode system color"
    ),
    entry(
      "appearance",
      sd.assistant.title,
      "ai bot assistant advisor floating button position hide"
    ),
    entry(
      "localization",
      sd.regional.langTitle,
      "language locale translation rtl"
    ),
    entry("localization", sd.regional.timeTitle, "time clock 12h 24h am pm"),
    entry("localization", sd.regional.dateTitle, "date format day month year"),
    entry(
      "localization",
      sd.regional.coordTitle,
      "coordinates latitude longitude dms decimal"
    ),
    entry("units", sd.units.headerTitle, "units metric imperial presets"),
    entry("units", sd.units.tempTitle, "temperature celsius fahrenheit"),
    entry("units", sd.units.windTitle, "wind speed kmh mph knots ms beaufort"),
    entry("units", sd.units.pressureTitle, "pressure hpa inhg mmhg barometer"),
    entry("units", sd.units.precipTitle, "precipitation rain mm inches"),
    entry(
      "source",
      sd.source.providerTitle,
      "provider source open-meteo openweathermap simulation"
    ),
    entry(
      "source",
      sd.source.nwpTitle,
      "model station ecmwf gfs icon forecast nwp"
    ),
    entry(
      "locations",
      sd.locations.addTitle,
      "add search city station favorite pin nearby"
    ),
    entry(
      "locations",
      sd.locations.savedTitle,
      "saved pinned favorites stations remove"
    ),
    entry("speech", sd.speech.engineTitle, "tts text to speech engine edge"),
    entry("speech", sd.speech.personaTitle, "voice persona male female accent"),
    entry("speech", sd.speech.velocityTitle, "speed rate fast slow"),
    entry("speech", sd.speech.pitchTitle, "pitch tone"),
    entry("speech", sd.speech.volumeTitle, "volume loudness gain db"),
    entry("speech", sd.speech.autoBriefingTitle, "auto speak briefing on load"),
    entry(
      "speech",
      sd.speech.deliveryTitle,
      "delivery style tone casual formal"
    ),
    entry("api", sd.apiKeys.owmTitle, "openweathermap owm api key token"),
    entry(
      "api",
      sd.apiKeys.cartoTitle,
      "carto map tiles basemap api key token"
    ),
  ]

  const [query, setQuery] = React.useState("")
  const debouncedQuery = useDebounce(query, 200)
  const isSearching = debouncedQuery.trim().length > 0
  const searchResults = isSearching
    ? searchSettings(searchEntries, debouncedQuery)
    : []

  // Clear the search whenever the dialog closes.
  if (!open && query) setQuery("")

  const panelsRef = React.useRef<HTMLDivElement>(null)
  const [pendingSection, setPendingSection] = React.useState<string | null>(
    null
  )

  const openSearchResult = (result: SettingsSearchEntry) => {
    setQuery("")
    onActiveTabChange?.(result.tab)
    setPendingSection(result.title)
  }

  // After switching pages, scroll the matching card into view and flash it.
  React.useEffect(() => {
    if (!pendingSection) return
    let timer: ReturnType<typeof setTimeout> | undefined
    const frame = requestAnimationFrame(() => {
      const titles = panelsRef.current?.querySelectorAll<HTMLElement>(
        '[role="tabpanel"][data-state="active"] [data-slot="card-title"]'
      )
      const title = Array.from(titles ?? []).find((el) =>
        el.textContent
          ?.trim()
          .toLowerCase()
          .includes(pendingSection.toLowerCase())
      )
      const card = title?.closest<HTMLElement>('[data-slot="card"]')
      setPendingSection(null)
      if (!card) return
      const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches
      card.scrollIntoView({
        block: "start",
        behavior: reduceMotion ? "auto" : "smooth",
      })
      card.classList.add(...HIGHLIGHT_CLASSES)
      timer = setTimeout(
        () => card.classList.remove(...HIGHLIGHT_CLASSES),
        HIGHLIGHT_MS
      )
    })
    return () => {
      cancelAnimationFrame(frame)
      if (timer) clearTimeout(timer)
    }
  }, [pendingSection, currentTab])

  const searchBox = (
    <InputGroup>
      <InputGroupAddon>
        <Search />
      </InputGroupAddon>
      <InputGroupInput
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && searchResults[0]) {
            e.preventDefault()
            openSearchResult(searchResults[0])
          } else if (e.key === "Escape" && query) {
            // Clear the search instead of closing the dialog.
            e.preventDefault()
            e.stopPropagation()
            setQuery("")
          }
        }}
        placeholder={nav.searchPlaceholder}
        aria-label={nav.searchPlaceholder}
        className="text-xs"
      />
      {query && (
        <InputGroupAddon align="inline-end">
          <InputGroupButton
            size="icon-xs"
            aria-label={t.common.clear}
            onClick={() => setQuery("")}
          >
            <X />
          </InputGroupButton>
        </InputGroupAddon>
      )}
    </InputGroup>
  )

  const searchResultsList = (
    <SettingsSearchResults
      results={searchResults}
      label={nav.searchResults}
      emptyLabel={nav.noResults}
      onSelect={openSearchResult}
    />
  )

  return (
    <UniversalDialog
      open={open}
      onOpenChange={onOpenChange}
      icon={<Settings className="size-4.5" />}
      title={t.settingsDialog.title}
      description={t.settingsDialog.subtitle}
      scrollable={false}
      size="4xl"
      contentClassName="sm:h-[min(46rem,88dvh)]"
      footer={
        <>
          <Popover
            open={isResetConfirmOpen}
            onOpenChange={setIsResetConfirmOpen}
          >
            <PopoverTrigger asChild>
              <Button
                variant="accent"
                className="gap-1.5 font-sans text-xs text-muted-foreground hover:text-foreground"
              >
                <RotateCcw className="size-3.5" />
                <span>{t.common.reset}</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent
              align="end"
              side="top"
              className="w-72 space-y-3 p-3"
            >
              <div className="space-y-1">
                <p className="font-heading text-xs font-semibold text-foreground">
                  {t.settingsDialog.resetConfirmTitle}
                </p>
                <p className="text-tiny text-muted-foreground">
                  {t.settingsDialog.resetConfirmDesc}
                </p>
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  onClick={() => setIsResetConfirmOpen(false)}
                >
                  {t.common.cancel}
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  className="gap-1.5 text-xs"
                  onClick={handleConfirmReset}
                >
                  <RotateCcw className="size-3.5" />
                  {t.common.reset}
                </Button>
              </div>
            </PopoverContent>
          </Popover>

          <Button
            onClick={() => onOpenChange(false)}
            className="gap-1.5 text-xs"
          >
            <Check className="size-3.5" />
            <span>{t.common.done}</span>
          </Button>
        </>
      }
    >
      {/* Vertical, grouped navigation with search (sidebar on sm+, header on mobile) */}
      <Tabs
        value={currentTab}
        onValueChange={onActiveTabChange}
        orientation="vertical"
        className="flex min-h-0 w-full flex-1 flex-col gap-0 overflow-hidden sm:flex-row"
      >
        <aside className="hidden w-60 shrink-0 flex-col gap-2 border-e border-border bg-muted/20 p-2.5 sm:flex">
          {searchBox}
          <ScrollArea className="min-h-0 flex-1">
            {isSearching ? (
              searchResultsList
            ) : (
              <nav className="space-y-3 pb-2">
                {groupedTabs.map(({ group, label, tabs: groupTabs }) => (
                  <div key={group} className="space-y-1">
                    <p
                      id={`settings-group-${group}`}
                      className="px-2 font-mono text-nano font-semibold tracking-wider text-muted-foreground uppercase"
                    >
                      {label}
                    </p>
                    <TabsList
                      variant="line"
                      aria-labelledby={`settings-group-${group}`}
                      className="w-full"
                    >
                      {groupTabs.map((tab) => {
                        const Icon = tab.icon
                        return (
                          <SettingsTabTrigger
                            key={tab.id}
                            value={tab.id}
                            label={tab.label}
                            badge={tab.badge}
                            icon={<Icon />}
                            className="w-full justify-start px-2 py-1.5 data-active:bg-background"
                          />
                        )
                      })}
                    </TabsList>
                  </div>
                ))}
              </nav>
            )}
          </ScrollArea>
        </aside>

        {/* MOBILE: search + grouped section picker (< sm) */}
        <div className="flex w-full shrink-0 flex-col gap-2 border-b border-border bg-muted/30 px-3 py-2 sm:hidden">
          {searchBox}
          {!isSearching && (
            <Select
              value={currentTab}
              onValueChange={(value) => onActiveTabChange?.(value)}
            >
              <SelectTrigger
                aria-label={t.settingsDialog.sectionPicker}
                className="h-9 w-full min-w-0 border-border/80 bg-background/90 font-sans text-xs shadow-2xs"
              >
                <SelectValue>
                  <span className="flex min-w-0 items-center gap-2">
                    <ActiveIcon className="size-3.5 shrink-0 text-primary" />
                    <span className="truncate font-semibold text-foreground">
                      {activeTabObj.label}
                    </span>
                    {activeTabObj.badge}
                  </span>
                </SelectValue>
              </SelectTrigger>
              <SelectContent position="popper" className="max-h-[60vh]">
                {groupedTabs.map(({ group, label, tabs: groupTabs }) => (
                  <SelectGroup key={group}>
                    <SelectLabel>{label}</SelectLabel>
                    {groupTabs.map((tab) => {
                      const Icon = tab.icon
                      return (
                        <SelectItem
                          key={tab.id}
                          value={tab.id}
                          className="py-2.5"
                        >
                          <span className="flex min-w-0 items-start gap-2.5">
                            <Icon className="mt-0.5 size-4 shrink-0 text-primary" />
                            <span className="flex min-w-0 flex-col items-start gap-0.5">
                              <span className="flex items-center gap-2">
                                <span className="font-heading text-xs font-semibold text-foreground">
                                  {tab.label}
                                </span>
                                {tab.badge}
                              </span>
                              <span className="line-clamp-1 text-tiny text-muted-foreground">
                                {tab.description}
                              </span>
                            </span>
                          </span>
                        </SelectItem>
                      )
                    })}
                  </SelectGroup>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        {isSearching && (
          <div className="min-h-0 flex-1 overflow-y-auto p-3 sm:hidden">
            {searchResultsList}
          </div>
        )}

        <div
          ref={panelsRef}
          className={`min-h-0 min-w-0 flex-1 flex-col ${isSearching ? "hidden sm:flex" : "flex"}`}
        >
          {tabs.map((tab) => (
            <SettingsTabPanel key={tab.id} value={tab.id}>
              {tab.content}
            </SettingsTabPanel>
          ))}
        </div>
      </Tabs>
    </UniversalDialog>
  )
}
