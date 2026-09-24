"use client"

import * as React from "react"
import { format } from "date-fns"
import { Languages, Clock, Calendar, Compass } from "lucide-react"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardAction,
} from "@/components/ui/card"
import { Alert } from "@/components/ui/alert"
import { Dot } from "@/components/ui/dot"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxTrigger,
  ComboboxValue,
} from "@/components/ui/combobox"
import { useTranslation } from "@/components/language-provider"
import { resolveUiLanguage } from "@/lib/translations"
import { formatCoords } from "@/lib/format"
import {
  type RegionalLanguageOption,
  getGoogleLanguage,
} from "@/lib/google-languages"
import { TimeFormat } from "@/lib/weather"
import {
  DATE_FORMAT_OPTIONS,
  COORDINATE_FORMAT_OPTIONS,
} from "../../constants"
import type {
  TabBaseProps,
  DateFormatOption,
  CoordinateFormatOption,
} from "../../types"
import { useLiveTime, useRegionalSettings } from "../../hooks"

const SAMPLE_COORDS = { lat: 51.5074, lon: -0.1278 }

export function RegionalTabContent({ settings, onUpdateSettings, coords }: TabBaseProps) {
  const { t } = useTranslation()
  const regional = t.settingsDialog.regional
  // null until mounted, so server and client render the same placeholder
  const currentTime = useLiveTime()
  const currentLang = getGoogleLanguage(settings.language)
  const isUiTranslated = resolveUiLanguage(settings.language) !== null

  const liveClock = currentTime
    ? format(currentTime, settings.timeFormat === "24h" ? "HH:mm:ss" : "hh:mm:ss a")
    : "--:--:--"

  const activeDateFormat =
    DATE_FORMAT_OPTIONS.find((opt) => opt.id === settings.dateFormat) ||
    DATE_FORMAT_OPTIONS[0]
  const liveDate = currentTime
    ? format(currentTime, activeDateFormat.dateFnsPattern)
    : activeDateFormat.format

  const coordinateFormat = settings.coordinateFormat || COORDINATE_FORMAT_OPTIONS[0].id
  const sampleCoords = coords ?? SAMPLE_COORDS
  const coordinateSample = formatCoords(sampleCoords.lat, sampleCoords.lon, coordinateFormat)

  const { availableLanguages, handleSelectLanguage } = useRegionalSettings({
    onUpdateSettings,
  })

  return (
    <div className="space-y-4">
      <Alert variant="default" className="flex items-center gap-3">
        <Dot variant="success" size="lg" pulse />
        <div>
          <div className="flex items-center gap-1.5">
            <span className="font-heading text-xs font-semibold tracking-tight text-foreground uppercase">
              {regional.headerTitle}
            </span>
          </div>
          <div className="text-tiny text-muted-foreground">
            {regional.headerSubtitle}
          </div>
        </div>
      </Alert>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {/* 1. Language & Regional Dialect */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-heading text-xs font-semibold text-foreground">
              <Languages className="size-4 text-primary" />
              <span>{regional.langTitle}</span>
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              {regional.langDesc}
            </CardDescription>
            <CardAction>
              <Badge
                variant="primary-outline"
                className="font-mono text-xs uppercase"
              >
                {settings.language.toUpperCase()}
              </Badge>
            </CardAction>
          </CardHeader>
          <CardContent className="space-y-2">
            <Combobox
              items={availableLanguages}
              value={currentLang}
              onValueChange={(lang: RegionalLanguageOption | null) => {
                if (lang) handleSelectLanguage(lang.code)
              }}
              isItemEqualToValue={(
                a: RegionalLanguageOption | null,
                b: RegionalLanguageOption | null
              ) => a?.code === b?.code}
              itemToStringValue={(lang: RegionalLanguageOption) => lang?.code ?? ""}
              itemToStringLabel={(lang: RegionalLanguageOption) =>
                lang
                  ? `${lang.label} ${lang.englishName} ${lang.code} ${lang.region}`
                  : ""
              }
            >
              <ComboboxTrigger
                aria-label={regional.langTitle}
                render={
                  <Button
                    variant="outline"
                    className="w-full justify-between font-mono text-xs"
                  />
                }
              >
                <ComboboxValue>
                  {(lang: RegionalLanguageOption) =>
                    lang ? (
                      <span className="flex min-w-0 flex-1 items-center gap-2 text-left font-mono truncate">
                        <span>{lang.flag}</span>
                        <span className="font-semibold text-foreground truncate">
                          {lang.label}
                        </span>
                        <span className="text-tiny text-muted-foreground truncate">
                          ({lang.englishName} • {lang.region})
                        </span>
                      </span>
                    ) : (
                      <span className="text-muted-foreground">
                        {regional.selectLanguagePlaceholder}
                      </span>
                    )
                  }
                </ComboboxValue>
              </ComboboxTrigger>
              <ComboboxContent className="min-w-(--anchor-width) max-w-[var(--available-width)]">
                <ComboboxInput
                  showTrigger={false}
                  showSearchIcon
                  autoFocus
                  placeholder={regional.searchLanguagePlaceholder}
                />
                <ComboboxEmpty>{regional.noLanguageFound}</ComboboxEmpty>
                <ComboboxList className="mt-1">
                  {(lang: RegionalLanguageOption) => (
                    <ComboboxItem key={lang.code} value={lang}>
                      <span className="flex items-center gap-2 font-mono">
                        <span>{lang.flag}</span>
                        <span className="font-semibold text-foreground">
                          {lang.label}
                        </span>
                        <span className="text-tiny text-muted-foreground">
                          ({lang.englishName} • {lang.region})
                        </span>
                        {resolveUiLanguage(lang.code) === null && (
                          <span className="ml-auto text-nano text-muted-foreground uppercase">
                            {regional.voiceOnly}
                          </span>
                        )}
                      </span>
                    </ComboboxItem>
                  )}
                </ComboboxList>
              </ComboboxContent>
            </Combobox>
            <div className="flex items-center justify-between gap-2">
              {!isUiTranslated ? (
                <span className="text-tiny text-muted-foreground">
                  {regional.uiFallbackNotice(currentLang.englishName)}
                </span>
              ) : (
                <span />
              )}
              <Badge
                variant="secondary"
                className="w-fit truncate font-mono text-tiny font-normal text-muted-foreground"
              >
                <strong className="font-semibold text-foreground">
                  {currentLang.weatherConditionSample}
                </strong>
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* 2. Time Representation & Chronometry */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-heading text-xs font-semibold text-foreground">
              <Clock className="size-4 text-primary" />
              <span>{regional.timeTitle}</span>
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              {regional.timeDesc}
            </CardDescription>
            <CardAction>
              <Badge
                variant="primary-outline"
                className="font-mono text-xs uppercase"
              >
                {settings.timeFormat.toUpperCase()}
              </Badge>
            </CardAction>
          </CardHeader>
          <CardContent className="space-y-2">
            <Select
              value={settings.timeFormat}
              onValueChange={(val) => {
                if (val) onUpdateSettings({ timeFormat: val as TimeFormat })
              }}
            >
              <SelectTrigger aria-label={regional.timeTitle} className="w-full justify-between border-border bg-background/60 font-mono text-xs">
                <SelectValue placeholder={regional.timeTitle} />
              </SelectTrigger>
              <SelectContent position="popper">
                <SelectItem value="24h">
                  <span className="flex items-center gap-2 font-mono">
                    <span className="font-semibold text-foreground">
                      {regional.time24Label}
                    </span>
                  </span>
                </SelectItem>
                <SelectItem value="12h">
                  <span className="flex items-center gap-2 font-mono">
                    <span className="font-semibold text-foreground">
                      {regional.time12Label}
                    </span>
                  </span>
                </SelectItem>
              </SelectContent>
            </Select>
            <div className="flex justify-end">
              <Badge
                variant="secondary"
                className="w-fit truncate font-mono text-tiny font-normal text-muted-foreground"
              >
                <span>
                  {regional.clock}:{" "}
                  <strong className="font-bold tracking-wider text-foreground" suppressHydrationWarning>
                    {liveClock}
                  </strong>
                </span>
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* 3. Date Display Standard */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-heading text-xs font-semibold text-foreground">
              <Calendar className="size-4 text-primary" />
              <span>{regional.dateTitle}</span>
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              {regional.dateDesc}
            </CardDescription>
            <CardAction>
              <Badge
                variant="primary-outline"
                className="font-mono text-xs uppercase"
              >
                {settings.dateFormat?.toUpperCase()}
              </Badge>
            </CardAction>
          </CardHeader>
          <CardContent className="space-y-2">
            <Select
              value={settings.dateFormat}
              onValueChange={(val) => {
                if (val)
                  onUpdateSettings({
                    dateFormat: val as DateFormatOption,
                  })
              }}
            >
              <SelectTrigger aria-label={regional.dateTitle} className="w-full justify-between border-border bg-background/60 font-mono text-xs">
                <SelectValue placeholder={regional.dateTitle} />
              </SelectTrigger>
              <SelectContent position="popper">
                {DATE_FORMAT_OPTIONS.map((opt) => (
                  <SelectItem key={opt.id} value={opt.id}>
                    <span className="flex items-center gap-2 font-mono">
                      <span className="font-semibold text-foreground">
                        {regional.dateFormats[opt.id]}
                      </span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex justify-end">
              <Badge
                variant="secondary"
                className="w-fit truncate font-mono text-tiny font-normal text-muted-foreground"
                title={`${regional.pattern}: ${activeDateFormat.format}`}
              >
                <span>
                  {activeDateFormat.format}:{" "}
                  <strong className="font-bold tracking-wider text-foreground">
                    {liveDate}
                  </strong>
                </span>
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* 4. Coordinate & Geodetic Notation */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-heading text-xs font-semibold text-foreground">
              <Compass className="size-4 text-primary" />
              <span>{regional.coordTitle}</span>
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              {regional.coordDesc}
            </CardDescription>
            <CardAction>
              <Badge
                variant="primary-outline"
                className="font-mono text-xs uppercase"
              >
                {settings.coordinateFormat === "dms" ? "DMS" : "DD"}
              </Badge>
            </CardAction>
          </CardHeader>
          <CardContent className="space-y-2">
            <Select
              value={coordinateFormat}
              onValueChange={(val) => {
                if (val)
                  onUpdateSettings({
                    coordinateFormat: val as CoordinateFormatOption,
                  })
              }}
            >
              <SelectTrigger aria-label={regional.coordTitle} className="w-full justify-between border-border bg-background/60 font-mono text-xs">
                <SelectValue placeholder={regional.coordTitle} />
              </SelectTrigger>
              <SelectContent position="popper">
                {COORDINATE_FORMAT_OPTIONS.map((opt) => (
                  <SelectItem key={opt.id} value={opt.id}>
                    <span className="flex items-center gap-2 font-mono">
                      <span className="font-semibold text-foreground">
                        {regional.coordFormats[opt.id]}
                      </span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex justify-end">
              <Badge
                variant="secondary"
                className="w-fit truncate font-mono text-tiny font-normal text-muted-foreground"
              >
                <span>
                  {regional.sample}:{" "}
                  <strong className="font-bold tracking-wider text-foreground">
                    {coordinateSample}
                  </strong>
                </span>
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
