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
import { getAvailableGoogleVoices } from "@/lib/google-tts"
import {
  type RegionalLanguageOption,
  getGoogleLanguage,
  fetchLiveGoogleLanguages,
} from "@/lib/google-languages"
import { TimeFormat } from "@/lib/weather"
import {
  REGIONAL_LANGUAGES,
  DATE_FORMAT_OPTIONS,
  COORDINATE_FORMAT_OPTIONS,
} from "./constants"
import {
  TabBaseProps,
  DateFormatOption,
  CoordinateFormatOption,
} from "./types"
import { useLiveTime } from "./shared-widgets"

export function RegionalTabContent({ settings, onUpdateSettings }: TabBaseProps) {
  const { t } = useTranslation()
  const currentTime = useLiveTime()
  const now = currentTime || new Date()
  const currentLang = getGoogleLanguage(settings.language)

  const liveTime24 = format(now, "HH:mm:ss")
  const liveTime12 = format(now, "hh:mm:ss a")

  const activeDateFormat =
    DATE_FORMAT_OPTIONS.find((opt) => opt.id === settings.dateFormat) ||
    DATE_FORMAT_OPTIONS[0]

  const [availableLanguages, setAvailableLanguages] =
    React.useState<RegionalLanguageOption[]>(REGIONAL_LANGUAGES)

  React.useEffect(() => {
    let isMounted = true
    fetchLiveGoogleLanguages(settings.googleApiKey).then((list: RegionalLanguageOption[]) => {
      if (isMounted && list && list.length > 0) {
        setAvailableLanguages(list)
      }
    })
    return () => {
      isMounted = false
    }
  }, [settings.googleApiKey])

  const handleSelectLanguage = (val: string) => {
    if (!val) return
    const availableVoices = getAvailableGoogleVoices(val)
    const defaultVoice = availableVoices[0]
    onUpdateSettings({
      language: val,
      ...(defaultVoice
        ? {
            googleTtsVoice: defaultVoice.id,
            googleTtsModel: defaultVoice.model,
          }
        : {}),
    })
  }

  return (
    <div className="space-y-4">
      <Alert variant="default" className="flex items-center gap-3">
        <Dot variant="success" size="lg" pulse />
        <div>
          <div className="flex items-center gap-1.5">
            <span className="font-heading text-xs font-semibold tracking-tight text-foreground uppercase">
              {t.settingsDialog.regional.headerTitle}
            </span>
          </div>
          <div className="text-tiny text-muted-foreground">
            {t.settingsDialog.regional.headerSubtitle}
          </div>
        </div>
      </Alert>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {/* 1. Language & Regional Dialect */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-heading text-xs font-semibold text-foreground">
              <Languages className="size-4 text-primary" />
              <span>{t.settingsDialog.regional.langTitle}</span>
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              {t.settingsDialog.regional.langDesc}
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
              itemToStringValue={(lang: RegionalLanguageOption) =>
                `${lang.label} ${lang.englishName} ${lang.code} ${lang.region}`
              }
            >
              <ComboboxTrigger
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
                      <span className="flex items-center gap-2 font-mono truncate">
                        <span>{lang.flag}</span>
                        <span className="font-semibold text-foreground">
                          {lang.label}
                        </span>
                        <span className="text-tiny text-muted-foreground">
                          ({lang.englishName} • {lang.region})
                        </span>
                      </span>
                    ) : (
                      <span className="text-muted-foreground">
                        {t.settingsDialog.regional.selectLanguagePlaceholder ||
                          "Select Language"}
                      </span>
                    )
                  }
                </ComboboxValue>
              </ComboboxTrigger>
              <ComboboxContent className="max-w-(--anchor-width) min-w-(--anchor-width)">
                <ComboboxInput
                  showTrigger={false}
                  placeholder={
                    t.settingsDialog.regional.selectLanguagePlaceholder ||
                    "Search language..."
                  }
                />
                <ComboboxEmpty>No language found.</ComboboxEmpty>
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
                      </span>
                    </ComboboxItem>
                  )}
                </ComboboxList>
              </ComboboxContent>
            </Combobox>
            <div className="flex justify-end">
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
              <span>{t.settingsDialog.regional.timeTitle}</span>
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              {t.settingsDialog.regional.timeDesc}
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
              <SelectTrigger className="w-full justify-between border-border bg-background/60 font-mono text-xs">
                <SelectValue placeholder="Select Time Format" />
              </SelectTrigger>
              <SelectContent position="popper">
                <SelectItem value="24h">
                  <span className="flex items-center gap-2 font-mono">
                    <span className="font-semibold text-foreground">
                      {t.settingsDialog.regional.time24Label}
                    </span>
                  </span>
                </SelectItem>
                <SelectItem value="12h">
                  <span className="flex items-center gap-2 font-mono">
                    <span className="font-semibold text-foreground">
                      {t.settingsDialog.regional.time12Label}
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
                  {t.settingsDialog.regional.clock || "Clock"}:{" "}
                  <strong className="font-bold tracking-wider text-foreground">
                    {settings.timeFormat === "24h" ? liveTime24 : liveTime12}
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
              <span>{t.settingsDialog.regional.dateTitle}</span>
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              {t.settingsDialog.regional.dateDesc}
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
              <SelectTrigger className="w-full justify-between border-border bg-background/60 font-mono text-xs">
                <SelectValue placeholder="Select Date Format" />
              </SelectTrigger>
              <SelectContent position="popper">
                {DATE_FORMAT_OPTIONS.map((opt) => (
                  <SelectItem key={opt.id} value={opt.id}>
                    <span className="flex items-center gap-2 font-mono">
                      <span className="font-semibold text-foreground">
                        {opt.label}
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
                  Pattern:{" "}
                  <strong className="font-bold tracking-wider text-foreground">
                    {activeDateFormat.format}
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
              <span>{t.settingsDialog.regional.coordTitle}</span>
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              {t.settingsDialog.regional.coordDesc}
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
              value={settings.coordinateFormat || "decimal"}
              onValueChange={(val) => {
                if (val)
                  onUpdateSettings({
                    coordinateFormat: val as CoordinateFormatOption,
                  })
              }}
            >
              <SelectTrigger className="w-full justify-between border-border bg-background/60 font-mono text-xs">
                <SelectValue placeholder="Select Coordinate Format" />
              </SelectTrigger>
              <SelectContent position="popper">
                {COORDINATE_FORMAT_OPTIONS.map((opt) => (
                  <SelectItem key={opt.id} value={opt.id}>
                    <span className="flex items-center gap-2 font-mono">
                      <span className="font-semibold text-foreground">
                        {opt.label}
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
                  Sample:{" "}
                  <strong className="font-bold tracking-wider text-foreground">
                    {COORDINATE_FORMAT_OPTIONS.find(
                      (opt) =>
                        opt.id ===
                        (settings.coordinateFormat ||
                          COORDINATE_FORMAT_OPTIONS[0].id)
                    )?.example || COORDINATE_FORMAT_OPTIONS[0].example}
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
