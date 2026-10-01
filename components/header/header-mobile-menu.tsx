"use client"

import type React from "react"
import { useTheme } from "next-themes"
import { Compass, ChevronRight, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { IconTile } from "@/components/ui/icon-tile"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
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
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import { WeatherIcon } from "@/components/weather-icon"
import { useTranslation } from "@/components/language-provider"
import { THEME_OPTIONS } from "@/components/settings/constants"
import { formatTemperature, type CurrentWeather } from "@/lib/weather"

export interface HeaderMenuItem {
  id: string
  /** Section the item is listed under. */
  group: "actions" | "app"
  label: string
  description: string
  icon: React.ElementType
  onSelect: () => void
  disabled?: boolean
}

interface HeaderMobileMenuProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  items: HeaderMenuItem[]
  /** Theme is only known after hydration. */
  mounted: boolean
  /** Conditions for the "now" card at the top; omitted while loading. */
  current?: CurrentWeather
  unit: "C" | "F"
  onUnitChange?: (unit: "C" | "F") => void
}

const GROUPS = ["actions", "app"] as const

// Items slide in one after another when the drawer opens (tw-animate classes;
// CSS keeps `motion` out of the header's first-load bundle).
const ROW_IN =
  "animate-in fade-in-0 slide-in-from-right-4 duration-300 ease-out fill-mode-both motion-reduce:animate-none rtl:slide-in-from-left-4"
const ROW_STAGGER_MS = 50

/** Drawer with the current conditions, grouped header actions and quick settings, below the lg breakpoint. */
export function HeaderMobileMenu({
  open,
  onOpenChange,
  items,
  mounted,
  current,
  unit,
  onUnitChange,
}: HeaderMobileMenuProps) {
  const { t, translateCondition } = useTranslation()
  const { theme, setTheme } = useTheme()

  /** Closes the menu before running an action, so dialogs don't stack under it. */
  const runFromMenu = (action?: () => void) => () => {
    onOpenChange(false)
    action?.()
  }

  const groupLabels = {
    actions: t.header.menuQuickActions,
    app: t.header.menuStationApp,
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent side="right" className="lg:hidden">
        <DrawerHeader className="gap-3 border-b border-border pe-12">
          <DrawerTitle className="flex items-center gap-2">
            <IconTile variant="solid" size="xs">
              <Compass />
            </IconTile>
            OpenWeather
          </DrawerTitle>

          {/* Now: where you are and what it's like */}
          {current ? (
            <Item variant="muted" size="sm" className="gap-3">
              <ItemMedia>
                <WeatherIcon type={current.condition.type} size={28} />
              </ItemMedia>
              <ItemContent className="min-w-0">
                <ItemTitle className="w-full">
                  <MapPin className="size-3 shrink-0 text-primary" />
                  <span className="truncate">{current.cityName}</span>
                </ItemTitle>
                <DrawerDescription className="truncate text-xs capitalize">
                  {translateCondition(current.condition.description)} ·{" "}
                  {t.common.feelsLike}{" "}
                  {formatTemperature(current.feelsLike, unit)}°
                </DrawerDescription>
              </ItemContent>
              <ItemActions className="font-mono text-2xl font-semibold tabular-nums">
                {formatTemperature(current.temp, unit)}°{unit}
              </ItemActions>
            </Item>
          ) : (
            <DrawerDescription className="sr-only">
              {t.header.mainMenu}
            </DrawerDescription>
          )}
        </DrawerHeader>

        <nav
          aria-label={t.header.mainMenu}
          className="flex-1 space-y-4 overflow-y-auto p-3"
        >
          {GROUPS.map((group) => {
            const groupItems = items.filter((item) => item.group === group)
            if (groupItems.length === 0) return null
            return (
              <section key={group} className="space-y-1.5">
                <h3 className="px-1 font-mono text-nano font-semibold tracking-wider text-muted-foreground uppercase">
                  {groupLabels[group]}
                </h3>
                <ItemGroup className="gap-1.5">
                  {groupItems.map((item, index) => {
                    const Icon = item.icon
                    return (
                      <Item
                        key={item.id}
                        asChild
                        variant="outline"
                        size="sm"
                        className={ROW_IN}
                        style={{
                          animationDelay: `${80 + (GROUPS.indexOf(group) * 3 + index) * ROW_STAGGER_MS}ms`,
                        }}
                      >
                        <Button
                          variant="ghost"
                          disabled={item.disabled}
                          onClick={runFromMenu(item.onSelect)}
                          className="h-auto w-full flex-nowrap justify-start text-start whitespace-normal"
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
                            <ChevronRight className="size-4 text-muted-foreground rtl:rotate-180" />
                          </ItemActions>
                        </Button>
                      </Item>
                    )
                  })}
                </ItemGroup>
              </section>
            )
          })}
        </nav>

        <Separator />

        {/* Quick settings: theme and temperature unit apply immediately */}
        <DrawerFooter className="gap-3 p-3">
          <div className="space-y-1.5">
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
          </div>

          {onUnitChange && (
            <div className="flex items-center justify-between gap-3">
              <ItemTitle className="font-mono text-tiny text-muted-foreground uppercase">
                {t.settingsDialog.units.tempTitle}
              </ItemTitle>
              <ToggleGroup
                type="single"
                variant="outline"
                spacing={1}
                value={unit}
                onValueChange={(value) => {
                  if (value) onUnitChange(value as "C" | "F")
                }}
                aria-label={t.settingsDialog.units.tempTitle}
              >
                <ToggleGroupItem value="C" className="px-3 font-mono">
                  °C
                </ToggleGroupItem>
                <ToggleGroupItem value="F" className="px-3 font-mono">
                  °F
                </ToggleGroupItem>
              </ToggleGroup>
            </div>
          )}
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
