"use client"

import type React from "react"
import { Fragment, useState } from "react"
import { useTheme } from "next-themes"
import { Compass, ChevronRight, Search, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { IconTile } from "@/components/ui/icon-tile"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemSeparator,
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
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group"
import { useTranslation } from "@/components/language-provider"
import { THEME_OPTIONS } from "@/components/settings/constants"
import {
  SettingsSearchResults,
  searchSettings,
  type SettingsSearchEntry,
} from "@/components/settings/components/widgets/settings-search"

export interface HeaderMenuItem {
  id: string
  /** Section the item is listed under; "search" items only show up in search results. */
  group: "actions" | "app" | "search"
  label: string
  description?: string
  /** Extra search terms not visible in the label. */
  keywords?: string
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
  unit: "C" | "F"
  onUnitChange?: (unit: "C" | "F") => void
}

// Items slide in one after another when the drawer opens (tw-animate classes;
// CSS keeps `motion` out of the header's first-load bundle).
const ROW_IN =
  "animate-in fade-in-0 slide-in-from-right-4 duration-300 ease-out fill-mode-both motion-reduce:animate-none rtl:slide-in-from-left-4"
const ROW_STAGGER_MS = 50
const SECTION_LABEL =
  "px-1 font-mono text-nano font-semibold tracking-wider text-muted-foreground uppercase"
// Tactile press; only transform and colors transition, never all properties.
const PRESS =
  "transition-[transform,background-color,color] duration-150 ease-out active:scale-[0.96] motion-reduce:active:scale-100"

/** Drawer with a feature/settings search, grouped header actions and quick settings, below the lg breakpoint. */
export function HeaderMobileMenu({
  open,
  onOpenChange,
  items,
  mounted,
  unit,
  onUnitChange,
}: HeaderMobileMenuProps) {
  const { t } = useTranslation()
  const { theme, setTheme } = useTheme()
  const [query, setQuery] = useState("")

  // Clear the search whenever the drawer closes.
  if (!open && query) setQuery("")

  /** Closes the menu before running an action, so dialogs don't stack under it. */
  const runFromMenu = (action?: () => void) => () => {
    onOpenChange(false)
    action?.()
  }

  const actionItems = items.filter((item) => item.group === "actions")
  const appItems = items.filter((item) => item.group === "app")
  const stagger = (i: number) => ({
    animationDelay: `${80 + i * ROW_STAGGER_MS}ms`,
  })

  const groupLabels = {
    actions: t.header.menuQuickActions,
    app: t.header.menuStationApp,
  }

  // Search reuses the settings search (ranking, accent folding, result list);
  // `tab` carries the menu item id back to `selectResult`.
  const isSearching = query.trim().length > 0
  const results = searchSettings(
    items
      .filter((item) => !item.disabled)
      .map((item) => ({
        tab: item.id,
        title: item.label,
        tabLabel: item.description ?? "",
        icon: item.icon,
        keywords: item.keywords,
      })),
    query
  )
  const selectResult = (result: SettingsSearchEntry) =>
    runFromMenu(items.find((item) => item.id === result.tab)?.onSelect)()

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent
        side="right"
        className="lg:hidden"
        // Focus the panel, not the search field: no on-screen keyboard on open.
        onOpenAutoFocus={(e) => {
          e.preventDefault()
          ;(e.currentTarget as HTMLElement).focus()
        }}
      >
        <DrawerHeader className="gap-3 border-b border-border">
          {/* Only the title row clears the close button; the search below uses the full width */}
          <DrawerTitle className="flex items-center gap-2 pe-10">
            <IconTile variant="solid" size="xs">
              <Compass />
            </IconTile>
            OpenWeather
          </DrawerTitle>

          <DrawerDescription className="sr-only">
            {t.header.mainMenu}
          </DrawerDescription>

          {/* Search: jump straight to a feature or a settings page */}
          <form
            role="search"
            onSubmit={(e) => {
              e.preventDefault()
              if (results[0]) selectResult(results[0])
            }}
          >
            <InputGroup>
              <InputGroupAddon>
                <Search />
              </InputGroupAddon>
              <InputGroupInput
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t.header.menuSearch}
                aria-label={t.header.menuSearch}
                autoComplete="off"
                enterKeyHint="go"
                className="text-xs"
              />
              {query && (
                <InputGroupAddon align="inline-end">
                  <InputGroupButton
                    size="icon-xs"
                    variant="warning"
                    onClick={() => setQuery("")}
                    aria-label={t.common.clear}
                  >
                    <X />
                  </InputGroupButton>
                </InputGroupAddon>
              )}
            </InputGroup>
          </form>
        </DrawerHeader>

        <nav
          aria-label={t.header.mainMenu}
          className="flex-1 space-y-5 overflow-y-auto p-3"
        >
          {isSearching && (
            <SettingsSearchResults
              results={results}
              label={t.settingsDialog.nav.searchResults}
              emptyLabel={t.header.menuNoResults}
              onSelect={selectResult}
            />
          )}

          {/* Quick actions: large tiles, the things you tap most */}
          {!isSearching && actionItems.length > 0 && (
            <section className="space-y-2">
              <h3 className={SECTION_LABEL}>{groupLabels.actions}</h3>
              <div className="grid grid-cols-2 gap-2">
                {actionItems.map((item, index) => {
                  const Icon = item.icon
                  return (
                    <Button
                      key={item.id}
                      variant="secondary"
                      disabled={item.disabled}
                      onClick={runFromMenu(item.onSelect)}
                      style={stagger(index)}
                      className={`h-auto flex-col items-start justify-start gap-2 p-3 text-start whitespace-normal ${PRESS} ${ROW_IN}`}
                    >
                      <IconTile variant="soft" size="sm">
                        <Icon />
                      </IconTile>
                      <span className="flex flex-col gap-0.5">
                        <span className="text-xs font-semibold text-balance">
                          {item.label}
                        </span>
                        <span className="line-clamp-2 text-tiny font-normal text-pretty text-muted-foreground">
                          {item.description}
                        </span>
                      </span>
                    </Button>
                  )
                })}
              </div>
            </section>
          )}

          {/* Station & app: a quiet list with dividers instead of boxed rows */}
          {!isSearching && appItems.length > 0 && (
            <section className="space-y-2">
              <h3 className={SECTION_LABEL}>{groupLabels.app}</h3>
              <ItemGroup className="gap-0 overflow-hidden bg-muted/30">
                {appItems.map((item, index) => {
                  const Icon = item.icon
                  return (
                    <Fragment key={item.id}>
                      {index > 0 && <ItemSeparator className="my-0" />}
                      <Item
                        asChild
                        className={ROW_IN}
                        style={stagger(actionItems.length + index)}
                      >
                        {/* h-auto: Button's fixed h-8 would clip the two-line row */}
                        <Button
                          variant="ghost"
                          disabled={item.disabled}
                          onClick={runFromMenu(item.onSelect)}
                          className={`h-auto w-full flex-nowrap justify-start text-start whitespace-normal ${PRESS}`}
                        >
                          <ItemMedia>
                            <Icon className="size-4 text-primary" />
                          </ItemMedia>
                          <ItemContent className="min-w-0">
                            <ItemTitle>{item.label}</ItemTitle>
                            <ItemDescription className="line-clamp-2 text-pretty">
                              {item.description}
                            </ItemDescription>
                          </ItemContent>
                          <ItemActions>
                            <ChevronRight className="size-4 text-muted-foreground rtl:rotate-180" />
                          </ItemActions>
                        </Button>
                      </Item>
                    </Fragment>
                  )
                })}
              </ItemGroup>
            </section>
          )}
        </nav>

        {/* Quick settings: full-width segmented controls that apply immediately */}
        <DrawerFooter className="grid grid-cols-[3fr_2fr] gap-3 p-3">
          <div className="flex min-w-0 flex-col gap-1.5">
            <span className={SECTION_LABEL}>{t.settingsDialog.tabTheme}</span>
            <ToggleGroup
              type="single"
              variant="outline"
              spacing={0}
              value={mounted ? theme : undefined}
              onValueChange={(value) => {
                if (value) setTheme(value)
              }}
              disabled={!mounted}
              aria-label={t.settingsDialog.tabTheme}
              className="w-full"
            >
              {THEME_OPTIONS.map((option) => {
                const Icon = option.icon
                const label = t.settingsDialog.theme[`${option.id}Title`]
                return (
                  <Tooltip key={option.id}>
                    <TooltipTrigger asChild>
                      <ToggleGroupItem
                        value={option.id}
                        aria-label={label}
                        className="flex-1 px-0"
                      >
                        <Icon className="size-4" />
                      </ToggleGroupItem>
                    </TooltipTrigger>
                    <TooltipContent>{label}</TooltipContent>
                  </Tooltip>
                )
              })}
            </ToggleGroup>
          </div>

          {onUnitChange && (
            <div className="flex min-w-0 flex-col gap-1.5">
              <span className={SECTION_LABEL}>{t.settingsDialog.tabUnits}</span>
              <ToggleGroup
                type="single"
                variant="outline"
                spacing={0}
                value={unit}
                onValueChange={(value) => {
                  if (value) onUnitChange(value as "C" | "F")
                }}
                aria-label={t.settingsDialog.units.tempTitle}
                className="w-full"
              >
                {(["C", "F"] as const).map((u) => (
                  <ToggleGroupItem
                    key={u}
                    value={u}
                    className="flex-1 px-0 font-mono tabular-nums"
                  >
                    °{u}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            </div>
          )}
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
