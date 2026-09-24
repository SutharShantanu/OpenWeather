"use client"

import React from "react"
import { Server, Cpu, Key } from "lucide-react"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
  CardContent,
} from "@/components/ui/card"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Dot } from "@/components/ui/dot"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import {
  WeatherDataSource,
  ForecastStationModel,
  FORECAST_STATION_MODELS,
} from "@/lib/weather"
import type { TabBaseProps } from "../../types"
import { useTranslation } from "@/components/language-provider"
import { getProviderIcon } from "../widgets/provider-icon"
import { SelectionCheckIndicator } from "../widgets/selection-check-indicator"
import { useWeatherProviders } from "../../hooks"

export function SourceTabContent({ settings, onUpdateSettings }: TabBaseProps) {
  const { t } = useTranslation()
  const text = t.settingsDialog.source
  const { providers, activeForecastModel } = useWeatherProviders({
    customApiKey: settings.customApiKey,
    forecastStation: settings.forecastStation,
  })
  const nwpLabelId = React.useId()

  return (
    <div className="space-y-4">
      <Alert
        variant="default"
        className="flex flex-wrap items-center justify-between gap-3 border-border bg-card p-3.5 shadow-xs"
      >
        <div className="flex items-center gap-3">
          <Dot variant="success" size="lg" pulse />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-heading text-xs font-semibold tracking-tight text-foreground uppercase">
                {text.feedTitle}
              </span>
              <Badge variant="success-outline">{text.live}</Badge>
            </div>
            <div className="mt-0.5 text-[11px] text-muted-foreground">
              {text.feedDesc}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 font-mono text-[11px]">
          <Badge
            variant="secondary"
            className="font-semibold tracking-wider uppercase"
          >
            {settings.weatherSource}
          </Badge>
          <span className="text-muted-foreground">•</span>
          <span className="font-sans text-xs text-muted-foreground">
            {text.model}:{" "}
            <strong className="font-mono text-foreground">
              {activeForecastModel.name}
            </strong>
          </span>
        </div>
      </Alert>

      {/* SECTION 1: METEOROLOGICAL DATA PROVIDER */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-heading text-xs font-semibold text-foreground">
            <Server className="size-4 text-primary" />
            <span>{text.providerTitle}</span>
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            {text.providerDesc}
          </CardDescription>
          <CardAction>
            <Badge
              variant="primary-outline"
              className="font-mono text-xs uppercase"
            >
              {settings.weatherSource}
            </Badge>
          </CardAction>
        </CardHeader>
        <CardContent>
          <ToggleGroup
            type="single"
            aria-label={text.providerAria}
            className="grid grid-cols-1 sm:grid-cols-2 gap-0 w-full"
            value={settings.weatherSource}
            onValueChange={(val) => {
              if (val)
                onUpdateSettings({ weatherSource: val as WeatherDataSource })
            }}
            spacing={2}
          >
            {providers.map((provider) => {
              const isSelected = settings.weatherSource === provider.id
              return (
                <ToggleGroupItem
                  key={provider.id}
                  value={provider.id}
                  className={cn(
                    "group relative flex h-auto min-h-23 w-full min-w-0 cursor-pointer flex-col justify-between p-3.5 text-left whitespace-normal border border-border transition-all hover:border-primary/50 hover:bg-muted/30",
                    isSelected &&
                      "data-[state=on]:border-primary data-[state=on]:bg-primary/5"
                  )}
                >
                  {/* Card Info */}
                  <div className="w-full">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <div
                          className={cn(
                            "flex size-7 shrink-0 items-center justify-center border transition-colors",
                            isSelected
                              ? "border-primary/40 bg-primary/10 text-primary"
                              : "border-border bg-muted/60 text-muted-foreground group-hover:border-primary/30 group-hover:text-foreground"
                          )}
                        >
                          {getProviderIcon(provider.id)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="font-heading text-xs font-semibold text-foreground truncate">
                            {provider.name}
                          </div>
                          <div className="font-mono text-tiny text-muted-foreground truncate">
                            {provider.provider}
                          </div>
                        </div>
                      </div>
                      <SelectionCheckIndicator isSelected={isSelected} />
                    </div>
                  </div>

                  {/* Footer Profile Badge */}
                  <div className="mt-2.5 flex w-full items-center justify-between gap-2 font-mono text-tiny">
                    <Badge
                      variant={isSelected ? "primary-light" : "outline"}
                      className="font-mono text-tiny tracking-wider uppercase truncate"
                    >
                      {provider.badge ||
                        (provider.requiresApiKey
                          ? text.apiKeyRequired
                          : text.keyless)}
                    </Badge>
                    {provider.latencyMs !== undefined && provider.latencyMs > 0 && (
                      <span className="shrink-0 font-mono text-tiny text-muted-foreground">
                        {provider.latencyMs}ms
                      </span>
                    )}
                  </div>
                </ToggleGroupItem>
              )
            })}
          </ToggleGroup>
        </CardContent>
      </Card>

      {settings.weatherSource === "openweathermap" && (
        <div className="flex flex-wrap items-center justify-between gap-2 border border-border/80 bg-muted/30 p-2.5 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <Key className="size-3.5 text-primary" />
            <span>
              {settings.customApiKey?.trim()
                ? text.customOwmKeyActive
                : text.sharedServerKey}
            </span>
          </div>
          <Badge variant="outline" className="font-mono text-tiny">
            {text.configuredInApiTab}
          </Badge>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-heading text-xs font-semibold text-foreground">
            <Cpu className="size-4 text-primary" />
            <span id={nwpLabelId}>{text.nwpTitle}</span>
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            {text.nwpDesc}
          </CardDescription>
          <CardAction>
            <Badge
              variant="primary-outline"
              className="font-mono text-xs uppercase"
            >
              {activeForecastModel.name}
            </Badge>
          </CardAction>
        </CardHeader>
        <CardContent className="space-y-3">
          {settings.weatherSource === "openweathermap" && (
            <Alert variant="warning" className="py-2 text-xs">
              <AlertTitle className="text-xs font-semibold">
                {text.stationNoticeTitle}
              </AlertTitle>
              <AlertDescription className="mt-0.5 text-xs">
                {text.stationNoticeDesc}
              </AlertDescription>
            </Alert>
          )}

          <Select
            value={settings.forecastStation}
            onValueChange={(val) => {
              if (val)
                onUpdateSettings({
                  forecastStation: val as ForecastStationModel,
                })
            }}
          >
            <SelectTrigger
              aria-labelledby={nwpLabelId}
              className="w-full justify-between font-mono text-xs"
            >
              <SelectValue placeholder={text.selectNwpPlaceholder} />
            </SelectTrigger>
            <SelectContent className="max-h-80">
              {FORECAST_STATION_MODELS.map((model) => (
                <SelectItem
                  key={model.id}
                  value={model.id}
                  textValue={`${model.name} (${model.resolution})`}
                >
                  <div className="space-x-2 text-left">
                    <span className="font-heading text-xs font-semibold text-foreground">
                      {model.name}
                    </span>
                    <Badge variant="outline" className="font-mono text-xs">
                      {model.coverage}
                    </Badge>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>
    </div>
  )
}
