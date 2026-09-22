"use client"

import * as React from "react"
import { Settings, RotateCcw, Check } from "lucide-react"
import { Tabs, TabsList } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { UniversalDialog } from "@/components/universal-dialog"
import { useTranslation } from "@/components/language-provider"
import { MAX_PINNED_CITIES } from "@/lib/constants"

// Re-export all modularized settings components, types, and constants
export * from "./settings"

import {
  ExtendedSettings,
  SettingsTabTrigger,
  SettingsTabPanel,
  LocationsTabContent,
  SourceTabContent,
  ApiKeysTabContent,
  UnitsTabContent,
  RegionalTabContent,
  SpeechTabContent,
  AppearanceTabContent,
} from "./settings"

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

  const currentTab =
    activeTab === "favorites" || activeTab === "location"
      ? "locations"
      : activeTab === "keys" || activeTab === "apis"
        ? "api"
        : activeTab

  // Reusable Tab Configurations
  const tabs: {
    id: string
    label: string
    badge?: React.ReactNode
    content: React.ReactNode
  }[] = [
    {
      id: "locations",
      label: t.settingsDialog.tabLocations || "Locations",
      badge: (
        <Badge
          variant={pinnedCities.length >= MAX_PINNED_CITIES ? "warning-outline" : "primary-outline"}
          className="font-mono text-tiny"
        >
          {pinnedCities.length}
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
      label: t.settingsDialog.tabSource || "Source & Models",
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
      label: t.settingsDialog.tabApi || "API Keys",
      badge: (
        <Badge
          variant="outline"
          className="font-mono text-tiny"
        >
          {[settings.customApiKey?.trim(), settings.googleApiKey?.trim()].filter(Boolean).length}/2
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
      label: t.settingsDialog.tabUnits || "Units",
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
      label: t.settingsDialog.tabRegional || "Regional",
      content: (
        <RegionalTabContent
          settings={settings}
          onUpdateSettings={onUpdateSettings}
        />
      ),
    },
    {
      id: "speech",
      label: t.settingsDialog.tabSpeech || "Speech & Audio",
      content: (
        <SpeechTabContent
          settings={settings}
          onUpdateSettings={onUpdateSettings}
        />
      ),
    },
    {
      id: "appearance",
      label: t.settingsDialog.tabTheme || "Theme",
      content: <AppearanceTabContent />,
    },
  ]

  return (
    <UniversalDialog
      open={open}
      onOpenChange={onOpenChange}
      icon={<Settings className="size-4.5" />}
      title={t.settingsDialog.title || "Station & Application Preferences"}
      description={
        t.settingsDialog.subtitle ||
        "Configure meteorological data feeds, numerical forecast models, measurement standards & voice telemetry"
      }
      scrollable={false}
      footer={
        <>
          <Button
            variant="accent"
            onClick={onResetSettings}
            className="gap-1.5 font-sans text-xs text-muted-foreground hover:text-foreground"
          >
            <RotateCcw className="size-3.5" />
            <span>{t.common.reset || "Reset"}</span>
          </Button>

          <Button
            onClick={() => onOpenChange(false)}
            className="gap-1.5 text-xs"
          >
            <Check className="size-3.5" />
            <span>{t.common.done || "Done"}</span>
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
        <TabsList className="w-full shrink-0 flex-nowrap justify-start gap-1 overflow-x-auto">
          {tabs.map((tab) => (
            <SettingsTabTrigger
              key={tab.id}
              value={tab.id}
              label={tab.label}
              badge={tab.badge}
            />
          ))}
        </TabsList>

        {tabs.map((tab) => (
          <SettingsTabPanel key={tab.id} value={tab.id}>
            {tab.content}
          </SettingsTabPanel>
        ))}
      </Tabs>
    </UniversalDialog>
  )
}
