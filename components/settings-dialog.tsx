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
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { Tabs, TabsList } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { UniversalDialog } from "@/components/universal-dialog"
import { useTranslation } from "@/components/language-provider"
import { MAX_PINNED_CITIES } from "@/lib/constants"

// Public types consumed across the app (weather hooks, header, TTS button)
export type * from "./settings/types"

import type { ExtendedSettings } from "./settings/types"
import { TTS_VOICES, resolveTtsVoice } from "@/lib/edge-tts"
import { getActiveUnitPreset } from "./settings/utils"
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

/** Tracks whether a horizontally scrollable element has hidden content on either side. */
function useHorizontalOverflow(ref: React.RefObject<HTMLElement | null>) {
  const [overflow, setOverflow] = React.useState({ left: false, right: false })

  const update = React.useCallback(() => {
    const el = ref.current
    if (!el) return
    const left = el.scrollLeft > 1
    const right = el.scrollLeft + el.clientWidth < el.scrollWidth - 1
    setOverflow((prev) =>
      prev.left === left && prev.right === right ? prev : { left, right }
    )
  }, [ref])

  React.useEffect(() => {
    const el = ref.current
    if (!el) return
    update()
    const observer = new ResizeObserver(update)
    observer.observe(el)
    el.addEventListener("scroll", update, { passive: true })
    return () => {
      observer.disconnect()
      el.removeEventListener("scroll", update)
    }
  }, [ref, update])

  return overflow
}

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
  const [isResetConfirmOpen, setIsResetConfirmOpen] = React.useState(false)
  const apiKeyCount = [settings.customApiKey?.trim()].filter(Boolean).length
  const unitPreset = getActiveUnitPreset(settings)

  const currentTab = TAB_ALIASES[activeTab] ?? activeTab

  const tabsListRef = React.useRef<HTMLDivElement>(null)
  const tabsOverflow = useHorizontalOverflow(tabsListRef)

  React.useEffect(() => {
    if (!open) return
    const timer = setTimeout(() => {
      const activeEl = tabsListRef.current?.querySelector(
        '[data-state="active"]'
      ) as HTMLElement | null
      activeEl?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "nearest",
      })
    }, 50)
    return () => clearTimeout(timer)
  }, [currentTab, open])

  const scrollTabs = (direction: -1 | 1) => {
    const el = tabsListRef.current
    if (!el) return
    el.scrollBy({ left: direction * el.clientWidth * 0.6, behavior: "smooth" })
  }

  const handleConfirmReset = () => {
    onResetSettings()
    setIsResetConfirmOpen(false)
  }

  // Reusable Tab Configurations
  const tabs: {
    id: string
    label: string
    icon: React.ElementType
    description: string
    badge?: React.ReactNode
    content: React.ReactNode
  }[] = [
    {
      id: "locations",
      label: t.settingsDialog.tabLocations,
      icon: MapPin,
      description: t.settingsDialog.tabDescriptions.locations,
      badge: (
        <Badge
          variant={pinnedCities.length >= MAX_PINNED_CITIES ? "warning-outline" : "primary-outline"}
          className="font-mono text-tiny"
        >
          {pinnedCities.length}/{MAX_PINNED_CITIES}
        </Badge>
      ),
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
      label: t.settingsDialog.tabSource,
      icon: Server,
      description: t.settingsDialog.tabDescriptions.source,
      badge: (
        <Badge variant="primary-outline" className="font-mono text-tiny uppercase">
          {settings.weatherSource === "auto"
            ? t.settingsDialog.autoSourceBadge
            : settings.weatherSource}
        </Badge>
      ),
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
      label: t.settingsDialog.tabApi,
      icon: KeyRound,
      description: t.settingsDialog.tabDescriptions.api,
      badge: (
        <Badge
          variant={apiKeyCount === 0 ? "warning-outline" : "primary-outline"}
          className="font-mono text-tiny"
        >
          {apiKeyCount}/2
        </Badge>
      ),
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
      label: t.settingsDialog.tabUnits,
      icon: Compass,
      description: t.settingsDialog.tabDescriptions.units,
      badge: (
        <Badge variant="primary-outline" className="font-mono text-tiny uppercase">
          {t.settingsDialog.units.presets[unitPreset]}
        </Badge>
      ),
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
      label: t.settingsDialog.tabRegional,
      icon: Globe,
      description: t.settingsDialog.tabDescriptions.localization,
      badge: (
        <Badge variant="primary-outline" className="font-mono text-tiny uppercase">
          {settings.language?.toUpperCase() || "EN"}
        </Badge>
      ),
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
      label: t.settingsDialog.tabSpeech,
      icon: Volume2,
      description: t.settingsDialog.tabDescriptions.speech,
      badge: (
        <Badge variant="primary-outline" className="font-mono text-tiny uppercase">
          {TTS_VOICES.find((v) => v.id === resolveTtsVoice(settings.ttsVoice))?.name}
        </Badge>
      ),
      content: (
        <SpeechTabContent
          settings={settings}
          onUpdateSettings={onUpdateSettings}
        />
      ),
    },
    {
      id: "appearance",
      label: t.settingsDialog.tabTheme,
      icon: Palette,
      description: t.settingsDialog.tabDescriptions.appearance,
      content: <AppearanceTabContent />,
    },
  ]

  const activeTabObj = tabs.find((tab) => tab.id === currentTab) || tabs[0]
  const ActiveIcon = activeTabObj.icon

  return (
    <UniversalDialog
      open={open}
      onOpenChange={onOpenChange}
      icon={<Settings className="size-4.5" />}
      title={t.settingsDialog.title}
      description={t.settingsDialog.subtitle}
      scrollable={false}
      footer={
        <>
          <Popover open={isResetConfirmOpen} onOpenChange={setIsResetConfirmOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="accent"
                className="gap-1.5 font-sans text-xs text-muted-foreground hover:text-foreground"
              >
                <RotateCcw className="size-3.5" />
                <span>{t.common.reset}</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" side="top" className="w-72 space-y-3 p-3">
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
      {/* REUSABLE TABS SYSTEM */}
      <Tabs
        value={currentTab}
        onValueChange={onActiveTabChange}
        className="flex min-h-0 w-full flex-1 flex-col gap-0 overflow-hidden"
      >
        {/* DESKTOP TABS LIST (>= sm) */}
        <div className="relative hidden w-full shrink-0 border-b border-border bg-muted/20 sm:flex">
          <TabsList
            ref={tabsListRef}
            className="w-full shrink-0 flex-nowrap justify-start gap-1 overflow-x-auto overflow-y-hidden touch-pan-x scroll-smooth p-1.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            onWheel={(e) => {
              if (
                Math.abs(e.deltaY) > Math.abs(e.deltaX) &&
                e.currentTarget.scrollWidth > e.currentTarget.clientWidth
              ) {
                e.currentTarget.scrollLeft += e.deltaY
              }
            }}
          >
            {tabs.map((tab) => (
              <SettingsTabTrigger
                key={tab.id}
                value={tab.id}
                label={tab.label}
                badge={tab.badge}
              />
            ))}
          </TabsList>

          {tabsOverflow.left && (
            <button
              type="button"
              aria-label={t.settingsDialog.scrollTabsLeft}
              onClick={() => scrollTabs(-1)}
              className="absolute inset-y-0 left-0 flex w-8 items-center justify-start bg-linear-to-r from-background via-background/90 to-transparent pl-1 text-muted-foreground hover:text-foreground"
            >
              <ChevronLeft className="size-4" />
            </button>
          )}
          {tabsOverflow.right && (
            <button
              type="button"
              aria-label={t.settingsDialog.scrollTabsRight}
              onClick={() => scrollTabs(1)}
              className="absolute inset-y-0 right-0 flex w-8 items-center justify-end bg-linear-to-l from-background via-background/90 to-transparent pr-1 text-muted-foreground hover:text-foreground"
            >
              <ChevronRight className="size-4" />
            </button>
          )}
        </div>

        {/* MOBILE SECTION PICKER (< sm) */}
        <div className="flex w-full shrink-0 items-center border-b border-border bg-muted/30 px-3 py-2 sm:hidden">
          <Select value={currentTab} onValueChange={(value) => onActiveTabChange?.(value)}>
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
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <SelectItem key={tab.id} value={tab.id} className="py-2.5">
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
            </SelectContent>
          </Select>
        </div>

        {tabs.map((tab) => (
          <SettingsTabPanel key={tab.id} value={tab.id}>
            {tab.content}
          </SettingsTabPanel>
        ))}
      </Tabs>
    </UniversalDialog>
  )
}
